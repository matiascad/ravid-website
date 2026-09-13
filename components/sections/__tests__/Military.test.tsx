// ─────────────────────────────────────────────────────────────────────────────
// W4-03 · components/sections/__tests__/Military.test.tsx
//
// WHAT THIS FILE IS FOR. Military.tsx renders the heaviest memorial facts on the
// site — the brigade, the battalion, the posthumous rank, the date and theatre of
// the battle, his age, and the names of the two friends who fell beside him. The
// failure this file is built to catch is not "the section throws"; it is "the
// section renders, and one fact is quietly missing." A card grid loses a `desc`
// silently, a hardcoded three-column layout drops a fourth card silently, and
// both look fine in a screenshot.
//
// INVARIANT   Every expected string in this file comes from the CATALOGUE at run
//             time (`getMessages`) or from a fixture declared here in ASCII. No
//             Hebrew literal is typed into this file, so no assertion can pass by
//             agreeing with a copy of the text that this file made — there is one
//             source of truth for the prose and the test reads it.
// IMPOSSIBLE  A green run on a component that hardcodes the card count, or that
//             renders `title` without `desc`. Both are asserted over a DENOMINATOR
//             taken from the data (`cards.length`, and every `li` in the DOM),
//             not over a number written here.
// CLASS       Derivation: assertions are quantified over the data, never over the
//             instance. The same test file is correct if `militaryCards` grows.
// HONEST LIMIT  Four.
//   1. It proves the strings REACH THE DOM. It cannot prove they are the right
//      strings — that is the catalogue's own 251/251 leaf verification, upstream.
//   2. It proves no image is `priority` by its DOM footprint (`fetchpriority` /
//      `loading`). If a future next/image stops expressing `priority` that way,
//      this check goes quiet rather than red.
//   3. It renders in jsdom. Nothing here proves the four .webp files exist, that
//      any of them loads, or that the layout is legible at any width.
//   4. The locale test proves INVARIANCE, which is a weaker claim than a
//      difference: it fails if someone adds locale-conditional markup, and that
//      is exactly what it is for.
// ─────────────────────────────────────────────────────────────────────────────

import { render, screen } from '@testing-library/react'

import { Military, type MilitaryProps } from '@/components/sections/Military'
import { LOCALES } from '@/config/site'
import { getMessages } from '@/i18n/messages'

type MilitaryMessages = MilitaryProps['m']

/** The real catalogue. Never a local copy of the prose. */
function catalogue(locale: (typeof LOCALES)[number]): MilitaryMessages {
  return getMessages(locale)
}

/**
 * An ASCII fixture of ARBITRARY length. Its only job is to let the count
 * assertion be driven by the data instead of by the number 3.
 */
function fixture(cardCount: number): MilitaryMessages {
  return {
    militaryTitle: 'FIXTURE TITLE',
    militaryCards: Array.from({ length: cardCount }, (_unused, i) => ({
      title: `FIXTURE CARD TITLE ${String(i)}`,
      desc: `FIXTURE CARD DESC ${String(i)}`,
    })),
    battleTitle: 'FIXTURE BATTLE TITLE',
    battleP1: 'FIXTURE BATTLE P1',
    battleP2: 'FIXTURE BATTLE P2',
    battleP3: 'FIXTURE BATTLE P3',
  }
}

describe('Military', () => {
  // ── 1 · every memorial string reaches the DOM ──────────────────────────────
  it('renders the title, every card title AND desc, and all four battle strings', () => {
    const m = catalogue('he')
    render(<Military m={m} locale="he" />)

    // Denominator, stated before the verdict.
    expect(m.militaryCards.length).toBeGreaterThan(0)

    expect(screen.getByText(m.militaryTitle)).toBeInTheDocument()

    for (const card of m.militaryCards) {
      expect(screen.getByText(card.title)).toBeInTheDocument()
      expect(screen.getByText(card.desc)).toBeInTheDocument()
    }

    expect(screen.getByText(m.battleTitle)).toBeInTheDocument()
    expect(screen.getByText(m.battleP1)).toBeInTheDocument()
    expect(screen.getByText(m.battleP2)).toBeInTheDocument()
    expect(screen.getByText(m.battleP3)).toBeInTheDocument()
  })

  // ── 2 · the count follows the data, not the layout ─────────────────────────
  // Driven at lengths 1, 5 and 7 — none of them 3 — so a component that renders
  // a fixed three-card grid cannot pass this.
  it.each([1, 5, 7])('renders exactly %i cards for a %i-length array', (n) => {
    const m = fixture(n)
    render(<Military m={m} locale="he" />)

    const cards = screen.getAllByRole('listitem')
    expect(cards).toHaveLength(m.militaryCards.length)
    expect(cards).toHaveLength(n)
  })

  // ── 3 · images: alt present, informative alts non-empty, none is `priority` ─
  it('renders images with an alt attribute and no priority', () => {
    const m = catalogue('he')
    const { container } = render(<Military m={m} locale="he" />)

    // Full denominator: querySelectorAll, not getAllByRole — an image with
    // alt="" has role `presentation` and would be invisible to a role query.
    const images = Array.from(container.querySelectorAll('img'))
    expect(images.length).toBeGreaterThanOrEqual(m.militaryCards.length)

    for (const img of images) {
      expect(img).toHaveAttribute('alt')
      expect(img).toHaveAttribute('sizes')
      // `priority` expresses itself as fetchpriority=high + loading=eager.
      expect(img.getAttribute('fetchpriority')).not.toBe('high')
      expect(img.getAttribute('loading')).not.toBe('eager')
    }

    // The INFORMATIVE images — one per card — carry the card's own title.
    for (const card of m.militaryCards) {
      const informative = images.filter((img) => img.alt === card.title)
      expect(informative.length).toBeGreaterThan(0)
      for (const img of informative) expect(img.alt).not.toBe('')
    }
  })

  // ── 4 · the silent regression: a card rendered without its `desc` ──────────
  it('renders every card as one element containing BOTH its title and its desc', () => {
    const m = catalogue('he')
    render(<Military m={m} locale="he" />)

    const cards = screen.getAllByRole('listitem')
    expect(cards).toHaveLength(m.militaryCards.length)

    m.militaryCards.forEach((card, index) => {
      const node = cards[index]
      expect(node).toBeDefined()
      const text = node?.textContent ?? ''
      expect(text).toContain(card.title)
      expect(text).toContain(card.desc)
    })
  })

  // ── 5 · the locale claim, tested rather than asserted ──────────────────────
  // MEASURED: nothing in this component varies by `locale`. lang/dir live on
  // <html> (ledger D-5) and direction is carried by logical CSS. So the honest
  // test is INVARIANCE — it goes red the moment someone adds a locale branch.
  it('renders identical markup for every locale when given the same messages', () => {
    const m = fixture(4)

    const rendered = LOCALES.map((locale) => {
      const { container } = render(<Military m={m} locale={locale} />)
      return container.innerHTML
    })

    expect(LOCALES.length).toBeGreaterThan(1)
    const [first] = rendered
    expect(first).toBeDefined()
    for (const html of rendered) expect(html).toBe(first)
  })

  // The locale-dependent content arrives through `m`, and it really is different:
  // this is the difference that test 5 shows is NOT produced by the prop.
  it('renders different text for he and en because the catalogue differs', () => {
    const he = catalogue('he')
    const en = catalogue('en')

    expect(en.militaryTitle).not.toBe(he.militaryTitle)
    expect(en.militaryCards).toHaveLength(he.militaryCards.length)

    render(<Military m={en} locale="en" />)
    expect(screen.getByText(en.militaryTitle)).toBeInTheDocument()
    expect(screen.queryByText(he.militaryTitle)).toBeNull()
  })
})
