// ─────────────────────────────────────────────────────────────────────────────
// W5-C ANALYTICS — components/__tests__/Analytics.test.tsx
//
// INVARIANT     Three facts are asserted here and each one can fail. (1) With
//               the measurement id UNSET, the document contains NO script at
//               all. (2) With it SET, a gtag loader and an inline bootstrap
//               appear and BOTH carry that exact id — the id itself is matched,
//               never "something rendered". (3) The component is IMPORTED and
//               MOUNTED in app/[locale]/layout.tsx, and the module that import
//               names actually RESOLVES.
//
// IMPOSSIBLE    The old repo's defect — a component present in the tree with 0
//               import sites — cannot recur silently. Test 3 fails if the import
//               statement is deleted, if the `<Analytics />` element is deleted,
//               or if the module stops resolving. Also impossible: env leakage
//               between these tests (saved and restored per test) and DOM
//               leakage between them (see the beforeEach note — `cleanup()`
//               alone is NOT enough here, and that is measured, not assumed).
//
// CLASS         THIS INSTANCE. It proves THIS component is mounted. It does not
//               install a repo-wide rule that every component must be; a second
//               dead component would need its own test.
//
// HONEST LIMIT  1. TEST 3 READS SOURCE TEXT, NOT A RENDER. It cannot render the
//                  layout: `LocaleLayout` is an async server component that
//                  emits <html>/<body>, calls `next/font`, `setRequestLocale`
//                  and `notFound()`. A text assertion is what is mechanically
//                  available, and its weakness is real — it would accept an
//                  `<Analytics />` inside a dead branch, or a second import that
//                  shadows the first. It is paired with a RESOLUTION assertion
//                  (`typeof Analytics`) precisely because the text half alone is
//                  the weaker half: app/__tests__/seo.test.ts:366 makes the same
//                  text assertion and it PASSED for the entire window in which
//                  components/Analytics.tsx did not exist — text cannot see a
//                  missing module. The pair can.
//               2. NO NETWORK IS PROVED, IT IS INHERITED. jsdom is created by
//                  vitest with `resources` unset (measured in vitest's jsdom
//                  environment), so an appended `<script src>` is never fetched
//                  and gtag.js never runs — which is why no analytics beacon can
//                  fire from this suite. This file does not itself assert that;
//                  it relies on the harness, and says so.
//               3. THE INLINE SNIPPET IS EXECUTED BY JSDOM (`runScripts:
//                  'dangerously'`, vitest's default) when it is appended. It
//                  defines `window.dataLayer` and a local `gtag` that only
//                  pushes to an array — real gtag.js is never loaded, so nothing
//                  is transmitted. That execution is a side effect this file
//                  tolerates; it does not assert on it.
//               4. `next/script` KEEPS MODULE-LEVEL LOAD CACHES keyed by id/src.
//                  A second render with the same id inside this file would be
//                  silently skipped. Test 2 renders the configured case exactly
//                  once, deliberately.
//               5. NOTHING HERE TESTS lib/analytics.ts DIRECTLY — no
//                  `measurementId()` unit test, no rejected-shape table. The
//                  component is the only caller and is covered through it; the
//                  branded-type guarantee is enforced by the compiler, not here.
//
// Harness: `globals: true` — describe/it/expect are NOT imported, and
// `cleanup()` is NOT called (vitest.setup.ts owns it).
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render } from '@testing-library/react';

import { Analytics } from '@/components/Analytics';
import { MEASUREMENT_ID_ENV_VAR } from '@/lib/analytics';

/** Obviously synthetic. This is NOT a real GA4 property — see the wave's rule
 *  that no real id may appear in the repo. It only has to match the shape. */
const TEST_MEASUREMENT_ID = 'G-TESTONLY0';

const LAYOUT_PATH = 'app/[locale]/layout.tsx';

/* ── isolation ────────────────────────────────────────────────────────────── */

let savedEnv: string | undefined;

/**
 * WHY THE DOM IS SWEPT BY HAND, when vitest.setup.ts already calls `cleanup()`.
 * `next/script` with `afterInteractive` does NOT render a <script> into React's
 * container — it appends one to `document.body` from an effect. That node lives
 * OUTSIDE the container Testing Library unmounts, so `cleanup()` cannot remove
 * it and the configured test would leak a <script> into the unconfigured test.
 * Sweeping restores the precondition test 1 needs; it weakens no assertion —
 * test 1 still asserts that the WHOLE document holds zero scripts after render.
 */
function sweepInjectedScripts(): void {
  for (const node of Array.from(document.querySelectorAll('script'))) {
    node.remove();
  }
}

beforeEach(() => {
  savedEnv = process.env[MEASUREMENT_ID_ENV_VAR];
  delete process.env[MEASUREMENT_ID_ENV_VAR];
  sweepInjectedScripts();
});

afterEach(() => {
  if (savedEnv === undefined) {
    delete process.env[MEASUREMENT_ID_ENV_VAR];
  } else {
    process.env[MEASUREMENT_ID_ENV_VAR] = savedEnv;
  }
  sweepInjectedScripts();
});

/* ── the tests ────────────────────────────────────────────────────────────── */

describe('Analytics', () => {
  it('emits NOTHING when the measurement id is unset — tonight`s actual state', () => {
    const { container } = render(<Analytics />);

    expect(container).toBeEmptyDOMElement();
    // The assertion that actually matters: no script anywhere in the document,
    // not merely an empty React container (see HONEST LIMIT 3 in the component).
    expect(document.querySelectorAll('script')).toHaveLength(0);
    expect(document.querySelector('[data-nscript]')).toBeNull();
  });

  it('emits a gtag loader and an inline bootstrap CARRYING THE ID when it is set', () => {
    process.env[MEASUREMENT_ID_ENV_VAR] = TEST_MEASUREMENT_ID;

    render(<Analytics />);

    const loader = document.querySelector('script[data-nscript][src]');
    expect(loader).not.toBeNull();
    const src = loader?.getAttribute('src') ?? '';
    expect(src).toContain('googletagmanager.com/gtag/js');
    // The id must REACH the output — the whole point of the component.
    expect(src).toContain(TEST_MEASUREMENT_ID);

    const inline = document.querySelector('script#ga4-init');
    expect(inline).not.toBeNull();
    const snippet = inline?.textContent ?? '';
    expect(snippet).toContain(`gtag('config', '${TEST_MEASUREMENT_ID}')`);

    // No second vendor came along for the ride — the old file shipped a Meta
    // Pixel behind an empty constant. Exactly two scripts, both Google's.
    expect(document.querySelectorAll('script')).toHaveLength(2);
  });

  it('rejects a malformed id rather than interpolating it into the page', () => {
    // A Google Tag container id, not a GA4 measurement id — a realistic mistake.
    process.env[MEASUREMENT_ID_ENV_VAR] = 'GT-ABC123';

    render(<Analytics />);

    expect(document.querySelectorAll('script')).toHaveLength(0);
  });

  /**
   * 🔴 THE TEST THE WAVE PLAN DEMANDS.
   * The old repo's Analytics.tsx existed, was 54 lines, and was imported 0 times
   * across 11 files scanned. Nothing detected it. This detects it.
   */
  it('is IMPORTED and MOUNTED in app/[locale]/layout.tsx — the 0-import defect', () => {
    const layout = readFileSync(join(process.cwd(), LAYOUT_PATH), 'utf8');

    // The import must exist, by the exact specifier and the exact NAMED form.
    expect(layout).toMatch(
      /import\s*\{\s*Analytics\s*\}\s*from\s*'@\/components\/Analytics'/,
    );
    // ...and it must actually be RENDERED, not merely imported.
    expect(layout).toMatch(/<Analytics\s*\/>/);

    // The half a text assertion cannot make: the module that specifier names
    // RESOLVES and exports `Analytics`. seo.test.ts:366 makes the two text
    // assertions above and passed while this file did not exist at all.
    expect(typeof Analytics).toBe('function');
  });
});
