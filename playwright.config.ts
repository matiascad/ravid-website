// ── BROWSER GATE CONFIG ──────────────────────────────────────────────────────
//
// WHAT THIS FILE FIXES
//   `package.json` has declared `"e2e": "playwright test"` for this entire
//   rebuild, and there was NO playwright config anywhere in the repo. With no
//   config, Playwright has no testDir and falls back to scanning the whole
//   tree with its default glob, `**/*.@(spec|test).?(c|m)[jt]s?(x)`. In this
//   repo that glob matches ZERO browser scripts (the three real ones are
//   plain `.mjs` programs, not `*.spec.ts`) and DOES match the VITEST unit
//   suite — files written for jsdom + vitest globals, which throw
//   `ReferenceError: beforeEach is not defined` the moment Playwright's
//   loader touches them. The run ended:
//
//       Error: No tests found
//       Total: 0 tests in 0 files
//
//   That is worse than an unproven gate. A CI step that checks only the exit
//   code reads "collected nothing" as SUCCESS. The repo believed it had a
//   browser gate and had an always-green no-op.
//
// WHY THIS MATTERS MORE THAN IT LOOKS
//   Earlier in this run, `tsc`, ESLint, 261 unit tests and five static gates
//   were ALL GREEN while the booking button was invisible: `bg-gold` was an
//   undefined Tailwind utility, and Tailwind emits nothing for a class it
//   cannot resolve — no error, no warning, no CSS. jsdom loads no stylesheet,
//   so the unit suite is structurally incapable of noticing. A real browser
//   reading `getComputedStyle` is the ONLY check in this repo that can.
//
// ── HOW THE VITEST FILES ARE EXCLUDED ────────────────────────────────────────
//   Not by a blocklist — by CONSTRUCTION, on two independent axes at once:
//
//     axis          vitest owns                        playwright owns
//     ──────────────────────────────────────────────────────────────────────
//     directory     `**/__tests__/**` (repo-wide)       `tests/e2e/` only
//     filename      `*.test.ts` / `*.test.tsx`          `*.spec.ts`
//
//   `testDir` below confines collection to `tests/e2e`, which contains no
//   `__tests__` directory; `testMatch` accepts only `*.spec.ts`, and no file
//   under `tests/e2e` is named `*.test.ts`. Either axis alone would separate
//   the two runners; both together mean neither config can reach the other's
//   files even if someone later adds a directory to one of them. The two
//   runners cannot fight over a file because their sets are disjoint twice.
//   (vitest's own `include` is `**/__tests__/**/*.test.{ts,tsx}` with
//   `exclude: [... 'e2e/**']` — vitest.config.ts, untouched by this change.)
//
// ── HONEST LIMIT — what this gate does NOT cover ─────────────────────────────
//   1. IT MEASURES THE DEV SERVER, NOT THE PRODUCTION BUILD. `webServer` runs
//      `next dev`. Verified this run: dev reproduces the production-measured
//      CTA values byte-identically (rgb(76,95,235) / 223x52 / rgb(209,163,71)
//      / 342x56), and an undefined Tailwind class emits nothing in dev exactly
//      as in prod, so the class of bug this gate exists for is caught. It is
//      still NOT proof about minification, the static export, or anything
//      `next build` does differently. `next build` is non-deterministic in
//      this repo right now (D-130: intermittent `ENOENT ... rename
//      '.next/export/500.html'`), and a gate that fails for reasons unrelated
//      to the change is a gate people learn to ignore. Point the same specs at
//      a production server with E2E_BASE_URL when you want that proof.
//   2. ONE BROWSER, ONE VIEWPORT. Chromium at 390x844. No Firefox, no WebKit,
//      no desktop breakpoint. A CTA that is invisible only on Safari, or only
//      at 1440px, passes this gate.
//   3. ONE LOCALE FOR THE STYLE CONTRACT. The colour/size contract is asserted
//      on `/he`, the primary locale. `/en` is covered only where a spec says
//      so explicitly.
//   4. NO SCREENSHOT DIFFING. The gate asserts named computed values, so it
//      catches a CTA going transparent, unstyled or unclickable. It does NOT
//      catch a layout that is merely ugly, an image that failed to load, or
//      text that overflows its box.
//   5. IT ASSERTS THE CTAs IT KNOWS ABOUT. A NEW call to action added later is
//      not covered until someone adds it to the contract table in
//      `cta-visibility.spec.ts`. The gate cannot discover an obligation it was
//      never told about.
//
import { defineConfig, devices } from '@playwright/test';
import { E2E_BASE_URL, E2E_EXTERNAL_TARGET, E2E_PORT, E2E_HOST } from './tests/e2e/e2e.env.mjs';

export default defineConfig({
  testDir: './tests/e2e',

  // Only `*.spec.ts`. See "HOW THE VITEST FILES ARE EXCLUDED" above: this is
  // the filename axis of a two-axis separation, not a hopeful guess.
  testMatch: '**/*.spec.ts',

  // Keep browser artefacts beside the repo's other generated evidence rather
  // than scattering a new top-level `test-results/`.
  outputDir: './artifacts/e2e',

  // A gate whose failure is negotiable is not a gate.
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: [['list']],

  use: {
    baseURL: E2E_BASE_URL,
    // The contract values in cta-visibility.spec.ts were measured at exactly
    // this viewport. Changing it here invalidates them, so it lives here once.
    ...devices['Desktop Chrome'],
    viewport: { width: 390, height: 844 },
    isMobile: false,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium-mobile-390' }],

  // The suite starts its own server. It does NOT inherit a port someone
  // remembered to open, and `reuseExistingServer: false` means it refuses to
  // measure a server it did not start — a stale `next-server` answering on the
  // gate's port must be a loud failure, never a silent wrong measurement.
  // Skipped entirely when the operator aimed the gate elsewhere.
  webServer: E2E_EXTERNAL_TARGET
    ? undefined
    : {
        command: `npm run dev -- --port ${E2E_PORT} --hostname ${E2E_HOST}`,
        url: `${E2E_BASE_URL}/he`,
        reuseExistingServer: false,
        timeout: 180_000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
