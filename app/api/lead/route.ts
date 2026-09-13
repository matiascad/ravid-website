// ─────────────────────────────────────────────────────────────────────────────
// W9-C LEAD ENDPOINT — app/api/lead/route.ts
//
// PERSIST THEN NOTIFY. The stored record is the truth; the email is best-effort.
//
// This file replaces a handler whose only sink was a mail provider. That handler
// was honest about what it observed (it never returned 200 without an accepted
// send) and it was still losing leads, because "the provider accepted it" is not
// "somebody can still call this person back". One bounce, one spam rule, one
// unverified sending domain, and a booking enquiry for a fallen soldier's
// brother was gone with no trace and nobody knew it had existed. Its own header
// said so (HONEST LIMIT 3: "NO RETRY, NO QUEUE, NO PERSISTENCE ... a lead lost to
// a provider outage is lost").
//
// So the order is now: validate, PERSIST, decide the response, THEN notify. The
// response is a value computed and frozen before the first byte of mail is
// attempted, which is why a notify failure cannot reach it.
//
// INVARIANT     Only `created(id: LeadId)` produces a 2xx carrying a lead id, and
//               it has exactly TWO call sites, both in `handleLead`, and BOTH
//               read `id` off the `stored === true` arm of a `LeadStoreResult`:
//               `created(result.id)`, from the store this request started, and
//               `created(settled.id)`, from the store another request started
//               under the same idempotency key and this one AWAITED. The failure
//               arm has no `id` field at all. The cache holds store PROMISES,
//               never ids, so there is no id in this module that did not come out
//               of a store call reporting success — and "tell the visitor it
//               worked" and "a record with this id is in the store" remain the
//               same fact.
//               Notification runs AFTER the Response object already exists
//               (`const response = created(result.id)` precedes every `await` in
//               the notify block) and its outcome is written to `deliveryState`
//               via `withDelivered`/`withDeliveryFailed` and re-stored; it is
//               never read back into a status. The one other 2xx is the honeypot
//               decoy, and it is deliberately id-less — see `trapped()`.
//
// IMPOSSIBLE    "Accepted but unstored" can no longer be CONSTRUCTED here. The
//               specific lies now out of reach:
//                 · a success carrying a fabricated id — `LeadId` is branded and
//                   the only one in scope at the `created(...)` call site came out
//                   of `store()`'s success arm; there is no string this file could
//                   pass instead and no `''` that would compile;
//                 · a 2xx when the store failed — the failure arm has no `id`, so
//                   the expression `created(result.id)` does not type-check under
//                   `stored === false`; it is a compile error, not a review catch;
//                 · a 2xx for a store still IN FLIGHT — the duplicate path holds
//                   the store's promise, not an id, so the only way to reach an
//                   id through it is to await it and land on the success arm;
//                   when that store fails, the duplicate is told the SAME
//                   failure, because it is the same fact about the same record;
//                 · a lead deleted by a mail outage — the notify block cannot
//                   return, and holds no Response; its widest possible effect is
//                   `deliveryState: 'failed'` on a record that is already stored;
//                 · a 200 for an unparsed body — `createLeadRecord` is called with
//                   the OUTPUT of `leadSchema.safeParse`, so no unvalidated value
//                   exists in scope at the call site;
//                 · a thrown request — the only `JSON.parse` is inside a `try`;
//                 · an unbounded read — the `Content-Length` header is checked
//                   BEFORE `request.text()`, and the raw string again before
//                   `JSON.parse`;
//                 · an environment variable NAME in a response body — `failure()`
//                   takes a fixed code, never a `detail`, and no call site passes
//                   one.
//
// CLASS         Closed by derivation for LEAD SURVIVAL on this route: one store
//               call, one success expression, one branded id, and notification
//               demoted to a side effect on an existing record. A second notifier
//               (SMS, Slack, a second mailbox) is another call inside the notify
//               block and cannot introduce a new success path, because the
//               Response it would have to overwrite is a `const` declared above
//               it. A second SINK is `resolveLeadSink`'s business, not this
//               file's. NOT a closure over DURABILITY or over ABUSE — see limits.
//
// HONEST LIMIT  A 201 here means A SINK REPORTED IT STORED THE RECORD. It does
//               not mean the bytes are on a disk anyone will ever read: if the
//               resolved sink writes to an ephemeral serverless filesystem, this
//               route will answer 201 for a lead that evaporates at the end of
//               the instance's life, and nothing at this layer can see that. The
//               durability of a 201 is exactly the durability of whatever
//               `resolveLeadSink` returned, and that is a deployment fact no test
//               in this repo can prove. Eight further limits, deliberately:
//               (0) THE 2xx IS NOT FULLY TYPE-FENCED. `created(...)` takes a
//               `LeadId`, and `record.id` is also a `LeadId` and is in scope from
//               the moment `createLeadRecord` runs — so a future edit writing
//               `created(record.id)` BEFORE the store would compile and would be
//               exactly the old lie. What the type system closes is the narrower
//               case: `created(result.id)` cannot be written on the failure arm.
//               What holds the rest is that `created` has two call sites, both
//               named in the INVARIANT above, and a suite that asserts the fake
//               sink's CONTENTS rather than its call count. That is derivation
//               plus enumeration, not derivation alone, and it is stated here
//               rather than dressed up as a proof.
//               (1) SERVERLESS OUT-OF-BAND WORK. Notification is AWAITED before
//               the response is returned — not `waitUntil`, not `after()`, not a
//               floating promise. That is a deliberate trade: the visitor pays
//               the mail latency (typically a few hundred ms) and in exchange
//               there is no window in which the platform freezes the instance and
//               silently drops work this file started. Work scheduled after a
//               response on a serverless platform MAY be killed, and this file
//               refuses to claim a guarantee it cannot demonstrate, so it does
//               not schedule any. What is still NOT guaranteed: if the process is
//               killed mid-notify, the record keeps `deliveryState: 'pending'`
//               forever, because nothing in this repo sweeps pending records and
//               retries them. `pending` therefore means "nobody was told, OR we
//               died before we could write down that we told them". That sweeper
//               does not exist and is owed to the seat.
//               (2) RATE LIMITING IS PER-INSTANCE AND IN-MEMORY. `rateLimitState`
//               is a module-level `Map`. It is destroyed by every cold start and
//               is NOT shared between concurrently running instances, so the real
//               ceiling is (limit x instances), not `RATE_LIMIT_MAX`, and a
//               platform that scales to fifty instances has fifty counters. It
//               raises the cost of a flood; it does not stop one. A real guard is
//               shared state (Redis, a platform WAF) and is not in this repo.
//               It also FAILS OPEN when the client address cannot be determined
//               (no `x-forwarded-for`, no `x-real-ip`), because refusing a real
//               enquiry over a missing proxy header is a worse failure for this
//               site than admitting one extra request.
//               (3) IDEMPOTENCY IS THE SAME MEMORY, AND THE RACE IT CLOSES IS AN
//               IN-PROCESS ONE. The key is ALWAYS a fingerprint: the client
//               address, the client's optional `Idempotency-Key` label, and every
//               validated field. The header is one PART of that tuple and never a
//               replacement for it, so a shared or guessed key cannot hand one
//               visitor another visitor's id — it can only make one visitor's own
//               namespace narrower. What the fingerprint costs, unchanged: two
//               genuinely distinct enquiries that are byte-identical in every
//               field, from one address, within the window, collapse into one;
//               and visitors whose platform forwards no address share the single
//               address-less namespace, so they collapse with each other on that
//               same byte-identity. A duplicate lead is recoverable and a lost
//               one is not, which is why the window is ten minutes, not a day.
//               The OVERLAPPING duplicate — the double-click on a slow
//               connection, which is the case this cache exists for — is closed
//               by reserving the key with the store's own PROMISE before that
//               promise is awaited, so a concurrent duplicate finds the store
//               already running and is answered with ITS outcome: the id if it
//               stored, and the same failure status if it did not. What remains
//               UNFIXED, precisely, because `idempotencyState` is a module-level
//               `Map` with no cross-process coordination: two duplicates that
//               land on two different instances each reserve their own key and
//               are stored twice; a duplicate arriving after this instance cold
//               starts is stored again; one arriving after its key was evicted by
//               `IDEMPOTENCY_MAX_ENTRIES` under load is stored again; and nothing
//               here survives a redeploy. Making any of that exactly-once needs
//               shared state (Redis, a platform primitive) and a lock protocol,
//               and neither is in this repo, so this guard removes the
//               double-click ON ONE INSTANCE and promises nothing wider.
//               (4) THE HONEYPOT CAN CATCH A HUMAN. If a password manager or an
//               autofill heuristic ever writes into `HONEYPOT_FIELD`, a real
//               enquiry is discarded and the visitor is shown success — which is
//               precisely the defect this whole site exists to remove. The field
//               name is deliberately meaningless so no heuristic recognises it,
//               and the form contract requires `autocomplete="off"` and
//               `tabindex="-1"`, but this is mitigation, not proof. A trapped
//               submission is logged so the fault is at least visible to an
//               operator.
//               (5) NO CSRF/CONTENT-TYPE/ORIGIN CHECK. Any origin may post JSON.
//               The blast radius is a stored row and a mail to the site owner,
//               never a state change on a user's behalf.
//               (6) NO RETRY AND NO QUEUE. A `transient` store failure is a 503
//               and the request is over; recovery is the client's WhatsApp
//               fallback. Nothing retries on the server.
//               (7) NOT PROVED BY `npm run build` here (another delegate's gate),
//               and the environment variable names read below are a runtime
//               contract no unit test can prove a deployment satisfies.
// ─────────────────────────────────────────────────────────────────────────────

import { LEAD_TO_EMAIL_ENV_VAR } from '@/config/site';
import { renderAutoresponse } from '@/lib/leads/autoresponse';
import {
  countLocale,
  outcomeForStoreFailure,
  recordLeadOutcome,
  LEAD_OUTCOME,
  LOCALE_UNKNOWN,
  type LeadOutcome,
  type LeadCountLocale,
} from '@/lib/leads/log';
import type { LeadSink, LeadSinkFailure, LeadStoreResult } from '@/lib/leads/port';
import { resolveLeadSink } from '@/lib/leads/sinks';
import {
  createLeadRecord,
  withDelivered,
  withDeliveryFailed,
  type LeadId,
  type LeadRecord,
} from '@/lib/leads/types';
import { formatIssues, leadSchema, type LeadIssue } from '@/lib/validation';

/** This route reads `process.env` and writes per request; never prerender it. */
export const dynamic = 'force-dynamic';

/* ── The notification boundary ────────────────────────────────────────────── */

/**
 * The ONLY way this route can send mail. One method, no provider vocabulary.
 *
 * `send` RESOLVES only when the provider has accepted the message and THROWS on
 * every other outcome, including an HTTP error response — the exact case the
 * site being replaced ignored. Note what has changed since W5: a throw from here
 * no longer produces a 502. It produces a `deliveryState: 'failed'` on a lead
 * that is already stored, because the lead is no longer riding on this call.
 */
interface LeadMailer {
  send(message: OutboundMail): Promise<void>;
}

/** One outbound message. `replyTo` is omitted rather than sent empty. */
type OutboundMail = {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly replyTo?: string;
};

/**
 * Configured, or not — and when not, WHICH environment variables are missing.
 * A discriminated union rather than `LeadMailer | null` so the unconfigured
 * branch has no `mailer` to call: "send anyway" is unrepresentable.
 */
type MailerResolution =
  | { readonly configured: true; readonly mailer: LeadMailer; readonly from: string }
  | { readonly configured: false; readonly missing: readonly string[] };

/* ── Environment contract: NAMES only, never values ───────────────────────── */

/** The provider credential. Read from the environment at request time. */
const API_KEY_ENV_VAR = 'RESEND_API_KEY';

/**
 * The recipient. The NAME comes from `@/config/site`, which already declares it
 * — one fact, one place, no second spelling here.
 */
const TO_ENV_VAR = LEAD_TO_EMAIL_ENV_VAR;

/** The verified sending identity the provider requires. */
const FROM_ENV_VAR = 'LEAD_FROM_EMAIL';

const PROVIDER_ENDPOINT = 'https://api.resend.com/emails';

/* ── Transport limits ─────────────────────────────────────────────────────── */

/**
 * The raw body cap. Applied to `Content-Length` BEFORE the body is read, and to
 * the raw string again BEFORE `JSON.parse`, because a request may lie about its
 * length or omit the header entirely. The per-field caps in lib/validation.ts
 * cannot help: they run after parsing, and parsing is the cost a 10 MB body is
 * trying to impose. 16 KiB is four times the largest lead the field caps admit.
 */
const MAX_BODY_CHARS = 16 * 1024;

/* ── Guard 1: the honeypot ────────────────────────────────────────────────── */

/**
 * A field no human ever fills. Deliberately meaningless: an autofill heuristic
 * matches on names like `email`, `tel`, `organization`, `address` — `hp_ref`
 * looks like nothing, which is the point (see HONEST LIMIT 4).
 *
 * CROSS-DELEGATE CONTRACT for `components/sections/LeadForm.tsx`, which is
 * outside this delegate's write-set: render
 *
 *   <input name="hp_ref" type="text" autoComplete="off" tabIndex={-1}
 *          aria-hidden="true" />        (inside a visually hidden wrapper)
 *
 * and include `hp_ref: ''` in the posted JSON. A form that omits the field
 * entirely is SAFE — absent and empty are both untrapped — so this route may
 * land before the form does.
 *
 * `leadSchema` strips unknown keys, so this value can never reach a `LeadRecord`
 * even when present; it is read off the raw parsed body and discarded.
 */
const HONEYPOT_FIELD = 'hp_ref';

/** Any non-blank value is a bot. A present-but-empty field is a human. */
function isTrapped(body: unknown): boolean {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return false;
  const value = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof value === 'string' && value.trim() !== '';
}

/* ── Guard 2: per-IP rate limit ───────────────────────────────────────────── */

/** Requests admitted per address per window. */
const RATE_LIMIT_MAX = 5;

/** The window, in milliseconds. */
const RATE_LIMIT_WINDOW_MS = 60_000;

/** Addresses tracked at once, so a distributed flood cannot grow this map. */
const RATE_LIMIT_MAX_ADDRESSES = 5_000;

/** Per-instance, per-cold-start, not shared. See HONEST LIMIT 2. */
const rateLimitState = new Map<string, number[]>();

/**
 * The client address, or `null` when the platform did not tell us. `null` FAILS
 * OPEN: see HONEST LIMIT 2.
 */
function clientAddress(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded !== null) {
    const first = forwarded.split(',')[0]?.trim() ?? '';
    if (first !== '') return first;
  }
  const real = request.headers.get('x-real-ip')?.trim() ?? '';
  return real === '' ? null : real;
}

/** Seconds a rate-limited caller should wait, for the `Retry-After` header. */
function retryAfterSeconds(timestamps: readonly number[], now: number): number {
  const oldest = timestamps[0];
  if (oldest === undefined) return Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
  return Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
}

/**
 * Record an attempt and report whether it is over the limit. A sliding window of
 * timestamps rather than a fixed bucket, so a caller cannot send `2 x MAX` by
 * straddling a bucket boundary.
 */
type RateDecision = { readonly ok: true } | { readonly ok: false; readonly retryAfter: number };

function admitRate(address: string, now: number): RateDecision {
  const recent = (rateLimitState.get(address) ?? []).filter(
    (at) => now - at < RATE_LIMIT_WINDOW_MS,
  );

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitState.set(address, recent);
    return { ok: false, retryAfter: retryAfterSeconds(recent, now) };
  }

  recent.push(now);
  rateLimitState.set(address, recent);

  // Bounded memory: drop the least recently touched address. `Map` iterates in
  // insertion order and `set` on an existing key does not reorder, so this is
  // approximate LRU — good enough for a bound, and it is only a bound.
  while (rateLimitState.size > RATE_LIMIT_MAX_ADDRESSES) {
    const oldestKey = rateLimitState.keys().next().value;
    if (oldestKey === undefined) break;
    rateLimitState.delete(oldestKey);
  }

  return { ok: true };
}

/* ── Guard 3: idempotency ─────────────────────────────────────────────────── */

/** How long a submission is remembered as already-stored. */
const IDEMPOTENCY_WINDOW_MS = 10 * 60_000;

/** Entries retained at once. Bounded because the keys carry payload text. */
const IDEMPOTENCY_MAX_ENTRIES = 200;

/** A label a client may send to make its own key NARROWER. Never a namespace. */
const IDEMPOTENCY_HEADER = 'Idempotency-Key';

/** Longest client-supplied label accepted; longer is ignored, not an error. */
const IDEMPOTENCY_KEY_MAX = 200;

/**
 * One store, in flight or finished, per key.
 *
 * The entry is the store's own PROMISE and never its id, which is the whole of
 * the concurrency fix: it is written in the same synchronous run as the check
 * that found the key absent, so there is no instant at which a store has begun
 * and this map does not say so. A duplicate arriving mid-flight finds the
 * promise and awaits it; it cannot find an empty cache and start a second store,
 * and it cannot find an id for a record that is not in the store yet, because
 * ids are not what is kept here.
 */
type IdempotencyEntry = {
  readonly at: number;
  readonly outcome: Promise<LeadStoreResult>;
};

/** Per-instance, per-cold-start, not shared. See HONEST LIMIT 3. */
const idempotencyState = new Map<string, IdempotencyEntry>();

/**
 * The key for this submission: ONE derivation, no branches, no hashing — so no
 * collision can silently merge two enquiries, and `JSON.stringify` over an array
 * of strings quotes and escapes every part, so no submitted value can
 * impersonate a delimiter and reach into another part.
 *
 * WHY THE HEADER IS A PART AND NOT THE WHOLE. `Idempotency-Key` used to REPLACE
 * the fingerprint, and a key that is only what the caller typed is a GLOBAL
 * namespace: one value, one cache slot, whoever asks for it. Two different
 * people sending the same key — a future client hard-coding one, or one guessed
 * — shared a single record between them, and the second was handed the first's
 * id while their own enquiry was never stored: told it worked, gone. Folded in
 * as one part of the tuple, the header can only SPLIT a namespace further. It
 * can never merge two submissions that differ in address or in one typed
 * character.
 *
 * WHEN THERE IS NO ADDRESS. `clientAddress` returns `null` when the platform
 * forwards none, and the rate limiter deliberately fails open there (HONEST
 * LIMIT 2), so all such visitors share ONE namespace. That is stated, not
 * hidden, and it does not re-create the defect: because the payload is in the
 * key UNCONDITIONALLY, two address-less visitors collapse only when their
 * enquiries are byte-identical in every field — the same fingerprint trade this
 * route has always made (HONEST LIMIT 3), not a route to somebody else's id. The
 * alternative considered and rejected was a per-request nonce when the address
 * is unknown: it would switch the duplicate guard OFF for every visitor behind a
 * proxy that does not forward, and the double-click is the case the guard is for.
 */
function idempotencyKey(request: Request, record: LeadRecord, address: string | null): string {
  const supplied = request.headers.get(IDEMPOTENCY_HEADER)?.trim() ?? '';
  const label = supplied.length > IDEMPOTENCY_KEY_MAX ? '' : supplied;
  const p = record.payload;
  return JSON.stringify([
    address ?? '',
    label,
    p.name,
    p.phone,
    p.email,
    p.organization,
    p.message,
    p.locale,
  ]);
}

/**
 * The store already running, or already finished, under this key — or `null`
 * when this request is the first. Its caller must claim the key in the SAME
 * synchronous run; see `reserve`.
 */
function reserved(key: string, now: number): Promise<LeadStoreResult> | null {
  const seen = idempotencyState.get(key);
  if (seen === undefined) return null;
  if (now - seen.at >= IDEMPOTENCY_WINDOW_MS) {
    idempotencyState.delete(key);
    return null;
  }
  return seen.outcome;
}

/**
 * Claim the key for a store that has just STARTED. Called with the promise
 * `sink.store()` returned, and with no `await` between it and the `reserved`
 * that found the key free — that adjacency is what closes the race.
 *
 * A store that did not succeed is NOT remembered: the entry is released the
 * moment the promise says so, so the next attempt reaches the sink instead of
 * replaying a failure for ten minutes. The release is attached here rather than
 * at the call site so that one place decides it, and so a rejected store promise
 * always carries a handler and can never surface as an unhandled rejection — the
 * caller's own `await` still sees that rejection, unchanged and unswallowed.
 */
function reserve(key: string, outcome: Promise<LeadStoreResult>, now: number): void {
  idempotencyState.set(key, { at: now, outcome });

  const release = (): void => {
    // Only if the entry is still THIS store: a later attempt may already own it.
    if (idempotencyState.get(key)?.outcome === outcome) idempotencyState.delete(key);
  };
  void outcome.then((result) => {
    if (result.stored === false) release();
  }, release);

  for (const [candidate, seen] of idempotencyState) {
    if (now - seen.at >= IDEMPOTENCY_WINDOW_MS) idempotencyState.delete(candidate);
  }
  while (idempotencyState.size > IDEMPOTENCY_MAX_ENTRIES) {
    const oldestKey = idempotencyState.keys().next().value;
    if (oldestKey === undefined) break;
    idempotencyState.delete(oldestKey);
  }
}

/* ── The provider adapter ─────────────────────────────────────────────────── */

/**
 * The operator's copy of one enquiry. Plain text, because a lead is data to
 * read, not a document to render. The LEAD ID leads, because it is the handle
 * that makes a lost mail recoverable: it is what an operator types to find the
 * stored record.
 */
function renderOwnerNotification(record: LeadRecord): string {
  const lead = record.payload;
  return [
    `Lead id: ${record.id}`,
    `Received: ${record.receivedAt}`,
    '',
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email === '' ? '(not supplied)' : lead.email}`,
    `Organization: ${lead.organization === '' ? '(not supplied)' : lead.organization}`,
    `Site language: ${lead.locale}`,
    '',
    'Message:',
    lead.message === '' ? '(none)' : lead.message,
  ].join('\n');
}

function ownerSubject(record: LeadRecord): string {
  const lead = record.payload;
  return lead.organization === ''
    ? `Speaking enquiry from ${lead.name}`
    : `Speaking enquiry from ${lead.name} (${lead.organization})`;
}

/**
 * One implementation of `LeadMailer`.
 *
 * THE LINE THAT SEPARATES THIS FILE FROM THE SITE IT REPLACES is the
 * `response.ok !== true` check. `fetch` resolves happily on 401, 422 and 500; an
 * adapter that omits this check reports every rejection as a delivered lead.
 *
 * Header injection is not defended against HERE: the subject and Reply-To are
 * built from `name`, `organization` and `email`, and all three arrive already
 * screened for CR/LF by lib/validation.ts. That screen is load-bearing.
 */
function createResendMailer(apiKey: string, from: string): LeadMailer {
  return {
    async send(message: OutboundMail): Promise<void> {
      const payload: Record<string, unknown> = {
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      };
      if (message.replyTo !== undefined && message.replyTo !== '') {
        payload.reply_to = message.replyTo;
      }

      const response = await fetch(PROVIDER_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok !== true) {
        throw new Error(`lead_provider_rejected_${response.status}`);
      }
    },
  };
}

/**
 * Read the environment and either build the mailer or report exactly what is
 * missing. A variable present but blank counts as missing: `LEAD_TO_EMAIL=""` is
 * a misconfiguration, not a recipient.
 */
type MailerSetup = { readonly resolution: MailerResolution; readonly to: string };

function resolveMailer(env: NodeJS.ProcessEnv): MailerSetup {
  const apiKey = (env[API_KEY_ENV_VAR] ?? '').trim();
  const to = (env[TO_ENV_VAR] ?? '').trim();
  const from = (env[FROM_ENV_VAR] ?? '').trim();

  const missing: string[] = [];
  if (apiKey === '') missing.push(API_KEY_ENV_VAR);
  if (to === '') missing.push(TO_ENV_VAR);
  if (from === '') missing.push(FROM_ENV_VAR);

  if (missing.length > 0) {
    return { resolution: { configured: false, missing }, to };
  }
  return { resolution: { configured: true, mailer: createResendMailer(apiKey, from), from }, to };
}

/* ── Responses ────────────────────────────────────────────────────────────── */

/**
 * THE 2xx that carries a lead id. Its only argument comes out of the success arm
 * of `LeadStoreResult`, so it cannot be called without a record in the store.
 *
 * 201 rather than 200: a resource now exists and this is its identity. Verified
 * against `components/sections/LeadForm.tsx`, which branches on
 * `response.ok === true` and therefore treats every 2xx as success.
 */
function created(id: LeadId): Response {
  return Response.json({ ok: true, id }, { status: 201 });
}

/**
 * The honeypot decoy. Success-SHAPED and success-STATUSED, so a bot's
 * `res.ok`/`res.status` check reports a win and it moves on — but deliberately
 * ID-LESS, because an id is this route's evidence that something was stored and
 * this route stored nothing. The one asymmetry, chosen over minting a decoy id:
 * a fabricated id in a success body is the exact class of lie the file above is
 * built to make unconstructible, and it is not worth spending to fool a bot that
 * reads response bodies.
 */
function trapped(): Response {
  return Response.json({ ok: true }, { status: 201 });
}

/**
 * Every failure. The body is machine-readable and says nothing about the
 * environment: WHICH variable is unset is an operator fact for stderr, never
 * something a public endpoint volunteers. There is no parameter through which a
 * `detail` string could leak one.
 */
function failure(
  status: number,
  error: string,
  extra?: { readonly issues?: readonly LeadIssue[]; readonly retryAfter?: number },
): Response {
  const issues = extra?.issues;
  const retryAfter = extra?.retryAfter;
  return Response.json(issues === undefined ? { ok: false, error } : { ok: false, error, issues }, {
    status,
    headers: retryAfter === undefined ? undefined : { 'Retry-After': String(retryAfter) },
  });
}

const ALLOWED_METHODS = 'POST';

function methodNotAllowed(): Response {
  return Response.json(
    { ok: false, error: 'method_not_allowed' },
    { status: 405, headers: { Allow: ALLOWED_METHODS } },
  );
}

/** A store failure, as the status the visitor sees. Never 2xx. */
function storeFailureResponse(failureData: LeadSinkFailure): Response {
  switch (failureData.kind) {
    case 'not_configured':
      // Preserves the code this route has always returned when the deployment is
      // incomplete. The variable names go to stderr, not to the body.
      console.error(
        `[lead] storage unavailable: deployment incomplete: ${failureData.missingEnvVars.join(', ')} :: ${failureData.detail}`,
      );
      return failure(503, 'delivery_unavailable');
    case 'transient':
      console.error('[lead] storage failed, retryable', failureData.detail, failureData.cause);
      return failure(503, 'storage_unavailable', { retryAfter: 30 });
    case 'permanent':
      console.error('[lead] storage refused the record', failureData.detail, failureData.cause);
      return failure(500, 'storage_failed');
  }
}

/* ── Notification: everything below runs AFTER the response is decided ────── */

/**
 * Tell the owner. Returns the record with its `deliveryState` settled — never
 * throws, never returns a Response, and has no way to influence one.
 */
async function notifyOwner(
  record: LeadRecord,
  resolution: MailerResolution,
  to: string,
): Promise<LeadRecord> {
  if (resolution.configured === false) {
    console.error(
      `[lead] ${record.id} stored but not notified: unset environment variables: ${resolution.missing.join(', ')}`,
    );
    return withDeliveryFailed(record, 'not_configured', `unset: ${resolution.missing.join(', ')}`);
  }

  try {
    await resolution.mailer.send({
      to,
      subject: ownerSubject(record),
      text: renderOwnerNotification(record),
      replyTo: record.payload.email,
    });
    return withDelivered(record);
  } catch (cause) {
    console.error(`[lead] ${record.id} stored but the provider refused the notification`, cause);
    return withDeliveryFailed(
      record,
      'transient',
      cause instanceof Error ? cause.message : 'unknown notification error',
    );
  }
}

/**
 * Acknowledge to the visitor, if there is anything to say and anywhere to say
 * it. `renderAutoresponse` returning `null` is the catalogue not carrying the
 * keys — a HUMAN-BLOCKED case, not an error: send nothing, carry on. No copy is
 * invented here; every word comes from that renderer.
 */
async function sendAutoresponse(
  record: LeadRecord,
  resolution: MailerResolution,
): Promise<void> {
  if (record.payload.email === '') return;
  if (resolution.configured === false) return;

  try {
    // INSIDE the try on purpose. `renderAutoresponse` is documented as pure, but
    // "pure" is a claim about another module, and a claim is not a guarantee:
    // a throw from the catalogue must cost the visitor a courtesy email, never a
    // stored lead's 201. A test proves this line's placement (see the suite's
    // thrown-renderer case, which was RED before the call moved in here).
    const rendered = renderAutoresponse(record);
    if (rendered === null) return;

    await resolution.mailer.send({
      to: record.payload.email,
      subject: rendered.subject,
      text: rendered.body,
    });
  } catch (cause) {
    // The visitor's copy is the least important mail in this file. It cannot
    // change the status, and it must not change `deliveryState` either: that
    // field answers "was the OWNER told?", and conflating the two would make a
    // reachable lead look unreachable.
    console.error(`[lead] ${record.id} autoresponse failed`, cause);
  }
}

/**
 * Write the settled `deliveryState` back. The port has one method, so this is a
 * re-`store()` of the same record under the SAME id: a keyed sink upserts, an
 * append-only sink gains a second line whose id ties it to the first. Failure
 * here is logged and nothing else — the enquiry is already safe; only the note
 * about who was told is lost.
 */
async function persistDeliveryState(sink: LeadSink, record: LeadRecord): Promise<void> {
  try {
    const result = await sink.store(record);
    if (result.stored === false) {
      console.error(
        `[lead] ${record.id} stored, but its delivery state could not be updated: ${result.failure.detail}`,
      );
    }
  } catch (cause) {
    console.error(`[lead] ${record.id} delivery-state write threw`, cause);
  }
}

/* ── The funnel counter: observation only, never a participant ────────────── */

/**
 * Count what this request turned out to be. `lib/leads/log.ts` already documents
 * that it never throws; this `try` exists anyway, so that THIS file's promise —
 * a counter cannot cost the family an enquiry — does not depend on another
 * module keeping its own. A test replaces that module with one that throws
 * synchronously and asserts a 201 with the lead still in the store.
 */
async function count(outcome: LeadOutcome, locale: LeadCountLocale): Promise<void> {
  try {
    await recordLeadOutcome(outcome, locale);
  } catch (cause) {
    console.error('[lead] the funnel counter threw and was ignored', cause);
  }
}

/* ── The handler ──────────────────────────────────────────────────────────── */

/**
 * Guard, validate, PERSIST, decide, notify — in that order, with no path that
 * skips a step and no path that reorders the last two.
 *
 * The sink and the mailer arrive as arguments rather than as ambient facts, so
 * the ordering above is a property of this function and not of the environment.
 */
async function handleLead(
  request: Request,
  sink: LeadSink,
  mailer: MailerResolution,
  ownerAddress: string,
): Promise<Response> {
  const now = Date.now();
  const address = clientAddress(request);

  // ── Guard 4: the size cap, BEFORE the body is read ──────────────────────
  const declaredLength = Number(request.headers.get('content-length') ?? '');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_CHARS) {
    await count(LEAD_OUTCOME.refusedOversize, LOCALE_UNKNOWN);
    return failure(413, 'body_too_large');
  }

  // ── Guard 2: the rate limit, before any parsing cost is paid ────────────
  if (address !== null) {
    const admitted = admitRate(address, now);
    if (admitted.ok === false) {
      await count(LEAD_OUTCOME.refusedRateLimited, LOCALE_UNKNOWN);
      return failure(429, 'too_many_requests', { retryAfter: admitted.retryAfter });
    }
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    await count(LEAD_OUTCOME.refusedUnparseable, LOCALE_UNKNOWN);
    return failure(400, 'unreadable_body');
  }

  // The header may have lied, or been absent. Still before `JSON.parse`.
  if (raw.length > MAX_BODY_CHARS) {
    await count(LEAD_OUTCOME.refusedOversize, LOCALE_UNKNOWN);
    return failure(413, 'body_too_large');
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    await count(LEAD_OUTCOME.refusedUnparseable, LOCALE_UNKNOWN);
    return failure(400, 'malformed_json');
  }

  // ── Guard 1: the honeypot. Before validation, so the trap's shape cannot
  // be mapped by comparing a valid trapped post with an invalid one. ───────
  if (isTrapped(body)) {
    console.error(`[lead] discarded a submission that filled ${HONEYPOT_FIELD}`);
    await count(LEAD_OUTCOME.discardedBot, LOCALE_UNKNOWN);
    return trapped();
  }

  const parsed = leadSchema.safeParse(body);
  if (parsed.success === false) {
    await count(LEAD_OUTCOME.refusedByForm, countLocale(body));
    return failure(422, 'invalid_lead', { issues: formatIssues(parsed.error) });
  }

  const record = createLeadRecord(parsed.data, 'web_form');

  // ── Guard 3: idempotency. BEFORE the store, so a duplicate never becomes a
  // second record — and covering the duplicate that arrives while the first
  // store is STILL RUNNING, not only the one that arrives after it. ────────
  const key = idempotencyKey(request, record, address);
  const inFlight = reserved(key, now);
  if (inFlight !== null) {
    // Somebody else owns this key. Whatever their store reports, this request
    // reports the same, because it is the same record: the id if it was stored,
    // and the failure if it was not. There is no arm here that can answer
    // before the store has finished, and none that can answer 2xx without an
    // `id` off a success arm — so "you were told it worked" cannot outrun "a
    // record with this id exists", which is the defect this file exists for.
    const settled = await inFlight;
    if (settled.stored === false) {
      await count(outcomeForStoreFailure(settled.failure.kind), countLocale(record.payload.locale));
      return storeFailureResponse(settled.failure);
    }
    await count(LEAD_OUTCOME.duplicate, countLocale(record.payload.locale));
    return created(settled.id);
  }

  // ── PERSIST. The one call that decides whether this enquiry exists. The key
  // is claimed BETWEEN the call and the `await`: both statements run in one
  // synchronous turn, so no other request can observe the gap. ─────────────
  const storing = sink.store(record);
  reserve(key, storing, now);
  const result = await storing;

  if (result.stored === false) {
    await count(outcomeForStoreFailure(result.failure.kind), countLocale(record.payload.locale));
    return storeFailureResponse(result.failure);
  }

  // THE RESPONSE IS NOW DECIDED. Everything below is best-effort, and none of
  // it can reach this `const`.
  const response = created(result.id);

  const notified = await notifyOwner(record, mailer, ownerAddress);
  await sendAutoresponse(notified, mailer);
  await persistDeliveryState(sink, notified);

  // The funnel's two different disasters are separated HERE, at the one place
  // that knows both facts: the record is stored, and whether anybody was told.
  await count(
    notified.deliveryState.status === 'delivered'
      ? LEAD_OUTCOME.storedNotified
      : LEAD_OUTCOME.storedUnnotified,
    countLocale(record.payload.locale),
  );

  return response;
}

export async function POST(request: Request): Promise<Response> {
  const mailer = resolveMailer(process.env);
  return handleLead(request, resolveLeadSink(process.env), mailer.resolution, mailer.to);
}

export function GET(): Response {
  return methodNotAllowed();
}

export function PUT(): Response {
  return methodNotAllowed();
}

export function PATCH(): Response {
  return methodNotAllowed();
}

export function DELETE(): Response {
  return methodNotAllowed();
}

export function HEAD(): Response {
  return methodNotAllowed();
}

export function OPTIONS(): Response {
  return methodNotAllowed();
}
