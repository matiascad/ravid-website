// ─────────────────────────────────────────────────────────────────────────────
// W13-B HARDENING · app/[locale]/__tests__/not-found.test.tsx
//
// WHAT THIS FILE GUARDS, and — more importantly — WHAT IT DOES NOT.
//
// ⚠️ READ THIS BEFORE TRUSTING A GREEN RUN HERE. A vitest process is not a web
// server. Everything below is a CONTRACT guard on values and rendered markup.
// The two claims that actually matter to a visitor — "GET /he/nope returns a
// <title> of 404" and "GET /he still carries the security headers" — were
// measured by this delegate against a LIVE SERVER, by hand, once, and are
// recorded in the headers of the files they belong to. They are NOT re-measured
// here and CANNOT be: `next build` is out of bounds for this delegate and a dev
// server is not a thing a unit test should spawn. If you change the 404's title
// or the header set, this file will go red for the right reason — but it is a
// tripwire on the SOURCE OF the wire value, not on the wire.
//
// THE ONE NON-OBVIOUS ASSERTION is the absent-branch one. "Hebrew 404 copy does
// not exist" is not asserted as a NAME (a flag called `hebrewMissing`). It is
// asserted as a COMPUTED EFFECT: the rendered 404 markup is scanned for Hebrew
// CODE POINTS, and the document's own `lang` is required to agree with what the
// scan finds. So the unset state is not merely tolerated — it is required to be
// SELF-CONSISTENT. The day a human writes real Hebrew 404 copy and forgets to
// flip NOT_FOUND_COPY_LOCALE, THIS test goes red naming the mismatch, instead of
// the site quietly shipping Hebrew prose in a document declared English.
//
// ⚠️ CODE POINTS ARE NUMERIC HERE ON PURPOSE. Every Hebrew range in this file is
// written as 0x0590 / 0x05FF and compared arithmetically. There is not one
// backslash-u escape in this file and there must never be one: twice tonight an
// editor silently turned such an escape into real Hebrew inside a delegate's own
// test file, which is the one place a Hebrew-detector must never contain Hebrew.
// Verified with `cat -A`, not by eye.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'

import RootNotFound from '@/app/not-found'
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/config/site'
import { getMessages } from '@/i18n/messages'
import { LOCALE_DIRECTION } from '@/i18n/routing'

import LocaleNotFound, {
  NOT_FOUND_COPY_LOCALE,
  metadata as notFoundMetadata,
} from '../not-found'

/** The Hebrew block, and the Hebrew presentation forms. Numeric, always. */
const HEBREW_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x0590, 0x05ff],
  [0xfb1d, 0xfb4f],
]

function hebrewCodePointsIn(text: string): number[] {
  const found: number[] = []
  for (const character of text) {
    const point = character.codePointAt(0)
    if (point === undefined) continue
    if (HEBREW_RANGES.some(([low, high]) => point >= low && point <= high)) {
      found.push(point)
    }
  }
  return found
}

const REPO_ROOT = join(__dirname, '..', '..', '..')

describe('404 · the page title', () => {
  it('exports a title, so the 404 no longer inherits the memorial page title', () => {
    // MEASURED on a live server before this existed: /he/nope and /en/nope both
    // served the memorial page's own <title>. That is the defect. The guard
    // below is that a title exists AND that it is the catalogue's, not a
    // literal typed into the metadata object.
    expect(notFoundMetadata.title).toBe(
      getMessages(DEFAULT_LOCALE).notFound.title
    )
  })

  it('uses the same words in the tab as on the page — one home, not two', () => {
    const markup = renderToStaticMarkup(<LocaleNotFound />)
    expect(markup).toContain(`<h1 class="mb-4 text-4xl font-bold">${String(
      notFoundMetadata.title
    )}</h1>`)
  })

  it('never hardcodes the title — every locale catalogue supplies one', () => {
    for (const locale of LOCALES) {
      expect(getMessages(locale).notFound.title.length).toBeGreaterThan(0)
    }
  })
})

describe('404 · the absent Hebrew copy, proved absent rather than declared', () => {
  it('renders in both locale catalogues without throwing', () => {
    // "Renders absent, not broken." The component reads DEFAULT_LOCALE, but the
    // catalogue it reads must be complete for EVERY locale or the schema would
    // have failed — so both are exercised here, not just the default.
    for (const locale of LOCALES) {
      const copy = getMessages(locale).notFound
      expect(copy.title).toBeTypeOf('string')
      expect(copy.description).toBeTypeOf('string')
      expect(copy.backHome).toBeTypeOf('string')
    }
    expect(() => renderToStaticMarkup(<LocaleNotFound />)).not.toThrow()
  })

  it('declares a language that agrees with the code points actually rendered', () => {
    const markup = renderToStaticMarkup(<LocaleNotFound />)
    const hebrew = hebrewCodePointsIn(markup)
    if (NOT_FOUND_COPY_LOCALE === 'en') {
      // The unset state. If this goes red, Hebrew 404 copy has landed and
      // NOT_FOUND_COPY_LOCALE was not flipped with it.
      expect(hebrew).toEqual([])
    } else {
      // The state after the one human edit. If this goes red, the constant was
      // flipped without the words being written.
      expect(hebrew.length).toBeGreaterThan(0)
    }
  })

  it('is typed to a locale this site actually serves', () => {
    const declared: Locale = NOT_FOUND_COPY_LOCALE
    expect(LOCALES).toContain(declared)
  })
})

describe('404 · the root shell states the locale of the words, not of the site', () => {
  it('puts lang and dir on <html> from the one constant', () => {
    const markup = renderToStaticMarkup(<RootNotFound />)
    expect(markup).toContain(`lang="${NOT_FOUND_COPY_LOCALE}"`)
    expect(markup).toContain(`dir="${LOCALE_DIRECTION[NOT_FOUND_COPY_LOCALE]}"`)
  })

  it('states no second copy of the 404 — the shell renders the one component', () => {
    const shell = renderToStaticMarkup(<RootNotFound />)
    const page = renderToStaticMarkup(<LocaleNotFound />)
    expect(shell).toContain(page)
  })
})

describe('W13-B self-scan · no Hebrew code point in this delegate source', () => {
  // The files this delegate wrote or edited. A Hebrew character reaching any of
  // them means authored copy, a paste, or an editor unescaping something — all
  // three are refusable, and none is visible by eye in a review.
  const OWNED_FILES = [
    'app/[locale]/not-found.tsx',
    'app/not-found.tsx',
    'next.config.js',
    'app/[locale]/__tests__/not-found.test.tsx',
  ] as const

  for (const relative of OWNED_FILES) {
    it(`contains no Hebrew code point: ${relative}`, () => {
      const source = readFileSync(join(REPO_ROOT, relative), 'utf8')
      expect(hebrewCodePointsIn(source)).toEqual([])
    })
  }

  it('contains no backslash-u escape in this test file either', () => {
    // The hazard that bit twice tonight: an escape is invisible once an editor
    // resolves it. Detected by building the forbidden two-character sequence at
    // runtime, so this assertion cannot itself contain the thing it bans.
    const source = readFileSync(
      join(REPO_ROOT, 'app/[locale]/__tests__/not-found.test.tsx'),
      'utf8'
    )
    const forbidden = String.fromCharCode(0x5c) + 'u'
    expect(source.includes(forbidden)).toBe(false)
  })
})
