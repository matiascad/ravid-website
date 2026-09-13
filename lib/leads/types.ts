// ─────────────────────────────────────────────────────────────────────────────
// W9-A LEAD RECORD — lib/leads/types.ts
//
// The stored truth of one enquiry. This module exists because of a defect that
// no status code on `app/api/lead/route.ts` can see: today a lead is EMAILED
// and nothing else. Email is the only sink. One bounce, one spam rule, one
// unverified sending domain, and a bereaved brother's booking enquiry is gone
// with no trace and nobody knows it existed. `route.ts`'s own header states it
// (HONEST LIMIT 3: "NO RETRY, NO QUEUE, NO PERSISTENCE ... there is no database,
// so a lead lost to a provider outage is lost"; limit 4: the audit trail is
// `console.error`).
//
// The architecture is PERSIST-THEN-NOTIFY. The stored record is the truth;
// the notification is best-effort. That ordering is the whole point, and it is
// why `deliveryState` is a FIELD OF the record rather than a precondition for
// it: a `LeadRecord` is born `{ status: 'pending' }` and is already complete,
// already the truth, before any mail provider has been contacted at all. A
// record whose notification never succeeds is a RECOVERABLE lead. A record that
// was never written is a lead nobody can know about. Those are different
// failures and this type refuses to conflate them.
//
// INVARIANT     Every `LeadRecord` carries a `LeadId`, and a `LeadId` can be
//               obtained in exactly two ways: `newLeadId()` mints one, or
//               `parseLeadId()` accepts a 26-character Crockford-Base32 string
//               and returns `null` for everything else. `LeadId` is a BRANDED
//               string, so no other string — not `''`, not a database column
//               typed `string`, not a caller's optimism — is assignable to it.
//               The record's payload IS `Lead` from `@/lib/validation`, imported
//               and never re-shaped, so the stored fields and the runtime schema
//               cannot disagree; and because `Lead` already carries `locale`
//               (inferred from `LOCALES` in `@/config/site`), the locale of a
//               record is `record.payload.locale` — stated once, in one place.
//               `deliveryState` is ORTHOGONAL to storage: it is data on an
//               existing record, never a gate on creating one.
//
// IMPOSSIBLE    An idless lead record can no longer be CONSTRUCTED. `id` is a
//               required property of a required branded type, so
//               `{ receivedAt, source, payload, deliveryState }` is a compile
//               error, not a row that silently sorts to the top. Also out of
//               reach by construction:
//                 · a record whose `locale` disagrees with its payload's — there
//                   is no second locale field to disagree WITH (see CLASS);
//                 · a record that is "delivered" with no delivery timestamp, or
//                   "failed" with no reason: `LeadDeliveryState` is a
//                   discriminated union and each arm's evidence is required;
//                 · a record created only AFTER a successful send — the sole
//                   constructor, `createLeadRecord`, takes no delivery argument
//                   and cannot be handed one, so "store it if the mail worked"
//                   is not an expression that type-checks;
//                 · a hand-written parallel lead shape drifting from the zod
//                   schema, since `payload` is `z.infer`'d upstream.
//
// CLASS         Closed by derivation for the IDENTITY and the SHAPE of a stored
//               lead across every sink: one brand, one minting function, one
//               parser, one constructor, one payload type imported from the one
//               schema. A second sink (file, database, spreadsheet, CRM) stores
//               the SAME `LeadId` for the same enquiry because the caller mints
//               it once and hands the finished record to each sink; correlation
//               across sinks is therefore structural, not a convention someone
//               has to remember. NOT a closure over STORAGE DURABILITY — see the
//               limit.
//
// HONEST LIMIT  This file makes an unstored record unrepresentable; it CANNOT
//               make an unstored lead impossible. Nothing here writes anything.
//               If no sink is wired, or every sink fails, this type system is
//               silent — that guarantee lives in `port.ts` and in the adapters.
//               Five further limits, deliberately:
//               (1) `receivedAt` is a plain `string` documented as ISO-8601 UTC.
//               It is NOT branded and NOT validated: `'banana'` is assignable.
//               Branding it would buy a format guarantee that is not the defect
//               this wave closes, at the cost of friction in every sink that
//               reads a timestamp back out of storage. Named, not hidden.
//               (2) NO ULID DEPENDENCY IS INSTALLED and this file does not add
//               one — `package.json` carries clsx, next, next-intl, react,
//               react-dom, tailwind-merge and zod, and nothing else. The
//               generator below is a small implementation of the ULID spec
//               (https://github.com/ulid/spec): 128 bits = 48-bit millisecond
//               timestamp + 80 bits of randomness, Crockford Base32, 26
//               characters, lexicographically sortable. Adding the `ulid`
//               package instead is a one-line change and is the seat's call,
//               not this delegate's.
//               (3) MONOTONICITY IS NOT IMPLEMENTED. The spec's monotonic
//               ordering within a single millisecond is a SHOULD, not a MUST,
//               and this generator does not do it: two ids minted in the same
//               millisecond sort in random relative order. Sortable to
//               millisecond precision, not to arrival order. Implementing it
//               requires module-level mutable state, which is a worse thing to
//               put in a shared type module than this sentence is.
//               (4) `parseLeadId` checks SHAPE, never PROVENANCE. A 26-character
//               Crockford string typed by hand parses successfully; it is a
//               well-formed id, not a proof that a record with that id exists.
//               (5) `LeadSource` has exactly one member today (`'web_form'`)
//               because the site has exactly one server-reachable enquiry path.
//               The WhatsApp fallback in `LeadForm.tsx` opens `wa.me` in the
//               user's client and never reaches this process, so listing it here
//               would be a fact this code cannot observe. Adding a second
//               channel is one line — and a union member added here is NOT a
//               compile error at consumers unless they switch exhaustively, so
//               that extension is a review item, not a type-enforced one.
// ─────────────────────────────────────────────────────────────────────────────

import type { Lead } from '@/lib/validation';

/* ── Identity ─────────────────────────────────────────────────────────────── */

declare const LEAD_ID_BRAND: unique symbol;

/**
 * A stored lead's identity: a ULID.
 *
 * Branded, so that `const id: LeadId = ''` does not compile and a raw `string`
 * from a database row, a query parameter or a caller's imagination cannot be
 * passed where an id is required. The brand is a phantom property that exists
 * only in the type system — at runtime a `LeadId` is exactly its 26 characters.
 */
export type LeadId = string & { readonly [LEAD_ID_BRAND]: 'LeadId' };

/**
 * Crockford's Base32 alphabet, as the ULID spec mandates: the digits and the
 * uppercase letters MINUS I, L, O and U, which are excluded because they are
 * misread as 1, 1, 0 and V when a human retypes an id from an email.
 */
const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** 10 characters x 5 bits = 50 bits, of which the low 48 carry the timestamp. */
const ULID_TIMESTAMP_LENGTH = 10;

/** 16 characters x 5 bits = the spec's 80 bits of randomness. */
const ULID_RANDOMNESS_LENGTH = 16;

/** The total, fixed by the spec. */
export const LEAD_ID_LENGTH = ULID_TIMESTAMP_LENGTH + ULID_RANDOMNESS_LENGTH;

/** Exactly `LEAD_ID_LENGTH` Crockford Base32 characters, anchored at both ends. */
const LEAD_ID_PATTERN = new RegExp(`^[${CROCKFORD_BASE32}]{${LEAD_ID_LENGTH}}$`);

/**
 * The timestamp half: `epochMilliseconds` in base 32, most significant character
 * first, so string comparison and time comparison agree. 48 bits runs to the
 * year 10889, and `Math.floor` division is exact well inside 2^53.
 */
function encodeUlidTimestamp(epochMilliseconds: number): string {
  let remaining = epochMilliseconds;
  let encoded = '';
  for (let index = 0; index < ULID_TIMESTAMP_LENGTH; index += 1) {
    encoded = CROCKFORD_BASE32[remaining % 32] + encoded;
    remaining = Math.floor(remaining / 32);
  }
  return encoded;
}

/**
 * The randomness half, from the platform CSPRNG — `crypto.getRandomValues`,
 * which is a global in Node 18+ and in the Edge runtime, so this file imports
 * nothing to get it. Each byte is uniform over 0-255 and 256 is an exact
 * multiple of 32, so `byte % 32` is uniform over the alphabet with no modulo
 * bias: 16 characters carry a full 80 uniform bits.
 *
 * `Math.random()` is NOT an acceptable substitute here and there is deliberately
 * no fallback to it: a guessable lead id is a guessable stored record.
 */
function encodeUlidRandomness(): string {
  const bytes = new Uint8Array(ULID_RANDOMNESS_LENGTH);
  crypto.getRandomValues(bytes);
  let encoded = '';
  for (const byte of bytes) {
    encoded += CROCKFORD_BASE32[byte % 32];
  }
  return encoded;
}

/**
 * Mint a new lead id. THE only way to create one from nothing.
 *
 * ULID rather than uuid4 because the id is also the arrival order: a directory
 * listing, a spreadsheet column or a `SELECT ... ORDER BY id` of stored leads is
 * in the order the enquiries came in, without a second index. uuid4 sorts
 * randomly and would make "what came in last night" a scan.
 */
export function newLeadId(now: number = Date.now()): LeadId {
  return (encodeUlidTimestamp(now) + encodeUlidRandomness()) as LeadId;
}

/**
 * Recover an id from an untrusted string — a stored row, a log line, an operator
 * pasting from an email. Returns `null` rather than throwing, so a caller must
 * branch, and `null` is the only alternative to a well-formed id.
 */
export function parseLeadId(value: string): LeadId | null {
  return LEAD_ID_PATTERN.test(value) ? (value as LeadId) : null;
}

/* ── Provenance ───────────────────────────────────────────────────────────── */

/**
 * Which channel produced the enquiry. One member, because the site has one
 * server-reachable enquiry path (`app/api/lead/route.ts`, posted to by
 * `components/sections/LeadForm.tsx`). See HONEST LIMIT 5.
 */
export type LeadSource = 'web_form';

/* ── Notification state ───────────────────────────────────────────────────── */

/**
 * Why a best-effort step could not be completed, in the only three shapes that
 * lead to DIFFERENT CALLER BEHAVIOUR. Shared by the notify state below and by
 * `LeadSinkFailure` in `./port`, so the vocabulary is stated once.
 *
 *   `not_configured` — the deployment is missing something (an unset environment
 *       variable, an absent directory). Retrying this request cannot help; a
 *       human must change the deployment. This is the case behind today's honest
 *       503 on `app/api/lead/route.ts`.
 *   `transient`      — it might work next time: a timeout, a 5xx from a
 *       provider, a lock, a rate limit. Safe to retry.
 *   `permanent`      — it will never work for this input as it stands: a 4xx
 *       rejection, a refused address, a payload the sink will not accept.
 *       Retrying is a waste and hides the fault.
 *
 * Finer categories (quota versus network versus DNS) collapse into these three
 * because the caller's only available ACTIONS are: fix the deployment, retry,
 * or stop. A distinction that does not change what the caller does is a
 * distinction the caller cannot use.
 */
export type LeadFailureKind = 'not_configured' | 'transient' | 'permanent';

/**
 * The state of the NOTIFY attempt — and nothing else.
 *
 * Read the arms as answers to "has anyone been told yet?", never to "does this
 * lead exist?". The record's existence is settled before this field is ever
 * consulted. A discriminated union rather than a status string plus optional
 * fields, so "delivered with no timestamp" and "failed with no reason" are not
 * values anyone can build.
 */
export type LeadDeliveryState =
  /** Stored, nobody notified yet. The state every record is born in. */
  | { readonly status: 'pending' }
  /** A notifier reported acceptance at `deliveredAt` (ISO-8601 UTC). */
  | { readonly status: 'delivered'; readonly deliveredAt: string }
  /**
   * A notifier failed at `failedAt` (ISO-8601 UTC). `detail` is OPERATOR-facing
   * text for a log — never a response body: `app/api/lead/route.ts` deliberately
   * refuses to tell a public client which environment variable is unset, and
   * this field must not become the leak that undoes that.
   */
  | {
      readonly status: 'failed';
      readonly failedAt: string;
      readonly kind: LeadFailureKind;
      readonly detail: string;
    };

/* ── The record ───────────────────────────────────────────────────────────── */

/**
 * One enquiry, as stored. The truth of the booking funnel.
 *
 * `payload` is `Lead` — the type INFERRED from `leadSchema` in
 * `@/lib/validation`, imported rather than restated, so the only way to obtain
 * one is still a `safeParse` that succeeded. The record's locale is
 * `payload.locale`; there is no second locale field, because a second one could
 * disagree with the first and a record that contradicts itself is exactly the
 * class of bad state this wave exists to remove.
 */
export type LeadRecord = {
  /** Required. There is no such thing as a record without an identity. */
  readonly id: LeadId;
  /** ISO-8601 UTC, the instant the server accepted the enquiry. */
  readonly receivedAt: string;
  /** The channel. */
  readonly source: LeadSource;
  /** The validated enquiry, exactly as `leadSchema` produced it. */
  readonly payload: Lead;
  /** Best-effort notification state. Orthogonal to storage; see the header. */
  readonly deliveryState: LeadDeliveryState;
};

/**
 * THE constructor. The only place a lead record is born, and the reason an
 * idless one cannot exist: `id` and `receivedAt` are supplied here, and there is
 * no parameter by which a caller could withhold them.
 *
 * Note what this function does NOT take: any argument about delivery. A record
 * cannot be created "once the mail went out", because there is no expression
 * that would say so. It is created `pending`, and notification is something that
 * happens to a record that already exists.
 *
 * `now` is injectable so a test can pin the clock; it defaults to real time.
 */
export function createLeadRecord(
  payload: Lead,
  source: LeadSource,
  now: Date = new Date(),
): LeadRecord {
  return {
    id: newLeadId(now.getTime()),
    receivedAt: now.toISOString(),
    source,
    payload,
    deliveryState: { status: 'pending' },
  };
}

/**
 * Record that a notifier accepted this lead. Returns a NEW record: the stored
 * truth is not mutated in place, so a caller holding the original still holds
 * what was stored.
 */
export function withDelivered(record: LeadRecord, now: Date = new Date()): LeadRecord {
  return { ...record, deliveryState: { status: 'delivered', deliveredAt: now.toISOString() } };
}

/**
 * Record that a notifier failed. The lead is NOT lost by this call — it is
 * exactly as stored as it was a moment ago, which is the entire point of
 * persist-then-notify. `detail` is for operator logs only; see
 * `LeadDeliveryState`.
 */
export function withDeliveryFailed(
  record: LeadRecord,
  kind: LeadFailureKind,
  detail: string,
  now: Date = new Date(),
): LeadRecord {
  return {
    ...record,
    deliveryState: { status: 'failed', failedAt: now.toISOString(), kind, detail },
  };
}
