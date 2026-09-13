// ─────────────────────────────────────────────────────────────────────────────
// W7-FIX-E LOCALISED NOT-FOUND · app/[locale]/not-found.tsx
//
// THE COPY ON THIS PAGE WAS NOT AUTHORED BY AN AGENT. All three strings are
// transcribed verbatim from the customer's own build:
//     ravid_website1/src/pages/NotFound.tsx:14  "404"                  → notFound.title
//     ravid_website1/src/pages/NotFound.tsx:15  "Oops! Page not found" → notFound.description
//     ravid_website1/src/pages/NotFound.tsx:17  "Return to Home"       → notFound.backHome
// That file is English-only. See HONEST LIMIT 1: Hebrew 404 copy does not exist
// anywhere in the customer's material and has NOT been invented here.
//
// ⚠️ READ THIS BEFORE ADDING ANY next-intl CALL TO THIS FILE. Next wraps the
// [locale] segment in the CLIENT `NotFoundBoundary` and passes this component as
// its `notFound` PROP. A client component's props are serialised into the flight
// payload, so THIS SUBTREE RENDERS ON EVERY RENDER OF /he AND /en — not only on
// a 404 — and it renders BEFORE app/[locale]/layout.tsx has run. Any request-
// scoped read here (useLocale, getLocale, next-intl's `Link`, headers()) is
// therefore a read on the prerender of the two content pages, and ONE such read
// takes /he and /en out of the prerender entirely. That is not a hypothesis; it
// is the defect this file was rewritten to remove, and the numbers are below.
//
// INVARIANT     THIS FILE READS NOTHING FROM THE REQUEST. Every input is a module
//               constant: the locale is `DEFAULT_LOCALE`, the words come from the
//               catalogue through the one validated accessor, and the URL comes
//               from the one path helper. A component that cannot observe the
//               request cannot make a route dynamic — so mounting this boundary
//               costs the two content pages nothing, by construction rather than
//               by a flag.
//
// IMPOSSIBLE    (a) A request-scoped read reaching the prerender THROUGH THIS
//                   FILE. It imports no next-intl API, no `next/headers` and no
//                   `@/i18n/routing` navigation primitive; there is no expression
//                   here whose value depends on who is asking. (What this does
//                   NOT close is a FUTURE file doing it — HONEST LIMIT 4.)
//               (b) A misspelled or absent message key surviving to runtime.
//                   The words are read through `getMessages` (i18n/messages.ts),
//                   whose return type is inferred from the zod `resolvedSchema`
//                   — so `.titel` is a compile error, and a catalogue missing
//                   `notFound` fails the schema at that key rather than shipping
//                   the literal text "notFound.title" to a bereaved family's
//                   visitors. That guarantee comes from the ZOD schema, not from
//                   next-intl's typing (which is collapsed to `string`).
//               (c) A "back home" link that invents the prefix convention.
//                   `localePath` (lib/seo.ts) is the single place that knows
//                   `localePrefix: 'always'` means `/he`, and its `route`
//                   argument is the closed `LocalizedRoute` union — so a route
//                   this site does not have is a compile error, not a 404 link
//                   on the 404 page.
//               (d) An LTR-baked box leaking into Hebrew. The only inline-axis
//                   spacing here is logical (`ps-*`/`pe-*`), so it flips with
//                   `dir` instead of pinning itself to the left.
//
// MEASURED      W7-FIX-E, on this code, against a production build of this repo
//               in an isolated build directory (rig), Next 15.5.25 /
//               next-intl 4.14.4:
//               1. BEFORE (this file called `useLocale()` and next-intl's `Link`):
//                    · no he.html/en.html anywhere under .next
//                    · prerender-manifest.json routes = exactly
//                      ["/favicon.ico","/robots.txt","/sitemap.xml","/opengraph-image"]
//                    · GET /he → 200, `cache-control: private, no-cache,
//                      no-store, max-age=0, must-revalidate`, no x-nextjs-cache
//                  AFTER (this file): he.html/he.rsc/en.html/en.rsc on disk,
//                  both locales in prerender-manifest.json, `s-maxage=31536000`
//                  + `x-nextjs-cache: HIT` on the wire, /_not-found static too.
//               2. THIS COMPONENT RENDERS TWICE PER 404, and the two renders do
//                  not see the same world. Instrumented with next-intl's own
//                  private `getCachedRequestLocale()` on a real GET /en/nope:
//                    render 1 (the boundary PROP)    cachedRequestLocale=undefined
//                    render 2 (the 404's own render) cachedRequestLocale="en"
//                  So `setRequestLocale` in the layout IS visible at real-404
//                  time — but only to the second render. The first render runs
//                  before the layout, misses the cache, and falls through to
//                  `headers()`. It is the first render that de-optimises the
//                  build, and no public API distinguishes the two. "Localise it
//                  only when actually rendering a 404" has no constructor here.
//               3. `unstable_rootParams()` returns `{}` inside this segment —
//                  measured, not assumed. Root params are the params of the ROOT
//                  layout, and the root layout is app/layout.tsx, which has no
//                  dynamic segment. So the route's own locale, which the build
//                  demonstrably knows (it prerenders /he and /en separately), is
//                  not reachable from here. See HONEST LIMIT 3 for what would
//                  make it reachable.
//               4. ⚠️ `<Link href="/" locale={DEFAULT_LOCALE}>` DOES NOT AVOID
//                  THE READ. In next-intl 4.14.4's
//                  navigation/shared/createSharedNavigationFns.js the server
//                  `Link` calls `getLocale()` UNCONDITIONALLY, before it looks at
//                  the `locale` prop. Passing the locale explicitly is therefore
//                  not a way to keep next-intl's `Link` in this file.
//
// CLASS         THIS INSTANCE. This file is now free of request-scoped reads;
//               it does not and cannot stop the next boundary file from adding
//               one. The DERIVATION that would close the class is named in
//               HONEST LIMIT 4 and is not written here.
//
// HONEST LIMIT  1. THE HEBREW COPY IS ABSENT, NOT PRESENT. The customer's build
//                  has exactly one 404 page and it is English-only, so
//                  he.notFound.* currently carries that ENGLISH text verbatim.
//                  This is NOT a translation and must not be read as one. Hebrew
//                  404 copy is OWED; closing it is a one-line edit to
//                  messages/he.json by someone licensed to write this site's
//                  words. No agent is.
//               2. ⚠️ THE 404 IS ALWAYS RENDERED IN THE DEFAULT LOCALE. In plain
//                  words: a visitor who 404s under /en/ is shown the HEBREW
//                  catalogue's 404. Today that is invisible, because
//                  he.notFound.* and en.notFound.* are byte-identical English
//                  (limit 1) — but that is a property of the DATA, not of this
//                  file, and the day Hebrew 404 copy lands, /en/* 404s start
//                  rendering in Hebrew. That is the price paid here, knowingly:
//                  the alternative is one `headers()` read that costs EVERY
//                  visitor to /he and /en a full server render of a ~110 KB page
//                  that no CDN and no browser may cache. A 404 is an edge case;
//                  the two content pages are the product.
//               3. WHAT WOULD BUY BACK THE LOCALISATION, precisely — it is one
//                  structural change, not a flag. `next/root-params` hands a
//                  boundary the ROOT layout's params with no request read at all,
//                  and would give this file the real locale on the prerender AND
//                  on a real 404. It returns `{}` here only because app/layout.tsx
//                  (a pass-through that exists to carry `metadataBase`) occupies
//                  the root-layout slot, leaving `[locale]` a NESTED segment. If
//                  app/[locale]/layout.tsx were made the root layout — the shape
//                  next-intl's own docs use — `locale` becomes a root param and
//                  this limit closes. Both files are outside this delegate's
//                  write-set; this is named, not attempted.
//               4. ⚠️ THIS FIX IS NOT SELF-DEFENDING. Nothing in the toolchain
//                  stops a future app/[locale]/error.tsx, global-error.tsx, or a
//                  later edit to THIS file, from importing `useLocale`,
//                  `getLocale` or `@/i18n/routing`'s `Link` — and any one of them
//                  silently returns /he and /en to dynamic rendering, with a
//                  green build, a green test suite, and a route table that still
//                  prints `●`. What would close it: an ESLint
//                  `no-restricted-imports` entry banning next-intl locale readers
//                  and `@/i18n/routing` navigation in `app/**/not-found.tsx`,
//                  `error.tsx` and `global-error.tsx`, plus a build-artefact gate
//                  asserting he.html and en.html exist. Neither is in this
//                  delegate's write-set.
//               5. ⚠️ THE SERVED 404 HAS NO `<html lang dir>` AT ALL, and an
//                  earlier version of this header claimed the opposite. MEASURED
//                  on the production build: GET /he/nope and GET /en/nope both
//                  return our component inside Next's own error shell,
//                  `<html id="__next_error__">` — the [locale] layout's `<html>`
//                  is NOT what reaches the wire for a 404. The words are right;
//                  the document's language annotation is missing. That element
//                  belongs to app/layout.tsx / app/not-found.tsx, outside this
//                  write-set, so it is reported rather than patched around here.
//               6. `setRequestLocale` is not called here, and calling it would
//                  change nothing: per MEASURED 2 the first render happens before
//                  the layout and has no locale to set.
//               7. There is no visual design here beyond legible centred text.
//                  Making the 404 look like the rest of the site is later work.
//               8. REACHABILITY: this file is the not-found boundary for the
//                  [locale] segment and is what /he/<anything> and /en/<anything>
//                  now render, via app/[locale]/[...rest]/page.tsx. Verified over
//                  HTTP against the production build, not assumed.
//               9. ⚠️ W13-B: WHAT THE `metadata` EXPORT IS NOT PROVED TO DO.
//                  It was probed on a DEV server (`next dev`, port 3987): a
//                  sentinel title was exported, /he/nope and /en/nope were
//                  fetched, and both returned the sentinel. That is a real
//                  response, not a declaration. But `next build` is forbidden to
//                  this delegate, so it is NOT proved on a PRODUCTION build, and
//                  /_not-found (the prerendered root 404, which IS in
//                  prerender-manifest.json) was not re-measured at all - a
//                  prerendered 404 takes whatever title the build baked in. If a
//                  production 404 still shows the memorial page's title, this
//                  export is the file to look at first, and the answer is
//                  probably `app/global-not-found.tsx` (see app/not-found.tsx
//                  HONEST LIMIT 1), not a second metadata export somewhere else.
//                 10. ⚠️ THE TITLE IS ONE WORD LONG AND IT IS "404". That is the
//                  customer's own string, not a choice made here, and it is the
//                  same string the <h1> renders - so the tab and the page cannot
//                  disagree. Whether a bereaved family wants a 404 tab that says
//                  more than a status code is a COPY decision, owed to a human,
//                  and this file must not pre-empt it by inventing a suffix.
// ─────────────────────────────────────────────────────────────────────────────
import Link from 'next/link'

import { DEFAULT_LOCALE, type Locale } from '@/config/site'
import { getMessages } from '@/i18n/messages'
import { localePath } from '@/lib/seo'

// ─── W13-B · THE ONE TYPED CONSTANT FOR THE ABSENT HEBREW 404 COPY ───────────
// §OPEN — one-edit item: app/[locale]/not-found.tsx:NOT_FOUND_COPY_LOCALE below.
//
// WHAT THIS IS. The locale the 404's WORDS ARE ACTUALLY WRITTEN IN — which is a
// different fact from DEFAULT_LOCALE, the locale whose catalogue they are READ
// FROM. Today those two disagree, and this constant is the one place that says
// so out loud instead of letting a document announce itself in a language its
// text is not in.
//
// MEASURED, not assumed (messages/he.json:196-200 and messages/en.json:185-189,
// read on 2026-09-13): `notFound.title` / `.description` / `.backHome` are the
// byte-identical English strings "404" / "Oops! Page not found" / "Return to
// Home" in BOTH catalogues. Hebrew 404 copy does not exist in this project, in
// the customer's build, or anywhere else. NO AGENT MAY AUTHOR IT.
//
// THE ABSENT BRANCH, and why it is a branch and not a decoration: this value is
// what app/not-found.tsx feeds to `lang` and `dir`. While it is 'en', a visitor
// who 404s outside the locale tree gets a document declared English and LTR —
// which is TRUE of the words on it. Before this constant existed that shell said
// `lang="he" dir="rtl"` over English text, so a screen reader announced English
// in a Hebrew voice and a translation engine saw a Hebrew document. The unset
// state is therefore SAFE AND HONEST rather than merely quiet.
//
// THE ONE EDIT THAT CLOSES IT. A human licensed to write this site's words
// replaces messages/he.json's `notFound.*` with real Hebrew, and in the SAME
// change sets the value below to DEFAULT_LOCALE. Two lines, one commit, and
// HONEST LIMIT 2's "the day Hebrew 404 copy lands" stops being a trap: the
// document's language annotation moves with the words instead of lagging them.
// ⚠️ DO NOT flip this because the site's default locale is Hebrew. Flip it only
// when the RENDERED STRINGS are Hebrew. It is typed `Locale`, so it cannot name
// a locale this site does not serve; nothing else checks that it is true.
// Consumed by the ROOT shell (app/not-found.tsx) for `lang`/`dir` — ONE FACT ONE
// PLACE: that shell states no locale of its own.
export const NOT_FOUND_COPY_LOCALE: Locale = 'en'

/**
 * W13-B: THE 404's OWN TITLE, and the defect it repairs.
 *
 * MEASURED BEFORE (live server, GET /he/nope and GET /en/nope, 2026-09-13):
 *   /he/nope → 404, and its <title> was byte-identical to GET /he's <title>
 *   /en/nope → 404, and its <title> was byte-identical to GET /en's <title>
 *              (that one reads: "In the end, everything will be okay")
 * The Hebrew title is deliberately NOT transcribed into this comment: this file
 * is under a Hebrew-codepoint scan and a quoted title is not worth weakening it.
 * i.e. every 404 under a locale advertised itself in a browser tab, a bookmark
 * and a search result as THE MEMORIAL PAGE. The title came from
 * app/[locale]/layout.tsx's `generateMetadata`, which the 404 inherits.
 * MEASURED AFTER, same two URLs: <title>404</title>.
 *
 * The word is NOT authored here. It is `notFound.title`, the string W7-FIX-E
 * transcribed from the customer's own NotFound.tsx:14, reached through the one
 * validated accessor — so the tab and the <h1> below cannot say different
 * things, and a missing key is a compile error rather than a literal
 * "notFound.title" in a bereaved family's search results.
 *
 * It is a MODULE CONSTANT, deliberately. Per the ⚠️ at the top of this file this
 * module is evaluated on every render of /he and /en; `getMessages` is a pure
 * synchronous read of a zod-validated catalogue with no request in scope, so
 * this costs the two content pages nothing and cannot de-optimise them.
 *
 * MEASURED that Next reads it at all: an `export const metadata` in a
 * `not-found.tsx` is not something Next's docs promise. A probe value was put
 * here, the live server was asked for /he/nope and /en/nope, and BOTH returned
 * the probe string as <title>. It works in this Next (15.5.25). See HONEST
 * LIMIT 9 for what that probe did NOT prove.
 */
export const metadata = {
  title: getMessages(DEFAULT_LOCALE).notFound.title,
}

export default function LocaleNotFound() {
  // A CONSTANT, on purpose. See the ⚠️ at the top of this file and MEASURED 2/3:
  // the active locale is not readable here without a request-scoped read, and a
  // request-scoped read in this component is paid by every visitor to /he and
  // /en, not by the visitor who 404s. HONEST LIMIT 2 states the cost.
  const notFound = getMessages(DEFAULT_LOCALE).notFound

  return (
    <main className="flex min-h-screen items-center justify-center ps-6 pe-6">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{notFound.title}</h1>
        <p className="mb-4 text-xl">{notFound.description}</p>
        {/*
          `next/link`, not `@/i18n/routing`'s `Link`: the latter reads the server
          locale unconditionally (MEASURED 4). The href is not hand-built either —
          `localePath` is the single place that knows the prefix convention, so
          this link goes exactly where the words on this page are written, with no
          middleware redirect hop in between.
        */}
        <Link href={localePath(DEFAULT_LOCALE)} className="underline">
          {notFound.backHome}
        </Link>
      </div>
    </main>
  )
}
