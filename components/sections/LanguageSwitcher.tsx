// ─────────────────────────────────────────────────────────────────────────────
// W4-13 LANGUAGE SWITCHER · components/sections/LanguageSwitcher.tsx
//
//   THE CONTROL THAT PAYS FOR LEDGER D-24. `localeDetection: false` makes `/`
//   redirect to `/he` for every visitor on earth, deterministically, because a
//   memorial shared by link must open in the same language for the sender and
//   the recipient. The recorded cost of that decision is THIS FILE: a browser
//   that prefers English no longer lands on `/en` by itself, so this control is
//   the only discovery path to English that does not involve hand-editing a URL.
//   See i18n/routing.ts HONEST LIMIT 6 for the decision; see HONEST LIMIT 1
//   below for what that makes this file responsible for.
//
// INVARIANT     One control per entry in `LOCALES`, and every control's
//               destination is THE CURRENT PAGE under another locale. Both halves
//               are derived, never written down here: the control set IS
//               `LOCALES` (config/site.ts, its one home) mapped over, and each
//               destination is `usePathname()` — the path with its locale prefix
//               already removed — handed to the project's one navigation factory
//               (i18n/routing.ts) together with the target locale. This file
//               contains no locale list and no URL literal: the only `/`
//               characters in its CODE are module specifiers.
//
// IMPOSSIBLE    Five things can no longer be CONSTRUCTED here:
//               (a) A LANGUAGE THAT LIVES IN MEMORY — the defect this wave
//                   exists to delete. The customer's switcher was
//                   `useState<Lang>("he")` plus `toggleLang`
//                   (ravid_website1/src/components/LanguageSwitcher.tsx, measured
//                   by W1): the URL never changed, so the choice was invisible to
//                   a crawler, unshareable by link, and reset to Hebrew on every
//                   reload. This component holds NO state — there is no
//                   `useState`, no setter, no context to write to. The only thing
//                   it can do is produce links, so "a language the address bar
//                   does not know about" has no constructor left in it.
//               (b) A HAND-BUILT LOCALE URL. No string concatenation, no
//                   `replace()`, no template literal and no path literal. The
//                   prefix is applied by `createNavigation(routing)`, which is the
//                   only thing in this project that knows `localePrefix: 'always'`.
//               (c) A SWITCHER THAT GOES HOME. The `href` is the current path, so
//                   the common regression "switching language throws the visitor
//                   back to the homepage" cannot be expressed without deleting the
//                   `usePathname()` call — which the test catches by asserting the
//                   value the factory receives.
//               (d) A SECOND LOCALE LIST. `LOCALES` is iterated, never indexed and
//                   never re-typed, so a third locale added to config/site.ts gets
//                   a control, a name and a correct URL here with no edit.
//               (e) AUTHORED COPY. The visible text of every control is the
//                   language's own name for itself, produced by `Intl.DisplayNames`
//                   from the platform's CLDR data — not a string in this file, not
//                   a translation of one. There are zero Hebrew codepoints in this
//                   file and zero English words rendered to the page (D-13).
//
// CLASS         DERIVATION for the CONTROL SET. Any locale, added anywhere, is
//               forced through all three of: a control, a name, and a
//               locale-prefixed destination — because the set is `LOCALES` itself
//               and the other two are total functions of one locale. It is NOT a
//               policy about navigation in general: this file closes how THE
//               SWITCHER builds URLs; the thing that stops any OTHER component
//               hand-writing `/en/story` is i18n/routing.ts plus review.
//
// HONEST LIMIT  Seven, stated plainly.
//               1. THE D-24 RESPONSIBILITY IS NOT ENFORCEABLE BY CODE. This
//                  control must stay ABOVE THE FOLD, VISIBLE AT EVERY WIDTH, with
//                  a real accessible name — never behind a hamburger, never
//                  `hidden md:flex`, never icon-only. The classes below do that
//                  (`fixed top-4 start-4 z-50`, no responsive visibility
//                  modifier), but nothing in the toolchain can FAIL if a later
//                  edit hides it: jsdom has no viewport and no layout, so the
//                  test can prove the control exists and is reachable, never that
//                  a human can see it. If English becomes unreachable, it will be
//                  a silent regression. That is why it is written here.
//               2. IT MUST BE MOUNTED BY SOMEONE ELSE. This file cannot put
//                  itself on a page. `app/[locale]/page.tsx` and the layout are
//                  outside this delegate's write-set, so "the switcher exists" and
//                  "the switcher is on the memorial page" are two facts and only
//                  the first is proved here.
//               3. THE NAMES COME FROM THE PLATFORM, NOT FROM THIS PROJECT.
//                  `Intl.DisplayNames` is CLDR data shipped with the runtime.
//                  Consequences: (i) a runtime built without full ICU returns the
//                  bare code, so a control could read `he` instead of its endonym
//                  — degraded, never empty, never wrong; (ii) if the Node that
//                  renders and the browser that hydrates carry different CLDR
//                  versions, React reports a text mismatch. Both are accepted in
//                  exchange for authoring no copy; the alternative is a catalogue
//                  key that does not exist (see limit 7).
//               4. THE GROUP HAS NO LANDMARK LABEL. A `<nav aria-label="…">`
//                  would be authored copy in one language, which C3/D-13 forbids
//                  and the catalogue cannot supply. The links are therefore a
//                  plain list: each one is individually named, in its own
//                  language, which is the WCAG-recommended form — but a screen
//                  reader user gets no "language selector" group announcement.
//                  The closer is one key, named in limit 7.
//               5. THE PROVIDER MOUNTED HERE CARRIES A LOCALE AND NOTHING ELSE.
//                  next-intl's client `Link` and `usePathname` both call
//                  `useLocale()` unconditionally (verified in
//                  next-intl@4.14.4/dist/.../createNavigation.js and
//                  useBasePathname.js), and `app/[locale]/layout.tsx` mounts no
//                  client provider ON PURPOSE — its HONEST LIMIT 1 hands that
//                  call to "W4, at W4's leaf". This is that leaf. The provider
//                  wraps only this control and is given no `messages`, so the
//                  catalogue is NOT serialised into the client bundle; it is also
//                  safe under a future outer provider, because IntlProvider
//                  inherits every field it is not given.
//               6. THE `locale` PROP IS TRUSTED. It is typed `Locale`, so it
//                  cannot be a string that is not a locale — but nothing here
//                  checks it against the route the visitor is actually on. A
//                  parent that passes a constant would mark the wrong control as
//                  current. The parent has `params.locale`; passing anything else
//                  is a caller bug this file cannot see.
//               7. WHAT WOULD CLOSE LIMITS 3 AND 4: ONE CATALOGUE KEY,
//                  `localeName`, present in BOTH messages/he.json and
//                  messages/en.json and holding each locale's own name for itself
//                  (so `he.json.localeName` and `en.json.localeName` differ in
//                  language, not in subject) — plus, for limit 4 only, a second
//                  key naming the group. Neither exists today; the catalogue's
//                  top-level keys were read, and there is no locale-name or
//                  language-selector key among them. This delegate REFUSED to
//                  invent either one — inventing a language's name is authoring
//                  copy, and copy is the customer's, not ours.
// ─────────────────────────────────────────────────────────────────────────────
'use client'

import { NextIntlClientProvider } from 'next-intl'

import { LOCALES, type Locale } from '@/config/site'
import { Link, usePathname } from '@/i18n/routing'

export type LanguageSwitcherProps = {
  /**
   * The locale of the page this control is rendered on — i.e. `params.locale`,
   * the same value `app/[locale]/layout.tsx` puts on `<html lang>`. It decides
   * which control is marked current and seeds the provider below; it is NEVER
   * used to build a URL.
   */
  locale: Locale
}

/**
 * A language's own name for itself ("endonym"), read from the platform's CLDR
 * data. `Intl.DisplayNames([x]).of(x)` is asked for the name IN THE TARGET
 * LANGUAGE on purpose — the WCAG-recommended form for a language selector, and
 * the reason a Hebrew page still offers an English-looking way into English.
 *
 * `.of()` is typed `string | undefined` and is documented to fall back to the
 * code itself when the runtime has no data; `?? locale` restates that fallback
 * as a value rather than reaching for `!`. A bare code is a degraded label, not
 * an invented one (HONEST LIMIT 3).
 */
function endonym(locale: Locale): string {
  return new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale
}

/**
 * The links themselves. Split from the exported component for exactly one
 * reason: hooks must run INSIDE the provider that supplies their locale.
 */
function LocaleLinks({ locale }: LanguageSwitcherProps) {
  // The current path with the locale prefix already removed, by the one
  // navigation factory. This — not `'/'`, and not a hand-sliced pathname — is
  // what makes "switch language" mean "this page, in that language".
  const pathname = usePathname()

  return (
    <ul className="fixed top-4 start-4 z-50 flex items-center gap-1 rounded-full border border-border bg-card/80 p-1 text-sm font-bold backdrop-blur-sm">
      {LOCALES.map((target) => {
        const isCurrent = target === locale

        return (
          <li key={target}>
            <Link
              href={pathname}
              locale={target}
              lang={target}
              hrefLang={target}
              aria-current={isCurrent ? 'true' : undefined}
              className={
                isCurrent
                  ? 'block rounded-full bg-primary px-3 py-1 text-primary-foreground'
                  : 'block rounded-full px-3 py-1 text-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              }
            >
              {endonym(target)}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * The language switcher. Renders one link per locale, each pointing at the page
 * the visitor is already on, in that locale.
 *
 * Placement and affordance follow the control this replaces (a small pill in the
 * top corner, always on screen); the MECHANISM does not — that one toggled a
 * `useState` and left the URL alone (IMPOSSIBLE (a)).
 */
export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  return (
    <NextIntlClientProvider locale={locale}>
      <LocaleLinks locale={locale} />
    </NextIntlClientProvider>
  )
}
