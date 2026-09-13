// ─────────────────────────────────────────────────────────────────────────────
// W10-B · PII IS STRUCTURALLY UNREACHABLE — lib/analytics/__tests__/pii-structural.test.ts
//
// W10-A's catalogue made "a lead's details in an analytics payload" a COMPILE
// error rather than a review rule, and captured the error verbatim in its
// report. A captured error is a photograph: it proves the property held on the
// day it was taken. This file makes it a STANDING check — every `tsc --noEmit`
// re-proves it, and the day someone loosens a field to `string`, the
// `@ts-expect-error` below stops being satisfied and the TYPECHECK FAILS.
//
// W10-B added three identity fields — `cta`, `reason`, `to` — which are the
// first realistic chance the project has had to break that property, because
// each is a new place a call site puts a value. Every one is a literal union
// derived from a list; none is `string`; there is still no index signature and
// no rest element anywhere in `AnalyticsEvent`. The assertions below are the
// proof, and they are about the NEW fields specifically.
//
// WHY THERE IS NO `expect` IN MOST OF THIS FILE. The assertions are the
// `@ts-expect-error` comments; they are checked by the compiler, not the
// runner. The one runtime `expect` exists so the file is a legal test and so a
// reader sees it in the suite count. Law 8 is honoured here in an unusual
// direction: the "computed effect" being asserted IS a compile outcome, and it
// is computed by `tsc`, not claimed by a comment.
//
// HONEST LIMIT  1. It proves a lead field cannot be ASSIGNED to an event. It
//                  cannot stop someone encoding a phone number inside a literal
//                  union member (`cta: 'hero_book'` is fine; a future
//                  `'user_0501234567'` would compile). Nothing in a type system
//                  closes that; review and the derivation rule in `events.ts`
//                  do.
//               2. ⚠️ SUPERSEDED BY W10-FIX1 — kept because the W10-B report
//                  quotes it. It said this file proves nothing about what
//                  `track()` transmits, and that the three identity fields were
//                  typed and carried at the call site but NOT forwarded to gtag.
//                  The second half is FALSE NOW: `eventParams` is derived from
//                  `WIRE_PARAM` and the three travel as `cta_id`,
//                  `failure_reason` and `target_language`, asserted at the
//                  boundary in `./track.test.ts` and `./wire-completeness.
//                  test.ts`. The first half is still true of the OTHER
//                  assertions in this file, and is now answered by the
//                  `track()`-level compile proof added below, which closes the
//                  path from a lead's field to the wire rather than only to an
//                  event.
// ─────────────────────────────────────────────────────────────────────────────

import {
  CTA_IDS,
  FORM_FAIL_REASONS,
  ctaClick,
  formFail,
  langSwitch,
  type AnalyticsEvent,
} from '@/lib/analytics/events';
import { track } from '@/lib/analytics/track';

/** Exactly the shape a lead arrives in. Every field a free-form `string`. */
type Lead = {
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly organization: string;
  readonly message: string;
};

declare const lead: Lead;

/**
 * NEVER CALLED, and that is the design. `tsc` checks the body of an
 * unreferenced function exactly as it checks any other, so these five lines are
 * assertions the TYPECHECKER runs. They must not run at RUNTIME: `lead` is a
 * `declare const`, which has a type and no value, so executing this would be a
 * ReferenceError rather than a proof. The tests below assert its existence,
 * which is all a runner can honestly say about it.
 */
function compileTimeProofs(): void {
  // @ts-expect-error -- a visitor's name is a `string`; `cta` is a three-member literal union.
  ctaClick(lead.name);
  // @ts-expect-error -- a phone number is a `string`; `reason` is an eight-member literal union.
  formFail(lead.phone);
  // @ts-expect-error -- an email is a `string`; `to` is the project's `Locale` union.
  langSwitch(lead.email);
  // @ts-expect-error -- the whole point: no field of any arm accepts a `string`.
  const forged: AnalyticsEvent = { name: 'cta_click', cta: lead.organization };
  // @ts-expect-error -- there is no index signature, so an extra key has nowhere to land.
  const smuggled: AnalyticsEvent = { name: 'form_success', message: lead.message };

  // W10-FIX1 — THE SAME PROOF ONE LAYER OUT, AT THE EMITTER RATHER THAN THE
  // CATALOGUE. The three arms that grew identity fields now reach gtag, so
  // "could a lead's field ride one of them?" became a question worth a compile
  // error of its own rather than an inference from `events.ts`.
  // @ts-expect-error -- a lead's message is a `string` and `form_success` has no field at all; the emitter cannot be handed one.
  track({ name: 'form_success', message: lead.message });
  // @ts-expect-error -- `cta` reaches the wire as `cta_id`; it still takes only the three-member literal union, never a name.
  track({ name: 'cta_click', cta: lead.name });
  // @ts-expect-error -- `to` reaches the wire as `target_language`; a lead's email is not a `Locale`.
  track({ name: 'lang_switch', to: lead.email });

  void forged;
  void smuggled;
}

describe('a lead field cannot reach an analytics event', () => {
  it('has eight compile-time assertions, each satisfied by a real tsc error', () => {
    // The assertions are the `@ts-expect-error` comments above; a satisfied one
    // is invisible to a runner and a FAILING typecheck when the property breaks.
    // What this runtime line adds is that the proofs still exist and were
    // compiled — a deleted `compileTimeProofs` fails here and in `tsc` alike.
    expect(typeof compileTimeProofs).toBe('function');
  });

  it('every sanctioned identity value is, by contrast, assignable — the list IS the type', () => {
    // Not a tautology: these come from the exported CONSTANTS, so if a member
    // were dropped from a list without its type following, this stops compiling.
    const fromLists: readonly AnalyticsEvent[] = [
      ...CTA_IDS.map((cta) => ctaClick(cta)),
      ...FORM_FAIL_REASONS.map((reason) => formFail(reason)),
    ];

    expect(fromLists).toHaveLength(CTA_IDS.length + FORM_FAIL_REASONS.length);
  });
});
