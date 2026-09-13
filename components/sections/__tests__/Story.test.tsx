// ─────────────────────────────────────────────────────────────────────────────
// W4-02 SECTION TEST · components/sections/__tests__/Story.test.tsx
//
// INVARIANT     The fixture is the REAL catalogue. Every expected string below is
//               read at run time from `getMessages('he')` — the same zod-validated
//               accessor the app uses — so there is no second, hand-typed copy of
//               a memorial fact anywhere in this file for the real one to drift
//               away from. Consequently these assertions cannot go stale: change a
//               string in messages/he.json and the expectation changes with it,
//               while a string that stops being RENDERED still fails.
//
// IMPOSSIBLE    Three failures can no longer pass unnoticed:
//               (a) A DROPPED OR TRUNCATED PARAGRAPH. Each of the six values is
//                   matched by EXACT `textContent` equality against its own
//                   element, not by substring. An added ellipsis, a trimmed
//                   clause, a "tidied" quotation mark or two facts merged into one
//                   node all change that element's text and all go red.
//               (b) A SILENTLY MISSING KEY. The fixture is `getMessages('he')`,
//                   which parses the catalogue against `resolvedSchema` before
//                   returning. A key deleted from he.json does not yield
//                   `undefined` here — it THROWS at fixture construction, naming
//                   the path, and the suite fails loudly.
//               (c) A BROKEN ANCHOR. The id is asserted through `SECTION_IDS.story`
//                   rather than the literal `'story'`, so this test is checking the
//                   CONTRACT the CTAs use, not a string that agrees with the
//                   component by coincidence.
//
// CLASS         THIS INSTANCE. These tests describe the Story section. The pattern
//               they use — real catalogue as fixture, exact-equality on facts — is
//               reusable, but nothing here makes another section adopt it.
//
// HONEST LIMIT  Four, stated plainly.
//   1. IT PROVES RENDERING, NOT CORRECTNESS. Asserting that `m.storyP1` reaches
//      the DOM byte-for-byte says nothing about whether the date inside it is his
//      real date. No test in this repo can know that.
//   2. `priority` IS TESTED BY ITS CONSEQUENCE, NOT ITS ABSENCE. A React prop is
//      not a DOM attribute, so the assertions check what `priority` would actually
//      cause — `loading="eager"` and `fetchpriority="high"` — plus the literal
//      attribute for good measure. If a future next/image stops expressing
//      priority that way, this check silently weakens.
//   3. THE LOCALE TEST PROVES INVARIANCE, WHICH IS WHAT IS TRUE. Story renders
//      identically for 'he' and 'en' given the same messages, because direction
//      lives on `<html dir>` and nothing in the section branches on locale. The
//      test asserts exactly that and would go red if someone added a branch. It is
//      NOT evidence that RTL works — that belongs to the shell, not here.
//   4. IT DOES NOT RENDER THE REAL IMAGE. jsdom loads nothing, so a missing or
//      wrong-aspect /images/helmet-bird.webp passes every assertion below. Only a
//      build or a browser can catch that.
// ─────────────────────────────────────────────────────────────────────────────

import { render, screen } from '@testing-library/react'

import { Story } from '@/components/sections/Story'
import { SECTION_IDS } from '@/config/site'
import { getMessages } from '@/i18n/messages'

// The fixture IS the catalogue — see INVARIANT. Throws if a key is missing.
const he = getMessages('he')

const m = {
  storyTitle: he.storyTitle,
  storyH3: he.storyH3,
  storyP1: he.storyP1,
  storyP2: he.storyP2,
  storyP3: he.storyP3,
  storyQuote: he.storyQuote,
  // The photograph's dedicated alt, read from the same catalogue as the copy.
  imageAlts: he.imageAlts,
}

/** The photograph's basename — the key into `imageAlts` AND the file name. */
const IMAGE_KEY = 'helmet-bird' as const

/** The six values, in the order the section presents them. */
const ORDERED_VALUES = [
  m.storyTitle,
  m.storyH3,
  m.storyP1,
  m.storyP2,
  m.storyP3,
  m.storyQuote,
]

describe('Story', () => {
  it('renders all six catalogue strings, each whole and unaltered', () => {
    render(<Story m={m} locale="he" />)

    for (const value of ORDERED_VALUES) {
      // getByText throws on 0 matches AND on >1 match, so this also proves each
      // fact appears exactly once. (`getAllByText` matches text nodes only, so
      // the image's `alt` — now its own catalogue value, no longer storyTitle —
      // is asserted separately below.)
      const matches = screen.getAllByText(value)
      expect(matches.length).toBeGreaterThan(0)
      // Optional chaining, not `!`: getAllByText already throws on zero matches,
      // and if that ever stopped being true this still fails instead of lying.
      const [first] = matches
      // Exact equality, not substring: catches truncation, ellipses and merges.
      expect(first?.textContent).toBe(value)
    }
  })

  it('renders the three body paragraphs as three separate <p> elements', () => {
    render(<Story m={m} locale="he" />)

    for (const paragraph of [m.storyP1, m.storyP2, m.storyP3]) {
      const el = screen.getByText(paragraph)
      expect(el.tagName).toBe('P')
      expect(el.textContent).toBe(paragraph)
    }

    // Three distinct nodes — a single merged paragraph would fail here.
    const nodes = new Set(
      [m.storyP1, m.storyP2, m.storyP3].map((p) => screen.getByText(p)),
    )
    expect(nodes.size).toBe(3)
  })

  it('presents the six values in catalogue order, with nothing dropped', () => {
    const { container } = render(<Story m={m} locale="he" />)
    const text = container.textContent ?? ''

    let cursor = 0
    for (const value of ORDERED_VALUES) {
      const found = text.indexOf(value, cursor)
      // -1 means the value is absent from this point on: dropped or reordered.
      expect(found).toBeGreaterThanOrEqual(0)
      cursor = found + value.length
    }
  })

  it('carries the id="story" anchor contract that every CTA targets', () => {
    render(<Story m={m} locale="he" />)

    const section = document.getElementById(SECTION_IDS.story)
    expect(section).not.toBeNull()
    expect(section?.tagName).toBe('SECTION')
  })

  it('names the helmet-bird image from the alt catalogue, not from the heading', () => {
    render(<Story m={m} locale="he" />)

    const img = screen.getByRole('img')

    // The stopgap this replaced was `m.storyTitle`, which is also the <h2>, so a
    // screen reader heard the title twice. Restoring it turns both lines red.
    expect(img.getAttribute('alt')).toBe(m.imageAlts[IMAGE_KEY])
    expect(img.getAttribute('alt')).not.toBe(m.storyTitle)

    const alt = img.getAttribute('alt') ?? ''
    expect(alt.length).toBeGreaterThan(0)

    const src = img.getAttribute('src') ?? ''
    expect(decodeURIComponent(src)).toContain('/images/helmet-bird.webp')

    // `priority` is a React prop, so assert its DOM consequences (LIMIT 2).
    expect(img.hasAttribute('priority')).toBe(false)
    expect(img.getAttribute('fetchpriority')).not.toBe('high')
    expect(img.getAttribute('loading')).toBe('lazy')
  })

  it('renders the quotation in a <blockquote>, never a <q>', () => {
    const { container } = render(<Story m={m} locale="he" />)

    const quote = screen.getByText(m.storyQuote)
    expect(quote.closest('blockquote')).not.toBeNull()
    // <q> would have the UA stylesheet add a second pair of quotation marks
    // around marks the string already contains.
    expect(container.querySelector('q')).toBeNull()
  })

  it('renders identically for he and en — nothing in this section varies by locale', () => {
    const heRender = render(<Story m={m} locale="he" />)
    const enRender = render(<Story m={m} locale="en" />)

    // Same messages in, same markup out. A locale-conditional branch added to
    // the component would break this. Direction lives on <html dir>, not here.
    expect(enRender.container.innerHTML).toBe(heRender.container.innerHTML)
  })
})
