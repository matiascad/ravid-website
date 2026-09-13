// ─────────────────────────────────────────────────────────────────────────────
// W9-C LEAD ENDPOINT TESTS — app/api/lead/__tests__/route.test.ts
//
// The gate: "PROVE THE CHECK CAN FAIL", applied to the one claim this endpoint
// now makes — I STORED YOUR ENQUIRY. A suite that posts a good lead to a working
// sink proves nothing about the defect the route replaces, which is a success
// status handed out when nothing was written.
//
// INVARIANT     No test in this file asserts that a function was CALLED. Every
//               storage test asserts what the fake sink actually HOLDS: the size
//               of its record map, the id under which a record is filed, and the
//               `deliveryState` on the record that is there at the end. A route
//               that answers 201 while `sink.records.size === 0` fails here, and
//               so does one that answers 201 with an id no record is filed under.
//               The two boundaries are faked, never the route's own logic: a
//               `LeadSink` implementation replaces `resolveLeadSink`, a `vi.fn`
//               replaces `globalThis.fetch`, and the pure `renderAutoresponse` is
//               replaced by a function a test controls. Everything between them —
//               ordering, guards, status selection — is the real module. The
//               sink stand-in applies the REAL `asTotalLeadSink`, because the
//               resolver's guarantee is part of what it is standing in for, and
//               a stand-in that skipped it would hand the route a sink the
//               deployed resolver cannot produce.
//
// IMPOSSIBLE    A real network call is not CONSTRUCTIBLE from this file. The only
//               path out of the route is `globalThis.fetch`; it is stubbed before
//               every test with a function that THROWS, so a test that forgets to
//               arrange a provider outcome fails loudly rather than reaching the
//               internet. No credential exists in this repo to authenticate with,
//               and no address belonging to a real person appears here: the
//               placeholders are not addresses at all, and the one address
//               literal is under the RFC 2606 `.invalid` TLD, which cannot
//               resolve. Cross-test contamination through the route's two
//               module-level maps (rate limit, idempotency) is also out of reach:
//               every request built here carries a UNIQUE client label and a
//               UNIQUE idempotency key unless a test deliberately pins them, so
//               no test can pass by inheriting another test's state.
//
// CLASS         Closed by enumeration over the INPUT CLASSES of this route —
//               the status-code table in the W9-C report. Every terminal
//               expression in route.ts (201-with-id, 201-decoy, 400 x2, 413 x2,
//               422, 429, 500, 503 x2, 405) has at least one test, and each store
//               failure kind is checked for "never 2xx" rather than only for its
//               own code. NOT closed over lib/validation.ts's field matrix, nor
//               over the real sink adapters — see the limit.
//
// HONEST LIMIT  These tests call the exported handlers DIRECTLY with a fake sink.
//               They cannot prove Next.js routes `/api/lead` to this file, that
//               the client's `fetch` reaches it, that the deployed environment
//               carries the three mail variables, or that any REAL sink adapter
//               writes bytes that survive — a fake sink that returns
//               `{ stored: true }` is a promise, and the durability behind it is
//               the adapter's own test's problem. The rate-limit and idempotency
//               windows are proved by COUNT, not by CLOCK: nothing here advances
//               time, so "the entry expires after ten minutes" is asserted by
//               nobody. And the guards' per-instance nature is by definition
//               invisible to a single-process test: this file proves one counter
//               works, never that one counter is enough.
// ─────────────────────────────────────────────────────────────────────────────

import { LEAD_TO_EMAIL_ENV_VAR } from '@/config/site';
/** The renderer's own return type, imported rather than restated. */
import type { Autoresponse } from '@/lib/leads/autoresponse';
import type { LeadSink, LeadSinkFailure, LeadStoreResult } from '@/lib/leads/port';
import type { LeadRecord } from '@/lib/leads/types';

/* ── The two faked boundaries ─────────────────────────────────────────────── */

/**
 * Hoisted above the mock factories below, which vitest lifts above the imports.
 * `sink: null` is the unarranged state and throws, so a test cannot reach the
 * route without saying what its store does.
 */
const harness = vi.hoisted(() => {
  const state: {
    sink: LeadSink | null;
    autoresponse: (record: LeadRecord) => Autoresponse | null;
  } = {
    sink: null,
    autoresponse: () => null,
  };
  return state;
});

/**
 * The harness stands in for `resolveLeadSink`, so it must stand in for what
 * `resolveLeadSink` GUARANTEES — a sink whose `store()` resolves for every
 * outcome, adapter bugs included. The real `asTotalLeadSink` is applied here,
 * not re-implemented: a stand-in that hands the route a sink the real resolver
 * could never return would prove the route against a wiring that does not
 * exist. Every test in this file therefore reaches the route through the same
 * composition production uses, and `{ kind: 'throw' }` below exercises the one
 * arm that composition adds.
 */
vi.mock('@/lib/leads/sinks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/leads/sinks')>();
  return {
    resolveLeadSink: (): LeadSink => {
      const sink = harness.sink;
      if (sink === null) throw new Error('a test reached the sink without arranging one');
      return actual.asTotalLeadSink(sink);
    },
  };
});

vi.mock('@/lib/leads/autoresponse', () => ({
  renderAutoresponse: (record: LeadRecord): Autoresponse | null => harness.autoresponse(record),
}));

import { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT } from '../route';

/* ── The environment contract, pinned by name ─────────────────────────────── */

const API_KEY_ENV_VAR = 'RESEND_API_KEY';
const FROM_ENV_VAR = 'LEAD_FROM_EMAIL';

/** Deliberately not addresses. The route passes these through uninterpreted. */
const TEST_API_KEY = 'test-key-not-a-credential';
const TEST_TO = 'to-address-placeholder';
const TEST_FROM = 'from-address-placeholder';

/** The cross-delegate contract this route publishes for the form. */
const HONEYPOT_FIELD = 'hp_ref';

/** Mirrors `MAX_BODY_CHARS` in route.ts. */
const MAX_BODY_CHARS = 16 * 1024;

/* ── The fake sink: a store whose CONTENTS are the assertion ──────────────── */

type SinkBehaviour =
  | { readonly kind: 'store' }
  | { readonly kind: 'fail'; readonly failure: LeadSinkFailure }
  | { readonly kind: 'throw' };

type FakeSink = {
  readonly sink: LeadSink;
  /** Every record handed to `store`, in order — including delivery-state writes. */
  readonly calls: LeadRecord[];
  /** What the store HOLDS, keyed by id. An upsert, like a real keyed sink. */
  readonly records: Map<string, LeadRecord>;
};

function createFakeSink(behaviour: SinkBehaviour = { kind: 'store' }): FakeSink {
  const calls: LeadRecord[] = [];
  const records = new Map<string, LeadRecord>();

  const sink: LeadSink = {
    name: 'fake-sink',
    store(record: LeadRecord): Promise<LeadStoreResult> {
      calls.push(record);
      if (behaviour.kind === 'throw') {
        return Promise.reject(new Error('adapter bug'));
      }
      if (behaviour.kind === 'fail') {
        return Promise.resolve({ stored: false, failure: behaviour.failure });
      }
      records.set(record.id, record);
      return Promise.resolve({ stored: true, id: record.id });
    },
  };

  return { sink, calls, records };
}

/** The single record a test expects to be holding. Throws rather than returns. */
function onlyRecord(store: FakeSink): LeadRecord {
  const values = [...store.records.values()];
  const first = values[0];
  if (values.length !== 1 || first === undefined) {
    throw new Error(`expected exactly one stored record, found ${values.length}`);
  }
  return first;
}

function recordUnder(store: FakeSink, id: unknown): LeadRecord {
  if (typeof id !== 'string') throw new Error('the response carried no string id');
  const found = store.records.get(id);
  if (found === undefined) throw new Error(`no record is filed under the returned id ${id}`);
  return found;
}

/* ── The transport seam ───────────────────────────────────────────────────── */

const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

let arranged: FakeSink;

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(() => {
    throw new Error('NETWORK_FORBIDDEN: a test reached the transport without arranging it');
  });
  vi.stubGlobal('fetch', fetchMock);

  // Unconfigured mail is the DEFAULT state, exactly as tonight's deployment is.
  vi.stubEnv(API_KEY_ENV_VAR, '');
  vi.stubEnv(LEAD_TO_EMAIL_ENV_VAR, '');
  vi.stubEnv(FROM_ENV_VAR, '');

  arranged = createFakeSink();
  harness.sink = arranged.sink;
  harness.autoresponse = () => null;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  harness.sink = null;
});

function useSink(behaviour: SinkBehaviour): FakeSink {
  const store = createFakeSink(behaviour);
  harness.sink = store.sink;
  return store;
}

function configureMailer(): void {
  vi.stubEnv(API_KEY_ENV_VAR, TEST_API_KEY);
  vi.stubEnv(LEAD_TO_EMAIL_ENV_VAR, TEST_TO);
  vi.stubEnv(FROM_ENV_VAR, TEST_FROM);
}

function providerAccepts(): void {
  fetchMock.mockImplementation(() =>
    Promise.resolve(Response.json({ id: 'provider-message-id' }, { status: 200 })),
  );
}

/* ── The funnel counter, observed on the wire ─────────────────────────────── */

/** `lib/leads/log.ts` reads these; blank means "do not count", as in production. */
const COUNTER_URL_ENV_VAR = 'KV_REST_API_URL';
const COUNTER_TOKEN_ENV_VAR = 'KV_REST_API_TOKEN';

/** Not an address: the RFC 2606 `.invalid` TLD cannot resolve. */
const COUNTER_URL = 'https://funnel-counter.invalid';
const COUNTER_TOKEN = 'test-token-not-a-credential';

/**
 * Arrange a reachable funnel store and return a reader for the REST commands it
 * was sent. The counter is not mocked — this is `recordLeadOutcome`'s real
 * default transport reaching the stubbed global `fetch`, so what comes back is
 * the key an operator's dashboard would later read, byte for byte.
 */
function countsOutcomes(): () => readonly string[][] {
  vi.stubEnv(COUNTER_URL_ENV_VAR, COUNTER_URL);
  vi.stubEnv(COUNTER_TOKEN_ENV_VAR, COUNTER_TOKEN);
  fetchMock.mockImplementation(() => Promise.resolve(Response.json({ result: 1 }, { status: 200 })));

  return (): readonly string[][] =>
    fetchMock.mock.calls.map((call): string[] => {
      const init = call[1];
      if (init === undefined || typeof init.body !== 'string') {
        throw new Error('the funnel store was called without a string body');
      }
      const parsed: unknown = JSON.parse(init.body);
      if (Array.isArray(parsed) === false) {
        throw new Error('the funnel store was not sent a command array');
      }
      return parsed.map((part: unknown): string => {
        if (typeof part !== 'string') throw new Error('a command part was not a string');
        return part;
      });
    });
}

/* ── Request builders ─────────────────────────────────────────────────────── */

const ENDPOINT = 'http://localhost/api/lead';

/**
 * Every request gets a UNIQUE client label and a UNIQUE idempotency key unless a
 * test pins them, because the route's two guards are module-level maps that
 * outlive a single test. Opaque strings, not addresses: the route treats the
 * forwarded value as a bucket key and never parses it.
 */
let requestCounter = 0;

type PostOptions = {
  /** `null` omits the header entirely — the fail-open path. */
  readonly client?: string | null;
  /** `null` omits the header — the payload-fingerprint path. */
  readonly key?: string | null;
  readonly contentLength?: string;
};

function postRaw(raw: string, options: PostOptions = {}): Request {
  requestCounter += 1;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const client = options.client === undefined ? `client-${requestCounter}` : options.client;
  if (client !== null) headers['X-Forwarded-For'] = client;

  const key = options.key === undefined ? `key-${requestCounter}` : options.key;
  if (key !== null) headers['Idempotency-Key'] = key;

  if (options.contentLength !== undefined) headers['Content-Length'] = options.contentLength;

  return new Request(ENDPOINT, { method: 'POST', headers, body: raw });
}

function postJson(value: unknown, options: PostOptions = {}): Request {
  return postRaw(JSON.stringify(value), options);
}

/** Exactly the body shape `components/sections/LeadForm.tsx` posts. */
function validLead(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: 'Dana Cohen',
    phone: '050-311-2243',
    email: 'visitor@example.invalid',
    organization: 'Northern Regional Council',
    message: 'We would like to book a talk for our staff day in March.',
    locale: 'he',
    ...overrides,
  };
}

async function bodyOf(response: Response): Promise<Record<string, unknown>> {
  const parsed: unknown = await response.json();
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('the response body was not a JSON object');
  }
  return parsed as Record<string, unknown>;
}

/** The nth outbound provider payload, or a thrown error if it never happened. */
function sentPayload(index: number): Record<string, unknown> {
  const call = fetchMock.mock.calls[index];
  if (call === undefined) throw new Error(`the mailer was never called a ${index + 1}. time`);
  const init = call[1];
  if (init === undefined || typeof init.body !== 'string') {
    throw new Error('the mailer was called without a string body');
  }
  const parsed: unknown = JSON.parse(init.body);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('the outbound body was not a JSON object');
  }
  return parsed as Record<string, unknown>;
}

/* ── 1 · Stored is the success condition ──────────────────────────────────── */

describe('POST /api/lead when the sink stores the record', () => {
  it('answers 201 with the id the sink filed the record under', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(201);
    expect(response.ok).toBe(true);

    const body = await bodyOf(response);
    expect(body.ok).toBe(true);

    // LAW 8: not "the sink was called" — the record is IN the store, under the
    // id the visitor was handed.
    expect(arranged.records.size).toBe(1);
    const stored = recordUnder(arranged, body.id);
    expect(stored.id).toBe(body.id);
    expect(stored.source).toBe('web_form');
    expect(stored.payload.name).toBe('Dana Cohen');
    expect(stored.payload.phone).toBe('050-311-2243');
    expect(stored.payload.email).toBe('visitor@example.invalid');
    expect(stored.payload.organization).toBe('Northern Regional Council');
    expect(stored.payload.locale).toBe('he');
  });

  it('records the delivery as delivered once the provider accepts', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(postJson(validLead()));
    expect(response.status).toBe(201);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const payload = sentPayload(0);
    const text = payload.text;
    if (typeof text !== 'string') throw new Error('the provider payload carried no text body');

    expect(text).toContain('Dana Cohen');
    expect(text).toContain('050-311-2243');
    expect(text).toContain('We would like to book a talk for our staff day in March.');
    expect(text).toContain(onlyRecord(arranged).id);
    expect(payload.subject).toContain('Dana Cohen');
    expect(payload.reply_to).toBe('visitor@example.invalid');
    expect(payload.to).toEqual([TEST_TO]);
    expect(payload.from).toBe(TEST_FROM);

    expect(onlyRecord(arranged).deliveryState.status).toBe('delivered');
  });

  it('stores a lead carrying only the two required fields', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(postJson({ name: 'Yossi', phone: '0501234567' }));

    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);
    // An absent email must never become an empty Reply-To.
    expect(sentPayload(0).reply_to).toBeUndefined();
  });

  it('never strips the record down: the honeypot key cannot reach the payload', async () => {
    configureMailer();
    providerAccepts();

    await POST(postJson(validLead({ [HONEYPOT_FIELD]: '' })));

    const payload: Record<string, unknown> = { ...onlyRecord(arranged).payload };
    expect(Object.keys(payload).sort()).toEqual([
      'email',
      'locale',
      'message',
      'name',
      'organization',
      'phone',
    ]);
  });
});

/* ── 2 · Notification is best-effort: it cannot take the lead back ────────── */

describe('POST /api/lead when the notification fails', () => {
  it('still answers 201 and still holds the record when the provider REJECTS', async () => {
    configureMailer();
    // The exact shape the site being replaced ignored: a RESOLVED, non-ok
    // response.
    fetchMock.mockImplementation(() =>
      Promise.resolve(Response.json({ message: 'refused' }, { status: 500 })),
    );

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(201);
    expect(response.ok).toBe(true);
    expect(arranged.records.size).toBe(1);

    const stored = onlyRecord(arranged);
    expect(stored.deliveryState.status).toBe('failed');
    if (stored.deliveryState.status !== 'failed') throw new Error('unreachable');
    expect(stored.deliveryState.kind).toBe('transient');
    expect(typeof stored.deliveryState.failedAt).toBe('string');
  });

  it('still answers 201 when the provider is unreachable', async () => {
    configureMailer();
    fetchMock.mockImplementation(() => Promise.reject(new Error('ECONNREFUSED')));

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(201);
    expect(onlyRecord(arranged).deliveryState.status).toBe('failed');
  });

  it('still answers 201 when the mail provider is not configured at all', async () => {
    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(201);
    expect(fetchMock).toHaveBeenCalledTimes(0);
    expect(arranged.records.size).toBe(1);

    const stored = onlyRecord(arranged);
    expect(stored.deliveryState.status).toBe('failed');
    if (stored.deliveryState.status !== 'failed') throw new Error('unreachable');
    expect(stored.deliveryState.kind).toBe('not_configured');

    // The names of unset variables are an operator fact, not a response body.
    const serialised = JSON.stringify(await bodyOf(response));
    expect(serialised).not.toContain(API_KEY_ENV_VAR);
    expect(serialised).not.toContain(LEAD_TO_EMAIL_ENV_VAR);
    expect(serialised).not.toContain(FROM_ENV_VAR);
  });

  it('still answers 201 when writing the delivery state back fails', async () => {
    configureMailer();
    providerAccepts();

    // Stores the first record, refuses the delivery-state update.
    const calls: LeadRecord[] = [];
    harness.sink = {
      name: 'flaky-fake',
      store(record: LeadRecord): Promise<LeadStoreResult> {
        calls.push(record);
        if (calls.length === 1) return Promise.resolve({ stored: true, id: record.id });
        return Promise.resolve({
          stored: false,
          failure: { kind: 'transient', detail: 'second write refused' },
        });
      },
    };

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(201);
    expect(calls.length).toBe(2);
  });
});

/* ── 3 · Not stored is never 2xx ──────────────────────────────────────────── */

describe('POST /api/lead when the sink cannot store the record', () => {
  const failures: ReadonlyArray<{
    readonly why: string;
    readonly failure: LeadSinkFailure;
    readonly status: number;
    readonly error: string;
  }> = [
    {
      why: 'the deployment is incomplete',
      failure: {
        kind: 'not_configured',
        missingEnvVars: ['LEAD_STORE_TOKEN', 'LEAD_STORE_URL'],
        detail: 'no store is configured',
      },
      status: 503,
      error: 'delivery_unavailable',
    },
    {
      why: 'the store is temporarily unavailable',
      failure: { kind: 'transient', detail: 'timed out' },
      status: 503,
      error: 'storage_unavailable',
    },
    {
      why: 'the store refuses this record outright',
      failure: { kind: 'permanent', detail: 'rejected' },
      status: 500,
      error: 'storage_failed',
    },
  ];

  for (const { why, failure, status, error } of failures) {
    it(`answers ${status} and holds nothing when ${why}`, async () => {
      configureMailer();
      providerAccepts();
      const store = useSink({ kind: 'fail', failure });

      const response = await POST(postJson(validLead()));

      expect(response.status).toBe(status);
      expect(response.ok).toBe(false);
      expect(response.status).toBeGreaterThanOrEqual(500);

      const body = await bodyOf(response);
      expect(body.ok).toBe(false);
      expect(body.error).toBe(error);
      expect(body.id).toBeUndefined();

      // DENOMINATOR: nothing stored, and nothing mailed either — a notification
      // about a lead nobody can find is worse than silence.
      expect(store.records.size).toBe(0);
      expect(fetchMock).toHaveBeenCalledTimes(0);
    });
  }

  it('never names an environment variable the sink reported missing', async () => {
    const store = useSink({
      kind: 'fail',
      failure: {
        kind: 'not_configured',
        missingEnvVars: ['LEAD_STORE_TOKEN'],
        detail: 'no store is configured',
      },
    });

    const response = await POST(postJson(validLead()));
    const serialised = JSON.stringify(await bodyOf(response));

    expect(serialised).not.toContain('LEAD_STORE_TOKEN');
    expect(serialised).not.toContain('no store is configured');
    expect(store.records.size).toBe(0);
  });

  // ── The adapter BUG, not the adapter's expected failure. ──────────────────
  //
  // `sink.store()` at the PERSIST line has no `try` around it, and it is correct
  // that it has none: `resolveLeadSink` returns a sink that cannot reject. These
  // two tests are what makes that sentence a measurement rather than a claim —
  // the sink arranged here rejects, the route's `await` is unguarded, and the
  // visitor still gets a typed status instead of an unhandled rejection.

  it('answers 503 storage_unavailable and holds nothing when the sink THROWS', async () => {
    configureMailer();
    const commands = countsOutcomes();
    const store = useSink({ kind: 'throw' });

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(503);
    expect(response.ok).toBe(false);
    expect(response.headers.get('Retry-After')).toBe('30');

    const body = await bodyOf(response);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('storage_unavailable');
    expect(body.id).toBeUndefined();

    // The thrown cause is an operator's fact, never the visitor's.
    expect(JSON.stringify(body)).not.toContain('adapter bug');

    // DENOMINATOR: the sink WAS reached — so this is not a test that passed by
    // never getting there — and it holds nothing afterwards.
    expect(store.calls.length).toBe(1);
    expect(store.records.size).toBe(0);

    // The mailer is configured and was NOT used: exactly one outbound call was
    // made, and it was the counter. A notification about a lead nobody can find
    // is worse than silence.
    expect(commands()).toEqual([['INCR', 'lead_funnel:lost_transient:he']]);
  });

  it('counts a thrown sink under the SAME named outcome as a returned transient failure', async () => {
    const thrownCommands = countsOutcomes();
    useSink({ kind: 'throw' });
    await POST(postJson(validLead({ locale: 'en' })));
    const thrown = thrownCommands();

    fetchMock.mockClear();
    const returnedCommands = countsOutcomes();
    useSink({ kind: 'fail', failure: { kind: 'transient', detail: 'timed out' } });
    await POST(postJson(validLead({ locale: 'en' })));

    // A throw is not a new kind of disaster and must not invent a category: it
    // is the transient loss the funnel already has a name for.
    expect(thrown).toEqual([['INCR', 'lead_funnel:lost_transient:en']]);
    expect(returnedCommands()).toEqual(thrown);
  });

  it('sends a Retry-After only for the failure that is worth retrying', async () => {
    useSink({ kind: 'fail', failure: { kind: 'transient', detail: 'timed out' } });
    const retryable = await POST(postJson(validLead()));
    expect(retryable.headers.get('Retry-After')).toBe('30');

    useSink({ kind: 'fail', failure: { kind: 'permanent', detail: 'rejected' } });
    const permanent = await POST(postJson(validLead()));
    expect(permanent.headers.get('Retry-After')).toBeNull();
  });
});

/* ── 4 · Guard: idempotency ───────────────────────────────────────────────── */

describe('POST /api/lead with a duplicate submission', () => {
  it('stores ONCE and returns the same id for a repeated Idempotency-Key', async () => {
    configureMailer();
    providerAccepts();

    // The client is PINNED as well as the key. This test is the double-click —
    // ONE visitor pressing send twice — and a visitor has one address. It used
    // to leave the address to the builder's per-request default, which meant it
    // silently also asserted that a shared key collapses ACROSS two different
    // addresses: the defect the next test now forbids. The intent (one visitor,
    // one enquiry, one id) is unchanged; the incidental second address is gone.
    const client = 'client-double-click';
    const first = await POST(postJson(validLead(), { key: 'pinned-key-alpha', client }));
    const second = await POST(postJson(validLead(), { key: 'pinned-key-alpha', client }));

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const firstBody = await bodyOf(first);
    const secondBody = await bodyOf(second);
    expect(secondBody.id).toBe(firstBody.id);

    // DENOMINATOR: one record, not "the second call returned 201".
    expect(arranged.records.size).toBe(1);
  });

  it('stores ONCE for an identical payload from one client with no key header', async () => {
    configureMailer();
    providerAccepts();

    const body = validLead({ message: 'Double click, one enquiry.' });
    await POST(postJson(body, { key: null, client: 'client-fingerprint-a' }));
    await POST(postJson(body, { key: null, client: 'client-fingerprint-a' }));

    expect(arranged.records.size).toBe(1);
  });

  it('stores TWICE when the same client sends two genuinely different enquiries', async () => {
    configureMailer();
    providerAccepts();

    await POST(
      postJson(validLead({ message: 'First enquiry.' }), {
        key: null,
        client: 'client-fingerprint-b',
      }),
    );
    await POST(
      postJson(validLead({ message: 'A second, different enquiry.' }), {
        key: null,
        client: 'client-fingerprint-b',
      }),
    );

    expect(arranged.records.size).toBe(2);
  });

  // ── The key is a NAMESPACE, and a namespace one caller can name is a
  // namespace one caller can steal. ────────────────────────────────────────
  //
  // Observed before the fix: two different people, two different addresses, two
  // different names and phones, one shared `Idempotency-Key` — and the SECOND
  // person was handed the FIRST person's id, with only the first person's record
  // in the store. Their enquiry was gone and they were told it worked.

  it('never hands one visitor another visitor id when an Idempotency-Key is shared', async () => {
    configureMailer();
    providerAccepts();

    const first = await POST(
      postJson(validLead({ name: 'Rami Peled', phone: '050-000-0001', message: 'First.' }), {
        client: 'client-shared-key-one',
        key: 'shared-key-9',
      }),
    );
    const second = await POST(
      postJson(validLead({ name: 'Dana Cohen', phone: '050-311-2243', message: 'Second.' }), {
        client: 'client-shared-key-two',
        key: 'shared-key-9',
      }),
    );

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const firstBody = await bodyOf(first);
    const secondBody = await bodyOf(second);

    // LAW 8: not "the key includes the address" — the SECOND caller must not be
    // handed the FIRST caller's id, and the store must hold BOTH enquiries,
    // each filed under the id its own sender was given.
    expect(secondBody.id).not.toBe(firstBody.id);
    expect(arranged.records.size).toBe(2);
    expect(recordUnder(arranged, firstBody.id).payload.phone).toBe('050-000-0001');
    expect(recordUnder(arranged, secondBody.id).payload.phone).toBe('050-311-2243');
  });

  it('does not merge two ADDRESS-LESS visitors who share a key', async () => {
    configureMailer();
    providerAccepts();

    // No `x-forwarded-for` at all: the rate limiter deliberately fails open here
    // and the address is `null`, so every such visitor shares one namespace. The
    // payload is in the key unconditionally, so sharing that namespace collapses
    // two enquiries only when they are BYTE-IDENTICAL — the pre-existing
    // fingerprint trade, not a way to take somebody else's id.
    const first = await POST(
      postJson(validLead({ name: 'Rami Peled', phone: '050-000-0002' }), {
        client: null,
        key: 'shared-key-anon',
      }),
    );
    const second = await POST(
      postJson(validLead({ name: 'Dana Cohen', phone: '050-311-2243' }), {
        client: null,
        key: 'shared-key-anon',
      }),
    );

    const firstBody = await bodyOf(first);
    const secondBody = await bodyOf(second);

    expect(secondBody.id).not.toBe(firstBody.id);
    expect(arranged.records.size).toBe(2);
    expect(recordUnder(arranged, secondBody.id).payload.phone).toBe('050-311-2243');
  });
});

/* ── 4b · The duplicate guard under CONCURRENCY ───────────────────────────── */

describe('POST /api/lead with duplicates that OVERLAP in time', () => {
  /**
   * One namespace for every request in a race. Both the client and the key are
   * pinned, because a race is only a race when every runner is on the same
   * track — and the client is pinned PER TEST, because the rate limiter counts
   * per address and five concurrent requests are the whole window.
   */
  function racing(client: string): PostOptions {
    return { client, key: 'race-key' };
  }

  it('stores EXACTLY ONE record for five submissions fired concurrently', async () => {
    configureMailer();
    providerAccepts();

    const raceOptions = racing('client-race-five');
    const body = validLead({ message: 'One double-click on a slow connection.' });

    // GENUINELY OVERLAPPING: all five handlers are STARTED before any of them is
    // awaited, so every one is inside `handleLead` at the same time and each one
    // reaches the duplicate check while the others are still in flight. A loop
    // with an `await` in it would not be a race — it would be the happy path.
    const responses = await Promise.all([
      POST(postJson(body, raceOptions)),
      POST(postJson(body, raceOptions)),
      POST(postJson(body, raceOptions)),
      POST(postJson(body, raceOptions)),
      POST(postJson(body, raceOptions)),
    ]);

    // DENOMINATOR: the number of records in the STORE, not the statuses.
    expect(arranged.records.size).toBe(1);

    const stored = onlyRecord(arranged);
    for (const response of responses) {
      expect(response.status).toBe(201);
      expect((await bodyOf(response)).id).toBe(stored.id);
    }
  });

  it('answers every concurrent duplicate with the SAME failure when the store fails', async () => {
    configureMailer();
    providerAccepts();
    const failing = useSink({ kind: 'fail', failure: { kind: 'transient', detail: 'timed out' } });

    const raceOptions = racing('client-race-failing');
    const body = validLead({ message: 'Concurrent, and nothing was stored.' });
    const responses = await Promise.all([
      POST(postJson(body, raceOptions)),
      POST(postJson(body, raceOptions)),
      POST(postJson(body, raceOptions)),
    ]);

    // THE CRUX: a request that finds another request's RESERVATION must never be
    // told success for a store that then failed. Nothing is in the store, so no
    // id exists, so no 2xx and no id may be handed out — to any of the three.
    expect(failing.records.size).toBe(0);
    for (const response of responses) {
      expect(response.status).toBe(503);
      expect(response.ok).toBe(false);
      expect(response.headers.get('Retry-After')).toBe('30');
      const parsed = await bodyOf(response);
      expect(parsed.ok).toBe(false);
      expect(parsed.error).toBe('storage_unavailable');
      expect(parsed.id).toBeUndefined();
    }

    // And a failed store is NOT remembered as done: the same key retried against
    // a working store still reaches it.
    const working = useSink({ kind: 'store' });
    const retry = await POST(postJson(body, raceOptions));

    expect(retry.status).toBe(201);
    expect(working.records.size).toBe(1);
    expect((await bodyOf(retry)).id).toBe(onlyRecord(working).id);
  });

  it('still stores TWO records for two concurrent submissions that are DIFFERENT', async () => {
    configureMailer();
    providerAccepts();

    // The reservation must narrow to one namespace, never to one endpoint: two
    // people posting at the same instant are two enquiries.
    const [first, second] = await Promise.all([
      POST(
        postJson(validLead({ name: 'Rami Peled', phone: '050-000-0003' }), {
          client: 'client-concurrent-one',
          key: 'shared-key-concurrent',
        }),
      ),
      POST(
        postJson(validLead({ name: 'Dana Cohen', phone: '050-311-2243' }), {
          client: 'client-concurrent-two',
          key: 'shared-key-concurrent',
        }),
      ),
    ]);

    expect(arranged.records.size).toBe(2);
    expect((await bodyOf(first)).id).not.toBe((await bodyOf(second)).id);
  });
});

/* ── 5 · Guard: the honeypot ──────────────────────────────────────────────── */

describe('POST /api/lead with the honeypot filled', () => {
  it('looks like success and stores nothing', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(postJson(validLead({ [HONEYPOT_FIELD]: 'http://spam.invalid' })));

    expect(response.status).toBe(201);
    expect(response.ok).toBe(true);
    expect((await bodyOf(response)).ok).toBe(true);

    // DENOMINATOR: the store was never even asked.
    expect(arranged.calls.length).toBe(0);
    expect(arranged.records.size).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it('carries no id, because no record exists to name', async () => {
    const response = await POST(postJson(validLead({ [HONEYPOT_FIELD]: 'x' })));
    expect((await bodyOf(response)).id).toBeUndefined();
  });

  it('traps before validation, so an invalid trapped post reveals nothing', async () => {
    const response = await POST(postJson({ [HONEYPOT_FIELD]: 'bot', locale: 'de' }));

    expect(response.status).toBe(201);
    expect(arranged.calls.length).toBe(0);
  });

  it('treats an empty honeypot as a human', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(postJson(validLead({ [HONEYPOT_FIELD]: '   ' })));

    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);
  });
});

/* ── 6 · Guard: the per-client rate limit ─────────────────────────────────── */

describe('POST /api/lead under a flood from one client', () => {
  it('admits five in the window and refuses the sixth with Retry-After', async () => {
    configureMailer();
    providerAccepts();

    const client = 'client-flooder';
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const response = await POST(
        postJson(validLead({ message: `Enquiry ${attempt}` }), { client }),
      );
      statuses.push(response.status);
      if (attempt === 5) {
        expect(await bodyOf(response)).toMatchObject({ ok: false, error: 'too_many_requests' });
        const retryAfter = response.headers.get('Retry-After');
        if (retryAfter === null) throw new Error('a 429 must say when to come back');
        expect(Number(retryAfter)).toBeGreaterThan(0);
        expect(Number(retryAfter)).toBeLessThanOrEqual(60);
      }
    }

    expect(statuses).toEqual([201, 201, 201, 201, 201, 429]);
    // DENOMINATOR: five records, not "the sixth status was 429".
    expect(arranged.records.size).toBe(5);
  });

  it('does not bleed across clients', async () => {
    configureMailer();
    providerAccepts();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await POST(postJson(validLead({ message: `A${attempt}` }), { client: 'client-noisy' }));
    }
    const other = await POST(postJson(validLead(), { client: 'client-quiet' }));

    expect(other.status).toBe(201);
    expect(arranged.records.size).toBe(6);
  });

  it('FAILS OPEN when the platform sends no client address', async () => {
    configureMailer();
    providerAccepts();

    const statuses: number[] = [];
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const response = await POST(
        postJson(validLead({ message: `Anonymous ${attempt}` }), { client: null }),
      );
      statuses.push(response.status);
    }

    expect(statuses).toEqual([201, 201, 201, 201, 201, 201, 201, 201]);
    expect(arranged.records.size).toBe(8);
  });
});

/* ── 7 · Guard: the payload cap, before the read and before the parse ─────── */

describe('POST /api/lead with an oversized body', () => {
  it('answers 413 for an oversized body that is ALSO malformed JSON', async () => {
    configureMailer();
    providerAccepts();

    // If the cap ran after `JSON.parse` this would be 400. It is 413, so the cap
    // is first.
    const response = await POST(postRaw(`{"name": "${'x'.repeat(MAX_BODY_CHARS)}`));

    expect(response.status).toBe(413);
    expect((await bodyOf(response)).error).toBe('body_too_large');
    expect(arranged.calls.length).toBe(0);
  });

  it('answers 413 for an oversized valid lead', async () => {
    const response = await POST(postJson(validLead({ message: 'x'.repeat(20000) })));

    expect(response.status).toBe(413);
    expect(arranged.calls.length).toBe(0);
  });

  it('answers 413 from Content-Length alone, WITHOUT reading the body', async () => {
    const request = postRaw(JSON.stringify(validLead()), {
      contentLength: String(MAX_BODY_CHARS + 1),
    });
    Object.defineProperty(request, 'text', {
      value: (): Promise<string> => {
        throw new Error('THE BODY WAS READ: the Content-Length check did not run first');
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
    expect(arranged.calls.length).toBe(0);
  });
});

/* ── 8 · Input the server refuses. None of it reaches the store ───────────── */

describe('POST /api/lead with input the server refuses', () => {
  const rejected: ReadonlyArray<{ readonly why: string; readonly payload: unknown }> = [
    { why: 'name is missing', payload: { phone: '0501234567' } },
    { why: 'name is blank', payload: validLead({ name: '   ' }) },
    { why: 'phone is missing', payload: { name: 'Yossi' } },
    { why: 'phone is blank', payload: validLead({ phone: '' }) },
    { why: 'the message exceeds its cap', payload: validLead({ message: 'x'.repeat(4001) }) },
    { why: 'the name exceeds its cap', payload: validLead({ name: 'x'.repeat(121) }) },
    {
      why: 'CR/LF is injected into the name',
      payload: validLead({ name: 'Dana\r\nBcc: elsewhere' }),
    },
    { why: 'LF is injected into the name', payload: validLead({ name: 'Dana\nSubject: other' }) },
    {
      why: 'CR/LF is injected into the email',
      payload: validLead({ email: 'visitor@example.invalid\r\nBcc: elsewhere@example.invalid' }),
    },
    { why: 'the email is malformed', payload: validLead({ email: 'not-an-address' }) },
    { why: 'the locale is outside the app union', payload: validLead({ locale: 'de' }) },
    { why: 'a field is not a string', payload: validLead({ name: 42 }) },
    { why: 'the body is a JSON array', payload: [] },
    { why: 'the body is JSON null', payload: null },
  ];

  for (const { why, payload } of rejected) {
    it(`answers 422 and stores nothing when ${why}`, async () => {
      configureMailer();
      providerAccepts();

      const response = await POST(postJson(payload));

      expect(response.status).toBe(422);
      expect(response.ok).toBe(false);

      const body = await bodyOf(response);
      expect(body.ok).toBe(false);
      expect(body.error).toBe('invalid_lead');

      // DENOMINATOR: zero store calls and zero mails, not merely a 4xx.
      expect(arranged.calls.length).toBe(0);
      expect(fetchMock).toHaveBeenCalledTimes(0);
    });
  }

  it('names the offending field in a machine-readable way', async () => {
    const response = await POST(postJson({ phone: '0501234567' }));
    const body = await bodyOf(response);

    expect(body.error).toBe('invalid_lead');
    expect(JSON.stringify(body.issues)).toContain('"field":"name"');
    expect(arranged.calls.length).toBe(0);
  });

  it('answers 400 without throwing when the body is not JSON', async () => {
    const response = await POST(postRaw('{"name": "Dana", '));

    expect(response.status).toBe(400);
    expect((await bodyOf(response)).error).toBe('malformed_json');
    expect(arranged.calls.length).toBe(0);
  });

  it('answers 400 without throwing when the body is absent', async () => {
    const response = await POST(new Request(ENDPOINT, { method: 'POST' }));

    expect(response.status).toBe(400);
    expect(response.ok).toBe(false);
    expect(arranged.calls.length).toBe(0);
  });
});

/* ── 9 · The autoresponse is the least important mail in the file ─────────── */

describe('POST /api/lead and the visitor autoresponse', () => {
  it('sends nothing extra when the catalogue has no copy for it', async () => {
    configureMailer();
    providerAccepts();
    harness.autoresponse = () => null;

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(201);
    // Exactly one mail: the owner's. `null` is not an error.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sends the rendered copy to the visitor, inventing no words of its own', async () => {
    configureMailer();
    providerAccepts();
    harness.autoresponse = () => ({ subject: 'RENDERED SUBJECT', body: 'RENDERED BODY' });

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(201);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const visitorMail = sentPayload(1);
    expect(visitorMail.to).toEqual(['visitor@example.invalid']);
    expect(visitorMail.subject).toBe('RENDERED SUBJECT');
    expect(visitorMail.text).toBe('RENDERED BODY');
  });

  it('sends nothing when the visitor left no address', async () => {
    configureMailer();
    providerAccepts();
    harness.autoresponse = () => ({ subject: 'RENDERED SUBJECT', body: 'RENDERED BODY' });

    await POST(postJson({ name: 'Yossi', phone: '0501234567' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not let a thrown renderer touch the visitor status or the record', async () => {
    configureMailer();
    providerAccepts();
    harness.autoresponse = () => {
      throw new Error('catalogue blew up');
    };

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);
    expect(onlyRecord(arranged).deliveryState.status).toBe('delivered');
  });

  it('does not let a refused autoresponse degrade the owner delivery state', async () => {
    configureMailer();
    harness.autoresponse = () => ({ subject: 'RENDERED SUBJECT', body: 'RENDERED BODY' });
    let call = 0;
    fetchMock.mockImplementation(() => {
      call += 1;
      if (call === 1) return Promise.resolve(Response.json({ id: 'ok' }, { status: 200 }));
      return Promise.resolve(new Response('', { status: 422 }));
    });

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(201);
    // The OWNER was told. That is what `deliveryState` answers.
    expect(onlyRecord(arranged).deliveryState.status).toBe('delivered');
  });
});

/* ── 10 · Non-POST methods ────────────────────────────────────────────────── */

describe('/api/lead with a method other than POST', () => {
  const handlers: ReadonlyArray<{ readonly method: string; readonly handler: () => Response }> = [
    { method: 'GET', handler: GET },
    { method: 'PUT', handler: PUT },
    { method: 'PATCH', handler: PATCH },
    { method: 'DELETE', handler: DELETE },
    { method: 'HEAD', handler: HEAD },
    { method: 'OPTIONS', handler: OPTIONS },
  ];

  for (const { method, handler } of handlers) {
    it(`answers 405 with an Allow header for ${method}`, async () => {
      const response = handler();

      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('POST');
      expect((await bodyOf(response)).error).toBe('method_not_allowed');
      expect(arranged.calls.length).toBe(0);
    });
  }
});

/* ── 12 · W16-C · Guard 0: provenance and media type ──────────────────────────
 *
 * WHAT THIS SUITE IS FOR. Before it existed, both of these were measured GREEN
 * against the built server — i.e. they worked, for an attacker:
 *   POST with `Origin: https://evil.example`          -> 201 {"ok":true,"id":...}
 *   POST with `Content-Type: text/plain;charset=UTF-8` -> 201 {"ok":true,"id":...}
 * The second is the one that matters: `text/plain` is a CORS-safelisted content
 * type, so that request needs no preflight and is issuable from ANY page on the
 * internet. Every case below asserts the STATUS, the BODY CODE, and — for the
 * refusals — that the store is still EMPTY, because "refused" means no record,
 * not merely a different number.
 *
 * The `unstated` cases are deliberately asserted as ADMITTED. That is the
 * decision recorded in the route's HONEST LIMIT 9, and a test that pins it is
 * what stops a later edit from failing closed on a missing browser header and
 * silently refusing a real enquiry.
 */

/** A POST whose provenance/media headers this suite controls exactly. */
function postWithHeaders(extra: Record<string, string>, body?: string): Request {
  requestCounter += 1;
  const headers: Record<string, string> = {
    'X-Forwarded-For': `client-${requestCounter}`,
    'Idempotency-Key': `key-${requestCounter}`,
    ...extra,
  };
  return new Request(ENDPOINT, {
    method: 'POST',
    headers,
    body: body === undefined ? JSON.stringify(validLead()) : body,
  });
}

describe('POST /api/lead from somewhere that is not this site', () => {
  it('refuses a cross-site fetch and stores nothing', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(
      postWithHeaders({
        'Content-Type': 'application/json',
        Origin: 'https://evil.example',
        'Sec-Fetch-Site': 'cross-site',
      }),
    );

    expect(response.status).toBe(403);
    expect((await bodyOf(response)).error).toBe('foreign_origin');
    expect(arranged.records.size).toBe(0);
    expect(arranged.calls.length).toBe(0);
  });

  it('refuses `same-site` and `none` as well as `cross-site`', async () => {
    configureMailer();
    providerAccepts();

    for (const site of ['same-site', 'none', 'CROSS-SITE']) {
      const response = await POST(
        postWithHeaders({ 'Content-Type': 'application/json', 'Sec-Fetch-Site': site }),
      );
      expect(response.status).toBe(403);
      expect((await bodyOf(response)).error).toBe('foreign_origin');
    }

    expect(arranged.records.size).toBe(0);
  });

  it('refuses a foreign Origin even when Sec-Fetch-Site is absent', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(
      postWithHeaders({ 'Content-Type': 'application/json', Origin: 'https://evil.example' }),
    );

    expect(response.status).toBe(403);
    expect((await bodyOf(response)).error).toBe('foreign_origin');
    expect(arranged.records.size).toBe(0);
  });

  it('refuses an Origin that is not a URL at all', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(
      postWithHeaders({ 'Content-Type': 'application/json', Origin: 'not-a-url' }),
    );

    expect(response.status).toBe(403);
    expect(arranged.records.size).toBe(0);
  });

  it('refuses BEFORE reading the body, so no oversize or parse cost is paid', async () => {
    configureMailer();
    providerAccepts();

    // Both of these would be 413 and 400 respectively if the guard ran later.
    const oversize = await POST(
      postWithHeaders(
        { 'Content-Type': 'application/json', 'Sec-Fetch-Site': 'cross-site', 'Content-Length': '99999' },
        JSON.stringify(validLead()),
      ),
    );
    expect(oversize.status).toBe(403);

    const unparseable = await POST(
      postWithHeaders(
        { 'Content-Type': 'application/json', 'Sec-Fetch-Site': 'cross-site' },
        '{"name": "Dana", ',
      ),
    );
    expect(unparseable.status).toBe(403);
    expect(arranged.records.size).toBe(0);
  });

  it('ADMITS the site’s own form: Sec-Fetch-Site same-origin stores the lead', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(
      postWithHeaders({
        'Content-Type': 'application/json',
        Origin: 'http://localhost',
        'Sec-Fetch-Site': 'same-origin',
      }),
    );

    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);
  });

  it('ADMITS an Origin whose host is the host the request was addressed to', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(
      postWithHeaders({ 'Content-Type': 'application/json', Origin: 'http://localhost' }),
    );

    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);
  });

  it('ADMITS an Origin matching a forwarded host, so a CDN cannot forge a refusal', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(
      postWithHeaders({
        'Content-Type': 'application/json',
        Origin: 'https://ravid-speaks.example',
        'X-Forwarded-Host': 'ravid-speaks.example',
      }),
    );

    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);
  });

  it('ADMITS a request that states no provenance at all — HONEST LIMIT 9', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(postWithHeaders({ 'Content-Type': 'application/json' }));

    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);
  });
});

describe('POST /api/lead with a body that is not JSON', () => {
  it('refuses text/plain — the CORS-simple type — and stores nothing', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(
      postWithHeaders({ 'Content-Type': 'text/plain;charset=UTF-8' }),
    );

    expect(response.status).toBe(415);
    expect((await bodyOf(response)).error).toBe('unsupported_media_type');
    expect(arranged.records.size).toBe(0);
    expect(arranged.calls.length).toBe(0);
  });

  it('refuses the other two content types an HTML form can produce', async () => {
    configureMailer();
    providerAccepts();

    for (const type of ['application/x-www-form-urlencoded', 'multipart/form-data; boundary=x']) {
      const response = await POST(postWithHeaders({ 'Content-Type': type }));
      expect(response.status).toBe(415);
      expect((await bodyOf(response)).error).toBe('unsupported_media_type');
    }

    expect(arranged.records.size).toBe(0);
  });

  it('refuses a non-empty body that names no content type at all', async () => {
    configureMailer();
    providerAccepts();

    // The one way a cross-origin POST can carry arbitrary bytes with NO
    // Content-Type header and still be a simple request: a Blob with an empty
    // type. Absent is not `application/json`, so it is refused.
    const response = await POST(postWithHeaders({}));

    expect(response.status).toBe(415);
    expect(arranged.records.size).toBe(0);
  });

  it('ADMITS application/json with the charset parameter fetch appends', async () => {
    configureMailer();
    providerAccepts();

    const response = await POST(
      postWithHeaders({ 'Content-Type': 'Application/JSON; charset=utf-8' }),
    );

    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);
  });

  it('leaves the bodyless POST answering 400, not 415', async () => {
    configureMailer();
    providerAccepts();

    // A request with no body has nothing to type. Typing it would have turned a
    // pinned 400 into a 415 for no security gain: there is no forged lead in an
    // empty body.
    const response = await POST(new Request(ENDPOINT, { method: 'POST' }));

    expect(response.status).toBe(400);
    expect(arranged.records.size).toBe(0);
  });
});
