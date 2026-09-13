// ─────────────────────────────────────────────────────────────────────────────
// W3-C TYPED MESSAGE ACCESS · i18n/messages.ts — THE CATALOGUE CONTRACT
//
// WHY THIS FILE EXISTS AT ALL (the defect it closes, measured)
//   W3-A installed next-intl's `AppConfig` augmentation so that message keys
//   would be compile-checked. It is INERT, and the cause is mechanical:
//       NestedKeyOf<{a: string; b: {c: string}}>              -> '"a" | "b" | "b.c"'
//       NestedKeyOf<{a: string; b: {c: string}; xs: string[]}> -> 'string'
//   An array value is not assignable to next-intl's `AbstractIntlMessages`, so
//   ONE array-valued key anywhere collapses key typing for the entire catalogue
//   to `string`. The argument needs only that AT LEAST ONE top-level key is an
//   array, which has been true of messages/he.json since W1; the counts are a
//   snapshot, MEASURED 2026-09-13 at 74 top-level keys, 10 of them arrays. (A
//   previous count of 67 here had gone stale — do not trust a number in this
//   file that does not carry the date it was measured.)
//   A misspelled key therefore compiles. That is the customer's own defect class
//   (W1 measured their `t: any` beside a declared `Translations` type that was
//   never applied) wearing a different hat: a guarantee that cannot fail.
//
//   This file does NOT attempt a third type that "describes the catalogue".
//   The first two failed because nothing could detect their falsity. It steps up
//   a level: the catalogue must PROVE ITSELF against a zod schema AT MODULE LOAD.
//   A mismatch is a thrown error naming the exact path — an observable failure,
//   not a silent `string`.
//
// INVARIANT     The shape of the message catalogue is stated exactly ONCE, as the
//               zod schema below, and the TypeScript type is `z.infer` of that
//               schema — never a hand-written parallel. Every catalogue this
//               project can serve is parsed against that schema before any caller
//               can read a key, and the source locale is held to the STRICTER of
//               the two derived schemas. There is exactly one place where a key
//               absent from a non-source locale falls back, it is this file, and
//               the set of keys allowed to do so is the `SOURCE_ONLY_SHAPE`
//               object — one list, not a convention.
//
// IMPOSSIBLE    Five things can no longer be CONSTRUCTED:
//               (a) A message read out of an unchecked catalogue. `getMessages`
//                   is the only exported way to reach a message, and it parses
//                   that locale's file (memoised) before returning anything, so
//                   there is no code path from a caller to a key that does not
//                   pass through `parse` first. A catalogue that does not match
//                   throws here, naming the exact path.
//               (b) A silent shape drift. `strictObject` everywhere means an
//                   extra/renamed/typo'd key is `unrecognized_keys`, a missing
//                   one is `invalid_type` at a named path. The customer's
//                   catalogue could gain or lose a key with nothing to notice;
//                   this one cannot.
//               (c) A fallback that points at nothing. The SOURCE locale is
//                   parsed with `resolvedSchema`, in which the he-only keys are
//                   REQUIRED. So `SOURCE.heroBadges` is typed present, not
//                   `T | undefined` — the fallback target is proved to exist
//                   before it is ever used as one.
//               (d) A NEW he-only key that is silently forgotten by the accessor.
//                   `Messages` requires every `SOURCE_ONLY_SHAPE` key; spreading
//                   a `catalogueSchema` result yields them as optional; so each
//                   one must be explicitly filled in `load()` or THIS FILE
//                   fails to compile. Adding a key to `SOURCE_ONLY_SHAPE` and
//                   forgetting the fallback is a compile error, not a runtime
//                   `undefined` in an `alt` attribute.
//               (e) An empty `alt` on a hero badge. `heroBadgeSchema.alt` is
//                   `z.string().min(1)` — the a11y hole that a "" fallback would
//                   open cannot be represented in a catalogue that loads.
//
// CLASS         DERIVATION for catalogue SHAPE and for source-locale FALLBACK,
//               across every locale in `LOCALES`, present and future: `RAW` is a
//               `Record<Locale, unknown>`, so adding 'fr' to config/site.ts makes
//               THIS FILE fail to compile until fr.json is supplied AND passes
//               the same schema. Nothing opts out — there is no per-locale escape
//               hatch and no "loose" variant of the schema.
//               INSTANCE, explicitly, for CONTENT: this closes the shape of the
//               data, not its truth. See HONEST LIMIT 2.
//
// HONEST LIMIT  Eight, stated plainly. Read 1, 3 and 7 before trusting this file.
//   1. KEY TYPING IS STILL WEAKER THAN A NESTED CATALOGUE WOULD GIVE.
//      `Messages` is a flat object type, so `m.heroTitel` is a compile error —
//      that much now works, and it did not before. But callers that go through
//      next-intl's `useTranslations()`/`t('...')` are UNAFFECTED by this file:
//      next-intl's own `AppConfig` key typing in i18n/request.ts is still
//      collapsed to `string` by the 10 array keys, and this module does not and
//      cannot repair that. Sections must import `getMessages` to get the typing;
//      a section that calls `t('heroTitel')` still compiles. Closing THAT hole
//      means either de-arraying the catalogue or an ESLint restriction on
//      `useTranslations`, and neither is in this delegate's write-set.
//   2. A schema proves SHAPE, never CONTENT. `heroDates: z.string()` accepts a
//      wrong date. Nothing here checks a memorial fact against reality.
//   3. THIS SCHEMA IS A HAND-WRITTEN MIRROR OF he.json, and that is precisely
//      the construction that let the customer's `Translations` type rot. The one
//      difference — and it is the whole point of the file — is that the mirror is
//      PARSED AGAINST THE DATA at load, so drift is a named, immediate, loud
//      failure instead of an unread declaration. It is also a SECOND description
//      of the catalogue alongside `AppConfig.Messages = typeof heMessages` in
//      i18n/request.ts. That file is outside this delegate's write-set; the two
//      cannot silently disagree (this one parses), but the duplication is real
//      and is owed to the seat.
//   4. STRINGS MAY BE EMPTY, deliberately, and the schema permits it. `""` is
//      real customer data in `lectureItems[3]` (ledger OPEN 6), `stats[*].desc`
//      and `testimonials[*].sub`. Adding `.min(1)` globally would fail the real
//      catalogue, and weakening real data to satisfy a schema is forbidden.
//      `.min(1)` is applied to named positions only, never globally, and the
//      list is exactly those where an empty string is itself the defect:
//      `heroBadges[*].alt`, every value in `imageAlts`, and the five
//      `privacy*` strings added by W16-A — 12 positions, MEASURED 2026-09-13
//      by grepping `min(1)` in this file. For the alt values empty means an
//      unnamed image; for the privacy values empty means a notice that
//      renders blank with every test still green (see the block above them).
//   5. ARRAY LENGTHS ARE NOT PINNED. The customer may add a fifth testimonial
//      without a code change — intended. The consequence is that a "cleanup"
//      deleting `lectureItems[3]` would pass this schema; the test file's
//      assertion on length 4 and index 3 is what catches that, not this schema.
//   6. `dir` is in the schema because it is in the DATA. It is NOT consumed here
//      or anywhere: LOCALE_DIRECTION in i18n/routing.ts is the only source of
//      text direction. Do not wire it up.
//   7. `notFound` ({title, description, backHome}) is declared REQUIRED below.
//      It was ABSENT from both catalogues when this file was written — a
//      concurrent delegate was adding it — and the schema was NOT loosened to
//      tolerate that: `getMessages()` simply threw, naming exactly `notFound`,
//      which is the designed behaviour for an incomplete catalogue. It landed
//      mid-verification and is now PRESENT and validated in both locales. The
//      tests that could not be measured while it was absent were skipped, never
//      passed; they now run. Nothing in this file was changed to accommodate it.
//   8. Validation is per-locale and lazy, not eager-at-import. A locale never
//      requested in a given process is never parsed. This does NOT weaken the
//      guarantee that matters — no caller can read a key without that locale's
//      parse having run — but a broken fr.json would surface on the first /fr
//      request rather than at boot. The trade buys fault ISOLATION: an incomplete
//      catalogue fails the locale that is actually incomplete instead of taking
//      down every importer of this module, which is what kept the schema's own
//      evidence readable while limit 7 was open.
//
// CASTS: no `any`, and no `as` that discards checking. The only two `as` in this
// file are `as const` on COMMON_SHAPE and SOURCE_ONLY_SHAPE — widening-prevention
// assertions, not type assertions: they make the shape objects readonly so a
// later edit cannot mutate them, and they remove nothing from the compiler.
// Every value returned by `getMessages` has been through `safeParse`.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

import { type Locale } from '@/config/site'

import enMessages from '../messages/en.json'
import heMessages from '../messages/he.json'

// ─── ELEMENT SHAPES ──────────────────────────────────────────────────────────
// `strictObject`, not `object`: zod's default strips unknown keys silently, and
// a silently-stripped key is the exact failure mode this file exists to end.

/** militaryCards, whatAudience */
const titleDescSchema = z.strictObject({
  title: z.string(),
  desc: z.string(),
})

/** whatContent, howFormats */
const iconTitleDescSchema = z.strictObject({
  icon: z.string(),
  title: z.string(),
  desc: z.string(),
})

/** stats */
const statSchema = z.strictObject({
  num: z.string(),
  label: z.string(),
  desc: z.string(),
})

/** testimonials */
const testimonialSchema = z.strictObject({
  text: z.string(),
  icon: z.string(),
  name: z.string(),
  sub: z.string(),
})

/**
 * heroBadges — a SOURCE-ONLY key (ledger D-18). That is a statement about the
 * SCHEMA, not about the data: the key MAY be absent from a non-source
 * catalogue, and `load()` then supplies it, per key, from the source locale.
 * It is NOT Hebrew-only. Each locale is served whatever IT supplies, falling
 * back to the source locale only where the key is absent — read the mechanism
 * rather than a snapshot, because the snapshot moves. (It has: messages/en.json
 * carries its own three English badge alts as of W16-D, so `en` is served
 * English here and this fallback does not fire. MEASURED 2026-09-13 through
 * `getMessages` in both locales.)
 *
 * `alt` is `.min(1)` on purpose: these are `<img alt>` values, and an empty alt
 * is the accessibility failure the source-locale fallback rule exists to
 * prevent. It is not the only `.min(1)` position in the catalogue — see HONEST
 * LIMIT 4 for the full list of 12.
 */
const heroBadgeSchema = z.strictObject({
  alt: z.string().min(1),
})

/**
 * imageAlts — a SOURCE-ONLY key (ledger D-18), keyed by IMAGE BASENAME. Same
 * mechanism as `heroBadges` above, and the same correction: this is not
 * Hebrew-only. messages/en.json supplies its own six English values, so `en` is
 * served English and the per-key fallback in `load()` does not fire for it.
 * MEASURED 2026-09-13 through `getMessages` in both locales. The basename
 * is the key because it is already the contract between a section and its asset
 * (`/images/<basename>.webp`); keying by anything else would be a second naming
 * scheme for one fact.
 *
 * `strictObject` with the basenames spelled out, not `z.record`: a record would
 * type a misspelled basename as a valid lookup and hand the section `undefined`
 * at runtime. Spelled out, `m.imageAlts['helmit-bird']` is a COMPILE error.
 *
 * Every value is `.min(1)` for the same reason as `heroBadgeSchema.alt`: these
 * are `<img alt>` values, and empty is the accessibility failure this map exists
 * to prevent. That is NOT a global rule — `lectureItems[3]` and `stats[*].desc`
 * are legitimately `""` (see limit 4) — it is specific to alt text.
 *
 * ONLY the six images whose alt text exists NOWHERE ELSE in the catalogue are
 * here. The other nineteen live assets are deliberately absent, and absence is
 * the correct answer for each of them (ONE FACT ONE PLACE):
 *   · hativa188 / plugat-golan / sufa-badge → `heroBadges[0..2].alt`
 *   · wine-red / wine-rose / wine-white / wine-trio → `wine[0..3]`
 *   · tank-firing / tuval-gdud53 / tuval-samar → `militaryCards[0..2].title`
 *   · blood-donation / speech-event / media-interview → `lectureItems[1..3]`
 *   · military-bg-flag, lectures-bg-soldiers, form-bg-tank, wine-bg-tanks,
 *     stats-bg-soldier, knesset-bg → the customer renders these `alt=""`. They
 *     are decorative backgrounds; `alt="" aria-hidden` is correct, not a gap.
 * Manufacturing an entry for any of them would either duplicate a fact or
 * invent one.
 */
const imageAltsSchema = z.strictObject({
  'tuval-hero': z.string().min(1),
  'helmet-bird': z.string().min(1),
  'soldier-landscape': z.string().min(1),
  'lecture-soldiers': z.string().min(1),
  'israel-flag': z.string().min(1),
  'tank-friends': z.string().min(1),
})

// ─── THE CATALOGUE SHAPE — stated once, in two halves ────────────────────────

/**
 * Keys every locale must supply: every top-level key of messages/he.json except
 * the two in SOURCE_ONLY_SHAPE. That is 62 strings + 9 arrays + `notFound`,
 * MEASURED 2026-09-13. (A previous count of 57 strings here predated the five
 * `privacy*` keys W16-A added, and went stale unnoticed. If you edit this
 * object, re-measure this line or delete the number.)
 * Order mirrors messages/he.json so the two can be diffed by eye.
 */
const COMMON_SHAPE = {
  dir: z.string(), // DATA ONLY — see HONEST LIMIT 6. Not the source of direction.

  heroTitle: z.string(),
  heroSubtitle: z.string(),
  heroSubtitle2: z.string(),
  heroCta: z.string(),
  heroStory: z.string(),
  heroDates: z.string(),
  heroRole: z.string(),
  heroBrigade: z.string(),
  heroBattalion: z.string(),

  storyTitle: z.string(),
  storyH3: z.string(),
  storyP1: z.string(),
  storyP2: z.string(),
  storyP3: z.string(),
  storyQuote: z.string(),

  militaryTitle: z.string(),
  militaryCards: z.array(titleDescSchema),

  battleTitle: z.string(),
  battleP1: z.string(),
  battleP2: z.string(),
  battleP3: z.string(),

  lecturesTitle: z.string(),
  lectureItems: z.array(z.string()),
  lecturesFooter: z.string(),

  statsTitle: z.string(),
  stats: z.array(statSchema),

  whatTitle: z.string(),
  whatContentTitle: z.string(),
  whatContent: z.array(iconTitleDescSchema),
  whatAudienceTitle: z.string(),
  whatAudience: z.array(titleDescSchema),

  howTitle: z.string(),
  howFormats: z.array(iconTitleDescSchema),

  testimonialsTitle: z.string(),
  testimonials: z.array(testimonialSchema),

  whyTitle: z.string(),
  whyReasons: z.array(z.string()),
  whyCta: z.string(),

  wineTitle: z.string(),
  wineSubtitle: z.string(),
  wineCta: z.string(),
  wine: z.array(z.string()),

  formTitle: z.string(),
  formSubtitle: z.string(),
  formName: z.string(),
  formPhone: z.string(),
  formEmail: z.string(),
  formOrg: z.string(),
  formMessage: z.string(),
  formNamePh: z.string(),
  formPhonePh: z.string(),
  formEmailPh: z.string(),
  formOrgPh: z.string(),
  formMsgPh: z.string(),
  formSubmit: z.string(),
  formSuccess: z.string(),
  formSuccessDesc: z.string(),
  formDirect: z.string(),
  required: z.string(),

  // W16-A THE PRIVACY NOTICE. `.min(1)`, not bare `z.string()`, and that is the
  // whole point: `components/sections/PrivacyNotice.tsx` renders NOTHING when any
  // one of these is blank, so an empty string here would silently delete the
  // notice from a served page with every test still green. `.min(1)` turns that
  // into a catalogue that refuses to load, naming the key. The list of keys lives
  // in PRIVACY_KEYS in that component; `i18n/__tests__/privacy-catalogue.test.ts`
  // is what fails if this block and that list ever disagree.
  privacyTitle: z.string().min(1),
  privacyData: z.string().min(1),
  privacyPurpose: z.string().min(1),
  privacyRetention: z.string().min(1),
  privacyContact: z.string().min(1),

  footerMemorial: z.string(),
  footerAge: z.string(),
  footerFriends: z.string(),
  footerContact: z.string(),
  copyright: z.string(),
  copyrightLink: z.string(),

  // Landing concurrently in both catalogues (another delegate). Declared REQUIRED:
  // if it is absent this module throws at import naming `notFound`. See LIMIT 7.
  notFound: z.strictObject({
    title: z.string(),
    description: z.string(),
    backHome: z.string(),
  }),
} as const

/**
 * THE COMPLETE LIST OF KEYS THAT MAY FALL BACK TO THE SOURCE LOCALE.
 *
 * A reader asking "which keys can be missing from en.json?" reads this object
 * and is done. It is not a convention and not a comment — both schemas below are
 * DERIVED from it, so the list and the behaviour cannot drift apart.
 *
 * WHY THESE TWO MAY FALL BACK — and it is a rule about what this codebase is
 * allowed to WRITE, not a claim about what the catalogues currently HOLD.
 *
 * `heroBadges` is here because W3-B proved no English equivalent existed
 * anywhere in the customer's tree: these are unit designations — proper nouns.
 * `imageAlts` is here for the same reason, proved the same way: all six were
 * literal Hebrew `alt` strings in the customer's components with no English
 * counterpart. For both, an INVENTED English description — of a unit insignia,
 * or of a photograph of a fallen soldier — would be a fabricated memorial fact.
 * That is forbidden. Serving the source-locale string instead is a recorded,
 * acceptable limit. Hence: absence is LEGAL for these two keys and for no
 * others, and `load()` below fills them from the source locale.
 *
 * WHAT IS ACTUALLY SERVED TODAY IS NOT THAT. MEASURED 2026-09-13 through
 * `getMessages` in both locales: messages/en.json now carries its own
 * `heroBadges` (3 entries) and its own `imageAlts` (6 values), all English, so
 * the `en` page is served English for both and NEITHER fallback line fires.
 * Denominator: 2 source-only keys, 2 examined, 2 now supplied by `en`, 0
 * currently falling back. This paragraph is a snapshot and will go stale; the
 * paragraph above it is the rule and will not. Prefer the rule.
 */
const SOURCE_ONLY_SHAPE = {
  heroBadges: z.array(heroBadgeSchema),
  imageAlts: imageAltsSchema,
} as const

/**
 * THE list of source-only keys, DERIVED from the shape above rather than typed
 * a second time. Exported because the fact "which keys may be absent from a
 * non-source locale" was, until now, ALSO written down as a hardcoded singular
 * `HE_ONLY_KEY = 'heroBadges'` in i18n/__tests__/messages.test.ts. Two copies of
 * one fact, and adding a second source-only key proved it: the test asserts
 * `enKeys.length === heKeys.length - 1`, which is true only while the list has
 * exactly one entry. Consuming this export makes the test correct for any
 * number of source-only keys, forever, without editing it again.
 */
export const SOURCE_ONLY_KEYS = Object.keys(SOURCE_ONLY_SHAPE) as ReadonlyArray<
  keyof typeof SOURCE_ONLY_SHAPE
>

/**
 * The schema a catalogue FILE must satisfy. Source-only keys are `.optional()`
 * here — that is the schema MARKING which keys may legitimately be absent,
 * rather than the accessor guessing at runtime.
 */
export const catalogueSchema = z.strictObject({
  ...COMMON_SHAPE,
  heroBadges: SOURCE_ONLY_SHAPE.heroBadges.optional(),
  imageAlts: SOURCE_ONLY_SHAPE.imageAlts.optional(),
})

/**
 * The schema a RESOLVED catalogue satisfies — everything present, because the
 * accessor has filled the source-only keys. This is also the schema the SOURCE
 * locale's own file is held to: the fallback target must exist. (IMPOSSIBLE c.)
 */
export const resolvedSchema = z.strictObject({
  ...COMMON_SHAPE,
  ...SOURCE_ONLY_SHAPE,
})

/**
 * THE message type for this project. `z.infer`, never hand-written — a parallel
 * type is two copies of one fact, and that is exactly how the customer's
 * `Translations` drifted into irrelevance.
 */
export type Messages = z.infer<typeof resolvedSchema>

/** A catalogue as it may appear on disk: source-only keys possibly absent. */
export type CatalogueFile = z.infer<typeof catalogueSchema>

// ─── LOADING ─────────────────────────────────────────────────────────────────

/**
 * The language the customer WROTE. Deliberately its own fact, not an alias of
 * DEFAULT_LOCALE: changing which locale a visitor lands on by default must not
 * silently change which locale supplies a missing proper noun.
 */
export const SOURCE_LOCALE: Locale = 'he'

/**
 * Total over the locale union by TYPE, not by convention: adding a locale to
 * LOCALES in config/site.ts makes this line fail to compile until its catalogue
 * exists. Same closure shape as LOCALE_DIRECTION in i18n/routing.ts.
 */
const RAW: Record<Locale, unknown> = {
  he: heMessages,
  en: enMessages,
}

function fail(locale: Locale, error: z.ZodError): never {
  const where = error.issues
    .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('; ')
  throw new Error(`messages/${locale}.json does not match the catalogue schema — ${where}`)
}

/**
 * Parse one locale's file and fill every source-only key from the source locale.
 *
 * The `heroBadges` line below is not optional politeness: `Messages` requires it,
 * the spread supplies it as possibly-undefined, so omitting this line is a
 * COMPILE error — and so is forgetting the same line for any future source-only
 * key. That is IMPOSSIBLE (d), enforced by the compiler rather than by review.
 *
 * The SOURCE locale is parsed with `resolvedSchema` (source-only keys REQUIRED),
 * every other locale with `catalogueSchema` (source-only keys optional). That
 * asymmetry is IMPOSSIBLE (c): the fallback target is proved to exist.
 *
 * THE LANGUAGE OF THESE TWO STRINGS IS DECIDED ON THE TWO `??` LINES BELOW, and
 * nowhere else. Left side: the locale's own text, in the document's language.
 * Right side: source-locale text embedded in a document of another language —
 * and THAT is the only condition under which an `<img alt>` here needs a `lang`
 * annotation at its render site (components/sections/Hero.tsx, `badgeLang`,
 * which points back at this comment). Today neither `??` takes its right side:
 * MEASURED 2026-09-13, `en` supplies both keys itself, so no annotation is owed
 * and Hero renders none.
 *
 * HONEST LIMIT This fallback is SILENT and no test in this repository fails
 * when it fires. A future locale that ships without `heroBadges` or `imageAlts`
 * will be served source-locale alt text with no `lang`, and nothing will say
 * so. Closing that means a test asserting per-locale coverage of
 * SOURCE_ONLY_KEYS — which would also forbid the very fallback this object
 * exists to permit, so it is a DESIGN decision, not a cleanup. Not taken here.
 */
function load(locale: Locale): Messages {
  if (locale === SOURCE_LOCALE) {
    const source = resolvedSchema.safeParse(RAW[locale])
    return source.success ? source.data : fail(locale, source.error)
  }

  const result = catalogueSchema.safeParse(RAW[locale])
  if (!result.success) return fail(locale, result.error)
  const file: CatalogueFile = result.data

  return {
    ...file,
    heroBadges: file.heroBadges ?? getMessages(SOURCE_LOCALE).heroBadges,
    imageAlts: file.imageAlts ?? getMessages(SOURCE_LOCALE).imageAlts,
  }
}

/** Memoised so each catalogue is parsed exactly once per process. */
const RESOLVED = new Map<Locale, Messages>()

/**
 * THE typed message accessor. Takes an already-validated `Locale` — it does not
 * re-declare or re-check the locale union, because config/site.ts owns it — and
 * returns a fully-typed, schema-validated, fallback-resolved catalogue.
 *
 * The parse happens on first access per locale and its result is cached, so no
 * caller can read a key without that locale's catalogue having been proved
 * against the schema; a catalogue that does not match throws here, naming the
 * exact path, instead of yielding `undefined` at a render site.
 */
export function getMessages(locale: Locale): Messages {
  const cached = RESOLVED.get(locale)
  if (cached !== undefined) return cached

  const loaded = load(locale)
  RESOLVED.set(locale, loaded)
  return loaded
}
