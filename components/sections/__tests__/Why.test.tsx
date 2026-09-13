// ─────────────────────────────────────────────────────────────────────────────
// W4-09 WHY TEST — components/sections/__tests__/Why.test.tsx
//
// INVARIANT     Every claim Why.tsx's header makes is checked here by an
//               assertion that CAN FAIL. The CTA's target is compared to
//               `anchor(SECTION_IDS.form)` AND to each of the other three site
//               anchors, so a link retargeted to the wrong real section fails
//               just as loudly as one pointing nowhere. The reason list is
//               compared as an ORDERED, WHOLE-STRING array — not a set of
//               substring probes — so a dropped, reordered or truncated reason
//               cannot pass. The count is driven from fixtures of four different
//               lengths; the literal 3 appears nowhere in this file.
//
// IMPOSSIBLE    Four regressions can no longer ship green:
//               (a) A CTA retargeted to `top`, `story` or `copyright`, or to any
//                   string that is not the form anchor (test 2).
//               (b) A silently dropped reason, or a list re-ordered by a future
//                   `.sort()` — test 4 pins the exact ordered contents, and
//                   test 3 pins the count to the DATA, not to 3.
//               (c) A backdrop that becomes informative (`alt` non-empty), that
//                   starts announcing itself (`aria-hidden` removed), that
//                   becomes `priority`, or that degrades into a CSS
//                   `background-image` — test 5 checks all four, including a
//                   sweep for a `background-image` on EVERY element in the tree.
//               (d) A Hebrew string literal, or a hand-written `#` href, entering
//                   either of this delegate's two files — test 7 reads both
//                   sources from disk and asserts on their bytes. This is the
//                   only test here that proves PROVENANCE rather than value.
//
// CLASS         INSTANCE, honestly, for (a) through (c): these close Why.tsx,
//               not the class "no section has a dead CTA". Twelve sibling
//               sections were written concurrently and nothing here constrains
//               any of them. The derivation for that class is a repo-wide grep
//               gate (W7), which is outside this delegate's write-set and is
//               owed to the seat. (d) is closed by DERIVATION for these two
//               files, because it reads the bytes rather than the behaviour.
//
// HONEST LIMIT  Four, stated plainly.
//   1. FIXTURES, NOT THE REAL CATALOGUE. These tests prove the COMPONENT is
//      faithful to whatever it is handed. They do NOT prove messages/he.json
//      still has three reasons, or that its CTA copy is what the customer
//      approved. The catalogue's shape is proved by the zod schema in
//      `@/i18n/messages`, which is where that belongs; its truth is proved by
//      nobody, here or anywhere in this repo.
//   2. THE ANCHOR IS PROVED TO MATCH, NOT TO ARRIVE. Test 2 proves the rendered
//      href EQUALS `anchor(SECTION_IDS.form)`. It cannot prove that some other
//      section actually renders `id="form"` on the page — that is a composition
//      fact, provable only where the page is assembled, and a broken booking
//      path would still need the form section to hold up its half of D-11.
//   3. NO RENDERED-PIXEL CLAIM. jsdom computes no layout and loads no image, so
//      the missing `/images/soldier-landscape.webp`, the dark scrim, the CTA's
//      contrast and the inline-end border on each reason card are all unverified
//      here. Test 5 proves the image ELEMENT's contract, never its file.
//   4. TEST 7 READS SOURCE, WHICH IS A DIFFERENT KIND OF EVIDENCE. It is a
//      lexical check, not a semantic one: it would not catch a hash assembled at
//      runtime from character codes. It is here because "the href came from
//      config and not from a literal" is a provenance claim, and rendering can
//      never distinguish a literal from a constant with the same value.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { render, within } from '@testing-library/react';

import { Why } from '@/components/sections/Why';
import { anchor, SECTION_IDS } from '@/config/site';
import type { Messages } from '@/i18n/messages';

type WhyMessages = Pick<Messages, 'whyTitle' | 'whyReasons' | 'whyCta'>;

const TITLE = 'WHY-TITLE-SENTINEL';
const CTA = 'WHY-CTA-SENTINEL';

/** Three sentinels, matching the catalogue's current length without asserting it. */
const REASONS: readonly string[] = [
  'REASON-SENTINEL-ZERO',
  'REASON-SENTINEL-ONE',
  'REASON-SENTINEL-TWO',
];

function makeMessages(reasons: readonly string[]): WhyMessages {
  return { whyTitle: TITLE, whyReasons: [...reasons], whyCta: CTA };
}

/** n reasons with unique, ASCII-only sentinels. */
function makeReasonsOfLength(n: number): string[] {
  return Array.from({ length: n }, (_unused, i) => `REASON-${i}`);
}

/** Narrowing without `!` and without a cast. */
function requireElement<T extends Element>(node: T | null, what: string): T {
  if (node === null) {
    throw new Error(`expected Why to render ${what}, but it rendered none`);
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

describe('Why', () => {
  // ── 1 ──────────────────────────────────────────────────────────────────────
  it('renders the title, every reason and the CTA copy', () => {
    const { container } = render(<Why m={makeMessages(REASONS)} locale="he" />);
    const scope = within(container);

    expect(scope.getByText(TITLE)).toBeInTheDocument();
    expect(scope.getByText(CTA)).toBeInTheDocument();

    for (const reason of REASONS) {
      // Whole-string equality: a truncated reason would not satisfy this.
      expect(scope.getByText(reason).textContent).toBe(reason);
    }
  });

  // ── 2 · THE CTA TEST · the booking path ────────────────────────────────────
  it('renders the CTA as a link whose href resolves to the FORM anchor', () => {
    const { container } = render(<Why m={makeMessages(REASONS)} locale="he" />);

    const link = within(container).getByRole('link', { name: CTA });
    const href = link.getAttribute('href');

    // It must be the form anchor, computed from config — not merely "an anchor".
    expect(href).toBe(anchor(SECTION_IDS.form));

    // And it must not be any of the other three live in-page targets (D-11).
    // A CTA retargeted to a real-but-wrong section is the failure mode that a
    // bare "href is truthy" assertion would sail straight past.
    for (const other of [SECTION_IDS.top, SECTION_IDS.story, SECTION_IDS.copyright]) {
      expect(href).not.toBe(anchor(other));
    }

    // No trailing-space / absolute-URL drift: it is an in-page fragment.
    expect(href).toMatch(/^#[a-z]+$/);

    // Exactly one link in the section: a second CTA would make "the" href
    // ambiguous and this test quietly partial.
    expect(container.querySelectorAll('a')).toHaveLength(1);
  });

  // ── 3 ──────────────────────────────────────────────────────────────────────
  it('renders exactly as many reasons as the data has, for any length', () => {
    for (const length of [0, 1, 2, 5]) {
      const { container } = render(
        <Why m={makeMessages(makeReasonsOfLength(length))} locale="he" />,
      );
      expect(container.querySelectorAll('li')).toHaveLength(length);
    }
  });

  // ── 4 ──────────────────────────────────────────────────────────────────────
  it('fails if any reason is silently dropped, reordered or truncated', () => {
    const { container } = render(<Why m={makeMessages(REASONS)} locale="he" />);

    const rendered = Array.from(container.querySelectorAll('li')).map(
      (item) => item.textContent,
    );

    // Ordered, whole-value equality against the input. A drop shortens it, a
    // reorder permutes it, a truncation changes a member — all three fail.
    expect(rendered).toEqual([...REASONS]);
  });

  // ── 5 ──────────────────────────────────────────────────────────────────────
  it('renders the backdrop as a decorative next/image, never a CSS background', () => {
    const { container } = render(<Why m={makeMessages(REASONS)} locale="he" />);

    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(1);

    const backdrop = requireElement(images[0] ?? null, 'a backdrop image');

    // Decorative: empty alt AND hidden from the accessibility tree.
    expect(backdrop).toHaveAttribute('alt', '');
    expect(backdrop.getAttribute('aria-hidden')).toBe('true');

    // Not `priority`: next/image expresses that as fetchpriority + eager.
    expect(backdrop.getAttribute('fetchpriority')).not.toBe('high');
    expect(backdrop.getAttribute('loading')).not.toBe('eager');

    // It is the W6 asset, and it is responsive.
    expect(backdrop.getAttribute('src')).toContain('soldier-landscape');
    expect(backdrop).toHaveAttribute('sizes');

    // D-32: no element in the tree carries a CSS background-image.
    for (const node of Array.from(container.querySelectorAll('*'))) {
      expect(node.getAttribute('style') ?? '').not.toContain('background-image');
    }
  });

  // ── 6 · locale invariance (C10 / D-30) ─────────────────────────────────────
  it('renders IDENTICALLY for he and en — nothing in this section varies by locale', () => {
    const m = makeMessages(REASONS);
    const he = render(<Why m={m} locale="he" />);
    const en = render(<Why m={m} locale="en" />);

    // The claim is an ABSENCE of locale branching, so it is proved by equality.
    // Direction is owned by the `dir` attribute on <html>, set by the layout.
    expect(en.container.innerHTML).toBe(he.container.innerHTML);
    expect(he.container.querySelector('[dir]')).toBeNull();
  });

  // ── 7 · provenance, at source level ────────────────────────────────────────
  it('contains no Hebrew codepoint and no hand-written hash href in either file', () => {
    const component = readSource('../Why.tsx');
    const testItself = readSource('./Why.test.tsx');

    // C4 / ledger D-13: zero Hebrew anywhere, comments included. Written as a
    // codepoint range rather than a character class so that this file can make
    // the assertion without itself containing a single Hebrew character.
    expect(hebrewCodepointsIn(component)).toEqual([]);
    expect(hebrewCodepointsIn(testItself)).toEqual([]);

    // C8: the component's only route to an in-page href is `anchor()`, so the
    // hash character has no business appearing in it at all.
    expect(component).not.toContain('#');

    // And the constant it must go through is actually imported there.
    expect(component).toContain('SECTION_IDS.form');
  });
});
