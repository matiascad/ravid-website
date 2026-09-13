#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// W6 ASSET PIPELINE — scripts/optimize-assets.mjs
//
// INVARIANT   Every basename in CONTRACT resolves to exactly one source file in
//             the customer's read-only repo, and lands as public/images/<name>.webp
//             with its bytes, dimensions and budget verdict MEASURED — never
//             assumed. The contract list below is the ONE PLACE the set of 25 is
//             stated; the manifest, the counts and the exit code are all derived
//             from it, so the file set cannot drift from the report about it.
//             Re-running is byte-identical: libwebp is deterministic for a given
//             (input, params), and params are a pure function of source metadata.
//
// IMPOSSIBLE  Four failures are structurally unavailable, not merely avoided:
//             (1) SOURCE MUTATION — this script opens SRC_DIR read-only and has
//                 no fs write/copy/unlink call whose destination is outside
//                 OUT_DIR; assertOutputPath() hard-fails any path that does not
//                 resolve under public/images, so a typo cannot escape the tree.
//             (2) RENAME — the output name is `${basename}.webp` built from the
//                 CONTRACT entry itself. There is no transform, no case fold, no
//                 pluralisation step that could touch it.
//             (3) UPSCALE — resize() is only ever called with a longest edge
//                 taken from a ladder pre-filtered to `<= native longest edge`,
//                 and `withoutEnlargement: true` is set as a second guard.
//             (4) CROP — `fit: 'inside'` preserves the full frame and the aspect
//                 ratio. No extract(), no trim(), no crop position is ever set.
//                 What the photograph shows is a content decision this pipeline
//                 is not permitted to make.
//
// CLASS       Closed by derivation, not by enumeration. Nothing here is
//             special-cased by filename — the two heavy files (blood-donation
//             2,296,067 B and tuval-hero 1,285,929 B) take the same code path as
//             a 15 KB badge. A new photograph from the customer is added by
//             dropping it in SRC_DIR and adding its basename to CONTRACT; the
//             class is chosen from the file's own metadata:
//               · PASSTHROUGH — source is already .webp and already within
//                 budget. Re-encoding webp→webp is generational loss for zero
//                 byte gain, so the bytes are copied verbatim.
//               · GRAPHIC — has an alpha channel (badges, insignia, bottle
//                 cutouts). Flat colour and hard edges show webp ringing early,
//                 so these start at q90/alphaQuality 100 and floor at q80.
//               · PHOTO — everything else. Starts at q82, floors at q72.
//
// HONEST LIMIT  This script measures BYTES and PIXELS. It does not measure
//             PERCEPTION. No SSIM, butteraugli or DSSIM is computed — none is
//             installed, and none was added, because a number from an untuned
//             perceptual metric would read as proof while being nothing of the
//             sort. The quality floor is therefore a HARD STOP, not a
//             measurement: when a file cannot reach budget at the floor, the
//             script REFUSES to go lower and emits it OVER BUDGET BY CHOICE,
//             flagged, with its real size. These are photographs of a dead
//             soldier and his unit. A file that is 40 KB too large is a
//             performance line item; a visibly mushed portrait of Tuval is not
//             recoverable by anyone downstream. The budget loses that argument
//             here, loudly and in the manifest, rather than quietly.
//             Second limit: the last human judgement — "is this good enough to
//             show the family" — is made by a person looking at the image. This
//             script reports the inputs to that judgement; it does not make it.
//
// AVIF — DELIBERATELY NOT EMITTED, and why.
//   The 13 sections consume these paths through `next/image`, and next.config.js
//   sets `images.formats: ['image/avif','image/webp']`. Next's optimizer
//   therefore transcodes each source on demand and picks AVIF or WebP from the
//   request's Accept header — the browser's choice is already made, upstream of
//   this script, from the single .webp we ship. A sidecar `<name>.avif` on disk
//   is selected by nothing: no component emits a <picture>/<source srcset>, and
//   this delegate may not edit components to add one. Shipping AVIF here would
//   ship bytes that no browser ever requests. Measured, not assumed: run with
//   --probe-avif to print the AVIF-vs-WebP byte comparison without writing any
//   AVIF file.
//
// USAGE   node scripts/optimize-assets.mjs [--probe-avif]
//         Exit 0 = all 25 produced. Exit 1 = a contract basename had no source,
//         or an output escaped public/images. Over-budget files do NOT fail the
//         run — they are reported, because suppressing them is the one outcome
//         this pipeline exists to prevent.
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile, mkdir, stat, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** The customer's repository. READ ONLY. Nothing in this file writes here. */
const SRC_DIR = '/home/mati/project/ravid_website1/src/assets'
const OUT_DIR = path.join(REPO, 'public', 'images')
const MANIFEST = path.join(OUT_DIR, 'MANIFEST.md')

/**
 * 300 KB, read as the STRICTER of the two conventions: 300,000 decimal bytes,
 * not 307,200 KiB. A file that passes this passes either reading of the budget.
 */
const BUDGET_BYTES = 300_000

/**
 * THE CONTRACT — the 25 basenames the 13 sections reference. ONE FACT ONE PLACE:
 * every count, every manifest row and the resolver's failure mode derive from
 * this array. Extensions are NOT listed: sources are .jpg/.jpeg/.png/.webp and
 * are resolved by probing, so a source re-encoded upstream does not break this.
 */
const CONTRACT = [
  'blood-donation', 'form-bg-tank', 'hativa188', 'helmet-bird', 'israel-flag',
  'knesset-bg', 'lecture-soldiers', 'lectures-bg-soldiers', 'media-interview',
  'military-bg-flag', 'plugat-golan', 'soldier-landscape', 'speech-event',
  'stats-bg-soldier', 'sufa-badge', 'tank-firing', 'tank-friends',
  'tuval-gdud53', 'tuval-hero', 'tuval-samar', 'wine-bg-tanks', 'wine-red',
  'wine-rose', 'wine-trio', 'wine-white',
]

/**
 * The 26th source file, excluded on purpose. W1 measured 0 import sites for it
 * in the customer's own build; migrating it would ship a dead 222 KB asset.
 * Named here so the exclusion is a recorded decision, not an oversight.
 */
const EXCLUDED = new Map([
  ['hero-memorial', 'unreferenced in the customer build (W1: 0 import sites) — migrating it ships a dead 222 KB asset'],
])

const SOURCE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']

/** Encoder policy per class. Floors are hard stops, never crossed. */
const POLICY = {
  photo:   { qStart: 82, qFloor: 72, alphaQuality: 100 },
  graphic: { qStart: 90, qFloor: 80, alphaQuality: 100 },
}

/** Longest-edge ladder, descending. Filtered to `<= native` — never upscale. */
const EDGE_LADDER = [1920, 1600, 1440, 1280, 1120, 1024]
/** Below this the pipeline stops shrinking and starts lowering quality. */
const MIN_LONG_EDGE = 1024

// ── guards ───────────────────────────────────────────────────────────────────

/** IMPOSSIBLE (1): no output may resolve outside public/images. */
function assertOutputPath(p) {
  const resolved = path.resolve(p)
  if (resolved !== OUT_DIR && !resolved.startsWith(OUT_DIR + path.sep)) {
    throw new Error(`REFUSED: output path escapes public/images: ${resolved}`)
  }
  if (resolved.startsWith(path.resolve(SRC_DIR) + path.sep)) {
    throw new Error(`REFUSED: attempted write into the read-only source repo: ${resolved}`)
  }
  return resolved
}

/**
 * Resolve a contract basename to exactly one source file.
 * Zero matches or more than one is a hard failure: substituting a different
 * image for a missing memorial photograph is not a recovery, it is a lie.
 */
async function resolveSource(basename, dirListing) {
  const matches = SOURCE_EXTS
    .map((ext) => basename + ext)
    .filter((name) => dirListing.has(name))
  if (matches.length === 0) return { ok: false, reason: 'NO SOURCE FOUND' }
  if (matches.length > 1) return { ok: false, reason: `AMBIGUOUS: ${matches.join(', ')}` }
  return { ok: true, file: matches[0], abs: path.join(SRC_DIR, matches[0]) }
}

/**
 * Class is read off the file's own metadata — never off its name.
 *
 * `hasAlpha` catches the cutouts (bottle renders, the Hativa 188 insignia). It
 * does NOT catch a flattened insignia saved without alpha, so a second derived
 * signal carries those: a PNG whose longest edge is <= GRAPHIC_MAX_EDGE. Nothing
 * on this site ships a *photograph* at 512 px or less — that size band is badges
 * and marks, where webp ringing on flat colour and lettering is exactly what you
 * see first. A large PNG (plugat-golan, 1536x1024) stays in the photo class,
 * which is correct: it is a photograph that merely arrived as a PNG.
 */
const GRAPHIC_MAX_EDGE = 512

function classify(meta, ext, bytes) {
  if (ext === '.webp' && bytes <= BUDGET_BYTES) return 'passthrough'
  if (meta.hasAlpha) return 'graphic'
  if (ext === '.png' && Math.max(meta.width, meta.height) <= GRAPHIC_MAX_EDGE) return 'graphic'
  return 'photo'
}

function laddersFor(longEdge) {
  const rungs = [longEdge, ...EDGE_LADDER.filter((e) => e < longEdge && e >= MIN_LONG_EDGE)]
  return [...new Set(rungs)].sort((a, b) => b - a)
}

/**
 * Encode at a given longest edge and quality. `fit: 'inside'` +
 * `withoutEnlargement` = aspect preserved, frame preserved, never enlarged.
 */
async function encode(abs, meta, longEdge, quality, cls) {
  const native = Math.max(meta.width, meta.height)
  let pipe = sharp(abs, { failOn: 'error' })
  if (longEdge < native) {
    const [w, h] = meta.width >= meta.height ? [longEdge, null] : [null, longEdge]
    pipe = pipe.resize({ width: w, height: h, fit: 'inside', withoutEnlargement: true })
  }
  const buf = await pipe
    .webp({
      quality,
      alphaQuality: POLICY[cls].alphaQuality,
      effort: 6,
      smartSubsample: cls === 'photo',
    })
    .toBuffer()
  const out = await sharp(buf).metadata()
  return { buf, width: out.width, height: out.height, quality, longEdge }
}

/**
 * THE ALGORITHM — resize before crushing quality.
 *
 * Phase 1: hold quality at the class start value and walk the edge ladder down
 *          until the file fits. A smaller photograph at q82 is a better artefact
 *          than a full-size one at q60, and on a memorial page that is not a
 *          close call.
 * Phase 2: only once dimensions are at MIN_LONG_EDGE, step quality down toward
 *          the floor.
 * Phase 3: at the floor and still over — STOP. Emit the floor result, flag it
 *          OVER BUDGET BY CHOICE. The pipeline never trades the photograph for
 *          the number.
 */
async function chooseEncoding(abs, meta, cls) {
  const { qStart, qFloor } = POLICY[cls]
  const native = Math.max(meta.width, meta.height)
  const rungs = laddersFor(native)
  let last = null

  for (const edge of rungs) {
    last = await encode(abs, meta, edge, qStart, cls)
    if (last.buf.length <= BUDGET_BYTES) {
      return { ...last, phase: edge === native ? 'native@qStart' : 'resized@qStart', overByChoice: false }
    }
  }

  const floorEdge = rungs[rungs.length - 1]
  for (let q = qStart - 4; q >= qFloor; q -= 4) {
    last = await encode(abs, meta, floorEdge, q, cls)
    if (last.buf.length <= BUDGET_BYTES) {
      return { ...last, phase: 'minEdge@loweredQuality', overByChoice: false }
    }
  }

  return { ...last, phase: 'FLOOR REACHED', overByChoice: true }
}

// ── run ──────────────────────────────────────────────────────────────────────

const probeAvif = process.argv.includes('--probe-avif')

await mkdir(OUT_DIR, { recursive: true })
const dirListing = new Set(await readdir(SRC_DIR))

const rows = []
const failures = []
const avifProbe = []

for (const basename of CONTRACT) {
  const found = await resolveSource(basename, dirListing)
  if (!found.ok) {
    failures.push(`${basename}: ${found.reason}`)
    rows.push({ basename, error: found.reason })
    continue
  }

  const srcBytes = (await stat(found.abs)).size
  const meta = await sharp(found.abs).metadata()
  const ext = path.extname(found.file).toLowerCase()
  const cls = classify(meta, ext, srcBytes)
  const outPath = assertOutputPath(path.join(OUT_DIR, `${basename}.webp`))

  let buf, outW, outH, quality, phase, overByChoice

  if (cls === 'passthrough') {
    buf = await readFile(found.abs)
    outW = meta.width; outH = meta.height
    quality = null; phase = 'passthrough (already webp, already within budget)'
    overByChoice = false
  } else {
    const chosen = await chooseEncoding(found.abs, meta, cls)
    buf = chosen.buf; outW = chosen.width; outH = chosen.height
    quality = chosen.quality; phase = chosen.phase; overByChoice = chosen.overByChoice
  }

  await writeFile(outPath, buf)

  if (probeAvif && cls !== 'passthrough') {
    const avif = await sharp(found.abs)
      .resize({ width: outW, height: outH, fit: 'inside', withoutEnlargement: true })
      .avif({ quality: quality ?? 82, effort: 4 })
      .toBuffer()
    avifProbe.push({ basename, webp: buf.length, avif: avif.length })
  }

  rows.push({
    basename,
    source: found.file,
    srcBytes,
    outBytes: buf.length,
    reduction: ((1 - buf.length / srcBytes) * 100),
    srcDim: `${meta.width}x${meta.height}`,
    outDim: `${outW}x${outH}`,
    cls,
    quality,
    phase,
    underBudget: buf.length <= BUDGET_BYTES,
    overByChoice,
  })
}

const ok = rows.filter((r) => !r.error)
const under = ok.filter((r) => r.underBudget)
const over = ok.filter((r) => !r.underBudget)
const srcTotal = ok.reduce((n, r) => n + r.srcBytes, 0)
const outTotal = ok.reduce((n, r) => n + r.outBytes, 0)

const kb = (n) => (n / 1000).toFixed(1)
const pad = (s, n) => String(s).padEnd(n)
const padL = (s, n) => String(s).padStart(n)

const lines = []
lines.push('# W6 ASSET MANIFEST')
lines.push('')
lines.push('Generated by `node scripts/optimize-assets.mjs`. Do not hand-edit: every')
lines.push('number below is measured at encode time and regenerated on each run.')
lines.push('')
lines.push(`Source (read-only): \`${SRC_DIR}\``)
lines.push(`Output: \`public/images/<basename>.webp\``)
lines.push(`Budget: ${BUDGET_BYTES.toLocaleString()} bytes (300 KB, decimal — the stricter reading)`)
lines.push('')
lines.push('| # | basename | source file | src bytes | out bytes | reduction | src WxH | out WxH | class | q | budget |')
lines.push('|---|----------|-------------|----------:|----------:|----------:|---------|---------|-------|--:|--------|')
rows.forEach((r, i) => {
  if (r.error) {
    lines.push(`| ${i + 1} | ${r.basename} | **${r.error}** | — | — | — | — | — | — | — | **FAIL** |`)
    return
  }
  lines.push(
    `| ${i + 1} | ${r.basename} | ${r.source} | ${r.srcBytes.toLocaleString()} | ${r.outBytes.toLocaleString()} | ` +
    `${r.reduction.toFixed(1)}% | ${r.srcDim} | ${r.outDim} | ${r.cls} | ${r.quality ?? '—'} | ` +
    `${r.underBudget ? 'PASS' : '**OVER BY CHOICE**'} |`
  )
})
lines.push('')
lines.push(`**Totals** — sources ${srcTotal.toLocaleString()} B (${kb(srcTotal)} KB) → outputs ${outTotal.toLocaleString()} B (${kb(outTotal)} KB) · overall reduction **${((1 - outTotal / srcTotal) * 100).toFixed(1)}%**`)
lines.push('')
lines.push(`**Denominator** — ${CONTRACT.length} in · ${ok.length} out · ${under.length} under ${BUDGET_BYTES.toLocaleString()} B · ${over.length} over`)
if (over.length) {
  lines.push('')
  lines.push('**Over budget by choice** (quality floor reached; the pipeline refused to go lower):')
  over.forEach((r) => lines.push(`- \`${r.basename}\` — ${r.outBytes.toLocaleString()} B at ${r.outDim} q${r.quality}`))
}
if (EXCLUDED.size) {
  lines.push('')
  lines.push('**Deliberately not migrated:**')
  for (const [name, why] of EXCLUDED) lines.push(`- \`${name}\` — ${why}`)
}
lines.push('')
lines.push('**AVIF:** not emitted. Sections consume these paths via `next/image`, and')
lines.push('`next.config.js` sets `images.formats: [\'image/avif\',\'image/webp\']` — Next\'s')
lines.push('optimizer negotiates AVIF from the Accept header off this single .webp source.')
lines.push('No component emits a `<picture>`/`srcset`, so a sidecar `.avif` on disk would be')
lines.push('selected by nothing. Run `--probe-avif` to see the byte comparison.')

const manifest = lines.join('\n') + '\n'
await writeFile(assertOutputPath(MANIFEST), manifest)

// stdout: same facts, fixed-width, for pasting into a report
console.log('')
console.log(pad('BASENAME', 22) + pad('SOURCE', 26) + padL('SRC B', 11) + padL('OUT B', 10) + padL('RED%', 8) + '  ' + pad('SRC WxH', 11) + pad('OUT WxH', 11) + pad('CLASS', 13) + padL('Q', 4) + '  BUDGET')
console.log('-'.repeat(125))
rows.forEach((r) => {
  if (r.error) { console.log(pad(r.basename, 22) + `*** ${r.error} ***`); return }
  console.log(
    pad(r.basename, 22) + pad(r.source, 26) + padL(r.srcBytes.toLocaleString(), 11) +
    padL(r.outBytes.toLocaleString(), 10) + padL(r.reduction.toFixed(1) + '%', 8) + '  ' +
    pad(r.srcDim, 11) + pad(r.outDim, 11) + pad(r.cls, 13) + padL(r.quality ?? '-', 4) +
    '  ' + (r.underBudget ? 'PASS' : 'OVER-BY-CHOICE')
  )
})
console.log('-'.repeat(125))
console.log(`TOTALS  sources ${srcTotal.toLocaleString()} B -> outputs ${outTotal.toLocaleString()} B  (overall reduction ${((1 - outTotal / srcTotal) * 100).toFixed(1)}%)`)
console.log(`DENOMINATOR  ${CONTRACT.length} in - ${ok.length} out - ${under.length} under budget - ${over.length} over budget`)
over.forEach((r) => console.log(`  OVER BY CHOICE: ${r.basename} ${r.outBytes.toLocaleString()} B at ${r.outDim} q${r.quality} (floor reached; refused to go lower)`))
failures.forEach((f) => console.log(`  FAILURE: ${f}`))
console.log(`MANIFEST  ${path.relative(REPO, MANIFEST)}`)

if (avifProbe.length) {
  console.log('')
  console.log('AVIF PROBE (nothing written):')
  let wins = 0
  avifProbe.forEach((p) => {
    const d = ((1 - p.avif / p.webp) * 100)
    if (d > 0) wins++
    console.log(`  ${pad(p.basename, 22)} webp ${padL(p.webp.toLocaleString(), 9)}  avif ${padL(p.avif.toLocaleString(), 9)}  ${d >= 0 ? '-' : '+'}${Math.abs(d).toFixed(1)}%`)
  })
  console.log(`  AVIF smaller in ${wins}/${avifProbe.length} cases — still not emitted: no markup selects a sidecar .avif (see header).`)
}

if (failures.length) {
  console.error(`\nEXIT 1 — ${failures.length} contract basename(s) unresolved. No substitution was made.`)
  process.exit(1)
}
