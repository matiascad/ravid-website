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

// ─────────────────────────────────────────────────────────────────────────────
// W16-FIX1 · THE PRERENDER TRIPWIRE.
//
// WHY THIS BLOCK EXISTS, and it is the only thing this delegate landed. MEASURED
// on Next 15.5.25, in an isolated build rig, ONE variable changed (a `getLocale()`
// call added to app/[locale]/not-found.tsx) against an otherwise identical tree:
//
//                              baseline        with the request read
//   route table                ● /[locale]     ● /[locale]   <- UNCHANGED
//   he.html / en.html on disk  PRESENT         ABSENT
//   prerender-manifest routes  7 (incl /he,    4 (/he, /en and /_not-found
//                              /en, /_not-found)   all gone)
//   /_not-found in the table   ○               f
//
// READ THE FIRST ROW AGAIN. `next build` STILL PRINTED THE BULLET, still listed
// /he and /en beneath it, and the two content pages were NOT prerendered. The
// build output is not a detector for this defect; it is a witness that reports
// the opposite of the truth. That is the same shape as this repo's `bg-gold`
// lesson - a green name over an absent thing - and it is why the guard below is
// a source scan and not a reading of the route table.
//
// WHAT IT ASSERTS: the two not-found boundary files import no locale reader and
// no request API. It is a tripwire on the CAUSE, checked in a process that costs
// no build. HONEST LIMIT: a scan of import statements is not a proof of absence
// of a request read - an indirect read through a helper module, or a dynamic
// import, passes this. It catches the way the defect has actually arrived twice,
// not every way it could. The build-artefact half (assert he.html and en.html
// exist after `next build`) is still owed and is not writable from here.
// ─────────────────────────────────────────────────────────────────────────────
describe('W16-FIX1 · no request-scoped read may enter a not-found boundary', () => {
  /** The two files Next renders as a not-found boundary in this project. */
  const BOUNDARY_FILES = [
    'app/[locale]/not-found.tsx',
    'app/not-found.tsx',
  ] as const

  /**
   * Module specifiers no boundary file may import AT ALL. Each one exists only
   * to tell a render who is asking, which is the read that empties the
   * prerender. `@/i18n/routing` is deliberately NOT here: app/not-found.tsx
   * imports LOCALE_DIRECTION from it, a module constant that reads nothing. The
   * navigation primitive from that module is caught by name instead.
   */
  const BANNED_MODULES = [
    'next/headers',
    'next-intl/server',
    'next/root-params',
  ] as const

  /**
   * Named imports no boundary file may take, whatever module they come from.
   * `Link` is on this list ONLY for `@/i18n/routing`: next-intl's server Link
   * calls getLocale() unconditionally, before it reads its own `locale` prop, so
   * passing the locale explicitly does not avoid the read.
   */
  const BANNED_NAMES = [
    'useLocale',
    'getLocale',
    'setRequestLocale',
    'getTranslations',
    'headers',
    'cookies',
    'draftMode',
    'connection',
    'unstable_rootParams',
  ] as const

  function importStatementsIn(source: string): string[] {
    return source.split('\n').filter((line) => line.trimStart().startsWith('import '))
  }

  for (const relative of BOUNDARY_FILES) {
    const source = () => readFileSync(join(REPO_ROOT, relative), 'utf8')

    it(`imports no request-scoped module: ${relative}`, () => {
      const offenders = importStatementsIn(source()).filter((line) =>
        BANNED_MODULES.some((mod) => line.includes(`'${mod}'`))
      )
      expect(offenders).toEqual([])
    })

    it(`imports no locale reader by name: ${relative}`, () => {
      const offenders = importStatementsIn(source()).filter((line) =>
        BANNED_NAMES.some((name) => new RegExp(`\\b${name}\\b`).test(line))
      )
      expect(offenders).toEqual([])
    })

    it(`takes no navigation primitive from the routing module: ${relative}`, () => {
      const offenders = importStatementsIn(source()).filter(
        (line) =>
          line.includes("'@/i18n/routing'") &&
          /\b(Link|redirect|usePathname|useRouter|getPathname)\b/.test(line)
      )
      expect(offenders).toEqual([])
    })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// W16-FIX4 · THE LANGUAGE OF THE PART, ASSERTED AS A COMPUTED RELATION.
//
// ⚠️ WHAT THIS DOES NOT DO, first, because the file's own header warns about it:
// it does not assert that an attribute appears in the JSX. A string match on
// `lang="he"` would pass over markup where the attribute sits on a sibling, or
// on an element that contains none of the words. The measurement that matters —
// and the one taken in a real browser for this fix — is: WALK UP FROM THE TEXT
// NODE THAT ACTUALLY HOLDS THE HEBREW AND READ THE NEAREST `lang` ANCESTOR.
// That is what these tests compute, over the real rendered DOM, in the same
// direction assistive technology resolves it.
//
// THE THIRD TEST IS THE ONE THAT PROVES THE ARCHITECTURE. It mounts the 404
// inside a HOSTILE shell that declares the OTHER locale — which is exactly the
// served condition on /en/<missing>, measured in Chromium: the [locale] layout's
// `<html lang="en" dir="ltr">` wins hydration while every rendered word is
// Hebrew. If the annotation lived on the document element, that test could not
// be written at all. It passes only because the declaration lives INSIDE the
// subtree this component owns.
// ─────────────────────────────────────────────────────────────────────────────
describe('W16-FIX4 · every Hebrew text node declares its own language', () => {
  /** The nearest ancestor `lang`/`dir`, walked up from a node, as a browser would. */
  function nearestLanguageAnnotation(
    node: Node
  ): { lang: string | null; dir: string | null } {
    let current: Node | null = node
    while (current) {
      if (current.nodeType === 1) {
        const element = current as Element
        if (element.hasAttribute('lang')) {
          return {
            lang: element.getAttribute('lang'),
            dir: element.getAttribute('dir'),
          }
        }
      }
      current = current.parentNode
    }
    return { lang: null, dir: null }
  }

  /** Every text node in `root` that contains at least one Hebrew code point. */
  function hebrewTextNodes(root: ParentNode & Node): Text[] {
    const found: Text[] = []
    const walk = (node: Node) => {
      if (node.nodeType === 3) {
        const text = node as Text
        if (hebrewCodePointsIn(text.data).length > 0) found.push(text)
        return
      }
      node.childNodes.forEach(walk)
    }
    walk(root)
    return found
  }

  function parse(markup: string): HTMLElement {
    const host = document.createElement('div')
    host.innerHTML = markup
    return host
  }

  const OTHER_LOCALE = LOCALES.find((locale) => locale !== NOT_FOUND_COPY_LOCALE)

  it('finds Hebrew to annotate at all — the premise, not assumed', () => {
    // If this goes red the catalogue changed and the two tests below would pass
    // VACUOUSLY. DENOMINATOR BEFORE VERDICT: they are only meaningful while the
    // rendered copy actually contains the script being annotated.
    const nodes = hebrewTextNodes(parse(renderToStaticMarkup(<LocaleNotFound />)))
    expect(nodes.length).toBeGreaterThan(0)
  })

  it('declares lang and dir on an ancestor of every Hebrew text node it renders', () => {
    const nodes = hebrewTextNodes(parse(renderToStaticMarkup(<LocaleNotFound />)))
    const annotations = nodes.map((node) => nearestLanguageAnnotation(node))
    expect(annotations).toEqual(
      nodes.map(() => ({
        lang: NOT_FOUND_COPY_LOCALE,
        dir: LOCALE_DIRECTION[NOT_FOUND_COPY_LOCALE],
      }))
    )
  })

  it('holds inside a shell that declares the OTHER locale — the /en/<missing> case', () => {
    // The measured production condition, reconstructed: the surviving <html>
    // says `en`/`ltr` and every word below it is Hebrew. The component must
    // still resolve to its own language, or a screen reader reads Hebrew in an
    // English voice. This is the assertion that fails if the annotation is
    // moved back out to any document-level element.
    expect(OTHER_LOCALE).toBeDefined()
    const hostile = renderToStaticMarkup(
      <div lang={OTHER_LOCALE} dir={LOCALE_DIRECTION[OTHER_LOCALE as Locale]}>
        <LocaleNotFound />
      </div>
    )
    const nodes = hebrewTextNodes(parse(hostile))
    expect(nodes.length).toBeGreaterThan(0)
    for (const node of nodes) {
      expect(nearestLanguageAnnotation(node)).toEqual({
        lang: NOT_FOUND_COPY_LOCALE,
        dir: LOCALE_DIRECTION[NOT_FOUND_COPY_LOCALE],
      })
    }
  })

  it('does not restate the locale — lang, dir and the words are one expression', () => {
    // ONE FACT ONE PLACE, checked as a property rather than by reading the file:
    // the annotation tracks NOT_FOUND_COPY_LOCALE, which is itself DEFAULT_LOCALE,
    // which is what supplies the words. A literal typed into the JSX would pass
    // the tests above today and go silently wrong the day the constant moves;
    // this one pins the three to each other.
    expect(NOT_FOUND_COPY_LOCALE).toBe(DEFAULT_LOCALE)
    const nodes = hebrewTextNodes(parse(renderToStaticMarkup(<LocaleNotFound />)))
    const words = getMessages(DEFAULT_LOCALE).notFound
    expect(nodes.map((node) => node.data).join(' ')).toContain(words.description)
    expect(nodes.map((node) => nearestLanguageAnnotation(node).lang)).toEqual(
      nodes.map(() => DEFAULT_LOCALE)
    )
  })
})
