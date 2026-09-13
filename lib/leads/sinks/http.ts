// ─────────────────────────────────────────────────────────────────────────────
// W9-B LEAD SINK HTTP BOUNDARY — lib/leads/sinks/http.ts
//
// Both sinks in this directory are HTTP sinks: a managed key-value store reached
// over its REST API, and an operator-supplied webhook. Neither may install a
// client library (`package.json` carries clsx, next, next-intl, react,
// react-dom, tailwind-merge, zod and nothing else), so both speak the platform's
// `fetch`. This file is the ONE place that touches it.
//
// It exists for a second reason, and that reason is Law 8. "The adapter called
// the transport" is an assertion about a NAME; it is true of an adapter that
// sends an empty body to the wrong URL. So the transport here is not a mock
// target — it is a function from REQUEST DATA to RESPONSE DATA, both of them
// plain serialisable values. A test substitutes one that RECORDS what it was
// handed, and then asserts on the recorded URL, method, headers and body — the
// bytes that would have gone out. An adapter that returns `{ stored: true }`
// having assembled nothing fails those assertions, because there is nothing
// recorded to assert about.
//
// INVARIANT     Exactly one expression in `lib/leads/sinks/**` names the global
//               `fetch`: the default argument of `createFetchTransport`. Every
//               other module in this directory reaches the network only through
//               a `LeadHttpTransport`, which is a plain function value it is
//               GIVEN. A `LeadHttpRequest` is fully-formed bytes — a string url,
//               the literal method `'POST'`, a string->string header map and a
//               string body — and a `LeadHttpResponse` is a status and a body
//               string. Nothing in this boundary is a `Response`, a stream, or
//               anything else a test would have to construct a browser object to
//               fake.
//
// IMPOSSIBLE    A test in this directory that reaches the real network can no
//               longer be written by ACCIDENT. An adapter has no importable path
//               to `fetch`; it has a parameter. A test that forgets to pass a
//               transport gets the default one, whose first act is to call a
//               global the test can stub and count — which is how the
//               "unconfigured never sends" proof counts to zero at the real
//               boundary rather than at a convenient stand-in. Also out of reach
//               by construction:
//                 · a request with a method other than POST — the field's type
//                   is the literal `'POST'`, there is no other value to give it;
//                 · a partially-assembled request — every field of
//                   `LeadHttpRequest` is required, so "send it and fill in the
//                   body later" is a compile error;
//                 · an adapter that reads a response BODY it never received:
//                   `body` is required on the response too, so a fake that
//                   returns only a status does not type-check, and a status-only
//                   success check cannot be written against a type that forces
//                   the body into scope.
//
// CLASS         Derivation for every HTTP lead sink, present and future: any
//               adapter added to this directory takes a `LeadHttpTransport` and
//               is therefore testable on its BYTES on the day it is written,
//               with no per-adapter decision about how to fake the network and
//               no second stubbing convention to learn. `classifyHttpStatus` is
//               the same closure for status mapping: retry policy is decided
//               once, here, and an adapter that wants a different mapping has to
//               say so in its own file rather than invent one silently.
//
// HONEST LIMIT  This file cannot prove that the bytes LEFT THE PROCESS. It is a
//               function boundary, not a packet capture; everything below the
//               default transport's single `fetchImpl(...)` call — DNS, TLS,
//               proxies, the platform's own retries — is unobserved here and is
//               covered by no test in this repository, because covering it would
//               require a real network call and this wave forbids one. Four
//               further limits, deliberately:
//               (1) NO RETRY AND NO BACKOFF. `classifyHttpStatus` says whether a
//               retry COULD help; nobody here retries. That policy is the
//               route's and it is not this delegate's to invent (`port.ts`
//               HONEST LIMIT 1 says the same).
//               (2) The timeout is a DEFAULT TRANSPORT feature, not a boundary
//               feature. A substituted transport that hangs forever hangs
//               forever, and `LEAD_HTTP_TIMEOUT_MS` is a guess at a serverless
//               budget — 8s — not a measured figure from this deployment.
//               (3) `AbortSignal.timeout` and the real global `fetch` are the
//               two things `createFetchTransport`'s own test cannot exercise: it
//               proves the ADAPTATION (url, method, headers, body pass through;
//               status and body come back) against an injected `fetchImpl`, and
//               says nothing about the platform's implementation of either.
//               (4) Headers are `Record<string, string>` — a map, so a repeated
//               header name is unrepresentable. No lead sink needs one, and
//               losing the ability to send two `Set-Cookie`-shaped headers is a
//               trade this file makes knowingly.
// ─────────────────────────────────────────────────────────────────────────────

/* ── The boundary ─────────────────────────────────────────────────────────── */

/**
 * One outbound request, as DATA. Every field required, so a half-built request
 * does not type-check, and every field a string, so a test asserts on bytes.
 */
export type LeadHttpRequest = {
  readonly url: string;
  /** Literal, not `string`: a lead sink writes, and a write is a POST. */
  readonly method: 'POST';
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
};

/**
 * One inbound response, as DATA.
 *
 * `body` is REQUIRED and is deliberately not optional: a managed key-value store
 * reports a refused command as a 200 whose body says `error`, so an adapter that
 * checked only the status would call that a stored lead. Forcing the body into
 * the type forces the adapter to have an opinion about it.
 */
export type LeadHttpResponse = {
  readonly status: number;
  readonly body: string;
};

/**
 * The whole network, as one function value. Adapters are GIVEN one; they never
 * reach for one.
 */
export type LeadHttpTransport = (request: LeadHttpRequest) => Promise<LeadHttpResponse>;

/* ── Status policy ────────────────────────────────────────────────────────── */

/**
 * What a status code means for the CALLER's next action — the only question the
 * three `LeadFailureKind`s can answer.
 *
 *   2xx            -> `ok`. The adapter still has to read the body; a 2xx is
 *                     permission to look, not proof of a write.
 *   408, 425, 429  -> `transient`. All three are the server explicitly saying
 *                     "not now, try again": request timeout, too-early replay,
 *                     rate limit. Mapping them to `permanent` because they are
 *                     4xx would discard the one instruction they carry.
 *   other 4xx      -> `permanent`. A refused, malformed or unauthorised request
 *                     is refused identically next time; retrying hides the
 *                     fault and spends the budget.
 *   5xx            -> `transient`. The provider is broken, the input is not.
 *   anything else  -> `permanent`. A 1xx or an unfollowed 3xx reaching this code
 *                     means the endpoint is not the API it was configured to be,
 *                     which a retry does not change.
 */
export function classifyHttpStatus(status: number): 'ok' | 'transient' | 'permanent' {
  if (status >= 200 && status <= 299) {
    return 'ok';
  }
  if (status === 408 || status === 425 || status === 429) {
    return 'transient';
  }
  if (status >= 500 && status <= 599) {
    return 'transient';
  }
  return 'permanent';
}

/* ── The one real transport ───────────────────────────────────────────────── */

/**
 * How long a lead sink may hold a serverless request open. A guess at a budget,
 * not a measurement — see HONEST LIMIT 2.
 */
export const LEAD_HTTP_TIMEOUT_MS = 8_000;

/**
 * The shape of `fetch` this file actually uses — three arguments in, a status
 * and a text body out. Narrower than the platform type on purpose: it is what a
 * test can supply without building a `Response`, and the global `fetch` is
 * assignable to it.
 */
export type LeadFetch = (
  url: string,
  init: {
    readonly method: string;
    readonly headers: Readonly<Record<string, string>>;
    readonly body: string;
    readonly signal: AbortSignal;
  },
) => Promise<{ readonly status: number; text(): Promise<string> }>;

/**
 * THE transport. The only function in this directory that can reach a network.
 *
 * It does not catch: a rejection — timeout, DNS failure, connection reset —
 * propagates to the adapter, which is the only place that knows a failed send is
 * `transient` DATA rather than an exception. Catching here would flatten a
 * network fault into a fabricated status code and lose the cause.
 */
export function createFetchTransport(fetchImpl: LeadFetch = globalThis.fetch): LeadHttpTransport {
  return async (request: LeadHttpRequest): Promise<LeadHttpResponse> => {
    const response = await fetchImpl(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      signal: AbortSignal.timeout(LEAD_HTTP_TIMEOUT_MS),
    });
    return { status: response.status, body: await response.text() };
  };
}
