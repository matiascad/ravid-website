// ─────────────────────────────────────────────────────────────────────────────
// W2-FIX-B TEST HARNESS — vitest.config.ts
//
// INVARIANT     There is exactly ONE test runner configuration in this repo, and
//               every test in it runs under the same five conditions: jsdom DOM,
//               `globals: true`, the React plugin, `./vitest.setup.ts`, and one
//               module-resolution rule (see `server.deps.inline` below) that makes
//               bundler-style resolution available to dependencies that assume it.
//               The
//               `@` alias here resolves to the repo root — the SAME mapping as
//               `tsconfig.json`'s `paths: { "@/*": ["./*"] }` — so an import that
//               type-checks resolves at runtime, and one that resolves also
//               type-checks. One fact, one place.
//
// IMPOSSIBLE    Thirteen incompatible harnesses can no longer be CONSTRUCTED.
//               A W4 section delegate cannot need a per-file jsdom pragma, cannot
//               need to import `describe`/`it`/`expect`, cannot need a relative
//               `../../lib/utils` climb to dodge a missing alias, and cannot need
//               its own `cleanup()` call — all four are settled here for every
//               test at once, so the workarounds that would diverge have nothing
//               to work around. Also impossible: a test under `_legacy/` running.
//               Quarantined code is excluded from collection by construction, so
//               "we quarantined it but CI still runs it" cannot happen.
//
// CLASS         Closed by derivation for test COLLECTION and ENVIRONMENT across
//               the whole repo: `include` is a repo-wide glob, not a list of
//               files, so any `__tests__/*.test.ts(x)` added anywhere by anyone
//               is collected under these exact conditions without editing this
//               file. NOT a policy about what tests assert — this closes how
//               tests are found and run, not whether they are any good.
//
// HONEST LIMIT  This guarantees only that tests RUN and that a failure is
//               REPORTED with a non-zero exit code (proved: see W2-FIX-B report,
//               four red proofs). It does NOT guarantee coverage: zero tests
//               collected still exits 0 in a `--passWithNoTests` world, and a
//               file outside `**/__tests__/**` is silently never run. It does not
//               type-check — vitest strips types, it does not verify them; `npm
//               run typecheck` is a separate gate. It does not enforce that the
//               `@` alias here and the one in tsconfig.json stay equal: they are
//               two files that must agree, and nothing but review detects drift.
//               `_legacy/**` exclusion is proved only as a PATTERN match today,
//               because `_legacy/` currently contains 0 test files — see report.
//               And `server.deps.inline` is a LIST, not a rule: it names
//               `next-intl` because that package was measured to break, and the
//               NEXT dependency shipping extensionless-import ESM will break
//               collection exactly the same way until someone adds it here. This
//               file cannot derive that set; it can only record it. That is a
//               deliberate trade — see the block on the array itself — and it is
//               the one place in this config that is an instance, not a closure.
//               Ledger D-17 is also still open here: line ~42 loads as CommonJS
//               and Vite warns about ESM syntax. Its closer is a rename to `.mts`
//               (NOT `"type": "module"` in package.json, which would break the
//               CommonJS `next.config.js`). Deferred on purpose, not overlooked.
// ─────────────────────────────────────────────────────────────────────────────

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  // Mirrors tsconfig.json `paths: { "@/*": ["./*"] }`. If these two ever
  // disagree, tests and the compiler disagree about what a module IS.
  resolve: {
    alias: {
      '@': rootDir,
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', '_legacy/**', 'e2e/**'],
    restoreMocks: true,

    // WHY THIS ONE PACKAGE IS INLINED — do not generalise it to `true`.
    //
    // `next-intl@4.14.4` is `"type": "module"` and its middleware build does
    // `import { NextResponse } from 'next/server'` — EXTENSIONLESS. The `next`
    // package publishes NO `exports` map (verified: `require('next/package.json')
    // .exports === undefined`), so extension resolution is a BUNDLER convention,
    // not something Node performs. The moment Vitest externalises `next-intl` to
    // native Node ESM — which it does by default for anything under node_modules —
    // Node refuses to append `.js` and collection dies:
    //
    //   Error: Cannot find module '<root>/node_modules/next/server' imported from
    //   <root>/node_modules/next-intl/dist/esm/development/middleware/middleware.js
    //   Did you mean to import "next/server.js"?
    //
    // Measured, not assumed: that is the verbatim error from `npx vitest run`
    // immediately before this array existed. `node_modules/next/server.js` is
    // present on disk the whole time; only bundler-style resolution finds it.
    //
    // Inlining routes `next-intl` through Vite's resolver, which DOES apply that
    // convention. Scoped to the single offending package on purpose: `inline: true`
    // would silently change how every other dependency is loaded, and a harness
    // that quietly transforms everything hides the next package that ships broken
    // ESM instead of reporting it.
    server: {
      deps: {
        inline: ['next-intl'],
      },
    },
  },
});
