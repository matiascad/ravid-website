// ─────────────────────────────────────────────────────────────────────────────
// W4-12 FOOTER TEST — components/sections/__tests__/Footer.test.tsx
//
// INVARIANT     Every claim Footer.tsx's header makes is checked here by an
//               assertion that CAN FAIL. Two kinds of evidence are used and kept
//               apart on purpose: ASCII sentinel fixtures prove the component is
//               faithful to whatever it is handed, and ONE test renders the REAL
//               `he` catalogue and compares the DOM to it BYTE FOR BYTE. The
//               second is the one that matters here, because the values are a
//               rank, a full name, an age, a Hebrew date and three men's names,
//               and a fixture cannot prove that the catalogue's own punctuation
//               survived the render. Every comparison against a memorial value
//               is WHOLE-STRING equality or an exact-length check — never a
//               substring probe, which would pass while a name was truncated.
//
// IMPOSSIBLE    Six regressions can no longer ship green:
//               (a) A TRUNCATED, ELLIPSIZED, RE-PUNCTUATED OR NORMALISED
//                   memorial string. Test 2 pins each of the six rendered values
//                   to the real catalogue value by `toBe`, and pins the
//                   photograph's `alt` by `toBe` AND by length — so a
//                   `.slice()`, a `.normalize()` that rewrites the gershayim, or
//                   a `.replace()` on the quotation marks all fail loudly.
//               (b) A DROPPED OR REORDERED DEDICATION LINE. Test 4 pins the
//                   three dedication values to distinct elements AND to their
//                   order of appearance. A `footerFriends` lost in a layout
//                   tidy-up — the likeliest loss on this page and the hardest to
//                   notice — turns test 4 red on two separate assertions.
//               (c) A BROKEN COPYRIGHT ANCHOR. Test 3 proves the id resolves via
//                   `document.getElementById`, that it is UNIQUE in the
//                   document, and that the link's href equals
//                   `anchor(SECTION_IDS.copyright)` and none of the other three
//                   site anchors.
//               (d) AN INLINED CONTACT ADDRESS. Test 5 proves the href equals
//                   the address from `@/config/site`, and test 8 proves the
//                   address does not appear in the component's SOURCE at all —
//                   a value check alone cannot tell a constant from a literal
//                   that happens to match.
//               (e) A PHOTOGRAPH THAT GOES SILENT. Test 6 fails if the `alt`
//                   empties, if `aria-hidden` appears, if it becomes `priority`,
//                   or if it degrades into a CSS `background-image` (D-32) —
//                   this image is INFORMATIVE and an empty alt would delete
//                   three names from the accessibility tree.
//               (f) A HEBREW STRING LITERAL entering either of this delegate's
//                   two files (C4 / D-13). Test 8 reads both sources from disk
//                   and asserts on their bytes.
//
// CLASS         INSTANCE, honestly, for (a) through (e): these close Footer.tsx,
//               not the class "no section mutilates a catalogue value". Twelve
//               sibling sections were written concurrently and nothing here
//               constrains any of them; the repo-wide derivation is the W7 grep
//               gate, which is outside this delegate's write-set and is owed.
//               (f) is closed by DERIVATION for these two files, because it
//               reads the bytes rather than the behaviour.
//
// HONEST LIMIT  Five, stated plainly.
//   1. IT PROVES THE COMPONENT, NOT THE CATALOGUE. Test 2 proves the DOM equals
//      `messages/he.json`. It does NOT prove `messages/he.json` equals what the
//      family approved — that verification happened once, upstream, against the
//      customer's build. If a future edit changes a name in the catalogue, this
//      suite stays green while the page starts lying. The only guard against
//      that is that nobody edits those six leaves.
//   2. NO RENDERED-PIXEL CLAIM. jsdom computes no layout and loads no image, so
//      the missing `/images/tank-friends.webp`, the 80%-black scrim, and above
//      all whether the three names are LEGIBLE over the photograph are
//      unverified here. Test 6 proves the image ELEMENT's contract, never its
//      file and never its contrast.
//   3. THE ANCHOR IS PROVED TO EXIST, NOT TO BE REACHED. Test 3 proves the id is
//      in the document and that the link targets it. It cannot prove a visitor's
//      browser scrolls anywhere, nor that a nav link elsewhere on the page
//      spells the same anchor — that is a composition fact, provable only where
//      the page is assembled.
//   4. TEST 8 READS SOURCE, WHICH IS A DIFFERENT KIND OF EVIDENCE. It is a
//      lexical check, not a semantic one: it would not catch an address
//      assembled at runtime from character codes. It is here because "this value
//      came from config and not from a literal" is a provenance claim, and
//      rendering can never distinguish a literal from a constant of equal value.
//   5. LOCALE INVARIANCE IS PROVED FOR THE MARKUP, NOT FOR THE COPY. Test 7
//      proves the component branches on nothing; the English page still shows
//      Hebrew proper nouns and a Hebrew `alt`, which is a recorded catalogue
//      limit (D-18), not a defect this test could or should hide.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { render, within } from '@testing-library/react';

import { Footer } from '@/components/sections/Footer';
import { anchor, PUBLIC_EMAIL, SECTION_IDS } from '@/config/site';
import { getMessages, type Messages } from '@/i18n/messages';

type FooterMessages = Pick<
  Messages,
  | 'footerMemorial'
  | 'footerAge'
  | 'footerFriends'
  | 'footerContact'
  | 'copyright'
  | 'copyrightLink'
  | 'imageAlts'
>;

/** The basename this section is contracted to. Spelled once, as in the component. */
const ALT_KEY = 'tank-friends' as const;

const MEMORIAL = 'MEMORIAL-SENTINEL';
const AGE = 'AGE-SENTINEL';
const FRIENDS = 'FRIENDS-SENTINEL';
const CONTACT = 'CONTACT-SENTINEL';
const COPYRIGHT = 'COPYRIGHT-SENTINEL';
const COPYRIGHT_LINK = 'COPYRIGHT-LINK-SENTINEL';
const ALT = 'TANK-FRIENDS-ALT-SENTINEL';

/** Every basename the catalogue schema requires, so the fixture is type-complete. */
const ALTS: Messages['imageAlts'] = {
  'tuval-hero': 'ALT-HERO',
  'helmet-bird': 'ALT-HELMET-BIRD',
  'soldier-landscape': 'ALT-SOLDIER-LANDSCAPE',
  'lecture-soldiers': 'ALT-LECTURE-SOLDIERS',
  'israel-flag': 'ALT-ISRAEL-FLAG',
  [ALT_KEY]: ALT,
};

function makeMessages(): FooterMessages {
  return {
    footerMemorial: MEMORIAL,
    footerAge: AGE,
    footerFriends: FRIENDS,
    footerContact: CONTACT,
    copyright: COPYRIGHT,
    copyrightLink: COPYRIGHT_LINK,
    imageAlts: ALTS,
  };
}

/** Narrowing without `!` and without a cast. */
function requireElement<T extends Element>(node: T | null, what: string): T {
  if (node === null) {
    throw new Error(`expected Footer to render ${what}, but it rendered none`);
  }
  return node;
}

/**
 * Every codepoint in the Hebrew block, as numbers. Returning the offenders
 * rather than a boolean makes a failure name the character it found. The range
 * is written numerically on purpose: a character class would put Hebrew into
 * this very file, which is the thing being forbidden.
 */
const HEBREW_FIRST = 0x0590;
const HEBREW_LAST = 0x05ff;

function hebrewCodepointsIn(source: string): number[] {
  const found: number[] = [];
  for (const character of source) {
    const code = character.codePointAt(0) ?? 0;
    if (code >= HEBREW_FIRST && code <= HEBREW_LAST) {
      found.push(code);
    }
  }
  return found;
}

function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}

/**
 * Assembled rather than written, so that this file does not itself contain the
 * directive it forbids — the same reasoning as the Hebrew range above.
 */
const CLIENT_DIRECTIVE = ['use', 'client'].join(' ');

describe('Footer', () => {
  // ── 1 ──────────────────────────────────────────────────────────────────────
  it('renders all six catalogue strings, each whole and unmodified', () => {
    const { container } = render(<Footer m={makeMessages()} locale="he" />);
    const scope = within(container);

    for (const value of [MEMORIAL, AGE, FRIENDS, CONTACT, COPYRIGHT, COPYRIGHT_LINK]) {
      // Whole-string equality, not `toBeInTheDocument`: a truncated or
      // re-punctuated value would still be "in the document".
      expect(scope.getByText(value).textContent).toBe(value);
    }
  });

  // ── 2 · THE DEDICATION TEST · the real catalogue, byte for byte ────────────
  it('renders the REAL catalogue values byte-identically, including the alt', () => {
    const real = getMessages('he');
    const { container } = render(<Footer m={real} locale="he" />);
    const scope = within(container);

    // The six strings, each pinned to the catalogue leaf it came from. `toBe`
    // on the element's whole textContent: an ellipsis, a dropped word, a
    // normalised quotation mark or a rewritten date all fail here.
    const pinned: ReadonlyArray<readonly [string, string]> = [
      ['footerMemorial', real.footerMemorial],
      ['footerAge', real.footerAge],
      ['footerFriends', real.footerFriends],
      ['footerContact', real.footerContact],
      ['copyright', real.copyright],
      ['copyrightLink', real.copyrightLink],
    ];

    for (const [key, value] of pinned) {
      const node = scope.queryByText(value);
      if (node === null) {
        throw new Error(`Footer did not render the catalogue value for ${key} whole`);
      }
      expect(node.textContent).toBe(value);
    }

    // The photograph's alt names three men. Byte equality with the catalogue,
    // plus an explicit length check, because a substring match would pass while
    // one of the three names was cut off.
    const image = requireElement(container.querySelector('img'), 'the photograph');
    const expectedAlt = real.imageAlts[ALT_KEY];
    const renderedAlt = image.getAttribute('alt');

    expect(renderedAlt).toBe(expectedAlt);
    expect(renderedAlt?.length).toBe(expectedAlt.length);
    expect(expectedAlt.length).toBeGreaterThan(0);
  });

  // ── 3 · THE ANCHOR CONTRACT (ledger D-11) ──────────────────────────────────
  it('carries a unique copyright anchor and links to it from config', () => {
    const { container } = render(<Footer m={makeMessages()} locale="he" />);

    // The id is a real, resolvable target in the document, not just an attribute.
    const anchored = requireElement(
      document.getElementById(SECTION_IDS.copyright),
      'an element carrying the copyright id',
    );
    expect(anchored.textContent).toBe(COPYRIGHT);

    // Unique: a duplicated id silently breaks the scroll target.
    expect(document.querySelectorAll(`[id="${SECTION_IDS.copyright}"]`)).toHaveLength(1);

    const link = within(container).getByRole('link', { name: COPYRIGHT_LINK });
    const href = link.getAttribute('href');

    expect(href).toBe(anchor(SECTION_IDS.copyright));

    // And not a real-but-wrong target, which "href is truthy" would sail past.
    for (const other of [SECTION_IDS.top, SECTION_IDS.story, SECTION_IDS.form]) {
      expect(href).not.toBe(anchor(other));
    }
  });

  // ── 4 · THE FRIENDS TEST · the likeliest silent loss on this page ──────────
  it('fails if the dedication loses or reorders a line', () => {
    const { container } = render(<Footer m={makeMessages()} locale="he" />);
    const footer = requireElement(container.querySelector('footer'), 'a footer element');

    // Each dedication line is its own element with exactly that text. If a
    // layout tidy-up merges or drops `footerFriends`, this throws.
    for (const value of [MEMORIAL, AGE, FRIENDS]) {
      expect(within(footer).getByText(value).textContent).toBe(value);
    }

    // ORDER, from the rendered text: name, then age and date, then the friends
    // who fell with him. A reorder permutes these indices; a drop makes one -1.
    const text = footer.textContent ?? '';
    const memorialAt = text.indexOf(MEMORIAL);
    const ageAt = text.indexOf(AGE);
    const friendsAt = text.indexOf(FRIENDS);

    expect(memorialAt).toBeGreaterThanOrEqual(0);
    expect(ageAt).toBeGreaterThan(memorialAt);
    expect(friendsAt).toBeGreaterThan(ageAt);
  });

  // ── 5 · the contact link comes from config ─────────────────────────────────
  it('builds the contact link from @/config/site, never from a literal', () => {
    const { container } = render(<Footer m={makeMessages()} locale="he" />);
    const scope = within(container);

    const link = scope.getByRole('link', { name: PUBLIC_EMAIL });
    expect(link.getAttribute('href')).toBe(`mailto:${PUBLIC_EMAIL}`);

    // Exactly two links: contact and copyright. A third would make "the" link
    // in these assertions ambiguous and this test quietly partial.
    expect(container.querySelectorAll('a')).toHaveLength(2);
  });

  // ── 6 · the photograph is INFORMATIVE, and is a next/image ─────────────────
  it('renders the photograph as an informative next/image, never a CSS background', () => {
    const { container } = render(<Footer m={makeMessages()} locale="he" />);

    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(1);

    const photograph = requireElement(images[0] ?? null, 'the photograph');

    // Informative: a real alt, from the catalogue, and NOT hidden from the
    // accessibility tree — an empty alt here would delete three names.
    expect(photograph).toHaveAttribute('alt', ALT);
    expect(photograph.getAttribute('aria-hidden')).not.toBe('true');

    // Not `priority`: next/image expresses that as fetchpriority + eager.
    expect(photograph.getAttribute('fetchpriority')).not.toBe('high');
    expect(photograph.getAttribute('loading')).not.toBe('eager');

    // It is the W6 asset, and it is responsive.
    expect(photograph.getAttribute('src')).toContain(ALT_KEY);
    expect(photograph).toHaveAttribute('sizes');

    // D-32: no element in the tree carries a CSS background-image.
    for (const node of Array.from(container.querySelectorAll('*'))) {
      expect(node.getAttribute('style') ?? '').not.toContain('background-image');
    }
  });

  // ── 7 · locale invariance (C10 / D-30) ─────────────────────────────────────
  it('renders IDENTICALLY for he and en — nothing in this section varies by locale', () => {
    const m = makeMessages();
    const he = render(<Footer m={m} locale="he" />);
    const en = render(<Footer m={m} locale="en" />);

    // The claim is an ABSENCE of locale branching, so it is proved by equality.
    // Direction is owned by the `dir` attribute on <html>, set by the layout.
    expect(en.container.innerHTML).toBe(he.container.innerHTML);
    expect(he.container.querySelector('[dir]')).toBeNull();
  });

  // ── 8 · provenance, at source level ────────────────────────────────────────
  it('contains no Hebrew, no inlined address and no hand-written anchor', () => {
    const component = readSource('../Footer.tsx');
    const testItself = readSource('./Footer.test.tsx');

    // C4 / ledger D-13: zero Hebrew anywhere, comments included.
    expect(hebrewCodepointsIn(component)).toEqual([]);
    expect(hebrewCodepointsIn(testItself)).toEqual([]);

    // C8: the address is a one-edit item in config/site.ts and must not have a
    // second home here.
    expect(component).not.toContain(PUBLIC_EMAIL);
    expect(component).toContain('PUBLIC_EMAIL');

    // C8 / D-11: the only route to an in-page href is `anchor()`, so the hash
    // character has no business appearing in the component at all.
    expect(component).not.toContain('#');
    expect(component).toContain('SECTION_IDS.copyright');

    // C3: server by default. C7 / D-31: one named export, no default.
    expect(component).not.toContain(CLIENT_DIRECTIVE);
    expect(component).not.toContain('export default');
    expect(component).toContain('export function Footer');

    // C2: the section does not read the catalogue itself.
    expect(component).not.toContain('getMessages');
  });
});
