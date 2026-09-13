// ─────────────────────────────────────────────────────────────────────────────
// W12-A · lib/seo/__tests__/jsonld.test.ts
//
// ⚠ WHAT THIS FILE PROVES, AND WHAT IT DOES NOT. Read before trusting a green bar.
//
// PROVED (computed effects, never names):
//   · The SERIALISED text — the exact string that reaches the browser — parses
//     as JSON, and the PARSED OBJECT carries specific fields with specific
//     values. No assertion here says "a script tag exists". A tag-presence test
//     passes with malformed JSON inside, which is worthless to a crawler and is
//     the single commonest way this feature ships broken (Law 8).
//   · That `Review`, `AggregateRating`, `ratingValue`, `reviewCount` and `Offer`
//     are ABSENT — checked by WALKING the parsed object, so a fabricated rating
//     nested six levels deep is caught, not just one at the top.
//   · That a hostile catalogue string cannot break out of `<script>`.
//   · That with the env override unset — TODAY'S STATE — the output names the
//     configured origin and NO OTHER HOST.
//
// NOT PROVED, and NOT-MEASURED — named so nobody mistakes green for validated:
//   · ⚠️ THAT GOOGLE ACCEPTS THIS MARKUP. Neither the Rich Results Test nor the
//     Schema.org validator is reachable from here. Nothing below is evidence of
//     validation, and no line in this file should ever be quoted as if it were.
//     Owner: a human with a browser and Search Console.
//   · That the script element renders into the served document. That is Next's
//     renderer, provable only by a build or an HTTP fetch, both outside this
//     delegate's gate. What is proved is the STRING the mount site is handed.
//   · That any URL here resolves. `lib/seo.ts` HONEST LIMIT 5, unchanged.
//
// HONEST LIMIT  The hostile fixture proves ESCAPING, not sanitisation. A
//               catalogue sentence that is merely WRONG serialises perfectly.
//               This file cannot read a memorial page and tell you it is true.
// ─────────────────────────────────────────────────────────────────────────────

import { LOCALES, SITE_URL, type Locale } from '@/config/site'
import { type MetadataCopy, localeUrl, ogImageUrl, siteOrigin } from '@/lib/seo'
import {
  JSON_LD_SCRIPT_TYPE,
  SCHEMA_CONTEXT,
  buildJsonLd,
  jsonLdFor,
  serialiseJsonLd,
} from '@/lib/seo/jsonld'

const ENV_KEY = 'NEXT_PUBLIC_SITE_URL'

/** Today's state: no override set. Every test starts from the shipping branch. */
let savedEnv: string | undefined

beforeEach(() => {
  savedEnv = process.env[ENV_KEY]
  delete process.env[ENV_KEY]
})

afterEach(() => {
  if (savedEnv === undefined) {
    delete process.env[ENV_KEY]
  } else {
    process.env[ENV_KEY] = savedEnv
  }
})

/* ── narrowing helpers: parsed JSON is `unknown`, and stays honest ─────────── */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The node at `@graph[index]`, or a failed expectation — never a cast. */
function graphNode(parsed: unknown, index: number): Record<string, unknown> {
  expect(isRecord(parsed)).toBe(true)
  if (!isRecord(parsed)) throw new Error('unreachable: guarded above')
  const graph = parsed['@graph']
  expect(Array.isArray(graph)).toBe(true)
  if (!Array.isArray(graph)) throw new Error('unreachable: guarded above')
  const node: unknown = graph[index]
  expect(isRecord(node)).toBe(true)
  if (!isRecord(node)) throw new Error('unreachable: guarded above')
  return node
}

/** Every key, and every string value, anywhere in the parsed tree. */
function walk(value: unknown, keys: string[], strings: string[]): void {
  if (typeof value === 'string') {
    strings.push(value)
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) walk(item, keys, strings)
    return
  }
  if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      keys.push(key)
      walk(child, keys, strings)
    }
  }
}

function collect(parsed: unknown): { keys: string[]; strings: string[] } {
  const keys: string[] = []
  const strings: string[] = []
  walk(parsed, keys, strings)
  return { keys, strings }
}

/** The real copy shape, with obviously-synthetic text. No catalogue is read. */
const COPY: MetadataCopy = {
  title: 'FIXTURE TITLE',
  description: 'FIXTURE DESCRIPTION',
}

const parseFor = (locale: Locale, copy: MetadataCopy = COPY): unknown =>
  JSON.parse(jsonLdFor(locale, copy))

/* ── 1 · the PARSED OBJECT, never the tag ─────────────────────────────────── */

describe('the emitted JSON-LD, parsed', () => {
  it('is valid JSON — the thing a tag-presence test cannot see', () => {
    for (const locale of LOCALES) {
      expect(() => JSON.parse(jsonLdFor(locale, COPY))).not.toThrow()
    }
  })

  it('round-trips: the escaped text parses back to the unescaped graph', () => {
    // Proves the `<` escaping changes the BYTES without changing the VALUE.
    for (const locale of LOCALES) {
      const graph = buildJsonLd(locale, COPY)
      expect(JSON.parse(serialiseJsonLd(graph))).toEqual(JSON.parse(JSON.stringify(graph)))
    }
  })

  it('declares the schema.org context on the parsed object', () => {
    const parsed = parseFor('he')
    expect(isRecord(parsed)).toBe(true)
    if (!isRecord(parsed)) return
    expect(parsed['@context']).toBe('https://schema.org')
    expect(SCHEMA_CONTEXT).toBe('https://schema.org')
  })

  it('carries exactly two nodes: WebSite then WebPage', () => {
    const parsed = parseFor('en')
    if (!isRecord(parsed)) throw new Error('unreachable')
    const graph = parsed['@graph']
    expect(Array.isArray(graph)).toBe(true)
    if (!Array.isArray(graph)) return
    // DENOMINATOR: 2. A third node is a deliberate type change, not a drift.
    expect(graph).toHaveLength(2)
    expect(graphNode(parsed, 0)['@type']).toBe('WebSite')
    expect(graphNode(parsed, 1)['@type']).toBe('WebPage')
  })

  it('states the WebPage fields as the VALUES their single sources produce', () => {
    const copy: MetadataCopy = { title: 'T-fixture', description: 'D-fixture' }
    const parsed = parseFor('he', copy)
    const page = graphNode(parsed, 1)

    expect(page['name']).toBe('T-fixture')
    expect(page['description']).toBe('D-fixture')
    expect(page['inLanguage']).toBe('he')
    // The canonical is not restated here — it is the same function call.
    expect(page['@id']).toBe(localeUrl('he'))
    expect(page['url']).toBe(localeUrl('he'))
    expect(page['primaryImageOfPage']).toBe(ogImageUrl())
  })

  it('lists both locales on the WebSite node, derived from LOCALES', () => {
    const site = graphNode(parseFor('he'), 0)
    expect(site['inLanguage']).toEqual([...LOCALES])
  })

  it('points the page at the site node by @id rather than restating it', () => {
    const parsed = parseFor('en')
    const site = graphNode(parsed, 0)
    const page = graphNode(parsed, 1)
    expect(page['isPartOf']).toEqual({ '@id': site['@id'] })
  })

  it('names the script type crawlers actually read', () => {
    expect(JSON_LD_SCRIPT_TYPE).toBe('application/ld+json')
  })
})

/* ── 2 · the `</script>` breakout, proved with a hostile fixture ───────────── */

describe('a hostile catalogue string cannot escape the script element', () => {
  /** Every documented way out of script data begins with `<`. All three here. */
  const HOSTILE: MetadataCopy = {
    title: '</script><script>alert(1)</script>',
    description: '<!-- <script> " \\ </SCRIPT > </script/>',
  }

  it('emits no `<` at all — so no tag can start', () => {
    for (const locale of LOCALES) {
      const text = jsonLdFor(locale, HOSTILE)
      expect(text).not.toContain('<')
      expect(text.toLowerCase()).not.toContain('</script')
      expect(text.toLowerCase()).not.toContain('<script')
      expect(text).not.toContain('<!--')
    }
  })

  it('the escape is lossless: the hostile text survives as DATA', () => {
    // Escaping that mangled the value would be a different bug, not a fix.
    const page = graphNode(parseFor('he', HOSTILE), 1)
    expect(page['name']).toBe(HOSTILE.title)
    expect(page['description']).toBe(HOSTILE.description)
  })

  it('the escaping is what does it — the unescaped form WOULD break out', () => {
    // If this stops being true, the test above has stopped testing anything.
    const raw = JSON.stringify(buildJsonLd('he', HOSTILE))
    expect(raw).toContain('</script')
    expect(serialiseJsonLd(buildJsonLd('he', HOSTILE))).not.toContain('</script')
  })
})

/* ── 3 · THE MOST IMPORTANT TEST: no rating, no review, no offer ──────────── */

describe('no fabricated commercial or reputational claim is ever emitted', () => {
  /**
   * ⛔ If you are here because you added one of these, STOP.
   *
   * There is NO RATING in this repository — not a star, not a score, not a count
   * of raters. `messages/{he,en}.json` `testimonials` holds 3 unrated quotes;
   * `testimonials[0].sub` is `""` in both locales. A `ratingValue` of 5, of 4.9,
   * or a `reviewCount` of 3 derived from the size of that array, is a NUMBER
   * THAT DOES NOT EXIST, published as a machine-readable claim to Google about a
   * bereaved family. It is a false sworn statement and it risks a manual action
   * that removes this memorial from search entirely.
   *
   * Make this test pass by DELETING the field, never by relaxing the list.
   */
  const FORBIDDEN_KEYS = [
    'aggregateRating',
    'ratingValue',
    'reviewCount',
    'ratingCount',
    'bestRating',
    'worstRating',
    'review',
    'reviews',
    'offers',
    'price',
    'priceCurrency',
    // Identity claims about a person this graph does not name (see jsonld.ts).
    'alumniOf',
    'worksFor',
    'award',
    'awards',
    'memberOf',
    'jobTitle',
    'sameAs',
  ] as const

  const FORBIDDEN_TYPES = [
    'Review',
    'AggregateRating',
    'Offer',
    'AggregateOffer',
    'Rating',
    'Product',
  ] as const

  it('emits none of the forbidden keys, at ANY depth of the parsed object', () => {
    for (const locale of LOCALES) {
      const { keys } = collect(parseFor(locale))
      expect(keys.length).toBeGreaterThan(0)
      for (const forbidden of FORBIDDEN_KEYS) {
        expect(keys, `${locale}: emitted a forbidden key`).not.toContain(forbidden)
      }
    }
  })

  it('declares none of the forbidden @types, at ANY depth', () => {
    for (const locale of LOCALES) {
      const { strings } = collect(parseFor(locale))
      for (const forbidden of FORBIDDEN_TYPES) {
        expect(strings, `${locale}: declared @type ${forbidden}`).not.toContain(forbidden)
      }
    }
  })

  it('the walker CAN see a nested key — otherwise the two tests above decorate', () => {
    const planted = { a: { b: [{ aggregateRating: { ratingValue: 5 } }] } }
    const { keys, strings } = collect(planted)
    expect(keys).toContain('aggregateRating')
    expect(keys).toContain('ratingValue')
    expect(collect({ x: 'Review' }).strings).toContain('Review')
    expect(strings).not.toContain('Review')
  })

  it('emits no testimonial text — the catalogue quotes never become markup', () => {
    // The graph reads `heroTitle`/`heroSubtitle*` through metadataCopy() and
    // nothing else. It has no access to `testimonials` and never imports it.
    const { strings } = collect(parseFor('he'))
    for (const value of strings) {
      expect(value).not.toContain('testimonial')
    }
  })
})

/* ── 4 · the unset host — today's state ───────────────────────────────────── */

describe('with NEXT_PUBLIC_SITE_URL unset, nothing is fabricated', () => {
  const configuredOrigin = new URL(SITE_URL).origin

  it('every URL is absolute, and every SITE url is on the ONE configured origin', () => {
    for (const locale of LOCALES) {
      const { strings } = collect(parseFor(locale))
      const urls = strings.filter((value) => value.includes('://'))

      // The graph holds exactly ONE url that is not a claim about this site:
      // `@context`, the schema.org VOCABULARY. Partitioned explicitly rather
      // than filtered away, so a second foreign host cannot hide in the gap.
      const vocabulary = urls.filter((url) => new URL(url).origin === SCHEMA_CONTEXT)
      const siteUrls = urls.filter((url) => new URL(url).origin !== SCHEMA_CONTEXT)

      // DENOMINATOR: 7 url-valued strings — @context, WebSite @id, WebSite url,
      // WebPage @id, WebPage url, isPartOf @id, primaryImageOfPage.
      expect(urls).toHaveLength(7)
      expect(vocabulary).toEqual([SCHEMA_CONTEXT])
      expect(siteUrls).toHaveLength(6)

      for (const url of siteUrls) {
        expect(() => new URL(url)).not.toThrow()
        expect(new URL(url).origin, `${locale}: ${url} left the configured origin`).toBe(
          configuredOrigin,
        )
      }
    }
  })

  it('the serialised text contains NO host other than the configured one', () => {
    // A fabricated domain anywhere — a placeholder, an example.com, a CDN —
    // would show up here even if it never reached a URL-shaped field.
    for (const locale of LOCALES) {
      const text = jsonLdFor(locale, COPY)
      const hosts = new Set(
        [...text.matchAll(/https?:\/\/[^"\\/]+/g)].map((match) => match[0]),
      )
      // schema.org is the @context vocabulary, not a claim about this site.
      hosts.delete('https://schema.org')
      expect([...hosts]).toEqual([configuredOrigin])
    }
  })

  it('follows the env override when a deploy sets one', () => {
    process.env[ENV_KEY] = 'https://override.example.org'
    const page = graphNode(parseFor('he'), 1)
    expect(page['url']).toBe('https://override.example.org/he')
    expect(siteOrigin()).toBe('https://override.example.org')
  })
})

/* ── 5 · both locales, self-referencing and mutually consistent ───────────── */

describe('canonical and hreflang agree with the graph, in both locales', () => {
  it('each locale self-references: the @id IS that locale`s canonical', () => {
    for (const locale of LOCALES) {
      const page = graphNode(parseFor(locale), 1)
      expect(page['@id']).toBe(localeUrl(locale))
      expect(page['url']).toBe(localeUrl(locale))
      expect(page['inLanguage']).toBe(locale)
    }
  })

  it('the locales produce DIFFERENT page ids but the SAME site node', () => {
    const he = parseFor('he')
    const en = parseFor('en')
    expect(graphNode(he, 1)['@id']).not.toBe(graphNode(en, 1)['@id'])
    expect(graphNode(he, 0)).toEqual(graphNode(en, 0))
  })

  it('the graph names exactly the locales the routing contract knows', () => {
    const site = graphNode(parseFor('he'), 0)
    expect(site['inLanguage']).toEqual([...LOCALES])
    expect(LOCALES).toHaveLength(2)
  })
})

/* ── 6 · self-scan: this write-set stays ASCII, and `@/lib/seo` still resolves ─ */

describe('the W12-A write-set as text', () => {
  /**
   * Built from NUMERIC CODE POINTS, never from `\uXXXX` escapes in this source.
   * Ledger D-82: an editor silently unescaped `֐` into a real Hebrew
   * character inside a sibling's own test file, which made the guard match
   * itself. `String.fromCodePoint(0x0590)` cannot be unescaped — there is no
   * escape sequence in the file to unescape.
   */
  const HEBREW_BLOCK = new RegExp(
    `[${String.fromCodePoint(0x0590)}-${String.fromCodePoint(0x05ff)}]`,
  )

  it('the Hebrew guard CAN go red — proved on a runtime-built string', () => {
    expect(HEBREW_BLOCK.test(String.fromCodePoint(0x05d0))).toBe(true)
    expect(HEBREW_BLOCK.test('plain ascii')).toBe(false)
  })

  it('emits 0 Hebrew codepoints for an ASCII fixture (ledger D-13)', () => {
    for (const locale of LOCALES) {
      expect(jsonLdFor(locale, COPY)).not.toMatch(HEBREW_BLOCK)
    }
  })

  it('passes Hebrew copy through intact when the catalogue is Hebrew', () => {
    // The guard above is about THIS FILE'S fixtures, not a ban on Hebrew data.
    const aleph = String.fromCodePoint(0x05d0)
    const page = graphNode(parseFor('he', { title: aleph, description: aleph }), 1)
    expect(page['name']).toBe(aleph)
  })

  it('`@/lib/seo` still resolves to the FILE, not the new directory', () => {
    // A computed effect, not a name: `lib/seo.ts` and `lib/seo/` now coexist,
    // and this asserts the import above actually reached the module that owns
    // the origin. If the directory ever shadows the file, this goes red here
    // rather than as a mystery 404 in production.
    expect(typeof siteOrigin).toBe('function')
    expect(new URL(siteOrigin()).origin).toBe(siteOrigin())
  })
})
