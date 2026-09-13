// ─────────────────────────────────────────────────────────────────────────────
// W4-07 · components/sections/__tests__/HowItLooks.test.tsx
//
// WHAT THIS FILE IS FOR. The failure this test is built to catch is not "the
// section throws" — it is "the section renders and one of the three strings per
// format is quietly gone." A centred stack of three cards looks correct in a
// screenshot whether or not the `desc` under each title made it to the DOM, and
// a layout that hardcodes three cards looks correct right up until the customer
// adds a fourth format and never sees it. Both are asserted here over a
// DENOMINATOR taken from the data.
//
// INVARIANT   Every expected string comes from the real catalogue at run time
//             (`getMessages`) or from an ASCII fixture declared in this file. No
//             prose is typed here, so no assertion can pass by agreeing with a
//             copy this file made of the text.
// IMPOSSIBLE  A green run on a component that hardcodes the format count, drops
//             a `desc` or an `icon`, marks the backdrop `priority`, gives the
//             decorative backdrop a non-empty `alt`, or paints the backdrop with
//             a CSS `background-image` instead of the image pipeline (D-32).
//             Each of those is quantified over the data or over every `<img>` in
//             the container, never over a number written here.
// CLASS       Derivation: assertions are quantified over `m.howFormats`, so this
//             file stays correct when the catalogue grows. The count test is
//             driven at lengths 1, 5 and 7 — none of them 3 — so a three-card
//             layout cannot pass it by coincidence.
// HONEST LIMIT  Four.
//   1. It proves the strings REACH THE DOM. It cannot prove they are the RIGHT
//      strings; that is the catalogue's own leaf verification, upstream.
//   2. It proves nothing is `priority` by that prop's DOM FOOTPRINT
//      (`fetchpriority="high"` / `loading="eager"`). If a future next/image stops
//      expressing `priority` that way, this check goes quiet rather than red.
//   3. It renders in jsdom, which fetches nothing. Nothing here proves the
//      backdrop file exists, that it loads, or that the section is legible at
//      any width.
//   4. The locale test proves INVARIANCE (D-30), a weaker claim than difference.
//      It is the honest one: measured, nothing in this component reads `locale`.
//      It goes red the moment someone adds a locale branch.
// ─────────────────────────────────────────────────────────────────────────────

import { render, screen } from '@testing-library/react'

import {
  HowItLooks,
  type HowItLooksMessages,
} from '@/components/sections/HowItLooks'
import { LOCALES, type Locale } from '@/config/site'
import { getMessages } from '@/i18n/messages'

/** The real catalogue. Never a local copy of the prose. */
function catalogue(locale: Locale): HowItLooksMessages {
  return getMessages(locale)
}

/**
 * An ASCII fixture of ARBITRARY length. Its only job is to let the count
 * assertion be driven by the data instead of by the number 3.
 */
function fixture(formatCount: number): HowItLooksMessages {
  return {
    howTitle: 'FIXTURE HOW TITLE',
    howFormats: Array.from({ length: formatCount }, (_unused, i) => ({
      icon: `FIXTURE ICON ${String(i)}`,
      title: `FIXTURE FORMAT TITLE ${String(i)}`,
      desc: `FIXTURE FORMAT DESC ${String(i)}`,
    })),
  }
}

describe('HowItLooks', () => {
  // ── 1 · the heading and all three strings of EVERY format reach the DOM ────
  it('renders howTitle and the icon, title and desc of every howFormats entry', () => {
    const m = catalogue('he')
    render(<HowItLooks m={m} locale="he" />)

    // Denominator, stated before the verdict.
    expect(m.howFormats.length).toBeGreaterThan(0)

    expect(screen.getByText(m.howTitle)).toBeInTheDocument()

    for (const format of m.howFormats) {
      expect(screen.getByText(format.icon)).toBeInTheDocument()
      expect(screen.getByText(format.title)).toBeInTheDocument()
      expect(screen.getByText(format.desc)).toBeInTheDocument()
    }
  })

  // ── 2 · the count follows the data, not the layout ────────────────────────
  it.each([1, 5, 7])(
    'renders exactly %i formats for a %i-length array',
    (n) => {
      const m = fixture(n)
      render(<HowItLooks m={m} locale="he" />)

      const items = screen.getAllByRole('listitem')
      expect(items).toHaveLength(m.howFormats.length)
      expect(items).toHaveLength(n)
    },
  )

  // ── 3 · the silent regression: a format rendered without its `desc` ───────
  // Per-ELEMENT, not per-document: a `desc` that renders detached from its own
  // card would still satisfy a bare `getByText`, and would still be a defect.
  it('renders every format as one element containing its icon, title AND desc', () => {
    const m = catalogue('he')
    render(<HowItLooks m={m} locale="he" />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(m.howFormats.length)

    m.howFormats.forEach((format, index) => {
      const node = items[index]
      expect(node).toBeDefined()
      const text = node?.textContent ?? ''
      expect(text).toContain(format.icon)
      expect(text).toContain(format.title)
      expect(text).toContain(format.desc)
    })
  })

  // ── 4 · the backdrop: decorative, optimised, never priority ───────────────
  it('renders the backdrop through next/image, decorative and not priority', () => {
    const m = catalogue('he')
    const { container } = render(<HowItLooks m={m} locale="he" />)

    // Full denominator: querySelectorAll, not getAllByRole — an image with
    // alt="" has role `presentation` and is invisible to a role query.
    const images = Array.from(container.querySelectorAll('img'))
    expect(images).toHaveLength(1)

    for (const img of images) {
      expect(img).toHaveAttribute('alt', '')
      expect(img).toHaveAttribute('aria-hidden', 'true')
      expect(img).toHaveAttribute('sizes')
      expect(img.getAttribute('src')).not.toBe('')
      // `priority` expresses itself as fetchpriority=high + loading=eager.
      expect(img.getAttribute('fetchpriority')).not.toBe('high')
      expect(img.getAttribute('loading')).not.toBe('eager')
    }

    // D-32: a CSS background bypasses the image pipeline entirely. The backdrop
    // must not be painted that way — asserted on the markup, not by review.
    expect(container.innerHTML).not.toContain('background-image')
  })

  // ── 5 · the locale claim, tested rather than asserted (C10 / D-30) ────────
  // MEASURED: this component does not read `locale`. lang/dir live on <html>
  // (D-5) and direction is carried by logical CSS, so the honest test is
  // INVARIANCE — identical markup for every locale given identical messages.
  it('renders identical markup for every locale when given the same messages', () => {
    const m = fixture(4)

    const rendered = LOCALES.map((locale) => {
      const { container } = render(<HowItLooks m={m} locale={locale} />)
      return container.innerHTML
    })

    expect(LOCALES.length).toBeGreaterThan(1)
    const [first] = rendered
    expect(first).toBeDefined()
    for (const html of rendered) expect(html).toBe(first)
  })

  // The locale-dependent text arrives through `m`, and it really does differ.
  // This is the difference that test 5 proves is NOT produced by the prop.
  it('renders different text for he and en because the catalogue differs', () => {
    const he = catalogue('he')
    const en = catalogue('en')

    expect(en.howTitle).not.toBe(he.howTitle)
    expect(en.howFormats).toHaveLength(he.howFormats.length)

    render(<HowItLooks m={en} locale="en" />)
    expect(screen.getByText(en.howTitle)).toBeInTheDocument()
    expect(screen.queryByText(he.howTitle)).toBeNull()
  })
})
