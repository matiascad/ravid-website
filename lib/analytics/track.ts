// ─────────────────────────────────────────────────────────────────────────────
// W10-A ANALYTICS SUBSTRATE · lib/analytics/track.ts — THE ONLY EMITTER
//
// One total function. Every call site in this project reports through it, and
// it is safe to call from anywhere, at any time, configured or not.
//
// ⚠ THE NIGHT-WIDE GATE THIS FILE IS THE BIGGEST RISK TO.
// `NEXT_PUBLIC_GA_MEASUREMENT_ID` is UNSET and there is no GA4 property. With it
// unset the served page must be BYTE-IDENTICAL to today's. So `track()` in that
// state does not push to a dataLayer, does not create a global, does not read
// `window`, does not warn, does not `fetch`, and does not throw. It returns. The
// measured proof is in `__tests__/unset-gate.test.tsx`, which counts injected
// scripts, network calls, new `window` keys and throws across all nine events.
//
// INVARIANT     `track()` is TOTAL: for every `AnalyticsEvent`, in every
//               environment (server render, jsdom, browser, unset, misconfigured,
//               gtag-missing, gtag-throwing), it returns `undefined` and raises
//               nothing. Emission happens only when ALL of: a validated
//               measurement id exists, `window` exists, and `window.gtag` is a
//               function. Any one absent ⇒ the event is DROPPED.
//
// IMPOSSIBLE    (a) AN EVENT THAT BREAKS A CALL SITE. The whole body is inside
//                   one `try`. A click handler that calls `track()` cannot lose
//                   its own behaviour to an analytics fault — the memorial site
//                   does not go down for a tracker.
//               (b) AN AD-HOC EVENT NAME OR PAYLOAD. The parameter is
//                   `AnalyticsEvent`; the name comes off the discriminant and
//                   the params are derived from `WIRE_PARAM` below, never typed
//                   at a call site.
//               (c) PII ON THE WIRE. `eventParams` reads ONLY the field names
//                   listed in `WIRE_PARAM`, a closed list the compiler forces to
//                   be exactly the payload fields of each arm — and none of
//                   those is a free-form string (IMPOSSIBLE (a) in `./events`).
//                   There is no `...rest` spread and no index signature here, so
//                   this file adds no channel the catalogue closed; a key that
//                   is not in the catalogue is never even looked at, which a
//                   rest spread could not promise (see the WIRE_PARAM block).
//               (d) A SECOND ENV READ. The id comes from `measurementId()` in
//                   `@/lib/analytics` (W5-C) — still the one door. This file
//                   contains no environment variable name and no id.
//               (e) A SILENT RE-ENABLE. There is no `force`, no debug flag and
//                   no second code path that emits when the id is absent.
//               (f) A PAYLOAD FIELD THAT EXISTS IN THE TYPE AND NEVER REACHES
//                   THE WIRE. The defect that produced W10-FIX1. `WIRE_PARAM`
//                   is a mapped type over every arm AND every payload field of
//                   every arm, so a new field with no wire parameter is a
//                   missing-property compile error, and naming one is what
//                   emits it. Not "a reviewer will notice", not "a test will
//                   catch it": it does not compile. The alarm on top of it is
//                   `__tests__/wire-completeness.test.ts`.
//
// ─── DROP, NOT QUEUE — the decision, and its cost ────────────────────────────
//               An event fired while analytics is unconfigured or before gtag
//               exists is DROPPED. Nothing is buffered, nothing is retained, and
//               there is no module-level array in this file.
//
//               WHY, and it is a privacy argument before a performance one: a
//               queue that survives into a configured session means behaviour
//               recorded BEFORE the site was permitted to record it is
//               transmitted AFTERWARDS. That inverts consent — it collects
//               first and decides later — and it would leave a growing record of
//               a visitor's movements in memory on a site whose visitors are
//               grieving families reading about a fallen soldier. A dropped
//               event is a number that is slightly low. A queued event is data
//               held without permission. Those are not the same mistake.
//
//               THE COST, stated plainly: events that fire before gtag.js is
//               ready are lost, so early interactions undercount. That cost is
//               SMALL for a reason worth knowing — `gtagInitSnippet` in
//               `@/lib/analytics` defines `window.gtag` SYNCHRONOUSLY in the
//               inline bootstrap (`function gtag(){dataLayer.push(arguments)}`),
//               so once the id is configured, GA's OWN dataLayer buffers hits
//               until the loader arrives. The buffering that matters is Google's
//               and is already owned elsewhere. What this file drops is the
//               genuinely unconfigured case, where there is nothing to buffer
//               for. The residual loss is the window between hydration and the
//               bootstrap executing, and any event fired during a server render.
//
// HONEST LIMIT  1. NOTHING HERE IS PROVED TO REACH GOOGLE. This file's observable
//                  effect ends at `window.gtag(...)`. That gtag.js loads, that
//                  the id names a real property, that a hit is recorded — all
//                  NOT-MEASURED, and unmeasurable in this repository, because
//                  there is no GA4 account and no measurement id. Owner: a human
//                  with a real property, plus W14-B's browser pass.
//               2. NO CONSENT GATE EXISTS IN THIS PROJECT. `track()` does not
//                  consult one, because there is none to consult (see HONEST
//                  LIMIT 6 in `components/Analytics.tsx`). The de-facto consent
//                  state today is total: the id is unset, so nothing is
//                  collected, ever, by anything. The moment someone sets the id,
//                  page views AND these nine events begin without a banner, and
//                  that is a legal decision for a human in a jurisdiction — it
//                  is named here so it cannot be discovered by accident.
//               3. A THROWN ERROR IS SWALLOWED SILENTLY. `track()` cannot report
//                  its own failure without either throwing (forbidden: limit (a))
//                  or logging (forbidden by `no-console`, and noise on a
//                  visitor's console). So a broken tracker looks exactly like a
//                  working one from inside the page. The cost of totality.
//               4. THIS IS FIRE-AND-FORGET. No return value, no delivery
//                  confirmation, no de-duplication. Calling `track(ctaClick())`
//                  twice reports twice; a double-fired scroll handler
//                  double-counts. Throttling belongs to the call site.
//               5. ⚠️ EVERY PARAMETER THIS FILE SENDS IS INVISIBLE IN GA4
//                  REPORTS UNTIL A HUMAN REGISTERS IT. `cta_id`,
//                  `failure_reason`, `target_language`, `variant` and `depth`
//                  are CUSTOM event parameters. GA4 shows them in Realtime,
//                  DebugView and the BigQuery export immediately, and in NO
//                  standard report, exploration or audience until each is
//                  registered as an event-scoped CUSTOM DIMENSION in Admin ->
//                  Custom definitions (property cap: 50). Registration is not
//                  retroactive — hits that arrive before it are not
//                  back-filled. So this file makes "which button do people
//                  press?" ANSWERED ON THE WIRE and still UNANSWERABLE IN A
//                  REPORT until that one human action happens. That is the same
//                  name-is-not-a-thing failure this file was fixed for, one
//                  layer further out, and it is named here rather than
//                  discovered later. NOT-MEASURED here and unmeasurable: there
//                  is no GA4 property (HONEST LIMIT 1). §OPEN — one-edit item:
//                  register five dimensions, then delete this sentence.
//               6. TWO PARAMETER NAMES WERE NOT CHOSEN BY THIS FILE, THEY WERE
//                  INHERITED. `variant` and `depth` already reached the wire
//                  and were already asserted, so W10-FIX1 left them alone: a
//                  renamed live parameter splits its own history in GA4, which
//                  is a data-continuity decision for whoever owns the property,
//                  not part of fixing a drop. On a clean sheet `depth` would be
//                  `percent_scrolled` — GA4's own name on its built-in `scroll`
//                  event — and `variant` would be `wine_variant`. §OPEN —
//                  one-edit item, and it is one edit: `lib/analytics/track.ts`'s
//                  WIRE_PARAM plus the two literals asserting them in
//                  `__tests__/track.test.ts`.
// ─────────────────────────────────────────────────────────────────────────────

import { measurementId } from '@/lib/analytics';

import type { AnalyticsEvent, AnalyticsEventName } from './events';

/**
 * The only parameter shapes this project sends. Values are literal unions at the
 * catalogue, so this alias is as wide as the wire gets — it never widens what
 * `AnalyticsEvent` allows.
 */
type GtagEventParams = Readonly<Record<string, string | number>>;

/** The global `gtag` written by `gtagInitSnippet` in `@/lib/analytics`. */
type Gtag = (command: 'event', name: string, params?: GtagEventParams) => void;

declare global {
  // Type-only. Declaring the shape creates no runtime global; this file never
  // assigns to `window.gtag`, it only reads it.
  interface Window {
    gtag?: Gtag;
  }
}

/**
 * One arm of the catalogue union, selected by name. A structural re-derivation
 * of the same one-line `Extract` pin `./events` uses privately; `AnalyticsEvent`
 * remains the single fact — this alias holds no vocabulary of its own, so there
 * is nothing here that can drift from the catalogue. (It is re-declared rather
 * than imported only because `./events` does not export it and is outside this
 * delegate's write-set; exporting it there is the one-line tidy owed later.)
 */
type EventOf<N extends AnalyticsEventName> = Extract<AnalyticsEvent, { name: N }>;

/** The payload fields of one arm: every key of it except the discriminant. */
type PayloadField<N extends AnalyticsEventName> = Exclude<keyof EventOf<N>, 'name'>;

/**
 * ── THE WIRE MAP ────────────────────────────────────────────────────────────
 * EVERY PAYLOAD FIELD OF EVERY ARM, AND THE GA4 PARAMETER NAME IT TRAVELS AS.
 *
 * ⚠ THIS DECLARATION IS THE FIX, NOT THE THREE NAMES IN IT. What it replaced
 * was a hand-written `switch` with a `never` default, and that switch was
 * exhaustive over event NAMES only. Three arms grew a required field — `cta`,
 * `reason`, `to` — and the switch kept compiling, kept returning `undefined`
 * for them, and kept calling `gtag('event','cta_click')` with no parameter:
 * green `tsc`, green ESLint, 501 green tests, and the identity never left the
 * building. Adding a FIELD to an EXISTING arm is invisible to a name-exhaustive
 * switch; that is the whole defect, and patching in three `case` bodies would
 * have left the trap armed for the tenth.
 *
 * The type of this constant closes it at the level above. It is exhaustive in
 * BOTH directions:
 *
 *   over ARMS    `[N in AnalyticsEventName]` — a tenth event with no entry here
 *                is a missing-property compile error, exactly what the `never`
 *                default used to buy, and it is NOT lost in the trade.
 *   over FIELDS  `[K in PayloadField<N>]` — a new field on an EXISTING arm is
 *                ALSO a missing-property compile error, which is what the
 *                `never` default never bought. A field cannot exist in the type
 *                and fail to name a wire parameter; naming one is what puts it
 *                on the wire, because `eventParams` reads this map and nothing
 *                else. That is the structural answer, not a test that notices.
 *
 * WHY A MAP OF KEYS AND NOT `const { name, ...params } = event`. A rest spread
 * would carry any field by construction too — and would carry fields that are
 * not in the type at all. TypeScript's excess-property check fires only on a
 * FRESH object literal, so `const e = { name: 'form_success' as const, message:
 * lead.message }; track(e);` compiles today: the value is assignable to the arm
 * and the extra key survives at runtime. A spread would put that lead's message
 * on the wire. This loop reads ONLY the keys listed above, so the smuggled key
 * is never looked at. Strictly safer than a spread, and the reason the brief
 * forbids one.
 *
 * ⚠ THE NAMES ARE NOT YET DIMENSIONS. Every parameter below is a CUSTOM event
 * parameter. GA4 shows a custom parameter in Realtime and DebugView immediately
 * and in the BigQuery export, but it does NOT appear in any standard report,
 * exploration or audience until a human registers it as an event-scoped CUSTOM
 * DIMENSION in Admin -> Custom definitions (50-dimension property cap), and
 * registration is NOT retroactive. Until that is done, "which button do people
 * press?" is answered on the wire and still unanswerable in a report — the same
 * name-is-not-a-thing failure this fix exists to end, one layer further out.
 * Owner: a human with the GA4 property. See HONEST LIMIT 5.
 *
 * THE NAMES, AND WHY EACH:
 *   cta_id           `cta`. Not `cta`: GA4 reads better with an explicit
 *                    `_id` suffix on identifier dimensions (`item_id`,
 *                    `form_id`), and nothing automatic is called `cta_id`.
 *   failure_reason   `reason`. Not `reason` (too generic to find in a 50-slot
 *                    dimension list) and not `error`/`description` (GA4's own
 *                    `exception` event owns `description`).
 *   target_language  `to`. Deliberately NOT `language`: GA4 collects `language`
 *                    automatically from the browser and surfaces it as the
 *                    built-in Language dimension, so a custom parameter of that
 *                    name is a collision that cannot be registered cleanly.
 *   variant, depth   UNCHANGED. These two already reach the wire and are
 *                    already asserted; renaming a parameter that is live splits
 *                    its history in GA4 and is a data-continuity decision for
 *                    whoever owns the property, not a defect fix. `depth` would
 *                    be `percent_scrolled` on a clean sheet (GA4's own name on
 *                    its built-in `scroll` event). NOT renamed here. HONEST
 *                    LIMIT 6.
 *
 * No name here starts with a GA4 reserved prefix (`_`, `ga_`, `google_`,
 * `firebase_`, `gtag.`) and none collides with an automatically collected
 * parameter. Checked, not assumed.
 */
const WIRE_PARAM: {
  readonly [N in AnalyticsEventName]: { readonly [K in PayloadField<N>]: string };
} = {
  cta_click: { cta: 'cta_id' },
  form_submit_attempt: {},
  form_success: {},
  form_fail: { reason: 'failure_reason' },
  whatsapp_click: {},
  instagram_click: {},
  wine_click: { variant: 'variant' },
  lang_switch: { to: 'target_language' },
  scroll_depth: { depth: 'depth' },
};

/**
 * Read one named field off an event as a wire value.
 *
 * `field` is never arbitrary: its only caller passes keys that came out of
 * `WIRE_PARAM`, whose type forbids a key that is not a payload field of that
 * arm. The `typeof` narrowing is the second gate — it is what makes the return
 * type `string | number | undefined` honest rather than asserted, and it means
 * an object, array or function hanging off an event could not reach gtag even
 * if the catalogue ever grew one. No cast, no `any`, no `!`.
 */
function fieldValue(event: AnalyticsEvent, field: string): string | number | undefined {
  const fields: Readonly<Record<string, unknown>> = event;
  const value = fields[field];
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

/**
 * The payload for one event, or `undefined` for the four payload-free arms
 * (`form_submit_attempt`, `form_success`, `whatsapp_click`, `instagram_click`).
 *
 * Derived from `WIRE_PARAM`, never hand-listed — see the block above. An arm
 * with no payload fields has an empty map, produces an empty object and is
 * reported as `undefined`, so gtag is called with two arguments and no stray
 * third: a payload-free event sends no parameter at all.
 */
function eventParams(event: AnalyticsEvent): GtagEventParams | undefined {
  const params: Record<string, string | number> = {};

  for (const [field, wireName] of Object.entries(WIRE_PARAM[event.name])) {
    const value = fieldValue(event, field);
    if (value !== undefined) {
      params[wireName] = value;
    }
  }

  return Object.keys(params).length === 0 ? undefined : params;
}

/**
 * Report one event. Total, silent, and a no-op unless analytics is configured
 * AND running.
 *
 * Call it as `track(wineClick('red'))` — the constructors in `./events` are the
 * only way to build the argument, so no call site types an event name.
 */
export function track(event: AnalyticsEvent): void {
  try {
    // THE GATE. Unset id ⇒ return before touching anything at all. This is the
    // line the unset-state proof breaks and restores in the RED proof.
    if (measurementId() === undefined) {
      return;
    }

    // Server render, or any non-DOM environment: nothing to report to.
    if (typeof window === 'undefined') {
      return;
    }

    const gtag = window.gtag;
    if (typeof gtag !== 'function') {
      // Configured but the bootstrap has not run. DROPPED, never queued — see
      // the DROP, NOT QUEUE block above.
      return;
    }

    const params = eventParams(event);
    if (params === undefined) {
      gtag('event', event.name);
      return;
    }
    gtag('event', event.name, params);
  } catch {
    // Totality (IMPOSSIBLE (a)): a failing tracker must never become a failing
    // button. Deliberately silent — see HONEST LIMIT 3.
  }
}
