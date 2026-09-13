// ─────────────────────────────────────────────────────────────────────────────
// W5-B SEO · lib/seo.ts — THE ONE PLACE THAT KNOWS THE SITE'S IDENTITY
//
// INVARIANT     Every absolute URL this project emits — canonical, hreflang,
//               sitemap entry, sitemap reference in robots.txt, OpenGraph image —
//               is produced by a function in this file, from ONE origin resolved
//               in ONE expression (`siteOrigin()`). The locale list and the
//               fallback origin are IMPORTED from `@/config/site`; neither is
//               re-declared here. So "what is this site's address?" has exactly
//               one answer at runtime, and "which locales exist?" has exactly one
//               answer at compile time, and no consumer concatenates either.
//
// IMPOSSIBLE    (a) A consumer hand-building an origin. Nothing here exports the
//                   raw string: `siteOrigin()` is a function, and every path
//                   helper below already returns an absolute URL, so there is no
//                   reason — and no exported ingredient — for `'https://' + x`
//                   anywhere downstream.
//               (b) A canonical and an hreflang that disagree. `localeUrl()` is
//                   the single builder, and `languageAlternates()` is a total map
//                   over LOCALES built by calling it, so the self-referential
//                   alternate is the same string as the canonical BY
//                   CONSTRUCTION, not by two call sites agreeing.
//               (c) A locale missing from the alternates. The return type is
//                   keyed by `Locale` (plus `x-default`), so adding a locale to
//                   LOCALES makes an incomplete map a COMPILE error here.
//               (d) A wrong SITE_URL seed becoming a rebuild. The origin is read
//                   from the env var NAMED below first; the constant is the
//                   fallback. A wrong seed is a deploy-time override (ledger
//                   D-14) — set one variable, no code change.
//               (e) A silently-wrong origin from a malformed env var. A value
//                   that is not an absolute http(s) URL THROWS, naming the
//                   variable (never its value). It cannot degrade into a
//                   relative canonical or a half-parsed host.
//               (f) A relative URL escaping into metadata. Every exported
//                   builder returns `new URL(...).toString()` against an
//                   absolute origin; there is no code path that returns a bare
//                   path.
//
// CLASS         Closed by derivation for URL CONSTRUCTION across the whole site:
//               sitemap, robots, the OG route and the locale layout have no other
//               way to name the site, because none of them imports SITE_URL and
//               none of them knows the origin's shape. It is only THIS INSTANCE
//               for URL CORRECTNESS — see the limit.
//
// HONEST LIMIT  1. This file guarantees ONE origin, not the RIGHT origin.
//                  `SITE_URL` is the one seeded constant with ZERO evidence in
//                  either repo (config/site.ts, OPEN 5): its only source is
//                  Mati's plan. Everything here faithfully propagates whatever
//                  that value is. The env var is the escape hatch, not a check.
//               2. NO BASE PATH SUPPORT. `new URL(...).origin` discards any path
//                  in the configured value, so deploying under `example.com/sub`
//                  would silently drop `/sub`. That is correct today — measured:
//                  next.config.js declares no `basePath` — and would need a
//                  deliberate change here if that ever stops being true.
//               3. `LOCALIZED_ROUTES` below is a MEASURED list, not a derived
//                  one. Next exposes no runtime enumeration of the App Router
//                  tree, so a new `app/[locale]/lectures/page.tsx` will NOT
//                  appear in the sitemap until this list gains a line. The
//                  locale dimension is derived and cannot drift; the route
//                  dimension is hand-held and can. Stated, not hidden.
//               4. `metadataCopy()` composes; it does not author. It joins two
//                  catalogue strings with a space, exactly as Hero.tsx renders
//                  them as two blocks of one sentence. If the catalogue changes,
//                  the share preview changes with it — that is the point — but
//                  nothing here can tell you the result reads well in either
//                  language.
//               5. Nothing here is proved over HTTP. These are pure functions
//                  with unit tests; whether Google or Facebook actually fetches
//                  the resulting URLs is NOT-MEASURED by this delegate.
// ─────────────────────────────────────────────────────────────────────────────

import { DEFAULT_LOCALE, LOCALES, SITE_URL, type Locale } from '@/config/site';
import type { Messages } from '@/i18n/messages';

/* ── The origin ───────────────────────────────────────────────────────────── */

/**
 * The NAME of the environment variable that overrides the configured origin.
 * A name, never a value — this module reads `process.env` but exports nothing
 * from it except an already-validated origin.
 *
 * It must be `NEXT_PUBLIC_`-prefixed: `generateMetadata` runs on the server, but
 * the same helpers are importable from a client component, and an unprefixed
 * variable would be `undefined` there — i.e. a DIFFERENT origin on the client
 * than on the server, which is precisely the drift this file exists to prevent.
 */
export const SITE_URL_ENV_VAR = 'NEXT_PUBLIC_SITE_URL' as const;

/**
 * Parse one candidate into a bare origin, or throw naming where it came from.
 * `where` is an env var NAME or the constant's name — never a value, so a
 * misconfigured deploy produces a diagnosable error without echoing input.
 */
function toOrigin(candidate: string, where: string): string {
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(
      `${where} is not an absolute URL. Expected something like https://example.com (scheme required).`,
    );
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`${where} must use the http or https scheme.`);
  }
  return parsed.origin;
}

/**
 * THE canonical origin, with no trailing slash. Env FIRST (ledger D-14), the
 * `@/config/site` constant as the fallback.
 *
 * Read at CALL time, not at module load, so the branch is observable: a test can
 * stub the variable and see both halves, and a platform that injects env after
 * import still gets the override. An empty or whitespace-only value counts as
 * unset — an env var set to `""` by a deploy UI is an accident, not an intent to
 * configure an empty origin.
 */
export function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return toOrigin(fromEnv.trim(), SITE_URL_ENV_VAR);
  }
  return toOrigin(SITE_URL, 'SITE_URL in config/site.ts');
}

/** Build an absolute URL for a root-relative path. The ONLY way to do so. */
export function absoluteUrl(path: string): string {
  return new URL(path, `${siteOrigin()}/`).toString();
}

/* ── The routes ───────────────────────────────────────────────────────────── */

/**
 * Every localised route that ACTUALLY EXISTS under `app/[locale]/`, measured on
 * 2026-09-12: `app/[locale]/page.tsx` is the only page. Deliberately excluded:
 * `app/[locale]/[...rest]/page.tsx` and `app/[locale]/not-found.tsx`, which
 * render 404s — listing a 404 in a sitemap is a crawl error, not coverage.
 *
 * See HONEST LIMIT 3: this is the one hand-held dimension in this file.
 */
export const LOCALIZED_ROUTES = ['/'] as const;

export type LocalizedRoute = (typeof LOCALIZED_ROUTES)[number];

/**
 * The locale-prefixed PATH for a route. `routing.localePrefix` is `'always'`
 * (i18n/routing.ts), so EVERY locale is prefixed, including the default one —
 * there is no unprefixed variant of any page to disagree with these.
 */
export function localePath(locale: Locale, route: LocalizedRoute = '/'): string {
  return route === '/' ? `/${locale}` : `/${locale}${route}`;
}

/** The absolute, canonical URL for one locale's copy of one route. */
export function localeUrl(locale: Locale, route: LocalizedRoute = '/'): string {
  return absoluteUrl(localePath(locale, route));
}

/* ── hreflang ─────────────────────────────────────────────────────────────── */

/**
 * `x-default` — the URL a crawler should use when it has no better locale match.
 * Not a locale: kept out of the `Locale` union on purpose, so the total map
 * below stays total over real locales.
 */
const X_DEFAULT = 'x-default' as const;

/**
 * Every locale's copy of one route, plus `x-default` pointing at the default
 * locale. Typed as a TOTAL map over `Locale`, so a new locale that is not
 * covered is a compile error, not a missing hreflang discovered in Search
 * Console months later.
 *
 * Used identically by the sitemap (xhtml:link alternates) and by the page
 * metadata (<link rel="alternate" hreflang>), so those two can never disagree.
 */
export function languageAlternates(
  route: LocalizedRoute = '/',
): Record<Locale, string> & Record<typeof X_DEFAULT, string> {
  const byLocale = Object.fromEntries(
    LOCALES.map((locale) => [locale, localeUrl(locale, route)]),
  ) as Record<Locale, string>;

  return {
    ...byLocale,
    // DERIVED from the same builder, from config/site.ts's DEFAULT_LOCALE —
    // never a second copy of either the default locale or the default URL.
    [X_DEFAULT]: localeUrl(DEFAULT_LOCALE, route),
  };
}

/* ── Fixed routes this project serves ─────────────────────────────────────── */

/**
 * Next's metadata file conventions. `app/sitemap.ts` is served at
 * `/sitemap.xml`; a ROOT-level `app/opengraph-image.tsx` is served at
 * `/opengraph-image` with no hash suffix (verified in
 * next/dist/lib/metadata/get-metadata-route.js: `/opengraph-image ->
 * /opengraph-image`; only nested/grouped variants gain a 6-char suffix).
 */
export const SITEMAP_PATH = '/sitemap.xml' as const;
export const OG_IMAGE_PATH = '/opengraph-image' as const;

/**
 * THE OpenGraph image dimensions, in one place. `app/opengraph-image.tsx`
 * RE-EXPORTS this as its `size` (Next's metadata-file contract) and the locale
 * layout declares the same numbers in its `og:image:width`/`height` tags. Two
 * consumers, one definition — the classic drift here is a card resized in the
 * route while the meta tags keep advertising the old dimensions.
 */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** The absolute sitemap URL. robots.txt must point here and nowhere else. */
export function sitemapUrl(): string {
  return absoluteUrl(SITEMAP_PATH);
}

/**
 * The absolute URL of OUR OWN OpenGraph image. There is no third-party CDN in
 * this project and no remote image host is configured (next.config.js sets no
 * `domains`/`remotePatterns`), so this is the only share image that can resolve.
 */
export function ogImageUrl(): string {
  return absoluteUrl(OG_IMAGE_PATH);
}

/* ── Metadata copy ────────────────────────────────────────────────────────── */

/** The only catalogue keys metadata reads. Type-only: erased at compile time. */
type MetadataSource = Pick<Messages, 'heroTitle' | 'heroSubtitle' | 'heroSubtitle2'>;

export interface MetadataCopy {
  readonly title: string;
  readonly description: string;
}

/**
 * COMPOSE the share/search copy from the catalogue. It AUTHORS NOTHING.
 *
 * This is the fix for the old repo's defect, where app/layout.tsx held a second,
 * hand-typed copy of the hero words in `metadata` that could drift from the page
 * itself. Here the title IS the page's <h1> (Hero.tsx:240 renders `heroTitle`)
 * and the description IS the page's lede (Hero.tsx:244-245 renders
 * `heroSubtitle` then `heroSubtitle2` as two blocks of one sentence). One fact,
 * two views, no second copy — change the catalogue and both move together.
 *
 * Pure, and takes the messages rather than importing them, so nothing that only
 * needs a URL (sitemap, robots) drags the catalogue into its bundle.
 */
export function metadataCopy(messages: MetadataSource): MetadataCopy {
  return {
    title: messages.heroTitle,
    description: `${messages.heroSubtitle} ${messages.heroSubtitle2}`,
  };
}
