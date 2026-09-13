// ─────────────────────────────────────────────────────────────────────────────
// W10-A ANALYTICS SUBSTRATE · lib/analytics/events.ts — THE EVENT CATALOGUE
//
// The nine events this site is allowed to emit, modelled so that a wrong one
// cannot be CONSTRUCTED, and so that no call site ever types an event name.
//
// ⚠ READ THIS FIRST — THE DIRECTORY/FILE COLLISION, DECLARED, NOT HIDDEN.
// `lib/analytics.ts` (W5-C) ALREADY EXISTS and owns the measurement id, the
// gtag URL and the gtag bootstrap. This directory sits BESIDE it. Module
// resolution prefers the FILE, so `@/lib/analytics` is, and stays, W5-C's
// module; this catalogue is reached only at its explicit path
// `@/lib/analytics/events`. There is deliberately NO `index.ts` here: one would
// be permanently shadowed by `lib/analytics.ts` and therefore dead on arrival —
// a file that exists and is imported zero times is the exact defect W5-C was
// written to retire. Merging the two into one directory is the right end state
// and is OWED TO THE SEAT; it was not done here because `lib/analytics.ts` is
// outside this delegate's write-set and an existing test reads it by path.
//
// INVARIANT     An analytics event is a value of `AnalyticsEvent` and there is
//               no other way to make one: every arm is produced by exactly one
//               exported constructor below, and each constructor's return type
//               is pinned to its arm by `Extract`. Rename an arm and the
//               constructor's return type collapses to `never`, which makes the
//               function body a compile error — a loud break, not a stale
//               string. A call site therefore never types `'wine_click'`; it
//               calls `wineClick(variant)`.
//
// IMPOSSIBLE    (a) A FREE-FORM STRING IN A PAYLOAD — and therefore PII IN AN
//                   EVENT. Every field of every arm is a LITERAL type: the nine
//                   names, `WineVariant` (four literals, imported from
//                   `@/config/site` so the catalogue and the shop links cannot
//                   name different wines), and `ScrollDepth` (four numbers).
//                   There is NO field of type `string` and NO index signature
//                   anywhere in `AnalyticsEvent`. A lead's name, phone, email or
//                   message is a `string`, so it is not assignable to ANY field
//                   of ANY event. This is structural, not a runtime check and
//                   not a review rule — the compile error was captured verbatim,
//                   not assumed (see the W10-A report).
//               (b) `scroll_depth` AT AN ARBITRARY DEPTH. `ScrollDepth` is
//                   `25 | 50 | 75 | 100`, derived from `SCROLL_DEPTHS` so the
//                   list and the type are one fact. `scrollDepth(30)` is a
//                   compile error.
//               (c) `wine_click` WITHOUT A VARIANT. The parameter is required
//                   and has no default; `wineClick()` does not compile.
//               (d) A MISSPELLED FIELD. The arms are exact object types, so an
//                   excess property is rejected at the literal and the intended
//                   property is then reported missing.
//               (e) A TENTH EVENT ADDED AT A CALL SITE. `track()` accepts
//                   `AnalyticsEvent` only, and this file is the sole author of
//                   that union, so a new event is a visible edit HERE.
//
// CLASS         Closed by derivation for THIS NINE-EVENT VOCABULARY: adding,
//               renaming or re-typing an arm propagates to the constructor, to
//               `track.ts`'s `WIRE_PARAM` (a mapped type over
//               `AnalyticsEventName`, keyed per arm by that arm's own payload
//               fields — it replaced the hand-written `never` switch in
//               W10-FIX1, which could not see a field added to an existing arm)
//               and to every call site at compile time. NOT a general rule that
//               every future analytics vendor must be typed this way.
//
// HONEST LIMIT  1. ⚠️ SUPERSEDED — kept as history because a later reader will
//                  find it quoted in the W10-A report. It said `cta_click`
//                  carried no identifier of WHICH CTA, and the same for
//                  `form_fail` (no reason) and `lang_switch` (no target). That
//                  was TRUE when written and is FALSE NOW: seat ledger D-73
//                  ruled the fields in before W10-B's call sites landed, because
//                  adding them afterwards is a breaking change to every site.
//                  The three fields are `cta`, `reason` and `to` above. W10-A
//                  was right not to INVENT the vocabulary; W10-B DERIVED it, by
//                  reading the controls that render and the branches the form
//                  can tell apart — see the block on `CTA_IDS`.
//               1b. ⚠️ SUPERSEDED — kept as history, same reason as 1. It said
//                  the three new fields were typed, constructed and carried to
//                  `track()`, and that `track()` DROPPED THEM: `eventParams()`
//                  counted `cta_click`, `form_fail` and `lang_switch` among the
//                  payload-free arms, so the identity reached the boundary and
//                  stopped there, and the hand-written `never` switch of the day
//                  did not notice a field ADDED to an existing arm. That was
//                  TRUE when written and is FALSE NOW. W10-FIX1 deleted the
//                  switch and replaced it with `WIRE_PARAM` in
//                  `lib/analytics/track.ts`: a mapped type over
//                  `AnalyticsEventName` whose value for each arm is a map keyed
//                  by that arm's OWN payload fields, so a new field is a
//                  missing-property compile error rather than a silent drop.
//                  `cta`, `reason` and `to` now reach gtag as `cta_id`,
//                  `failure_reason` and `target_language`. Read `WIRE_PARAM`
//                  itself for the wire names; do not restate them here — the
//                  mapping is one fact and it lives in that file.
//               2. THIS FILE SENDS NOTHING. It is types and four-line
//                  constructors; whether anything is transmitted is `track()`'s
//                  question, and whether Google records it is nobody's in this
//                  repository — there is no GA4 property (see the report's
//                  NOT-MEASURED section).
//               4. TWO RENDERED CONTROLS HAVE NO EVENT IN THIS CATALOGUE AT
//                  ALL: `Footer.tsx`'s `mailto:` contact link and its credit
//                  link. The nine-event vocabulary was fixed by the brief and
//                  has no `email_click`, so a visitor who chooses email over
//                  WhatsApp is invisible to this measurement. Named, not
//                  silently absorbed into `cta_click` — a control reported under
//                  another control's name is worse than a control not reported.
//               3. NOTHING HERE PREVENTS A *MISSING* CALL. The catalogue proves
//                  that emitted events are well-formed; it cannot prove that a
//                  button which should emit one does. That is W10-B's wave and
//                  W14-B's browser pass.
// ─────────────────────────────────────────────────────────────────────────────

import type { Locale, WineVariant } from '@/config/site';

/* ── Scroll depth, as a closed set ────────────────────────────────────────── */

/**
 * The only depths this site reports, in order. The TYPE is derived from this
 * list, so the list and the type are one fact and cannot drift.
 */
export const SCROLL_DEPTHS = [25, 50, 75, 100] as const;

/** `25 | 50 | 75 | 100`. No other number is an analytics depth. */
export type ScrollDepth = (typeof SCROLL_DEPTHS)[number];

/* ── Identity, as closed sets (seat ledger D-73) ──────────────────────────── */

/**
 * THE CALLS-TO-ACTION THAT ACTUALLY RENDER. Not a taxonomy, not a guess: each
 * member was read off a control that exists in `components/sections/**` today,
 * and the file:line it came from is recorded beside it. A name here with no
 * control is a lie the compiler cannot catch, so the list stays derived by
 * reading, and shrinks when a button is deleted.
 *
 *   hero_book   components/sections/Hero.tsx:262 — `<a href={anchor(form)}>`
 *   hero_story  components/sections/Hero.tsx:268 — `<a href={anchor(story)}>`
 *   why_book    components/sections/Why.tsx:159  — `<a href={FORM_HREF}>`
 *
 * The site's other controls are NOT `cta_click`: the four wine links are
 * `wine_click`, the two locale links are `lang_switch`, the form's own submit
 * button is `form_submit_attempt`, and the WhatsApp/Instagram links in
 * `LeadForm` are their own events. `Footer`'s mailto and credit links have no
 * event in this catalogue at all (HONEST LIMIT 4).
 */
export const CTA_IDS = ['hero_book', 'hero_story', 'why_book'] as const;

/** `'hero_book' | 'hero_story' | 'why_book'`. Derived — never hand-written. */
export type CtaId = (typeof CTA_IDS)[number];

/**
 * WHY A BOOKING SUBMISSION DID NOT SUCCEED — and ONLY the reasons the form can
 * genuinely tell apart. `LeadForm.handleSubmit` has exactly four places a
 * failure can be observed, and this list is those four, opened out:
 *
 *   client_invalid  a required field was blank; the early return that makes NO
 *                   request at all. A distinct branch that already existed.
 *   http_*          the `response.ok === false` branch, read off
 *                   `response.status`. The five statuses `app/api/lead` is
 *                   documented to produce get their own members.
 *   http_other      totality, not invention: `response.status` is a `number`,
 *                   so mapping it onto a closed union REQUIRES a fallback. A
 *                   502 from a proxy in front of the route lands here rather
 *                   than nowhere.
 *   ok_without_id   THE ROUTE ANSWERED OK AND STORED NOTHING. A fourth,
 *                   genuinely distinct observation, not a status at all:
 *                   `app/api/lead`'s honeypot guard answers a trapped
 *                   submission with a success-shaped, success-STATUSED 201 that
 *                   deliberately omits `id`, having written no record — it
 *                   refuses to mint a decoy so that an id in a 2xx MEANS a
 *                   stored lead. `LeadForm` reads the BODY, not the status
 *                   line, and an id-less 2xx lands here. It is its own member
 *                   because the operator question it answers is the most
 *                   expensive on this site — "is the trap eating real
 *                   enquiries?" — and under `http_other` that question is
 *                   unanswerable: a honeypot swallowing bookings would look
 *                   exactly like a 502 at a proxy.
 *   network         the `catch` branch. fetch rejected — offline, DNS, CORS,
 *                   the abort from `AbortSignal.timeout`. The component CANNOT
 *                   separate those four, so this catalogue does not pretend to:
 *                   one name for one branch.
 *
 * There is deliberately no `timeout` member. An aborted fetch and a dead network
 * arrive at the same `catch` with nothing the component inspects to tell them
 * apart, and a name for a distinction the call site cannot make is the exact
 * defect this catalogue exists to prevent.
 */
export const FORM_FAIL_REASONS = [
  'client_invalid',
  'http_413',
  'http_422',
  'http_429',
  'http_500',
  'http_503',
  'http_other',
  'ok_without_id',
  'network',
] as const;

/** One of the nine above. Derived from the list, so the two cannot drift. */
export type FormFailReason = (typeof FORM_FAIL_REASONS)[number];

/* ── The catalogue ────────────────────────────────────────────────────────── */

/**
 * THE nine events. A discriminated union over `name`, every field a literal.
 *
 * FOUR arms carry no payload at all (`form_submit_attempt`, `form_success`,
 * `whatsapp_click`, `instagram_click`), which is not laziness: a payload-free
 * arm has no field into which a caller could put a lead's details, and it is the
 * strongest available form of IMPOSSIBLE (a). It was seven until ledger D-73
 * ruled `cta`, `reason` and `to` in (HONEST LIMIT 1). The five arms that do
 * carry data carry closed unions for the same reason — count them in the union
 * below rather than trusting this sentence.
 */
export type AnalyticsEvent =
  | { readonly name: 'cta_click'; readonly cta: CtaId }
  | { readonly name: 'form_submit_attempt' }
  | { readonly name: 'form_success' }
  | { readonly name: 'form_fail'; readonly reason: FormFailReason }
  | { readonly name: 'whatsapp_click' }
  | { readonly name: 'instagram_click' }
  | { readonly name: 'wine_click'; readonly variant: WineVariant }
  | { readonly name: 'lang_switch'; readonly to: Locale }
  | { readonly name: 'scroll_depth'; readonly depth: ScrollDepth };

/** The nine names, as a type. Nothing constructs one of these by hand. */
export type AnalyticsEventName = AnalyticsEvent['name'];

/**
 * One arm of the union, selected by name. The house `Extract` pin (see
 * `lib/leads/port.ts`): if an arm is renamed, every constructor returning it
 * collapses to `never` and stops compiling.
 */
type EventOf<N extends AnalyticsEventName> = Extract<AnalyticsEvent, { name: N }>;

/* ── The constructors — the ONLY way a call site names an event ───────────── */

/**
 * A call-to-action was pressed. The `cta` is REQUIRED and comes from `CTA_IDS`,
 * whose members are each pinned to a control that renders — so `ctaClick()`
 * with no argument, or with the name of a button nobody built, does not compile.
 */
export function ctaClick(cta: CtaId): EventOf<'cta_click'> {
  return { name: 'cta_click', cta };
}

/** The booking form was submitted by the visitor. Fires BEFORE the request. */
export function formSubmitAttempt(): EventOf<'form_submit_attempt'> {
  return { name: 'form_submit_attempt' };
}

/** The booking request was accepted by the API. The conversion event. */
export function formSuccess(): EventOf<'form_success'> {
  return { name: 'form_success' };
}

/**
 * The booking submission did not succeed. The `reason` is REQUIRED and names one
 * of the four branches `LeadForm` can actually observe (see FORM_FAIL_REASONS).
 */
export function formFail(reason: FormFailReason): EventOf<'form_fail'> {
  return { name: 'form_fail', reason };
}

/** A WhatsApp contact link was opened. */
export function whatsappClick(): EventOf<'whatsapp_click'> {
  return { name: 'whatsapp_click' };
}

/** An Instagram link was opened. */
export function instagramClick(): EventOf<'instagram_click'> {
  return { name: 'instagram_click' };
}

/**
 * A wine product link was opened. The variant is REQUIRED and is the same
 * `WineVariant` that keys `WINE_URLS` in `@/config/site`, so the event and the
 * destination URL cannot name different products.
 */
export function wineClick(variant: WineVariant): EventOf<'wine_click'> {
  return { name: 'wine_click', variant };
}

/**
 * The visitor switched language. `to` is the locale they switched TO, typed as
 * the project's one `Locale` union (`config/site.ts`), so the catalogue and the
 * router cannot disagree about which languages exist.
 */
export function langSwitch(to: Locale): EventOf<'lang_switch'> {
  return { name: 'lang_switch', to };
}

/** The visitor reached one of the four reported depths. */
export function scrollDepth(depth: ScrollDepth): EventOf<'scroll_depth'> {
  return { name: 'scroll_depth', depth };
}
