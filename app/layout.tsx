// ─────────────────────────────────────────────────────────────────────────────
// W3-A I18N-ROUTING · app/layout.tsx  — ROOT PASS-THROUGH
// (rewrites W2-A2a's shell, whose own HONEST LIMIT said `lang="he" dir="rtl"`
//  were "HARDCODED PLACEHOLDERS, NOT A DECISION" and named this delegate as the
//  one to move them onto the localised layout. They are moved.)
//
// INVARIANT     The document shell is still stated exactly once - it has simply
//               moved one level down, to app/[locale]/layout.tsx, the first
//               place in the tree that KNOWS the locale. This file therefore
//               states nothing at all: no <html>, no <body>, no font, no
//               stylesheet, and no metadata EXCEPT ONE - see the W5-FIX-3 block
//               below, which adds `metadataBase` and only `metadataBase`,
//               because that one fact is a property of the SITE and not of a
//               locale, and so cannot live one level down. It exists because
//               Next.js requires a root layout to exist, and it returns its
//               children untouched.
//
// IMPOSSIBLE    (a) A SECOND <html>/<body> pair. There is exactly one in the
//                   project and it is the localised one; this file cannot
//                   contribute a competing shell because it contributes no
//                   markup whatsoever.
//               (b) An <html> element that does not know its locale. Since the
//                   only shell in the project is inside the [locale] segment, a
//                   shell without a locale in scope cannot be CONSTRUCTED - which
//                   is precisely the customer's defect H, where index.html was
//                   permanently `lang="he" dir="rtl"` and English rendered inside
//                   an RTL document root. There is no file left that could host
//                   a hardcoded direction.
//               (c) Copy in the shell. No metadata block, no children of its own,
//                   nothing for a hero sentence to be pasted into.
//
// CLASS         THIS INSTANCE, honestly. It removes the second shell; it does not
//               install a rule that forbids one. Nothing in the toolchain stops a
//               later delegate from re-adding <html> here - only the fact that
//               there is nothing left for it to do, and review.
//
// HONEST LIMIT  1. A pass-through root layout is legal only because a descendant
//                  provides <html>/<body>. If app/[locale]/layout.tsx ever loses
//                  them, React renders an invalid document and the failure shows
//                  up at request time, not here.
//               2. Returning `children` bare means this file has no place to put
//                  anything that must wrap EVERY route including non-localised
//                  ones. Nothing needs that today.
//               3. next/font and './globals.css' have MOVED to the localised
//                  layout, because the `--font-heebo` class must sit on the
//                  element that carries lang/dir - and that element is no longer
//                  here. The `--font-heebo` name remains a contract with
//                  tailwind.config.ts; renaming it still breaks both font
//                  families silently, in the new location.
// ─────────────────────────────────────────────────────────────────────────────
// W5-FIX-3 METADATA BASE · the one metadata fact that belongs at the ROOT
//
// THE DEFECT, measured: `npm run build` emitted exactly one warning -
//   "metadataBase property in metadata export is not set for resolving social
//    open graph or twitter images, using http://localhost:3000"
// printed at `Generating static pages (0/9)`, the FIRST page. The obvious
// suspect was already correct: app/[locale]/layout.tsx has set
// `metadataBase: new URL(siteOrigin())` since W5-B. The warning is emitted PER
// ROUTE, when Next merges the auto-detected ROOT file convention
// `app/opengraph-image.tsx` into a route's metadata and that route's own
// accumulated `metadataBase` is still undefined (mergeStaticMetadata, in
// next/dist/lib/metadata/resolvers/resolve-opengraph.js). The routes that were
// hit are the ones that never enter the [locale] segment - `/_not-found` above
// all, which resolves through THIS file plus app/not-found.tsx, and neither of
// them declared any metadata at all. A root-level OG image with no root-level
// base is the whole bug.
//
// INVARIANT     `metadataBase` is stated exactly ONCE for the site, at the ONE
//               node every route in the project passes through, and its VALUE is
//               not stated here: it is `siteOrigin()` from lib/seo.ts, which is
//               the only place in the project that knows the origin. This file
//               contributes `metadataBase` and nothing else - no title, no
//               description, no image, no markup, no shell.
//
// IMPOSSIBLE    (a) A route resolving a relative social image against
//                   `http://localhost:3000`. This is the ROOT layout; there is
//                   no route in the app that can be reached without passing
//                   through it, so no route can accumulate an undefined base.
//                   Before this block, `/_not-found` could - and did.
//               (b) A hardcoded origin. Nothing here spells one: `siteOrigin()`
//                   is a function call, this file imports no raw constant, and
//                   lib/seo.ts exports no raw string to concatenate.
//               (c) A base that disagrees with the canonical URLs. The base, the
//                   canonicals, the hreflang set, the sitemap and the OG image
//                   URL are all `siteOrigin()` reached through one helper each -
//                   one expression, many views, never two call sites agreeing.
//               (d) A second document shell. The component below still returns
//                   `children` bare; W3-A's three IMPOSSIBLEs above are untouched
//                   by this block, which adds an export, not markup.
//
// CLASS         Closed by derivation for COVERAGE: because the declaration sits
//               at the root, the set of routes it reaches is the set of all
//               routes, by construction rather than by enumeration - a route
//               added tomorrow inherits it without anyone remembering to. It is
//               only THIS INSTANCE for VALUE correctness; see limit 1.
//
// HONEST LIMIT  1. This guarantees that a base EXISTS and is ONE value. It does
//                  not guarantee it is the RIGHT one - lib/seo.ts's own HONEST
//                  LIMIT 1 stands unchanged: `SITE_URL` in config/site.ts is the
//                  one seeded constant with zero evidence in either repo, and
//                  `NEXT_PUBLIC_SITE_URL` is the deploy-time override (ledger
//                  D-14), not a check.
//               2. THIS MAKES app/[locale]/layout.tsx's OWN `metadataBase`
//                  REDUNDANT, AND IT IS DELIBERATELY LEFT IN PLACE. Next merges
//                  metadata down the tree, so the locale layout now overrides an
//                  inherited value with one built from the SAME helper - the
//                  same string, so redundant rather than conflicting. Removing
//                  it is a ruling about another delegate's verified work, not
//                  this delegate's call. Stated, not silently acted on.
//               3. This states a base; it says nothing about whether every route
//                  that now resolves one SHOULD carry the site's OG card. The
//                  root `app/opengraph-image.tsx` attaches itself to every
//                  root-resolved route including the 404; this change makes that
//                  attachment resolve to an absolute URL, it does not decide
//                  whether the attachment is wanted.
//               4. NOT-MEASURED OVER HTTP. The evidence for this block is the
//                  build's warning count before and after, plus tsc, lint and
//                  the unit suite. No served 404's `og:image` bytes were read by
//                  this delegate, and see app/not-found.tsx's HONEST LIMIT 2 for
//                  why a 404's first bytes are not what one would assume.
// ─────────────────────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { siteOrigin } from '@/lib/seo'

/**
 * The SITE's metadata base, and nothing else.
 *
 * A function rather than `export const metadata`, on purpose: `siteOrigin()` is
 * documented in lib/seo.ts as reading `process.env` at CALL time, not at module
 * load, so that a platform injecting the variable after import still gets the
 * override. A module-scope const would evaluate it at import and quietly throw
 * that property away. `metadataBase` is typed as a `URL` instance, not a string.
 */
export function generateMetadata(): Metadata {
  return { metadataBase: new URL(siteOrigin()) }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
