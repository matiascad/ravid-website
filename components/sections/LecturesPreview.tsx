// ─────────────────────────────────────────────────────────────────────────────
// W4-04 SECTION · components/sections/LecturesPreview.tsx
//
// THE SECTION THAT RENDERS A HOLE IN THE CONTENT, ON PURPOSE AND VISIBLY.
// `lectureItems` is an array of 4 strings in BOTH catalogues and index 3 is `""`
// — verified in messages/he.json and messages/en.json, transcribed byte-for-byte
// from the customer's own build. In their build a 4th photo renders beside that
// empty string with an EMPTY HEADING and an EMPTY `alt`. That is ledger §OPEN 6,
// awaiting one sentence from the customer, and D-8 fixes what this file does
// until it arrives: keep the row, drop the empty elements, never write the
// missing sentence.
//
// INVARIANT     Every `<img>` this section renders IN ITS LIST carries a
//               NON-EMPTY accessible name, and every heading element it renders
//               has NON-EMPTY text. Exactly one image sits outside that list —
//               the decorative backdrop — and its name is empty ON PURPOSE
//               (ledger D-29); the test pins that one element down by src,
//               `alt=""` and `aria-hidden` so the carve-out is one asserted
//               element wide rather than an open door. See HONEST LIMIT 2.
//               There is exactly one place where a row's name is decided — the
//               `kind` of the `LectureEntry` built in `buildEntries` — and both
//               of its variants carry a string that was length-checked at that
//               single construction site. A row whose text is absent is a named
//               variant of the entry type (`'unwritten'`), not an `if` buried in
//               JSX, so a reader sees the gap was handled deliberately.
//
// IMPOSSIBLE    Four things can no longer be CONSTRUCTED here.
//               (a) An empty `<h3>`. The heading element is rendered ONLY inside
//                   the `kind === 'authored'` branch, and `'authored'` is only
//                   reachable through `item.length > 0`. There is no code path
//                   from an empty string to a heading element.
//               (b) An empty `alt`. The `'unwritten'` variant DOES NOT HAVE a
//                   heading field to fall back to; its `alt` comes from the one
//                   other non-empty message key in scope and is length-checked
//                   before the variant is constructed. `alt={entry.heading}` on
//                   an unwritten row is a compile error — the field does not
//                   exist on that variant.
//               (c) A silently dropped 4th row. `buildEntries` iterates the
//                   items; the empty one still produces an entry and still
//                   renders its image. The hole stays VISIBLE on the page.
//               (d) A DECORATIVE IMAGE THAT BYPASSES OPTIMISATION. The backdrop
//                   is a `next/image` with `fill`, `alt=""` and `aria-hidden`
//                   (ledger D-32), so it is format-negotiated, `sizes`-aware and
//                   lazy exactly like the five images in the list. It cannot
//                   silently become a CSS `background-image` again: the test
//                   sweeps every element in the rendered subtree for both an
//                   inline `background-image` and a `bg-[url(` utility class and
//                   requires zero of each.
//
// CLASS         Closed by derivation for THIS SECTION's list, at any length: no
//               count of 4 is written anywhere, the loop is over the data, and a
//               5th item added to the catalogue renders without touching this
//               file (with an image if the media table has a 5th row, heading-
//               only if it does not). INSTANCE, explicitly, for the empty-string
//               problem site-wide: `stats[*].desc` and `testimonials[*].sub` are
//               empty in the same catalogue (see i18n/messages.ts HONEST LIMIT 4)
//               and are other delegates' sections. This file closes the hole it
//               renders; it cannot close theirs.
//
// HONEST LIMIT  Six, stated plainly.
//   1. THIS COMPONENT RENDERS A DELIBERATE CONTENT GAP. Row 4 is a photograph
//      with no sentence beside it. The gap is ledger §OPEN 6 and ONE SENTENCE
//      FROM THE CUSTOMER CLOSES IT: put it in `lectureItems[3]` in both
//      catalogues and this file needs no edit at all — the row becomes
//      `'authored'` by itself. Nothing here invents that sentence, and nothing
//      here hides its absence.
//   2. THE BACKGROUND PHOTOGRAPH IS A `next/image`, AND ITS `alt` IS EMPTY ON
//      PURPOSE. It was a CSS `background-image` when this section was first
//      written, on the reasoning that `next/image` would force either `alt=""`
//      or an invented name. The reasoning was sound and the conclusion was wrong:
//      a CSS background bypasses W6's optimisation pipeline entirely — no format
//      negotiation, no responsive `sizes`, no lazy-load — on some of the heaviest
//      bytes on the site, and `alt=""` + `aria-hidden` is the CORRECT accessible
//      treatment of a decorative image (ledger D-29), not a hole: the element is
//      removed from the accessibility tree rather than announced with noise.
//      The COST of the change is real and is stated here rather than hidden: the
//      "no unnamed image" sweep in the test is now scoped to the LIST, so an
//      unnamed image added OUTSIDE the list would not trip it. The test closes
//      that by asserting the non-list images are EXACTLY ONE and by asserting
//      its src, its empty `alt` and its `aria-hidden` individually.
//   3. THE MEDIA TABLE IS POSITIONAL, and position is the only thing tying a
//      photograph to a sentence. That pairing is the customer's, read from
//      ravid_website1/src/components/LecturesPreviewSection.tsx:12 and confirmed
//      by ledger §OPEN 6 ("paired with a 4th image (media-interview)"). It is NOT
//      in the catalogue, so reordering `lectureItems` silently re-pairs the
//      photographs and nothing detects it.
//   4. THE DECLARED `width`/`height` DESCRIBE THE RENDERED BOX, NOT THE FILES.
//      700x288 is this file's own layout fact (max-w-[700px] x h-72), true by
//      construction and independent of whatever pixel dimensions W6's `.webp`
//      conversion produces. `object-cover` makes distortion impossible either
//      way. If W6 publishes real intrinsic dimensions, this is one edit.
//   5. THE IMAGE PATHS ARE A PROMISE W6 HAS NOT KEPT YET. `public/images/`
//      currently holds 7 `.jpg` files and ZERO `.webp`; all five paths below
//      404 until W6 converts them. Verified this session, not assumed.
//   6. THE EMOJI CHIPS ARE DECORATION COPIED VERBATIM from the customer's
//      component (they are NOT in the catalogue), and they are `aria-hidden`.
//      Their pairing looks odd in row 2 in the customer's build too; it was
//      copied, not corrected, because correcting it would be design invention.
//
// CONTRACTS HELD: no `'use client'` · no next-intl message reader (the only
// message access is the typed `m` prop) · no Hebrew codepoint, including in this
// header · no physical-direction CSS (`px`/`mx`/`mb`/`mt` are symmetric or
// block-axis) · no `any`, no `!`, no `as` that discards checking · no authored
// copy: every string a reader sees comes from the catalogue.
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image'

import { type Locale } from '@/config/site'
import { type Messages } from '@/i18n/messages'

export type LecturesPreviewProps = {
  m: Pick<Messages, 'lecturesTitle' | 'lectureItems' | 'lecturesFooter'>
  /** Part of the uniform section contract. This section renders nothing that
   *  varies by it — direction comes from `<html dir>`, set once in the layout —
   *  and its test proves that claim rather than asserting it. */
  locale: Locale
}

/** One row's photograph and its decorative chip. Positional — see LIMIT 3. */
type LectureMedia = {
  readonly src: string
  readonly icon: string
}

/**
 * THE POSITIONAL PAIRING, stated once. Order is the customer's, read from
 * ravid_website1/src/components/LecturesPreviewSection.tsx:12-13 and cross-checked
 * against ledger §OPEN 6, which names `media-interview` as the photograph beside
 * the empty string. Length is NOT assumed to match `lectureItems`.
 */
const LECTURE_MEDIA: readonly LectureMedia[] = [
  { src: '/images/lecture-soldiers.webp', icon: '👥' },
  { src: '/images/blood-donation.webp', icon: '📚' },
  { src: '/images/speech-event.webp', icon: '🎤' },
  { src: '/images/media-interview.webp', icon: '📺' },
]

/**
 * The decorative backdrop. It IS an `<img>` — `next/image` with `fill` — because
 * a CSS background would forfeit the whole optimisation wave on it (ledger D-32),
 * and it is named `alt=""` + `aria-hidden` because that is what a decorative
 * image's accessible name should be (ledger D-29). See HONEST LIMIT 2.
 *
 * It covers the section edge to edge at every width, so its `sizes` is the
 * viewport — unlike the list images, which live inside a 700px column.
 */
const BACKGROUND_SRC = '/images/lectures-bg-soldiers.webp'
const BACKGROUND_SIZES = '100vw'

/** The rendered box, not the files' intrinsic pixels. See HONEST LIMIT 4. */
const IMAGE_BOX = { width: 700, height: 288 } as const

/** max-w-[700px] inside `px-6`, so 24px of gutter on each side below 748px. */
const IMAGE_SIZES = '(max-width: 748px) calc(100vw - 48px), 700px'

/**
 * A row, in exactly two shapes.
 *
 * `'authored'` — the customer wrote a sentence. It is the heading AND the
 *                photograph's accessible name.
 * `'unwritten'` — the customer's string is `""` (ledger §OPEN 6). THERE IS NO
 *                `heading` FIELD: a heading element is unrepresentable for this
 *                row, and the photograph's name comes from `alt`, which
 *                `buildEntries` fills from `lecturesTitle` only after proving it
 *                non-empty. `media` is required here because a row with neither
 *                text nor a photograph has nothing to render at all.
 */
type LectureEntry =
  | {
      readonly kind: 'authored'
      readonly key: number
      readonly heading: string
      readonly media: LectureMedia | null
    }
  | {
      readonly kind: 'unwritten'
      readonly key: number
      readonly alt: string
      readonly media: LectureMedia
    }

/**
 * THE ONE PLACE a row's name is decided.
 *
 * `fallbackAlt` is the only non-empty string this section has that is not the
 * missing sentence itself — `lecturesTitle`, an existing catalogue key. It is
 * NOT authored here and it is NOT derived from the empty string.
 *
 * The one case that produces NO entry is an unwritten row that also has no
 * photograph, or an unwritten row for which even `lecturesTitle` is empty: with
 * no text, no image and no sourceable name there is literally nothing that may
 * honestly be rendered, and inventing a name is forbidden. Unreachable with the
 * validated catalogues (both have a non-empty `lecturesTitle` and a 4th photo);
 * stated here so that it is a decision rather than an accident.
 */
function buildEntries(
  items: readonly string[],
  fallbackAlt: string,
): readonly LectureEntry[] {
  const entries: LectureEntry[] = []

  for (const [index, item] of items.entries()) {
    const found = LECTURE_MEDIA[index]
    const media: LectureMedia | null = found === undefined ? null : found

    if (item.length > 0) {
      entries.push({ kind: 'authored', key: index, heading: item, media })
      continue
    }

    // ── THE CONTENT GAP · ledger §OPEN 6, behaviour fixed by D-8 ────────────
    // The item is `""`. Keep the row so the gap stays visible, render NO
    // heading element, and name the photograph from a key that exists.
    if (media !== null && fallbackAlt.length > 0) {
      entries.push({ kind: 'unwritten', key: index, alt: fallbackAlt, media })
    }
  }

  return entries
}

/** Non-empty for both variants by construction — see `buildEntries`. */
function accessibleName(entry: LectureEntry): string {
  return entry.kind === 'authored' ? entry.heading : entry.alt
}

export function LecturesPreview({ m }: LecturesPreviewProps) {
  const entries = buildEntries(m.lectureItems, m.lecturesTitle)

  return (
    <section className="relative overflow-hidden px-6 py-[70px]">
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src={BACKGROUND_SRC}
          alt=""
          aria-hidden="true"
          fill
          sizes={BACKGROUND_SIZES}
          className="object-cover object-center"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 mx-auto max-w-[700px]">
        <h2 className="mb-8 text-center text-3xl font-black text-white md:text-4xl">
          {m.lecturesTitle}
        </h2>

        <ul className="mb-6 flex list-none flex-col gap-7">
          {entries.map((entry) => (
            <li key={entry.key}>
              {entry.kind === 'authored' ? (
                <div className="flex items-start gap-4">
                  {entry.media === null ? null : (
                    <span
                      aria-hidden="true"
                      className="flex h-[44px] min-w-[44px] items-center justify-center rounded-[10px] border border-border bg-card text-3xl"
                    >
                      {entry.media.icon}
                    </span>
                  )}
                  <h3 className="mb-1 text-[0.97rem] font-bold text-white">
                    {entry.heading}
                  </h3>
                </div>
              ) : null}

              {entry.media === null ? null : (
                <Image
                  src={entry.media.src}
                  alt={accessibleName(entry)}
                  width={IMAGE_BOX.width}
                  height={IMAGE_BOX.height}
                  sizes={IMAGE_SIZES}
                  className="mt-3 h-72 w-full rounded-xl border border-border object-cover object-center"
                />
              )}
            </li>
          ))}
        </ul>

        <p className="rounded-xl border border-white/20 bg-black/50 p-5 text-center text-[0.95rem] leading-relaxed text-gray-200 backdrop-blur-sm">
          {m.lecturesFooter}
        </p>
      </div>
    </section>
  )
}
