// ─────────────────────────────────────────────────────────────────────────────
// W4-03 · components/sections/Military.tsx — THE MILITARY SECTION
//
// This section carries the heaviest memorial facts on the site: the brigade, the
// battalion, the posthumous rank, the date and theatre of the battle, his age,
// and the names of the two friends who fell beside him. Every one of those facts
// is a STRING IN THE CATALOGUE and nothing else. This file renders them; it does
// not assemble, abbreviate, reorder, template, translate or normalise one.
//
// INVARIANT   Every character this component renders is a whole, unmodified value
//             read from the `m` prop, which is `Pick<Messages, ...>` — the type
//             inferred from the zod schema in i18n/messages.ts, never re-declared
//             here. There is exactly one literal-string table in this file and it
//             holds IMAGE PATHS, not prose (the W6 contract, stated once). No
//             string rendered to the page is built by concatenation or by template
//             interpolation, so no fact has two homes: a rank, a unit number, a
//             date or a name exists in messages/*.json and there alone.
//
// IMPOSSIBLE  A CARD WITHOUT ITS `desc`, AND A FOURTH CARD THAT DOES NOT RENDER.
//             The card list is produced by `m.militaryCards.map(...)`, so the
//             number of cards is the LENGTH OF THE DATA and cannot be a number
//             written in this file; there is no `[0]`/`[1]`/`[2]` and no literal
//             3 anywhere. `title` and `desc` are emitted by the same expression
//             over the same `card` binding, so a card cannot reach the DOM with
//             one and not the other — dropping `desc` is an EDIT to this file,
//             detectable as a diff and as a RED test, not a data shape that
//             silently renders blank. Under `noUncheckedIndexedAccess` the one
//             remaining index access (the image table) is typed `T | undefined`
//             and is narrowed by an explicit `!== undefined` branch: no `!`, no
//             cast, so a fourth card renders its text with no image rather than
//             crashing or borrowing card 1's photograph.
//
// CLASS       DERIVATION, not instance. The rule is "the data states the count;
//             the component states the shape." It holds for `militaryCards` at
//             length 3 today, at length 4 tomorrow, and for every other list
//             section that follows this file's form. Likewise the props contract:
//             this is a pure synchronous server component over typed props and
//             reads no catalogue itself, so the one sanctioned reader
//             (`getMessages` from '@/i18n/messages') stays at the page boundary
//             and every section is testable by construction, with no mock of the
//             i18n layer and no per-section exemption.
//
// HONEST LIMIT  Six, stated plainly.
//   1. NOTHING IN THIS COMPONENT VARIES BY LOCALE. `locale` is accepted to keep
//      the section props uniform across the thirteen sections, and is deliberately
//      NOT destructured: `lang` and `dir` belong on <html> and are set there
//      (app/[locale]/layout.tsx, ledger D-5), so emitting either here would give
//      that fact a second home. Direction is carried by logical CSS only. The
//      test proves this rather than asserting it: same `m`, both locales, markup
//      compared byte-for-byte.
//   2. THE FOUR IMAGE PATHS ARE A PROMISE THIS FILE CANNOT KEEP ALONE. They are
//      the agreed basenames with W6; at the time of writing none of the four
//      .webp files exists under public/images. A missing file is a broken image
//      at runtime — this file cannot detect that, and neither can its test.
//   3. THE CARD-TO-PHOTOGRAPH PAIRING IS POSITIONAL and therefore the one place
//      where presentation is coupled to catalogue ORDER. Reordering
//      `militaryCards` in messages/*.json re-pairs the photographs silently. The
//      honest closer is an image basename per card IN the catalogue; that is a
//      messages/** change and messages/** is not in this unit's write-set.
//   4. THE BACKDROP FLAG HAS `alt=""` AND `aria-hidden`. It sits behind an opaque
//      overlay and conveys nothing a screen-reader user needs; a non-empty alt
//      there would be invented copy and worse accessibility. So "every image has a
//      NON-EMPTY alt" is false for this section by design, and the test asserts
//      what is true instead: every image carries the attribute, the informative
//      ones are non-empty and come from `m`, and none is `priority`.
//   5. THE THREE DECORATIVE EMOJI OF THE SOURCE COMPONENT ARE NOT REPRODUCED.
//      They are position-indexed decoration with no entry in the catalogue, so
//      for any card beyond the third there is no defined icon. Dropping them was
//      preferred to hardcoding a list whose length this file is forbidden to
//      assume.
//   6. THIS FILE HAS NO SECTION `id` AND SO CANNOT BE AN ANCHOR TARGET.
//      `SECTION_IDS` in config/site.ts declares four ids and none of them is a
//      military one; inventing a fifth here would inline a constant whose single
//      home is that file. config/ is not in this unit's write-set.
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image'

import type { Locale } from '@/config/site'
import type { Messages } from '@/i18n/messages'

/**
 * THE W6 CONTRACT, stated once. Full paths, not basenames assembled at the use
 * site: a path built by interpolation is a path with two homes and cannot be
 * found by grepping for the string the browser actually requests.
 *
 * Positional pairing with `m.militaryCards` — see HONEST LIMIT 3. Indexing this
 * table is the only index access in the file and it is narrowed, never asserted.
 */
const CARD_IMAGES = [
  '/images/tank-firing.webp',
  '/images/tuval-gdud53.webp',
  '/images/tuval-samar.webp',
] as const

/** Decorative backdrop. See HONEST LIMIT 4 for why its `alt` is empty. */
const BACKDROP_IMAGE = '/images/military-bg-flag.webp'

const BACKDROP_SIZES = '100vw'
const CARD_IMAGE_SIZES = '(min-width: 768px) 700px, 100vw'

export type MilitaryProps = {
  m: Pick<
    Messages,
    | 'militaryTitle'
    | 'militaryCards'
    | 'battleTitle'
    | 'battleP1'
    | 'battleP2'
    | 'battleP3'
  >
  /** Accepted for a uniform section contract; not read here. HONEST LIMIT 1. */
  locale: Locale
}

export function Military({ m }: MilitaryProps) {
  return (
    <section className="relative overflow-hidden px-6 py-16">
      <Image
        src={BACKDROP_IMAGE}
        alt=""
        aria-hidden
        width={1920}
        height={1080}
        sizes={BACKDROP_SIZES}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 mx-auto max-w-[700px]">
        <h2 className="mb-8 text-center text-3xl font-black text-white md:text-4xl">
          {m.militaryTitle}
        </h2>

        <ul className="mb-12 flex list-none flex-col gap-5 p-0">
          {m.militaryCards.map((card, index) => {
            // `T | undefined` under noUncheckedIndexedAccess. Narrowed below.
            const cardImage = CARD_IMAGES[index]

            return (
              <li
                key={card.title}
                className="overflow-hidden rounded-xl border border-white/20 bg-black/50 backdrop-blur-sm"
              >
                {cardImage === undefined ? null : (
                  <Image
                    src={cardImage}
                    alt={card.title}
                    width={800}
                    height={450}
                    sizes={CARD_IMAGE_SIZES}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-6 text-center">
                  <h3 className="mb-1.5 text-base font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-300">{card.desc}</p>
                </div>
              </li>
            )
          })}
        </ul>

        <h3 className="mb-5 text-center text-2xl font-black text-white">
          {m.battleTitle}
        </h3>
        <p className="mb-3.5 text-[0.97rem] leading-[1.85] text-gray-200">
          {m.battleP1}
        </p>
        <p className="mb-3.5 text-[0.97rem] leading-[1.85] text-gray-200">
          {m.battleP2}
        </p>
        <p className="text-base font-bold leading-[1.85] text-white">
          {m.battleP3}
        </p>
      </div>
    </section>
  )
}
