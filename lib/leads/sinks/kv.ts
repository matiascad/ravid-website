// ─────────────────────────────────────────────────────────────────────────────
// W9-B MANAGED KEY-VALUE LEAD SINK — lib/leads/sinks/kv.ts
//
// The durable sink. A lead is written to a managed Redis-compatible store
// (Vercel KV / Upstash) over its REST API, under the key `lead:<id>`, with NO
// expiry, before anybody is emailed. That write is what makes a bereaved
// brother's booking enquiry recoverable when Resend is down, when the sending
// domain is unverified, or when Gmail files the notification as spam — the three
// ways today's only sink loses a lead silently.
//
// NO CLIENT LIBRARY IS INSTALLED AND THIS FILE DOES NOT ADD ONE. `@vercel/kv`,
// `@upstash/redis` and `pg` are all absent from `package.json`, and a dependency
// added at 4am that nobody reviewed is not a win. The store's REST API is
// documented, stable, and reachable with one POST, so this adapter speaks it
// directly through `./http` — which is the honest option, not a workaround.
//
// CONFIGURATION — NAMES ONLY, NEVER VALUES:
//   KV_REST_API_URL    the REST endpoint of the store
//   KV_REST_API_TOKEN  the bearer token for it
// These are the two names the Vercel KV / Upstash marketplace integration
// injects into a Vercel project, so an operator who attaches a store is already
// configured and has nothing to copy by hand. A store reached under the Upstash
// -native names (`UPSTASH_REDIS_REST_URL` / `..._TOKEN`) is configured by adding
// these two names as aliases in the project's environment; this file names two
// variables, not four, because two names that must agree are a drift bug waiting
// to happen.
//
// THE REQUEST, exactly:
//   POST <KV_REST_API_URL>
//   Authorization: Bearer <KV_REST_API_TOKEN>
//   Content-Type: application/json
//   ["SET","lead:<id>","<the record as JSON>"]
// The command goes in the BODY, never in the path, so no part of an enquiry —
// not even its id — lands in a provider's URL access log. No `EX`, no `PX`, no
// `KEEPTTL`: a stored lead has no expiry and there is no argument here that
// could give it one. The key's `lead:` prefix plus a ULID id means
// `SCAN 0 MATCH lead:*` returns them and a lexicographic sort of that list is
// arrival order, with no second index to keep up to date.
//
// INVARIANT     This adapter returns `{ stored: true }` for exactly one
//               observable event: a transport response whose status is 2xx AND
//               whose body parses as JSON AND whose `result` is the string the
//               store returns for an accepted write (`OK`). Anything else —
//               rejection, 4xx, 5xx, an unparseable body, a body carrying
//               `error`, a body carrying some other `result` — is a
//               `{ stored: false, failure }` naming one of the three actionable
//               kinds. The id it echoes on success is `record.id`, the one it
//               serialised into the body it sent; it mints nothing.
//
// IMPOSSIBLE    "Accepted but unstored" can no longer be CONSTRUCTED here in the
//               way the store actually produces it: this API answers a refused
//               command with HTTP 200 and `{"error":"..."}`, so a status-only
//               check — the reflex one — reports a stored lead that does not
//               exist. `LeadHttpResponse.body` is required, so that check cannot
//               be written without the body in scope, and the body is read.
//               Also out of reach by construction:
//                 · a success value carrying an id this adapter invented —
//                   `newLeadId` is not imported, so there is no expression in
//                   this file that can mint one, and the same enquiry cannot
//                   become two leads across two sinks;
//                 · a lead written with a TTL — no expiry argument is assembled;
//                 · a half-configured store that silently does nothing: one of
//                   the two variables set and the other not returns a sink that
//                   REPORTS the missing name, rather than `null`, which would
//                   make a typo in one variable look exactly like a deployment
//                   that never wanted a key-value store at all;
//                 · a secret in a log or a failure `detail` — this file writes
//                   no log line, and every `detail` it builds is a fixed string
//                   plus a status number. The token appears in exactly one
//                   expression, the `Authorization` header of the request it
//                   returns to the transport.
//
// CLASS         THIS INSTANCE for the wire format: `["SET", key, value]` and
//               `{"result":"OK"}` are this provider's REST protocol, and a
//               different provider is a different file. The DERIVATION is the
//               shape around it — configuration resolved from env NAMES the
//               module owns, transport injected, failure returned as one of
//               three kinds, success echoing `record.id` — which is the same in
//               every sink in this directory and is enforced by `LeadSink`.
//
// HONEST LIMIT  A 2xx plus `{"result":"OK"}` is the store's ACKNOWLEDGEMENT, not
//               a proof of durability. Nothing here reads the lead back, so a
//               store that acknowledges and loses (a replica that never
//               persisted, an eviction policy set on the database itself) is
//               indistinguishable from one that worked — `port.ts`'s "a type
//               cannot reach a disk", one layer further down. Five further
//               limits, deliberately:
//               (1) NO READ SIDE. This writes. Recovering a lead is an operator
//               opening the store's console and running `SCAN`/`GET`; there is
//               no code in this repository that lists stored leads.
//               (2) NO IDEMPOTENCY GUARD, but also no duplication risk from a
//               retry: the key is derived from the record id, so re-storing the
//               same record overwrites the same key. A DOUBLE-SUBMITTED FORM is
//               still two records with two ids and therefore two keys — that is
//               `port.ts` HONEST LIMIT 4 and it is unchanged here.
//               (3) The 8s transport timeout is the default transport's, so on a
//               slow store this adapter reports `transient` and the route's
//               request has already spent 8 seconds. No adapter-level budget.
//               (4) `JSON.stringify(record)` is the stored value, which means
//               the stored shape follows `LeadRecord` — adding a field to that
//               type changes what is written, silently and immediately. That is
//               correct for a truth store (it is the record) and wrong for a
//               contract (see `./webhook`, which pins its shape on purpose).
//               (5) An unparseable 2xx body is `transient`, which is a judgement
//               call: it usually means a proxy or a captive portal answered, not
//               the store. It is safe to call transient because a retry of the
//               same `SET` on the same key cannot duplicate anything.
// ─────────────────────────────────────────────────────────────────────────────

import type { LeadSink, LeadStoreResult } from '../port';
import type { LeadRecord } from '../types';

import {
  classifyHttpStatus,
  createFetchTransport,
  type LeadHttpResponse,
  type LeadHttpTransport,
} from './http';
import { createUnconfiguredLeadSink } from './unconfigured';

/* ── Configuration: NAMES, never values ───────────────────────────────────── */

const KV_URL_ENV_VAR = 'KV_REST_API_URL';
const KV_TOKEN_ENV_VAR = 'KV_REST_API_TOKEN';

/**
 * Everything this adapter reads from the environment, in one place, so the
 * resolver can report the set without restating it. Names only.
 */
export const KV_ENV_VARS: readonly string[] = [KV_URL_ENV_VAR, KV_TOKEN_ENV_VAR];

/** Operator-facing label for logs. Nothing branches on it (`port.ts` limit 5). */
export const KV_SINK_NAME = 'kv';

/** The key prefix. A ULID id after it sorts by arrival; see the header. */
const KEY_PREFIX = 'lead:';

/** What this REST API returns in `result` for an accepted `SET`. */
const ACKNOWLEDGEMENT = 'OK';

/**
 * A value is configured only if it is non-empty after trimming — the same rule
 * `app/api/lead/route.ts` applies to its own variables, because a variable set
 * to a space is a variable someone meant to set and did not.
 */
function read(env: NodeJS.ProcessEnv, name: string): string {
  return (env[name] ?? '').trim();
}

/* ── The adapter ──────────────────────────────────────────────────────────── */

/**
 * Did the store ACCEPT the write? Reads the body, because this API says no with
 * a 200. Returns the reason it did not, so the caller can put it in `detail`.
 */
function acknowledged(body: string): { ok: true } | { ok: false; why: string; retry: boolean } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    // Not this API's output at all. Something else answered. See limit 5.
    return { ok: false, why: 'response was not JSON', retry: true };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, why: 'response was not a JSON object', retry: true };
  }
  const envelope: { readonly result?: unknown; readonly error?: unknown } = parsed;
  if (typeof envelope.error === 'string') {
    // The store understood and refused. The same command refuses the same way.
    return { ok: false, why: 'store refused the command', retry: false };
  }
  if (envelope.result !== ACKNOWLEDGEMENT) {
    return { ok: false, why: 'store did not acknowledge the write', retry: false };
  }
  return { ok: true };
}

/**
 * Build the sink. `url` and `token` are already known non-empty; this function
 * cannot be reached with a missing one, because `resolveKvSink` is the only
 * caller and it checks first.
 */
function createKvLeadSink(url: string, token: string, transport: LeadHttpTransport): LeadSink {
  return {
    name: KV_SINK_NAME,

    async store(record: LeadRecord): Promise<LeadStoreResult> {
      const request = {
        url,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', `${KEY_PREFIX}${record.id}`, JSON.stringify(record)]),
      } as const;

      let response: LeadHttpResponse;
      try {
        response = await transport(request);
      } catch (cause) {
        // Timeout, DNS, reset, abort. The lead is not stored and might be next
        // time. Returned as data: `store` never throws for an expected failure.
        return {
          stored: false,
          failure: {
            kind: 'transient',
            detail: `${KV_SINK_NAME}: request to the key-value store failed`,
            cause,
          },
        };
      }

      const classification = classifyHttpStatus(response.status);
      if (classification !== 'ok') {
        return {
          stored: false,
          failure: {
            kind: classification,
            detail: `${KV_SINK_NAME}: key-value store answered HTTP ${response.status}`,
          },
        };
      }

      const acknowledgement = acknowledged(response.body);
      if (acknowledgement.ok === false) {
        return {
          stored: false,
          failure: {
            kind: acknowledgement.retry ? 'transient' : 'permanent',
            detail: `${KV_SINK_NAME}: ${acknowledgement.why}`,
          },
        };
      }

      // The id that was written is the id that is echoed. Not minted here.
      return { stored: true, id: record.id };
    },
  };
}

/**
 * Resolve the key-value sink from the environment.
 *
 * Three outcomes, and the middle one is the point:
 *   · NEITHER variable set -> `null`: this deployment did not ask for a
 *     key-value store, and the resolver will look elsewhere.
 *   · ONE of them set      -> a sink that fails `not_configured` NAMING the
 *     missing one. A typo in a token must not be indistinguishable from "no
 *     store wanted"; that is how a deployment silently stores nothing.
 *   · BOTH set             -> the adapter.
 */
export function resolveKvSink(
  env: NodeJS.ProcessEnv,
  transport: LeadHttpTransport = createFetchTransport(),
): LeadSink | null {
  const url = read(env, KV_URL_ENV_VAR);
  const token = read(env, KV_TOKEN_ENV_VAR);

  if (url === '' && token === '') {
    return null;
  }

  const missing = [
    ...(url === '' ? [KV_URL_ENV_VAR] : []),
    ...(token === '' ? [KV_TOKEN_ENV_VAR] : []),
  ];
  if (missing.length > 0) {
    return createUnconfiguredLeadSink(
      KV_SINK_NAME,
      missing,
      `${KV_SINK_NAME}: partially configured; unset environment variables: ${missing.join(', ')}`,
    );
  }

  return createKvLeadSink(url, token, transport);
}
