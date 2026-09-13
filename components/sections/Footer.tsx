// ─────────────────────────────────────────────────────────────────────────────
// W4-12 SECTION · components/sections/Footer.tsx — THE DEDICATION
//
// This section is not a footer in the ordinary sense. It NAMES THE DEAD: a
// rank and a full name, an age at death and the Hebrew date of the fall, and
// two friends who fell with him — three men altogether once the photograph's
// `alt` is counted. Every one of those characters arrived here from the
// customer's own build, extracted programmatically and verified leaf-by-leaf by
// an earlier delegate. This file's entire job is to put them on the page
// UNCHANGED and then get out of the way.
//
// INVARIANT     Every user-visible character in this file comes from the `m`
//               prop and is written to the DOM as ONE WHOLE catalogue value.
//               There is no template literal, no concatenation, no `.slice`,
//               `.split`, `.trim`, `.replace`, `.normalize`, `.join` or `.map`
//               applied to any of them — so no name, rank, age or date can be
//               assembled, abbreviated, re-punctuated or reordered in code.
//               In particular the catalogue's two different quotation marks
//               (a plain one in `footerFriends`, a gershayim in the photograph's
//               `alt`) reach the DOM exactly as the customer wrote them, because
//               nothing here inspects or rewrites a character. The two in-page
//               facts this file owns — the anchor it links to and the anchor it
//               IS — are the same constant from `@/config/site`, read once at
//               module scope; the contact address is `PUBLIC_EMAIL` from the
//               same place. The component is a pure synchronous function of its
//               props: same props in, same markup out — no I/O, no clock, no
//               module state, no catalogue read of its own.
//
// IMPOSSIBLE    Six things can no longer be CONSTRUCTED here:
//               (a) A MUTILATED MEMORIAL FACT. The six strings and the `alt` are
//                   each a bare `{m.…}` expression. Truncation, ellipsis,
//                   reordering of the words inside a value, and "normalising"
//                   the Hebrew quotation marks all require an operation on the
//                   string, and this file performs none — there is no method
//                   call on a message value anywhere in it. Its test proves this
//                   against the REAL catalogue, byte for byte, not against a
//                   fixture.
//               (b) A DEAD OR SELF-CONTRADICTING COPYRIGHT ANCHOR. The link's
//                   target and the paragraph's `id` are BOTH
//                   `SECTION_IDS.copyright` (ledger D-11). They are one fact
//                   with one home, so they cannot drift apart by a typo — and
//                   unlike a CTA that points at another section, both halves of
//                   this anchor live in this one file, so it is closed here and
//                   not merely "proved to match".
//               (c) AN INLINED CONTACT ADDRESS. The mail link is built at module
//                   scope from `PUBLIC_EMAIL`; the address itself appears
//                   nowhere in this file, and its test asserts that at source
//                   level. When the customer answers with the address they want
//                   published, it is one edit, in config/site.ts.
//               (d) A SECOND COPY OF THE CATALOGUE SHAPE. `FooterProps.m` is
//                   `Pick<Messages, …>` where `Messages` is `z.infer` of the zod
//                   schema in i18n/messages.ts, and the photograph's `alt` is
//                   read through `imageAlts`, a `strictObject` keyed by image
//                   basename — so a misspelled basename is a COMPILE error, not
//                   an `undefined` alt on a photograph of three dead men.
//               (e) A SELF-FETCHING SECTION. This file does not import the
//                   message accessor from `@/i18n/messages` — only the TYPE. It
//                   cannot read a locale it was not given, cannot disagree with
//                   the page's locale, and cannot become async. Its test asserts
//                   the accessor's name appears nowhere in this source.
//               (f) A CSS `background-image` (ledger D-32). The photograph is a
//                   `next/image` with `fill`, so it is optimised, srcset-ed and
//                   lazy — and, crucially, it is an `<img>` with a real `alt`,
//                   which a CSS background can never be. See HONEST LIMIT 2.
//
// CLASS         THIS INSTANCE for (a), (b), (c) and (f): nothing in this file
//               stops a sibling section from hand-writing a hash href, inlining
//               the address, or reaching for a CSS background. The repo-wide
//               closure of those is the W7 grep gate, and it is owed. (d) and
//               (e) are DERIVED and hold for every section that follows the same
//               two lines — a `Pick<Messages, …>` prop type is checked by the
//               compiler against the one schema, and a component with no message
//               import cannot read a message.
//
// HONEST LIMIT  Eight, stated plainly.
//   1. `/images/tank-friends.webp` DOES NOT EXIST ON DISK. Verified: zero
//      `.webp` files anywhere under public/ at the time of writing. The path is
//      the agreed contract with W6, who produces the asset. Until it lands this
//      renders a broken image at runtime — a VISIBLE failure, not a silent one —
//      and no test here can detect it, because jsdom loads no images. Creating
//      the file is outside this delegate's write-set and was not attempted.
//   2. THE PHOTOGRAPH IS INFORMATIVE, AND IT IS ALSO A BACKDROP. It sits behind
//      an 80%-black scrim, which is how the customer shipped it, yet its `alt`
//      NAMES THE THREE MEN IN IT — so it is NOT `alt=""` and NOT `aria-hidden`,
//      unlike every decorative backdrop elsewhere in this rebuild. A screen
//      reader announces the three names; a sighted visitor sees a darkened
//      photograph. That asymmetry is deliberate and is the customer's, not this
//      delegate's.
//   3. THE HEBREW `alt` IS SERVED ON THE ENGLISH PAGE TOO (ledger D-18). The
//      catalogue has no English counterpart for it, and inventing an English
//      description of a photograph of three fallen soldiers is forbidden
//      outright. A recorded limit is the honest answer; a fabricated one is not.
//      The same is true of the six strings themselves, four of which are proper
//      nouns and dates the catalogue serves from the source locale.
//   4. IT PROVES SHAPE, NEVER TRUTH. The compiler guarantees `m.footerFriends`
//      exists and is a string, and its test guarantees this component does not
//      alter it. NOTHING here — and nothing anywhere in this repo — proves the
//      names, the rank, the age or the Hebrew date are the ones the family
//      approved. That verification happened once, upstream, against the
//      customer's build; this file's whole contribution is not to be the step
//      that changes one.
//   5. NO RENDERED-PIXEL CLAIM. jsdom computes no layout and loads no image, so
//      the scrim's opacity, and therefore whether the three names are LEGIBLE
//      over the photograph, is unverified here. That is a contrast question, it
//      matters more on this section than on any other, and it is owed to a
//      visual pass.
//   6. THE `mailto:` SCHEME PREFIX LIVES IN THIS FILE. The address does not —
//      it is `PUBLIC_EMAIL` — but the two characters that turn it into a link
//      are assembled here, and the form section will need the same two. The
//      right home is a `mailtoLink()` helper in config/site.ts, beside
//      `whatsappLink()`, which is outside this delegate's write-set. Reported,
//      not written.
//   7. THE ORNAMENT IS A LITERAL. The star above the dedication is one
//      non-linguistic glyph, hardcoded and `aria-hidden`, so it is announced by
//      nothing and translated by nothing. It is the one user-visible character
//      here that did not come from the catalogue; it is not copy, and giving it
//      a message key would put a decoration in a memorial catalogue.
//   8. NOTHING IN THIS COMPONENT VARIES BY LOCALE. `locale` is accepted so the
//      composition unit can pass one uniform prop set to every section, and it
//      is deliberately not read: text direction has exactly one home
//      (LOCALE_DIRECTION in i18n/routing.ts, applied to `<html dir>` by the
//      shell). The test asserts that INVARIANCE rather than a difference that
//      does not exist (C10 / ledger D-30).
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image';

import { anchor, PUBLIC_EMAIL, SECTION_IDS, type Locale } from '@/config/site';
import type { Messages } from '@/i18n/messages';

type FooterProps = {
  m: Pick<
    Messages,
    | 'footerMemorial'
    | 'footerAge'
    | 'footerFriends'
    | 'footerContact'
    | 'copyright'
    | 'copyrightLink'
    | 'imageAlts'
  >;
  /** Accepted for a uniform section contract; not read here. HONEST LIMIT 8. */
  locale: Locale;
};

/**
 * The copyright anchor, both halves. The link below points at it and the
 * paragraph below carries it, and they are the same constant — see IMPOSSIBLE
 * (b). Neither a hash literal nor the word as a string appears in this file.
 */
const COPYRIGHT_ID = SECTION_IDS.copyright;
const COPYRIGHT_HREF = anchor(COPYRIGHT_ID);

/**
 * Built from `@/config/site`, never from an inlined address — see IMPOSSIBLE (c)
 * and HONEST LIMIT 6. The scheme prefix is the only part written here.
 */
const CONTACT_HREF = `mailto:${PUBLIC_EMAIL}`;

/** The W6 contract. The file does not exist yet — see HONEST LIMIT 1. */
const PHOTOGRAPH_SRC = '/images/tank-friends.webp';

/**
 * The image basename is the key into `imageAlts` because it is already the
 * contract between this section and its asset. Spelled once, here.
 */
const PHOTOGRAPH_ALT_KEY = 'tank-friends' as const;

/** Decorative ornament, announced by nothing — see HONEST LIMIT 7. */
const ORNAMENT = '★';

/**
 * `locale` is intentionally not destructured: nothing in this section varies by
 * locale. See IMPOSSIBLE (e) and HONEST LIMIT 8 — the claim is tested, not
 * merely asserted.
 */
export function Footer({ m }: FooterProps) {
  return (
    <footer className="relative overflow-hidden px-6 py-12 text-center">
      <div className="absolute inset-0">
        <Image
          src={PHOTOGRAPH_SRC}
          // Informative, not decorative: this alt names the three men in the
          // photograph. Written whole, never assembled. HONEST LIMIT 2.
          alt={m.imageAlts[PHOTOGRAPH_ALT_KEY]}
          fill
          sizes="100vw"
          className="object-cover object-top"
        />
        <div aria-hidden className="absolute inset-0 bg-black/80" />
      </div>

      <div className="relative z-10">
        <span aria-hidden className="mb-4 block text-3xl text-gold">
          {ORNAMENT}
        </span>

        <h2 className="mb-2.5 text-xl font-extrabold text-white">
          {m.footerMemorial}
        </h2>
        <p className="mb-1 text-sm text-gray-300">{m.footerAge}</p>
        <p className="text-sm text-gray-300">{m.footerFriends}</p>

        <div className="mt-6 border-t border-white/20 pt-6">
          <p className="mb-1 text-sm text-gray-400">{m.footerContact}</p>
          <a href={CONTACT_HREF} className="text-sm text-secondary hover:underline">
            {PUBLIC_EMAIL}
          </a>

          <div className="mt-4">
            <a
              href={COPYRIGHT_HREF}
              className="text-sm font-semibold text-gold hover:underline"
            >
              {m.copyrightLink}
            </a>
            <p
              id={COPYRIGHT_ID}
              className="mx-auto mt-2 max-w-xl text-xs text-gray-400"
            >
              {m.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
