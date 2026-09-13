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
// LOCALE_DIRECTION ONLY. It is a module constant — `Record<Locale,'rtl'|'ltr'>`,
// total over the locale union — and it reads nothing from the request, which is
// why the tripwire below deliberately does not ban this module outright (it bans
// the navigation primitives from it, by name). This module is ALREADY in the
// /he and /en graph via app/[locale]/layout.tsx and app/[locale]/page.tsx, so
// this import adds no module to the prerender that was not already there —
// asserted by disk and manifest in W16-FIX4 MEASURED below, not by reasoning.
import { LOCALE_DIRECTION } from '@/i18n/routing'
import { localePath } from '@/lib/seo'

// ─────────────────────────────────────────────────────────────────────────────
// W16-D AMENDMENT · ONE LINE CHANGED, AND THE LINE IS BELOW. READ THIS FIRST.
//
// WHAT LANDED ELSEWHERE, that this file must answer for:
//   HONEST LIMIT 1 and 2 above are now HISTORY, not fact. Hebrew 404 copy exists.
//   MEASURED, raw catalogues, 2026-09-13, BEFORE:
//     he.notFound and en.notFound were byte-identical and BOTH English — so the
//     component's DEFAULT_LOCALE read and the shell's 'en' declaration agreed by
//     ACCIDENT, not by construction. AFTER: messages/he.json carries Hebrew.
//   HONEST LIMIT 2 predicted the exact consequence and it has arrived: this
//   component reads DEFAULT_LOCALE ('he'), so EVERY 404 now renders in Hebrew,
//   including /en/<missing>. That is not a new defect introduced here; it is the
//   knowingly-priced behaviour of limit 2 becoming visible. It is reported, with
//   its one structural fix, in HONEST LIMIT 11.
//
// WHAT IS FIXED HERE, and it is ledger D-137: `NOT_FOUND_COPY_LOCALE` was the
//   LITERAL 'en' while the words came from `DEFAULT_LOCALE`. Two facts, two
//   places, and nothing to notice when they diverged — which is precisely what
//   just happened. It is now DERIVED from DEFAULT_LOCALE.
//
// INVARIANT     The locale whose catalogue supplies the words on this page and
//               the locale the root shell declares in `lang`/`dir` are THE SAME
//               EXPRESSION, not two values a human keeps in step. Change
//               DEFAULT_LOCALE and both move together.
//
// IMPOSSIBLE    A root-shell 404 whose `lang`/`dir` disagrees with the script of
//               its own words. There is no longer a second value to get wrong:
//               `getMessages(DEFAULT_LOCALE)` and `NOT_FOUND_COPY_LOCALE` are the
//               same fact, spelled once. Before this edit, flipping either one
//               alone compiled, tested green, and shipped a mismatch.
//
// CLASS         This file's own copy-locale fact, for every locale. It does NOT
//               close the class of "the served document declares the right
//               language" — see HONEST LIMIT 5 above and 11 below. INSTANCE.
//
// HONEST LIMIT 11. ⚠️ SUPERSEDED BY W16-FIX4 — DO NOT READ THE TEXT BELOW AS A
//               DESCRIPTION OF WHAT SHIPS. It said: "/en/<missing> NOW RENDERS
//               HEBREW WORDS ... NOT closed by this edit ... the fix is the
//               structural one already named in HONEST LIMIT 3 [root-params]."
//               HALF OF THAT IS STILL TRUE and half was a category error. STILL
//               TRUE: /en/<missing> renders Hebrew words, and this file still
//               cannot know it is on /en. FALSE: that the ONLY remedy was to
//               learn the request locale. The harm named was that assistive
//               technology would read Hebrew in an English voice — that is a
//               LANGUAGE-ANNOTATION defect, and annotating the PART needs no
//               locale detection at all. See W16-FIX4 below and HONEST LIMIT 14
//               for what is closed and what is not.
//
// ─────────────────────────────────────────────────────────────────────────────
// W16-FIX1 AMENDMENT · NO LINE OF THIS COMPONENT CHANGED, AND THAT IS THE RESULT.
//
// This delegate was sent to close HONEST LIMIT 11. It did not. It re-measured the
// evidence, measured the remedy limit 11 names, found that remedy DOES NOT EXIST
// AT THIS VERSION, and is recording that instead of shipping a worse fix. What
// follows is the correction of a claim in this file that was true when written
// and is false now - left uncorrected, it would cost the next delegate its whole
// budget rediscovering it.
//
// 1. MEASURED 1 STILL HOLDS - RE-VERIFIED, NOT INHERITED. Isolated build rig,
//    Next 15.5.25, ONE variable changed (a `getLocale()` call added to this
//    file) against an otherwise identical tree:
//        he.html / en.html on disk     PRESENT  ->  ABSENT
//        prerender-manifest routes     7        ->  4  (/he, /en, /_not-found gone)
//        /_not-found in the route table    circle  ->  f
//        the route table for /[locale]     bullet  ->  bullet   UNCHANGED
//    THE LAST ROW IS THE ONE TO READ. The build still printed the SSG bullet and
//    still listed /he and /en beneath it while neither was prerendered. So option
//    (a), a request-scoped locale read here, is FORBIDDEN on this version - and
//    `next build`'s own route table is not a witness that would have told us.
//    A tripwire on the CAUSE now exists in this file's test (W16-FIX1 block).
//
// 2. ⚠️ HONEST LIMIT 3 / 11 NAME A REMEDY THAT IS NOT AVAILABLE. Both say: make
//    app/[locale]/layout.tsx the root layout so `next/root-params` yields the
//    locale with no request read. MEASURED in the installed Next 15.5.25:
//      · `next/root-params` is refused by a webpack invalid-import rule -
//        "can only be imported when `experimental.rootParams` is enabled"
//        (build/webpack-config.js:2241). That is a next.config.js edit.
//      · the fallback `unstable_rootParams()` warns, in this version, that it
//        "is deprecated and will be removed in an upcoming major release".
//      · its `case 'prerender-client'` branch THROWS an InvariantError saying the
//        API "must not be used within a client component" - and per the warning at
//        the top of this file, this component IS a client boundary's prop.
//    So the structural fix is not one file move. It is a file move PLUS an
//    experimental config flag PLUS a deprecated-or-flagged API whose own source
//    forbids the position this component occupies. That is not landable safely in
//    one delegate's budget with three siblings writing this repo, and it is not
//    landable at all from this write-set. HONEST LIMIT 3 and 11 should be read
//    with this paragraph attached.
//
// 3. THE REGRESSION, MEASURED ON THE WIRE rather than taken on report. Production
//    build, this delegate's own server, port of its own choosing:
//        GET /he/nope  404   Hebrew body           English 404 strings: absent
//        GET /en/nope  404   Hebrew body           English 404 strings: absent
//        GET /he       200   GET /en  200          both still prerendered
//    Both 404s carry `<meta name="robots" content="noindex">` and both begin
//    `<html id="__next_error__">` - NO lang and NO dir in the served bytes at all,
//    exactly as app/not-found.tsx HONEST LIMIT 2 and limit 5 above state.
//
// 4. WHY DEFER RATHER THAN OPTION (b), CLIENT-SIDE SELECTION. Priced, not dodged.
//    This component is the client boundary's prop, so its chunk loads on EVERY
//    render of /he and /en - client selection puts JS on the two content pages,
//    which are the product, to correct an edge case. It leaves the SERVED bytes
//    Hebrew regardless, on a page that is already noindex, so the only reader it
//    helps is one that runs JS. And it BREAKS D-137: the moment the words flip to
//    English after hydration, the lang/dir the shell declared no longer describe
//    them, so it would have to mutate documentElement - racing Next's own
//    application of the RSC payload. A fix that opens new problems steps UP a
//    level; up is (2) above, and (2) is blocked. NOT CLOSABLE AT THIS LEVEL.
//
// 5. ⚠️ WHICH 404 IS WORSE FOR THIS SITE, said plainly, because the answer decided
//    this. `/` redirects to /he and this site's audience is Hebrew. BEFORE
//    tonight every visitor got an ENGLISH 404 - the majority, in the wrong
//    language, under a document announcing `lang="he" dir="rtl"` over English
//    prose. AFTER tonight the MINORITY - /en visitors - get a Hebrew 404 under a
//    document whose declared language matches its own words. Neither is correct.
//    The one shipping now is the LESS wrong of the two for this site, and it is
//    the first time /he has been right at all. That is why reverting is refused
//    and why spending an architectural risk budget on it tonight is refused.
//
// 6. ⚠️ D-137 ON /en/nope IS NOT-MEASURED, AND THE BRIEF'S READING OF IT MAY BE
//    WRONG. The brief states /en/nope is `lang="he" dir="rtl"` over Hebrew,
//    internally consistent. MEASURED in the served payload: /he/nope carries
//    he/rtl and NOTHING ELSE, but /en/nope carries BOTH he/rtl (this project's
//    root shell) AND en/ltr (the [locale] layout's html, from the render Next
//    discards). Which pair survives hydration is not decidable from bytes and was
//    NOT measured here - no browser was driven. If en/ltr wins, the hydrated
//    /en/nope announces English over Hebrew words and D-137 is OPEN there, not
//    resolved. This is the first thing the next delegate should measure.
//
// INVARIANT     Unchanged and re-verified: this file reads nothing from the
//               request, and the locale of its words and the locale the shell
//               declares remain ONE expression (`NOT_FOUND_COPY_LOCALE =
//               DEFAULT_LOCALE`). This amendment adds no second fact to keep in
//               step, because it adds no code.
// IMPOSSIBLE    A request-scoped read entering EITHER not-found boundary without
//               a red test. That was previously invisible - green build, green
//               suite, route table still printing the bullet (see 1). It is now a
//               source-scan assertion over both boundary files.
// CLASS         PARTIAL. The import tripwire is a DERIVATION over both boundary
//               files and any future edit to them. The defect this delegate was
//               SENT for - /en/<missing> rendering Hebrew - is THIS INSTANCE and
//               is NOT closed. Do not read the green suite as its closure.
// HONEST LIMIT 12. ⚠️ PARTLY SUPERSEDED BY W16-FIX4. Its first sentence — "THIS
//               DELEGATE CHANGED NO BEHAVIOUR ... every word of limit 11 still
//               describes what ships" — was true of W16-FIX1 and is FALSE now:
//               the served markup changed, measured in a browser (W16-FIX4
//               MEASURED). Its list (i)–(iv) of "what would actually close it"
//               remains accurate for the SC 3.1.1 half and is still owed. The
//               original text follows, unedited, for the record.
//               THIS DELEGATE CHANGED NO BEHAVIOUR. /en/<missing> still
//               renders Hebrew, and every word of limit 11 still describes what
//               ships. What changed is that limit 11's named remedy is now known
//               to be unavailable (2), the evidence forbidding option (a) is now
//               first-hand (1), and the failure mode is now caught by a test (the
//               tripwire). REVERSAL COST of what landed: delete one describe block
//               from app/[locale]/__tests__/not-found.test.tsx and this comment.
//               No runtime code, no bytes, no route. WHAT WOULD ACTUALLY CLOSE IT,
//               in order: (i) `experimental.rootParams: true` in next.config.js,
//               (ii) app/layout.tsx retired to _legacy/ so app/[locale]/layout.tsx
//               becomes the root layout, (iii) this file reading the locale from
//               `next/root-params`, (iv) a build-artefact gate asserting he.html
//               and en.html exist, because per (1) the route table will not say.
//               Items (i) and (iv) were outside this delegate's write-set; (ii)
//               was inside it and was refused on risk, measured in (2).
//              13. THE TRIPWIRE SCANS IMPORT STATEMENTS, NOT SEMANTICS. An
//               indirect read through a helper module, or a dynamic import, passes
//               it. It catches the way this defect has actually arrived twice; it
//               is not a proof of absence. The ESLint half named in HONEST LIMIT 4
//               is still owed and is still not writable from here.
//               ⚠️ W16-FIX4 ADDENDUM, and it makes this limit LOAD-BEARING rather
//               than academic: this file now imports `@/i18n/routing`, a module
//               whose OTHER exports (`Link`, `redirect`, `usePathname`,
//               `useRouter`) are exactly the request readers MEASURED 4 forbids.
//               The tripwire's third assertion catches those BY NAME on the same
//               import line; it does not and cannot catch a later edit that
//               reaches them through an alias or a re-export. The ESLint
//               `no-restricted-imports` entry of HONEST LIMIT 4 should now be
//               written as a PATH-scoped rule allowing only `LOCALE_DIRECTION`
//               from that module in `app/**/not-found.tsx`. Still not writable
//               from here.
// ─────────────────────────────────────────────────────────────────────────────
// W16-FIX4 · THE LANGUAGE OF THE PART. ONE ATTRIBUTE PAIR, ON THE ELEMENT THAT
// ALREADY EXISTED. This is the THIRD fix at this spot, so it is written as a
// replacement of the unit's reasoning, not as another guard laid over the last.
//
// THE DEFECT, REPRODUCED IN A REAL BROWSER BEFORE ANYTHING WAS TOUCHED. Chromium
// via Playwright, driven against THIS repo's production build served by
// `next start` on a port confirmed bound by `ss` and a 200 — not curl, not the
// served bytes, but the HYDRATED DOM, because HONEST LIMIT 5 / W16-FIX1 (6)
// left open which of the two <html> elements in the payload survives:
//     /he/nope  404  <html lang="he" dir="ltr"->rtl>  h1/p/link: Hebrew (61 cp)
//                    nearest-ancestor lang of the Hebrew <h1>:  html  lang="he"
//     /en/nope  404  <html lang="en" dir="ltr">       h1/p/link: Hebrew (61 cp)
//                    nearest-ancestor lang of the Hebrew <h1>:  html  lang="en"
// SO: en/ltr WINS on /en/nope. W16-FIX1's limit (6) guessed right to flag it;
// the guess resolves AGAINST the site. A screen reader on /en/<missing> was
// told "this is English" and handed Hebrew — WCAG 2.2 SC 3.1.1 failure, on the
// 404 page of a memorial. Note also `dir="ltr"` over Hebrew prose: the
// direction was wrong as well as the language.
//
// WHY NOT THE TWO OBVIOUS FIXES — priced, then rejected, with reasons:
//   (a) TRANSLATE, i.e. make /en render the English catalogue. It does not fix
//       this. The component cannot learn which locale it is on without the read
//       MEASURED 1 proves empties the prerender (he.html/en.html PRESENT→ABSENT,
//       manifest 7→4, route table UNCHANGED). Translation changes WHICH words
//       are wrong, never whether the document describes them.
//   (b) FORCE `lang="he"` ON THE DOCUMENT. Wrong on its own terms and out of
//       scope: the element that announces `en` on /en/nope is
//       app/[locale]/layout.tsx's <html>, which is correct for /en's own chrome
//       and is not in this write-set. Overriding it would trade a wrong 404
//       annotation for a wrong annotation on the two content pages, which are
//       the product.
//   (c) CLIENT-SIDE SELECTION — already priced and rejected at W16-FIX1 (4),
//       unchanged: JS on the two content pages to correct an edge case.
// WHAT IS ACTUALLY WRONG is narrower than any of them: an element containing
// Hebrew was not marked as Hebrew. WCAG 2.2 SC 3.1.2 (Language of Parts) is the
// provision for exactly this, and it needs no locale detection — this component
// knows STATICALLY that it renders NOT_FOUND_COPY_LOCALE's catalogue.
//
// INVARIANT     THE WORDS ON THIS PAGE AND THE LANGUAGE DECLARED OVER THEM ARE
//               ONE EXPRESSION. `getMessages(NOT_FOUND_COPY_LOCALE)` supplies the
//               text and `lang={NOT_FOUND_COPY_LOCALE}` /
//               `dir={LOCALE_DIRECTION[NOT_FOUND_COPY_LOCALE]}` annotate the
//               element that contains it — the same constant, three times, never
//               a second value a human keeps in step. Change DEFAULT_LOCALE and
//               words, lang and dir all move together, in the same render.
//               This holds with NO knowledge of the request, so it holds
//               identically on the prerender, on a real 404, and under every URL
//               the boundary can be mounted on.
//
// IMPOSSIBLE    A text node of this page whose nearest `lang` ancestor disagrees
//               with the catalogue the text came from — under ANY document
//               shell, present or future, including Next's hardcoded
//               `<html id="__next_error__">` which carries no lang at all. The
//               annotation is now INSIDE the subtree this component owns, so no
//               element above it can be wrong about this content; the worst an
//               ancestor can do is be right about something else. There is no
//               construction left that puts the words and their declaration in
//               different files — which is what every previous fix at this spot
//               attempted, and why each one failed when the shell changed.
//
// CLASS         THIS INSTANCE, honestly. The <main> here is the whole of this
//               component's rendered output, so the rule covers 100% of the
//               words this file can emit — but it is an attribute pair written
//               once, not a derivation that forces the NEXT component rendering
//               a fixed-locale catalogue to annotate itself. The derivation that
//               would close the class is a `<LocalisedText locale>` primitive
//               (or an ESLint rule pairing `getMessages(X)` with `lang={X}`);
//               neither exists and neither is written here. DENOMINATOR: 1 of 1
//               fixed-locale subtree in this file; 1 of an unknown number in the
//               app — app/[locale]/error.tsx and global-error.tsx do not exist
//               yet and would have the identical problem.
//
// HONEST LIMIT 14. ⚠️ SC 3.1.1 (LANGUAGE OF PAGE) IS STILL OPEN ON /en/<missing>.
//               This closes SC 3.1.2, not 3.1.1: `<html lang="en">` still stands
//               over a page whose only content is Hebrew. What that costs is
//               narrow and should not be overstated — every text node is now
//               correctly annotated, so a conforming screen reader switches
//               voice on the content — but a tool that reads only the document
//               element (a translation engine, a language-detection crawler, a
//               reader that ignores part-level lang) still sees "en". Closing it
//               needs the request locale, i.e. W16-FIX1 (2)'s blocked route
//               (`experimental.rootParams` + root-layout move + `next/root-params`
//               + a build-artefact gate) — none of it in this write-set, all of
//               it still owed.
//              15. ⚠️ THE WORDS ARE STILL HEBREW ON /en. NOT FIXED, NOT FIXABLE
//               HERE, and now HARMLESS TO ASSISTIVE TECHNOLOGY rather than
//               actively misleading to it. An English-speaking visitor who 404s
//               under /en still cannot read the page. That is HONEST LIMIT 2's
//               knowingly-priced cost and it is unchanged.
//              16. `dir` ON <main> DOES NOT REACH THE SUSPENSE FALLBACK OR THE
//               FIRST BYTES. Per HONEST LIMIT 5 and app/not-found.tsx limit 2,
//               Next streams the 404's content into a suspense boundary under a
//               hardcoded shell; with JS off the page is blank, so there is no
//               text for this attribute to annotate and nothing is made worse.
//               MEASURED here in the HYDRATED DOM, which is the only place this
//               page has content at all.
//              17. ⚠️ NOT MEASURED: a real screen reader. What was measured is
//               the DOM fact assistive technology resolves against — the nearest
//               `lang` ancestor of the actual Hebrew text node, walked up from
//               the rendered <h1> in Chromium. No NVDA/VoiceOver/TalkBack was
//               driven, and no claim about pronunciation is made from bytes.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * THE locale whose words this 404 shows, and therefore the locale the root shell
 * declares. DERIVED, not typed a second time: the component below reads
 * `getMessages(DEFAULT_LOCALE)`, so any other value here is a lie about the page
 * — which is exactly the ledger D-137 mismatch this line removes.
 */
export const NOT_FOUND_COPY_LOCALE: Locale = DEFAULT_LOCALE

/**
 * W13-B: THE 404's OWN TITLE. See HONEST LIMIT 9 and 10 above for what the probe
 * that established this export did and did not prove. The word is not authored
 * here: it is `notFound.title`, read through the one validated accessor, from the
 * SAME locale the body below reads, so the tab and the <h1> cannot disagree.
 */
export const metadata = {
  title: getMessages(NOT_FOUND_COPY_LOCALE).notFound.title,
}

export default function LocaleNotFound() {
  // A CONSTANT, on purpose. See the ⚠️ at the top of this file and MEASURED 2/3:
  // the active locale is not readable here without a request-scoped read, and a
  // request-scoped read in this component is paid by every visitor to /he and
  // /en, not by the visitor who 404s. HONEST LIMIT 2 states the cost.
  const notFound = getMessages(NOT_FOUND_COPY_LOCALE).notFound

  return (
    // `lang`/`dir` HERE, ON THE ELEMENT THAT HOLDS THE WORDS — not on <html>.
    // This component knows STATICALLY which catalogue it renders
    // (NOT_FOUND_COPY_LOCALE), and it cannot know which URL it is on without the
    // request read that MEASURED 1 forbids. So it annotates the PART it is
    // certain of (WCAG 2.2 SC 3.1.2) and leaves the PAGE-level declaration
    // (SC 3.1.1) to whichever shell wins — `<html lang>` is not touched, and
    // does not need to be, because a `lang` on an ancestor of the text node is
    // what assistive technology resolves against. Both attributes are
    // expressions over the SAME one constant, so they cannot drift from each
    // other, and neither restates the copy locale — it is derived.
    <main
      lang={NOT_FOUND_COPY_LOCALE}
      dir={LOCALE_DIRECTION[NOT_FOUND_COPY_LOCALE]}
      className="flex min-h-screen items-center justify-center ps-6 pe-6"
    >
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
        <Link href={localePath(NOT_FOUND_COPY_LOCALE)} className="underline">
          {notFound.backHome}
        </Link>
      </div>
    </main>
  )
}
