// ─────────────────────────────────────────────────────────────────────────────
// W3-C · i18n/__tests__/messages.test.ts — PROOF THAT THE SCHEMA CAN REJECT
//
// A schema that accepts everything is indistinguishable from no schema, and that
// is precisely the defect W3-C exists to close: W3-A's `AppConfig` key typing
// collapsed to `string` and NOTHING COULD DETECT ITS FALSITY. So the centre of
// gravity of this file is not "the real catalogue passes" — it is the MUTANT
// table: for each way a catalogue can be wrong, the schema must reject it AND
// name the offending path. A green run of only the happy-path tests would prove
// nothing at all.
//
// THREE STATES, NEVER COLLAPSED. `notFound` is being added to both catalogues by
// a concurrent delegate and was ABSENT when this file landed. Tests that cannot
// be measured until it lands are SKIPPED with the reason in their name, never
// quietly passed and never deleted — and their inverses run instead, so exactly
// one of each pair executes in either world and neither ever needs editing.
// ─────────────────────────────────────────────────────────────────────────────

import enMessages from '../../messages/en.json'
import heMessages from '../../messages/he.json'
import { catalogueSchema, getMessages, resolvedSchema, SOURCE_LOCALE, SOURCE_ONLY_KEYS } from '../messages'

/**
 * The raw catalogues as plain data. Typed `Record<string, unknown>` on purpose:
 * these tests must be able to build catalogues the schema REJECTS, and the
 * inferred JSON type would forbid exactly those mutations at compile time.
 */
const HE: Record<string, unknown> = heMessages
const EN: Record<string, unknown> = enMessages

/** The one documented Hebrew-only key (ledger D-18). */
const HE_ONLY_KEY = 'heroBadges'

/** The dependency landing concurrently. Drives every skip in this file. */
const NOT_FOUND_LANDED = 'notFound' in HE && 'notFound' in EN
const itWhenLanded = NOT_FOUND_LANDED ? it : it.skip
const itUntilLanded = NOT_FOUND_LANDED ? it.skip : it

/** Deep clone so a mutant can never alter the imported catalogue. */
function clone(source: Record<string, unknown>): Record<string, unknown> {
  return structuredClone(source)
}

/** Every issue path a schema reported, dotted. `<root>` for top-level issues. */
function rejectionPaths(result: { success: boolean; error?: { issues: readonly { path: readonly PropertyKey[] }[] } }): string[] {
  if (result.success || result.error === undefined) return []
  return result.error.issues.map((issue) => issue.path.map(String).join('.') || '<root>')
}

/** Every issue message a schema reported. */
function rejectionMessages(result: { success: boolean; error?: { issues: readonly { message: string }[] } }): string[] {
  if (result.success || result.error === undefined) return []
  return result.error.issues.map((issue) => issue.message)
}

/** Leaves (strings) reachable in a catalogue — the denominator for coverage. */
function countLeaves(value: unknown): number {
  if (typeof value === 'string') return 1
  if (Array.isArray(value)) return value.reduce<number>((n, v) => n + countLeaves(v), 0)
  if (value !== null && typeof value === 'object') {
    return Object.values(value).reduce<number>((n, v) => n + countLeaves(v), 0)
  }
  return 0
}

/**
 * THE PARITY CHECK, as a function so that test 5b can run it against a mutant
 * and prove it is capable of failing. Returns the keys that differ between two
 * catalogues, minus the one documented Hebrew-only key.
 */
function undocumentedKeyDifferences(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
): string[] {
  const sourceKeys = Object.keys(source)
  const targetKeys = Object.keys(target)
  const onlyInSource = sourceKeys.filter(
    (k) => !targetKeys.includes(k) && !(SOURCE_ONLY_KEYS as readonly string[]).includes(k),
  )
  const onlyInTarget = targetKeys.filter((k) => !sourceKeys.includes(k))
  return [...onlyInSource, ...onlyInTarget].sort()
}

// ─── 0 · DENOMINATORS ────────────────────────────────────────────────────────

describe('denominators', () => {
  it('records the measured size and SHAPE of each catalogue before any verdict', () => {
    const heKeys = Object.keys(HE)
    const enKeys = Object.keys(EN)
    const strings = heKeys.filter((k) => typeof HE[k] === 'string')
    const arrays = heKeys.filter((k) => Array.isArray(HE[k]))
    const objects = heKeys.filter(
      (k) => !Array.isArray(HE[k]) && typeof HE[k] === 'object' && HE[k] !== null,
    )

    // W3-A measured he.json at 67 top-level keys: 57 strings, 10 arrays,
    // 0 nested objects. Re-counted here so the premise is verified, not trusted.
    // The TOTAL is deliberately NOT pinned: it moved 67 -> 68 during W3-C's own
    // run when a concurrent delegate landed `notFound`, and a frozen total would
    // teach the next delegate to bump a number instead of reading a failure.
    // What IS pinned is the structure the premise rests on.

    // THE REASON THIS MODULE EXISTS. One array-valued key collapses next-intl's
    // whole-catalogue key typing to `string`. If this ever reaches 0, next-intl's
    // own typing works and i18n/messages.ts should be re-argued, not kept by
    // habit. W3-A measured 10.
    expect(arrays, 'array-valued top-level keys').toHaveLength(10)

    // A floor, not a freeze: content may be added, but mass loss must be loud.
    expect(strings.length, 'string-valued top-level keys').toBeGreaterThanOrEqual(57)

    // No key holds a number, boolean or null: every top-level value is one of the
    // three kinds the schema models. This fails the moment a fourth kind appears.
    expect(strings.length + arrays.length + objects.length).toBe(heKeys.length)

    // en.json is he.json minus exactly the source-only keys (derived, not counted).
    expect(enKeys.length).toBe(heKeys.length - SOURCE_ONLY_KEYS.length)
    expect(countLeaves(HE)).toBeGreaterThan(0)
    expect(countLeaves(EN)).toBeGreaterThan(0)
  })
})

// ─── 1 & 2 · THE REAL CATALOGUES ─────────────────────────────────────────────

describe('the real catalogues', () => {
  itWhenLanded('1 · he.json validates against the strict source-locale schema', () => {
    const result = resolvedSchema.safeParse(HE)
    expect(rejectionPaths(result)).toEqual([])
    expect(result.success).toBe(true)
    // Coverage denominator: every string leaf the schema walked.
    expect(countLeaves(HE)).toBeGreaterThanOrEqual(100)
  })

  itWhenLanded('2 · en.json validates with heroBadges legitimately absent', () => {
    expect(HE_ONLY_KEY in EN).toBe(false)
    const result = catalogueSchema.safeParse(EN)
    expect(rejectionPaths(result)).toEqual([])
    expect(result.success).toBe(true)
  })

  /**
   * Correct in BOTH worlds and therefore never needs editing: today it asserts
   * that `notFound` is the schema's ONLY complaint about real Hebrew data;
   * after the concurrent delegate lands, it asserts there are no complaints.
   */
  it('1b · the schema has no complaint about he.json other than the pending dependency', () => {
    const paths = rejectionPaths(resolvedSchema.safeParse(HE))
    expect(paths.filter((p) => p !== 'notFound')).toEqual([])
  })

  it('2b · the schema has no complaint about en.json other than the pending dependency', () => {
    const paths = rejectionPaths(catalogueSchema.safeParse(EN))
    expect(paths.filter((p) => p !== 'notFound')).toEqual([])
  })

  itUntilLanded('NOT-MEASURED · the accessor refuses an incomplete catalogue, naming notFound', () => {
    // Not a tolerated absence: the schema REQUIRES notFound, so the accessor
    // throws rather than serving a catalogue it cannot vouch for.
    expect(() => getMessages(SOURCE_LOCALE)).toThrow(/notFound/)
  })
})

// ─── 3 · THE MUTANT TABLE — the evidence that matters ────────────────────────

describe('3 · the schema rejects a mutated catalogue and names the path', () => {
  it('(a) a missing required key is rejected at that key', () => {
    const mutant = clone(HE)
    delete mutant.heroTitle
    const result = resolvedSchema.safeParse(mutant)

    expect(result.success).toBe(false)
    expect(rejectionPaths(result)).toContain('heroTitle')
  })

  it('(b) a string where an array belongs is rejected at that key', () => {
    const mutant = clone(HE)
    mutant.testimonials = 'not an array'
    const result = resolvedSchema.safeParse(mutant)

    expect(result.success).toBe(false)
    expect(rejectionPaths(result)).toContain('testimonials')
  })

  it('(c) an array element missing a required field is rejected at the indexed path', () => {
    const mutant = clone(HE)
    const stats = mutant.stats
    if (!Array.isArray(stats)) throw new Error('fixture drift: he.stats is not an array')
    delete (stats[1] as Record<string, unknown>).label
    const result = resolvedSchema.safeParse(mutant)

    expect(result.success).toBe(false)
    // The index is part of the path: not "somewhere in stats", but stats.1.label.
    expect(rejectionPaths(result)).toContain('stats.1.label')
  })

  it('(d) an extra unexpected TOP-LEVEL key is rejected and named', () => {
    const mutant = clone(HE)
    mutant.heroTitel = 'a typo that the old AppConfig typing compiled happily'
    const result = resolvedSchema.safeParse(mutant)

    expect(result.success).toBe(false)
    expect(rejectionMessages(result).join(' ')).toContain('heroTitel')
  })

  it('(d2) an extra unexpected key INSIDE an array element is rejected at that path', () => {
    const mutant = clone(HE)
    const stats = mutant.stats
    if (!Array.isArray(stats)) throw new Error('fixture drift: he.stats is not an array')
    ;(stats[0] as Record<string, unknown>).colour = 'gold'
    const result = resolvedSchema.safeParse(mutant)

    expect(result.success).toBe(false)
    expect(rejectionPaths(result)).toContain('stats.0')
    expect(rejectionMessages(result).join(' ')).toContain('colour')
  })

  it('(e) an empty heroBadge alt is rejected — an empty alt is the a11y failure', () => {
    const mutant = clone(HE)
    const badges = mutant.heroBadges
    if (!Array.isArray(badges)) throw new Error('fixture drift: he.heroBadges is not an array')
    ;(badges[0] as Record<string, unknown>).alt = ''
    const result = resolvedSchema.safeParse(mutant)

    expect(result.success).toBe(false)
    expect(rejectionPaths(result)).toContain('heroBadges.0.alt')
  })

  it('(f) he.json without heroBadges is rejected — the fallback target must exist', () => {
    const mutant = clone(HE)
    delete mutant[HE_ONLY_KEY]
    // The SOURCE locale is held to resolvedSchema, where heroBadges is REQUIRED.
    expect(rejectionPaths(resolvedSchema.safeParse(mutant))).toContain(HE_ONLY_KEY)
    // A non-source locale is held to catalogueSchema, where it is optional.
    expect(rejectionPaths(catalogueSchema.safeParse(mutant))).not.toContain(HE_ONLY_KEY)
  })
})

// ─── 4 · THE HEBREW-ONLY FALLBACK ────────────────────────────────────────────

describe('4 · the Hebrew-only fallback (ledger D-18)', () => {
  it('4a · the data premise: en.json has no heroBadges and every Hebrew alt is non-empty', () => {
    expect(HE_ONLY_KEY in EN).toBe(false)
    const badges = HE[HE_ONLY_KEY]
    if (!Array.isArray(badges)) throw new Error('fixture drift: he.heroBadges is not an array')
    expect(badges).toHaveLength(3)
    for (const badge of badges) {
      const alt = (badge as Record<string, unknown>).alt
      expect(typeof alt).toBe('string')
      expect(alt).not.toBe('')
    }
  })

  itWhenLanded('4b · getMessages("en") returns the Hebrew alt, and it is NOT empty', () => {
    const en = getMessages('en')
    const he = getMessages('he')

    expect(en.heroBadges).toHaveLength(3)
    expect(en.heroBadges).toEqual(he.heroBadges)

    const first = en.heroBadges[0]
    expect(first).toBeDefined()
    // The whole point of the rule: never an empty alt, never invented English.
    expect(first?.alt).not.toBe('')
    expect(first?.alt.trim().length).toBeGreaterThan(0)
    expect(first?.alt).toBe('סמל חטיבה 188')
  })

  itWhenLanded('4c · no OTHER key silently falls back — en keeps its own English', () => {
    const en = getMessages('en')
    const he = getMessages('he')
    expect(en.heroTitle).not.toBe(he.heroTitle)
  })
})

// ─── 5 · KEY PARITY, AND PROOF THE PARITY CHECK CAN FAIL ─────────────────────

describe('5 · key parity between catalogues', () => {
  it('5a · he and en have the same key set except the one documented Hebrew-only key', () => {
    expect(undocumentedKeyDifferences(HE, EN)).toEqual([])
  })

  it('5b · the parity check itself can FAIL — a removed key is reported', () => {
    const mutant = clone(EN)
    delete mutant.footerContact
    // If this returned [] the check above would be decoration.
    expect(undocumentedKeyDifferences(HE, mutant)).toEqual(['footerContact'])
  })

  it('5c · the parity check can fail in the other direction — an added key is reported', () => {
    const mutant = clone(EN)
    mutant.sponsorBanner = 'not in he.json'
    expect(undocumentedKeyDifferences(HE, mutant)).toEqual(['sponsorBanner'])
  })

  it('5d · the parity check does NOT excuse anything but heroBadges', () => {
    const mutant = clone(EN)
    delete mutant.heroStory
    expect(undocumentedKeyDifferences(HE, mutant)).toContain('heroStory')
  })
})

// ─── 6 · THE DELIBERATE CONTENT HOLE (ledger OPEN 6) ─────────────────────────

describe('6 · lectureItems carries a deliberate empty fourth entry', () => {
  it('6a · both catalogues have exactly 4 lecture items and index 3 is ""', () => {
    for (const [name, catalogue] of [
      ['he', HE],
      ['en', EN],
    ] as const) {
      const items = catalogue.lectureItems
      if (!Array.isArray(items)) throw new Error(`fixture drift: ${name}.lectureItems is not an array`)
      // A future "cleanup" that drops the empty entry MUST break this test:
      // it is unreviewed customer content, not litter (ledger OPEN 6).
      expect(items, `${name}.lectureItems length`).toHaveLength(4)
      expect(items[3], `${name}.lectureItems[3]`).toBe('')
      expect(items[0], `${name}.lectureItems[0]`).not.toBe('')
    }
  })

  itWhenLanded('6b · the same hole survives the accessor, typed', () => {
    expect(getMessages('he').lectureItems).toHaveLength(4)
    expect(getMessages('en').lectureItems).toHaveLength(4)
    expect(getMessages('en').lectureItems[3]).toBe('')
  })
})
