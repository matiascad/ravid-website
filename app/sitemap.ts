// ─────────────────────────────────────────────────────────────────────────────
// W5-B SEO · app/sitemap.ts — THE CRAWL MANIFEST
//
// INVARIANT     One entry per (locale × existing route), and the locale
//               dimension is DERIVED: this file iterates `LOCALES` from
//               `@/config/site` and `LOCALIZED_ROUTES` from `@/lib/seo`. It types
//               out no locale, no route string and no origin. Adding a locale to
//               config/site.ts changes the sitemap's size without this file being
//               opened.
//
// IMPOSSIBLE    (a) A sitemap that lists some locales and not others. The entries
//                   are a `.flatMap` over the locale tuple itself; there is no
//                   place to omit one and no second list to fall out of step with.
//               (b) A relative or wrong-origin URL. Every `url` comes from
//                   `localeUrl()`, which returns `new URL(...).toString()` against
//                   the single resolved origin. This file cannot concatenate one.
//               (c) A sitemap whose alternates disagree with the page's own
//                   hreflang tags. Both call `languageAlternates()` — the same
//                   function, not two implementations of one idea.
//               (d) A 404 advertised as a page. `LOCALIZED_ROUTES` is documented
//                   to exclude `[...rest]` and `not-found`, and this file has no
//                   other source of routes.
//
// CLASS         THIS INSTANCE for the route dimension — it enumerates today's one
//               page. By DERIVATION for the locale dimension, permanently: the
//               product is computed, so no future locale can be forgotten here.
//
// HONEST LIMIT  1. `lastModified` is DELIBERATELY ABSENT. The honest value is the
//                  content's real change date, which this project does not track;
//                  `new Date()` would tell every crawler the page changed on the
//                  day it was fetched — a fabricated fact, and a memorial page is
//                  the last place to fabricate one. `changeFrequency` and
//                  `priority` are absent for the related reason: both would be
//                  guesses, and Google has stated it ignores them.
//               2. This proves nothing about whether the listed URLs RESOLVE. A
//                  route deleted from `app/[locale]/` while `LOCALIZED_ROUTES`
//                  still names it yields a 404 in the sitemap, and only an HTTP
//                  check would catch that. NOT-MEASURED by this delegate.
//               3. `MetadataRoute.Sitemap` is serialised by Next, not here; the
//                  actual XML is NOT-MEASURED without a build, which this
//                  delegate is forbidden to run.
// ─────────────────────────────────────────────────────────────────────────────

import type { MetadataRoute } from 'next';

import { LOCALES } from '@/config/site';
import { LOCALIZED_ROUTES, languageAlternates, localeUrl } from '@/lib/seo';

/**
 * DENOMINATOR: LOCALES.length × LOCALIZED_ROUTES.length entries — today 2 × 1.
 * Both factors are imported; neither is restated here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALIZED_ROUTES.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: localeUrl(locale, route),
      alternates: { languages: languageAlternates(route) },
    })),
  );
}
