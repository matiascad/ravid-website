// ─────────────────────────────────────────────────────────────────────────────
// W4-06 · components/sections/WhatYouGet.tsx — THE "WHAT YOU GET" SECTION
//
// Two lists over one backdrop: what the lecture CONTAINS (`whatContent`, each
// entry an icon + title + desc) and who it is FOR (`whatAudience`, each entry a
// title + desc). Both lists are prose owned by messages/*.json. This file renders
// them; it does not author, order, abbreviate, translate or count them.
//
// INVARIANT   Every character this component renders is a whole, unmodified value
//             read from the `m` prop, whose type is `Pick<Messages, ...>` —
//             inferred from the zod schema in i18n/messages.ts, never re-declared
//             here. There is no string literal of prose in this file: the only
//             literals are one image path, one `sizes` descriptor and two DOM ids,
//             each written exactly once and referenced by name thereafter. In
//             particular the three EMOJI are catalogue values rendered from
//             `item.icon` — this file does not know which emoji they are and
//             cannot be the second home of one.
//
// IMPOSSIBLE  A LIST WHOSE LENGTH IS A NUMBER WRITTEN HERE, AND AN ENTRY THAT
//             REACHES THE DOM WITH ITS `title` BUT NOT ITS `desc`. Both lists are
//             produced by `.map()` over the catalogue array, so the rendered count
//             IS the data's length: there is no `[0]`/`[1]`/`[2]`, no literal 3
//             and no literal 4 anywhere in the file, and consequently nothing to
//             fall out of step when an entry is added or removed. Within one
//             entry, `icon`, `title` and `desc` are emitted by a single expression
//             over a single binding, so dropping one is an EDIT to this file —
//             visible as a diff and RED in the test — not a data shape that
//             renders blank. Because nothing is indexed, `noUncheckedIndexedAccess`
//             has no `T | undefined` to produce here, so there is no `!` and no
//             cast in the file and none is needed.
//
// CLASS       DERIVATION, not instance: "the data states the count; the component
//             states the shape." It holds for `whatContent` at length 3 and
//             `whatAudience` at length 4 today, and at any other lengths tomorrow,
//             with no edit here. Likewise the props contract — a pure synchronous
//             server component over typed props that reads no catalogue itself, so
//             the one sanctioned reader (`getMessages` from '@/i18n/messages')
//             stays at the page boundary and this section is testable by
//             construction, with no i18n mock and no per-section exemption.
//
// HONEST LIMIT  Six, stated plainly.
//   1. THE BACKDROP FILE DOES NOT EXIST YET. `/images/lecture-soldiers.webp` is
//      the agreed W6 basename; at the time of writing public/images holds seven
//      files and none of them is it. A missing file is a broken image at runtime.
//      This file cannot detect that and neither can its test — jsdom never loads
//      an image. Nothing here creates the asset; that is W6's unit.
//   2. NOTHING IN THIS COMPONENT VARIES BY LOCALE. `locale` is accepted to keep
//      the section props uniform across the thirteen sections and is deliberately
//      NOT destructured: `lang`/`dir` live on <html> (ledger D-5/D-30) and
//      emitting either here would give that fact a second home; direction is
//      carried by logical CSS only. The test proves this rather than asserting
//      it — same `m`, both locales, markup compared byte-for-byte — so it goes
//      red the instant someone adds a locale branch.
//   3. THE BACKDROP HAS `alt=""` AND `aria-hidden` (ledger D-29). It sits behind a
//      75%-opaque overlay and conveys nothing a screen-reader user needs; a
//      non-empty `alt` there would be invented copy. So "every image has a
//      non-empty alt" is FALSE for this section by design, and the test asserts
//      what is true instead: the attribute is present, it is empty, and the image
//      is not `priority`. It uses `next/image` with `fill` rather than a CSS
//      `background-image` (ledger D-32) so that W6's webp/`sizes`/lazy-load
//      pipeline reaches the largest file on the section.
//   4. THE EMOJI ARE `aria-hidden`. Each one sits immediately beside a title that
//      states the same thing in words, so announcing "fire" before that title is
//      noise, not information. This is a JUDGEMENT about redundancy, not a fact
//      the catalogue carries: the schema types `icon` as a plain string, so a
//      catalogue that one day put a load-bearing character there would be silently
//      hidden from screen readers by this decision. The honest closer is a
//      per-entry label in the catalogue, and messages/** is not in this write-set.
//   5. THE TWO HEADING IDS ARE A11Y WIRING, NOT NAVIGATION ANCHORS. They exist
//      only so each `<ul>` can carry `aria-labelledby` and be announced with its
//      own name. They are deliberately NOT added to `SECTION_IDS` in config/site.ts
//      — that object declares the four ids the navigation can target and this
//      section is not one of them (ledger C8); inventing a fifth there would be a
//      constant with two homes, and config/ is not in this write-set. The section
//      element itself therefore carries no `id` and cannot be linked to.
//   6. `fill` MAKES next/image WRITE PHYSICAL `left`/`right` INLINE STYLES (all
//      four insets zero). They are symmetric and so direction-safe, but they are
//      the library's markup, not this file's; every class this file writes is
//      logical (`ms/me/ps/pe/text-start/text-end`) and the test's physical-class
//      sweep reads classNames only.
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image'

import type { Locale } from '@/config/site'
import type { Messages } from '@/i18n/messages'

/**
 * The W6 contract, stated once as the full path the browser will request — not a
 * basename assembled at the use site, which could not be found by grepping for
 * the string that appears in a network log. Decorative: see HONEST LIMIT 3.
 */
const BACKDROP_IMAGE = '/images/lecture-soldiers.webp'

/** Full-bleed backdrop: one viewport-width candidate at every breakpoint. */
const BACKDROP_SIZES = '100vw'

/** A11y wiring only — see HONEST LIMIT 5. Written once, referenced twice each. */
const CONTENT_HEADING_ID = 'what-you-get-content-heading'
const AUDIENCE_HEADING_ID = 'what-you-get-audience-heading'

export type WhatYouGetProps = {
  m: Pick<
    Messages,
    | 'whatTitle'
    | 'whatContentTitle'
    | 'whatContent'
    | 'whatAudienceTitle'
    | 'whatAudience'
  >
  /** Accepted for a uniform section contract; not read here. HONEST LIMIT 2. */
  locale: Locale
}

export function WhatYouGet({ m }: WhatYouGetProps) {
  return (
    <section className="relative overflow-hidden px-6 py-[70px]">
      <div aria-hidden className="absolute inset-0">
        <Image
          src={BACKDROP_IMAGE}
          alt=""
          fill
          sizes={BACKDROP_SIZES}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="relative z-10 mx-auto max-w-[700px]">
        <h2 className="mb-8 text-center text-3xl font-black text-white md:text-4xl">
          {m.whatTitle}
        </h2>

        <h3
          id={CONTENT_HEADING_ID}
          className="mb-3.5 text-start text-lg font-bold text-secondary"
        >
          {m.whatContentTitle}
        </h3>
        <ul
          aria-labelledby={CONTENT_HEADING_ID}
          className="mb-9 flex list-none flex-col gap-5 p-0"
        >
          {m.whatContent.map((item) => (
            <li key={item.title} className="flex items-start gap-3.5">
              {/* Catalogue value, never a literal. Hidden: HONEST LIMIT 4. */}
              <span aria-hidden className="mt-0.5 min-w-[32px] text-xl">
                {item.icon}
              </span>
              <div>
                <h4 className="mb-1 text-[0.97rem] font-bold text-white">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-300">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <h3
          id={AUDIENCE_HEADING_ID}
          className="mb-3.5 text-start text-lg font-bold text-secondary"
        >
          {m.whatAudienceTitle}
        </h3>
        <ul
          aria-labelledby={AUDIENCE_HEADING_ID}
          className="flex list-none flex-col gap-4 p-0"
        >
          {m.whatAudience.map((item) => (
            <li
              key={item.title}
              className="rounded-[10px] border border-white/10 bg-black/40 p-4"
            >
              <h4 className="mb-1 text-[0.95rem] font-bold text-white">
                {item.title}
              </h4>
              <p className="text-[0.85rem] text-gray-300">{item.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
