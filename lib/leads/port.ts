// ─────────────────────────────────────────────────────────────────────────────
// W9-A LEAD SINK PORT — lib/leads/port.ts
//
// The boundary every lead store is reached through, and the one type in this
// repository whose job is to make a specific lie unbuildable.
//
// THE LIE: "accepted but unstored". A red-team probe scored the booking funnel
// 31/100, and the finding behind this file is that a lead is EMAILED and never
// WRITTEN. The shape that permits the lie is the reflex one —
// `{ ok: boolean; id?: string }` — because `{ ok: true }` type-checks, compiles,
// passes review and means nothing was stored. That is the defect wearing a
// success value's clothes, and it is the exact ancestor of the two defects
// `app/api/lead/route.ts` already documents: a site that alerts "sent" with zero
// network calls, and a site that posts to a third party and never reads the
// response. Each one had a success value that was not evidence of anything.
//
// So the success arm of `LeadStoreResult` carries a REQUIRED `LeadId`, and
// `LeadId` is branded: not `string`, not `''`, not optional. A sink cannot claim
// success without naming what it stored, and it cannot name it with a value it
// invented on the spot from an empty string. Failure is DATA, never an
// exception, so a caller cannot get a stored lead by forgetting a `try`.
//
// ORDERING: persist, THEN notify. `store()` returning success is the moment the
// enquiry becomes recoverable; the email that follows is best-effort and its
// outcome lands in `LeadRecord.deliveryState`, which is a field of an already
// existing record. A failed notification is a lead you can still call back. A
// failed store is a lead nobody knows happened. This port exists to keep those
// two failures apart.
//
// INVARIANT     `store()` resolves to exactly one of two arms, discriminated by
//               the literal `stored`. The `true` arm has a required
//               `id: LeadId`; the `false` arm has a required `failure` and NO
//               id. There is no third state, no optional id, and no thrown
//               control flow the caller is expected to guess at — `store()`
//               returns a `Promise` that RESOLVES on failure, so handling the
//               failure is the only way to read the result at all. Every failure
//               names a `LeadFailureKind`, and those kinds are pinned to the
//               union in `./types` by `Extract`, so renaming a kind there makes
//               the corresponding arm here uninhabitable rather than stale.
//
// IMPOSSIBLE    `{ stored: true }` with no id cannot be CONSTRUCTED — the
//               compiler refuses it, and that refusal is not a claim made here:
//               it is ASSERTED BY EXECUTING TYPE TESTS at
//               `lib/leads/__tests__/port-structural.test.ts`, where fourteen
//               `@ts-expect-error` directives — one for each refusal listed
//               below — are re-proved by every `npx tsc --noEmit`. An UNUSED
//               `@ts-expect-error` is itself a `tsc` error, so the day any of
//               these types is widened the typecheck FAILS rather than this
//               paragraph quietly outliving the property it describes. (It used
//               to say the refusal "was observed, not assumed (a probe was
//               compiled, the error captured verbatim, the probe removed)" —
//               which was a photograph of a property, taken once and then
//               undefended. The probe is now permanent and is the proof.) Also
//               out of reach by construction:
//                 · `{ stored: true, id: undefined }` and `{ stored: true,
//                   id: '' }` — `LeadId` is branded, so no plain string is
//                   assignable and no optionality exists to exploit;
//                 · a success value that also carries a failure, or a failure
//                   that also carries an id: the arms are disjoint, so a caller
//                   that has narrowed to `stored === false` has NO `id` in scope
//                   to log as if a lead had been saved;
//                 · a caller that reads the id without handling failure — the
//                   union must be narrowed before `.id` exists;
//                 · a sink that reports "could not store" without saying which
//                   of the three actionable kinds it was;
//                 · a secret in this file: there are no environment variable
//                   VALUES and no environment variable NAMES here at all. The
//                   `not_configured` arm carries `missingEnvVars` as data,
//                   supplied by the adapter that owns that configuration, so a
//                   new sink with new variables needs no edit here.
//
// CLASS         Closed by derivation for EVERY lead sink, present and future:
//               file, database, spreadsheet, CRM, queue, or a composite that
//               fans out to several. Each is a new implementation of one
//               interface with one method and one return type, so none of them
//               can introduce a success value that is not an id. The class is
//               closed at the TYPE, not at a review checklist: the bad
//               construction is a compile error in the adapter's own file,
//               before any test runs.
//
// HONEST LIMIT  A type cannot reach a disk. This port proves that a sink cannot
//               CLAIM success without an id; it cannot prove the bytes survived,
//               that the id is the one actually written, or that anyone will
//               ever read the store. A dishonest or buggy adapter can return
//               `{ stored: true, id: newLeadId() }` having written nothing, and
//               nothing in this file will notice — that guarantee belongs to the
//               adapters' own tests and to whatever reads the store back. Five
//               further limits, deliberately:
//               (1) NO RETRY, NO BACKOFF, NO QUEUE here. `transient` says "safe
//               to retry" and stops; who retries, how often, and whether a
//               serverless request should wait at all are policy this delegate
//               was not given and did not invent.
//               (2) NO NOTIFIER PORT. This file defines the STORE boundary only.
//               The mail side still lives behind `LeadMailer` inside
//               `app/api/lead/route.ts`; unifying the two is a separate wave and
//               is owed to the seat, not done here.
//               (3) NO READ SIDE. `LeadSink` writes. Listing or fetching stored
//               leads is not modelled, so "nobody knows" is only half-closed by
//               this wave: the record exists, and reading it back is still a
//               human opening a file.
//               (4) NO IDEMPOTENCY. Calling `store()` twice with the same record
//               stores it twice or not, depending entirely on the adapter; the
//               port neither requires nor forbids it. A double-submitted form is
//               therefore two rows, which is a duplicate lead — recoverable, and
//               strictly better than the zero rows this wave replaces.
//               (5) `name` is for OPERATOR LOGS ONLY — so that a composite can
//               say WHICH sink failed. It is not an identifier anything branches
//               on, and nothing in this file gives it meaning; treating it as
//               one would be the precise mistake this project calls Law 8.
//               (6) MEASURED, not assumed, by the assertions named above: the
//               two "the arms are disjoint" refusals — a success value carrying
//               a `failure`, a failure carrying an `id` — are enforced for fresh
//               object LITERALS by excess property checking (TS2353). A value of
//               that shape laundered through a variable is structurally
//               assignable to the failure arm and compiles. What holds with no
//               such caveat is the READ side: a caller narrowed to
//               `stored === false` has no `id` in scope at all (TS2339), and
//               that is the half the sentence above actually rests on.
// ─────────────────────────────────────────────────────────────────────────────

import type { LeadFailureKind, LeadId, LeadRecord } from './types';

/* ── Failure, as data ─────────────────────────────────────────────────────── */

/**
 * Why a lead could not be stored.
 *
 * Three arms, because a caller has exactly three available responses. The kinds
 * are documented once, in `LeadFailureKind` in `./types`, and each arm pins its
 * discriminant with `Extract` so the two cannot drift: rename a kind there and
 * `Extract` collapses to `never`, which makes the arm uninhabitable and every
 * adapter literal a compile error — a loud break rather than a silent stale
 * string.
 *
 * `detail` is OPERATOR-facing text destined for a log. It must never be returned
 * to a public client: `app/api/lead/route.ts` deliberately withholds which
 * environment variable is unset, and leaking it through here would undo that.
 */
export type LeadSinkFailure =
  | {
      /** The deployment is incomplete. Retrying this request cannot help. */
      readonly kind: Extract<LeadFailureKind, 'not_configured'>;
      /**
       * The environment variable NAMES the adapter needs and did not find —
       * names only, never values, and supplied by the adapter because the
       * adapter owns its configuration. Empty when the missing thing is not an
       * environment variable at all (an absent directory, say), which `detail`
       * then explains.
       */
      readonly missingEnvVars: readonly string[];
      readonly detail: string;
    }
  | {
      /** It might work next time: timeout, 5xx, lock, rate limit. */
      readonly kind: Extract<LeadFailureKind, 'transient'>;
      readonly detail: string;
      /** The original error, for logging. Never rendered to a client. */
      readonly cause?: unknown;
    }
  | {
      /** It will never work for this input as it stands. Do not retry. */
      readonly kind: Extract<LeadFailureKind, 'permanent'>;
      readonly detail: string;
      /** The original error, for logging. Never rendered to a client. */
      readonly cause?: unknown;
    };

/* ── The result ───────────────────────────────────────────────────────────── */

/**
 * The outcome of one `store()` call. THE type this wave exists for.
 *
 * A discriminated union, NOT `{ ok: boolean; id?: string }`. That shape permits
 * `{ ok: true }` — accepted, unstored, and type-correct — which is the defect
 * itself. Here the id lives only on the success arm and is required there, so
 * "we stored it" and "here is what we stored" are the same sentence and cannot
 * be uttered separately.
 */
export type LeadStoreResult =
  | {
      readonly stored: true;
      /**
       * The identity of the record now in the store. REQUIRED, and branded, so
       * there is no success without one and no passing `''` off as one. This is
       * the value that makes a lost lead recoverable: quote it in the
       * notification, find it in the store.
       */
      readonly id: LeadId;
    }
  | {
      readonly stored: false;
      /** REQUIRED, and the arm carries no `id`: a failure cannot look stored. */
      readonly failure: LeadSinkFailure;
    };

/* ── The port ─────────────────────────────────────────────────────────────── */

/**
 * The one boundary a lead is written through.
 *
 * `store` takes a COMPLETE `LeadRecord` — the caller mints the id and the
 * timestamp once via `createLeadRecord` and hands the same finished record to
 * every sink, so two sinks hold the same lead under the same id and correlation
 * across them is structural rather than a convention. A sink that minted its own
 * id would make the same enquiry two different leads.
 *
 * `store` RESOLVES on failure and rejects only on a genuine programming fault
 * (an adapter bug). Expected failure is `{ stored: false, failure }`, because a
 * caller can ignore an exception by accident and cannot ignore a union arm it
 * has to narrow.
 */
export interface LeadSink {
  /**
   * A short, stable, operator-facing label for logs — "which sink failed?". Not
   * a key, not a discriminant, and nothing here branches on it. See HONEST
   * LIMIT 5.
   */
  readonly name: string;

  /** Persist the record. Resolves to success-with-id, or failure-with-reason. */
  store(record: LeadRecord): Promise<LeadStoreResult>;
}
