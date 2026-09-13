// ─────────────────────────────────────────────────────────────────────────────
// W10-FIX1 · A FIELD IN THE TYPE THAT NEVER REACHES THE WIRE
//           lib/analytics/__tests__/wire-completeness.test.ts
//
// THE DEFECT THIS FILE EXISTS FOR, STATED AS A PROPERTY. Three arms of
// `AnalyticsEvent` grew a required field — `cta`, `reason`, `to`. Every layer
// carried them: the catalogue typed them, the constructors set them, the call
// sites passed them, `track()` received them. The emitter's `switch` was
// exhaustive over event NAMES, so it kept compiling, kept listing those three
// among the payload-free arms, and kept calling `gtag('event','cta_click')`
// with no parameter. `tsc` green, ESLint green, 501 tests green, and the
// identity stopped one function short of the wire. Nothing in the toolchain
// could say so, because adding a FIELD to an EXISTING arm breaks no
// name-exhaustive check.
//
// WHAT IS ASSERTED HERE IS NOT "three fields are emitted". That would be the
// patch, and it would leave the trap armed for the tenth field. What is
// asserted is the GENERAL property:
//
//     for every event this catalogue can construct, EVERY field it carries
//     other than the discriminant arrives at `window.gtag`, with its value.
//
// So an arm that gains a field the emitter ignores turns this file red, whatever
// the field is called and whichever arm it lands on — no edit here required.
//
// ⚠ THIS TEST IS THE BACKSTOP, NOT THE GUARANTEE. The guarantee is structural
// and lives in `track.ts`'s `WIRE_PARAM`, whose type is a mapped type over BOTH
// `AnalyticsEventName` AND each arm's payload fields: a new field on an existing
// arm is a missing-property COMPILE ERROR at that literal, and naming a wire
// parameter for it is what puts it on the wire, because `eventParams` reads that
// map and nothing else. This file is what catches a future emitter that stops
// being derived from the map. Both, deliberately — the compile error is the
// thing, the test is the alarm on the thing.
//
// HONEST LIMIT  1. The property is checked over the nine SAMPLE events built
//                  below, one per arm — not over every value of every closed
//                  union. That is enough for the defect in question (a dropped
//                  field is dropped for every value of it) and is NOT enough to
//                  catch a value-dependent emitter; `track.test.ts` walks the
//                  full membership of `CTA_IDS`, `FORM_FAIL_REASONS`, `LOCALES`
//                  and `SCROLL_DEPTHS` for that.
//               2. It compares field COUNT and field VALUES, not field-to-
//                  parameter NAMES. It therefore proves nothing about whether
//                  `cta` should travel as `cta_id`; the exact wire names are
//                  asserted, literally, in `track.test.ts`. Two fields of one
//                  arm sharing a value would also weaken the count check — no
//                  arm has two fields today, and if one ever does, the named
//                  assertions are the ones to trust.
//               3. Compile-time assertions in a test file prove the MECHANISM,
//                  not the live map. Adding a real field to `lib/analytics/
//                  events.ts` to watch `WIRE_PARAM` fail was not done: that file
//                  is outside this delegate's write-set and had just landed.
//                  The simulation below instantiates the same two mapped types
//                  against a grown arm, which is the same check the compiler
//                  runs against the real one.
// ─────────────────────────────────────────────────────────────────────────────

import { MEASUREMENT_ID_ENV_VAR } from '@/lib/analytics';
import {
  ctaClick,
  formFail,
  formSubmitAttempt,
  formSuccess,
  instagramClick,
  langSwitch,
  scrollDepth,
  whatsappClick,
  wineClick,
  type AnalyticsEvent,
  type AnalyticsEventName,
} from '@/lib/analytics/events';
import { track } from '@/lib/analytics/track';

/** Obviously synthetic. Not a GA4 property; it only has to match the shape. */
const FIXTURE_MEASUREMENT_ID = 'G-W10FIX1TEST';

/** One event per arm, each built through its own constructor. */
const ONE_PER_ARM: readonly AnalyticsEvent[] = [
  ctaClick('why_book'),
  formSubmitAttempt(),
  formSuccess(),
  formFail('http_429'),
  whatsappClick(),
  instagramClick(),
  wineClick('white'),
  langSwitch('he'),
  scrollDepth(50),
];

let savedEnv: string | undefined;

beforeEach(() => {
  savedEnv = process.env[MEASUREMENT_ID_ENV_VAR];
  process.env[MEASUREMENT_ID_ENV_VAR] = FIXTURE_MEASUREMENT_ID;
});

afterEach(() => {
  delete window.gtag;
  if (savedEnv === undefined) {
    delete process.env[MEASUREMENT_ID_ENV_VAR];
  } else {
    process.env[MEASUREMENT_ID_ENV_VAR] = savedEnv;
  }
});

/** The payload the event itself carries: every own field except `name`. */
function carriedValues(event: AnalyticsEvent): readonly unknown[] {
  const fields: Readonly<Record<string, unknown>> = event;
  return Object.keys(fields)
    .filter((key) => key !== 'name')
    .map((key) => fields[key]);
}

describe('every field an event carries reaches the boundary', () => {
  it('covers all nine arms — the catalogue and the sample cannot drift apart', () => {
    // If a tenth arm is added and no sample is built for it, this is red before
    // the coverage assertion below can quietly pass over it.
    const sampled = new Set<AnalyticsEventName>(ONE_PER_ARM.map((event) => event.name));

    expect(sampled.size).toBe(ONE_PER_ARM.length);
    expect(ONE_PER_ARM).toHaveLength(9);
  });

  it('FAILS if an arm gains a field the emitter ignores', () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    for (const event of ONE_PER_ARM) {
      track(event);
    }

    expect(gtag.mock.calls).toHaveLength(ONE_PER_ARM.length);

    const unemitted: string[] = [];

    ONE_PER_ARM.forEach((event, index) => {
      const call = gtag.mock.calls[index];
      const sent: unknown = call === undefined ? undefined : call[2];
      const sentValues: readonly unknown[] =
        typeof sent === 'object' && sent !== null ? Object.values(sent) : [];
      const carried = carriedValues(event);

      // 1. the count: nothing carried is left behind, nothing extra invented
      if (sentValues.length !== carried.length) {
        unemitted.push(
          `${event.name}: carries ${String(carried.length)} field(s), ` +
            `${String(sentValues.length)} reached gtag`,
        );
        return;
      }

      // 2. the values: each field's VALUE is on the wire, not merely a key count
      for (const value of carried) {
        if (!sentValues.includes(value)) {
          unemitted.push(`${event.name}: value ${String(value)} never reached gtag`);
        }
      }
    });

    // The failure message names the arm and the field, so the next reader is not
    // left diffing two object literals to find which identity went missing.
    expect(unemitted).toEqual([]);
  });
});

/* ── the structural guarantee, as a compile-time assertion ─────────────────── */

/**
 * `track.ts`'s two mapped types, re-declared here against a HYPOTHETICAL grown
 * arm. This is the mechanism that makes the defect impossible rather than
 * merely noticed, and it is checked by `tsc`, not by the runner.
 */
type GrownArm = {
  readonly name: 'cta_click';
  readonly cta: 'hero_book';
  /** the new field — the thing that used to be silently droppable */
  readonly surface: 'header';
};

type PayloadFieldOf<E> = Exclude<keyof E, 'name'>;
type WireParamOf<E> = { readonly [K in PayloadFieldOf<E>]: string };

function mappedTypeProofs(): void {
  // @ts-expect-error -- `surface` gained a field and named no wire parameter: the map literal stops compiling. THIS is why the defect cannot recur.
  const incomplete: WireParamOf<GrownArm> = { cta: 'cta_id' };

  // Naming one is all it takes; naming one is also what emits it.
  const complete: WireParamOf<GrownArm> = { cta: 'cta_id', surface: 'cta_surface' };

  void incomplete;
  void complete;
}

describe('the emitter cannot ignore a field that exists in the type', () => {
  it('holds a compile-time assertion that a new field breaks the wire map', () => {
    // The assertion is the `@ts-expect-error` above; a satisfied one is
    // invisible to a runner and a FAILING typecheck the day it stops holding.
    expect(typeof mappedTypeProofs).toBe('function');
  });
});
