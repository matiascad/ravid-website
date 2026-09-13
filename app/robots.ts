// ─────────────────────────────────────────────────────────────────────────────
// W5-B SEO · app/robots.ts — THE CRAWL POLICY
//
// INVARIANT     Exactly one robots policy exists for this site, it is generated
//               from code, and it carries the customer's MEASURED intent
//               (REPORT_W1 §6-K): a blanket allow plus four crawlers named
//               explicitly — Googlebot, Bingbot, Twitterbot, facebookexternalhit.
//               Its `sitemap` line is built by `@/lib/seo`, so the address a
//               crawler is sent to is the same string the sitemap serves itself
//               under, from the same origin as every canonical tag.
//
// IMPOSSIBLE    (a) TWO ROBOTS POLICIES. A static `public/robots.txt` would
//                   shadow this route silently — Next serves the static file and
//                   never invokes this function, with no warning. MEASURED on
//                   2026-09-12: `public/` contains `favicon.ico` and `images/`
//                   and NO `robots.txt`, so there is nothing to shadow it today.
//                   That is a measurement, not a guarantee: see HONEST LIMIT 1.
//               (b) A sitemap reference that drifts from the sitemap. This file
//                   cannot write a URL — `sitemapUrl()` is its only source, and
//                   `SITEMAP_PATH` lives once, in lib/seo.ts.
//               (c) Losing the two social crawlers in a "tidy-up". They are in a
//                   named, commented tuple with the reason attached, and a test
//                   asserts all four independently, so deleting one goes RED.
//
// CLASS         THIS INSTANCE. It states one site's policy. It installs no rule
//               that future paths are considered, and it cannot detect a static
//               robots.txt appearing later — that is the W7 gate's job.
//
// HONEST LIMIT  1. Absence of `public/robots.txt` is measured NOW, not enforced.
//                  If any delegate later adds one, this file goes dead silently
//                  and nothing here will say so. The only detector is a
//                  repo-level check that both do not exist at once.
//               2. NO `Disallow` IS INVENTED. The customer's measured intent is
//                  allow-everything plus the four named agents, and nothing is
//                  added to it — not even for the `/api/lead` route another
//                  delegate is landing. Whether that endpoint SHOULD be excluded
//                  is a product decision this delegate did not make, and a
//                  Disallow invented here would be a second, unmeasured policy.
//               3. robots.txt is ADVISORY. It asks well-behaved crawlers; it
//                  secures nothing and blocks no one.
//               4. The generated text is NOT-MEASURED: Next serialises
//                  `MetadataRoute.Robots` at build time, and this delegate is
//                  forbidden to build. What is measured is the object.
// ─────────────────────────────────────────────────────────────────────────────

import type { MetadataRoute } from 'next';

import { sitemapUrl } from '@/lib/seo';

/**
 * The four user agents the customer's own `public/robots.txt` named explicitly
 * (REPORT_W1 §6-K). Carried across deliberately rather than reduced to the
 * blanket `*` rule that technically subsumes them:
 *
 *   Googlebot, Bingbot          — search indexing.
 *   Twitterbot, facebookexternalhit — SHARE PREVIEW FETCHERS. This is a memorial
 *     page posted into bereavement groups; a preview that fails to render is a
 *     real loss, and an explicit allow is how the customer said so.
 *
 * An explicit group also survives a future blanket tightening: if `*` ever gains
 * a Disallow, these four keep their access instead of losing it by accident.
 */
const EXPLICITLY_ALLOWED_CRAWLERS = [
  'Googlebot',
  'Bingbot',
  'Twitterbot',
  'facebookexternalhit',
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...EXPLICITLY_ALLOWED_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: sitemapUrl(),
  };
}
