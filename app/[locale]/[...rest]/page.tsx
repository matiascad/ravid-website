// ─────────────────────────────────────────────────────────────────────────────
// W3-H 404-REACHABILITY · app/[locale]/[...rest]/page.tsx  — THE ROUTING SHIM
//
// THIS FILE CONTAINS NO COPY, NO MARKUP AND NO DESIGN, DELIBERATELY. Every
// string a visitor sees on a 404 lives in app/[locale]/not-found.tsx and in the
// catalogues it reads. This file's entire job is to make that page REACHABLE:
// it turns "a URL that matches nothing inside a locale" into a `notFound()`
// raised INSIDE the [locale] segment, which is the only condition under which
// Next will render that segment's not-found boundary. If you are editing this
// file and find yourself typing a sentence a human would read, you are in the
// wrong file.
//
// WHY IT EXISTS (measured, not assumed). app/[locale]/not-found.tsx was correct,
// compiled and bundled - and unreachable. Against the production build, BEFORE
// this file existed:
//     GET /he/nope   → 404 rendered by Next's BUILT-IN page, no <html> element
//                      at all, so no lang, no dir, English-only, and a "back
//                      home" that is not locale-aware.
//     GET /he/a/b/c  → identical.
//     GET /nope      → 307 → /he/nope → the same built-in page.
// The cause was structural: the [locale] segment had only an index route, so an
// arbitrary path never ENTERED the segment, and a not-found boundary that is
// never entered is never rendered. A catch-all is the segment's "everything
// else" arm; without it the segment was a match with no default case.
//
// INVARIANT     Inside a served locale, a URL that matches no real route is
//               handled BY THIS PROJECT'S OWN 404 COMPONENT rather than by
//               Next's built-in one. Any path under /<locale>/... that matches
//               nothing else matches THIS route, whose only act is `notFound()`;
//               that throw resolves to the nearest not-found boundary, which is
//               app/[locale]/not-found.tsx. MEASURED, not assumed: the response
//               for /he/nope carries that component's own element tree, down to
//               its locale-aware back-link resolving to href="/he". What this
//               invariant does NOT claim is the <html lang dir> shell - see
//               HONEST LIMIT 1, which is the measured reason it cannot.
//
// IMPOSSIBLE    (a) A SECOND 404 PAGE. This file renders nothing. There is no
//                   JSX here to drift from not-found.tsx, no string to fall out
//                   of sync with the catalogue, and no second "back home" href.
//                   `notFound()` returns `never`, so a `return <...>` after it is
//                   unreachable code, not an alternative rendering.
//               (b) A 404 INSIDE A LOCALE THAT NEXT'S BUILT-IN PAGE ANSWERS.
//                   Before this file, /he/nope, /en/nope and /he/a/b/c were all
//                   served by Next's default. They no longer can be: the path
//                   now matches a route, and that route's only behaviour is to
//                   raise the segment's own boundary. NOTE the deliberately
//                   narrow wording - this makes the built-in page unreachable
//                   INSIDE a locale; it does not make the locale shell present.
//               (c) SHADOWING A REAL ROUTE. In the App Router a catch-all is the
//                   LOWEST-precedence match in its segment: the index
//                   (app/[locale]/page.tsx) and any future static child
//                   (app/[locale]/story/page.tsx) both win over [...rest]. So
//                   adding sections later cannot be broken by this file - it can
//                   only stop catching what now exists.
//               (d) SWALLOWING /api OR ASSETS. A catch-all under [locale] can
//                   only match paths whose FIRST segment is a served locale.
//                   /api/anything and /robots.txt have no locale prefix and no
//                   route here to match. PROBED, not reasoned: both return the
//                   same response after this file as before it.
//               (e) WEAKENING LOCALE VALIDATION. This file performs none and
//                   bypasses none. It does not read `params`, so it cannot
//                   accept a locale the layout would reject; the layout's own
//                   `hasLocale` check runs on this route exactly as it does on
//                   the index.
//
// CLASS         DERIVATION for the [locale] segment, not this instance. The
//               guarantee is quantified over URLS, not enumerated: it is "every
//               unmatched path under a served locale", because [...rest] is by
//               definition the complement of every route that exists in the
//               segment - one segment deep or ten. It holds for routes not yet
//               written, and a future delegate cannot add a section that opts
//               out of it, because opting out would mean adding a route, and a
//               route that exists is served rather than 404'd. It is NOT a
//               derivation over the whole ORIGIN - see HONEST LIMIT 2.
//
// HONEST LIMIT  1. ⚠️ THE LOCALE SHELL IS STILL ABSENT, AND THE CAUSE IS NOT IN
//                  THIS FILE. This is the most important sentence in this header
//                  and it is a measurement, not a caveat. After this file, the
//                  initial HTML for /he/nope is:
//                      <!DOCTYPE html><html id="__next_error__"><head>...
//                  There is NO lang and NO dir on it. Our not-found component's
//                  tree is present in the RSC payload and hydrates on the client,
//                  so a visitor with JavaScript does see the localised 404 with a
//                  working /he link - but a crawler, a no-JS reader, or anything
//                  reading the server-rendered bytes sees an empty shell whose
//                  <html> declares no language and no direction.
//                  THE CAUSE: app/layout.tsx is a pass-through - it returns
//                  `children` untouched and states no <html>/<body>, because
//                  app/[locale]/layout.tsx was made the single owner of that
//                  element. That works for pages. It does NOT work at a
//                  not-found boundary, where Next needs an <html> in the
//                  server-rendered tree and, finding none, substitutes its own
//                  `__next_error__` document. The same shell is what /api/anything
//                  gets, which is the tell: this is a ROOT-layout property, not a
//                  property of this route.
//                  THE FIX IS OUT OF THIS FILE'S REACH. A catch-all cannot supply
//                  an <html> element; only a root layout can. app/layout.tsx and
//                  app/[locale]/layout.tsx are both outside this delegate's
//                  write-set, and the change is a real architectural decision
//                  (who owns <html>, and how lang/dir are known at the root where
//                  no locale is in scope) rather than a typo. It is therefore
//                  ESCALATED AND NAMED, not attempted here and not hidden.
//               2. IT DOES NOT COVER THE WHOLE ORIGIN. Ten URL shapes were
//                  probed against the production build. Six now reach this
//                  project's own 404 component; two are 200 controls; TWO STILL
//                  FALL THROUGH to Next's built-in page, named rather than
//                  rounded off:
//                      /api/anything  → built-in 404 (no route handler exists
//                                       yet). CORRECT and must not be "fixed":
//                                       /api is excluded from the middleware
//                                       matcher on purpose, and a localised
//                                       marketing page is a worse answer for an
//                                       unknown API path, not a better one.
//                      /robots.txt    → built-in 404. Middleware excludes every
//                                       path containing a dot (`.*\..*`), so it
//                                       never receives a locale prefix and never
//                                       enters this segment. W5 is expected to
//                                       add a real /robots.txt.
//                  Note the asymmetry that this file DID change: /he/robots.txt
//                  has a dot, so middleware skips it, but its first segment is a
//                  locale - so it matches [...rest] and now reaches our 404.
//               3. WHY THERE IS NO ROOT app/not-found.tsx. It was considered and
//                  rejected on architecture, not on budget, and it would NOT have
//                  fixed HONEST LIMIT 1. A root not-found renders under the same
//                  pass-through app/layout.tsx, so it would have no <html> to
//                  inherit either; it would have no locale in scope, so it could
//                  not name a lang or a dir; and it would have to carry its own
//                  copy, in a language it cannot know, when the 404 copy has
//                  exactly one home. A second, worse 404 page is not an
//                  improvement on Next's built-in one - it is the same defect
//                  with our name on it. The gap is left VISIBLE instead.
//               4. IT CANNOT DISTINGUISH "TYPO" FROM "MOVED". Every unmatched
//                  path gets the same 404. A path that USED to exist deserves a
//                  301 to its new home, and that is a redirect table in
//                  next.config.js, owned by whoever retires a URL - not something
//                  this file can infer.
//               5. THIS ROUTE IS DYNAMIC (f). It has no `generateStaticParams`,
//                  so unlike /he and /en it is rendered per request. That is
//                  correct - the set of wrong URLs is not enumerable - but it
//                  means a 404 costs a server render rather than a static hit.
// ─────────────────────────────────────────────────────────────────────────────
import { notFound } from 'next/navigation'

/**
 * The default case of the [locale] segment.
 *
 * `params` is intentionally NOT read. In Next 15 it is a Promise and would have
 * to be awaited (ledger D-3), but there is nothing here to await it FOR: the
 * locale has already been validated by app/[locale]/layout.tsx before this
 * component runs, and the path that missed is not a fact this page displays.
 * Reading it would add a second locale check with no second purpose.
 */
export default function LocaleCatchAll(): never {
  notFound()
}
