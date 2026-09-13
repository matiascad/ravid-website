// ─────────────────────────────────────────────────────────────────────────────
// W2-A1 SCAFFOLD-CONFIG
// INVARIANT   Exactly one Next config exists and it is App-Router-shaped: strict
//             mode on, images served as AVIF/WebP, and i18n owned by next-intl's
//             plugin rather than by a Next key.
// IMPOSSIBLE  The dead Pages-Router `i18n: { locales, defaultLocale }` key is
//             gone. It cannot come back as a working feature: App Router ignores
//             it, and next-intl's plugin now owns locale routing, so any future
//             `i18n` key here would be shadowed rather than authoritative. A
//             remote image host cannot be used by accident either - with no
//             `domains` / `remotePatterns`, next/image REJECTS any non-local src
//             at request time instead of silently proxying it.
// CLASS       Closed by derivation for locale config: W3 adds routing in
//             i18n/request.ts and i18n/routing.ts and never edits this file.
// HONEST LIMIT  Removing the key proves nothing about the runtime - the ledger's
//             DEFERRED item "runtime proof that i18n{} is ignored" is closed only
//             by a green `next build`, which this delegate is forbidden to run.
//             The next-intl plugin below POINTS AT ./i18n/request.ts, a file W3
//             owns and which does not exist yet: until W3 lands it, `next build`
//             is expected to fail on the missing request config. That is a wave
//             ordering fact, not a defect in this file.
// W2-FIX-C   Added `outputFileTracingRoot: __dirname` to stop Next.js inferring
//             the workspace root from a stray /home/mati/package-lock.json
//             outside the project. HONEST LIMIT: this pins tracing to this file's
//             own directory via CommonJS `__dirname`, not a hardcoded path - it
//             does not remove or touch the outside lockfile, which was out of
//             scope.
// ─────────────────────────────────────────────────────────────────────────────
// W7-FIX-C SECURITY HEADERS
//
// INVARIANT     Every response this origin emits - HTML page, API route, sitemap,
//               OG image, `/_next/` static asset, middleware redirect - carries
//               the SAME security header set, because there is exactly ONE
//               `headers()` entry and its `source` is `/:path*`, which matches
//               every path including `/`. There is no per-route list to keep in
//               sync and no route that can be added later and forgotten: a new
//               route is covered the moment it exists. And no response advertises
//               the framework: `poweredByHeader: false` removes `X-Powered-By`
//               at the server, not per route.
//
// IMPOSSIBLE    (a) A ROUTE WITH A DIFFERENT HEADER SET. The values live in ONE
//                   array, `SECURITY_HEADERS`, applied by ONE rule. Divergence
//                   would require adding a second rule, which is a visible edit
//                   here, not a silent omission somewhere else.
//               (b) MIME SNIFFING. `X-Content-Type-Options: nosniff` is on every
//                   response, so a user-supplied byte stream can never be
//                   re-interpreted as script or style by a browser's sniffer.
//               (c) CLICKJACKING OF THE LEAD FORM. The form that collects name,
//                   phone and email cannot be framed: `X-Frame-Options: DENY`
//                   for legacy engines AND CSP `frame-ancestors 'none'` for
//                   modern ones - two mechanisms, one intent, both shipped.
//               (d) A HIJACKED FORM TARGET OR `<base>` INJECTION. CSP
//                   `form-action 'self'` and `base-uri 'self'` mean that even an
//                   injected `<base href>` or a rewritten form target cannot send
//                   a visitor's details to another origin.
//               (e) PLUGIN CONTENT. `object-src 'none'`.
//               (f) A SILENT ORIGIN DUPLICATE. ONE FACT ONE PLACE holds here by
//                   construction rather than by import: NO directive below names
//                   a host. Every one is `'self'` or `'none'`, so the site's
//                   origin - which `lib/seo.ts` owns - has nothing to copy into
//                   this file, and this file cannot drift from it.
//               (g) FEATURE ACCESS THE SITE NEVER ASKS FOR. `Permissions-Policy`
//                   denies camera, microphone, geolocation, payment, USB, MIDI,
//                   screen capture and the motion sensors to this document and
//                   to every frame within it.
//
// CLASS         Closed by derivation for HEADER COVERAGE: every present and
//               future route is covered by the single `/:path*` rule, so the
//               class "a route ships without security headers" is closed, not
//               just its instances. It is only THIS INSTANCE for HEADER
//               COMPLETENESS - see the limit: which headers exist is still a
//               judgement made once, here.
//
// HONEST LIMIT  Measured on the wire before and after (Node loopback client;
//               `curl` is blocked in this sandbox) across page / API / sitemap /
//               OG image / `/_next/` asset / root redirect.
//
//               1. NO `script-src`, `style-src`, `img-src`, `connect-src`, OR
//                  `default-src`. This is deliberate and it is the biggest gap.
//                  A `script-src` worth having needs a PER-REQUEST NONCE, and a
//                  nonce can only be minted in `middleware.ts` - a file outside
//                  this delegate's write-set. `headers()` here is static per
//                  route and cannot produce one. The only nonce-free
//                  alternative is `script-src 'unsafe-inline'`, because Next
//                  injects its own inline bootstrap scripts and the GA4 gtag
//                  bootstrap is inline too - and a `script-src` containing
//                  `'unsafe-inline'` stops no XSS whatsoever. Shipping it would
//                  buy a green scanner badge and nothing else. `connect-src
//                  'self'` was likewise rejected: it would silently kill GA4 the
//                  day `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, which is exactly
//                  the kind of delayed, invisible breakage a CSP must not cause.
//                  SO: the CSP below is REAL but PARTIAL. It enforces framing,
//                  form target, base URI and plugin content - four directives
//                  that no inline script or analytics host can trip over. XSS
//                  mitigation via CSP remains OPEN.
//
//                  ⚠️ W13-B CORRECTION - THE LAST SENTENCE OF THIS LIMIT USED TO
//                  READ "...and is owned by whoever owns `middleware.ts`." THAT
//                  HANDOFF IS FALSE AND FOLLOWING IT WOULD HAVE KILLED THIS SITE.
//                  It is corrected in place rather than deleted, because the next
//                  reader will arrive holding the same plausible idea.
//
//                  WHY A MIDDLEWARE NONCE CANNOT WORK HERE. Next derives a script
//                  nonce from the REQUEST header `content-security-policy`, in
//                  ONE place: app-render.js:108-109 -> get-script-nonce-from-
//                  header.js. That code runs only when app-render runs. `/he` and
//                  `/en` ARE NOT RENDERED PER REQUEST - they are prerendered to
//                  .next/server/app/he.html and en.html (both on disk; both in
//                  prerender-manifest.json) and served from the response cache by
//                  base-server.js, which contains ZERO occurrences of "nonce" and
//                  ZERO of "content-security-policy" (grepped, Next 15.5.25).
//                  MEASURED IN THE PRERENDERED BYTES: he.html carries 9 external
//                  `<script src>` tags and 21 inline `<script>` blocks, and NOT
//                  ONE has a nonce attribute - the build baked the literal
//                  `"nonce":"$undefined"` into the RSC payload, three times.
//                  THEREFORE: adding `script-src 'nonce-<per-request>'` to this
//                  response would block all 30 scripts on the two pages that ARE
//                  this site. The visitor gets an unhydrated shell. No test, no
//                  tsc, no lint and no HTTP status probe would go red - the page
//                  returns 200 with the right bytes and simply never comes alive.
//                  A nonce would "work" perfectly in `next dev`, where every
//                  route is dynamic, which is what makes this trap worth ink.
//                  WHAT WOULD ACTUALLY CLOSE IT, and the price of each:
//                  (a) Make /he and /en dynamic. Then the nonce is real - and
//                      W7-FIX-E's measured win is reversed: no he.html, no
//                      `x-nextjs-cache: HIT`, and every visitor pays a server
//                      render of a ~110 KB page. That is a product trade-off, not
//                      a security decision, and it is NOT an agent's to make.
//                  (b) Hash the bootstrap inline scripts at build time and emit
//                      `script-src 'strict-dynamic' 'sha256-...'`. This is the
//                      right architecture and it keeps the static pages. It needs
//                      a post-`next build` step that reads the emitted HTML, and
//                      a build is outside every delegate brief so far.
//                  (c) `Content-Security-Policy-Report-Only` with the nonce.
//                      Rejected: with no report collector configured it enforces
//                      nothing and reports to nobody. A decoration.
//                  UNTIL ONE OF THOSE LANDS, `script-src` STAYS ABSENT. An absent
//                  directive is an honest gap; a nonce here is a dead memorial.
//               2. `Strict-Transport-Security` is set WITHOUT `includeSubDomains`
//                  and WITHOUT `preload`. The apex domain is an unanswered
//                  question (ledger OPEN 5 - `SITE_URL` has no evidence in either
//                  repo), so asserting anything about SUBdomains that nobody has
//                  seen yet is the one HSTS foot-gun that is not reversible on a
//                  browser's timescale. The bare one-year policy is scoped to
//                  whichever host actually serves it, and browsers ignore an HSTS
//                  header delivered over plain HTTP - so it is inert in this
//                  sandbox by design, and correct the moment the site is on
//                  HTTPS. `preload` is a one-way door and is not this file's call.
//               3. `Cross-Origin-Embedder-Policy` and `Cross-Origin-Resource-
//                  Policy` are NOT set. COEP would require every subresource to
//                  opt in and buys nothing without cross-origin isolation, which
//                  this site does not need. COOP is set; the other two are not.
//               4. These headers are emitted by the Next server. If the site is
//                  ever fronted by a CDN or proxy that strips or overrides
//                  response headers, this file cannot know. Nothing here is
//                  proved about production until the headers are dumped against
//                  the deployed origin.
// ─────────────────────────────────────────────────────────────────────────────
const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/**
 * The Content-Security-Policy this site can enforce without a per-request nonce.
 * Every directive is host-free (`'self'` / `'none'`), so this policy can never
 * disagree with the origin that `lib/seo.ts` owns - it never names one.
 * See HONEST LIMIT 1 for the directives deliberately NOT here.
 */
const CONTENT_SECURITY_POLICY = [
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join('; ')

/** Browser features this site never uses, denied to this document and to any
 *  frame inside it. Only tokens current engines recognise - an unrecognised
 *  feature name is logged as a console error, which is noise, not security. */
const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'camera=()',
  'display-capture=()',
  'geolocation=()',
  'gyroscope=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'payment=()',
  'usb=()',
].join(', ')

/** THE one header set. Applied by the one rule in `headers()` below. */
const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Inert over HTTP by spec; takes effect only once the site is served over
  // HTTPS. No includeSubDomains, no preload - see HONEST LIMIT 2.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  // Stop advertising the framework. Free reconnaissance for no benefit.
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }]
  },
}

module.exports = withNextIntl(nextConfig)
