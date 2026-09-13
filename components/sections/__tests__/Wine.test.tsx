// ─────────────────────────────────────────────────────────────────────────────
// W4-10 WINE — components/sections/__tests__/Wine.test.tsx
//
// INVARIANT     Every assertion about a shop link compares against `WINE_URLS`
//               IMPORTED from '@/config/site' — never against a URL retyped into
//               this file. A test that retypes the thing it guards proves only
//               that two copies still agree, which is the defect, not the gate.
//               Every assertion about copy compares against `getMessages()`, so
//               this file contains no Hebrew and no memorial fact.
//
// IMPOSSIBLE    Six regressions can no longer land green:
//               (a) a hardcoded shop URL in the component (the href would not be
//                   a value of WINE_URLS if config changed, and set-equality is
//                   asserted both ways);
//               (b) a wrong-order zip — each card's href is checked against the
//                   NAMED variant for its position, so swapping rosé and white
//                   in either the catalogue or the component is red;
//               (c) a product added to `WINE_URLS` that the section forgets —
//                   the href set is compared against `Object.values(WINE_URLS)`,
//                   so a fifth variant with no card fails here even though the
//                   component still compiles;
//               (d) a hardcoded card count — the count is asserted against
//                   `m.wine.length` for catalogues of 3, 4 and 5 labels;
//               (e) a price, a currency symbol or an invented number creeping in;
//               (f) an external link without `rel="noopener noreferrer"`, or a
//                   `priority`/eager backdrop.
//
// CLASS         INSTANCE for this section: it proves Wine.tsx, not the other
//               twelve. The repo-wide halves of these rules live in the ESLint
//               gate and the W7 grep gate, not here.
//
// HONEST LIMIT  Four.
//   1. It proves the RENDER, never the destination. That `WINE_URLS.red` is the
//      right page on the shop is a customer question (ledger §OPEN 4); nothing
//      here fetches a URL or knows what it serves.
//   2. `/images/wine-*.webp` are asserted as SRC CONTRACTS. The files do not
//      exist yet (W6). A green run here does not mean an image loads.
//   3. Positional label↔product pairing is asserted against the order the
//      component ships today. It cannot tell you that order is what the customer
//      wants — only that it has not drifted since it was written down.
//   4. jsdom, not a browser: no layout, no `object-fit`, no lazy-loading
//      behaviour. `next/image` is exercised as the `<img>` it emits.
// ─────────────────────────────────────────────────────────────────────────────

import { render } from '@testing-library/react'

import { Wine, type WineMessages } from '@/components/sections/Wine'
import { WINE_URLS } from '@/config/site'
import { getMessages } from '@/i18n/messages'

const he: WineMessages = getMessages('he')
const en: WineMessages = getMessages('en')

/**
 * The expected href for each card position, BY VARIANT NAME. The names are the
 * ordering claim — the only thing this file states about the URLs. The values
 * are imported, so an inlined or edited URL cannot satisfy this list.
 */
const URLS_IN_ORDER: readonly string[] = [
  WINE_URLS.red,
  WINE_URLS.rose,
  WINE_URLS.white,
  WINE_URLS.trio,
]

/** All product links, in document order. */
function productHrefs(container: HTMLElement): readonly (string | null)[] {
  return Array.from(container.querySelectorAll('li a')).map((a) =>
    a.getAttribute('href'),
  )
}

function withLabels(base: WineMessages, wine: readonly string[]): WineMessages {
  return { ...base, wine: [...wine] }
}

// ── 1 · every message key this section owns is rendered ──────────────────────
describe('Wine · copy', () => {
  it('renders title, subtitle, CTA and every wine label', () => {
    const { container } = render(<Wine m={he} />)
    const text = container.textContent ?? ''

    expect(text).toContain(he.wineTitle)
    expect(text).toContain(he.wineSubtitle)
    expect(text).toContain(he.wineCta)

    expect(he.wine.length).toBeGreaterThan(0)
    for (const label of he.wine) {
      expect(text).toContain(label)
    }
  })
})

// ── 2 · THE LINK TEST ────────────────────────────────────────────────────────
describe('Wine · shop links', () => {
  it('gives each card the href of its variant in WINE_URLS', () => {
    const { container } = render(<Wine m={he} />)

    expect(productHrefs(container)).toEqual(URLS_IN_ORDER)
  })

  it('renders one card per URL in WINE_URLS and no other URL', () => {
    const { container } = render(<Wine m={he} />)
    const hrefs = productHrefs(container)
    const configured = Object.values(WINE_URLS)

    // Both directions: nothing configured is missing, nothing extra invented.
    expect(hrefs).toHaveLength(configured.length)
    expect(new Set(hrefs)).toEqual(new Set(configured))
  })

  it('points the CTA at a URL that comes from WINE_URLS', () => {
    const { container } = render(<Wine m={he} />)
    const cta = Array.from(container.querySelectorAll('a')).find(
      (a) => a.textContent === he.wineCta,
    )

    expect(cta).toBeDefined()
    expect(cta?.getAttribute('href')).toBe(WINE_URLS.trio)
  })

  it('marks every external link noopener noreferrer', () => {
    const { container } = render(<Wine m={he} />)
    const links = Array.from(container.querySelectorAll('a'))

    expect(links.length).toBeGreaterThan(URLS_IN_ORDER.length)
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    }
  })
})

// ── 3 · the count follows the data, and a mismatch never mislinks ────────────
describe('Wine · card count follows m.wine', () => {
  it('renders exactly as many cards as there are labels', () => {
    for (const labels of [he.wine.slice(0, 1), he.wine.slice(0, 3), he.wine]) {
      const { container, unmount } = render(
        <Wine m={withLabels(he, labels)} />,
      )

      expect(container.querySelectorAll('li')).toHaveLength(labels.length)
      expect(productHrefs(container)).toEqual(URLS_IN_ORDER.slice(0, labels.length))
      unmount()
    }
  })

  it('renders a surplus label unlinked rather than reusing another link', () => {
    const extra = 'surplus-label'
    const { container } = render(
      <Wine m={withLabels(he, [...he.wine, extra])} />,
    )

    const items = Array.from(container.querySelectorAll('li'))
    expect(items).toHaveLength(he.wine.length + 1)

    const last = items[items.length - 1]
    expect(last?.textContent).toBe(extra)
    expect(last?.querySelector('a')).toBeNull()
    expect(last?.querySelector('img')).toBeNull()

    // The surplus card borrowed nothing: still one href per configured URL.
    expect(productHrefs(container)).toEqual(URLS_IN_ORDER)
  })
})

// ── 4 · images: informative alts are the labels, backdrop is decorative ──────
describe('Wine · images', () => {
  it("gives each product image its own label as alt and never sets priority", () => {
    const { container } = render(<Wine m={he} />)
    const images = Array.from(container.querySelectorAll('img'))

    // One per product plus the backdrop.
    expect(images).toHaveLength(he.wine.length + 1)

    for (const img of images) {
      expect(img).toHaveAttribute('alt')
      // `priority` would emit one of these two; neither may appear.
      expect(img.getAttribute('fetchpriority')).not.toBe('high')
      expect(img.getAttribute('loading')).not.toBe('eager')
    }

    const productImages = Array.from(container.querySelectorAll('li img'))
    expect(productImages).toHaveLength(he.wine.length)
    productImages.forEach((img, index) => {
      expect(img.getAttribute('alt')).toBe(he.wine[index])
      expect(img.getAttribute('alt')).not.toBe('')
    })
  })

  it('renders the backdrop as a decorative next/image, not a CSS background', () => {
    const { container } = render(<Wine m={he} />)

    const backdrop = Array.from(container.querySelectorAll('img')).find(
      (img) => img.getAttribute('alt') === '',
    )
    expect(backdrop).toBeDefined()
    expect(backdrop?.getAttribute('aria-hidden')).toBe('true')
    expect(backdrop?.getAttribute('src')).toContain('wine-bg-tanks')

    // D-32: no element may carry a CSS background-image.
    for (const el of Array.from(container.querySelectorAll('*'))) {
      const style = el.getAttribute('style') ?? ''
      expect(style).not.toContain('background-image')
    }
  })
})

// ── 5 · there is no price on this page, and there never was one ──────────────
describe('Wine · prices', () => {
  it('renders no currency symbol anywhere', () => {
    for (const m of [he, en]) {
      const { container, unmount } = render(<Wine m={m} />)
      expect(container.textContent ?? '').not.toMatch(/[₪$€£¥]/)
      unmount()
    }
  })
})

// ── 6 · locale invariance (D-30): nothing here branches on locale ────────────
describe('Wine · locale', () => {
  it('takes no locale: structure is identical for both catalogues', () => {
    const { container: heBox, unmount } = render(<Wine m={he} />)
    const structure = (box: HTMLElement) => ({
      links: productHrefs(box),
      images: Array.from(box.querySelectorAll('img')).map((img) =>
        img.getAttribute('src'),
      ),
      cards: box.querySelectorAll('li').length,
    })
    const heStructure = structure(heBox)
    unmount()

    const { container: enBox } = render(<Wine m={en} />)
    expect(structure(enBox)).toEqual(heStructure)
  })

  it('proves the he/en difference is real and arrives through m', () => {
    expect(en.wineTitle).not.toBe(he.wineTitle)
    expect(en.wine).not.toEqual(he.wine)

    const { container } = render(<Wine m={en} />)
    const text = container.textContent ?? ''
    expect(text).toContain(en.wineTitle)
    for (const label of en.wine) {
      expect(text).toContain(label)
    }
  })
})
