// ── THE CTA VISIBILITY GATE ──────────────────────────────────────────────────
//
// WHAT THIS EXISTS TO CATCH
//   A call to action that renders in the DOM, passes every unit test, passes
//   `tsc`, passes ESLint — and is INVISIBLE in a browser. That is not
//   hypothetical: it happened on this repo earlier in this run. `bg-gold` was
//   an undefined Tailwind utility. Tailwind emits nothing for a class it
//   cannot resolve: no error, no warning, no CSS. The element kept its class
//   attribute, kept its text, kept its box, and its background computed to
//   `rgba(0, 0, 0, 0)`. 261 unit tests were green. The booking button — the
//   one thing this page exists to produce — could not be seen.
//
//   jsdom loads no stylesheet. `getComputedStyle` there returns the inline
//   style and nothing else. So NO unit test in this repo, present or future,
//   can make a single assertion in this file. That asymmetry is the whole
//   reason a browser gate is worth its runtime.
//
// LAW 8 — ASSERT THE EFFECT, NEVER THE IDENTIFIER
//   Nothing below asserts that a class name is present, that an element
//   exists, or that a script is declared. Class names are how the CTA is
//   BUILT; they are not evidence it is VISIBLE. `bg-gold` was present in the
//   class attribute throughout the outage. Every assertion here is a computed
//   colour, a measured box, a derived contrast ratio, or a real click.
//
// THE TWO LAYERS, AND WHY BOTH
//   1. EXACT CONTRACT — the precise computed values measured in a real
//      Chromium. Catches a CTA whose colour silently changes.
//   2. STRUCTURAL VISIBILITY — alpha, contrast against the backdrop actually
//      behind the element, and tap-target size. Derived, not hardcoded, so it
//      catches an undefined utility on a CTA whose exact colour nobody has
//      written down yet. Layer 1 alone would be a table of magic numbers;
//      layer 2 alone would miss a wrong-but-opaque colour.
//
// THE GHOST BUTTON IS NOT A BUG
//   `hero_story` is a DELIBERATE ghost button: transparent background, real
//   1px border. Asserting "every CTA has a filled background" would be a
//   false alarm forever, and a gate that cries wolf gets deleted. Its
//   visibility contract is therefore its BORDER, asserted with the same rigour.
//   See `kind: 'ghost'` below.
//
import { test, expect, type Page, type Locator } from '@playwright/test';

/* ── THE CONTRACT ──────────────────────────────────────────────────────────
 * ONE FACT, ONE PLACE. Every number below was measured in Chromium at
 * 390x844 on `/he` during this run, and independently re-measured against the
 * gate's own dev server before being written down. Adding a CTA to the page
 * means adding a row here; there is no second list to keep in sync.
 *
 * `locate` is how the element is FOUND — a structural detail, never the
 * substance of an assertion. The in-page hrefs are built by `anchor()` in
 * config/site.ts and are the only stable, locale-independent handle on these
 * controls: they carry no test-only attributes, and their visible text is
 * Hebrew copy this file must not contain.
 */
type CtaContract = {
  /** Analytics key the component reports this control as. Documentation only. */
  readonly key: string;
  readonly kind: 'filled' | 'ghost';
  readonly locate: (page: Page) => Locator;
  /** Exact computed `background-color`. */
  readonly background: string;
  /** Exact computed `color`. */
  readonly color: string;
  /** Exact computed `border-top` triple, ghost buttons only. */
  readonly border?: string;
  readonly width: number;
  readonly height: number;
};

const HERO_BOOK_HREF = '#form';
const HERO_STORY_HREF = '#story';

const CTAS: readonly CtaContract[] = [
  {
    key: 'hero_book',
    kind: 'filled',
    // First `#form` anchor in document order is the hero's; the Why section's
    // is the second. Asserted below to be exactly two, so "first" cannot
    // silently start meaning a different button.
    locate: (page) => page.locator(`a[href="${HERO_BOOK_HREF}"]`).nth(0),
    background: 'rgb(76, 95, 235)',
    color: 'rgb(255, 255, 255)',
    width: 223,
    height: 52,
  },
  {
    key: 'why_book',
    kind: 'filled',
    locate: (page) => page.locator(`a[href="${HERO_BOOK_HREF}"]`).nth(1),
    background: 'rgb(76, 95, 235)',
    color: 'rgb(255, 255, 255)',
    width: 223,
    height: 52,
  },
  {
    key: 'hero_story',
    kind: 'ghost',
    locate: (page) => page.locator(`a[href="${HERO_STORY_HREF}"]`).first(),
    // DELIBERATELY transparent. Do not "fix" this to a filled colour.
    background: 'rgba(0, 0, 0, 0)',
    color: 'rgb(233, 233, 237)',
    border: '1px solid rgb(54, 54, 78)',
    width: 203,
    height: 54,
  },
  {
    key: 'form_submit',
    kind: 'filled',
    locate: (page) => page.locator('form button[type=submit]').first(),
    background: 'rgb(209, 163, 71)',
    color: 'rgb(0, 0, 0)',
    width: 342,
    height: 56,
  },
];

/** Sub-pixel layout and font metrics move boxes by a pixel; a broken CTA moves
 *  them by tens. Wide enough not to flake, tight enough to mean something. */
const BOX_TOLERANCE_PX = 3;

/** WCAG AA for large/bold text. The CTAs are 16px bold. All four pass today. */
const MIN_TEXT_CONTRAST = 4.5;

/**
 * The floor for "this surface is PAINTED and is not the backdrop".
 * 1.05 is deliberately just above 1.0 (identical colours) — it is a
 * VISIBILITY floor, not an accessibility grade.
 *
 * WHY NOT WCAG AA (3:1)?
 *   Because that is a DESIGN verdict, and this is a visibility gate. Measured
 *   this run: `hero_story`'s 1px `rgb(54, 54, 78)` border against the
 *   `rgb(25, 25, 41)` behind it is 1.48:1 — the intended ghost-button styling
 *   does NOT meet AA for a non-text boundary today. Asserting 3:1 here would
 *   paint this gate RED on arrival against the design as shipped, and a gate
 *   that is red on landing is not a gate, it is noise people learn to skip.
 *   Raising this floor is a change to the design, owed to whoever owns it —
 *   not something a test config gets to decide unilaterally.
 *
 * HONEST LIMIT
 *   Passing this floor therefore means "a user could see that something is
 *   drawn there", NOT "this is accessible". Those are different claims and
 *   this gate only makes the first.
 */
const MIN_DISTINGUISHABLE_CONTRAST = 1.05;

/** iOS/Android minimum comfortable tap target. */
const MIN_TAP_TARGET_PX = 44;

/* ── THE IN-PAGE PROBE ─────────────────────────────────────────────────────
 * Runs inside the real page, where a real stylesheet has been parsed and the
 * cascade has actually run. Everything it returns is a computed effect.
 */
type Probe = {
  background: string;
  color: string;
  borderTop: string;
  borderTopAlpha: number;
  backgroundAlpha: number;
  /** First OPAQUE background-color found walking up from the element. */
  backdrop: string;
  textContrast: number;
  fillContrast: number;
  borderContrast: number;
  opacity: number;
  visibility: string;
  width: number;
  height: number;
  hasText: boolean;
};

const probeElement = (el: Element): Probe => {
  const parse = (c: string): [number, number, number, number] => {
    const n = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0];
    return [n[0] ?? 0, n[1] ?? 0, n[2] ?? 0, n[3] ?? 1];
  };
  // WCAG 2.x relative luminance.
  const lum = ([r, g, b]: number[]): number => {
    const f = (v: number): number => {
      const s = (v ?? 0) / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r ?? 0) + 0.7152 * f(g ?? 0) + 0.0722 * f(b ?? 0);
  };
  const ratio = (a: string, b: string): number => {
    const la = lum(parse(a));
    const lb = lum(parse(b));
    const hi = Math.max(la, lb);
    const lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  };

  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  // The colour a user actually sees BEHIND this element: walk ancestors until
  // something is opaque. A transparent CTA is invisible precisely when this
  // equals its own background, which is what makes the check generic.
  let backdrop = 'rgb(255, 255, 255)';
  let node: Element | null = el.parentElement;
  while (node) {
    const bg = getComputedStyle(node).backgroundColor;
    if (parse(bg)[3] === 1) {
      backdrop = bg;
      break;
    }
    node = node.parentElement;
  }

  const background = cs.backgroundColor;

  // THE COLOUR ACTUALLY PAINTED AT THIS PIXEL — the element's background
  // composited over the backdrop (`src-over`), not the raw declared value.
  //
  // WHY THIS IS NOT A DETAIL: the first version of this probe compared the
  // RAW background against the backdrop. For a transparent element that
  // parses to [0, 0, 0, 0], so it silently compared BLACK against the
  // backdrop and reported a contrast of 1.2124 — a number that looks like a
  // painted surface. An invisible CTA would have cleared a "fill differs from
  // backdrop" check. Compositing makes the degenerate case exact: alpha 0
  // yields the backdrop itself, so the ratio is 1.0000 and the assertion
  // fires. It also handles a legitimately semi-transparent fill correctly
  // instead of guessing.
  const composite = (fg: string, bg: string): string => {
    const [fr, fgc, fb, fa] = parse(fg);
    const [br, bgc, bb] = parse(bg);
    const a = fa ?? 1;
    const mix = (f: number, b: number): number => Math.round(f * a + b * (1 - a));
    return `rgb(${mix(fr, br)}, ${mix(fgc, bgc)}, ${mix(fb, bb)})`;
  };
  const effectiveFill = composite(background, backdrop);

  return {
    background,
    color: cs.color,
    borderTop: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
    borderTopAlpha: parse(cs.borderTopColor)[3],
    backgroundAlpha: parse(background)[3],
    backdrop,
    textContrast: ratio(cs.color, effectiveFill),
    // Exactly 1.0 when the element paints nothing — see `composite` above.
    fillContrast: ratio(effectiveFill, backdrop),
    borderContrast: ratio(composite(cs.borderTopColor, backdrop), backdrop),
    opacity: Number(cs.opacity),
    visibility: cs.visibility,
    width: rect.width,
    height: rect.height,
    hasText: (el.textContent ?? '').trim().length > 0,
  };
};

test.describe('CTA visibility contract (/he, 390x844, real Chromium)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/he', { waitUntil: 'load' });
    // Fonts change measured box widths; wait for the real ones.
    await page.evaluate(() => document.fonts.ready);
  });

  test('the two booking anchors the contract names are the two on the page', async ({ page }) => {
    // Not an existence assertion dressed up: this pins the ORDINALS the
    // contract locates by. If a third `#form` anchor appears, "nth(1)" would
    // quietly start measuring a different control and every value below would
    // still pass while covering the wrong button.
    await expect(page.locator(`a[href="${HERO_BOOK_HREF}"]`)).toHaveCount(2);
  });

  for (const cta of CTAS) {
    test(`${cta.key} is rendered visible by the real stylesheet`, async ({ page }) => {
      const locator = cta.locate(page);
      await locator.scrollIntoViewIfNeeded();

      const probe = await locator.evaluate(probeElement);

      // ── layer 1: the exact measured contract ──────────────────────────────
      expect(probe.background, `${cta.key} computed background-color`).toBe(cta.background);
      expect(probe.color, `${cta.key} computed color`).toBe(cta.color);
      expect(probe.width, `${cta.key} rendered width`).toBeGreaterThan(cta.width - BOX_TOLERANCE_PX);
      expect(probe.width, `${cta.key} rendered width`).toBeLessThan(cta.width + BOX_TOLERANCE_PX);
      expect(probe.height, `${cta.key} rendered height`).toBeGreaterThan(cta.height - BOX_TOLERANCE_PX);
      expect(probe.height, `${cta.key} rendered height`).toBeLessThan(cta.height + BOX_TOLERANCE_PX);

      // ── layer 2: structural visibility, derived not hardcoded ─────────────
      expect(probe.opacity, `${cta.key} opacity`).toBe(1);
      expect(probe.visibility, `${cta.key} visibility`).toBe('visible');
      expect(probe.hasText, `${cta.key} renders its label`).toBe(true);
      expect(probe.height, `${cta.key} tap target height`).toBeGreaterThanOrEqual(MIN_TAP_TARGET_PX);
      expect(
        probe.textContrast,
        `${cta.key} label contrast against what is actually painted behind it`
      ).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);

      if (cta.kind === 'filled') {
        // THE `bg-gold` CATCH. An undefined Tailwind utility emits no rule, so
        // background-color falls back to `rgba(0, 0, 0, 0)`: alpha 0, and a
        // fill indistinguishable from the backdrop. Both of the next two
        // assertions fire on that, without naming a single class.
        expect(
          probe.backgroundAlpha,
          `${cta.key} must PAINT a background — alpha 0 means an undefined utility emitted no rule`
        ).toBe(1);
        expect(
          probe.fillContrast,
          `${cta.key} fill must be distinguishable from the ${probe.backdrop} behind it`
        ).toBeGreaterThanOrEqual(MIN_DISTINGUISHABLE_CONTRAST);
      } else {
        // The ghost button is visible BY ITS BORDER. Same rigour, different
        // contract — never assert it has a filled background.
        expect(probe.borderTop, `${cta.key} computed border-top`).toBe(cta.border);
        expect(probe.borderTopAlpha, `${cta.key} border must be opaque`).toBe(1);
        expect(
          probe.borderContrast,
          `${cta.key} border must be distinguishable from the ${probe.backdrop} behind it`
        ).toBeGreaterThanOrEqual(MIN_DISTINGUISHABLE_CONTRAST);
      }
    });
  }

  test('a booking CTA is actually clickable and moves the reader to the form', async ({ page }) => {
    // The strongest possible statement that the control is real: a user-grade
    // click, with Playwright's actionability checks (hit-target, stability,
    // not covered by an overlay) doing work no style assertion can do.
    const before = await page.evaluate(() => window.scrollY);
    await page.locator(`a[href="${HERO_BOOK_HREF}"]`).nth(0).click();
    await expect(page).toHaveURL(/#form$/);

    // The page scrolls SMOOTHLY, so the viewport is still mid-animation the
    // instant the click resolves. Sampling once here measured scrollY === 0
    // and failed a working button — the classic flaky-gate own goal. Poll for
    // the settled state instead of guessing a sleep duration.
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), {
        message: 'clicking the booking CTA scrolled the page',
        timeout: 10_000,
      })
      .toBeGreaterThan(before);

    // Arriving at the hash is not the same as the form being on screen.
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const form = document.getElementById('form');
            if (!form) return Number.POSITIVE_INFINITY;
            const { top, bottom } = form.getBoundingClientRect();
            // Fraction of the viewport the form actually occupies.
            const visible = Math.max(0, Math.min(bottom, window.innerHeight) - Math.max(top, 0));
            return visible / window.innerHeight;
          }),
        { message: 'the form is genuinely on screen after the click', timeout: 10_000 }
      )
      .toBeGreaterThan(0.5);
  });
});
