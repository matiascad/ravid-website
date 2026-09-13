// ─────────────────────────────────────────────────────────────────────────────
// W3-A I18N-ROUTING · middleware.ts  — THE SINGLE OWNER OF LOCALE REDIRECTION
//
// INVARIANT     Exactly one place in this project decides that a request with no
//               locale prefix becomes a request with one. That place is this
//               file, and it decides it from `routing` - the same object that
//               defines the locales, the default and the prefix mode - so the
//               redirect target cannot disagree with the routes that exist.
//               W7-FIX-D adds a SECOND invariant of the same shape, in the METHOD
//               dimension: exactly one place decides which HTTP methods this site
//               answers on a matched (localisable) path, and it decides by
//               ALLOWLIST - {GET, HEAD, OPTIONS} - evaluated BEFORE any locale
//               logic. A method is refused unless it was named; it is not served
//               unless it was forbidden. That direction is the whole fix: the
//               defect being repaired here is precisely that an un-enumerated
//               method was served by default.
//
// IMPOSSIBLE    (a) A SECOND `/` → `/he` redirect. There is no page at `/` to
//                   host one: app/page.tsx has been quarantined to
//                   _legacy/app/page-w2-scaffold-placeholder.tsx and the app tree
//                   now has content only under app/[locale]/. A competing
//                   redirect would have to invent a route first, and any route it
//                   invented would be shadowed by this middleware, which runs
//                   before routing.
//               (b) A redirect to a locale that is not served. The target comes
//                   from `routing.defaultLocale`, which config/site.ts types as a
//                   member of LOCALES; there is no string literal here to drift.
//                   ⚠️ THIS SENTENCE WAS FALSE WHEN FIRST WRITTEN, and is repaired
//                   here rather than rewritten, because (A) below made it true.
//                   next-intl's `localeDetection` defaults to TRUE, so the target
//                   did NOT come from `routing.defaultLocale`: it came from the
//                   caller's `accept-language` header. Measured on the built
//                   server, `GET /` returned 307 -> /he with no header, with `he`
//                   and with `fr`, but 307 -> /en with `accept-language: en`.
//                   i18n/routing.ts now sets `localeDetection: false`, which
//                   disables the cookie and header inputs and lets every `/`
//                   fall through to `routing.defaultLocale`. Re-measured after:
//                   all four of (none|he|en|fr) -> 307 /he. The sentence above is
//                   now literally true, and only because of that one line.
//                   (Note the original CONCLUSION held even while its REASON was
//                   false - header matching is constrained to `routing.locales`,
//                   so an unserved locale was never reachable. A true conclusion
//                   resting on a false reason is exactly the failure mode these
//                   headers exist to prevent; do not let one stand again.)
//               (c) THE CUSTOMER'S DEFECT G, structurally. Their language lived
//                   in `useState<Lang>("he")` - no URL, no cookie, no storage, no
//                   Accept-Language - so the choice reset on every reload and was
//                   invisible to crawlers. That state has no equivalent here: the
//                   locale is a path segment before any React code runs, so there
//                   is no in-memory variable that could be lost, and a crawler
//                   reads it from the URL. "Language that only the client knows"
//                   is not a thing this architecture can express.
//               (d) Middleware running on assets. The matcher excludes /api,
//                   /_next, /_vercel and every path containing a dot, so a
//                   redirect cannot be issued for an image, a font or a route
//                   handler.
//               (e) A ROOT-LEVEL NEXT METADATA ROUTE BEING LOCALE-PREFIXED.
//                   ⚠️ THIS SENTENCE WAS FALSE UNTIL W5-FIX-1, and is added here
//                   as a repair rather than as a boast. HONEST LIMIT 1 below
//                   predicted, in writing, that an extension-less public path
//                   would be swallowed; W5 then added app/opengraph-image.tsx
//                   without re-reading the matcher, and it was swallowed.
//                   Measured on the built server BEFORE the fix:
//                   GET /opengraph-image -> 307 /he/opengraph-image -> 404, and
//                   /icon, /apple-icon and /twitter-image 307'd the same way.
//                   /sitemap.xml, /robots.txt and /favicon.ico survived ONLY
//                   because they contain a dot - a coincidence of spelling, not
//                   a decision. The matcher now names the metadata conventions
//                   themselves, so the guarantee no longer rests on the dot:
//                   the set comes from Next's own
//                   node_modules/next/dist/lib/metadata/is-metadata-route.js
//                   (STATIC_METADATA_IMAGES + the robots/manifest/favicon/
//                   sitemap regexes in isMetadataRouteFile), which is the same
//                   file the router uses to decide what a metadata route IS.
//                   The four dot-bearing ones are now excluded TWICE, by name
//                   and by the dot rule, so limit 2's heuristic is no longer
//                   load-bearing for any of them.
//               (f) A NON-IDEMPOTENT OR UNKNOWN METHOD RENDERING A PAGE.
//                   ⚠️ ADDED BY W7-FIX-D AS A REPAIR, NOT A BOAST. Measured on the
//                   built server BEFORE the guard existed: POST, PUT, PATCH and
//                   DELETE on /he each returned 200 with the full 114,195-byte
//                   memorial page, and so did the WebDAV extension method
//                   PROPFIND - a method nobody in this project had ever named.
//                   OPTIONS /he returned 400 with an empty body and no `Allow`.
//                   Next does not apply a page's method policy to a middleware-
//                   matched request; nothing did, so everything was served.
//                   The guard below is an ALLOWLIST, so the NEXT method nobody
//                   enumerates is refused without this file changing - which is
//                   the only form of this fix that closes the class rather than
//                   the five instances that happened to be probed.
//                   REFUSING POST HERE IS SAFE, and that is a measured claim, not
//                   an assumption: the only POST this application issues is
//                   components/sections/LeadForm.tsx -> '/api/lead', and `api` is
//                   the FIRST alternative in the matcher's exclusion group, so
//                   the guard never sees it; and there is not one `'use server'`
//                   directive anywhere in app/, components/, lib/, i18n/ or
//                   config/ (grepped, zero hits), so no Server Action exists to
//                   POST to a page URL. ⚠️ IF A SERVER ACTION IS EVER ADDED, IT
//                   POSTS TO THE PAGE'S OWN URL AND THIS GUARD WILL 405 IT. That
//                   is the one change that re-falsifies this paragraph; whoever
//                   writes the first `'use server'` must add POST to ALLOWED
//                   below, or the form will fail silently at the middleware.
//
// CLASS         DERIVATION for locale redirection: one matcher, one factory, one
//               routing object, applied to every request that is not explicitly
//               excluded. It is not a per-route decision and there is no per-route
//               opt-in, so no future route can be added "without" it.
//               DERIVATION for method policy, the same shape: ONE allowlist
//               applied to every matched request before any path is inspected.
//               There is no per-route method table and no opt-in, so a route
//               added tomorrow inherits the policy by construction. It is
//               deliberately evaluated BEFORE the locale redirect, not after: a
//               307 offered to a method that will be refused at the destination
//               is a wasted round trip that advertises a door it will not open.
//
// HONEST LIMIT  1. ⚠️ THIS LIMIT PREDICTED A FAILURE AND THE FAILURE HAPPENED.
//                  It read, verbatim: "The exclusion is by PATTERN, not by
//                  knowledge. Any future extension-less public path (say
//                  `/robots` with no `.txt`) WILL be treated as a localisable
//                  route and redirected. Today the repo has no such path; W5
//                  must re-read this matcher when it adds sitemap/robots/OG
//                  endpoints." W5 added app/opengraph-image.tsx and did not
//                  re-read it. The prediction is kept above the repair because a
//                  limit that came true is the most valuable line in this file.
//                  WHAT IS NOW CLOSED: the exclusion is by KNOWLEDGE for the
//                  metadata conventions - all eight are named, taken from Next
//                  15.5.25's own is-metadata-route.js, not from memory.
//                  WHAT REMAINS OPEN, precisely:
//                  (a) The set is COPIED, not IMPORTED. Nothing in the type
//                      system ties this literal to Next's STATIC_METADATA_IMAGES,
//                      and nothing can: Next reads this `config` by STATIC
//                      ANALYSIS of the module (extract-const-value.js throws
//                      "Unsupported template literal with expressions" and
//                      "Unknown identifier"), so the matcher cannot be composed
//                      from an import, a constant or a template literal. It must
//                      be one string literal. A future Next release that adds a
//                      NINTH convention will not fail any check here - it will
//                      simply be swallowed, exactly as opengraph-image was. On
//                      every Next major upgrade, re-read that file and this line.
//                      ⚠️ THIS IS NOW ENFORCED, not just noted: __tests__/
//                      middleware-matcher.test.ts derives Next's convention list
//                      from node_modules at test time and compares it against this
//                      matcher, so a ninth convention - or a hand-edit that drops
//                      one - turns that suite RED with the gap named, instead of
//                      shipping as a silent 404. It does not make this list
//                      self-updating; a human still edits this matcher by hand. It
//                      only makes the failure loud instead of silent.
//                  (b) Only ROOT-level metadata routes are excluded, because the
//                      lookahead sits immediately after the leading `/`. That is
//                      deliberate: `/he/opengraph-image` SHOULD still reach the
//                      middleware so a future app/[locale]/opengraph-image.tsx
//                      keeps working. A nested metadata route is therefore NOT
//                      protected by this line, and does not need to be.
//                  (c) The bare, extension-less spellings `/icon`, `/apple-icon`,
//                      `/opengraph-image` and `/twitter-image` are now RESERVED:
//                      they can never be localised page paths, because those ARE
//                      the served URLs of those conventions. `/robots`,
//                      `/manifest`, `/sitemap` and `/favicon` without their
//                      extensions are NOT reserved and still redirect, because
//                      Next only ever serves those four WITH an extension.
//                      Measured: `/iconic` and `/icons-page` still redirect, so
//                      the exclusion is anchored at a segment boundary and does
//                      not eat ordinary content paths that merely share a prefix.
//                  (d) A POSITIVE matcher (match only `/` and `/(he|en)/...`)
//                      would close the class far harder and was considered and
//                      REJECTED: it would stop `/nope` and `/fr` redirecting to
//                      `/he/nope` and `/he/fr`, which the ledger records as
//                      measured-green. The negative form is a deliberate trade,
//                      not an oversight.
//               2. `.*\..*` excludes anything containing a dot ANYWHERE, not only
//                  a trailing extension. A legitimate localised URL with a dot in
//                  it would silently bypass i18n.
//               3. Middleware cannot fix a hand-written un-prefixed <a href>
//                  INSIDE the app: such a link redirects on click (a wasted round
//                  trip and a lost scroll position) rather than failing loudly.
//                  The constructor-level answer to that is i18n/routing.ts's
//                  `Link`, not this file.
//               4. This file is NOT verified by tsc alone - middleware only runs
//                  in a built server. Its evidence is the build's route table and
//                  a request, nothing less.
//               5. THE DETERMINISM OF `/` IS NOT A PROPERTY OF THIS FILE. It is a
//                  property of the routing config: this file is one call to
//                  `createMiddleware(routing)` and contains no locale logic of its
//                  own, so a future edit to `localeDetection` in i18n/routing.ts
//                  silently changes THIS file's observable behaviour without
//                  touching a character of it - and would silently re-falsify
//                  IMPOSSIBLE (b) above. The two files must be read together.
//                  Nothing in the type system couples them; only this note does.
//               6. NO NEXT_LOCALE COOKIE IS SET ON THESE RESPONSES, AND THAT IS
//                  NOT THIS FILE'S DOING. `localeCookie: false` in i18n/routing.ts
//                  is what stops the write; next-intl gates cookie WRITING on that
//                  flag and cookie READING on `localeDetection`, and both are off,
//                  so no locale is remembered between requests by anything here.
//                  Like limit 5, this is a runtime property of the CONFIG leaking
//                  through a file that contains no cookie logic of its own: flip
//                  `localeCookie` back to `true` in that other file and these
//                  responses start carrying `NEXT_LOCALE=he; Path=/; SameSite=lax`
//                  again without a character of this file changing.
//                  ⚠️ This limit REPLACES an earlier one asserting the opposite -
//                  that the cookie was "still SET ... and no longer read". That
//                  was true when written and became false when `localeCookie:
//                  false` landed; it is corrected rather than deleted so the next
//                  reader can see that one fact was living in two files and
//                  disagreeing with itself. i18n/routing.ts HONEST LIMIT 7 is now
//                  the one home of the cookie's meaning; this is a pointer to it,
//                  not a second copy. What PROVES it is
//                  i18n/__tests__/routing.test.ts, which asserts `Set-Cookie` is
//                  absent from this middleware's own response - and it goes red if
//                  the flag flips (proved by mutation, see that file's header).
//               7. ⚠️ `TRACE` STILL RETURNS 500 AND THIS FILE CANNOT FIX IT.
//                  This is the limit that matters, so it is written in full
//                  rather than implied by silence.
//                  WHAT HAPPENS: undici's `Request` constructor - which Next's
//                  edge runtime provides - throws
//                  `TypeError: 'TRACE' HTTP method is unsupported.` for the
//                  forbidden method set {CONNECT, TRACE, TRACK}. Measured stack,
//                  verbatim, from the built server:
//                      at new O  (.next/server/middleware.js:13:8488)
//                      at new a9 (.next/server/middleware.js:13:30406)
//                      at bd     (.next/server/middleware.js:13:32157)
//                  Decoded against the bundle: `O` is NextRequest (it extends
//                  undici Request and calls `super(c,b)`), `a9` is
//                  `class a9 extends O` = NextRequestHint, and `bd` is Next's own
//                  `adapter()` at its `new a9({... method: a.request.method ...})`
//                  line - server/web/adapter.js:129 in source.
//                  WHY NO CODE HERE CAN GUARD IT: `adapter()` builds that Request
//                  and THEN calls the user handler. Measured in the same bundle:
//                  the construction is at byte offset 32157 and the first
//                  `.handler(` call is at 36740, with NO occurrence of `.handler(`
//                  anywhere before 32157. The default export below IS that
//                  handler. It has therefore already thrown before one character
//                  of this file runs, on every matched path. `config.matcher`
//                  cannot help either: Next's matcher conditions are `source`,
//                  `has`, `missing` and `locale`, and `RouteHas.type` admits only
//                  header / cookie / query / host - there is no method predicate
//                  to exclude TRACE with.
//                  ⚠️ AND THE BRIEF THAT ORDERED THIS FIX WAS WRONG ABOUT THE
//                  BLAST RADIUS, which is why the limit is worth this much ink.
//                  It stated that the crash is "specifically in the middleware
//                  path" because /robots.txt, which the matcher EXCLUDES,
//                  correctly returns 405. Measured: `TRACE /api/lead` - also
//                  matcher-excluded - returns 500 too, with a DIFFERENT stack
//                  (`at new i (chunks/453.js)` -> `l.fromNodeNextRequest` ->
//                  `V (app/api/lead/route.js)`), i.e. the App Router's own
//                  request construction, nothing to do with middleware.
//                  /robots.txt survives only because it is a STATIC file served
//                  without building a WHATWG Request at all. The real class is
//                  "any path whose handling constructs a WHATWG Request from the
//                  node request", and middleware is one member of it, not the
//                  class. A two-path denominator produced a false diagnosis.
//                  WHERE THE FIX ACTUALLY BELONGS: the reverse proxy / CDN in
//                  front of this app (TRACE is conventionally refused there, and
//                  Vercel does refuse it), or Next itself. It is NOT in this
//                  file, and a try/catch here would not even be reached, let
//                  alone be honest.
//               8. WHAT THIS GUARD DOES NOT COVER, exactly.
//                  (a) EXCLUDED PATHS KEEP THEIR OWN METHOD POLICY, by design.
//                      /api/lead answers POST and 405s the rest with `Allow:
//                      POST`; the metadata routes 405 with `Allow: GET, HEAD`.
//                      This file must not overrule them - a route handler's verb
//                      set is the route handler's business - so the guard is
//                      scoped by the same matcher as everything else here.
//                  (b) METHODS THE NODE HTTP PARSER REFUSES NEVER REACH JS.
//                      Measured: `TRACK` and the nonsense token `FOO` return 400
//                      with an empty body on EVERY path including /robots.txt,
//                      and `CONNECT` gets no response line at all. That is llhttp
//                      and node's http server, one layer below Next. Those cells
//                      are already safe, but they are safe because of software
//                      this repo does not own, and their shape (bare 400, no
//                      `Allow`) is not the shape this file produces.
//                  (c) THE ALLOWLIST IS A LITERAL, NOT A DERIVATION. Nothing ties
//                      {GET, HEAD, OPTIONS} to what the pages under app/[locale]/
//                      actually export. Today those are static server components
//                      with no handlers at all, so the set is exact; the day one
//                      of them needs another verb, two files must agree and only
//                      this note says so.
// ─────────────────────────────────────────────────────────────────────────────
import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from './i18n/routing'

// The methods a localisable PAGE path answers. A memorial page is a document:
// it is read, and its metadata is asked about. Nothing is created, replaced or
// deleted at these URLs - the one thing this site accepts from a visitor is a
// lead, and that is POSTed to /api/lead, which this middleware never sees.
//   GET     - the page.                     Handed to next-intl, unchanged.
//   HEAD    - the page's headers.           Handed to next-intl, unchanged.
//             ⚠️ HEAD MUST STAY IN THIS SET. Crawlers and link unfurlers use it,
//             and Next answers it for pages by running GET and dropping the body.
//             Removing it from here would make the site unlinkable in preview
//             cards without changing anything a browser would show a human.
//   OPTIONS - answered HERE, 204 + `Allow`. See below.
// Anything else - named, unnamed, or not yet invented - is 405 + `Allow`.
const ALLOWED_METHODS = ['GET', 'HEAD', 'OPTIONS'] as const
const ALLOW_HEADER = ALLOWED_METHODS.join(', ')
const ALLOWED = new Set<string>(ALLOWED_METHODS)

const localeMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  // OPTIONS is answered here rather than forwarded, for two reasons. It is the
  // one method whose ANSWER IS THE `Allow` HEADER ITSELF (RFC 9110 s9.3.7), and
  // that answer is uniform across every path this matcher covers, so there is
  // nothing for the locale layer to contribute. And forwarding it is what
  // produced defect 2: measured, OPTIONS /he reached the page and came back 400
  // with an empty body and no `Allow` at all - a malformed response to a
  // perfectly well-formed request. 204 is chosen over 405 deliberately: a 405
  // whose own `Allow` header lists OPTIONS contradicts itself.
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: { Allow: ALLOW_HEADER },
    })
  }

  if (!ALLOWED.has(request.method)) {
    // 405 MUST carry `Allow` (RFC 9110 s15.5.6). The body deliberately matches
    // the 18-byte `Method Not Allowed` that Next already returns for the
    // metadata routes, so the site gives ONE answer to a refused method rather
    // than two that differ by which layer happened to catch it.
    return new NextResponse('Method Not Allowed', {
      status: 405,
      headers: {
        Allow: ALLOW_HEADER,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  return localeMiddleware(request)
}

export const config = {
  // Match every path EXCEPT:
  //   api      - route handlers (W5's /api/lead); never localised
  //   _next    - Next.js internals and build output
  //   _vercel  - platform internals
  //   <metadata> - the ROOT-LEVEL Next file-convention metadata routes. These
  //              are generated by app/<name>.(ts|tsx) and live at the root of
  //              the origin by definition, so a locale prefix makes them
  //              unreachable. The set is not invented here: it is the one Next
  //              15.5.25 itself uses to classify a metadata route, in
  //              node_modules/next/dist/lib/metadata/is-metadata-route.js -
  //              STATIC_METADATA_IMAGES gives icon / apple-icon / opengraph-image
  //              / twitter-image (+ favicon), and isMetadataRouteFile adds
  //              robots, manifest and sitemap. `\d*` covers the numbered
  //              variants that file matches (`icon2`), `-[a-z0-9]{6}` covers the
  //              route-group hash suffix get-metadata-route.js appends via
  //              djb2Hash(...).toString(36).slice(0,6), and the trailing `[/.]`
  //              covers both an extension and the `[__metadata_id__]` sub-path
  //              that generateImageMetadata / generateSitemaps produce.
  //              The four that always carry an extension are pinned to it, so
  //              bare `/robots` and `/sitemap` stay ordinary localisable paths;
  //              the four that are served WITHOUT one may also end the path.
  //   .*\..*   - anything with a file extension (images, fonts, txt). Kept as a
  //              second, independent net; it is no longer the only thing
  //              standing between a metadata route and a locale prefix.
  // `/` itself DOES match, and that is the point: it is where the one redirect
  // to the default locale happens. `/nope` and `/fr` still match too, and still
  // redirect to `/he/nope` and `/he/fr` - see HONEST LIMIT 1(d).
  // ⚠️ This MUST remain a single string literal: Next extracts this config by
  // static analysis and rejects template literals with expressions and
  // identifiers, so it cannot be built from named parts. See limit 1(a).
  matcher:
    '/((?!api|_next|_vercel|(?:icon|apple-icon|opengraph-image|twitter-image)\\d*(?:-[a-z0-9]{6})?(?:[/.]|$)|sitemap\\d*(?:-[a-z0-9]{6})?[/.]|robots\\.txt$|manifest\\.(?:webmanifest|json)$|favicon\\.ico$|.*\\..*).*)',
}
