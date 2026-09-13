// ─────────────────────────────────────────────────────────────────────────────
// W9-B TEST FIXTURES — lib/leads/sinks/__tests__/fixtures.ts
//
// Not a test file (the harness collects `*.test.ts` only) — the two things every
// sink test in this directory needs, stated once.
//
// THE RECORDING TRANSPORT IS THE POINT. This project's Law 8 was earned by a
// green suite over an invisible button: a name asserted, an effect unmeasured.
// The same mistake in a sink test is `expect(transport).toHaveBeenCalled()` —
// true of an adapter that POSTs an empty body to the wrong host. So the fake
// here does not count calls, it KEEPS them: url, method, headers and body, as
// data, for the test to assert on. An adapter that returns `{ stored: true }`
// having assembled nothing leaves `calls` empty and every byte assertion fails.
//
// INVARIANT     `recordingTransport` performs no I/O and imports nothing that
//               can: it appends the request it was handed to an array the test
//               owns, then resolves the outcome the test chose, or rejects with
//               the error the test chose. Every fixture value here is
//               obviously-fake — `example.invalid` hosts, a token that says it
//               is not one — so no secret and no real address can be copied out
//               of this file.
//
// IMPOSSIBLE    A test in this directory that reaches the real network cannot be
//               written by accident: adapters take a transport, and this is the
//               transport they are given. A test that asserts only "it was
//               called" is still possible to WRITE — nothing here forbids a weak
//               assertion — but the recorded request makes the strong one no
//               harder, which is the only reliable way to get it written.
//
// CLASS         Derivation for every sink test in this directory, present and
//               future: one fake, one fixture record, one place to change when
//               `LeadRecord` changes. A new sink's test imports these two
//               functions rather than inventing a third convention.
//
// HONEST LIMIT  The fixture record is ONE record — one locale, one fully-filled
//               payload — so no test here proves behaviour across locales or
//               across the empty-optional shape unless it passes an override.
//               And `recordingTransport` answers every request identically: a
//               test that needs the second call to differ from the first cannot
//               express it with this fake. Both are deliberate: the sinks under
//               test send one request and do not branch on the payload.
// ─────────────────────────────────────────────────────────────────────────────

import type { Lead } from '@/lib/validation';

import type { LeadSinkFailure, LeadStoreResult } from '../../port';
import { createLeadRecord, type LeadRecord } from '../../types';
import type { LeadHttpRequest, LeadHttpResponse, LeadHttpTransport } from '../http';

/** Pinned clock, so `receivedAt` and the id's timestamp half are deterministic. */
export const FIXTURE_NOW = new Date('2026-09-13T04:05:06.000Z');

/** Obviously fake. Not a real endpoint, not a real credential. */
export const FIXTURE_KV_URL = 'https://kv.example.invalid/';
export const FIXTURE_KV_TOKEN = 'not-a-real-token';
export const FIXTURE_WEBHOOK_URL = 'https://hooks.example.invalid/lead-sheet';

/**
 * An environment object the compiler accepts.
 *
 * `next-env.d.ts` augments `NodeJS.ProcessEnv` with a REQUIRED `NODE_ENV`, so a
 * bare `{}` is not a `ProcessEnv` — measured, not assumed (13 captured
 * TS2741/TS2345 errors before this helper existed). `NODE_ENV` is written LAST
 * so it keeps its literal type; overrides supply everything the test cares about.
 */
export function testEnv(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return { ...overrides, NODE_ENV: 'test' };
}

/** One complete enquiry. Override any field to test a different shape. */
export function testRecord(overrides: Partial<Lead> = {}): LeadRecord {
  const payload: Lead = {
    name: 'Test Visitor',
    phone: '000-0000000',
    email: 'visitor@example.invalid',
    organization: 'Example Community Centre',
    message: 'First line\nsecond line',
    locale: 'he',
  };
  return createLeadRecord({ ...payload, ...overrides }, 'web_form', FIXTURE_NOW);
}

/** A transport and the requests it was handed. The requests are the evidence. */
export type Recorder = {
  readonly calls: LeadHttpRequest[];
  readonly transport: LeadHttpTransport;
};

/**
 * A fake transport that RECORDS. `outcome` is what every call resolves to, or an
 * `Error` that every call rejects with (the timeout / DNS / reset case).
 */
export function recordingTransport(outcome: LeadHttpResponse | Error): Recorder {
  const calls: LeadHttpRequest[] = [];
  return {
    calls,
    transport: (request: LeadHttpRequest) => {
      calls.push(request);
      return outcome instanceof Error ? Promise.reject(outcome) : Promise.resolve(outcome);
    },
  };
}

/**
 * Narrow a result to its failure, LOUDLY. A test that expected a failure and got
 * a success does not quietly skip its assertions — it throws with the id that
 * was claimed, which is the fact worth seeing.
 */
export function failureOf(result: LeadStoreResult): LeadSinkFailure {
  if (result.stored) {
    throw new Error(`expected a failure, but the sink claimed to store ${result.id}`);
  }
  return result.failure;
}

/** The `["SET", key, value]` array an adapter put on the wire, as data. */
export function commandOf(request: LeadHttpRequest): readonly string[] {
  const parsed: unknown = JSON.parse(request.body);
  return Array.isArray(parsed) ? (parsed as readonly string[]) : [];
}
