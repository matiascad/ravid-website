// ─────────────────────────────────────────────────────────────────────────────
// W16-A · i18n/__tests__/privacy-catalogue.test.ts
// THE SCHEMA KEY AND THE CATALOGUE KEY MUST LAND TOGETHER, OR THE SITE STOPS.
//
// WHY THIS FILE EXISTS. `i18n/messages.ts` parses both catalogues with
// `z.strictObject` AT MODULE LOAD. That makes the two halves of a message key a
// COUPLED PAIR with a brutal failure mode:
//   · a key in the catalogue that the schema does not name  -> unrecognized_keys
//   · a key in the schema that the catalogue does not carry -> invalid_type
// Either one throws before a single byte is served, in EVERY locale, for EVERY
// page — not just the page that reads the key. A privacy notice shipped as a
// half-edit does not degrade the site, it takes the site down.
//
// So this file asserts the COUPLING itself, for the notice's keys, derived from
// the one list that names them (`PRIVACY_KEYS` in the component) rather than
// from a second list typed here. Adding a key to that list makes this file
// demand it in the schema AND in both catalogues, with no edit here.
//
// PROVED RED, NOT ASSUMED GREEN (Law 3). Two mutants run inside test 4 below —
// the detector is exercised against a catalogue missing a privacy key and
// against one carrying an unknown one, so a green run is evidence that the check
// can fail. It was ALSO proved red in the file system, by hand, before being
// trusted: the W16-A report carries the two runs and their exact output.
//
// HONEST LIMIT  This proves the two halves EXIST and AGREE IN SHAPE. It cannot
// prove the Hebrew and the English say the same thing, and it cannot prove
// either of them is true about what happens to a lead. Those are HONEST LIMIT 7
// and 1 in components/sections/PrivacyNotice.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { PRIVACY_KEYS, resolvePrivacyNotice } from '@/components/sections/PrivacyNotice'
import { LOCALES, type Locale } from '@/config/site'
import { catalogueSchema, getMessages } from '@/i18n/messages'

/**
 * The catalogue as it sits ON DISK. Read as bytes and parsed here rather than
 * `import`ed, so this file asserts something about the FILE the deployment
 * ships, not about a module object a bundler already resolved.
 */
function rawCatalogue(locale: Locale): Record<string, unknown> {
  // From the process's working directory, not `import.meta.url`: vite rewrites
  // that to a URL rooted at the PROJECT root, so `new URL('../../messages/...')`
  // resolves to an absolute filesystem path that does not exist. MEASURED, not
  // assumed - the first version of this helper failed with
  // `ENOENT: open '/messages/he.json'`.
  const path = resolve(process.cwd(), 'messages', `${locale}.json`)
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'))
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${locale}.json is not a JSON object`)
  }
  return parsed as Record<string, unknown>
}

/* ── 1. THE SCHEMA HALF ───────────────────────────────────────────────────── */

test('1. every privacy key is declared in the catalogue SCHEMA', () => {
  const declared = Object.keys(catalogueSchema.shape)

  for (const key of PRIVACY_KEYS) {
    expect(declared, `${key} is in the catalogue but not in the schema`).toContain(key)
  }
})

/* ── 2. THE CATALOGUE HALF, IN EVERY LOCALE ───────────────────────────────── */

test('2. every privacy key carries a non-blank string in EVERY catalogue file', () => {
  for (const locale of LOCALES) {
    const raw = rawCatalogue(locale)

    for (const key of PRIVACY_KEYS) {
      const value = raw[key]
      expect(typeof value, `${locale}.json: ${key} is ${typeof value}, not a string`).toBe('string')
      expect(
        typeof value === 'string' ? value.trim().length : 0,
        `${locale}.json: ${key} is blank, which renders NO notice at all`,
      ).toBeGreaterThan(0)
    }
  }
})

/* ── 3. THE COUPLING, AS THE SITE ITSELF PERFORMS IT ──────────────────────── */

test('3. each catalogue FILE passes the schema — the exact check module load runs', () => {
  for (const locale of LOCALES) {
    const result = catalogueSchema.safeParse(rawCatalogue(locale))
    const paths = result.success
      ? []
      : result.error.issues.map((issue) => `${issue.code} at ${issue.path.join('.')}`)

    expect(paths, `${locale}.json would throw at import: ${paths.join('; ')}`).toEqual([])
    expect(result.success).toBe(true)
  }
})

/* ── 4. THE DETECTOR, PROVED AGAINST BOTH HALF-EDITS ──────────────────────── */

test('4. RED PROOF - a HALF-EDIT in either direction is rejected, by path', () => {
  for (const locale of LOCALES) {
    // (a) SCHEMA KEY WITHOUT CATALOGUE KEY. The state left behind by editing
    //     i18n/messages.ts and forgetting messages/<locale>.json.
    for (const key of PRIVACY_KEYS) {
      const missing: Record<string, unknown> = { ...rawCatalogue(locale) }
      delete missing[key] // the mutant IS the deletion

      const result = catalogueSchema.safeParse(missing)
      expect(result.success, `${locale}: ${key} could go missing and the site still load`).toBe(
        false,
      )
      if (result.success) continue
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(key)
    }

    // (b) CATALOGUE KEY WITHOUT SCHEMA KEY. The state left behind by editing
    //     messages/<locale>.json and forgetting i18n/messages.ts. `strictObject`
    //     is what makes this an error rather than a silently stripped key — the
    //     premise this whole file rests on, measured rather than believed.
    const extra = { ...rawCatalogue(locale), privacyKeyTheSchemaDoesNotName: 'x' }
    const result = catalogueSchema.safeParse(extra)

    expect(result.success, `${locale}: the schema is NOT strict; an unknown key was accepted`).toBe(
      false,
    )
    if (result.success) continue
    expect(result.error.issues.map((issue) => issue.code)).toContain('unrecognized_keys')
  }
})

/* ── 5. THE EFFECT, NOT THE NAMES ─────────────────────────────────────────── */

test('5. from the REAL catalogue, the notice resolves in every locale', () => {
  for (const locale of LOCALES) {
    // Not "the key exists": the component's own presence rule, run against what
    // `getMessages` actually serves. Null here means a served page with no
    // notice, whatever the key list says.
    const resolved = resolvePrivacyNotice(getMessages(locale))

    expect(resolved, `${locale}: the catalogue is answered but the notice resolves to NOTHING`).not
      .toBeNull()

    for (const key of PRIVACY_KEYS) {
      expect(resolved?.[key].trim().length ?? 0).toBeGreaterThan(0)
    }
  }
})
