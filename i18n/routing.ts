// ─────────────────────────────────────────────────────────────────────────────
// W3-A I18N-ROUTING · i18n/routing.ts  — THE ROUTING CONTRACT
//
// INVARIANT     The set of locales, the default among them, and the text
//               direction of each are stated exactly once in this project.
//               The set and the default are NOT stated here at all - they are
//               imported from config/site.ts, which is their one home. This file
//               adds exactly one new fact: the locale → direction mapping, and it
//               adds it as a total function over the locale union rather than as
//               a lookup that might miss. Every internal link is likewise built
//               from ONE navigation factory seeded with this one routing object,
//               so a link's locale prefix is not something a caller remembers.
//
// IMPOSSIBLE    Four things can no longer be CONSTRUCTED:
//               (a) A second locale list. `defineRouting` is fed LOCALES, and the
//                   `Locale` union is `typeof LOCALES[number]` - there is no
//                   second literal to drift from the first.
//               (b) A locale with no direction. LOCALE_DIRECTION is typed
//                   `Record<Locale, 'rtl' | 'ltr'>`: adding 'fr' to LOCALES makes
//                   THIS FILE fail to compile until 'fr' gets a direction. The
//                   customer's build had no such total map - direction rode along
//                   inside a translation object, so a locale without one was a
//                   runtime `undefined`, not a build error.
//               (c) A direction value outside {rtl, ltr}. The value type is a
//                   two-member union, so `'RTL'`, `'auto'` or `''` are compile
//                   errors, not silently-ignored HTML attributes.
//               (d) An un-prefixed internal route. `localePrefix: 'always'` means
//                   there is no "bare" URL that serves content: `/` is not a page,
//                   it is a redirect owned by middleware.ts. So the URL can never
//                   be silent about which language it is showing - which is the
//                   whole of the customer's defect G.
//               (e) A `/` whose meaning depends on WHO ASKS. `localeDetection:
//                   false` deletes the two request-dependent inputs to locale
//                   resolution, so `/` has exactly one possible target for every
//                   caller on earth, and `localeCookie: false` deletes the state
//                   that made a SECOND request from the same visitor differ from
//                   their first. See the block below for the measurement.
//                   ⚠️ This is the only claim in this file that neither tsc nor
//                   the type system can hold up - it is a RUNTIME property of
//                   middleware.ts, produced by two config lines with no compile-
//                   time consequence. Deleting either line leaves this file
//                   type-correct and this comment a lie. That is precisely why
//                   i18n/__tests__/routing.test.ts exists and why it asserts the
//                   REDIRECT, never the config object: the assertion has to be
//                   able to disagree with the line it guards.
//
// CLASS         DERIVATION, not this instance. The pair (LOCALES in config/site.ts,
//               LOCALE_DIRECTION here) is a closed system over the locale union:
//               ANY future locale, added anywhere, is forced through both. Nothing
//               opts out, because the union has one definition and the map is total
//               over it. The navigation helpers are the same shape of closure for
//               links: they are the only exported Link/redirect/usePathname/
//               useRouter in this project, so "an internal link that forgot the
//               locale" has no constructor left, not merely no instances today.
//
// HONEST LIMIT  Five, stated plainly.
//               1. This file cannot stop a component from importing `next/link`
//                  or `next/navigation` directly and writing a locale-blind href.
//                  Nothing in the toolchain forbids that import today; only review,
//                  or a future ESLint `no-restricted-imports` rule, would. That
//                  rule is NOT written here - it is not in this delegate's
//                  write-set.
//               2. `Record<Locale, …>` forces a direction to EXIST. It cannot
//                  force it to be CORRECT: `en → 'rtl'` compiles.
//               3. The direction is derived from the locale alone. That is exact
//                  for he/en and is wrong in general for a locale whose script is
//                  not implied by its language tag; such a locale would need the
//                  map keyed on script, not language.
//               4. `localePrefix: 'always'` is enforced by next-intl at routing
//                  time, not by the type system. A hand-written `<a href="/story">`
//                  still produces an un-prefixed URL at runtime.
//               5. This file is NOT where message keys are typed. The next-intl
//                  `AppConfig` augmentation (Locale + Messages) lives in
//                  i18n/request.ts, so that the single place which LOADS the
//                  catalogues is also the single place which TYPES them.
//               6. WHAT `localeDetection: false` GIVES UP - the cost of (e),
//                  written down rather than implied. A visitor whose browser
//                  prefers English no longer lands on /en automatically; they
//                  land on /he like everyone else, and the language switcher in
//                  the header is now the ONLY discovery path to English. If that
//                  switcher is ever removed, made invisible on mobile, or placed
//                  below the fold, English becomes effectively unreachable for a
//                  visitor who does not hand-edit the URL. That is a real
//                  regression in automatic reach, accepted deliberately (see the
//                  block on the routing object) - not an oversight.
//               7. NO LOCALE IS REMEMBERED, ANYWHERE. `localeCookie: false`
//                  deletes the last piece of cross-request locale state this
//                  project had. A visitor who switches to English, closes the tab
//                  and returns to `/` gets Hebrew again - every time, forever.
//                  That is not a bug to be fixed by re-enabling the cookie (see
//                  the ⚠️ block on the routing object: the cookie alone does
//                  nothing); it is the direct consequence of choosing a `/` whose
//                  meaning does not depend on who is asking. If "remember my
//                  language" is ever wanted, it is a NEW decision that must
//                  re-open limit 6 as well, not a flag flip.
//                  ⚠️ This limit REPLACES an earlier one that said the cookie was
//                  written-but-unread. That was true when written and is false
//                  now. middleware.ts's HONEST LIMIT 6 still states the old,
//                  now-false fact: it is outside this delegate's write-set and is
//                  reported as owed, not silently corrected.
//
// ⚠️ DO NOT WIRE UP THE CATALOGUES' `dir` KEY.  messages/{he,en}.json carry a
// `dir` field - the customer's own data, preserved verbatim for fidelity by the
// catalogue delegate. It is deliberately NOT consumed here or anywhere else.
// Direction derived from the locale AND direction read from a translation file
// would be two sources for one fact, and the second one is editable by a
// translator with no compiler watching. LOCALE_DIRECTION below is the only
// source of text direction in this project. If you are a later delegate reading
// the catalogues and thinking "there is already a dir here" - that is the trap
// this paragraph exists to close.
// ─────────────────────────────────────────────────────────────────────────────
import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/config/site'

/**
 * The routing contract. `locales` and `defaultLocale` are IMPORTED, never
 * re-declared: config/site.ts is their one home (W1 measured duplicated facts
 * as this project's most productive defect class).
 *
 * `localePrefix: 'always'` makes both /he and /en explicit in the URL and makes
 * `/` unambiguous - it carries no content at all, so it cannot quietly mean
 * "Hebrew" the way the customer's prefix-less SPA did.
 *
 * `localeDetection: false` is the line that makes `/` DETERMINISTIC, and it is
 * the one behavioural change in this file. Read it before changing it.
 *
 * next-intl defaults this to `true` (`receiveRoutingConfig`: `input.localeDetection
 * ?? true`). Under that default, `resolveLocaleFromPrefix` consults, in order:
 *   Prio 1 the path prefix, Prio 2 the NEXT_LOCALE cookie, Prio 3 the
 *   `accept-language` header, Prio 4 `defaultLocale`.
 * `/` has no prefix, so a first-time visitor was resolved at Prio 3 - by their
 * BROWSER, not by this config. That was measured, not assumed:
 *
 *   GET /   Accept-Language: (none) -> 307 /he
 *   GET /   Accept-Language: he     -> 307 /he
 *   GET /   Accept-Language: fr     -> 307 /he
 *   GET /   Accept-Language: en     -> 307 /en   <- the defect
 *
 * Setting it to `false` disables Prio 2 and Prio 3 ONLY. Prio 1 is untouched, so
 * /he and /en remain directly addressable and still return 200; every request to
 * `/` now falls through to Prio 4 and the target genuinely comes from
 * `routing.defaultLocale`. That is what makes middleware.ts's INVARIANT true.
 *
 * WHY determinism beats detection HERE, specifically: this is a memorial page
 * shared by link (WhatsApp, Instagram). A URL that renders a different language
 * depending on the recipient's browser is a worse artefact to share than one that
 * always opens in Hebrew with a visible switcher. Locale detection is a sensible
 * default in general; it is the wrong default for a shared-by-link memorial.
 * Source: REBUILD_PLAN_v1.00.md §2 ("`/` → `/he` redirect") and §7 Q5.
 *
 * `localeCookie: false` is the CONSEQUENCE of the line above, not a second
 * decision. next-intl gates cookie WRITING on `localeCookie` alone; cookie
 * READING requires BOTH `localeCookie` (not `false`) AND `localeDetection: true`
 * (middleware/syncCookie.js vs middleware/resolveLocale.js, v4.14.4). With
 * detection off, the reader was gone but the writer was not, so
 * every response still carried `Set-Cookie: NEXT_LOCALE=he` that nothing on
 * earth consulted. Measured before this line existed:
 *
 *   GET /  ->  307 /he  +  set-cookie: NEXT_LOCALE=he; Path=/; SameSite=lax
 *
 * That is state with a writer and no reader - the most expensive kind of dead
 * thing, because it does not look dead. It LOOKS like "the visitor's language
 * choice is remembered", and a future reader would build on that belief. It is
 * deleted here so the response body of this project contains no claim it cannot
 * keep.
 *
 * ⚠️ TO A DELEGATE RE-ENABLING THE COOKIE: `localeCookie: true` alone restores
 * the WRITE and nothing else - you get the identical dead state back. The cookie
 * only becomes load-bearing if `localeDetection` is ALSO `true`, because that is
 * the flag that puts the cookie back at Prio 2 of `resolveLocaleFromPrefix`.
 * The two move together or not at all; and turning both on re-introduces the
 * shared-by-link defect argued above. i18n/__tests__/routing.test.ts goes RED on
 * either half of that change - proved, see its header.
 *
 * The cost is real and is written down as HONEST LIMIT 6 and 7 above. Do not
 * flip this back to `true` without re-reading them.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  localeDetection: false,
  localeCookie: false,
})

/**
 * THE SINGLE SOURCE OF TEXT DIRECTION.
 *
 * Typed `Record<Locale, 'rtl' | 'ltr'>` on purpose: the key set is the locale
 * union itself, so adding a locale to LOCALES without giving it a direction is
 * a COMPILE ERROR in this file, not a runtime `undefined` on <html dir>.
 *
 * Consumed by app/[locale]/layout.tsx, which puts it on <html> - ledger D-5.
 */
export const LOCALE_DIRECTION: Record<Locale, 'rtl' | 'ltr'> = {
  he: 'rtl',
  en: 'ltr',
}

/**
 * The ONLY navigation primitives this project exposes. They are created from the
 * routing object above, so every internal link, redirect and router push carries
 * the active locale prefix BY CONSTRUCTION rather than by a caller remembering.
 *
 * Import these, not `next/link` / `next/navigation`, for any INTERNAL route.
 * (`next/navigation`'s notFound/redirect for non-localised purposes is unrelated
 * and still correct to import directly.)
 */
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
