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
//                   `priority`/eager backdrop;
//               (g) W12-C — an outbound link that loses its UTM attribution,
//                   names the wrong wine in it, gains a param nobody decided on,
//                   or carries a page path or a word of the catalogue's copy off
//                   the site.
//
// W12-C · D-76 DECLARED: TWO ASSERTIONS WERE EXTENDED, NEITHER WEAKENED.
// The href assertions used to demand `getAttribute('href') === WINE_URLS.red`
// exactly, which was two claims at once: the right shop URL, AND nothing
// appended. The UTM query is a sanctioned new fact, so the exhaustive contract
// was extended to cover it rather than loosened to ignore it: those assertions
// now compare the href's BASE — parsed off the DOM with `URL`, query removed —
// against the same imported `WINE_URLS` value, and FOUR new assertions pin the
// query itself, including one that the param set is EXACTLY the decided list.
// Net: the same demands, plus four. Nothing that was red can now pass green.
//
// D-56 · WHY THIS IS NOT A TAUTOLOGY. Not one line here calls `wineShopLink()`.
// Every param is read BACK off the rendered anchor with the platform `URL`, and
// compared against the constants in config/site.ts — the same rule this file has
// always applied to `WINE_URLS`: assert against the value's ONE home, never
// against the code that assembled it. A test that re-ran the builder and
// compared the answer to itself would stay green through any bug in it.
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
import {
  WINE_URLS,
  WINE_UTM,
  WINE_UTM_VARIANT_PARAM,
  type WineVariant,
} from '@/config/site'
import { getMessages } from '@/i18n/messages'

const he: WineMessages = getMessages('he')
const en: WineMessages = getMessages('en')

/**
 * The card order, BY VARIANT NAME. These four names are the ONLY ordering claim
 * this file makes; every URL and every param value below is imported, so an
 * inlined or edited URL cannot satisfy them.
 */
const VARIANTS_IN_ORDER: readonly WineVariant[] = ['red', 'rose', 'white', 'trio']

/** The expected BASE href for each card position — imported, never retyped. */
const URLS_IN_ORDER: readonly string[] = VARIANTS_IN_ORDER.map(
  (variant) => WINE_URLS[variant],
)

/** All product links, in document order. */
function productLinks(container: HTMLElement): readonly Element[] {
  return Array.from(container.querySelectorAll('li a'))
}

function hrefOf(link: Element): string {
  return link.getAttribute('href') ?? ''
}

/**
 * The rendered href with its query REMOVED — parsed with the platform `URL`,
 * off the DOM. This is how the pre-W12-C href assertions survive the addition of
 * the UTM query unweakened: they still demand the exact configured URL, they
 * simply no longer demand that nothing was appended to it (see D-76 in the
 * header).
 */
function baseOf(link: Element): string {
  const url = new URL(hrefOf(link))
  url.search = ''
  return url.toString()
}

/** All product link BASES, in document order. */
function productHrefs(container: HTMLElement): readonly string[] {
  return productLinks(container).map(baseOf)
}

/** Every anchor this section renders: the four cards plus the closing CTA. */
function allLinks(container: HTMLElement): readonly Element[] {
  return Array.from(container.querySelectorAll('a'))
}

/** The closing CTA, found by its rendered text — not by position or class. */
function ctaLink(container: HTMLElement): Element | undefined {
  return allLinks(container).find((link) => link.textContent === he.wineCta)
}

/**
 * The query of a rendered href, PARSED BACK OFF THE ANCHOR with the platform
 * `URL`. Never rebuilt by calling `wineShopLink()` — see D-56 in the header.
 */
function paramsOf(link: Element): URLSearchParams {
  return new URL(hrefOf(link)).searchParams
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
    const cta = ctaLink(container)

    expect(cta).toBeDefined()
    expect(cta === undefined ? null : baseOf(cta)).toBe(WINE_URLS.trio)
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

// ── 2b · W12-C · THE UTM, READ BACK OFF THE RENDERED ANCHOR ──────────────────
describe('Wine · shop attribution', () => {
  it('carries every fixed UTM param on every outbound link', () => {
    const { container } = render(<Wine m={he} />)
    const links = allLinks(container)

    // Non-vacuity twice over: there are links, and there are params. A loop over
    // an empty list passes and proves nothing.
    expect(links).toHaveLength(VARIANTS_IN_ORDER.length + 1)
    const fixed = Object.entries(WINE_UTM)
    expect(fixed.length).toBeGreaterThan(0)

    for (const link of links) {
      const params = paramsOf(link)
      for (const [key, value] of fixed) {
        expect(params.get(key), `${key} on ${hrefOf(link)}`).toBe(value)
      }
    }
  })

  it('names the wine in the variant param, matching each card position', () => {
    const { container } = render(<Wine m={he} />)
    const cards = productLinks(container)

    expect(cards).toHaveLength(VARIANTS_IN_ORDER.length)
    cards.forEach((link, index) => {
      expect(
        paramsOf(link).get(WINE_UTM_VARIANT_PARAM),
        `card ${index}`,
      ).toBe(VARIANTS_IN_ORDER[index])
    })
  })

  it('gives the closing CTA the variant of the product it links to', () => {
    const { container } = render(<Wine m={he} />)
    const cta = ctaLink(container)

    expect(cta).toBeDefined()
    if (cta === undefined) return

    // The CTA points at the trio (Wine.tsx HONEST LIMIT 5) and must SAY trio:
    // an href and an attribution naming different wines is the defect.
    expect(baseOf(cta)).toBe(WINE_URLS.trio)
    expect(paramsOf(cta).get(WINE_UTM_VARIANT_PARAM)).toBe('trio')
  })

  it('adds exactly these params and no others, leaving the shop URL intact', () => {
    const { container } = render(<Wine m={he} />)
    const expected = [...Object.keys(WINE_UTM), WINE_UTM_VARIANT_PARAM].sort()

    for (const link of allLinks(container)) {
      const href = hrefOf(link)

      // Something WAS appended — otherwise every assertion above could be
      // satisfied by a bare URL with no query at all.
      expect(href, 'no query was appended').not.toBe(baseOf(link))

      // ...and only this. A tracking param nobody decided on is a new fact
      // leaving the site, and it goes red here.
      expect([...paramsOf(link).keys()].sort(), href).toEqual(expected)

      // The shop's own address survived: same origin, same percent-encoded
      // path, no fragment invented.
      const url = new URL(href)
      expect(URLS_IN_ORDER).toContain(`${url.origin}${url.pathname}`)
      expect(url.hash).toBe('')
    }
  })

  it('carries no identity, no page path and no memorial fact in the query', () => {
    const { container } = render(<Wine m={he} />)

    for (const link of allLinks(container)) {
      // DECODED values, so a percent-encoded leak cannot hide from this.
      const values = [...paramsOf(link).values()]
      expect(values.length).toBeGreaterThan(0)

      // What leaves this site is a host, the word for "a link", and a wine.
      // Not a visitor, not a route, not a word of the catalogue's copy.
      for (const value of values) {
        expect(value, 'a path left the site in a param').not.toContain('/')
        for (const label of [he.wineTitle, he.wineSubtitle, ...he.wine]) {
          expect(value, 'copy left the site in a param').not.toContain(label)
        }
      }
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
