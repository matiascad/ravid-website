// ─────────────────────────────────────────────────────────────────────────────
// W9-B WEBHOOK SINK TESTS — lib/leads/sinks/__tests__/webhook.test.ts
//
// INVARIANT     The success test asserts the POSTed BODY KEY BY KEY against the
//               TEN-field contract documented in `../webhook.ts` — the same ten
//               an operator builds their spreadsheet columns from — plus the
//               url, the method and the content type. If the shape drifts, this
//               file goes red before anybody's sheet does. The last describe
//               block drives the REAL route over a stubbed `globalThis.fetch`
//               and asserts the requests that actually left, so the row COUNT
//               and every row's BODY are measured, not reasoned about.
//
// IMPOSSIBLE    Three failures cannot pass this file: an adapter that claims
//               `{ stored: true }` having sent nothing (the recorded call list
//               would be empty), an adapter that quietly adds or drops a payload
//               field (the body is compared with `toEqual`, which is exact about
//               extra keys), and an adapter that would POST personal data over
//               plaintext http (the `http:` endpoint resolves to a sink that
//               stores nothing and names the variable).
//
// CLASS         This instance — one operator payload contract and one status
//               mapping. The derivation it shares with `./kv.test.ts` is the
//               method: a recording transport, assertions on bytes, no network.
//
// HONEST LIMIT  A 2xx is all a webhook offers, so the success test proves the
//               adapter SENT the right bytes and CONCLUDED the documented thing
//               from a 2xx — never that a row appeared in anyone's spreadsheet.
//               That limit is the adapter's (its header states it) and no test
//               on this side of the wire can close it.
// ─────────────────────────────────────────────────────────────────────────────

import type { LeadSink } from '../../port';
import { withDelivered } from '../../types';
import { resolveWebhookSink, WEBHOOK_ENV_VARS } from '../webhook';

import {
  failureOf,
  FIXTURE_NOW,
  FIXTURE_WEBHOOK_URL,
  recordingTransport,
  testEnv,
  testRecord,
  type Recorder,
} from './fixtures';

const CONFIGURED: NodeJS.ProcessEnv = testEnv({ LEAD_WEBHOOK_URL: FIXTURE_WEBHOOK_URL });

/** The operator's columns, in order. A sheet is built on this array. */
const WEBHOOK_COLUMNS: readonly string[] = [
  'id',
  'receivedAt',
  'source',
  'locale',
  'name',
  'phone',
  'email',
  'organization',
  'message',
  'deliveryState',
];

/**
 * One POSTed body as a row of cells. Throws if any value is not a string, which
 * is itself part of the contract: a sheet's cells never arrive as `null`.
 */
function rowOf(raw: string): Record<string, string> {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(`expected a JSON object body, got: ${raw}`);
  }
  const row: Record<string, string> = {};
  for (const [column, cell] of Object.entries(parsed)) {
    if (typeof cell !== 'string') {
      throw new Error(`column ${column} is not a string; every webhook field must be`);
    }
    row[column] = cell;
  }
  return row;
}

function sinkFor(env: NodeJS.ProcessEnv, recorder: Recorder): LeadSink {
  const sink = resolveWebhookSink(env, recorder.transport);
  if (sink === null) {
    throw new Error('expected a sink for this environment, got null');
  }
  return sink;
}

describe('webhook lead sink', () => {
  it('POSTs the ten-field payload and echoes the record id', async () => {
    const recorder = recordingTransport({ status: 200, body: 'OK' });
    const record = testRecord();

    const result = await sinkFor(CONFIGURED, recorder).store(record);

    expect(result).toEqual({ stored: true, id: record.id });

    expect(recorder.calls).toHaveLength(1);
    const request = recorder.calls[0] ?? { url: '', method: 'POST', headers: {}, body: '' };
    expect(request.url).toBe(FIXTURE_WEBHOOK_URL);
    expect(request.method).toBe('POST');
    expect(request.headers).toEqual({ 'Content-Type': 'application/json' });

    // THE CONTRACT. Exactly these keys, exactly these values. `toEqual` fails on
    // an extra key, so a field the visitor never provided cannot creep in.
    expect(JSON.parse(request.body)).toEqual({
      id: record.id,
      receivedAt: record.receivedAt,
      source: 'web_form',
      locale: 'he',
      name: 'Test Visitor',
      phone: '000-0000000',
      email: 'visitor@example.invalid',
      organization: 'Example Community Centre',
      message: 'First line\nsecond line',
      // APPENDED, and DECLARED (D-76). See the note below this describe block.
      deliveryState: 'pending',
    });

    // Column order is the contract too: a sheet built on it must not shift.
    expect(Object.keys(rowOf(request.body))).toEqual(WEBHOOK_COLUMNS);
  });

  it('sends empty strings, never nulls, for the optional fields', async () => {
    const recorder = recordingTransport({ status: 200, body: 'OK' });
    const record = testRecord({ email: '', organization: '', message: '', locale: 'en' });

    await sinkFor(CONFIGURED, recorder).store(record);

    const body = JSON.parse(recorder.calls[0]?.body ?? '') as Record<string, unknown>;
    expect(body.email).toBe('');
    expect(body.organization).toBe('');
    expect(body.message).toBe('');
    expect(body.locale).toBe('en');
  });

  it('returns a transient failure when the transport rejects, and does not throw', async () => {
    const boom = new Error('connection reset');
    const recorder = recordingTransport(boom);

    const failure = failureOf(await sinkFor(CONFIGURED, recorder).store(testRecord()));

    expect(failure.kind).toBe('transient');
    expect(failure.kind === 'not_configured' ? undefined : failure.cause).toBe(boom);
  });

  it('maps 4xx to permanent and 5xx to transient', async () => {
    const refused = recordingTransport({ status: 404, body: 'not found' });
    expect(failureOf(await sinkFor(CONFIGURED, refused).store(testRecord())).kind).toBe('permanent');

    const broken = recordingTransport({ status: 500, body: 'script error' });
    expect(failureOf(await sinkFor(CONFIGURED, broken).store(testRecord())).kind).toBe('transient');
  });

  it('never names the endpoint in a failure detail', async () => {
    const recorder = recordingTransport({ status: 500, body: 'script error' });

    const failure = failureOf(await sinkFor(CONFIGURED, recorder).store(testRecord()));

    expect(failure.detail).not.toContain('example.invalid');
    expect(failure.detail).toContain('500');
  });

  it('refuses a non-https endpoint, names the variable, and sends nothing', async () => {
    const recorder = recordingTransport({ status: 200, body: 'OK' });
    const plaintext: NodeJS.ProcessEnv = testEnv({
      LEAD_WEBHOOK_URL: 'http://hooks.example.invalid/lead',
    });

    const failure = failureOf(await sinkFor(plaintext, recorder).store(testRecord()));

    expect(failure.kind).toBe('not_configured');
    expect(failure.kind === 'not_configured' ? failure.missingEnvVars : []).toEqual([
      'LEAD_WEBHOOK_URL',
    ]);
    expect(recorder.calls).toHaveLength(0);
  });

  it('refuses an unparseable endpoint, and sends nothing', async () => {
    const recorder = recordingTransport({ status: 200, body: 'OK' });
    const nonsense: NodeJS.ProcessEnv = testEnv({ LEAD_WEBHOOK_URL: 'paste-your-url-here' });

    const failure = failureOf(await sinkFor(nonsense, recorder).store(testRecord()));

    expect(failure.kind).toBe('not_configured');
    expect(recorder.calls).toHaveLength(0);
  });

  it('resolves to null when the variable is unset or blank', () => {
    const recorder = recordingTransport({ status: 200, body: 'OK' });

    expect(resolveWebhookSink(testEnv(), recorder.transport)).toBeNull();
    expect(resolveWebhookSink(testEnv({ LEAD_WEBHOOK_URL: '  ' }), recorder.transport)).toBeNull();
    expect(recorder.calls).toHaveLength(0);
  });

  it('declares exactly the one variable NAME it reads', () => {
    expect(WEBHOOK_ENV_VARS).toEqual(['LEAD_WEBHOOK_URL']);
  });
});

/* ── The TENTH column, and what actually leaves on a webhook-ONLY deployment ─
 *
 * DECLARED EXTENSION (D-76): the exhaustive `toEqual` above now covers TEN
 * fields, not nine. `deliveryState` was APPENDED — the stability rule in
 * `../webhook.ts` permits appending and forbids renaming or reordering, so every
 * column an operator's sheet already has keeps its position and its meaning, and
 * the operator adds ONE column at the right-hand end. This is literally a
 * spreadsheet column: say so in the release note, not only here.
 *
 * WHY IT HAD TO BE ADDED — measured, not argued. The route persists, notifies,
 * then re-`store()`s the settled record. A keyed sink upserts; an append-only
 * webhook cannot, so the second call is a second row. Before this change that
 * second row was BYTE-IDENTICAL to the first: two rows per lead in the family's
 * sheet, and the delivery state — the one fact the second write exists to
 * record — discarded entirely on a webhook-only deployment. The row count is
 * unchanged by this fix. What changed is that the second row now says something.
 *
 * These tests drive the REAL route over a stubbed `globalThis.fetch` and assert
 * the requests that actually left, body by body. Nothing here asserts that a
 * function was called (Law 8).
 */

/** The id the route told the visitor, read without a cast. */
function idFromResponse(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'id' in body && typeof body.id === 'string') {
    return body.id;
  }
  throw new Error(`expected a 201 body carrying an id, got: ${JSON.stringify(body)}`);
}

type WireCall = { readonly url: string; readonly body: string };

/**
 * The `["SET", key, value]` array a key-value write put on the wire, as data.
 * Local to this file because the evidence here is a raw body off the stubbed
 * `fetch`, not the `LeadHttpRequest` a sink hands its injected transport.
 */
function kvCommandOf(raw: string): readonly string[] {
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed.map((element) => String(element)) : [];
}

/** Every request that left the process, in order. The evidence. */
function stubWire(answers: Record<string, string>): WireCall[] {
  const sent: WireCall[] = [];
  vi.stubGlobal('fetch', (input: unknown, init: unknown): Promise<Response> => {
    const url = String(input);
    const body =
      typeof init === 'object' && init !== null && 'body' in init && typeof init.body === 'string'
        ? init.body
        : '';
    sent.push({ url, body });
    const answer = Object.entries(answers).find(([prefix]) => url.startsWith(prefix));
    return Promise.resolve(new Response(answer === undefined ? 'OK' : answer[1], { status: 200 }));
  });
  return sent;
}

function enquiry(message: string): Request {
  return new Request('https://ravid.example.invalid/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dana Cohen',
      phone: '050-1234567',
      email: 'dana@example.invalid',
      organization: 'Example School',
      message,
      locale: 'he',
    }),
  });
}

describe('webhook-only deployment: the rows the family actually receives', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('sends TWO rows for one lead, and the second one carries the delivery state', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', FIXTURE_WEBHOOK_URL);
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('KV_REST_API_TOKEN', '');
    // Mailer deliberately unconfigured: this is W9 gate criterion 3 — a notify
    // failure must still answer 201 AND leave the degraded state observable.
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('LEAD_TO_EMAIL', '');
    vi.stubEnv('LEAD_FROM_EMAIL', '');

    const sent = stubWire({});
    const { POST } = await import('@/app/api/lead/route');

    const response = await POST(enquiry('two rows, one lead'));
    expect(response.status).toBe(201);
    const id = idFromResponse(await response.json());

    // Nothing left this process for anywhere but the operator's own endpoint.
    expect(sent.filter((call) => call.url.startsWith(FIXTURE_WEBHOOK_URL) === false)).toEqual([]);

    const rows = sent.map((call) => rowOf(call.body));
    expect(rows).toHaveLength(2);

    const first = rows[0] ?? {};
    const second = rows[1] ?? {};

    // THE CONTRACT, on the wire, twice: same columns, same order, both rows.
    expect(Object.keys(first)).toEqual(WEBHOOK_COLUMNS);
    expect(Object.keys(second)).toEqual(WEBHOOK_COLUMNS);

    // Same lead, one id: an operator sorting by id sees the pair together.
    expect(first.id).toBe(id);
    expect(second.id).toBe(id);

    // The one column that differs — and the reason the second row exists.
    expect(first.deliveryState).toBe('pending');
    expect(second.deliveryState).toBe('failed');

    // Everything else is identical: this is an UPDATE, not a second enquiry.
    expect({ ...first, deliveryState: '' }).toEqual({ ...second, deliveryState: '' });

    // The visitor's own words reached the sheet, unaltered, in both rows.
    expect(second.name).toBe('Dana Cohen');
    expect(second.phone).toBe('050-1234567');
    expect(second.message).toBe('two rows, one lead');
  });

  it('says `delivered` in the second row when the owner was told', async () => {
    // Proved at the sink rather than through the mail transport: the record is
    // the only thing the sink reads, and `withDelivered` is how the route
    // settles it. See `../../types.ts`.
    const recorder = recordingTransport({ status: 200, body: 'OK' });
    const sink = sinkFor(CONFIGURED, recorder);
    const record = testRecord();

    await sink.store(record);
    await sink.store(withDelivered(record, FIXTURE_NOW));

    const rows = recorder.calls.map((call) => rowOf(call.body));
    expect(rows).toHaveLength(2);
    expect(Object.keys(rows[0] ?? {})).toEqual(WEBHOOK_COLUMNS);
    expect(Object.keys(rows[1] ?? {})).toEqual(WEBHOOK_COLUMNS);
    expect((rows[0] ?? {}).deliveryState).toBe('pending');
    expect((rows[1] ?? {}).deliveryState).toBe('delivered');
  });

  it('KV DOES NOT REGRESS: two writes, one KEY, the record updated in place', async () => {
    vi.stubEnv('LEAD_WEBHOOK_URL', '');
    vi.stubEnv('KV_REST_API_URL', 'https://kv.example.invalid/');
    vi.stubEnv('KV_REST_API_TOKEN', 'not-a-real-token');
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('LEAD_TO_EMAIL', '');
    vi.stubEnv('LEAD_FROM_EMAIL', '');

    const sent = stubWire({ 'https://kv.example.invalid/': '{"result":"OK"}' });
    const { POST } = await import('@/app/api/lead/route');

    const response = await POST(enquiry('kv must not regress'));
    expect(response.status).toBe(201);
    const id = idFromResponse(await response.json());

    const writes = sent.filter((call) => kvCommandOf(call.body)[0] === 'SET');
    expect(writes).toHaveLength(2);

    // The SAME key both times: an upsert, so the store holds ONE record.
    const keys = writes.map((call) => kvCommandOf(call.body)[1]);
    expect(keys[0]).toBe(keys[1]);
    expect(keys[0]).toContain(id);

    // And the second write is the one that carries the settled delivery state,
    // exactly as it did before the webhook payload gained its tenth column.
    const values = writes.map((call) => kvCommandOf(call.body)[2] ?? '');
    expect(values[0]).toContain('"status":"pending"');
    expect(values[1]).toContain('"status":"failed"');
  });
});
