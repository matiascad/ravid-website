// ─────────────────────────────────────────────────────────────────────────────
// W9-B KEY-VALUE SINK TESTS — lib/leads/sinks/__tests__/kv.test.ts
//
// INVARIANT     Every success assertion in this file checks THE BYTES: the url
//               the adapter addressed, the `Authorization` header it set, the
//               `SET` command it built, the key it derived from `record.id`, and
//               the lead's own fields inside the stored value — not that a
//               transport "was called". Every failure assertion checks the KIND
//               returned, and that nothing was thrown.
//
// IMPOSSIBLE    An adapter that returns `{ stored: true }` having sent nothing
//               cannot pass this file: `calls[0]` would be `undefined` and five
//               assertions read through it. An adapter that mints its own id
//               cannot pass either — the echoed id is compared to `record.id`
//               AND to the key on the wire, so a fresh id fails both. And an
//               adapter that trusts the STATUS alone cannot pass: the 200 +
//               `{"error":...}` case is the store's real way of saying no.
//
// CLASS         This instance — these are one adapter's wire format and one
//               adapter's status mapping. The derivation is the shape: recorded
//               request in, result union out, no network, no secret.
//
// HONEST LIMIT  No test here talks to a key-value store, so none of this proves
//               the provider accepts this command, that `{"result":"OK"}` is
//               what it really answers, or that a stored lead can be read back.
//               It proves what this code SENDS and what it CONCLUDES from a
//               reply — the two halves that are this repository's to own. The
//               protocol itself is documented, not measured.
// ─────────────────────────────────────────────────────────────────────────────

import type { LeadSink } from '../../port';
import type { LeadRecord } from '../../types';
import { KV_ENV_VARS, resolveKvSink } from '../kv';

import {
  commandOf,
  failureOf,
  FIXTURE_KV_TOKEN,
  FIXTURE_KV_URL,
  recordingTransport,
  testEnv,
  testRecord,
  type Recorder,
} from './fixtures';

const CONFIGURED: NodeJS.ProcessEnv = testEnv({
  KV_REST_API_URL: FIXTURE_KV_URL,
  KV_REST_API_TOKEN: FIXTURE_KV_TOKEN,
});

/** The adapter under test, or a loud failure if the env fixture stopped working. */
function sinkFor(env: NodeJS.ProcessEnv, recorder: Recorder): LeadSink {
  const sink = resolveKvSink(env, recorder.transport);
  if (sink === null) {
    throw new Error('expected a sink for this environment, got null');
  }
  return sink;
}

describe('kv lead sink', () => {
  it('sends one SET carrying the lead, and echoes the record id', async () => {
    const recorder = recordingTransport({ status: 200, body: '{"result":"OK"}' });
    const record = testRecord();

    const result = await sinkFor(CONFIGURED, recorder).store(record);

    // 1. The result: stored, and the id is the record's own.
    expect(result).toEqual({ stored: true, id: record.id });

    // 2. The bytes. Exactly one request, and this is what was in it.
    expect(recorder.calls).toHaveLength(1);
    const request = recorder.calls[0] ?? { url: '', method: 'POST', headers: {}, body: '' };
    expect(request.url).toBe(FIXTURE_KV_URL);
    expect(request.method).toBe('POST');
    expect(request.headers).toEqual({
      Authorization: `Bearer ${FIXTURE_KV_TOKEN}`,
      'Content-Type': 'application/json',
    });

    const command = commandOf(request);
    expect(command[0]).toBe('SET');
    expect(command[1]).toBe(`lead:${record.id}`);
    // No TTL argument: a stored lead does not expire.
    expect(command).toHaveLength(3);

    // 3. The lead is actually IN the value, not merely referenced by it.
    const stored: LeadRecord = JSON.parse(command[2] ?? '') as LeadRecord;
    expect(stored.id).toBe(record.id);
    expect(stored.payload.name).toBe('Test Visitor');
    expect(stored.payload.phone).toBe('000-0000000');
    expect(stored.payload.locale).toBe('he');
    expect(stored.receivedAt).toBe(record.receivedAt);
  });

  it('returns a transient failure when the transport rejects, and does not throw', async () => {
    const boom = new Error('network down');
    const recorder = recordingTransport(boom);

    const result = await sinkFor(CONFIGURED, recorder).store(testRecord());

    const failure = failureOf(result);
    expect(failure.kind).toBe('transient');
    expect(failure.kind === 'not_configured' ? undefined : failure.cause).toBe(boom);
    expect(recorder.calls).toHaveLength(1);
  });

  it('maps 4xx to permanent and 5xx to transient', async () => {
    const refused = recordingTransport({ status: 401, body: '{"error":"unauthorized"}' });
    expect(failureOf(await sinkFor(CONFIGURED, refused).store(testRecord())).kind).toBe('permanent');

    const broken = recordingTransport({ status: 503, body: 'service unavailable' });
    expect(failureOf(await sinkFor(CONFIGURED, broken).store(testRecord())).kind).toBe('transient');
  });

  it('maps 429 to transient, because it is the server asking for a retry', async () => {
    const limited = recordingTransport({ status: 429, body: '{"error":"rate limited"}' });

    expect(failureOf(await sinkFor(CONFIGURED, limited).store(testRecord())).kind).toBe('transient');
  });

  it('refuses to call a 200 carrying an error a stored lead', async () => {
    // The store's real way of saying no. A status-only check reports success.
    const recorder = recordingTransport({ status: 200, body: '{"error":"WRONGTYPE"}' });

    const failure = failureOf(await sinkFor(CONFIGURED, recorder).store(testRecord()));

    expect(failure.kind).toBe('permanent');
  });

  it('refuses to call an unacknowledged or unreadable 200 a stored lead', async () => {
    const unacknowledged = recordingTransport({ status: 200, body: '{"result":null}' });
    expect(failureOf(await sinkFor(CONFIGURED, unacknowledged).store(testRecord())).kind).toBe(
      'permanent',
    );

    const notJson = recordingTransport({ status: 200, body: '<html>proxy</html>' });
    expect(failureOf(await sinkFor(CONFIGURED, notJson).store(testRecord())).kind).toBe('transient');
  });

  it('reports the missing NAME when half configured, and sends nothing', async () => {
    const recorder = recordingTransport({ status: 200, body: '{"result":"OK"}' });
    const half: NodeJS.ProcessEnv = testEnv({ KV_REST_API_URL: FIXTURE_KV_URL });

    const result = await sinkFor(half, recorder).store(testRecord());

    const failure = failureOf(result);
    expect(failure.kind).toBe('not_configured');
    expect(failure.kind === 'not_configured' ? failure.missingEnvVars : []).toEqual([
      'KV_REST_API_TOKEN',
    ]);
    // Not "the transport was not called with X" — it was not called at all.
    expect(recorder.calls).toHaveLength(0);
  });

  it('resolves to null when neither variable is set', () => {
    const recorder = recordingTransport({ status: 200, body: '{"result":"OK"}' });

    expect(resolveKvSink(testEnv(), recorder.transport)).toBeNull();
    expect(
      resolveKvSink(testEnv({ KV_REST_API_URL: '   ', KV_REST_API_TOKEN: '' }), recorder.transport),
    ).toBeNull();
    expect(recorder.calls).toHaveLength(0);
  });

  it('declares exactly the two variable NAMES it reads', () => {
    expect(KV_ENV_VARS).toEqual(['KV_REST_API_URL', 'KV_REST_API_TOKEN']);
  });
});
