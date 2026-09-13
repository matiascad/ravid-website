// ─────────────────────────────────────────────────────────────────────────────
// W4-08 TESTIMONIALS — components/sections/Testimonials.tsx
//
// WHAT THIS SECTION CARRIES
//   Three real attributions from real bereaved organisations: the deceased's own
//   battalion and company, a bereaved-families forum, and the Israeli Armored
//   Corps. A quotation rendered beside the wrong name, or with no name at all,
//   misattributes a bereaved family's words. That is the defect this file is
//   shaped to make unconstructable — not a styling concern.
//
// INVARIANT     A testimonial's `text`, `icon`, `name` and `sub` reach the DOM
//               from ONE binding — the single `testimonial` parameter of the one
//               `map` in this file — and they are emitted inside ONE element,
//               the `<figure data-testid="testimonial-card">` produced by that
//               same iteration. There is no second list, no index arithmetic and
//               no lookup: `m.testimonials` is read exactly once, by that `map`,
//               and every field expression in the card is a property access on
//               that parameter. Equally invariant: `text` reaches the DOM as the
//               WHOLE catalogue string — one interpolation, no slice, no
//               ellipsis, no line-clamp — and the `sub` element exists if and
//               only if `testimonial.sub.length > 0`.
//
// IMPOSSIBLE    Five things can no longer be CONSTRUCTED in this file:
//               (a) A MISATTRIBUTION. Pairing is not a rule a reviewer must
//                   check; it is the shape of the code. To render `text` beside
//                   the wrong `name` you would have to introduce a second read
//                   of `m.testimonials` and an index — both absent, and both
//                   caught by the attribution test, which locates the card
//                   CONTAINING each text and asserts the name inside THAT card
//                   rather than merely somewhere on the page.
//               (b) A DETACHED QUOTATION. `text` and `name` are siblings under
//                   one `<figure>`; there is no code path that emits a
//                   `<blockquote>` without the `<figcaption>` beneath it.
//               (c) A TRUNCATED TESTIMONIAL. No `slice`, `substring`, `…`,
//                   `truncate` or `line-clamp-*` appears here, and the test pins
//                   each quote by whole-string `textContent` equality — so a
//                   later "tidy the card" edit is RED, not a quiet elision of a
//                   bereaved family's words. Shortening a card is a design
//                   question for a human; it is not a decision this file makes.
//               (d) AN EMPTY ELEMENT FOR AN EMPTY `sub`. `""` is REAL customer
//                   data in `testimonials[0]`, not a defect. The branch is
//                   explicit and returns `null`, so no `<span></span>` is
//                   emitted and no filler copy is invented to fill one.
//               (e) A HARDCODED COUNT, ICON OR STRING. There is no index
//                   literal, no `3`, no emoji literal and no copy of any kind in
//                   this file: every visible character originates in the
//                   catalogue. `noUncheckedIndexedAccess` therefore has nothing
//                   to bite on, so there is also no `!` and no cast.
//
// CLASS         DERIVATION for text↔name pairing, for count, and for the
//               empty-`sub` branch: each is closed by the structure of the code
//               (one read, one map, one binding, one explicit guard) and holds
//               for ANY catalogue this schema admits — three testimonials or
//               thirty, with any subset of empty `sub` values. INSTANCE,
//               explicitly, for the truthfulness of the attributions themselves:
//               this file renders them faithfully; it cannot know whether the
//               catalogue's transcription is correct. See HONEST LIMIT 1.
//
// HONEST LIMIT  Six, stated plainly.
//   1. FIDELITY, NOT TRUTH. This file guarantees the catalogue's bytes reach the
//      DOM unaltered. It does not verify that a quotation was really said, that
//      a unit name is spelled as the organisation spells it, or that permission
//      to publish was given. Nothing here would notice. Those are human checks.
//   2. THE BACKGROUND ASSET DOES NOT EXIST YET. `/images/israel-flag.webp` is
//      the W6 contract; `public/images/` does not contain it at the time this
//      file was written, and this delegate does not create image files. Until W6
//      ships it the section renders the dark scrim and the cards, and the
//      `<img>` resolves to nothing. This constant is the single place to change
//      if W6 ships a different path.
//   3. `alt=""` IS A DELIBERATE EMPTY ALT, not a missing one. The flag is a
//      decorative scrim behind text that carries the whole meaning, the wrapper
//      is `aria-hidden`, and the catalogue holds no alt key for it. The
//      customer's own build gave it Hebrew alt text; inventing an equivalent
//      here would be inventing copy. If the flag is later judged informative,
//      that is a new message key, not an edit to this line.
//   4. THE `icon` EMOJI IS RENDERED AS CONTENT, NOT HIDDEN. It is a catalogue
//      value, so a screen reader announces it ("busts in silhouette") ahead of
//      the attribution name. Marking real customer content `aria-hidden` is a
//      content decision, and the alternative — an alt string per icon — is a new
//      message key. Both are the customer's call, not this delegate's, so the
//      value is passed through untouched and the question is owed to the seat.
//   5. NO DECORATIVE QUOTATION GLYPH. The customer's build floats a large `"`
//      in the corner of each card. It is not reproduced: the correct ornament
//      for a Hebrew right-to-left card is a gershayim, which is a Hebrew
//      codepoint and is forbidden in this file (D-13), and substituting a Latin
//      opening quote is a typographic decision about a bereaved family's words
//      that this delegate is not positioned to make. `<blockquote>` carries the
//      quotation semantically; the ornament is a design question for a human.
//   6. NO SECTION ID. `SECTION_IDS` in `@/config/site` is a live contract of
//      exactly four scroll targets and `testimonials` is not one of them. This
//      section is not an anchor target and does not invent an id to become one.
//      The `id` below is a local `aria-labelledby` target, nothing more.
//
// CASTS: no `any`, no `!`, no `as`. No `'use client'` — pure synchronous server
// component. Physical-direction utilities (ml/mr/pl/pr/left/right/text-left/
// text-right) do not appear; direction is owned by the `dir` attribute the
// layout sets and is never re-derived here.
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image';

import type { Locale } from '@/config/site';
import type { Messages } from '@/i18n/messages';

type TestimonialsProps = {
  m: Pick<Messages, 'testimonialsTitle' | 'testimonials'>;
  locale: Locale;
};

/** Local DOM id for `aria-labelledby`. Not a site anchor — see HONEST LIMIT 6. */
const TITLE_ID = 'testimonials-title';

/** The W6 contract. See HONEST LIMIT 2. */
const BACKGROUND_SRC = '/images/israel-flag.webp';

/**
 * `locale` is intentionally not destructured: nothing in this section varies by
 * locale. That is an absence, so the test proves it by rendering `he` and `en`
 * against one fixture and comparing `innerHTML` byte for byte (C10).
 */
export function Testimonials({ m }: TestimonialsProps) {
  return (
    <section
      aria-labelledby={TITLE_ID}
      className="relative overflow-hidden px-6 py-[70px]"
    >
      <div aria-hidden="true" className="absolute inset-0">
        {/* Decorative background: next/image with `fill`, never a CSS
            background-image (D-32), empty alt inside an aria-hidden wrapper
            (D-29), and no `priority` — this section is below the fold. */}
        <Image
          src={BACKGROUND_SRC}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-[700px]">
        <h2 id={TITLE_ID} className="mb-8 text-center text-3xl font-black text-white md:text-4xl">
          {m.testimonialsTitle}
        </h2>

        <ul className="space-y-5">
          {/* THE ONLY read of `m.testimonials` in this file, and the only place a
              card is produced. Every field below is a property of `testimonial`
              — one binding — so a quotation cannot be separated from its
              attribution or paired with another one. See IMPOSSIBLE (a). */}
          {m.testimonials.map((testimonial, index) => (
            <li
              // The list is static and never reorders; an index key cannot
              // collide, where a duplicated `name` could.
              key={index}
            >
              <figure
                data-testid="testimonial-card"
                className="m-0 rounded-xl border border-white/10 bg-black/40 p-6"
              >
                <blockquote className="m-0">
                  {/* The whole catalogue string, once. No clamp, no ellipsis. */}
                  <p data-testid="testimonial-text" className="mb-3.5 text-[0.93rem] italic text-gray-200">
                    {testimonial.text}
                  </p>
                </blockquote>

                <figcaption className="mt-3.5 flex items-center gap-2.5">
                  <span data-testid="testimonial-icon" className="text-xl">
                    {testimonial.icon}
                  </span>
                  <span className="block">
                    <strong data-testid="testimonial-name" className="block text-[0.92rem] text-white">
                      {testimonial.name}
                    </strong>
                    {testimonial.sub.length > 0 ? (
                      <span data-testid="testimonial-sub" className="text-xs text-gray-400">
                        {testimonial.sub}
                      </span>
                    ) : null}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
