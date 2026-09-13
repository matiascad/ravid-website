// ─────────────────────────────────────────────────────────────────────────────
// W12-A FINDABILITY · lib/seo/jsonld.ts — THE SWORN STATEMENT
//
// INVARIANT     Every field this module emits is a RESTATEMENT of a fact that
//               already has exactly one home elsewhere in this repository, and
//               the graph's SHAPE is a closed tuple type. There is no field
//               whose value originates here: URLs come from `@/lib/seo`, the
//               locale set from `@/config/site`, and the two strings from
//               `metadataCopy()` — which itself only joins catalogue keys. This
//               file AUTHORS NOTHING. It is a projection, not a source.
//
// IMPOSSIBLE    (a) A `Review`, `AggregateRating` or `Offer` reaching the page.
//                   Not "none is written today" — the graph type is the closed
//                   tuple `readonly [WebSiteNode, WebPageNode]` and both node
//                   types are exhaustive interfaces, so there is no property to
//                   assign one to and no array slot to push one into. Adding one
//                   is a COMPILE error before it is a test failure. This is the
//                   whole reason the type is a tuple rather than `JsonLdNode[]`.
//               (b) A `</script>` breakout. `serialiseJsonLd()` is the ONLY
//                   exported way to turn the graph into text, and it rewrites
//                   EVERY `<` into its six-character JSON escape (backslash, u,
//                   0, 0, 3, c — deliberately SPELLED OUT rather than typed:
//                   ledger D-82, and MEASURED AGAIN in this very file, where an
//                   editor silently unescaped that sequence back into a literal
//                   `<` in this comment, turning the sentence into nonsense. The
//                   `.replace()` call in `serialiseJsonLd()` below survived only
//                   because it is written as a DOUBLED backslash inside a string
//                   literal. An escape sequence in PROSE is not safe in this
//                   repository — and a line NUMBER here would be the same
//                   mistake in another form, so this points at the function.)
//                   `<` cannot occur in JSON's structural
//                   syntax — only inside string values — so a global replace is
//                   both safe and total. Escaping `<` closes `</script`, `<!--`
//                   and `<script` simultaneously: all three of the HTML
//                   tokeniser's script-data escape paths begin with that one
//                   character, so removing it removes the whole class.
//               (c) A hand-built origin. Nothing here concatenates `https://`;
//                   `absoluteUrl()` and `ogImageUrl()` are the only URL sources,
//                   exactly as for the canonical, the sitemap and robots.txt.
//               (d) A graph whose `@id` disagrees with the page's canonical.
//                   `localeUrl(locale)` produces both — the same call, not two
//                   call sites that happen to agree.
//
// CLASS         Closed by derivation for FABRICATION OF A RATED REVIEW: the type
//               makes the whole family unconstructible, for every future caller,
//               not merely absent today. THIS INSTANCE for the graph's content:
//               it states what this one site knows, and a richer graph later is
//               a deliberate edit here.
//
// ── WHAT IS DELIBERATELY NOT HERE, AND WHY ──────────────────────────────────
//
// `Person` IS OMITTED ENTIRELY — and this is a MEASUREMENT, not caution.
// `Person` without `name` is worthless, and THIS REPOSITORY HAS NO CITABLE NAME:
//   · content/speaker.ts:369-388 — `SpeakerContentSource` models bio,
//     credentials, audiences, venues, video and pressMentions. It models NO name
//     field at all. There is no key to read.
//   · content/speaker.ts:389 — `SPEAKER_CONTENT` is `{}`. Every field that DOES
//     exist is unset, so there is no bio, credential, venue or press mention to
//     attach to a Person even if one could be named.
//   · The speaker's name occurs in the catalogues ONLY inside the `copyright`
//     sentence (messages/en.json `copyright`, messages/he.json `copyright`).
//     Recovering it would mean regex-extracting a proper noun out of a localised
//     sentence — that is AUTHORING a fact, and it breaks the moment either
//     catalogue is reworded. It is not a citable single source.
//   · config/site.ts:49-50 states that file holds NO memorial facts by design.
// So `alumniOf`, `worksFor`, `award`, `memberOf`, `jobTitle`, `sameAs` and any
// venue are not "fields we left blank" — their subject cannot be named. A thin
// Person was the expectation; NO Person is what the repository actually
// supports. Restoring one is a one-edit item once a name gains a single home:
// §OPEN — one-edit item: content/speaker.ts:389.
//
// `Review` / `AggregateRating` / `Offer` ARE OMITTED ENTIRELY. Measured state of
// `messages/{he,en}.json` `testimonials` (3 entries, both locales):
//   · All three DO carry a `name` — so the common shortcut "they are anonymous,
//     therefore omit" is FALSE here, and is not the reason.
//   · `testimonials[0].sub` is `""` in BOTH locales (1 of the 5 blank strings
//     per catalogue; 10 across the two).
//   · THE REASON IS SIMPLER AND ABSOLUTE: there is NO RATING ANYWHERE IN EITHER
//     REPOSITORY. Not a star, not a score, not a count of raters. Google's
//     review snippet requires `reviewRating`, so emitting `Review` means minting
//     a number that does not exist, and `AggregateRating` means minting two.
//     `reviewCount: 3` is not a measurement of opinion — it is a count of rows
//     in a marketing catalogue, and publishing it as a rating is a false
//     statement made in a dead soldier's name.
//   · Independently disqualifying: these are self-serving testimonials about the
//     page's own subject, collected and published by the subject's own site.
// There are no prices and no bookable products in this repository, so `Offer`
// has no subject either.
//
// `potentialAction`/`SearchAction` is omitted: this site has no search. `sameAs`
// is omitted: the Instagram handle in config/site.ts:78 is still OPEN 1, and
// `sameAs` is an identity claim about a PERSON this graph does not name.
//
// HONEST LIMIT  1. ⚠️ GOOGLE HAS NOT SEEN THIS. Whether the Rich Results Test or
//                  the Schema.org validator ACCEPTS this markup is NOT-MEASURED:
//                  this delegate cannot reach either service. What IS measured is
//                  that the emitted text parses as JSON, that the parsed object
//                  carries exactly the fields below, and that it cannot escape
//                  its script element. Acceptance is a different claim, owned by
//                  a human with a browser and Search Console.
//               2. This module proves shape and provenance, NOT truth. It
//                  guarantees every field traces to one home; it cannot tell you
//                  the catalogue sentence that home contains is accurate.
//               3. `WebSite.url` is the site ROOT, which MEASURED on 2026-09-13
//                  answers 307 → `/he` (localePrefix `'always'`; the redirect is
//                  middleware.ts's, by design). That is the intended i18n shape
//                  and Google follows it, but it is a redirect, stated plainly.
//               4. NO BASE PATH. Inherited from `absoluteUrl()` — see lib/seo.ts
//                  HONEST LIMIT 2. Unchanged and unhidden, not re-solved here.
//               5. FILE/DIRECTORY ADJACENCY: `lib/seo.ts` and `lib/seo/` now
//                  coexist. TypeScript resolves `@/lib/seo` to the FILE (an
//                  extension match precedes a directory's index), so the import
//                  below is deterministic — but it is a footgun for a human
//                  reader. Folding `lib/seo.ts` into `lib/seo/index.ts` would be
//                  the tidier shape; it would also rewrite imports in
//                  app/robots.ts and app/opengraph-image.tsx, both OUTSIDE this
//                  delegate's write-set, so it is not attempted here rather than
//                  attempted halfway. The resolution is PROVED by a test, not
//                  assumed. §OPEN — one-edit item: lib/seo.ts:1.
// ─────────────────────────────────────────────────────────────────────────────

import { LOCALES, type Locale } from '@/config/site'
import { type MetadataCopy, absoluteUrl, localeUrl, ogImageUrl } from '@/lib/seo'

/* ── The script element's contract ────────────────────────────────────────── */

/**
 * The `type` attribute a JSON-LD block must carry. Exported so the one mount
 * site cannot type a near-miss like `application/json+ld` — which browsers and
 * crawlers both ignore in silence, the exact `bg-gold` failure mode (Law 8).
 */
export const JSON_LD_SCRIPT_TYPE = 'application/ld+json' as const

/** The only `@context` schema.org recognises. One definition, no call-site copy. */
export const SCHEMA_CONTEXT = 'https://schema.org' as const

/**
 * The fragment that names the site node so the page node can point AT it rather
 * than restate it. A fragment on our own origin, never an invented identifier.
 */
const WEBSITE_NODE_FRAGMENT = '/#website' as const

/* ── The graph's shape — exhaustive ON PURPOSE ────────────────────────────── */

/**
 * The site node. `name` is ABSENT deliberately: the only site-wide string this
 * project owns is the page's HEADLINE (`heroTitle`), and asserting a headline as
 * the site's NAME is a small invention. An anchor node with a stable `@id`, a
 * real `url` and a true language list is honest and useful; a named one is not.
 */
interface WebSiteNode {
  readonly '@type': 'WebSite'
  readonly '@id': string
  readonly url: string
  /** DERIVED from LOCALES (config/site.ts:107) — never a second locale list. */
  readonly inLanguage: readonly Locale[]
}

/**
 * The page node. Every field is required, so a future edit cannot quietly drop
 * one, and there is no index signature — so a future edit cannot quietly ADD
 * one either. That closed-ness is what makes `aggregateRating` unassignable.
 */
interface WebPageNode {
  readonly '@type': 'WebPage'
  readonly '@id': string
  readonly url: string
  readonly name: string
  readonly description: string
  readonly inLanguage: Locale
  readonly isPartOf: { readonly '@id': string }
  readonly primaryImageOfPage: string
}

/**
 * THE graph. A fixed-length TUPLE, not an array: there is no `push`, no spread
 * target and no third slot, so the set of node types this site can ever claim is
 * fixed at the type level. Widening it is a visible, deliberate edit to this
 * line — which is precisely the review moment a fabricated `Review` must hit.
 */
export interface JsonLdGraph {
  readonly '@context': typeof SCHEMA_CONTEXT
  readonly '@graph': readonly [WebSiteNode, WebPageNode]
}

/* ── Building ─────────────────────────────────────────────────────────────── */

/**
 * Project one locale's page into the graph.
 *
 * Takes `MetadataCopy` rather than the catalogue, for the same reason
 * `metadataCopy()` takes messages rather than importing them (lib/seo.ts:248):
 * the copy this graph states MUST be the identical object the `<title>` and the
 * OpenGraph card state, and the only way to guarantee that is to be handed it.
 * Deriving it a second time here would be a second fact wearing the first's name.
 */
export function buildJsonLd(locale: Locale, copy: MetadataCopy): JsonLdGraph {
  const canonical = localeUrl(locale)
  const websiteId = absoluteUrl(WEBSITE_NODE_FRAGMENT)

  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: absoluteUrl('/'),
        inLanguage: LOCALES,
      },
      {
        '@type': 'WebPage',
        // The SAME string the canonical link and the OG url carry — one call.
        '@id': canonical,
        url: canonical,
        name: copy.title,
        description: copy.description,
        inLanguage: locale,
        isPartOf: { '@id': websiteId },
        primaryImageOfPage: ogImageUrl(),
      },
    ],
  }
}

/* ── Serialising ──────────────────────────────────────────────────────────── */

/**
 * THE only way to turn the graph into script-element text.
 *
 * `JSON.stringify` alone is NOT SAFE inside `<script>`: a catalogue string
 * containing `</script>` would close the element and everything after it would
 * be parsed as HTML — a content editor typing an angle bracket becomes a markup
 * injection. Escaping `<` to its `<` JSON escape is exact: the two strings
 * are the SAME JSON value (a parser resolves the escape), so the emitted text
 * still parses to a byte-equal object, while the HTML tokeniser can no longer
 * find a `<` to start a tag with.
 *
 * `>` and `&` are deliberately NOT escaped: script data is raw text, so neither
 * can begin a token there. Escaping only the character that matters keeps the
 * guarantee legible instead of burying it in superstition.
 */
export function serialiseJsonLd(graph: JsonLdGraph): string {
  return JSON.stringify(graph).replace(/</g, '\\u003c')
}

/**
 * The one call a render site makes: locale plus already-computed copy in,
 * script-safe text out. Nothing else in this project may serialise a graph.
 */
export function jsonLdFor(locale: Locale, copy: MetadataCopy): string {
  return serialiseJsonLd(buildJsonLd(locale, copy))
}
