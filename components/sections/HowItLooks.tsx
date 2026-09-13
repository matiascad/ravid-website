// ─────────────────────────────────────────────────────────────────────────────
// W4-07 · components/sections/HowItLooks.tsx — "HOW IT LOOKS" (lecture formats)
//
// WHAT THIS SECTION IS. One heading and a list of lecture formats. Each format
// carries three strings the customer wrote — an emoji `icon`, a `title` and a
// `desc` — and all three are CONTENT, read from the catalogue, never authored
// here. The emoji in particular is data: it lives in messages/*.json, it is not
// an icon-library glyph chosen by this file, and no icon library is installed.
//
// THE DEFECT THIS FILE EXISTS NOT TO REPRODUCE. The source component this
// replaces (ravid_website1/src/components/HowItLooksSection.tsx:20) types its
// map callback `(f: any)`. That single annotation deletes every guarantee the
// catalogue type could give at the one place the data is actually read: a
// renamed key, a dropped field, a number where a string belongs — all compile.
// It is the SECOND of the two `any` leaks W1 measured in the customer's build,
// and the one a grep for `: any` in type positions would have missed because it
// hides in a callback parameter. Here the callback parameter has NO annotation
// at all: its type is INFERRED from `m.howFormats`, which is
// `Pick<Messages, 'howFormats'>` — the zod-derived type from i18n/messages.ts.
// Inference, not assertion, is what makes the guarantee unable to fail.
//
// INVARIANT   Every character this component renders comes from the `m` prop,
//             whole and unmodified, and `m`'s type is DERIVED from the catalogue
//             schema (`Pick<Messages, …>`), never re-declared here. There is one
//             string literal in this file that reaches the DOM and it is an image
//             PATH, not prose. Nothing is concatenated, interpolated, translated,
//             abbreviated or reordered, so no piece of copy has a second home.
//             The number of formats rendered is `m.howFormats.length` and that
//             number appears nowhere in this file.
//
// IMPOSSIBLE  Four things can no longer be CONSTRUCTED here.
//             (a) A FORMAT MISSING ITS `desc`, OR ITS `icon`. All three fields are
//                 emitted from one `format` binding inside one `<li>`, so a
//                 format cannot reach the DOM with two of its three strings —
//                 dropping one is an EDIT to this file, visible as a diff and as
//                 a RED test, not a shape the data can silently take.
//             (b) A HARDCODED COUNT. There is no `[0]`, no `[1]`, no `.length`
//                 comparison and no literal 3: the list IS the map, so a fourth
//                 format renders the moment the catalogue has one, and a
//                 catalogue of one format renders one card.
//             (c) AN UNTYPED READ OF A FORMAT. `format.titel` is a compile error,
//                 because the callback parameter's type is inferred from the
//                 zod-derived array element type. Re-introducing the source's
//                 `(f: any)` is not merely discouraged: it is an ESLint ERROR
//                 (`@typescript-eslint/no-explicit-any`) in this repo.
//             (d) AN UNOPTIMISED BACKDROP. The backdrop is a `next/image` with
//                 `fill`, so its bytes go through the image pipeline. A CSS
//                 `background-image` — which bypasses that pipeline entirely
//                 (ledger D-32) — is not present, and the test asserts its
//                 absence from the rendered markup rather than trusting review.
//
// CLASS       DERIVATION for the count and for the typing: "the data states the
//             count, the component states the shape" and "callback parameter
//             types are inferred from the catalogue slice, never annotated" hold
//             for `howFormats` at length 3 today, at length 5 tomorrow, and for
//             every list section written to this form. INSTANCE, explicitly, for
//             the backdrop path — one agreed filename, see HONEST LIMIT 2.
//
// HONEST LIMIT  Six, stated plainly.
//   1. NOTHING HERE VARIES BY LOCALE. `locale` is accepted so the thirteen
//      sections share one prop contract, and it is deliberately NOT read: `lang`
//      and `dir` belong on <html> (ledger D-5) and direction is carried by
//      logical CSS. The test proves this by INVARIANCE (ledger D-30) — same `m`,
//      every locale, markup compared byte-for-byte — rather than staging a
//      pretend difference.
//   2. THE BACKDROP FILE DOES NOT EXIST YET. `public/images/` was measured at the
//      time of writing and contains no `.webp` at all; this path is the agreed
//      contract with W6, and until W6 writes that file the backdrop is a broken
//      image at runtime. Neither this file nor its test can detect that — jsdom
//      never fetches it.
//   3. THE BACKDROP IS DECORATIVE AND ITS `alt` IS EMPTY, ON PURPOSE. It sits
//      behind an opaque overlay and names nothing a screen-reader user needs.
//      Writing a subject into that `alt` would be inventing catalogue copy out of
//      a filename — the filename is a W6 artefact, not something the customer
//      wrote — so "every image on this page has a non-empty alt" is FALSE for
//      this section by design, and the test asserts what is true instead.
//   4. `fill` MAKES next/image EMIT PHYSICAL `left`/`right` INLINE STYLES. Those
//      are next/image's own markup, not this file's; every class written here is
//      logical or symmetric. This file cannot remove them without giving up the
//      image pipeline, and giving that up is exactly ledger D-32.
//   5. THE EMOJI ARE MARKED `aria-hidden`. They are decoration beside a title
//      that already carries the meaning, and an assistive technology announcing
//      "bullseye" before "personally tailored" is noise, not information. They
//      are still rendered from `m` and still in the DOM, and the test asserts
//      that — but a user who relies on a screen reader does not receive them.
//      If the customer says the emoji are meaningful, the closer is an emoji
//      LABEL in the catalogue, which is a messages/** change and not this
//      delegate's write-set.
//   6. THIS SECTION HAS NO `id` AND CANNOT BE AN ANCHOR TARGET. `SECTION_IDS` in
//      config/site.ts declares exactly four ids and none is a formats one;
//      inventing a fifth here would inline a constant whose single home is that
//      file, and config/ is not in this unit's write-set.
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image'

import type { Locale } from '@/config/site'
import type { Messages } from '@/i18n/messages'

/**
 * The W6 contract, stated once as a whole path — not a basename assembled at the
 * use site, because a path built by interpolation cannot be found by grepping
 * for the string the browser actually requests. Decorative: see HONEST LIMIT 3.
 */
const BACKDROP_IMAGE = '/images/knesset-bg.webp'

/** Full-bleed backdrop; one candidate width per viewport. */
const BACKDROP_SIZES = '100vw'

export type HowItLooksMessages = Pick<Messages, 'howTitle' | 'howFormats'>

export type HowItLooksProps = {
  m: HowItLooksMessages
  /** Accepted for a uniform section contract; not read here. HONEST LIMIT 1. */
  locale: Locale
}

export function HowItLooks({ m }: HowItLooksProps) {
  return (
    <section className="relative overflow-hidden px-6 py-16">
      <div aria-hidden className="absolute inset-0">
        <Image
          src={BACKDROP_IMAGE}
          alt=""
          aria-hidden
          fill
          sizes={BACKDROP_SIZES}
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      <div className="relative z-10 mx-auto max-w-[700px]">
        <h2 className="mb-8 text-center text-3xl font-black text-white md:text-4xl">
          {m.howTitle}
        </h2>

        {/*
          The callback parameter below carries NO type annotation. That is the
          whole point of this file: `format` is inferred as the element type of
          `Messages['howFormats']`, so `format.desc` is checked and `format.dsec`
          does not compile. The source component wrote `(f: any)` here.
        */}
        <ul className="flex list-none flex-col gap-6 p-0">
          {m.howFormats.map((format) => (
            <li key={format.title} className="text-center">
              <span aria-hidden className="mb-2.5 block text-3xl">
                {format.icon}
              </span>
              <h3 className="mb-1 text-[0.97rem] font-bold text-white">
                {format.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                {format.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
