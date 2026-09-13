// ─────────────────────────────────────────────────────────────────────────────
// W4-01 HERO TEST · components/sections/__tests__/Hero.test.tsx
//
// It drives the section with the REAL catalogues — `getMessages('he')` and
// `getMessages('en')` — rather than a hand-typed fixture. That is deliberate and
// it is the point of the suite: a hand-typed fixture tests the component against
// the test author's memory of the data, while the real catalogue tests it
// against the data the site will actually serve. A key deleted or renamed in
// messages/he.json therefore fails HERE — either as a throw from the catalogue
// schema at import, or as a `getByText` that finds nothing — instead of
// rendering `undefined` in production.
//
// HONEST LIMIT of this file: it proves the DOM the section produces. It cannot
// prove the section flips visually under `dir="rtl"` (jsdom lays nothing out),
// it cannot prove the `/images/*.webp` files W6 owes actually exist, and it
// cannot prove any memorial fact is true. Nor can it prove a COLOUR: jsdom
// computes no styles, so the accent test below proves `.text-gold` reaches
// exactly one element, never that the element renders gold.
// ─────────────────────────────────────────────────────────────────────────────

import { render, screen } from '@testing-library/react'

import { Hero } from '@/components/sections/Hero'
import { anchor, SECTION_IDS } from '@/config/site'
import { getMessages, SOURCE_LOCALE } from '@/i18n/messages'

const he = getMessages('he')
const en = getMessages('en')

/** Every string key this section consumes. The list IS the regression test. */
const TEXT_KEYS = [
  'heroTitle',
  'heroSubtitle',
  'heroSubtitle2',
  'heroCta',
  'heroStory',
  'heroDates',
  'heroRole',
  'heroBrigade',
  'heroBattalion',
] as const

/**
 * Physical-direction Tailwind utilities — the margin, padding, inset and
 * text-alignment families that do NOT flip with `dir` — including under a
 * responsive or state variant. Spelled only as the alternation below, so a
 * repo-wide sweep for such a class does not trip over this file's own prose.
 */
const PHYSICAL_DIRECTION = /(?:^|[\s:])(?:ml|mr|pl|pr|left|right)-|(?:^|[\s:])text-(?:left|right)(?:$|\s)/

/** The portrait's basename — the key into `imageAlts` AND the file name. */
const PORTRAIT_KEY = 'tuval-hero' as const

/** The utility declared once at app/globals.css:108, bound to `--accent`. */
const ACCENT_CLASS = 'text-gold'

describe('Hero', () => {
  it('renders every message key it consumes, from the catalogue', () => {
    render(<Hero m={he} locale={SOURCE_LOCALE} />)

    for (const key of TEXT_KEYS) {
      expect(screen.getByText(he[key])).toBeInTheDocument()
    }
  })

  it('renders one badge per catalogue entry, each with its catalogue alt', () => {
    render(<Hero m={he} locale={SOURCE_LOCALE} />)

    expect(he.heroBadges).toHaveLength(3)
    for (const badge of he.heroBadges) {
      expect(screen.getByAltText(badge.alt)).toBeInTheDocument()
    }
  })

  it('carries the `top` anchor id', () => {
    const { container } = render(<Hero m={he} locale={SOURCE_LOCALE} />)

    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', SECTION_IDS.top)
  })

  it('points its CTA at the lead form anchor and its secondary link at the story', () => {
    render(<Hero m={he} locale={SOURCE_LOCALE} />)

    expect(screen.getByText(he.heroCta).closest('a')).toHaveAttribute('href', anchor(SECTION_IDS.form))
    expect(screen.getByText(he.heroStory).closest('a')).toHaveAttribute('href', anchor(SECTION_IDS.story))
  })

  it('renders four images, every one of them with a non-empty alt', () => {
    const { container } = render(<Hero m={he} locale={SOURCE_LOCALE} />)

    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(4)
    for (const image of images) {
      expect(image.getAttribute('alt')).toBeTruthy()
    }
  })

  it('gives the portrait LCP priority and leaves the badges lazy', () => {
    // `priority` emits no attribute of its own on next@15.5 — it SUPPRESSES
    // `loading="lazy"`. So the observable claim is: the portrait is the one
    // image on this section that is not lazy. Delete `priority` and this is red.
    const { container } = render(<Hero m={he} locale={SOURCE_LOCALE} />)

    const portrait = screen.getByAltText(he.imageAlts[PORTRAIT_KEY])
    expect(portrait).not.toHaveAttribute('loading')
    expect(portrait.getAttribute('src')).toContain('tuval-hero')

    const lazy = [...container.querySelectorAll('img')].filter(
      (image) => image.getAttribute('loading') === 'lazy',
    )
    expect(lazy).toHaveLength(3)
  })

  it('annotates the source-locale badge alts only on a non-source locale', () => {
    // The badge alts are Hebrew proper nouns in EVERY locale (ledger D-18), so on
    // the English page their language context must be declared. That annotation
    // is the one thing in this section that varies by locale.
    const badgeContexts = (tree: HTMLElement) =>
      he.heroBadges
        .map((badge) => tree.querySelector(`img[alt="${badge.alt}"]`)?.parentElement)
        .filter((wrapper): wrapper is HTMLElement => wrapper !== null && wrapper !== undefined)

    const { container: sourceTree } = render(<Hero m={he} locale={SOURCE_LOCALE} />)
    const sourceBadges = badgeContexts(sourceTree)
    expect(sourceBadges).toHaveLength(3)
    for (const badge of sourceBadges) {
      expect(badge).not.toHaveAttribute('lang')
    }

    const { container: englishTree } = render(<Hero m={en} locale="en" />)
    const englishBadges = badgeContexts(englishTree)
    expect(englishBadges).toHaveLength(3)
    for (const badge of englishBadges) {
      expect(badge).toHaveAttribute('lang', SOURCE_LOCALE)
    }
  })

  it('takes its copy from the catalogue, not from the component', () => {
    // The two locales must produce different visible copy from identical markup:
    // proof that no string in this section is baked into the component.
    const { container: hebrew } = render(<Hero m={he} locale={SOURCE_LOCALE} />)
    const hebrewHeading = hebrew.querySelector('h1')?.textContent

    const { container: english } = render(<Hero m={en} locale="en" />)
    const englishHeading = english.querySelector('h1')?.textContent

    expect(hebrewHeading).toBe(he.heroTitle)
    expect(englishHeading).toBe(en.heroTitle)
    expect(hebrewHeading).not.toBe(englishHeading)

    // ...and the badge alts are the SAME in both, because they are proper nouns
    // served from the source locale in every locale (ledger D-18).
    for (const badge of en.heroBadges) {
      expect(hebrew.querySelector(`img[alt="${badge.alt}"]`)).not.toBeNull()
      expect(english.querySelector(`img[alt="${badge.alt}"]`)).not.toBeNull()
    }
  })

  it('names the portrait from the dedicated alt catalogue, never from visible copy', () => {
    // The stopgap this replaced was `m.heroSubtitle`, which is ALSO rendered as
    // visible text two elements below, so a screen reader heard it twice.
    // Restoring that stopgap turns BOTH assertions below red.
    const { container } = render(<Hero m={he} locale={SOURCE_LOCALE} />)

    const portrait = container.querySelector('img[src*="tuval-hero"]')
    expect(portrait).not.toBeNull()
    expect(portrait?.getAttribute('alt')).toBe(he.imageAlts[PORTRAIT_KEY])
    expect(portrait?.getAttribute('alt')).not.toBe(he.heroSubtitle)
  })

  it('gives the gold accent to the dates and to nothing else', () => {
    // `.text-gold` is a UTILITY (app/globals.css:108 -> `hsl(var(--accent))`),
    // not a design token — searching for a `--gold` token finds nothing and
    // concludes wrongly. The customer applies it to exactly one fact, the dates
    // (ravid_website1/src/components/HeroSection.tsx:48). Drop the class and the
    // count is 0; widen it to the whole meta row and the count is 4. Both red.
    const { container } = render(<Hero m={he} locale={SOURCE_LOCALE} />)

    const accented = [...container.querySelectorAll('*')].filter((element) =>
      (element.getAttribute('class') ?? '').split(/\s+/).includes(ACCENT_CLASS),
    )

    expect(accented).toHaveLength(1)
    expect(accented[0]?.textContent).toBe(he.heroDates)
  })

  it('emits no physical-direction class, so the same markup can flip', () => {
    const { container } = render(<Hero m={he} locale={SOURCE_LOCALE} />)

    const offenders = [...container.querySelectorAll('*')]
      .map((element) => element.getAttribute('class') ?? '')
      .filter((className) => PHYSICAL_DIRECTION.test(className))

    expect(offenders).toEqual([])
  })
})
