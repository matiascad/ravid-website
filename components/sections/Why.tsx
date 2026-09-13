// ─────────────────────────────────────────────────────────────────────────────
// W4-09 SECTION · components/sections/Why.tsx — THE "WHY BOOK THIS" SECTION
//
// This section is the site's LAST CTA before the form. Its load-bearing element
// is not the copy — it is one `href`. W1 measured the customer's old build
// losing 100% of leads silently; a CTA that scrolls nowhere is the same failure
// one step earlier, and it is invisible to every test that only reads text.
//
// INVARIANT     The CTA's `href` is `anchor(SECTION_IDS.form)`, computed once at
//               module scope from `@/config/site`. There is no hash literal, no
//               string concatenation anywhere in this file, so the link target
//               and the form section's `id` are ONE fact with ONE home (ledger
//               D-11). Every user-visible character comes from a single `m` prop
//               and is written to the DOM as a whole catalogue value — no
//               template literal, no `.slice`, no `.split`, no `join`, no
//               concatenation. The reason list is produced by iterating
//               `m.whyReasons`; its length is never read, compared or assumed.
//               The component is a pure synchronous function of its props: same
//               props in, same markup out — no I/O, no clock, no module state,
//               no catalogue read of its own.
//
// IMPOSSIBLE    Five things can no longer be CONSTRUCTED here:
//               (a) A DEAD CTA BY TYPO. `anchor()` accepts only `SectionId`, a
//                   union of the four ids in config/site.ts, and returns the only
//                   spelling of an in-page href in this repo. A misspelled id, an
//                   already-hash-prefixed id and a stray trailing space are all
//                   compile errors, not runtime dead scrolls. The only remaining
//                   way to break this link is to delete the form section's id —
//                   which is the same constant, in the same file. The hash
//                   character does not appear in this file AT ALL, and its test
//                   asserts that at source level.
//               (b) A DROPPED OR HARDCODED-COUNT REASON. The list is `.map` over
//                   the array. The literal `3` does not appear in this file, so a
//                   catalogue of 2 or 4 reasons renders 2 or 4 — a fourth reason
//                   added in messages/he.json cannot be silently truncated by an
//                   index bound that this file does not contain.
//               (c) A SECOND COPY OF THE CATALOGUE SHAPE. `WhyProps.m` is
//                   `Pick<Messages, …>` where `Messages` is `z.infer` of the zod
//                   schema in i18n/messages.ts. Rename a key in he.json and this
//                   file stops compiling. A hand-written prop type is exactly how
//                   the customer's `Translations` rotted.
//               (d) A SELF-FETCHING SECTION. This file does not import
//                   `getMessages`. It cannot read a locale it was not given,
//                   cannot disagree with the page's locale, and cannot become
//                   async.
//               (e) A CSS `background-image` (ledger D-32). The backdrop is a
//                   `next/image` with `fill`, so it is optimised, srcset-ed and
//                   lazy by default; and because it is `alt=""` + `aria-hidden`
//                   it is announced by nothing, which is correct for a photograph
//                   that carries no information the text does not already carry.
//
// CLASS         THIS INSTANCE for (a), (b) and (e): nothing in this file stops a
//               sibling section from hand-writing a form anchor, hardcoding a
//               list length, or reaching for a CSS background. The repo-wide closure of (a) and
//               (e) is the W7 grep gate's job, and it is owed. (c) and (d) are
//               DERIVED and hold for every section that follows the same two
//               lines — a `Pick<Messages, …>` prop type is checked by the
//               compiler against the one schema, and a component with no message
//               import cannot read a message.
//
// HONEST LIMIT  Five, stated plainly.
//   1. `/images/soldier-landscape.webp` DOES NOT EXIST ON DISK. Verified: zero
//      `.webp` files under public/images at the time of writing. The path is the
//      agreed contract with W6, who produces the asset. Until it lands this
//      renders a broken image at runtime — a VISIBLE failure, not a silent one —
//      and no test here can detect it, because jsdom loads no images. Creating
//      the file is outside this delegate's write-set and was not attempted.
//   2. THE BACKDROP HAS NO ALT, AND THAT IS DELIBERATE, NOT AN OVERSIGHT. It is a
//      decorative photograph behind a 75%-black scrim; `alt=""` + `aria-hidden`
//      is the correct encoding of "this carries no information". Inventing an
//      English description of a memorial photograph is forbidden outright, and
//      there is no `alt`-shaped key in either catalogue to read one from.
//   3. IT PROVES SHAPE, NEVER TRUTH. The compiler guarantees `m.whyCta` exists
//      and is a string. Nothing here checks that the reasons are the reasons the
//      family approved, or that the CTA says what the customer wants it to say.
//   4. `TITLE_ID` IS A LOCAL DOM ID, NOT A SITE ANCHOR. It exists only so the
//      `<section>` has an accessible name via `aria-labelledby`. It is therefore
//      deliberately NOT in `SECTION_IDS`: putting it there would claim it is a
//      scroll target that some CTA can point at, which it is not. If a future CTA
//      ever wants to scroll here, the id moves to config/site.ts — it does not
//      get a second, separate home.
//   5. NOTHING IN THIS COMPONENT VARIES BY LOCALE. `locale` is accepted so the
//      composition unit can pass one uniform prop set to every section, and it is
//      deliberately not read: text direction has exactly one home
//      (LOCALE_DIRECTION in i18n/routing.ts, applied to `<html dir>` by the
//      shell), and a section that re-derived it would be a second copy of that
//      fact. The test asserts this INVARIANCE rather than a difference that does
//      not exist.
//
// W10-B ANALYTICS · The closing CTA is a `TrackedLink` reporting `why_book`.
// Server component unchanged; markup byte-identical (hash-measured).
// HONEST LIMIT (analytics) Reports the press, not the arrival at the form.
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image';

import { TrackedLink } from '@/components/sections/TrackedLink';
import { ctaClick } from '@/lib/analytics/events';
import { anchor, SECTION_IDS, type Locale } from '@/config/site';
import type { Messages } from '@/i18n/messages';

type WhyProps = {
  m: Pick<Messages, 'whyTitle' | 'whyReasons' | 'whyCta'>;
  /** Accepted for a uniform section contract; not read here. HONEST LIMIT 5. */
  locale: Locale;
};

/**
 * The section's whole reason for existing. Derived from config/site.ts so this
 * href and the form section's `id` cannot drift apart. See IMPOSSIBLE (a).
 */
const FORM_HREF = anchor(SECTION_IDS.form);

/** Local DOM id for `aria-labelledby`. NOT a site anchor — see HONEST LIMIT 4. */
const TITLE_ID = 'why-title';

/** The W6 contract. The file does not exist yet — see HONEST LIMIT 1. */
const BACKGROUND_SRC = '/images/soldier-landscape.webp';

/**
 * `locale` is intentionally not destructured: nothing in this section varies by
 * locale. See IMPOSSIBLE (d) and HONEST LIMIT 5 — the claim is tested, not
 * asserted.
 */
export function Why({ m }: WhyProps) {
  return (
    <section
      aria-labelledby={TITLE_ID}
      className="relative overflow-hidden px-6 py-[70px]"
    >
      <div className="absolute inset-0">
        <Image
          src={BACKGROUND_SRC}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-black/75" />
      </div>

      <div className="relative z-10 mx-auto max-w-[700px]">
        <h2
          id={TITLE_ID}
          className="mb-8 text-center text-3xl font-black text-white md:text-4xl"
        >
          {m.whyTitle}
        </h2>

        <ul className="my-6 mb-8 flex list-none flex-col gap-4 p-0">
          {m.whyReasons.map((reason, index) => (
            <li
              // The list is static and never reorders; an index key cannot
              // collide, where a duplicated reason string could.
              key={index}
              className="rounded-[10px] border-e-[3px] border-secondary bg-black/40 p-4 text-[0.95rem] text-gray-200"
            >
              {reason}
            </li>
          ))}
        </ul>

        <div className="mt-2 text-center">
          <TrackedLink
            href={FORM_HREF}
            event={ctaClick('why_book')}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-7 py-3.5 text-base font-bold text-secondary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary"
          >
            {m.whyCta}
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
