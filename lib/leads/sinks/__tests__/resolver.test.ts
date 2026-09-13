// ─────────────────────────────────────────────────────────────────────────────
// W9-B RESOLVER AND COMPOSITE TESTS — lib/leads/sinks/__tests__/resolver.test.ts
//
// INVARIANT     Which sink the resolver chose is asserted by WHAT WENT ON THE
//               WIRE — the url and body handed to a stubbed global `fetch`, i.e.
//               through the real default transport — never by reading
//               `sink.name`. A name is not a thing (Law 8); the bytes are.
//               `store()` is proved total: every environment in this file
//               returns a `LeadSink` and every call resolves to a union arm.
//
// IMPOSSIBLE    The regression this wave must not cause cannot pass this file: a
//               resolver that returns `null`, throws, or claims success on an
//               unconfigured deployment fails the first three tests, and the
//               unconfigured case asserts the fetch call count is ZERO — not
//               that it was called with the wrong thing. A composite that
//               reports success because nothing failed cannot be built at all
//               (non-empty tuple), and one that loses a good write to a bad
//               sibling fails the last two tests.
//
// CLASS         Derivation for sink SELECTION over every possible environment:
//               the environment is a parameter, so the four cases here are the
//               complete partition (neither / kv / webhook / both), not samples.
//
// HONEST LIMIT  `resolveLeadSink()` with NO argument reads `process.env`, and no
//               test here calls it that way — mutating the real environment to
//               prove a default is a worse trade than naming the gap. That one
//               line is NOT MEASURED. Nor does anything here prove a real store
//               or a real webhook accepts these bytes: `fetch` is stubbed, by
//               rule, and what the providers do with the request is documented,
//               not measured. And one more, the sharpest: that `resolveLeadSink`
//               APPLIES `asTotalLeadSink` is not provable from a real
//               environment, because NO adapter in this directory can throw —
//               `./kv` and `./webhook` await their transport inside a `try`,
//               `./unconfigured` returns a constant, `./composite` catches each
//               child. So the wrapper's BEHAVIOUR is measured here against a
//               synthetic sink that rejects, its APPLICATION is structural (one
//               exit in `../index`, and every test above still passes through
//               it), and the two are joined end-to-end in
//               `app/api/lead/__tests__/route.test.ts`, whose resolver stand-in
//               applies the real wrapper. The defect this closes is therefore a
//               LATENT one: the fifth adapter's, not today's.
// ─────────────────────────────────────────────────────────────────────────────

import type { LeadSink, LeadStoreResult } from '../../port';
import type { LeadRecord } from '../../types';
import { LEAD_OUTCOME, outcomeForStoreFailure } from '../../log';
import { createCompositeLeadSink } from '../composite';
import { asTotalLeadSink, resolveLeadSink } from '../index';

import {
  failureOf,
  FIXTURE_KV_TOKEN,
  FIXTURE_KV_URL,
  FIXTURE_WEBHOOK_URL,
  testEnv,
  testRecord,
} from './fixtures';

const KV_ONLY: NodeJS.ProcessEnv = testEnv({
  KV_REST_API_URL: FIXTURE_KV_URL,
  KV_REST_API_TOKEN: FIXTURE_KV_TOKEN,
});
const WEBHOOK_ONLY: NodeJS.ProcessEnv = testEnv({ LEAD_WEBHOOK_URL: FIXTURE_WEBHOOK_URL });
const BOTH: NodeJS.ProcessEnv = { ...KV_ONLY, ...WEBHOOK_ONLY };

type FetchCall = { readonly url: string; readonly body: string };

/**
 * Replace the global `fetch` with a recorder. This is the REAL default transport
 * path — the adapters are resolved without an injected transport — so the
 * requests captured here are the ones the deployed code would send, and the
 * count is the count of network calls that would have happened.
 */
function stubFetch(reply: (url: string) => { status: number; body: string }): FetchCall[] {
  const calls: FetchCall[] = [];
  vi.stubGlobal('fetch', (url: string, init: { body: string }) => {
    calls.push({ url, body: init.body });
    const { status, body } = reply(url);
    return Promise.resolve({ status, text: () => Promise.resolve(body) });
  });
  return calls;
}

const OK = () => ({ status: 200, body: '{"result":"OK"}' });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resolveLeadSink', () => {
  it('returns a sink that stores nothing and names every variable when nothing is configured', async () => {
    const calls = stubFetch(OK);

    const sink = resolveLeadSink(testEnv());
    expect(sink).not.toBeNull();

    const result = await sink.store(testRecord());

    const failure = failureOf(result);
    expect(failure.kind).toBe('not_configured');
    expect(failure.kind === 'not_configured' ? failure.missingEnvVars : []).toEqual([
      'KV_REST_API_URL',
      'KV_REST_API_TOKEN',
      'LEAD_WEBHOOK_URL',
    ]);
    // Nothing stored, nothing claimed, and NOTHING SENT.
    expect(calls).toHaveLength(0);
  });

  it('sends the SET command and nothing else when only the key-value store is configured', async () => {
    const calls = stubFetch(OK);
    const record = testRecord();

    const result = await resolveLeadSink(KV_ONLY).store(record);

    expect(result).toEqual({ stored: true, id: record.id });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(FIXTURE_KV_URL);
    expect(calls[0]?.body ?? '').toContain(`"lead:${record.id}"`);
  });

  it('sends the flat payload and nothing else when only the webhook is configured', async () => {
    const calls = stubFetch(() => ({ status: 200, body: 'OK' }));
    const record = testRecord();

    const result = await resolveLeadSink(WEBHOOK_ONLY).store(record);

    expect(result).toEqual({ stored: true, id: record.id });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(FIXTURE_WEBHOOK_URL);
    expect(JSON.parse(calls[0]?.body ?? '')).toMatchObject({ id: record.id, name: 'Test Visitor' });
  });

  it('writes to BOTH when both are configured — the documented decision', async () => {
    const calls = stubFetch((url) =>
      url === FIXTURE_KV_URL ? OK() : { status: 200, body: 'OK' },
    );
    const record = testRecord();

    const result = await resolveLeadSink(BOTH).store(record);

    expect(result).toEqual({ stored: true, id: record.id });
    expect(calls).toHaveLength(2);
    expect(calls.map((call) => call.url).sort()).toEqual(
      [FIXTURE_KV_URL, FIXTURE_WEBHOOK_URL].sort(),
    );
  });

  it('still stores the lead when one of the two sinks is down, and logs which', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    stubFetch((url) => (url === FIXTURE_KV_URL ? OK() : { status: 500, body: 'down' }));
    const record = testRecord();

    const result = await resolveLeadSink(BOTH).store(record);

    expect(result).toEqual({ stored: true, id: record.id });
    expect(warn).toHaveBeenCalledTimes(1);
    const logged = String(warn.mock.calls[0]?.[0] ?? '');
    expect(logged).toContain('webhook');
    expect(logged).toContain(record.id);
    expect(logged).toContain('transient');
    expect(logged).not.toContain('example.invalid');
  });

  it('fails transient only when BOTH sinks fail', async () => {
    stubFetch(() => ({ status: 503, body: 'down' }));

    const failure = failureOf(await resolveLeadSink(BOTH).store(testRecord()));

    expect(failure.kind).toBe('transient');
  });
});

/* ── The composite's merge rules, against synthetic sinks ─────────────────── */

function fakeSink(name: string, outcome: LeadStoreResult | Error): LeadSink {
  return {
    name,
    store: (): Promise<LeadStoreResult> =>
      outcome instanceof Error ? Promise.reject(outcome) : Promise.resolve(outcome),
  };
}

function storedBy(record: LeadRecord): LeadStoreResult {
  return { stored: true, id: record.id };
}

describe('createCompositeLeadSink', () => {
  it('keeps a good write when a sibling THROWS instead of returning a failure', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const record = testRecord();
    const sink = createCompositeLeadSink([
      fakeSink('good', storedBy(record)),
      fakeSink('buggy', new Error('adapter bug')),
    ]);

    const result = await sink.store(record);

    expect(result).toEqual({ stored: true, id: record.id });
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('does not reject when every member throws — it returns transient', async () => {
    const sink = createCompositeLeadSink([fakeSink('buggy', new Error('adapter bug'))]);

    const failure = failureOf(await sink.store(testRecord()));

    expect(failure.kind).toBe('transient');
  });

  it('prefers transient over permanent — a retry could still land somewhere', async () => {
    const sink = createCompositeLeadSink([
      fakeSink('a', { stored: false, failure: { kind: 'permanent', detail: 'a refused' } }),
      fakeSink('b', { stored: false, failure: { kind: 'transient', detail: 'b flapped' } }),
    ]);

    const failure = failureOf(await sink.store(testRecord()));

    expect(failure.kind).toBe('transient');
    expect(failure.detail).toContain('a refused');
    expect(failure.detail).toContain('b flapped');
  });

  it('merges the missing NAMES when every member is unconfigured', async () => {
    const sink = createCompositeLeadSink([
      fakeSink('a', {
        stored: false,
        failure: { kind: 'not_configured', missingEnvVars: ['ONE', 'TWO'], detail: 'a' },
      }),
      fakeSink('b', {
        stored: false,
        failure: { kind: 'not_configured', missingEnvVars: ['TWO', 'THREE'], detail: 'b' },
      }),
    ]);

    const failure = failureOf(await sink.store(testRecord()));

    expect(failure.kind).toBe('not_configured');
    expect(failure.kind === 'not_configured' ? failure.missingEnvVars : []).toEqual([
      'ONE',
      'TWO',
      'THREE',
    ]);
  });
});

/* ── The resolver's TOTALITY, against a sink that breaks its contract ──────── */

describe('asTotalLeadSink', () => {
  it('turns a rejection into a transient failure a caller can branch on', async () => {
    const bug = new Error('adapter bug');
    const record = testRecord();

    const result = await asTotalLeadSink(fakeSink('broken', bug)).store(record);

    // The union arm is what a caller reads. An unhandled rejection here fails
    // the test by rejecting this `await`, not by an assertion.
    const failure = failureOf(result);
    expect(failure.kind).toBe('transient');
    expect(failure.kind === 'transient' ? failure.cause : undefined).toBe(bug);
  });

  it('is countable: the transient it produces is the funnel outcome for a lost lead', () => {
    // Not an assertion that a catch block exists — the kind that actually came
    // out of the wrapper above is fed to the real mapping the route uses, and
    // the outcome it lands on is one the tally table marks as NEVER STORED.
    expect(outcomeForStoreFailure('transient')).toBe(LEAD_OUTCOME.lostTransient);
  });

  it('changes nothing about a sink that keeps the contract', async () => {
    const record = testRecord();

    const good = await asTotalLeadSink(fakeSink('good', storedBy(record))).store(record);
    expect(good.stored === true ? good.id : null).toBe(record.id);

    const bad = await asTotalLeadSink(
      fakeSink('bad', {
        stored: false,
        failure: { kind: 'permanent', detail: 'rejected by the store' },
      }),
    ).store(record);

    // A `permanent` is NOT rewritten into a `transient`: the wrapper only has an
    // opinion about a contract violation, never about a failure the adapter
    // understood well enough to return.
    const failure = failureOf(bad);
    expect(failure.kind).toBe('permanent');
    expect(failure.detail).toBe('rejected by the store');
  });

  it('cannot claim a lead was stored, whatever the sink did', async () => {
    const record = testRecord();
    const outcomes = [
      new Error('adapter bug'),
      { stored: false, failure: { kind: 'transient', detail: 'timed out' } },
      { stored: false, failure: { kind: 'not_configured', missingEnvVars: ['X'], detail: 'x' } },
    ] as const;

    for (const outcome of outcomes) {
      const result = await asTotalLeadSink(fakeSink('any', outcome)).store(record);
      expect(result.stored).toBe(false);
    }
  });
});
