// ─────────────────────────────────────────────────────────────────────────────
// W10-C LEAD FUNNEL COUNTER TESTS — lib/leads/__tests__/log.test.ts
//
// LAW 8 APPLIED TO A COUNTER: A SPY IS A NAME, A READ-BACK IS A THING. Not one
// assertion in this file says `recordLeadOutcome` was called. Every funnel test
// drives a REAL POST through the REAL `app/api/lead/route.ts` handler, lets the
// counter take its real path out through the real default transport, and then
// READS THE COUNTERS BACK OUT OF THE STORE and asserts the integers. A route that
// called the counter and stored nothing fails here; so does one that incremented
// the wrong key, and so does one that incremented two.
//
// INVARIANT     The counter module is never faked when its VALUES are asserted.
//               Two boundaries are faked and no others: the lead SINK (a
//               `LeadSink` replacing `resolveLeadSink`, exactly as the route's own
//               suite does) and the NETWORK — and the network fake is a working
//               in-memory stand-in for the key-value store, speaking the same
//               `["INCR", key]` / `["MGET", ...]` REST protocol the adapter
//               speaks, so `recordLeadOutcome` and `readLeadFunnel` run their real
//               bodies against a store that really holds integers. The one test
//               that DOES replace the counter module is the safety test, and it
//               replaces it with one that throws — see part 4.
//
// IMPOSSIBLE    A real network call is not constructible: `globalThis.fetch` is
//               stubbed before every test with a function that throws for any URL
//               it was not arranged for, and the two URLs it accepts are a
//               non-resolving placeholder and the provider endpoint. No credential
//               is present: `KV_REST_API_TOKEN` is stubbed to a fixed string that
//               is not a token and says so. Cross-test contamination through the
//               route's module-level rate-limit and idempotency maps is out of
//               reach — every request carries a unique client label and a unique
//               idempotency key unless a test deliberately pins them — and through
//               the store it is out of reach because the store is rebuilt empty in
//               `beforeEach`.
//
// CLASS         Closed by enumeration over the route's TERMINAL OUTCOMES: every
//               path that can end a request has a test here that names the ONE
//               tally it must move and asserts that every other derived total is
//               still 0. NOT closed over the real store's wire behaviour (see the
//               module's HONEST LIMIT 7), nor over concurrency: `INCR` is atomic
//               in the real store and the fake here is single-threaded, so "two
//               simultaneous enquiries both count" is asserted by nobody.
//
// HONEST LIMIT  These tests prove the counters move correctly IN ONE PROCESS with
//               a store that always works. They cannot prove that a deployed
//               instance has the two environment variables, that the managed store
//               keeps an integer across a month, or that anybody ever reads the
//               number — the module's HONEST LIMIT 5 (there is no screen yet) is
//               exactly the kind of gap no unit test can close.
// ─────────────────────────────────────────────────────────────────────────────

import { LEAD_TO_EMAIL_ENV_VAR } from '@/config/site';
import type { LeadSink, LeadSinkFailure, LeadStoreResult } from '@/lib/leads/port';
import type { LeadRecord } from '@/lib/leads/types';

/* ── The faked sink boundary ──────────────────────────────────────────────── */

const harness = vi.hoisted(() => {
  const state: { sink: LeadSink | null } = { sink: null };
  return state;
});

vi.mock('@/lib/leads/sinks', () => ({
  resolveLeadSink: (): LeadSink => {
    const sink = harness.sink;
    if (sink === null) throw new Error('a test reached the sink without arranging one');
    return sink;
  },
}));

import { POST } from '@/app/api/lead/route';
import {
  countLocale,
  readLeadFunnel,
  recordLeadOutcome,
  LEAD_OUTCOME,
  LOCALE_UNKNOWN,
  type LeadFunnelTotals,
} from '@/lib/leads/log';

/* ── The environment contract, pinned by NAME ─────────────────────────────── */

const KV_URL_ENV_VAR = 'KV_REST_API_URL';
const KV_TOKEN_ENV_VAR = 'KV_REST_API_TOKEN';
const API_KEY_ENV_VAR = 'RESEND_API_KEY';
const TO_ENV_VAR = LEAD_TO_EMAIL_ENV_VAR;
const FROM_ENV_VAR = 'LEAD_FROM_EMAIL';

/** Not addresses, not credentials, and deliberately not resolvable. */
const STORE_URL = 'https://store.example.invalid/rest';
const STORE_TOKEN = 'token-placeholder-not-a-credential';
const PROVIDER_ENDPOINT = 'https://api.resend.com/emails';

/* ── The fake sink: its CONTENTS are the assertion ────────────────────────── */

type SinkBehaviour = { readonly kind: 'store' } | { readonly kind: 'fail'; readonly failure: LeadSinkFailure };

type FakeSink = { readonly sink: LeadSink; readonly records: Map<string, LeadRecord> };

function createFakeSink(behaviour: SinkBehaviour = { kind: 'store' }): FakeSink {
  const records = new Map<string, LeadRecord>();
  const sink: LeadSink = {
    name: 'fake-sink',
    store(record: LeadRecord): Promise<LeadStoreResult> {
      if (behaviour.kind === 'fail') {
        return Promise.resolve({ stored: false, failure: behaviour.failure });
      }
      records.set(record.id, record);
      return Promise.resolve({ stored: true, id: record.id });
    },
  };
  return { sink, records };
}

/* ── The fake store: a working key-value store behind a fake `fetch` ──────── */

/** What the store actually holds. Rebuilt empty before every test. */
let held: Map<string, number>;

/** Set by a test that wants the store to refuse or to blow up. */
let storeBehaviour: 'ok' | 'http_500' | 'refuses' | 'throws';

type FakeInit = { readonly body: string };

/**
 * One inbound response. `ok` is present because the route's mail adapter reads it
 * and the store's transport reads `status`; a fake that carries only one of them
 * would make a delivered notification look refused.
 */
function respond(
  status: number,
  body: unknown,
): { status: number; ok: boolean; text(): Promise<string> } {
  return {
    status,
    ok: status >= 200 && status <= 299,
    text: (): Promise<string> => Promise.resolve(JSON.stringify(body)),
  };
}

function runCommand(parts: readonly unknown[]): unknown {
  const [verb, ...rest] = parts;
  if (verb === 'INCR') {
    const target = String(rest[0]);
    const next = (held.get(target) ?? 0) + 1;
    held.set(target, next);
    return next;
  }
  if (verb === 'MGET') {
    return rest.map((name) => {
      const value = held.get(String(name));
      return value === undefined ? null : String(value);
    });
  }
  throw new Error(`the fake store was sent a command it does not implement: ${String(verb)}`);
}

function fakeFetch(
  url: string,
  init: FakeInit,
): Promise<{ status: number; ok: boolean; text(): Promise<string> }> {
  if (url === PROVIDER_ENDPOINT) {
    return Promise.resolve(respond(200, { id: 'provider-message-id' }));
  }
  if (url !== STORE_URL) {
    throw new Error(`NETWORK_FORBIDDEN: a test reached ${url}`);
  }
  if (storeBehaviour === 'throws') throw new Error('the store connection blew up');
  if (storeBehaviour === 'http_500') return Promise.resolve(respond(500, { error: 'boom' }));
  if (storeBehaviour === 'refuses') return Promise.resolve(respond(200, { error: 'WRONGTYPE' }));

  const parsed: unknown = JSON.parse(init.body);
  if (!Array.isArray(parsed)) throw new Error('the fake store was sent a body that is not a command');
  return Promise.resolve(respond(200, { result: runCommand(parsed) }));
}

let arranged: FakeSink;

beforeEach(() => {
  held = new Map<string, number>();
  storeBehaviour = 'ok';
  vi.stubGlobal('fetch', fakeFetch);

  vi.stubEnv(KV_URL_ENV_VAR, STORE_URL);
  vi.stubEnv(KV_TOKEN_ENV_VAR, STORE_TOKEN);
  // Unconfigured mail is the DEFAULT state, exactly as tonight's deployment is.
  vi.stubEnv(API_KEY_ENV_VAR, '');
  vi.stubEnv(TO_ENV_VAR, '');
  vi.stubEnv(FROM_ENV_VAR, '');

  arranged = createFakeSink();
  harness.sink = arranged.sink;
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
  vi.stubEnv(API_KEY_ENV_VAR, 'test-key-not-a-credential');
  vi.stubEnv(TO_ENV_VAR, 'to-address-placeholder');
  vi.stubEnv(FROM_ENV_VAR, 'from-address-placeholder');
}

/* ── Request builders ─────────────────────────────────────────────────────── */

const ENDPOINT = 'http://localhost/api/lead';

let requestCounter = 0;

type PostOptions = { readonly client?: string; readonly key?: string };

function postRaw(raw: string, options: PostOptions = {}): Request {
  requestCounter += 1;
  return new Request(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': options.client ?? `client-${requestCounter}`,
      'Idempotency-Key': options.key ?? `key-${requestCounter}`,
    },
    body: raw,
  });
}

function postJson(value: unknown, options: PostOptions = {}): Request {
  return postRaw(JSON.stringify(value), options);
}

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

/* ── Reading the counters back — THE thing, never a name ──────────────────── */

/** The whole funnel, or a thrown error if the deployment was not counting. */
async function funnel(): Promise<{
  readonly totals: LeadFunnelTotals;
  readonly byLocale: Readonly<Record<'he' | 'en' | 'unknown', LeadFunnelTotals>>;
  readonly tallies: Readonly<Record<string, number>>;
}> {
  const reading = await readLeadFunnel();
  if (reading.measured === false) {
    throw new Error('the funnel reported that it was not counting at all');
  }
  return { totals: reading.totals, byLocale: reading.byLocale, tallies: reading.tallies };
}

/**
 * Assert the WHOLE derived funnel at once. Every field not named in `expected` is
 * asserted to be 0 — which is the half of the test that catches a counter moving
 * something it had no business moving.
 */
function expectTotals(actual: LeadFunnelTotals, expected: Partial<LeadFunnelTotals>): void {
  const zeroed: LeadFunnelTotals = {
    attempts: 0,
    stored: 0,
    notified: 0,
    storedButNobodyTold: 0,
    neverStored: 0,
    refusedByForm: 0,
    duplicates: 0,
    discardedBots: 0,
    refusedBeforeReading: 0,
  };
  expect(actual).toEqual({ ...zeroed, ...expected });
}

/* ── 1 · THE LAW-8 TEST: a real POST, then the VALUES ─────────────────────── */

describe('the funnel after a real POST through the real route handler', () => {
  it('reads back attempts 1, stored 1, notified 1 once a lead is stored and the owner is told', async () => {
    configureMailer();

    const response = await POST(postJson(validLead()));
    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);

    // NOT "the counter was called" — the integers that came back out of the store.
    const { totals, tallies } = await funnel();
    expectTotals(totals, { attempts: 1, stored: 1, notified: 1 });
    expect(tallies['lead_funnel:stored_notified:he']).toBe(1);
    expect(tallies['lead_funnel:stored_unnotified:he']).toBe(0);
  });

  it('reads back stored 1 with storedButNobodyTold 1 when the mail is unconfigured', async () => {
    // The live state of this deployment: a store, and no mail credentials.
    const response = await POST(postJson(validLead()));
    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);

    const { totals, tallies } = await funnel();
    expectTotals(totals, { attempts: 1, stored: 1, notified: 0, storedButNobodyTold: 1 });
    expect(tallies['lead_funnel:stored_unnotified:he']).toBe(1);
    // THE POINT OF THE WHOLE MODULE: this is not the same number as neverStored.
    expect(totals.neverStored).toBe(0);
  });

  it('reads back storedButNobodyTold when the provider rejects the notification', async () => {
    configureMailer();
    vi.stubGlobal('fetch', (url: string, init: FakeInit) => {
      if (url === PROVIDER_ENDPOINT) return Promise.resolve(respond(422, { error: 'refused' }));
      return fakeFetch(url, init);
    });

    const response = await POST(postJson(validLead()));
    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);

    const { totals } = await funnel();
    expectTotals(totals, { attempts: 1, stored: 1, notified: 0, storedButNobodyTold: 1 });
  });
});

/* ── 2 · Every outcome moves exactly its own counter and no other ─────────── */

describe('each terminal outcome of the route', () => {
  it('counts a honeypot hit as a discarded bot and NOT as an attempt', async () => {
    const response = await POST(postJson({ ...validLead(), hp_ref: 'filled-by-a-bot' }));
    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(0);

    const { totals, tallies } = await funnel();
    expectTotals(totals, { discardedBots: 1 });
    expect(tallies['lead_funnel:discarded_bot:unknown']).toBe(1);
  });

  it('counts a flood as refused-before-reading and moves no attempt at all', async () => {
    const client = 'one-address-under-flood';
    for (let index = 0; index < 5; index += 1) {
      const refused = await POST(postRaw('{ not json', { client }));
      expect(refused.status).toBe(400);
    }
    const limited = await POST(postRaw('{ not json', { client }));
    expect(limited.status).toBe(429);

    const { totals, tallies } = await funnel();
    expectTotals(totals, { refusedBeforeReading: 6 });
    expect(tallies['lead_funnel:refused_unparseable:unknown']).toBe(5);
    expect(tallies['lead_funnel:refused_rate_limited:unknown']).toBe(1);
    expect(totals.attempts).toBe(0);
  });

  it('counts an oversize body as refused-before-reading', async () => {
    const response = await POST(postJson({ ...validLead(), message: 'x'.repeat(17 * 1024) }));
    expect(response.status).toBe(413);

    const { totals, tallies } = await funnel();
    expectTotals(totals, { refusedBeforeReading: 1 });
    expect(tallies['lead_funnel:refused_oversize:unknown']).toBe(1);
  });

  it('counts an invalid submission as an ATTEMPT that the form refused, never as a lost lead', async () => {
    const response = await POST(postJson(validLead({ phone: '' })));
    expect(response.status).toBe(422);
    expect(arranged.records.size).toBe(0);

    const { totals, tallies } = await funnel();
    expectTotals(totals, { attempts: 1, refusedByForm: 1 });
    // A person the form turned away is NOT an enquiry that was lost in transit.
    expect(totals.neverStored).toBe(0);
    expect(tallies['lead_funnel:refused_by_form:he']).toBe(1);
  });

  it('counts a replayed submission ONCE as an attempt and once as a duplicate', async () => {
    const pinned: PostOptions = { client: 'a-visitor-who-double-clicked', key: 'one-idempotency-key' };

    const first = await POST(postJson(validLead(), pinned));
    const second = await POST(postJson(validLead(), pinned));

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(arranged.records.size).toBe(1);

    const { totals } = await funnel();
    // ONE enquiry. The second send is visible, and it is not a second person.
    expectTotals(totals, { attempts: 1, stored: 1, storedButNobodyTold: 1, duplicates: 1 });
  });
});

/* ── 3 · The three ways an enquiry is NEVER STORED, kept apart ────────────── */

describe('a store failure', () => {
  const cases: readonly { readonly kind: LeadSinkFailure['kind']; readonly status: number; readonly tally: string }[] = [
    { kind: 'not_configured', status: 503, tally: 'lead_funnel:lost_unconfigured:he' },
    { kind: 'transient', status: 503, tally: 'lead_funnel:lost_transient:he' },
    { kind: 'permanent', status: 500, tally: 'lead_funnel:lost_permanent:he' },
  ];

  for (const scenario of cases) {
    it(`counts a ${scenario.kind} failure as NEVER STORED, never as "stored but nobody was told"`, async () => {
      const failure: LeadSinkFailure =
        scenario.kind === 'not_configured'
          ? { kind: 'not_configured', missingEnvVars: ['A_NAME_ONLY'], detail: 'test' }
          : { kind: scenario.kind, detail: 'test' };
      const store = useSink({ kind: 'fail', failure });

      const response = await POST(postJson(validLead()));
      expect(response.status).toBe(scenario.status);
      expect(store.records.size).toBe(0);

      const { totals, tallies } = await funnel();
      expectTotals(totals, { attempts: 1, neverStored: 1 });
      expect(tallies[scenario.tally]).toBe(1);
      // THE DISTINCTION THE WHOLE MODULE EXISTS FOR.
      expect(totals.storedButNobodyTold).toBe(0);
      expect(totals.stored).toBe(0);
    });
  }
});

/* ── 4 · The language split ───────────────────────────────────────────────── */

describe('the language split', () => {
  it('counts Hebrew and English enquiries in separate buckets that add up', async () => {
    await POST(postJson(validLead({ locale: 'he' })));
    await POST(postJson(validLead({ locale: 'en', name: 'Sarah Levi' })));
    await POST(postJson(validLead({ locale: 'en', name: 'Noa Bar' })));

    const { totals, byLocale } = await funnel();
    expect(totals.stored).toBe(3);
    expect(byLocale.he.stored).toBe(1);
    expect(byLocale.en.stored).toBe(2);
    expect(byLocale.unknown.stored).toBe(0);
    expect(byLocale.he.attempts + byLocale.en.attempts + byLocale.unknown.attempts).toBe(totals.attempts);
  });

  it('narrows a claimed language to one of exactly three values and never guesses', () => {
    expect(countLocale('he')).toBe('he');
    expect(countLocale('en')).toBe('en');
    expect(countLocale({ locale: 'en' })).toBe('en');
    expect(countLocale({ locale: 'de' })).toBe(LOCALE_UNKNOWN);
    expect(countLocale(undefined)).toBe(LOCALE_UNKNOWN);
    expect(countLocale(['he'])).toBe(LOCALE_UNKNOWN);
  });
});

/* ── 5 · THE SAFETY TEST — the most important one in this file ────────────── */

describe('a counter that fails', () => {
  it('costs the family nothing when the store connection throws: still 201, lead still stored', async () => {
    storeBehaviour = 'throws';

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);
    const body: unknown = await response.json();
    expect(body).toEqual({ ok: true, id: [...arranged.records.keys()][0] });
  });

  it('costs the family nothing when the store answers HTTP 500', async () => {
    storeBehaviour = 'http_500';
    const response = await POST(postJson(validLead()));
    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);
  });

  it('costs the family nothing when the store refuses the command', async () => {
    storeBehaviour = 'refuses';
    const response = await POST(postJson(validLead()));
    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);
  });

  it('costs the family nothing when the COUNTER MODULE ITSELF throws synchronously', async () => {
    // This one does not trust `log.ts` to keep its own promise. The module is
    // replaced by one whose `recordLeadOutcome` throws before it returns a
    // promise at all — the failure a `.catch()` would not even see. The route
    // must still answer 201 with the lead in the store.
    vi.resetModules();
    vi.doMock('@/lib/leads/log', () => ({
      LEAD_OUTCOME: { storedNotified: 'stored_notified', storedUnnotified: 'stored_unnotified' },
      LOCALE_UNKNOWN: 'unknown',
      countLocale: (): string => 'he',
      outcomeForStoreFailure: (): string => 'lost_transient',
      recordLeadOutcome: (): Promise<void> => {
        throw new Error('the funnel counter is broken');
      },
    }));

    const isolated: { POST: (request: Request) => Promise<Response> } = await import(
      '@/app/api/lead/route'
    );
    const response = await isolated.POST(postJson(validLead()));

    expect(response.status).toBe(201);
    expect(arranged.records.size).toBe(1);

    vi.doUnmock('@/lib/leads/log');
    vi.resetModules();
  });
});

/* ── 6 · No store configured: "not counting" is not a zero ────────────────── */

describe('a deployment with no key-value store attached', () => {
  it('reports that it is NOT MEASURING, with the missing NAMES and no totals at all', async () => {
    vi.stubEnv(KV_URL_ENV_VAR, '');
    vi.stubEnv(KV_TOKEN_ENV_VAR, '');

    const reading = await readLeadFunnel();

    // A zero here would tell a bereaved family nobody enquired. It must not.
    expect(reading.measured).toBe(false);
    if (reading.measured === true) throw new Error('unreachable');
    expect(reading.missing).toEqual([KV_URL_ENV_VAR, KV_TOKEN_ENV_VAR]);
    expect('totals' in reading).toBe(false);
  });

  it('names only the half that is missing when the store is half-configured', async () => {
    vi.stubEnv(KV_TOKEN_ENV_VAR, '   ');

    const reading = await readLeadFunnel();
    if (reading.measured === true) throw new Error('a blank token is not a configured store');
    expect(reading.missing).toEqual([KV_TOKEN_ENV_VAR]);
  });

  it('writes nothing and throws nothing when there is nowhere to write', async () => {
    vi.stubEnv(KV_URL_ENV_VAR, '');
    vi.stubEnv(KV_TOKEN_ENV_VAR, '');

    await expect(recordLeadOutcome(LEAD_OUTCOME.storedNotified, 'he')).resolves.toBeUndefined();
    expect(held.size).toBe(0);
  });
});
