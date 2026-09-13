// ─────────────────────────────────────────────────────────────────────────────
// W9-B HTTP BOUNDARY TESTS — lib/leads/sinks/__tests__/http.test.ts
//
// INVARIANT     `classifyHttpStatus` is asserted as a TABLE — every status class
//               the sinks can meet, mapped to the caller action it implies —
//               and `createFetchTransport` is asserted on what it HANDS to the
//               `fetch` it was given and what it returns from the reply.
//
// IMPOSSIBLE    A transport that drops the body, swaps the method, or invents a
//               status cannot pass: all four request fields and both response
//               fields are compared against the values supplied. And the
//               deliberate 408/425/429 carve-out cannot be silently flattened
//               into "4xx is permanent" — three named cases assert it.
//
// CLASS         Derivation for every HTTP sink in this directory: this is the
//               one place the status policy is proved, so no adapter test has to
//               re-prove it and no adapter can quietly hold a different one.
//
// HONEST LIMIT  The `fetch` here is supplied by the test. Nothing proves the
//               platform's real `fetch` honours these arguments, that
//               `AbortSignal.timeout` actually aborts, or that a timeout surfaces
//               as a rejection rather than a hang — all three need a real
//               network call, which this wave forbids. NOT MEASURED, not passed.
// ─────────────────────────────────────────────────────────────────────────────

import {
  classifyHttpStatus,
  createFetchTransport,
  LEAD_HTTP_TIMEOUT_MS,
  type LeadFetch,
} from '../http';

describe('classifyHttpStatus', () => {
  it('treats 2xx as ok', () => {
    expect([200, 201, 202, 204, 299].map(classifyHttpStatus)).toEqual([
      'ok',
      'ok',
      'ok',
      'ok',
      'ok',
    ]);
  });

  it('treats 5xx as transient — the provider is broken, the lead is not', () => {
    expect([500, 502, 503, 504].map(classifyHttpStatus)).toEqual([
      'transient',
      'transient',
      'transient',
      'transient',
    ]);
  });

  it('treats the three retry-me 4xx codes as transient', () => {
    expect([408, 425, 429].map(classifyHttpStatus)).toEqual([
      'transient',
      'transient',
      'transient',
    ]);
  });

  it('treats every other 4xx as permanent', () => {
    expect([400, 401, 403, 404, 413, 422].map(classifyHttpStatus)).toEqual([
      'permanent',
      'permanent',
      'permanent',
      'permanent',
      'permanent',
      'permanent',
    ]);
  });

  it('treats anything that is not a reply from an API as permanent', () => {
    expect([100, 302, 0].map(classifyHttpStatus)).toEqual(['permanent', 'permanent', 'permanent']);
  });
});

describe('createFetchTransport', () => {
  it('hands the request through unchanged and returns the status and body', async () => {
    const seen: Array<{ url: string; method: string; headers: Readonly<Record<string, string>>; body: string; signal: AbortSignal }> = [];
    const fakeFetch: LeadFetch = (url, init) => {
      seen.push({ url, method: init.method, headers: init.headers, body: init.body, signal: init.signal });
      return Promise.resolve({ status: 202, text: () => Promise.resolve('accepted') });
    };

    const response = await createFetchTransport(fakeFetch)({
      url: 'https://sink.example.invalid/path',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Test': 'yes' },
      body: '{"a":1}',
    });

    expect(response).toEqual({ status: 202, body: 'accepted' });
    expect(seen).toHaveLength(1);
    const call = seen[0] ?? null;
    expect(call?.url).toBe('https://sink.example.invalid/path');
    expect(call?.method).toBe('POST');
    expect(call?.headers).toEqual({ 'Content-Type': 'application/json', 'X-Test': 'yes' });
    expect(call?.body).toBe('{"a":1}');
    expect(call?.signal).toBeInstanceOf(AbortSignal);
    expect(LEAD_HTTP_TIMEOUT_MS).toBeGreaterThan(0);
  });

  it('does not swallow a rejection — the adapter decides what a failure means', async () => {
    const boom = new Error('dns');
    const failing: LeadFetch = () => Promise.reject(boom);

    await expect(
      createFetchTransport(failing)({
        url: 'https://sink.example.invalid/',
        method: 'POST',
        headers: {},
        body: '',
      }),
    ).rejects.toBe(boom);
  });
});
