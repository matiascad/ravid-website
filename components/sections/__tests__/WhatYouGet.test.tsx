// ─────────────────────────────────────────────────────────────────────────────
// W4-06 · components/sections/__tests__/WhatYouGet.test.tsx
//
// WHAT THIS FILE IS FOR. WhatYouGet renders two lists of selling prose — what the
// lecture contains and who it is for. The failure it is built to catch is not
// "the section throws"; it is "the section renders, and one line is quietly
// missing." A two-column grid drops a fourth audience card silently, a layout
// change loses a `desc` silently, and both look fine in a screenshot.
//
// INVARIANT   Every expected string is either read from the REAL CATALOGUE at run
//             time (`getMessages`) or declared here as an ASCII fixture. No
//             Hebrew literal is typed into this file, so no assertion can pass by
//             agreeing with a copy of the prose that this file made — there is one
//             source of truth for the text and the test reads it.
// IMPOSSIBLE  A green run on a component that hardcodes either list's length, that
//             renders a `title` without its `desc`, that reorders an entry's parts
//             across rows, that marks the backdrop `priority`, or that writes a
//             physical-direction class. Every count assertion has its DENOMINATOR
//             taken from the data (`.length`, and the `<li>` elements actually in
//             the DOM), never from a number written here — the fixtures are driven
//             at lengths that are deliberately NEITHER 3 NOR 4.
// CLASS       Derivation: assertions are quantified over the data, never over the
//             instance. This file stays correct when either array grows or shrinks.
// HONEST LIMIT  Five.
//   1. It proves the strings REACH THE DOM. It cannot prove they are the RIGHT
//      strings — that is the catalogue's own leaf verification, upstream.
//   2. `priority` emits no attribute of its own on next@15.5; it only suppresses
//      `loading="lazy"`. The assertion below is therefore on `loading`/
//      `fetchpriority`. If a future next/image stops expressing it that way, this
//      check goes quiet rather than red.
//   3. It renders in jsdom. Nothing here proves /images/lecture-soldiers.webp
//      exists, that it loads, or that the section is legible at any width.
//   4. The physical-class sweep reads `className` only. An inline `style` with
//      `left`/`right`, or a physical property inside a CSS file, is invisible to
//      it — including the symmetric insets next/image itself writes for `fill`.
//   5. The locale test proves INVARIANCE, which is a weaker claim than a
//      difference: it fails if someone adds locale-conditional markup, and that is
//      exactly what it is for. The real he/en difference is proved separately, to
//      show it arrives through `m` and not through `locale`.
// ─────────────────────────────────────────────────────────────────────────────

import { render, screen, within } from '@testing-library/react'

import {
  WhatYouGet,
  type WhatYouGetProps,
} from '@/components/sections/WhatYouGet'
import { LOCALES, type Locale } from '@/config/site'
import { getMessages } from '@/i18n/messages'

type WhatYouGetMessages = WhatYouGetProps['m']

/** The real catalogue. Never a local copy of the prose. */
function catalogue(locale: Locale): WhatYouGetMessages {
  return getMessages(locale)
}

/**
 * An ASCII fixture at ARBITRARY lengths. Its only job is to let the count
 * assertions be driven by the data instead of by the numbers 3 and 4.
 */
function fixture(
  contentCount: number,
  audienceCount: number,
): WhatYouGetMessages {
  return {
    whatTitle: 'FIXTURE WHAT TITLE',
    whatContentTitle: 'FIXTURE CONTENT HEADING',
    whatContent: Array.from({ length: contentCount }, (_unused, i) => ({
      icon: `<ICON ${String(i)}>`,
      title: `FIXTURE CONTENT TITLE ${String(i)}`,
      desc: `FIXTURE CONTENT DESC ${String(i)}`,
    })),
    whatAudienceTitle: 'FIXTURE AUDIENCE HEADING',
    whatAudience: Array.from({ length: audienceCount }, (_unused, i) => ({
      title: `FIXTURE AUDIENCE TITLE ${String(i)}`,
      desc: `FIXTURE AUDIENCE DESC ${String(i)}`,
    })),
  }
}

/**
 * The two lists are told apart by their ACCESSIBLE NAME, which comes from the
 * heading each `<ul>` is `aria-labelledby`-wired to. No index access, no test id,
 * and the lookup itself proves that wiring is intact.
 */
function listNamed(name: string): HTMLElement {
  return screen.getByRole('list', { name })
}

describe('WhatYouGet', () => {
  // ── 1 · every string in the catalogue reaches the DOM ──────────────────────
  it('renders both headings and every icon, title and desc of both lists', () => {
    const m = catalogue('he')
    render(<WhatYouGet m={m} locale="he" />)

    // Denominators, stated before the verdict.
    expect(m.whatContent.length).toBeGreaterThan(0)
    expect(m.whatAudience.length).toBeGreaterThan(0)

    expect(screen.getByText(m.whatTitle)).toBeInTheDocument()
    expect(screen.getByText(m.whatContentTitle)).toBeInTheDocument()
    expect(screen.getByText(m.whatAudienceTitle)).toBeInTheDocument()

    for (const item of m.whatContent) {
      // The emoji comes from the catalogue, so this goes red if the component
      // ever hardcodes an icon of its own or substitutes an icon library.
      expect(screen.getByText(item.icon)).toBeInTheDocument()
      expect(screen.getByText(item.title)).toBeInTheDocument()
      expect(screen.getByText(item.desc)).toBeInTheDocument()
    }

    for (const item of m.whatAudience) {
      expect(screen.getByText(item.title)).toBeInTheDocument()
      expect(screen.getByText(item.desc)).toBeInTheDocument()
    }
  })

  // ── 2 · both counts follow the data, not the layout ────────────────────────
  // Driven at lengths that are never the real 3 and 4, so a component that
  // renders a fixed three-row list or a fixed four-card grid cannot pass.
  it.each([
    [1, 2],
    [5, 7],
    [6, 1],
  ])(
    'renders %i content rows and %i audience rows for arrays of those lengths',
    (contentCount, audienceCount) => {
      const m = fixture(contentCount, audienceCount)
      render(<WhatYouGet m={m} locale="he" />)

      const contentRows = within(listNamed(m.whatContentTitle)).getAllByRole(
        'listitem',
      )
      const audienceRows = within(listNamed(m.whatAudienceTitle)).getAllByRole(
        'listitem',
      )

      expect(contentRows).toHaveLength(m.whatContent.length)
      expect(audienceRows).toHaveLength(m.whatAudience.length)
      expect(contentRows).toHaveLength(contentCount)
      expect(audienceRows).toHaveLength(audienceCount)
    },
  )

  // ── 3 · a `desc` cannot be dropped from EITHER list ────────────────────────
  // Per ROW, not per document: the denominator is the rows actually in the DOM,
  // and each row must carry its own entry's parts. A `desc` deleted from the
  // markup, or paired with the wrong title, turns this red.
  it('keeps every entry title, desc — and icon — together in its own row', () => {
    const m = catalogue('he')
    render(<WhatYouGet m={m} locale="he" />)

    const contentRows = within(listNamed(m.whatContentTitle)).getAllByRole(
      'listitem',
    )
    expect(contentRows).toHaveLength(m.whatContent.length)

    m.whatContent.forEach((item, index) => {
      const row = contentRows[index]
      expect(row).toBeDefined()
      const text = row?.textContent ?? ''
      expect(text).toContain(item.icon)
      expect(text).toContain(item.title)
      expect(text).toContain(item.desc)
    })

    const audienceRows = within(listNamed(m.whatAudienceTitle)).getAllByRole(
      'listitem',
    )
    expect(audienceRows).toHaveLength(m.whatAudience.length)

    m.whatAudience.forEach((item, index) => {
      const row = audienceRows[index]
      expect(row).toBeDefined()
      const text = row?.textContent ?? ''
      expect(text).toContain(item.title)
      expect(text).toContain(item.desc)
    })
  })

  // ── 4 · the backdrop: decorative, optimised, and never `priority` ──────────
  it('renders the backdrop through next/image with an empty alt and no priority', () => {
    const m = catalogue('he')
    const { container } = render(<WhatYouGet m={m} locale="he" />)

    // Full denominator: querySelectorAll, not getAllByRole — an image with
    // alt="" has role `presentation` and is invisible to a role query.
    const images = Array.from(container.querySelectorAll('img'))
    expect(images).toHaveLength(1)

    for (const img of images) {
      expect(img).toHaveAttribute('alt', '')
      // next/image rewrites `src`; a CSS background would emit no <img> at all,
      // so the presence of these attributes is what proves the pipeline (D-32).
      expect(img).toHaveAttribute('sizes')
      expect(img).toHaveAttribute('srcset')
      // `priority` emits no attribute of its own — it SUPPRESSES lazy loading.
      // See HONEST LIMIT 2.
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img.getAttribute('fetchpriority')).not.toBe('high')
    }

    // No CSS background-image anywhere in the section (ledger D-32).
    for (const node of Array.from(container.querySelectorAll<HTMLElement>('*'))) {
      expect(node.style.backgroundImage).toBe('')
    }
  })

  // ── 5 · logical CSS only (C5) ─────────────────────────────────────────────
  const PHYSICAL_PREFIXES = [
    'ml',
    'mr',
    'pl',
    'pr',
    'left',
    'right',
    'text-left',
    'text-right',
  ]

  it('writes no physical-direction class', () => {
    const m = catalogue('he')
    const { container } = render(<WhatYouGet m={m} locale="he" />)

    const nodes = Array.from(container.querySelectorAll<HTMLElement>('*'))
    expect(nodes.length).toBeGreaterThan(0)

    const offenders = nodes
      .flatMap((node) => node.className.split(/\s+/))
      .filter((token) => token.length > 0)
      .filter((token) =>
        PHYSICAL_PREFIXES.some(
          (prefix) => token === prefix || token.startsWith(`${prefix}-`),
        ),
      )

    expect(offenders).toEqual([])
  })

  // ── 6 · the locale claim, tested rather than asserted (ledger D-30) ────────
  // MEASURED: nothing in this component varies by `locale`. lang/dir live on
  // <html> (D-5) and direction is carried by logical CSS. So the honest test is
  // INVARIANCE — red the moment someone adds a locale branch.
  it('renders identical markup for every locale when given the same messages', () => {
    const m = fixture(2, 5)

    const rendered = LOCALES.map((locale) => {
      const { container } = render(<WhatYouGet m={m} locale={locale} />)
      return container.innerHTML
    })

    expect(LOCALES.length).toBeGreaterThan(1)
    const [first] = rendered
    expect(first).toBeDefined()
    for (const html of rendered) expect(html).toBe(first)
  })

  // The locale-dependent content arrives through `m`, and it really is different:
  // this is the difference that test 6 shows is NOT produced by the prop.
  it('renders different text for he and en because the catalogue differs', () => {
    const he = catalogue('he')
    const en = catalogue('en')

    expect(en.whatTitle).not.toBe(he.whatTitle)
    expect(en.whatContent).toHaveLength(he.whatContent.length)
    expect(en.whatAudience).toHaveLength(he.whatAudience.length)

    render(<WhatYouGet m={en} locale="en" />)
    expect(screen.getByText(en.whatTitle)).toBeInTheDocument()
    expect(screen.queryByText(he.whatTitle)).toBeNull()
  })
})
