// ─────────────────────────────────────────────────────────────────────────────
// W10-A · CONFIGURED BEHAVIOUR + PII — lib/analytics/__tests__/track.test.ts
//
// ⚠ WHAT THIS FILE PROVES, AND WHAT IT DOES NOT. Read before trusting it.
//
// PROVED (a computed effect, at this project's real boundary): given a validated
// measurement id and a `window.gtag`, `track(event)` calls that function exactly
// once, with the event's name and with the exact payload the catalogue derives —
// and never calls it for an event fired without an id. `window.gtag` IS the
// boundary this repository owns: `gtagInitSnippet` in `@/lib/analytics` is what
// defines it, and everything past it belongs to Google.
//
// NOT PROVED — and NOT-MEASURED, named so nobody mistakes a green bar for
// delivery: that gtag.js downloads, that it executes, that the id names a real
// GA4 property, that a hit leaves the browser, that Google records it, or that
// anyone can see it in a report. NONE of that is reachable here. There is no GA4
// account and no measurement id in this project; the id used below is a
// synthetic in-test fixture and exists only in this file's memory. Owner of the
// unmeasured part: a human with a real property id, plus W14-B's browser pass.
//
// The fixture id is DELIBERATELY not committed to any source file other than as
// this test's local constant, and it is obviously not real.
//
// ⚠ D-76 DECLARATION — W10-FIX1 CHANGED AN EXISTING ASSERTION, ON PURPOSE.
// The test below was `reports the seven payload-free events by name, with no
// payload`, and it asserted `['event','cta_click']`, `['event','form_fail']` and
// `['event','lang_switch']` — calls with NO third argument. Those three lines
// were the DEFECT written down as an expectation: the arms carry `cta`,
// `reason` and `to`, and the emitter dropped them. The assertion is not
// weakened, it is TIGHTENED — the three events are now asserted to carry their
// identity AND its value, and the genuinely payload-free arms are now asserted
// to arrive with a literal argument count of 2 (a stricter statement than the
// old one, which never looked at arity). The arms this change does not touch —
// `wine_click`, `scroll_depth` — keep their assertions byte-for-byte.
//
// HONEST LIMIT  The spy proves the call, not the transmission. Substituting a
//               function for `window.gtag` is exactly the kind of name-level
//               stand-in Law 8 warns about — its value here is that the ASSERTED
//               thing (a call with a specific payload) is one this code actually
//               performs, not one it merely declares.
// ─────────────────────────────────────────────────────────────────────────────

import { LOCALES } from '@/config/site';
import { MEASUREMENT_ID_ENV_VAR } from '@/lib/analytics';
import {
  CTA_IDS,
  FORM_FAIL_REASONS,
  SCROLL_DEPTHS,
  ctaClick,
  formFail,
  formSubmitAttempt,
  formSuccess,
  instagramClick,
  langSwitch,
  scrollDepth,
  whatsappClick,
  wineClick,
} from '@/lib/analytics/events';
import { track } from '@/lib/analytics/track';

/** Obviously synthetic. Not a GA4 property; it only has to match the shape. */
const FIXTURE_MEASUREMENT_ID = 'G-W10AFIXTURE';

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

describe('track(), measurement id CONFIGURED', () => {
  it('ALL NINE EVENTS: the exact arguments gtag received', () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    track(ctaClick('hero_book'));
    track(formSubmitAttempt());
    track(formSuccess());
    track(formFail('http_503'));
    track(whatsappClick());
    track(instagramClick());
    track(wineClick('trio'));
    track(langSwitch('en'));
    track(scrollDepth(75));

    // Not "gtag was called" and not "eventParams returned an object": the
    // recorded argument list, in full, for every event this site can emit.
    expect(gtag.mock.calls).toEqual([
      ['event', 'cta_click', { cta_id: 'hero_book' }],
      ['event', 'form_submit_attempt'],
      ['event', 'form_success'],
      ['event', 'form_fail', { failure_reason: 'http_503' }],
      ['event', 'whatsapp_click'],
      ['event', 'instagram_click'],
      ['event', 'wine_click', { variant: 'trio' }],
      ['event', 'lang_switch', { target_language: 'en' }],
      ['event', 'scroll_depth', { depth: 75 }],
    ]);
  });

  it('the three identities carry the value the CALLER named, not a constant', () => {
    // A fix that hard-coded `hero_book` would pass the table above. This is the
    // assertion that says the value travels: every member of every closed
    // identity list, one call each, read back off the boundary.
    const gtag = vi.fn();
    window.gtag = gtag;

    for (const cta of CTA_IDS) {
      track(ctaClick(cta));
    }
    for (const reason of FORM_FAIL_REASONS) {
      track(formFail(reason));
    }
    for (const locale of LOCALES) {
      track(langSwitch(locale));
    }

    expect(gtag.mock.calls).toEqual([
      ['event', 'cta_click', { cta_id: 'hero_book' }],
      ['event', 'cta_click', { cta_id: 'hero_story' }],
      ['event', 'cta_click', { cta_id: 'why_book' }],
      ['event', 'form_fail', { failure_reason: 'client_invalid' }],
      ['event', 'form_fail', { failure_reason: 'http_413' }],
      ['event', 'form_fail', { failure_reason: 'http_422' }],
      ['event', 'form_fail', { failure_reason: 'http_429' }],
      ['event', 'form_fail', { failure_reason: 'http_500' }],
      ['event', 'form_fail', { failure_reason: 'http_503' }],
      ['event', 'form_fail', { failure_reason: 'http_other' }],
      ['event', 'form_fail', { failure_reason: 'ok_without_id' }],
      ['event', 'form_fail', { failure_reason: 'network' }],
      ['event', 'lang_switch', { target_language: 'he' }],
      ['event', 'lang_switch', { target_language: 'en' }],
    ]);
  });

  it('THE NEGATIVE: a payload-free event sends no stray parameter at all', () => {
    // Two arguments, not three-with-an-empty-object and not
    // three-with-undefined. Counted, because `toEqual` on a nested object is
    // not where an accidental `{}` would be noticed.
    const gtag = vi.fn();
    window.gtag = gtag;

    track(formSubmitAttempt());
    track(formSuccess());
    track(whatsappClick());
    track(instagramClick());

    expect(gtag.mock.calls.map((call) => call.length)).toEqual([2, 2, 2, 2]);
    expect(gtag.mock.calls).toEqual([
      ['event', 'form_submit_attempt'],
      ['event', 'form_success'],
      ['event', 'whatsapp_click'],
      ['event', 'instagram_click'],
    ]);
  });

  it('carries the wine variant, and carries the one the caller named', () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    track(wineClick('trio'));

    expect(gtag.mock.calls).toEqual([
      ['event', 'wine_click', { variant: 'trio' }],
    ]);
  });

  it('carries each of the four scroll depths and invents no fifth', () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    for (const depth of SCROLL_DEPTHS) {
      track(scrollDepth(depth));
    }

    expect(gtag.mock.calls).toEqual([
      ['event', 'scroll_depth', { depth: 25 }],
      ['event', 'scroll_depth', { depth: 50 }],
      ['event', 'scroll_depth', { depth: 75 }],
      ['event', 'scroll_depth', { depth: 100 }],
    ]);
  });

  it('reports nothing when the id is malformed — a typo reads as "off"', () => {
    // `GT-` is a Google Tag container, not a GA4 measurement id. W5-C's
    // validator rejects it, so the substrate falls back to the safe state.
    process.env[MEASUREMENT_ID_ENV_VAR] = 'GT-ABC123';
    const gtag = vi.fn();
    window.gtag = gtag;

    track(ctaClick('hero_book'));

    expect(gtag).not.toHaveBeenCalled();
  });

  it('DROPS rather than QUEUES: an event fired before gtag exists never arrives later', () => {
    // The privacy decision, asserted. Fire while the bootstrap has not run…
    track(formSuccess());

    // …then let the page become configured and fully live.
    const gtag = vi.fn();
    window.gtag = gtag;

    // Nothing from before is replayed. If a queue were ever added, this is the
    // test that turns red, and it is red for a privacy reason, not a perf one.
    expect(gtag).not.toHaveBeenCalled();

    track(formSuccess());
    expect(gtag.mock.calls).toEqual([['event', 'form_success']]);
  });
});

describe('PII cannot reach an event payload', () => {
  /**
   * ⚠ THIS IS A BACKSTOP, NOT THE GUARANTEE. The real guarantee is STRUCTURAL
   * and lives in the type: no arm of `AnalyticsEvent` has a field of type
   * `string`, so a lead's name, phone, email or message is not assignable to
   * any payload field — a COMPILE ERROR, captured verbatim in the W10-A report,
   * observed rather than assumed. What this runtime test adds is the weaker,
   * still worth having, fact that the emitter does not smuggle extra keys onto
   * the wire: the payload it sends is exactly the closed set the catalogue
   * derived, with nothing spread in beside it.
   */
  it('sends only the catalogue-derived keys — no field is added by the emitter', () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    track(wineClick('red'));
    track(scrollDepth(100));
    track(ctaClick('hero_story'));
    track(formFail('network'));
    track(langSwitch('he'));

    const payloads = gtag.mock.calls.map((call) => call[2]);
    expect(payloads).toEqual([
      { variant: 'red' },
      { depth: 100 },
      { cta_id: 'hero_story' },
      { failure_reason: 'network' },
      { target_language: 'he' },
    ]);

    for (const payload of payloads) {
      const keys = Object.keys(payload ?? {});
      expect(keys.some((key) => ['name', 'phone', 'email', 'message'].includes(key))).toBe(false);
      // W10-FIX1: one key per payload. The emitter builds its object from a
      // closed key list, so there is no path by which a second key appears.
      expect(keys).toHaveLength(1);
    }
  });
});
