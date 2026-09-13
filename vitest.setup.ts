// ─────────────────────────────────────────────────────────────────────────────
// W2-FIX-B TEST HARNESS — vitest.setup.ts
//
// INVARIANT     Every test file in this repo starts against an EMPTY document.
//               `cleanup()` runs after every single test, everywhere, without any
//               test file asking for it; and jest-dom's matchers (`toBeInTheDocument`,
//               `toHaveTextContent`, …) are registered exactly once, here, for all
//               of them. No `any` appears in this file.
//
// IMPOSSIBLE    Cross-test DOM leakage can no longer be CONSTRUCTED. Thirteen
//               independently-written W4 section tests cannot leave mounted trees
//               behind for each other: a test that renders a section and forgets
//               to unmount still hands the next test a clean body, so the failure
//               mode "test B passes only because test A rendered first" — and its
//               mirror, "test B fails only because test A rendered first" — are
//               both out of reach. Equally impossible: a section test that passes
//               in isolation and fails in the suite because a matcher was
//               registered in one file and not another.
//
// CLASS         Closed by derivation for DOM isolation across the whole suite:
//               `setupFiles` applies per test FILE by the runner's own contract,
//               so isolation is a property of the harness, not of any test's
//               discipline. NOT a general state-isolation guarantee — see limit.
//
// HONEST LIMIT  This cleans the DOM and nothing else. Module-level mutable state,
//               a module registry cached across tests in the same file, `localStorage`,
//               timers, `document.cookie`, global mocks a test installs by hand,
//               and anything a test writes to `window` all SURVIVE this hook. It
//               also cannot unmount a tree rendered outside Testing Library's
//               `render()` (a manual `createRoot`), and it does not isolate test
//               FILES from each other beyond what the runner's own per-file
//               environment already does.
// ─────────────────────────────────────────────────────────────────────────────

import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Registered once, for every test file the harness collects. Individual test
// files must NOT repeat this — one fact, one place.
afterEach(() => {
  cleanup();
});
