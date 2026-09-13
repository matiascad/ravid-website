/**
 * eslint.config.mjs — ESLint 9 flat config. The project's `any` gate (ledger D-13).
 *
 * _INVARIANT: The five rules below are ERRORS, never warnings. A warning exits 0, and a
 *   check that exits 0 on a violation is decoration, not a gate. `npx eslint .` exits
 *   non-zero on the first `any`, the first unused binding, the first `console.log`, the
 *   first `!` non-null assertion, and the first import of a next-intl MESSAGE READER in
 *   any linted file.
 *
 * _IMPOSSIBLE: The false red that D-13 was written to kill can no longer be CONSTRUCTED.
 *   These rules read the TypeScript AST, not the file's bytes. The token `any` inside a
 *   comment or a string literal is not an AST type node, so no comment can trip this gate —
 *   the failure mode that `grep -rn '\bany\b'` produced on this repo (3 hits, 3 of them
 *   comments, 0 real) has no representation here. Nor can a violation be downgraded to a
 *   warning in passing: severity lives in this one file, in one block, reviewable as a diff.
 *
 * _CLASS: This is the derivation, not the instance. The class is "gates read structure, not
 *   text." Any future lexical check over source (TODO bans, import bans, `@ts-ignore` bans)
 *   belongs here as a rule over the parsed tree, never as a grep over the bytes. This file is
 *   where that class of check lives; there is one such place, and this is it.
 *   W3-E adds the second member of that class and it is an IMPORT ban, exactly as predicted
 *   above — written as `no-restricted-imports` over ImportDeclaration nodes, not as a grep.
 *
 * _W3-E · REMOVE THE CAPABILITY (the message-key defect, cycle 4):
 *   _INVARIANT: There is exactly ONE way to read a message in this project — `getMessages()`
 *     from `@/i18n/messages`, which validates the catalogue with zod and derives its type from
 *     that schema. Every next-intl / use-intl API that can return a message is an import
 *     ERROR, repo-wide, with no file exempt.
 *   _IMPOSSIBLE: Reading a message by an UNCHECKED string key. The three previous cycles each
 *     added a type in front of that capability and each was defeated (a wildcard annotation,
 *     an augmentation whose key typing is collapsed by array values, an accessor that left the
 *     old path open beside it). This cycle deletes the capability instead of guarding it:
 *     `useTranslations`/`getTranslations` and their six siblings cannot be IMPORTED, so there
 *     is no `t` to mistype. A ban on a name cannot be collapsed by a catalogue's data shape,
 *     which is what defeated the type.
 *   _CLASS: Derivation, not instance. The ban is keyed on the IMPORTED NAME, not on a file
 *     path, so it holds for every file that exists now and every file added later, with no
 *     allowlist to maintain and nowhere to move a file to escape it.
 *   _HONEST_LIMIT: Four, stated plainly.
 *     a. It bans IMPORTS. A dynamic `await import('next-intl')` destructured at runtime, or a
 *        re-export laundered through a local module, is NOT seen by this rule. Nothing in the
 *        repo does either; if something ever does, this rule will not say so.
 *     b. `NextIntlClientProvider` / `IntlProvider` stay IMPORTABLE and their `messages` prop is
 *        unvalidated. That is deliberate — a provider supplies messages, it does not read one —
 *        and it is safe only because every consumer hook is banned. If a future delegate
 *        un-bans a hook, this hole opens with it.
 *     c. It does not verify the REPLACEMENT is used correctly, or used at all. A file that
 *        renders no text passes this rule exactly as a correct one does.
 *     d. `_legacy/**` is not linted (limit 5 below), so nothing here constrains quarantined
 *        code. The ban describes the live program only.
 *
 * _HONEST_LIMIT: Four limits, stated plainly.
 *   1. These four rules are AST-based, NOT type-aware. No `parserOptions.project` /
 *      `projectService` is enabled, so no rule here consults the type checker. Consequence:
 *      a LITERAL `any` — `x: any`, `as any`, `Array<any>` — is caught; an IMPLICIT any is
 *      NOT. A value that becomes `any` by flowing out of an untyped import, an unannotated
 *      parameter, or a generic that defaults to `any` is invisible to this file. That hole is
 *      closed by `tsc --noEmit` under `strict`, not by ESLint. The two gates are complements;
 *      neither alone proves the codebase is free of `any`.
 *   2. `eslint-config-next@15.5.25` ships NO flat config. Verified: its package.json has no
 *      `exports` map and `main` is a legacy eslintrc object (`{ extends: [...] }`). It is
 *      therefore loaded through the documented `FlatCompat` bridge from `@eslint/eslintrc`.
 *      This is the same bridge `create-next-app` generates. If a future
 *      `eslint-config-next` ships a real flat export, the two `compat.extends(...)` lines
 *      should be replaced by it and `FlatCompat` deleted.
 *   3. `@eslint/eslintrc` is imported here but is NOT declared in package.json. It resolves
 *      because `eslint@9.39.5` declares it as a direct dependency (`^3.3.6`). It is not
 *      declared directly because doing so without regenerating package-lock.json would break
 *      `npm ci` (package.json / lock desync), and the lock is outside this change's write-set.
 *      If eslint ever drops that dependency, this config fails LOUDLY at load time (module
 *      not found), never silently — but it is still an undeclared import. Closer: one command,
 *      `npm i -D @eslint/eslintrc@^3`, which updates both files at once.
 *   4. Coverage is UNEVEN by extension, deliberately. `.ts`/`.tsx` get the full TypeScript
 *      ruleset plus the four gate rules. Plain `.js`/`.mjs` files (next.config.js,
 *      postcss.config.js, this file) get only the Next.js/React/a11y set and `no-console`.
 *      A `.js` file is therefore held to a LOWER standard here. That is intentional — those
 *      rules describe TypeScript syntax a `.js` file does not have — but it means moving
 *      logic from a `.ts` file into a `.js` file silently lowers the bar on it.
 *   5. `ignores` is a promise about what is NOT checked. `_legacy/**` is quarantined code and
 *      is never linted — so nothing this gate says applies to anything in there, by design.
 *      This file cannot tell you whether quarantined code is clean; it asserts only that it
 *      is out of scope.
 *
 * _W6-FIX · SCOPE `no-console` TO `scripts/**` (CLI tooling) — NOT WEAKENED:
 *   `no-console` stays `'error'` for every other linted file, application code included — see
 *   the rule block below, which still fires the instant a `console.log` lands in a component,
 *   page, lib, or API route. The ONLY thing that changed is WHERE the rule applies: it no
 *   longer applies inside `scripts/**`, a build-time CLI (`scripts/optimize-assets.mjs`) whose
 *   entire job is to print a conversion report to a human. Console output there is that
 *   script's one and only output channel, not the noise this rule exists to catch — that noise
 *   was measured in application code (see the W1 audit note above), never in tooling.
 *   `scripts/**` is NOT added to `ignores`: files there are still parsed and linted in full for
 *   everything else that applies to a plain `.mjs` file (e.g. `no-restricted-imports`,
 *   Next.js/react rules bridged via FlatCompat). `no-explicit-any`, `no-unused-vars`, and
 *   `no-non-null-assertion` were never relevant to `scripts/**` in the first place — those are
 *   scoped to `**\/*.{ts,tsx}` and this directory is plain `.mjs` — so this change touches
 *   exactly one rule, in one directory, and disables, deletes, and downgrades nothing.
 *
 * _W7-FIX-F · EXTEND THE SAME SCOPE TO `tests/e2e/**` (Playwright verification scripts) —
 *   NOT WEAKENED, NOT WIDENED IN KIND:
 *   `tests/e2e/*.mjs` (`capture-screenshots.mjs`, `form-and-rtl.mjs`, `visual-verify.mjs`) are
 *   the same CLASS of file the W6-FIX block above was written for: plain Node scripts that drive
 *   Playwright against the running site and print what they find to a human. `console` is their
 *   only output channel, exactly as it is for `scripts/**`, so the same treatment applies —
 *   this is the W6-FIX argument re-measured one directory over, not a new one. `no-console`
 *   stays `'error'` everywhere else, application code included — see the rule block below,
 *   which still fires the instant a `console.log` lands in a component, page, lib, or API
 *   route. Verified two-sided when this change was made: `console.log` under
 *   `components/sections/**` still errors under `no-console`; the identical statement under
 *   `tests/e2e/**` does not. `tests/e2e/**` is NOT added to `ignores` — files there are
 *   still parsed and linted in full for every other rule that applies to a plain `.mjs` file.
 *   `__tests__/**` unit tests are NOT included here: they are application-adjacent (they assert
 *   on component/lib behavior, not on a human-facing CLI report) and are out of scope for this
 *   change.
 *   _HONEST_LIMIT: This widens WHERE `no-console` is off, not what it means. The risk any
 *   directory-scoped exemption carries — a future non-CLI file landing under `tests/e2e/**`
 *   and silently inheriting the exemption — is the same shape of risk `scripts/**` already
 *   accepted; it is extended to a second directory here, not newly introduced.
 */

import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

const config = [
  // Quarantine and generated output. Not linted, and that is the point of quarantine.
  {
    ignores: [
      '_legacy/**',
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
      '**/*.min.js',
    ],
  },

  // Next.js rules, bridged from eslintrc (see _HONEST_LIMIT 2).
  // React / hooks / a11y / Core Web Vitals apply to every linted file.
  ...compat.extends('next/core-web-vitals'),

  // `next/typescript` is RE-SCOPED to TypeScript. FlatCompat emits eslintrc `extends` as
  // config objects with no `files` key, which means "every file" — that would apply the
  // TypeScript parser and the TS-only ruleset to plain CommonJS `.js` configs too. Measured:
  // unscoped, this reported `next.config.js:29` under @typescript-eslint/no-require-imports
  // for a `require()` that is correct CommonJS in a CommonJS file. That is a false red of
  // exactly the kind D-13 exists to eliminate, so it is fixed HERE by narrowing scope —
  // not by disabling the rule, which still applies in full to every .ts/.tsx file.
  ...compat
    .extends('next/typescript')
    .map((cfg) => ({ ...cfg, files: ['**/*.{ts,tsx}'] })),

  // The gate. TypeScript-only rules, scoped to TypeScript so that this very file —
  // and any other .mjs/.js config — cannot fail on a rule about syntax it does not have.
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // D-13: the `any` gate, moved off grep and onto the parser.
      '@typescript-eslint/no-explicit-any': 'error',

      // W1 audit: the sources being replaced carried 37 dead files and 1 dead component.
      // next/typescript sets this to 1 (warn); a warn exits 0. Overridden to error.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // `!` is the same lie `any` is, in one character.
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },

  // Core rule, no TypeScript dependency, so it applies to every linted file.
  // warn/error survive because they are how a production build reports a real problem.
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // ───────────────────────────────────────────────────────────────────────
      // W3-E · REMOVE THE CAPABILITY. The message-key defect survived three
      // cycles (customer's `t: any` -> AppConfig augmentation -> typed accessor).
      // §🅴 non-convergence: stop adding checks, remove the capability. The
      // capability removed here is "read a message out of next-intl", whose key
      // typing is collapsed to `string` by the 10 array values in
      // messages/he.json (MEASURED — see i18n/request.ts HONEST LIMIT).
      //
      // BANNED BY NAME, NOT BY PATH. Every entry names `importNames`, so this
      // bans a SET OF NAMES, not a module. `hasLocale`, `useLocale`,
      // `useFormatter`, `setRequestLocale`, `getRequestConfig`, `getLocale`,
      // `getFormatter`, `getNow`, `getTimeZone` keep working everywhere,
      // including in i18n/ — they are different names and are never matched.
      // `next-intl/routing`, `next-intl/navigation`, `next-intl/middleware` and
      // `next-intl/plugin` are not listed at all: `defineRouting`,
      // `createNavigation` and `createMiddleware` export no message reader.
      // Because the ban is name-scoped it needs NO file exemptions, so there is
      // no exemption list to rot and no path a future file can be moved to in
      // order to escape it.
      //
      // AST, NOT GREP (ledger D-13). This is `no-restricted-imports`, a rule
      // over ImportDeclaration nodes. The banned identifiers inside a comment or
      // a string are not import specifiers and cannot trip it — the false-red
      // class D-13 was written to kill has no representation here.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next-intl',
              // Complete set of message readers on this entry, verified against
              // dist/types/react-client/index.d.ts and react-server/index.d.ts
              // (they mirror each other) plus its `export * from 'use-intl/core'`.
              importNames: [
                'useTranslations',
                'useMessages',
                'useExtracted',
                'createTranslator',
              ],
              message:
                "next-intl message reading is REMOVED in this project (W3-E). Its key typing is collapsed to `string` by the 10 array values in messages/he.json, so t('typo') compiles — the guarantee is not real. Read messages with `getMessages(locale)` from '@/i18n/messages' instead: zod-validated at the boundary and typed by inference (ledger D-19/D-20). Non-message APIs of this module (hasLocale, useLocale, useFormatter, useNow, useTimeZone) are unaffected.",
            },
            {
              name: 'next-intl/server',
              // Verified against dist/types/server/react-server/index.d.ts and
              // server/react-client/index.d.ts.
              importNames: ['getTranslations', 'getMessages', 'getExtracted'],
              message:
                "next-intl message reading is REMOVED in this project (W3-E). Its key typing is collapsed to `string` by the 10 array values in messages/he.json, so t('typo') compiles — the guarantee is not real. Read messages with `getMessages(locale)` from '@/i18n/messages' instead: zod-validated at the boundary and typed by inference (ledger D-19/D-20). NOTE the name collision — next-intl also exports a `getMessages`; the correct one comes from '@/i18n/messages'. Non-message APIs of this module (getRequestConfig, setRequestLocale, getLocale, getFormatter, getNow, getTimeZone) are unaffected.",
            },
            {
              // Closure, not theatre: `next-intl` reaches these by re-export, so
              // importing the source package is the same capability through
              // another door. Nothing in this repo imports `use-intl` (it is a
              // transitive dependency, not a declared one), so this entry bans a
              // door rather than closing one that is in use.
              name: 'use-intl',
              importNames: [
                'useTranslations',
                'useMessages',
                'createTranslator',
                '_useExtracted',
              ],
              message:
                "use-intl is next-intl's underlying package and its message readers are REMOVED here for the same reason (W3-E): key typing collapses to `string` on this catalogue. Read messages with `getMessages(locale)` from '@/i18n/messages' (zod-validated, ledger D-19/D-20).",
            },
            {
              name: 'use-intl/core',
              importNames: ['createTranslator'],
              message:
                "use-intl is next-intl's underlying package and its message readers are REMOVED here for the same reason (W3-E): key typing collapses to `string` on this catalogue. Read messages with `getMessages(locale)` from '@/i18n/messages' (zod-validated, ledger D-19/D-20).",
            },
          ],
        },
      ],
    },
  },

  // W6-FIX / W7-FIX-F: `no-console` re-scoped OFF for build/tooling scripts and for the
  // Playwright verification scripts under tests/e2e/** (see header for both). Every other
  // rule above still applies here in full — these files still get linted, just not for
  // console output, which is each CLI's intended report to a human.
  {
    files: ['scripts/**', 'tests/e2e/**'],
    rules: {
      'no-console': 'off',
    },
  },
]

export default config
