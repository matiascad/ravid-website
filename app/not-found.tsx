// ─────────────────────────────────────────────────────────────────────────────
// W3-J ROOT NOT-FOUND · app/not-found.tsx
//
// ⚠ READ THIS FIRST. THIS FILE DOES **NOT** PUT `lang`/`dir` ON THE <html> OF A
//   404's SERVED BYTES. It was written to, it was measured, and it does not.
//   The reason is in THE MECHANISM below and it is a Next.js internal, not a
//   mistake in this file. What this file DOES close is a different, real defect:
//   before it, paths outside the locale tree (/api/anything, /robots.txt) were
//   served Next's OWN built-in English 404 — a second 404 page, authored by the
//   framework, that this project could not edit and did not own. Now every
//   not-found boundary in the project renders the SAME component. Do not read
//   the existence of this file as evidence that the lang/dir defect is closed.
//   It is DEFERRED, named, and its owner is identified in HONEST LIMIT 1.
//
// WHY THIS FILE EXISTS AT ALL, given that W3-D's HONEST LIMIT 3 explicitly
// CONSIDERED AND REJECTED it. That rejection rested on two claims:
//
//   claim: "a root not-found renders under the same pass-through app/layout.tsx,
//           so it would have no <html> to inherit either"
//   TRUE, and this file does not inherit one — it states one. That turns out not
//   to be enough, for reasons W3-D could not have known without measuring the
//   Next internals; see THE MECHANISM.
//
//   claim: "it would have to carry its own copy, in a language it cannot know,
//           when the 404 copy has exactly one home"
//   MEASURABLY AVOIDABLE, and this is why the file is kept. There is not one
//   sentence in it and not one element of 404 markup either: the whole visible
//   page is `app/[locale]/not-found.tsx`, imported and rendered. W3-D's fear was
//   a SECOND 404 page; this is a shell around the FIRST one. And the root
//   boundary does know a locale — DEFAULT_LOCALE, the same value
//   i18n/request.ts already falls back to for any route outside [locale]
//   (`hasLocale(...) ? requested : routing.defaultLocale`). So the `lang`
//   written here and the locale the imported component reads through
//   `useLocale()` are one fact reached two ways, not two guesses.
//
// MEASURED, production build, 10 URL shapes, Node loopback client:
//                         BEFORE this file            AFTER this file
//   /he            200    <html lang="he" dir="rtl">  unchanged
//   /en            200    <html lang="en" dir="ltr">  unchanged
//   /he/nope       404    __next_error__, our copy    __next_error__, our copy
//   /api/anything  404    __next_error__, NEXT'S copy __next_error__, OUR copy
//   /robots.txt    404    __next_error__, NEXT'S copy __next_error__, OUR copy
//   Shapes carrying <html lang dir> in served bytes: 2/10 before, 2/10 after.
//   Shapes whose 404 copy this project owns: 4 before (the locale ones), 6 after.
//
// THE MECHANISM — read out of the installed Next 15.5.25, not guessed:
//   · `notFound()` throws an HTTPAccessFallback error, and an unmatched route
//     raises the same one internally. The boundary that renders a not-found.tsx
//     is `HTTPAccessFallbackBoundary`, handed to `LayoutRouter` as a prop
//     (next/dist/esm/server/app-render/create-component-tree.js:397) — a CLIENT
//     component, which catches errors during CLIENT rendering.
//   · On the initial SERVER render the throw rejects the RSC stream before any
//     such boundary sees it. It is caught at the top of the request instead
//     (app-render.js:1389, `isHTTPAccessFallbackError` → statusCode 404,
//     errorType 'not-found'), which DISCARDS the whole first attempt and
//     re-renders through `getErrorRSCPayload`.
//   · That function HARDCODES the document element in its seed data:
//     `<html id="__next_error__"><head/><body/></html>` (app-render.js:699-712).
//     Any <html> from the discarded attempt — app/[locale]/layout.tsx's, or this
//     file's — is gone by then. It survives only inside the RSC payload, which
//     the client applies after hydration. This is why /api/anything, a path that
//     never enters [locale] at all, showed the IDENTICAL shell before this file:
//     the shell is a property of Next's 404 path, not of any route.
//   · THE REAL REMEDY IS A DIFFERENT FILE. Next 15.5 has `global-not-found`,
//     whose entire purpose is to own the document element on the 404 path
//     (app-render.js:562 `hasGlobalNotFound`; build/entries.js:405). It is gated
//     behind `experimental.globalNotFound`, default false
//     (server/config-shared.js:215) — a next.config.js edit, which this
//     delegate's brief places out of bounds. See HONEST LIMIT 1.
//
// INVARIANT     There is exactly ONE 404 page in this project, and it is
//               `app/[locale]/not-found.tsx`. Every not-found boundary — the
//               localised one and this root one, which together cover every path
//               the app can serve — resolves to that same component. This file
//               adds a document element and nothing else: no words, no markup,
//               no message key, no link.
//
// IMPOSSIBLE    (a) A `dir` that disagrees with its `lang`. Both are expressions
//                   over the SAME constant: `lang={DEFAULT_LOCALE}` and
//                   `dir={LOCALE_DIRECTION[DEFAULT_LOCALE]}`. There is no second
//                   variable to set independently and no 'he'/'rtl' literal in
//                   this file for a later edit to drift.
//               (b) A locale with no direction reaching this shell.
//                   LOCALE_DIRECTION is `Record<Locale, 'rtl' | 'ltr'>` — total
//                   over the union — so the lookup cannot be `undefined`, and a
//                   new locale without a direction is a compile error in
//                   i18n/routing.ts before it is a missing attribute here.
//               (c) THE 404's WORDS EXISTING IN TWO PLACES. This file imports the
//                   component; it does not re-state its markup, its keys or its
//                   link. Nor can Next's built-in English 404 be served any more:
//                   the root boundary is now occupied. Before this file the
//                   project had two 404 pages and owned only one of them.
//               (d) A hand-written user-visible string of any kind here.
//
// CLASS         THIS INSTANCE. It occupies one boundary with the one 404 page; it
//               installs no rule that a future root-level entry point must state
//               a shell, and — as the ⚠ at the top says — it does not establish
//               the lang/dir property it was written to establish.
//
// HONEST LIMIT  1. THE DEFECT IT WAS WRITTEN FOR IS STILL OPEN, AND ITS OWNER IS
//                  NOT THIS FILE. A 404's served bytes still begin
//                  `<html id="__next_error__">`, with no lang and no dir, on 8 of
//                  10 measured URL shapes. Closing it means `app/global-not-found
//                  .tsx` plus `experimental.globalNotFound: true` in
//                  next.config.js — a config edit, out of this brief's bounds.
//                  Whoever takes it should delete this file in the same change if
//                  global-not-found subsumes it, rather than leave two root-level
//                  404 entry points.
//               2. LANG/DIR REACH THE HYDRATED DOCUMENT, NOT THE FIRST BYTES —
//                  and the DIFFERENCE IS NOT COSMETIC. `lang="he"` and `dir` are
//                  present in the RSC payload after this file (measured), so a
//                  browser with JavaScript ends up with a correct document
//                  element. A crawler, a `curl`, or a screen reader that acts on
//                  the initial HTML does not. Next's 404 path streams ALL visible
//                  content into a suspense boundary, so with JS off the page is
//                  blank — that was true before this file and is not changed by
//                  it, but it means "the hydrated DOM is fine" is not a defence.
//               3. THE FONT IS ABSENT HERE, DELIBERATELY. app/[locale]/layout.tsx
//                  attaches `--font-heebo` from a `Heebo()` call that is a
//                  module-local const, not an export, in a file outside this
//                  write-set. A second `Heebo()` here would be ONE FACT TWO
//                  PLACES — two font declarations free to drift in weights,
//                  subsets or variable name — a worse defect than the one it
//                  would fix. CONSEQUENCE: this shell renders in the system
//                  fallback stack. Closing it means exporting the font from one
//                  module both shells import, i.e. editing the layout.
//               4. ⚠️ THIS LIMIT WAS REPAIRED BY W13-B, AND ITS OLD TEXT WAS
//                  WRONG ON ITS OWN TERMS. It read: "THE ROOT SHELL IS `he`/`rtl`
//                  FOR EVERY VISITOR ... it is the same fallback i18n/request.ts
//                  already applies, SO THE SHELL AND THE WORDS AGREE — but it is
//                  a fallback, not knowledge." The last clause is the false one.
//                  The shell and the words did NOT agree: MEASURED on a live
//                  server (GET /he/nope, GET /en/nope, 2026-09-13) the rendered
//                  words are the English strings "404" / "Oops! Page not found" /
//                  "Return to Home", because messages/he.json's `notFound.*` IS
//                  that English text verbatim (that file's own HONEST LIMIT 1
//                  says so). So the document announced `lang="he" dir="rtl"` over
//                  English prose — a screen reader reading English in a Hebrew
//                  voice, and a translation engine told not to bother.
//                  WHAT CHANGED: `lang`/`dir` now come from
//                  NOT_FOUND_COPY_LOCALE — the locale the 404's WORDS ARE IN,
//                  which is a different fact from DEFAULT_LOCALE, the catalogue
//                  they are READ FROM. IMPOSSIBLE (a) is untouched: both
//                  attributes are still expressions over ONE constant, so they
//                  still cannot drift apart from each other.
//                  WHAT IS STILL OPEN: Hebrew 404 copy does not exist and no
//                  agent may write it. §OPEN — one-edit item:
//                  app/[locale]/not-found.tsx:NOT_FOUND_COPY_LOCALE. A human
//                  authors messages/he.json's `notFound.*` and flips that one
//                  value in the same change.
//                  WHAT IS STILL TRUE FROM THE OLD TEXT: a root 404 has no
//                  locale in scope, so this is still a constant, not a
//                  negotiation. Negotiating a locale from the request lives in
//                  middleware.ts. And per limit 2, none of `lang`/`dir` reaches
//                  the FIRST BYTES of a 404 anyway — this fixes the hydrated
//                  document and the RSC payload, not the shell Next hardcodes.
//               5. THIS CLOSES THE NOT-FOUND BOUNDARY ONLY. `app/layout.tsx` is
//                  still a pass-through, so a future app/global-error.tsx would
//                  reach the same shell-less state. Moving <html> back into
//                  app/layout.tsx is NOT the answer: it would put a locale-blind
//                  `dir` on the document root, which is the customer's defect H.
//               6. NO METADATA, NO TITLE. Next's own `<meta name="robots"
//                  content="noindex">` still applies to a 404; W5-B owns the
//                  rest. A <title> here would be a second author of it.
// ─────────────────────────────────────────────────────────────────────────────
import { LOCALE_DIRECTION } from '@/i18n/routing'

import LocaleNotFound, { NOT_FOUND_COPY_LOCALE } from './[locale]/not-found'

import './globals.css'

/**
 * The not-found boundary for everything OUTSIDE the [locale] segment.
 *
 * The page itself is `app/[locale]/not-found.tsx`, rendered here unchanged — so
 * the 404's words, its message keys and its locale-aware "back home" link have
 * one home, and this file is a shell around them rather than a second version of
 * them. See the ⚠ at the top of this file for what the shell does and does not
 * achieve.
 */
export default function RootNotFound() {
  return (
    <html
      lang={NOT_FOUND_COPY_LOCALE}
      dir={LOCALE_DIRECTION[NOT_FOUND_COPY_LOCALE]}
    >
      <body>
        <LocaleNotFound />
      </body>
    </html>
  )
}
