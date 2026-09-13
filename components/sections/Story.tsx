// ─────────────────────────────────────────────────────────────────────────────
// W4-02 SECTION · components/sections/Story.tsx — THE STORY SECTION
//
// This section carries the densest memorial facts on the site: `storyP1` holds
// his full name, birthplace and Hebrew birth date; `storyQuote` is a quotation.
// Every one of the six strings is rendered as a WHOLE VALUE into a single text
// node. There is no template literal, no `.slice`, no `.split`, no `join`, no
// concatenation and no conditional fragment anywhere in this file — so there is
// no expression here that could truncate, re-punctuate or re-order a fact.
//
// INVARIANT     Every user-visible character this component emits comes from one
//               `m` prop, is written to the DOM as an entire catalogue value, and
//               is never combined with any other value or literal. The section's
//               anchor id is `SECTION_IDS.story` read from `@/config/site`, not a
//               string in this file. The component is a pure synchronous function
//               of its props: same `m` in, same markup out, no I/O, no clock, no
//               module state, no catalogue read of its own.
//
// IMPOSSIBLE    Five things can no longer be CONSTRUCTED here:
//               (a) A DRIFTED MEMORIAL FACT. Interpolation is the only mechanism
//                   by which a component can alter a string it was handed, and
//                   this file contains none — the sole JSX expressions are bare
//                   `{m.x}` reads. A fact cannot be half-rendered, re-spaced or
//                   ellipsised by code that never touches its bytes.
//               (b) A SECOND COPY OF THE CATALOGUE SHAPE. `StoryProps.m` is
//                   `Pick<Messages, …>` where `Messages` is `z.infer` of the
//                   zod schema in i18n/messages.ts. A hand-written prop type is
//                   exactly how the customer's `Translations` rotted; this one
//                   cannot disagree with the catalogue, because it IS the
//                   catalogue's type narrowed. Rename a key in he.json and this
//                   file stops compiling.
//               (c) A BROKEN CTA TARGET. Four CTAs elsewhere scroll to this
//                   section. The id is `SECTION_IDS.story`, so `#story` and this
//                   `id` are one fact with one home (ledger D-11); a literal
//                   `id="storey"` has no way to enter.
//               (d) A SELF-FETCHING SECTION. This component does not import
//                   `getMessages`, so it cannot read a locale it was not given,
//                   cannot disagree with the page's locale, and cannot become
//                   async. It is testable by passing it data — see its test.
//               (e) A DUPLICATED QUOTATION MARK. `storyQuote` already contains
//                   its own `"` characters. It is rendered inside `<blockquote>`,
//                   which inserts nothing, NOT `<q>`, whose UA stylesheet would
//                   add a second pair around marks that are already there.
//
// CLASS         THIS INSTANCE, honestly, for most of the above — (a), (c) and (e)
//               are properties of how this one file is written, and nothing here
//               stops the next section from interpolating a fact or inlining an
//               id. (b) and (d) are DERIVED and hold for every section that
//               follows the same two lines: a `Pick<Messages, …>` prop type is
//               checked by the compiler against the one schema, and a component
//               with no message import cannot read a message. The repo-wide
//               closure of (c) is the W7 grep gate's job, not this file's.
//
// HONEST LIMIT  Five, stated plainly.
//   1. THE IMAGE NOW HAS AN ALT OF ITS OWN, AND IT IS HEBREW IN EVERY LOCALE.
//      The earlier stopgap was `m.storyTitle`, which is also the heading, so a
//      screen reader heard the section title twice. That gap is CLOSED: the alt
//      is `m.imageAlts['helmet-bird']` — the customer's own string, transcribed
//      into the catalogue by a later delegate, keyed by the image basename and
//      schema-pinned at `.min(1)`. Nothing is invented here and no Hebrew
//      codepoint enters this file (D-13 holds). What is NOT closed: `imageAlts`
//      is source-locale-only (ledger D-18), so the English page serves a Hebrew
//      `alt` with no `lang` annotation. Annotating it would mean reading `locale`
//      in this component, which would contradict HONEST LIMIT 3 and break the
//      invariance its test asserts — so it is a real question for the seat, not a
//      change to smuggle in here. OWED TO THE SEAT.
//   2. IT PROVES SHAPE, NEVER TRUTH. The compiler guarantees `m.storyP1` exists
//      and is a string. Nothing here — and nothing anywhere in this repo — checks
//      that the date, the name or the birthplace inside it is correct. This file
//      renders the catalogue faithfully; it cannot tell you the catalogue is right.
//   3. NOTHING IN THIS COMPONENT VARIES BY LOCALE. `locale` is accepted so that
//      the composition unit can pass one uniform prop set to every section, and it
//      is deliberately not read: text direction has exactly one home
//      (LOCALE_DIRECTION in i18n/routing.ts, applied to `<html dir>` by the shell),
//      and a section that re-derived it would be a second copy of that fact. The
//      test asserts this INVARIANCE rather than asserting a difference that does
//      not exist.
//   4. `/images/helmet-bird.webp` DID NOT EXIST ON DISK WHEN THIS WAS WRITTEN.
//      The basename is the agreed contract with W6, who produces the file. Until
//      it lands, this renders a broken image at runtime — a visible failure, not a
//      silent one. `width`/`height` are the source asset's true pixels (1440×1920,
//      measured from the customer's helmet-bird.jpg), so the layout box is right
//      even before the file arrives; if W6 ships a different aspect ratio these
//      two numbers must follow it.
//   5. LOGICAL CSS IS A CLAIM THIS FILE MAKES, NOT ONE IT ENFORCES. Every inline
//      direction here is `ms/me/ps/pe/start/end`, but Tailwind would happily
//      compile a physical padding class in the next edit. Only the W7 gate can
//      hold that line. (This paragraph deliberately NAMES no physical class: a
//      byte-level grep gate would score the example itself as a violation, which
//      is the D-13 false-red class. Stated, not demonstrated.)
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image'

import { SECTION_IDS, type Locale } from '@/config/site'
import type { Messages } from '@/i18n/messages'

/**
 * DERIVED from the catalogue type, never hand-written (IMPOSSIBLE b).
 *
 * `locale` is part of the uniform prop set every section receives from the
 * composition unit. Story does not read it — see HONEST LIMIT 3 — and it is not
 * destructured below, so it cannot be used by accident and cannot trip the
 * unused-binding gate.
 */
export type StoryProps = {
  m: Pick<
    Messages,
    | 'storyTitle'
    | 'storyH3'
    | 'storyP1'
    | 'storyP2'
    | 'storyP3'
    | 'storyQuote'
    // The photograph's accessible name, keyed by basename — see HONEST LIMIT 1.
    | 'imageAlts'
  >
  locale: Locale
}

/** Shared by all three body paragraphs. One declaration, so they cannot drift. */
const PARAGRAPH_CLASS = 'mb-3.5 text-[0.97rem] leading-[1.85] text-gray-200'

/**
 * The photograph. `IMAGE_KEY` is the same basename as the path because
 * `imageAlts` is keyed by basename (i18n/messages.ts) — one fact, spelled once
 * per role. It is a literal member of a `strictObject`, so the lookup is
 * `string`, never `string | undefined`: no guard, no `!`, and a renamed
 * catalogue key breaks THIS FILE at compile time instead of blanking an `alt`.
 */
const IMAGE_SRC = '/images/helmet-bird.webp'
const IMAGE_KEY = 'helmet-bird' as const

export function Story({ m }: StoryProps) {
  return (
    <section
      id={SECTION_IDS.story}
      className="relative overflow-hidden px-6 py-[70px]"
    >
      <div className="absolute inset-0">
        <Image
          src={IMAGE_SRC}
          alt={m.imageAlts[IMAGE_KEY]}
          width={1440}
          height={1920}
          sizes="100vw"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="relative z-10 mx-auto max-w-[700px]">
        <h2 className="mb-8 text-center text-3xl font-black text-white md:text-4xl">
          {m.storyTitle}
        </h2>

        <h3 className="mb-3.5 text-start text-lg font-bold text-secondary">
          {m.storyH3}
        </h3>

        <p className={PARAGRAPH_CLASS}>{m.storyP1}</p>
        <p className={PARAGRAPH_CLASS}>{m.storyP2}</p>
        <p className={PARAGRAPH_CLASS}>{m.storyP3}</p>

        {/* <blockquote>, not <q>: the value already carries its own quotation
            marks, and <q> would have a UA stylesheet add a second pair. */}
        <blockquote className="my-7 rounded-e-lg border-s-[3px] border-secondary bg-black/40 py-5 pe-4 ps-5">
          <p className="mb-0 text-base font-medium italic text-white">
            {m.storyQuote}
          </p>
        </blockquote>
      </div>
    </section>
  )
}
