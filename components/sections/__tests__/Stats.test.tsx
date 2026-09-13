// ─────────────────────────────────────────────────────────────────────────────
// W4-05 STATS TEST — components/sections/__tests__/Stats.test.tsx
//
// INVARIANT     Every claim Stats.tsx makes in its header is checked here by an
//               assertion that can FAIL. The figures are compared as whole
//               strings (`textContent === '+1000'`), never as a substring match
//               that `1,000` would also satisfy; the tile count is driven from
//               four differently-sized fixtures rather than compared to a
//               literal; and the locale claim is a byte-for-byte `innerHTML`
//               comparison, not a comment.
//
// IMPOSSIBLE    A silent number formatter. Test 1 pins each figure to an exact
//               `textContent` AND asserts that `1000`, `1,000` and `57` are
//               absent from the document — so the three plausible "improvements"
//               (strip the sign, add a separator, localise) each fail loudly.
//               Also impossible: a green suite after the tile count is hardcoded
//               back to 4, after an empty `desc` starts emitting `<p></p>`, after
//               a `label` is dropped, or after a locale-conditional branch is
//               introduced.
//
// CLASS         INSTANCE, honestly. These tests close Stats.tsx, not the class
//               "no section formats a number" — twelve sibling sections were
//               written concurrently and nothing here constrains them. The
//               derivation for that class would be a repo-wide gate (an ESLint
//               rule banning `Intl.NumberFormat` in `components/sections/`), and
//               that file is outside this delegate's write-set. Owed to the seat.
//
// HONEST LIMIT  Four, stated plainly.
//   1. FIXTURES, NOT THE REAL CATALOGUE. These tests prove the COMPONENT is
//      faithful to whatever it is handed. They do not prove `messages/he.json`
//      still says `+1000`. That is deliberate: those figures are unconfirmed
//      (ledger OPEN 3) and pinning them here would make the customer's own
//      answer a red suite. The catalogue's shape is already proved by the zod
//      schema in `@/i18n/messages`, which is where it belongs.
//   2. NOTHING VARIES BY LOCALE, and test 5 says so by proving the two renders
//      are byte-identical. It therefore proves an ABSENCE. It cannot tell you
//      the section LOOKS right in a right-to-left page — direction comes from
//      the `dir` attribute on `<html>`, which is set by the layout and is not in
//      this component's tree at all. A visual RTL check is an e2e concern.
//   3. NO RENDERED-PIXEL CLAIM. jsdom computes no layout and loads no image, so
//      the background asset, the dark scrim, the grid columns and the contrast
//      of gold on black are all unverified here.
//   4. The `data-testid` on the `desc` paragraph is a TEST SEAM in shipped
//      markup. It is the honest cost of asserting "no element was rendered"
//      rather than "some text is absent": counting a marked element proves the
//      element's absence, whereas asserting on text alone would pass just as
//      happily if an empty `<p>` were emitted.
// ─────────────────────────────────────────────────────────────────────────────

import { render, within } from '@testing-library/react';

import { Stats } from '@/components/sections/Stats';
import type { Messages } from '@/i18n/messages';

type Stat = Messages['stats'][number];
type StatsMessages = Pick<Messages, 'statsTitle' | 'stats'>;

const TITLE = 'STATS-TITLE-SENTINEL';

/** The four figures as the catalogue holds them, verbatim. Opaque strings. */
const CATALOGUE_FIGURES = ['+1000', '+57', '100%', '∞'] as const;

function makeStat(num: string, label: string, desc: string): Stat {
  return { num, label, desc };
}

function makeMessages(stats: readonly Stat[]): StatsMessages {
  return { statsTitle: TITLE, stats: [...stats] };
}

/** n tiles with unique, ASCII-only sentinels and empty descriptions. */
function makeStatsOfLength(n: number): Stat[] {
  return Array.from({ length: n }, (_unused, i) => makeStat(`N-${i}`, `LABEL-${i}`, ''));
}

/** The real four-stat shape: real figures, sentinel labels, three empty descs. */
const FOUR_STATS: Stat[] = [
  makeStat(CATALOGUE_FIGURES[0], 'LABEL-ZERO', ''),
  makeStat(CATALOGUE_FIGURES[1], 'LABEL-ONE', 'DESC-ONE'),
  makeStat(CATALOGUE_FIGURES[2], 'LABEL-TWO', ''),
  makeStat(CATALOGUE_FIGURES[3], 'LABEL-THREE', ''),
];

describe('Stats', () => {
  // ── 1 ──────────────────────────────────────────────────────────────────────
  it('renders the title and every figure BYTE-EXACT, with no number formatting', () => {
    const { container } = render(<Stats m={makeMessages(FOUR_STATS)} locale="he" />);
    const scope = within(container);

    expect(scope.getByText(TITLE)).toBeInTheDocument();

    // Whole-string equality, not a substring match: `1,000` would not pass.
    for (const figure of CATALOGUE_FIGURES) {
      expect(scope.getByText(figure).textContent).toBe(figure);
    }

    // The three plausible "improvements" a well-meaning formatter would make.
    for (const mangled of ['1000', '1,000', '+1,000', '57', 'infinity']) {
      expect(scope.queryByText(mangled)).toBeNull();
    }

    for (const stat of FOUR_STATS) {
      expect(scope.getByText(stat.label)).toBeInTheDocument();
    }
  });

  // ── 2 ──────────────────────────────────────────────────────────────────────
  it('renders exactly as many tiles as the data has, for any length', () => {
    for (const length of [1, 2, 3, 5]) {
      const { container } = render(
        <Stats m={makeMessages(makeStatsOfLength(length))} locale="he" />,
      );
      expect(container.querySelectorAll('li')).toHaveLength(length);
    }
  });

  // ── 3 ──────────────────────────────────────────────────────────────────────
  it('renders NO element at all for a stat whose desc is the empty string', () => {
    const stats = [makeStat('X', 'LABEL-EMPTY', ''), makeStat('Y', 'LABEL-FULL', 'DESC-FULL')];
    const { container } = render(<Stats m={makeMessages(stats)} locale="he" />);
    const scope = within(container);

    const descs = scope.queryAllByTestId('stat-desc');
    expect(descs).toHaveLength(1);
    expect(descs.map((node) => node.textContent)).toEqual(['DESC-FULL']);

    // Structural proof that no empty `<p>` was emitted: the empty-desc tile has
    // two element children (figure, label); the populated one has three.
    const tiles = scope.getAllByRole('listitem');
    expect(tiles.map((tile) => tile.children.length)).toEqual([2, 3]);

    // And nothing empty was rendered anywhere inside the tiles.
    const paragraphs = Array.from(container.querySelectorAll('li p'));
    expect(paragraphs.map((node) => node.textContent)).toEqual([
      'X',
      'LABEL-EMPTY',
      'Y',
      'LABEL-FULL',
      'DESC-FULL',
    ]);
  });

  // ── 4 ──────────────────────────────────────────────────────────────────────
  it('fails if any label is dropped', () => {
    const { container } = render(<Stats m={makeMessages(FOUR_STATS)} locale="he" />);
    const scope = within(container);

    for (const stat of FOUR_STATS) {
      expect(scope.getByText(stat.label).textContent).toBe(stat.label);
    }

    // Structural backstop: one figure + one label per tile, plus the one desc.
    const paragraphs = container.querySelectorAll('li p');
    expect(paragraphs).toHaveLength(FOUR_STATS.length * 2 + 1);
  });

  // ── 5 ──────────────────────────────────────────────────────────────────────
  it('renders IDENTICALLY for he and en — nothing in this section varies by locale', () => {
    const m = makeMessages(FOUR_STATS);
    const he = render(<Stats m={m} locale="he" />);
    const en = render(<Stats m={m} locale="en" />);

    // The claim is an ABSENCE of locale branching, so it is proved by equality.
    // Direction is owned by the `dir` attribute on <html>, set by the layout.
    expect(en.container.innerHTML).toBe(he.container.innerHTML);
    expect(he.container.querySelector('[dir]')).toBeNull();
  });
});
