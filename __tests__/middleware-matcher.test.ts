// ─────────────────────────────────────────────────────────────────────────────
// W5-FIX-4 · __tests__/middleware-matcher.test.ts
// THE ENFORCER FOR middleware.ts HONEST LIMIT 1(a)
//
// WHY THIS FILE EXISTS — the second failure on one spot.
//   W3 wrote, verbatim, into middleware.ts: "The exclusion is by PATTERN, not by
//   knowledge. Any future extension-less public path (say `/robots` with no
//   `.txt`) WILL be treated as a localisable route and redirected. Today the repo
//   has no such path; W5 must re-read this matcher when it adds sitemap/robots/OG
//   endpoints." W5 added app/opengraph-image.tsx and did not re-read it.
//   /opengraph-image shipped as 307 -> /he/opengraph-image -> 404, and /icon,
//   /apple-icon and /twitter-image were swallowed identically. The matcher was
//   then repaired, and a NEW note was written in its place. A note is what
//   already failed, once, measurably. §E non-convergence says stop writing better
//   notes and step up a level: make it FAIL. That is this file's whole job.
//
// INVARIANT   Every root-level URL that Next.js 15.5.25 itself will serve for a
//             file-convention metadata route is EXCLUDED from the locale
//             middleware's matcher — and the set of those URLs is DERIVED from
//             Next at test time, never retyped here. Three facts, three owners,
//             all read live:
//               · WHICH conventions exist  -> next/dist/lib/metadata/
//                 is-metadata-route.js (STATIC_METADATA_IMAGES + the regex list
//                 inside isMetadataRouteFile) — the same module the router uses.
//               · WHAT URL each is SERVED at -> next/dist/lib/metadata/
//                 get-metadata-route.js (normalizeMetadataRoute +
//                 normalizeMetadataPageToRoute) — the same functions the build
//                 uses to turn app/robots.ts into /robots.txt.
//               · WHETHER the matcher excludes a URL -> Next's own published
//                 test helper unstable_doesMiddlewareMatch, which compiles the
//                 matcher through getMiddlewareMatchers + getMiddlewareRouteMatcher,
//                 i.e. the production code path. No hand-rolled `^...$` regex.
//             The matcher itself is IMPORTED from middleware.ts, not copied.
//
// IMPOSSIBLE  The specific failure that shipped twice can no longer reach a green
//             suite. Concretely, these can no longer be CONSTRUCTED:
//             (a) Adding a metadata endpoint whose root URL the matcher swallows.
//                 It is not "remember to re-read the matcher" any more; the check
//                 runs on every `npx vitest run`, and a swallowed convention is a
//                 named red test, not a 404 a human has to go looking for.
//             (b) A NINTH convention landing in a Next upgrade unnoticed. The
//                 denominator is derived and cross-checked against the number of
//                 `new RegExp(` entries in Next's own classifier, so a ninth entry
//                 makes the count assertion red even if this file's parser never
//                 learns its name. Silence on a Next upgrade is impossible; the
//                 only two outcomes are green or a named failure.
//             (c) A vacuously-green guard. Half of these assertions require paths
//                 to be MATCHED. A matcher that excluded everything — the cheapest
//                 way to make a one-sided exclusion test pass — fails here.
//             (d) A guard that cannot go red. The mutation witness below runs the
//                 real assertions against the real pre-fix matcher and asserts
//                 they detect the four real historical failures. If this file ever
//                 rots into a no-op, that test is the one that says so.
//
// CLASS       DERIVATION over the whole convention set, not the one instance that
//             was reported. The bug was FOUND as /opengraph-image; the class is
//             "root metadata route silently localised", and it had 8 members, of
//             which 4 were live defects and 4 survived only because their
//             spellings happen to contain a dot. This file enumerates the class
//             from its owner rather than listing its members: nothing here names
//             a convention, so conventions added by Next are covered — or reported
//             — without editing this file. The URL-shape rules are derived too,
//             which is why /robots (no extension) and /sitemap (no extension) are
//             on the MATCHED side: Next's own normalizer says those are not served
//             URLs, so nothing here has to remember that they aren't.
//
// HONEST LIMIT
//   1. THIS DOES NOT CLOSE middleware.ts HONEST LIMIT 1(a) — it ENFORCES it.
//      The set in middleware.ts is still COPIED and still cannot be imported
//      (Next extracts `config` by static analysis; extract-const-value.js throws
//      "Unsupported template literal with expressions" and "Unknown identifier",
//      so the matcher must be one string literal). What changed is the failure
//      mode, and only that: a ninth Next convention used to be swallowed in
//      silence, and now turns this file RED with the convention named. A human
//      still has to edit the matcher by hand. Enforceable, not automatic.
//   2. THIS TESTS A STRING, NOT A SERVER. It proves the matcher does not select
//      these URLs for the middleware. It does NOT prove the endpoint returns 200,
//      that the route exists, or that the image renders — middleware.ts HONEST
//      LIMIT 4 stands unchanged: that evidence is a built server and a request,
//      and nothing less. A convention with no app/<name>.tsx file passes here.
//   3. ROOT LEVEL ONLY, deliberately — middleware.ts HONEST LIMIT 1(b). Nested
//      spellings like /he/opengraph-image are NOT asserted, because they SHOULD
//      reach the middleware so a future app/[locale]/opengraph-image.tsx works.
//      Route-group hash suffixes (/opengraph-image-a1b2c3) and the numbered
//      variants (/icon2) that the matcher also excludes are likewise NOT asserted:
//      Next's normalizer only emits them for app trees this repo does not have, so
//      deriving them would mean inventing them. NOT-MEASURED, named.
//   4. THE NAME PARSE READS SOURCE TEXT. Four of the eight names (robots,
//      manifest, favicon, sitemap) exist in Next only as literals inside regex
//      template strings, so they are recovered from
//      isMetadataRouteFile.toString(). That is a parse of another package's
//      implementation and it is brittle BY CONSTRUCTION. It is guarded, not
//      trusted: the derived count is asserted equal to the number of `new RegExp(`
//      entries in the same source, so a refactor that defeats the parse produces a
//      RED count, never a quietly shorter list. Brittle-and-loud was chosen over
//      a hardcoded list, which would be robust-and-wrong — a retyped list is
//      exactly the drift that put /opengraph-image in production.
//   5. IT ASSERTS NOTHING ABOUT app/. Whether opengraph-image.tsx still exists,
//      still exports the right size, or was deleted this morning is invisible
//      here. This file owns one question — does the matcher let the URL through —
//      and answers only that one.
//   6. MW_MATCHER_MUTATION (the ⑤/⑧.5 hook below) lets a matcher be supplied from
//      the environment. It cannot be used to fake a pass: a permissive value fails
//      the exclusion tests and a total-exclusion value fails the MATCHED tests, so
//      the hook can only ever produce a red this file already knows how to
//      produce. Unset — which is every CI run — it reads middleware.ts.
// ─────────────────────────────────────────────────────────────────────────────
import { createRequire } from 'node:module'

import { config } from '@/middleware'

const requireNext = createRequire(import.meta.url)

/* ── Next's own modules, loaded at TEST TIME ─────────────────────────────────
 * These are CommonJS internals with no `exports` map and getter-based named
 * exports, so they are loaded through createRequire rather than `import`, and
 * given local structural types rather than `any` (eslint no-explicit-any is an
 * error in this repo). The shapes below are asserted at runtime by the
 * denominator test — if Next changes them, that test goes red.
 */
interface StaticMetadataImage {
  readonly filename: string
  readonly extensions: readonly string[]
}

interface IsMetadataRouteModule {
  readonly STATIC_METADATA_IMAGES: Record<string, StaticMetadataImage>
  readonly isMetadataPage: (page: string) => boolean
  readonly isMetadataRouteFile: (
    appDirRelativePath: string,
    pageExtensions: string[],
    strictlyMatchExtensions: boolean,
  ) => boolean
}

interface GetMetadataRouteModule {
  readonly normalizeMetadataRoute: (page: string) => string
  readonly normalizeMetadataPageToRoute: (page: string, isDynamic: boolean) => string
}

interface MiddlewareTestingModule {
  readonly unstable_doesMiddlewareMatch: (args: {
    config: { matcher?: string }
    url: string
    nextConfig?: Record<string, unknown>
  }) => boolean
}

const metadataRoutes = requireNext(
  'next/dist/lib/metadata/is-metadata-route',
) as IsMetadataRouteModule

const metadataUrls = requireNext(
  'next/dist/lib/metadata/get-metadata-route',
) as GetMetadataRouteModule

const { unstable_doesMiddlewareMatch } = requireNext(
  'next/experimental/testing/server',
) as MiddlewareTestingModule

/* ── ① DERIVE THE CONVENTION NAMES ───────────────────────────────────────────
 * Five come from the STATIC_METADATA_IMAGES object, by value. The other three
 * (robots, manifest, sitemap — plus favicon, which appears in both places) exist
 * only as literals inside the regex list in isMetadataRouteFile, so they are
 * recovered from that function's source: every entry there is spelled
 * `[\\/]<name>`, and the four image entries interpolate `${...filename}` after
 * the same prefix, so they yield no literal and are supplied by the object.
 * See HONEST LIMIT 4 for why this is a parse and how it is guarded.
 */
const classifierSource = metadataRoutes.isMetadataRouteFile.toString()

const namesFromImages: string[] = Object.values(metadataRoutes.STATIC_METADATA_IMAGES).map(
  (image) => image.filename,
)

// `flatMap` over an optional capture rather than `!`: non-null assertions are an
// eslint error in this repo, and the empty-array branch is unreachable only
// because the group is mandatory — which is a claim tsc should not have to take
// on faith.
const namesFromRegexLiterals: string[] = [
  ...classifierSource.matchAll(/\[[\\/]+\]([a-z][a-z0-9-]*)/g),
].flatMap((match) => (typeof match[1] === 'string' ? [match[1]] : []))

const CONVENTION_NAMES: string[] = [
  ...new Set([...namesFromImages, ...namesFromRegexLiterals]),
].sort()

/** How many regex entries Next's classifier actually has — the cross-check for
 *  the parse above. One entry per convention; see HONEST LIMIT 4. */
const CLASSIFIER_REGEX_ENTRIES = (classifierSource.match(/new RegExp\(/g) ?? []).length

/* ── ② DERIVE THE EXTENSION POOL ─────────────────────────────────────────────
 * Static image extensions come from the object; txt / webmanifest / json / xml
 * exist only as quoted literals in the classifier source. This pool is only used
 * to GENERATE candidates — Next's own isMetadataPage decides which survive.
 */
const EXTENSION_POOL: string[] = [
  ...new Set([
    ...Object.values(metadataRoutes.STATIC_METADATA_IMAGES).flatMap((image) => [
      ...image.extensions,
    ]),
    ...[...classifierSource.matchAll(/'([a-z][a-z0-9]*)'/g)].flatMap((match) =>
      typeof match[1] === 'string' ? [match[1]] : [],
    ),
  ]),
]

/* ── ③ DERIVE THE SERVED URLs ────────────────────────────────────────────────
 * For each convention, propose the bare page and every extension-bearing page,
 * keep the ones Next's isMetadataPage accepts, then ask Next's own normalizers
 * what URL the build would serve them at. This is how `/robots` becomes
 * `/robots.txt` and `/icon` stays `/icon` without this file knowing either fact.
 */
function servedUrlForPage(page: string): string {
  const route = metadataUrls.normalizeMetadataPageToRoute(
    metadataUrls.normalizeMetadataRoute(page),
    false,
  )
  return route.endsWith('/route') ? route.slice(0, -'/route'.length) : route
}

const SERVED_BY_CONVENTION = new Map<string, string[]>(
  CONVENTION_NAMES.map((name) => {
    const candidates = [`/${name}`, ...EXTENSION_POOL.map((ext) => `/${name}.${ext}`)]
    const served = candidates
      .filter((page) => metadataRoutes.isMetadataPage(page))
      .map(servedUrlForPage)
    return [name, [...new Set(served)]]
  }),
)

const SERVED_URLS: string[] = [...SERVED_BY_CONVENTION.values()].flat()

/* ── ④ THE MATCHER, READ FROM middleware.ts AT TEST TIME ─────────────────────
 * Not retyped. A copy would stay green while the real matcher rotted, which is
 * the disease, not the cure. MW_MATCHER_MUTATION exists only for the red proof
 * and cannot fake a pass — HONEST LIMIT 6.
 */
const LIVE_MATCHER: unknown = process.env.MW_MATCHER_MUTATION ?? config.matcher

/** The exact matcher middleware.ts carried BEFORE W5-FIX-1 repaired it. This one
 *  string IS hardcoded, on purpose: it is frozen history, not a copy of live
 *  state, so it cannot drift. It is the mutation the guard is proved against. */
const PRE_FIX_MATCHER = '/((?!api|_next|_vercel|.*\\..*).*)'

const ORIGIN = 'https://ravid.example'

/** True when the locale middleware WOULD run for this path (i.e. the path is
 *  treated as localisable and gets redirected). Evaluated by Next's published
 *  helper, through the production matcher-compilation path. */
function isSelectedByMiddleware(matcher: string, pathname: string): boolean {
  return unstable_doesMiddlewareMatch({
    config: { matcher },
    url: `${ORIGIN}${pathname}`,
    nextConfig: {},
  })
}

/* Paths that MUST stay localisable. Not decoration: a matcher that excluded
 * everything would sail through a one-sided exclusion test. `/robots` and
 * `/sitemap` are here because the derivation in ③ proves Next never serves those
 * bare spellings — see middleware.ts HONEST LIMIT 1(c) — and `/nope` and `/fr`
 * because the ledger records them measured-green (HONEST LIMIT 1(d)). */
const MUST_STAY_LOCALISABLE = [
  '/',
  '/he',
  '/en',
  '/fr',
  '/nope',
  '/iconic',
  '/robots',
  '/sitemap',
] as const

describe('middleware matcher vs Next metadata route conventions', () => {
  it('reads the matcher from middleware.ts as a single string literal', () => {
    // Next extracts `config` by static analysis and rejects template literals
    // with expressions and identifiers — middleware.ts HONEST LIMIT 1(a). If this
    // ever stops being a plain string, the middleware does not build.
    expect(typeof config.matcher).toBe('string')
    expect(typeof LIVE_MATCHER).toBe('string')
  })

  it('DENOMINATOR: derives every convention Next declares, with none dropped', () => {
    // The parse in ① is cross-checked against Next's own entry count here, so a
    // ninth convention — or a refactor that defeats the parse — is a red count
    // rather than a quietly shorter list. HONEST LIMIT 4.
    expect(CLASSIFIER_REGEX_ENTRIES).toBeGreaterThan(0)
    expect(CONVENTION_NAMES).toHaveLength(CLASSIFIER_REGEX_ENTRIES)

    // Every convention must yield at least one served URL, or the derivation in
    // ③ silently checks nothing for it.
    const withoutServedUrl = CONVENTION_NAMES.filter(
      (name) => (SERVED_BY_CONVENTION.get(name) ?? []).length === 0,
    )
    expect(withoutServedUrl).toEqual([])
    expect(SERVED_URLS.length).toBeGreaterThanOrEqual(CONVENTION_NAMES.length)
  })

  describe('every root metadata URL Next serves is EXCLUDED from locale routing', () => {
    // Derived list, not a literal one: if Next adds a convention these cases
    // appear on their own.
    it.each(SERVED_URLS)('%s is not selected by the middleware', (servedUrl) => {
      expect(isSelectedByMiddleware(LIVE_MATCHER as string, servedUrl)).toBe(false)
    })
  })

  describe('the exclusion is not over-broad', () => {
    it.each(MUST_STAY_LOCALISABLE)('%s is still selected by the middleware', (pathname) => {
      expect(isSelectedByMiddleware(LIVE_MATCHER as string, pathname)).toBe(true)
    })
  })

  it('RED PROOF: these assertions detect the real pre-fix defect', () => {
    // The mutation witness. Runs the SAME derivation and the SAME match function
    // against the matcher middleware.ts actually shipped with, and asserts it
    // reports exactly the four extension-less image conventions as swallowed —
    // the four that were measured as 307 -> /he/... -> 404 on the built server.
    // If this file ever rots into something that cannot go red, this is the test
    // that goes red instead. middleware.ts is not touched to produce this.
    const swallowedByPreFix = SERVED_URLS.filter((servedUrl) =>
      isSelectedByMiddleware(PRE_FIX_MATCHER, servedUrl),
    ).sort()

    expect(swallowedByPreFix).toEqual([
      '/apple-icon',
      '/icon',
      '/opengraph-image',
      '/twitter-image',
    ])

    // And the same four are excluded by the matcher in the repo today.
    for (const servedUrl of swallowedByPreFix) {
      expect(isSelectedByMiddleware(config.matcher, servedUrl)).toBe(false)
    }
  })
})
