// ─────────────────────────────────────────────────────────────────────────────
// W4-04 SECTION TEST · components/sections/__tests__/LecturesPreview.test.tsx
//
// WHAT THIS FILE IS FOR, IN ONE LINE: it is the regression that stops an
// accessibility hole from shipping when the customer's `lectureItems[3]` is `""`.
//
// INVARIANT     Every assertion here is stated over the RENDERED DOM of a whole
//               REGION — `querySelectorAll('h1..h6')`, `querySelectorAll('ul img')`
//               for the lecture photographs, `querySelectorAll('img')` for the
//               section entire — never over a hand-picked element. So a future
//               edit that adds a second empty heading, or a second unnamed image,
//               anywhere in the subtree, fails these tests; the assertions cannot
//               be satisfied by the one element the test author had in mind.
//
// IMPOSSIBLE    Four regressions can no longer pass this file: an empty heading
//               element, a LIST image with `alt=""`, a non-empty item quietly
//               vanishing from the page, and the decorative backdrop reverting to
//               a CSS `background-image` (ledger D-32) or multiplying into a
//               second unnamed image. The third is what makes the first two
//               honest — without it, "no empty heading" could be satisfied by
//               dropping the row, which is the other way to hide §OPEN 6. The
//               fourth is what makes the LIST scoping honest — see limit 5.
//               The first three are proved RED (see the delegate report).
//
// CLASS         Closed by derivation for LIST LENGTH: the count assertions are
//               driven by fixtures of 0, 1, 3, 4 and 5 items and compare against
//               `items.filter(...)`, so no literal 4 appears and a catalogue that
//               grows a 5th lecture needs no edit here. NOT a closure over
//               CONTENT: this file proves the empty string is handled, never that
//               the four sentences are the right four.
//
// HONEST LIMIT  Five.
//   1. NO HEBREW LITERAL APPEARS IN THIS FILE (contract C4), so every assertion
//      against real copy reads its expected value from `getMessages(...)` — the
//      same source the component reads. A catalogue that is wrong in both places
//      is wrong consistently and passes. This file proves STRUCTURE against the
//      real data, not the truth of the data.
//   2. jsdom, not a browser: `next/image` renders an `<img>` here with no layout,
//      no srcset negotiation and no 404 check. That the five `.webp` paths do not
//      yet exist on disk (W6) is invisible to every test below.
//   3. The locale test proves the section renders IDENTICALLY for `he` and `en`
//      given identical messages — i.e. it proves there is NO locale-dependent
//      markup. It cannot prove the page looks right in RTL; direction is set on
//      `<html dir>` by the layout and is outside this component entirely.
//   4. `alt` non-emptiness is checked; `alt` MEANINGFULNESS is not checkable by
//      any test. The unwritten row is named from `lecturesTitle` (asserted below
//      by identity with that key, so a future edit cannot swap in an invented
//      string without turning this red).
//   5. THE "NO UNNAMED IMAGE" SWEEP IS SCOPED TO THE LIST, AND THAT IS A REAL
//      NARROWING. The backdrop is a `next/image` with `alt=""` (ledger D-32 +
//      D-29), so a sweep over every `<img>` would be red by construction. It is
//      therefore `ul img`, and the loss is bought back — not waved away — by
//      section 6, which asserts that the images OUTSIDE the list number exactly
//      one and that the one is the backdrop, by src, by `alt=""`, by
//      `aria-hidden` and by `loading`. A second unnamed image anywhere outside
//      the list turns that count red. What remains genuinely unchecked: an
//      unnamed image added INSIDE the list would be caught, and one outside
//      would be caught by the count, but an image that REPLACED the backdrop at
//      the same position with a different decorative src would pass the count
//      and fail only the src assertion — which is the intended sensitivity.
// ─────────────────────────────────────────────────────────────────────────────

import { render } from '@testing-library/react'

import { type Locale } from '@/config/site'
import { getMessages } from '@/i18n/messages'
import {
  LecturesPreview,
  type LecturesPreviewProps,
} from '@/components/sections/LecturesPreview'

/* ── fixtures ─────────────────────────────────────────────────────────────── */

/** Synthetic, ASCII-only (C4). `items` is copied, never aliased. */
function synthetic(items: string[], locale: Locale = 'he'): LecturesPreviewProps {
  return {
    m: {
      lecturesTitle: 'Section title',
      lectureItems: [...items],
      lecturesFooter: 'Section footer',
    },
    locale,
  }
}

/** The REAL catalogue — the only place real copy enters this file. */
function fromCatalogue(locale: Locale): LecturesPreviewProps {
  const all = getMessages(locale)
  return {
    m: {
      lecturesTitle: all.lecturesTitle,
      lectureItems: all.lectureItems,
      lecturesFooter: all.lecturesFooter,
    },
    locale,
  }
}

function headingsOf(container: HTMLElement): HTMLHeadingElement[] {
  return Array.from(
    container.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6'),
  )
}

function imagesOf(container: HTMLElement): HTMLImageElement[] {
  return Array.from(container.querySelectorAll<HTMLImageElement>('img'))
}

/**
 * The LIST images — the ones that stand for a lecture and must therefore carry a
 * non-empty accessible name. The section's one other image is the decorative
 * backdrop, whose `alt` is empty ON PURPOSE (ledger D-29) and which is asserted
 * separately, by identity, in section 6 — so this scoping narrows the sweep
 * without opening a hole in it.
 */
function listImagesOf(container: HTMLElement): HTMLImageElement[] {
  return Array.from(container.querySelectorAll<HTMLImageElement>('ul img'))
}

/** The decorative backdrop's basename — src fragment and nothing else. */
const BACKGROUND_BASENAME = 'lectures-bg-soldiers'

const LOCALES_UNDER_TEST: Locale[] = ['he', 'en']

/* ── 1 · the three message keys reach the page ────────────────────────────── */

describe('LecturesPreview renders its message keys', () => {
  for (const locale of LOCALES_UNDER_TEST) {
    it(`renders title, footer and every non-empty item (${locale})`, () => {
      const props = fromCatalogue(locale)
      const { container } = render(<LecturesPreview {...props} />)

      expect(container.textContent).toContain(props.m.lecturesTitle)
      expect(container.textContent).toContain(props.m.lecturesFooter)

      const written = props.m.lectureItems.filter((item) => item.length > 0)
      expect(written.length).toBeGreaterThan(0)
      for (const item of written) {
        expect(container.textContent).toContain(item)
      }
    })
  }
})

/* ── 2 · THE CRITICAL TEST · the empty item (ledger §OPEN 6 / D-8) ────────── */

describe('the empty lecture item is handled explicitly, never silently', () => {
  it('the real catalogues really do carry an empty item — the premise this file exists for', () => {
    for (const locale of LOCALES_UNDER_TEST) {
      const items = getMessages(locale).lectureItems
      expect(items.filter((item) => item.length === 0).length).toBe(1)
    }
  })

  for (const locale of LOCALES_UNDER_TEST) {
    it(`renders NO empty heading and NO empty alt for the real ${locale} catalogue`, () => {
      const props = fromCatalogue(locale)
      const { container } = render(<LecturesPreview {...props} />)

      for (const heading of headingsOf(container)) {
        expect(heading.textContent ?? '').not.toBe('')
      }
      for (const image of listImagesOf(container)) {
        expect(image.getAttribute('alt')).not.toBe('')
        expect(image.getAttribute('alt')).not.toBeNull()
      }
    })
  }

  it('a synthetic empty item produces no empty heading and no empty alt', () => {
    const props = synthetic(['Alpha', 'Beta', 'Gamma', ''])
    const { container } = render(<LecturesPreview {...props} />)

    expect(headingsOf(container).map((h) => h.textContent)).not.toContain('')
    expect(listImagesOf(container).map((i) => i.getAttribute('alt'))).not.toContain('')
  })

  it('keeps the empty row visible: its image is still rendered, named from lecturesTitle', () => {
    const props = synthetic(['Alpha', 'Beta', 'Gamma', ''])
    const { container } = render(<LecturesPreview {...props} />)

    // The row is NOT dropped: 4 items in, 4 LIST images out (the decorative
    // backdrop is not one of them and is asserted in section 6).
    expect(listImagesOf(container)).toHaveLength(props.m.lectureItems.length)

    // ...but only the three written items get a heading, on top of the <h2>.
    const written = props.m.lectureItems.filter((item) => item.length > 0)
    expect(headingsOf(container)).toHaveLength(written.length + 1)

    // The unwritten row's name is the existing key, not an invented sentence.
    const alts = listImagesOf(container).map((image) => image.getAttribute('alt'))
    expect(alts).toContain(props.m.lecturesTitle)
    for (const item of written) {
      expect(alts).toContain(item)
    }
  })

  it('an empty item in any position is handled, not just the last', () => {
    const props = synthetic(['', 'Beta', ''])
    const { container } = render(<LecturesPreview {...props} />)

    expect(listImagesOf(container)).toHaveLength(3)
    expect(headingsOf(container)).toHaveLength(2) // <h2> + the one written row
    expect(headingsOf(container).map((h) => h.textContent)).not.toContain('')
    expect(listImagesOf(container).map((i) => i.getAttribute('alt'))).not.toContain('')
  })
})

/* ── 3 · the item count follows the data, with no literal 4 anywhere ──────── */

describe('the rendered row count follows the data', () => {
  const cases: string[][] = [
    [],
    ['One'],
    ['One', 'Two', 'Three'],
    ['One', 'Two', 'Three', 'Four'],
    ['One', 'Two', 'Three', 'Four', 'Five'],
  ]

  for (const items of cases) {
    it(`renders one heading per written item for ${items.length} item(s)`, () => {
      const props = synthetic(items)
      const { container } = render(<LecturesPreview {...props} />)

      // Every item gets a heading (all fixtures here are non-empty), plus the <h2>.
      expect(headingsOf(container)).toHaveLength(items.length + 1)
      for (const item of items) {
        expect(container.textContent).toContain(item)
      }
    })
  }

  it('a written item beyond the media table still renders its heading', () => {
    // The 5th item has no photograph; the sentence must survive regardless.
    const props = synthetic(['One', 'Two', 'Three', 'Four', 'Five'])
    const { container } = render(<LecturesPreview {...props} />)

    expect(container.textContent).toContain('Five')
    expect(listImagesOf(container).length).toBeLessThanOrEqual(
      props.m.lectureItems.length,
    )
  })
})

/* ── 4 · a written item can never be silently dropped ─────────────────────── */

describe('no written item is dropped', () => {
  for (const locale of LOCALES_UNDER_TEST) {
    it(`every non-empty ${locale} item appears exactly once as a heading`, () => {
      const props = fromCatalogue(locale)
      const { container } = render(<LecturesPreview {...props} />)

      const written = props.m.lectureItems.filter((item) => item.length > 0)
      const texts = headingsOf(container).map((h) => h.textContent)

      for (const item of written) {
        expect(texts.filter((text) => text === item)).toHaveLength(1)
      }
      // <h2> + one <h3> per written item, and nothing else.
      expect(texts).toHaveLength(written.length + 1)
    })
  }
})

/* ── 5 · the RTL/LTR claim, TESTED rather than asserted ───────────────────── */

describe('what varies by locale', () => {
  it('NOTHING varies by the locale prop: identical messages render identical markup', () => {
    const items = ['One', 'Two', 'Three', '']

    const he = render(<LecturesPreview {...synthetic(items, 'he')} />)
    const heHtml = he.container.innerHTML
    he.unmount()

    const en = render(<LecturesPreview {...synthetic(items, 'en')} />)
    const enHtml = en.container.innerHTML
    en.unmount()

    // This section carries no dir, no logical/physical switch and no locale-keyed
    // class. Direction is set once on <html dir> by the layout. If a future edit
    // makes this component locale-dependent, this assertion goes red and the
    // claim in its header must be rewritten.
    expect(heHtml).toBe(enHtml)
  })

  it('what DOES differ between he and en is the catalogue copy, and only that', () => {
    const he = render(<LecturesPreview {...fromCatalogue('he')} />)
    const heHtml = he.container.innerHTML
    const heImages = imagesOf(he.container).map((i) => i.getAttribute('src'))
    he.unmount()

    const en = render(<LecturesPreview {...fromCatalogue('en')} />)
    const enHtml = en.container.innerHTML
    const enImages = imagesOf(en.container).map((i) => i.getAttribute('src'))
    en.unmount()

    expect(heHtml).not.toBe(enHtml)
    expect(getMessages('he').lecturesTitle).not.toBe(getMessages('en').lecturesTitle)
    // Same photographs, same order, in both locales — backdrop included.
    expect(heImages).toEqual(enImages)
  })
})

/* ── 6 · the decorative backdrop · ledger D-32 (optimised) + D-29 (alt="") ── */

describe('the decorative background', () => {
  it('is a next/image, never a CSS background layer', () => {
    const { container } = render(<LecturesPreview {...synthetic(['Alpha'])} />)

    // A CSS background forfeits format negotiation, responsive `sizes` and
    // lazy-loading on one of the heaviest assets on the site (D-32). BOTH
    // spellings of one are swept: the inline style and the utility class that
    // compiles to it. Revert the component to either and this goes red.
    const offenders = Array.from(container.querySelectorAll('*')).filter(
      (element) =>
        (element.getAttribute('style') ?? '').includes('background-image') ||
        (element.getAttribute('class') ?? '').includes('bg-[url('),
    )
    expect(offenders).toEqual([])

    // ...and the backdrop is really THERE as an image, so the sweep above cannot
    // be satisfied by deleting the background altogether.
    const backdrops = imagesOf(container).filter((image) =>
      (image.getAttribute('src') ?? '').includes(BACKGROUND_BASENAME),
    )
    expect(backdrops).toHaveLength(1)
  })

  it('is the ONE image outside the list, and is named alt="" and hidden', () => {
    const { container } = render(
      <LecturesPreview {...synthetic(['Alpha', 'Beta'])} />,
    )

    // This is what keeps the narrowed "no unnamed LIST image" sweep honest: an
    // unnamed image added anywhere outside the list makes this count 2.
    const listed = listImagesOf(container)
    const outside = imagesOf(container).filter(
      (image) => !listed.includes(image),
    )
    expect(outside).toHaveLength(1)

    const [backdrop] = outside
    expect(backdrop?.getAttribute('src') ?? '').toContain(BACKGROUND_BASENAME)
    // `alt=""` is the CORRECT accessible name for a decorative image (D-29):
    // it removes the element from the accessibility tree instead of announcing
    // noise. A non-empty value here would be invented copy (C4).
    expect(backdrop?.getAttribute('alt')).toBe('')
    expect(backdrop?.getAttribute('aria-hidden')).toBe('true')
    // The whole point of D-32: it participates in loading like any other image.
    expect(backdrop?.getAttribute('loading')).toBe('lazy')
    expect(backdrop?.getAttribute('sizes')).not.toBeNull()
  })
})
