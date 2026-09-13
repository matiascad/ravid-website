// ─────────────────────────────────────────────────────────────────────────────
// W16-D LOCALE COPY DIVERGENCE · i18n/__tests__/locale-copy-divergence.test.ts
//
// THE DEFECT THIS FILE EXISTS TO CATCH, measured before it was written:
//   messages/he.json's `notFound` block and messages/en.json's `notFound` block
//   were BYTE-IDENTICAL, and both were written in English. Every existing 404
//   assertion in this repository was green while that was true, because every
//   one of them compared the 404 against THE CATALOGUE rather than against the
//   OTHER LOCALE. A Hebrew visitor was served English words under an RTL
//   document, and nothing could tell.
//
//   The identity was not a bug anybody typed. It is what happens when a block is
//   authored once and copied into the second catalogue to satisfy a schema that
//   demands the key in every locale. It will happen again on the next key, which
//   is why this file tests a CLASS and not the `notFound` block.
//
// INVARIANT     For every key named in TRANSLATED_KEYS, the text a reader
//               receives in `he` and the text a reader receives in `en` are
//               DIFFERENT STRINGS, and the `he` text contains at least one
//               Hebrew code point while the `en` text contains none. Both
//               statements are made through `getMessages`, the one validated
//               accessor, so they describe what a READER GETS and not what a
//               JSON file happens to hold.
//
// IMPOSSIBLE    Three things can no longer land silently:
//               (a) A translated block copied verbatim from one catalogue into
//                   the other. Byte-identity is the assertion, so a copy is red.
//               (b) Hebrew source text left in the English catalogue. The
//                   English side of every listed key is scanned for the Hebrew
//                   code-point block and must be empty of it.
//               (c) English placeholder text left in the Hebrew catalogue — the
//                   ACTUAL defect here, which (a) alone would not catch once
//                   somebody changed one word. The Hebrew side must contain
//                   Hebrew.
//
// CLASS         Every key listed in TRANSLATED_KEYS, every leaf string beneath
//               it, both locales. Adding a key to that list is the whole cost of
//               extending the guarantee; nothing else in this file changes.
//               INSTANCE, explicitly: the list is a list. A new translated key
//               that nobody adds to it is not covered. See HONEST LIMIT 1.
//
// HONEST LIMIT  Four, stated plainly.
//   1. THE LIST IS NOT DERIVED. There is no property of the catalogue that says
//      "this key is prose and must differ per locale" — `dir` is legitimately
//      identical in shape, `heroDates` is a date, `wine` holds proper nouns. So
//      TRANSLATED_KEYS is a judgement, written down once, and a new prose key
//      added without touching this file is NOT guarded. Deriving it would mean
//      first inventing a per-key "is prose" flag in the catalogue, which is a
//      second description of the data and the failure mode i18n/messages.ts
//      HONEST LIMIT 3 already carries one of.
//   2. DIFFERENT IS NOT TRANSLATED. This file proves the two locales say
//      different things and that each says them in the right script. It cannot
//      prove the English says what the Hebrew says. No test can; that is a human
//      reading, and for this site it is Ravid's reading.
//   3. THIS IS THE CATALOGUE, NOT THE WIRE. It asserts what `getMessages`
//      returns. The claim that the SERVED BYTES of /he/<missing> and
//      /en/<missing> differ is a different claim, proved by fetching both from a
//      real server; it is recorded in the run report, not here, because a vitest
//      run that boots Next is a build dependency this suite does not have.
//   4. CODE-POINT SCANNING IS NOT LANGUAGE DETECTION. A Hebrew string made
//      entirely of digits and punctuation would pass the `en` scan and fail the
//      `he` one. That is the correct direction to fail in, but it is a script
//      test, not a language test.
//
// NO BACKSLASH-U ESCAPE APPEARS IN THIS FILE, and no Hebrew code point appears
// in it either. The Hebrew block is named by `String.fromCodePoint`, and both
// facts are asserted by the self-scan at the bottom rather than promised here.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { LOCALES, type Locale } from '@/config/site'
import { getMessages, type Messages } from '@/i18n/messages'

/**
 * The Hebrew block, U+0590..U+05FF, named by code point rather than written out.
 * Writing the range as a literal would put Hebrew in a `.ts` file, and writing
 * it as a backslash escape is the hazard that corrupted a Hebrew-detection test
 * in an earlier run into containing real Hebrew. `String.fromCodePoint` can do
 * neither.
 */
const HEBREW_BLOCK_START = 0x0590
const HEBREW_BLOCK_END = 0x05ff

const HEBREW_RANGE = new RegExp(
  `[${String.fromCodePoint(HEBREW_BLOCK_START)}-${String.fromCodePoint(HEBREW_BLOCK_END)}]`,
)

function hasHebrew(text: string): boolean {
  return HEBREW_RANGE.test(text)
}

/**
 * THE KEYS WHOSE TEXT IS PROSE A READER READS, and which must therefore differ
 * between locales. See HONEST LIMIT 1 for why this is a written list.
 *
 * `notFound` is here because it is the key that was byte-identical. The others
 * are here because they are the keys W16-D touched or verified in the same pass
 * and each is prose or a description rather than a proper noun or a number.
 */
const TRANSLATED_KEYS = ['notFound', 'heroBadges', 'imageAlts', 'heroTitle', 'storyH3'] as const

type TranslatedKey = (typeof TRANSLATED_KEYS)[number]

/** Every leaf string under a catalogue value, with its path, in stable order. */
function leaves(value: unknown, path: string): ReadonlyArray<{ path: string; text: string }> {
  if (typeof value === 'string') return [{ path, text: value }]
  if (Array.isArray(value)) return value.flatMap((item, i) => leaves(item, `${path}[${i}]`))
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, `${path}.${k}`))
  }
  return []
}

function copyFor(locale: Locale, key: TranslatedKey): Messages[TranslatedKey] {
  return getMessages(locale)[key]
}

describe('locale copy divergence · the two catalogues must not say the same thing', () => {
  it('the premise: this site serves exactly the two locales this file reasons about', () => {
    expect([...LOCALES].sort()).toEqual(['en', 'he'])
  })

  for (const key of TRANSLATED_KEYS) {
    describe(`${key}`, () => {
      it('is not byte-identical between he and en', () => {
        const he = JSON.stringify(copyFor('he', key))
        const en = JSON.stringify(copyFor('en', key))
        expect(en).not.toBe(he)
      })

      it('differs at every single leaf string, not just somewhere', () => {
        const heLeaves = leaves(copyFor('he', key), key)
        const enLeaves = leaves(copyFor('en', key), key)
        expect(enLeaves.map((l) => l.path)).toEqual(heLeaves.map((l) => l.path))
        expect(heLeaves.length).toBeGreaterThan(0)

        const same = heLeaves.filter((l, i) => enLeaves[i]?.text === l.text).map((l) => l.path)
        expect(same).toEqual([])
      })

      it('reads as Hebrew in he and carries no Hebrew code point in en', () => {
        const heWithoutHebrew = leaves(copyFor('he', key), key)
          .filter((l) => !hasHebrew(l.text))
          .map((l) => l.path)
        expect(heWithoutHebrew).toEqual([])

        const enWithHebrew = leaves(copyFor('en', key), key)
          .filter((l) => hasHebrew(l.text))
          .map((l) => l.path)
        expect(enWithHebrew).toEqual([])
      })
    })
  }
})

describe('locale copy divergence · self-scan', () => {
  const source = readFileSync(join(process.cwd(), 'i18n/__tests__/locale-copy-divergence.test.ts'), 'utf8')

  it('contains no Hebrew code point', () => {
    const found = [...source].filter(
      (ch) => (ch.codePointAt(0) ?? 0) >= HEBREW_BLOCK_START && (ch.codePointAt(0) ?? 0) <= HEBREW_BLOCK_END,
    )
    expect(found).toEqual([])
  })

  it('contains no backslash-u escape', () => {
    expect(source.includes(String.fromCodePoint(0x5c) + 'u')).toBe(false)
  })
})
