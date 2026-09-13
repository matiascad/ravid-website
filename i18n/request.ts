// ─────────────────────────────────────────────────────────────────────────────
// W3-E I18N-ROUTING · i18n/request.ts  — REQUEST CONFIG + THE LOCALE CONTRACT
// (W3-A wrote this file as "request config + TYPED MESSAGE KEYS". The message-key
//  half of that title was false — measured, see IMPOSSIBLE (b) — and W3-E deleted
//  it rather than replace it with a fourth type. What remains is the half that
//  goes red when it is violated.)
//
// INVARIANT     Exactly one module resolves "which locale is this request?", and
//               it is this one. The locale that reaches every message lookup is
//               ALWAYS a member of routing.locales, because the only path to it
//               runs through `hasLocale`, a type guard whose false branch is the
//               default locale. The compiler agrees, project-wide, because
//               `AppConfig['Locale']` is that same union — declared once, here.
//               The shape of a message CATALOGUE is NOT this module's fact: it
//               belongs to i18n/messages.ts and is stated there once, in zod.
//
// IMPOSSIBLE    (a) An unvalidated locale reaching the app. `requestLocale` is
//                   typed `Promise<string | undefined>` - next-intl's own doc
//                   comment notes the [locale] segment acts as a catch-all, so
//                   `/unknown.txt` arrives here as a "locale". It cannot get past
//                   the guard: the returned `locale` is narrowed to the union or
//                   replaced. There is no branch that returns the raw string.
//               (b) A MISTYPED MESSAGE KEY — closed by REMOVAL, not by typing.
//                   W3-A claimed this slot for a typed-key guarantee. The
//                   guarantee was hollow and this cycle measured it going green
//                   on a key that exists nowhere:
//                       useTranslations()('heroTitlee')  ->  COMPILES
//                   because one array value collapses next-intl's `NestedKeyOf`
//                   to `string` and he.json has 10 of them. So the capability is
//                   gone instead: every next-intl / use-intl API that can return
//                   a message is an import ERROR repo-wide (eslint.config.mjs,
//                   `no-restricted-imports`, AST not grep). There is no `t` in
//                   this project, therefore no key to mistype. Messages are read
//                   only through `getMessages()` in i18n/messages.ts, whose type
//                   comes from a zod schema that also validates the bytes.
//               (c) The wildcard type itself, anywhere in this file. ESLint
//                   `@typescript-eslint/no-explicit-any` is an ERROR in this repo
//                   and reads the AST, so the ban survives comments. This header
//                   therefore never spells the token either.
//               (d) A locale outside the union reaching `setRequestLocale`. Since
//                   `AppConfig['Locale']` is our union, next-intl's own server
//                   APIs now reject 'fr' at compile time, project-wide.
//
// CLASS         DERIVATION for locale validity: a global type-level fact,
//               installed once here, inherited by every file in the program
//               without any per-file opt-in. It is NOT a derivation for message
//               keys and no longer pretends to be — that class was closed in a
//               different place (the import ban) after being attempted here and
//               failing. It is THIS INSTANCE only for catalogue PARITY - see
//               HONEST LIMIT 2.
//
// HONEST LIMIT  1. `he.json` is the SHAPE OF RECORD for the `typeof` annotation
//                  on the dynamic import below — a local convenience, nothing
//                  more. It is NOT a key guarantee for the project: that lives in
//                  i18n/messages.ts. (he is the source locale; the asymmetry is
//                  deliberate.)
//               2. The dynamic `import()` below takes a template-literal path, so
//                  TypeScript cannot resolve it statically. Its result is given
//                  the declared type - that annotation is an ASSERTION about
//                  en.json, not a proof. Consequence: he.json is type-checked;
//                  en.json is NOT. Key parity between the two catalogues is
//                  UNVERIFIED by this file and needs a test or a W7 gate. Stated
//                  as a limit rather than hidden behind a green build.
//               3. `requestLocale` is marked `@deprecated` in next-intl@4.14.4,
//                  which points to `next/root-params`. It is present, supported
//                  and is still the shape the documentation for this version
//                  uses; the migration is recorded for the ledger, not performed
//                  here (it would change the routing contract mid-wave).
//               4. This file guarantees NOTHING about message keys — it used to
//                  claim it did, and that claim is what W3-E deleted. It cannot
//                  guarantee a key exists, and it could never have guaranteed the
//                  SENTENCE is right: it never sees one. No memorial fact, no
//                  Hebrew and no catalogue content is written into this file -
//                  only a path and a `typeof`.
//               5. It validates the locale; it does not NEGOTIATE it. Cookie and
//                  Accept-Language detection belong to middleware.ts, which owns
//                  the one redirect.
//               6. ⚠️ THE `Messages` MEMBER IS GONE. Consequence, stated rather
//                  than hidden: `AppConfig['Messages']` now falls through to
//                  next-intl's own default, `Record<string, any>` — so IF a
//                  message-reading hook were ever imported again, it would take
//                  ANY key with no complaint at all. That is not a regression
//                  from a working state; it is the same hole, now VISIBLE
//                  instead of dressed as a guarantee. It is survivable only
//                  because those hooks cannot be imported. The ban in
//                  eslint.config.mjs and this deletion are ONE decision in two
//                  files; weakening either without the other reopens the defect
//                  that has now cost four cycles.
//               7. Why not DERIVE `Messages` from the zod type instead of
//                  deleting it (ledger D-21)? Because it would have had no
//                  consumer. Measured before deciding: zero imports of
//                  useTranslations / getTranslations / useMessages /
//                  createTranslator / NextIntlClientProvider anywhere outside
//                  _legacy. A derived type nothing reads is dead code carrying a
//                  guarantee, which is the exact failure being closed here.
//               8. `heMessages` survives below as the `typeof` on ONE dynamic
//                  import — a local annotation, not a project-wide contract, and
//                  HONEST LIMIT 2 already says it is an assertion rather than a
//                  proof. Do not grow it back into a contract.
// ─────────────────────────────────────────────────────────────────────────────
import { hasLocale } from 'next-intl'
import { getRequestConfig, type RequestConfig } from 'next-intl/server'

import type { Locale } from '@/config/site'

import { routing } from './routing'

// Type-only import: the catalogue's SHAPE, never its bytes. `import type` emits
// nothing at runtime, so he.json is not bundled by this line - it is loaded once,
// by path, in the dynamic import below, exactly like en.json.
import type heMessages from '../messages/he.json'

/**
 * THE LOCALE CONTRACT. One member, and it is the one that demonstrably bites.
 *
 * next-intl@4 reads `AppConfig` (declared empty in use-intl/core, re-exported
 * from 'next-intl') to derive `Locale` for the whole library. Augmenting it
 * HERE - once - types every `setRequestLocale` and `getLocale` call site in the
 * project. MEASURED, this cycle, not assumed:
 *
 *     setRequestLocale('fr')  ->  TS2345: Argument of type '"fr"' is not
 *                                 assignable to parameter of type '"he" | "en"'
 *     setRequestLocale('he')  ->  accepted
 *
 * A `Messages: typeof heMessages` member used to sit beside this one. IT WAS
 * DELETED (W3-E), and the reason is the point of this comment rather than a
 * footnote to it: IT CLAIMED A GUARANTEE IT DID NOT DELIVER. Measured on the
 * installed code with that member still present:
 *
 *     useTranslations()('heroTitlee')  ->  COMPILES.  A key that exists in no
 *                                          catalogue, accepted silently.
 *
 * One array value anywhere in the catalogue collapses next-intl's `NestedKeyOf`
 * to `string`; messages/he.json has 67 top-level keys of which 10 are arrays. So
 * the member typed nothing, and a type that CANNOT FAIL is worse than no type,
 * because it is believed. Three cycles were spent putting a stronger type in
 * front of this capability. This cycle removes the capability instead: the
 * hooks that would have consumed `AppConfig['Messages']` - useTranslations,
 * getTranslations, useMessages, getMessages, createTranslator, useExtracted,
 * getExtracted - are now an import ERROR repo-wide (eslint.config.mjs). The
 * member had no remaining consumer; a derived version of it would have been
 * dead code with a guarantee attached.
 *
 * WHERE MESSAGE TYPING ACTUALLY LIVES: `i18n/messages.ts`. Its type is inferred
 * from a zod schema and its values are `safeParse`d at the boundary, so a bad
 * key is a compile error and a bad CATALOGUE is a loud runtime throw. That file
 * is the only sanctioned way to read a message in this project.
 *
 * NOT GUARANTEED BY THIS FILE, in as many words: message KEYS. This file makes
 * no claim about them at all any more. `t('anything')` is not checked here and
 * is not checked by next-intl; it is prevented by not existing.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale
  }
}

export default getRequestConfig(async ({ requestLocale }): Promise<RequestConfig> => {
  // May be undefined (a route outside [locale]) or an arbitrary string (the
  // segment is effectively a catch-all). Both are handled by the guard.
  const requested = await requestLocale

  // The ONLY gate. `hasLocale` is a type guard over routing.locales - the single
  // locale list - so the false branch is the only fallback and the true branch is
  // the only way a locale survives.
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  // Loaded BY PATH. The catalogues are another delegate's write-set; nothing from
  // inside them is copied, inlined or re-stated here.
  const { default: messages }: { default: typeof heMessages } = await import(
    `../messages/${locale}.json`
  )

  // next-intl@4 requires `locale` in the returned config (verified against
  // node_modules/next-intl/dist/types/server/react-server/getRequestConfig.d.ts:
  // `RequestConfig = Omit<IntlConfig,'locale'> & { locale: IntlConfig['locale'] }`).
  return { locale, messages }
})
