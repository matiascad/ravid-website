// ─────────────────────────────────────────────────────────────────────────────
// W11-B · components/sections/__tests__/Speaker.test.tsx
//
// WHAT IT PROVES, and the proof is mostly about ABSENCE:
//   1. TODAY, IN BOTH LOCALES, THE SECTION RENDERS LITERALLY NOTHING.
//      `container.innerHTML === ''` — not an empty `<section>`, not a heading,
//      not a wrapper. Asserted on the EFFECT, never on the identifier: nothing
//      below says "the component returns null" (ledger: a name is not a thing).
//   2. WITH A SEEDED FIXTURE, each block appears only when its own field is
//      present, in both locales, and per-field independence is driven off
//      `SPEAKER_FIELD_DISPOSITION` rather than off a second list here.
//   3. NO RAW MESSAGE KEY CAN REACH THE READER. A heading whose catalogue value
//      is blank, whitespace, or the key's own name hands back nothing at all.
//   4. MOUNTING THE SECTION CHANGES THE SERVED PAGE BY ZERO BYTES. The page is
//      rendered TWICE IN THE SAME RUN, in both locales, against the SAME
//      catalogue: once with the real section mounted and once with that mount
//      replaced by a component that renders nothing. The two HTML strings are
//      compared byte for byte. NOTHING IS PINNED, so an approved edit to the
//      page's copy cannot turn this red; only the section emitting a byte can.
//   5. THIS FILE AND THE FILE IT TESTS CONTAIN NO HEBREW CODEPOINT. The scan is
//      built from NUMERIC code points (`0x0590`), never from a string escape
//      written as a backslash, the letter u, then four hex digits. That form
//      is SPELLED OUT IN WORDS here on purpose: an editor silently turns the
//      literal sequence into real Hebrew, invisibly in any diff viewer, which
//      is how a sibling's scanner caught itself tonight (ledger D-82).
//
// EVERY FIXTURE IS AN ASCII SENTINEL (`FIXTURE-BIO`). Never realistic prose,
// never Hebrew, and never a sentence about Ravid: this wave's whole finding is
// that no such sentence exists, and a test file is not a loophole for writing
// one.
//
// CLASS       Derivation throughout. The per-field assertions are quantified
//             over the six fields of the contract, so a seventh field cannot
//             slip past untested; the zero-byte proof is a comparison COMPUTED
//             IN THE RUN, so it is a statement about the section rather than a
//             measurement of one moment that has to be re-taken by hand.
//
// WHY NOT A HASH OF THE PAGE. It was one, against two constants captured the
// night the mount line was written, and it was WRONG — not stale, wrong. A
// whole-page digest covers every marketing string in the catalogue, and editing
// that copy is sanctioned work someone else owns. So the assertion went red for
// a reason that had nothing to do with the Speaker section, and its only obvious
// repair — re-pinning the two constants — teaches the next reader to re-pin
// without looking, which is the end of the invariant. A digest is a NAME. The
// comparison below measures exactly the invariant and nothing else.
//
// HONEST LIMIT  Four.
//   1. jsdom LOADS NO STYLESHEET. Every className in Speaker.tsx could resolve
//      to nothing — the `bg-gold` shape, where tsc, ESLint and every test are
//      green while the reader sees an invisible element — and this file would
//      stay green. Appearance is NOT-MEASURED, owner W14-B.
//   2. THE ZERO-BYTE PROOF'S BASELINE IS A MOCK, AND IT PROVES ONE THING ONLY.
//      The "without" side is the page re-imported with
//      `@/components/sections/Speaker` replaced by a component that renders
//      nothing — that mock IS the definition of "this mount point contributes
//      nothing", so what the comparison can be wrong about is the page's own
//      determinism, nothing else. It says NOTHING about the rest of the page:
//      both sides share every other section, so a defect anywhere else cancels
//      out and is invisible here (it belongs to `app/[locale]/__tests__/
//      page.test.tsx`). It goes red the day the section legitimately activates,
//      and that is deliberate: activation must be a decided change, not a quiet
//      one — but it goes red for the SECTION's output, never for the copy.
//   3. THE PAGE IS RENDERED THROUGH TWO MOCKS (a router hook and
//      `setRequestLocale`), copied from `app/[locale]/__tests__/page.test.tsx`
//      for the same harness reasons stated there. Nothing here proves anything
//      about static rendering.
//   4. IT PROVES TEXT REACHES THE DOM. It cannot prove any of that text is TRUE,
//      and no test can. That is human review against the customer's own source.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs'

import { render, screen } from '@testing-library/react'

import {
  Speaker,
  SPEAKER_FIELD_DISPOSITION,
  type SpeakerProps,
} from '@/components/sections/Speaker'
import { LOCALES, type Locale } from '@/config/site'
import {
  absoluteUrl,
  isoDate,
  sitePath,
  text,
  type Field,
  type SpeakerContent,
  type TextKey,
} from '@/content/speaker'
import { getMessages, type Messages } from '@/i18n/messages'

// The real hook requires a mounted app router; the real `setRequestLocale` is a
// throwing stub under Node's client export condition. Both mocks are lifted
// verbatim in intent from app/[locale]/__tests__/page.test.tsx. See HONEST
// LIMIT 3.
vi.mock('@/i18n/routing', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/i18n/routing')>()),
  usePathname: () => '/',
}))

vi.mock('next-intl/server', () => ({
  setRequestLocale: () => undefined,
}))

// A pass-through spy, so "how many times was the catalogue read" is a MEASURED
// number rather than a claim about code shape.
vi.mock('@/i18n/messages', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/i18n/messages')>()
  return { ...actual, getMessages: vi.fn(actual.getMessages) }
})

const catalogueReads = vi.mocked(getMessages)

/* ── Fixtures ─────────────────────────────────────────────────────────────── */

/**
 * A REAL text key, used ONLY so the heading path can be exercised at all. The
 * catalogue has no speaker heading — that is this wave's finding — so there is
 * no right key to name here, and every test below overrides this key's VALUE
 * with an ASCII sentinel. IT IS NOT A PROPOSAL for the section's heading; see
 * Speaker.tsx's header for why no key can be proposed today.
 */
const HEADING_FIXTURE_KEY = 'dir' satisfies TextKey

const HEADING_SENTINEL = 'FIXTURE-HEADING'

const HEADING_REF = { kind: 'catalogue', key: HEADING_FIXTURE_KEY } as const

/** The real catalogue, with one key's value replaced by an ASCII sentinel. */
function catalogueWithHeading(locale: Locale, headingText: string): Messages {
  return { ...getMessages(locale), [HEADING_FIXTURE_KEY]: headingText }
}

/** Narrow a constructor's `Field` to its value, or fail the fixture loudly. */
function required<T>(field: Field<T>, what: string): T {
  if (!field.present) throw new Error(`fixture rejected by the contract: ${what}`)
  return field.value
}

/** Every field absent. The shape of the world today. */
const NOTHING: SpeakerContent = {
  bio: { present: false, reason: 'unset' },
  credentials: { present: false, reason: 'unset' },
  audiences: { present: false, reason: 'unset' },
  venues: { present: false, reason: 'unset' },
  video: { present: false, reason: 'unset' },
  pressMentions: { present: false, reason: 'unset' },
}

/**
 * One fixture per field, each with that field present and the other five
 * absent. `Record<keyof SpeakerContent, …>` so a seventh field on the contract
 * is a compile error here rather than an untested one.
 */
const ONLY: Readonly<Record<keyof SpeakerContent, SpeakerContent>> = {
  bio: { ...NOTHING, bio: { present: true, value: text('FIXTURE-BIO') } },
  credentials: {
    ...NOTHING,
    credentials: { present: true, items: [text('FIXTURE-CREDENTIAL')] },
  },
  audiences: {
    ...NOTHING,
    audiences: {
      present: true,
      items: [
        {
          title: text('FIXTURE-AUDIENCE-TITLE'),
          description: text('FIXTURE-AUDIENCE-DESC'),
        },
      ],
    },
  },
  venues: {
    ...NOTHING,
    venues: { present: true, items: [{ name: text('FIXTURE-VENUE') }] },
  },
  video: {
    ...NOTHING,
    video: {
      present: true,
      value: {
        url: required(
          absoluteUrl('https://example.invalid/fixture-video'),
          'video url',
        ),
        poster: required(sitePath('/fixture-poster.webp'), 'video poster'),
      },
    },
  },
  pressMentions: {
    ...NOTHING,
    pressMentions: {
      present: true,
      items: [
        {
          outlet: text('FIXTURE-OUTLET'),
          publishedOn: required(isoDate('2024-01-02'), 'press date'),
          url: required(
            absoluteUrl('https://example.invalid/fixture-press'),
            'press url',
          ),
          headline: { present: true, value: text('FIXTURE-HEADLINE') },
        },
      ],
    },
  },
}

/** The sentinel a reader would see if that field's block rendered. */
const SENTINEL: Readonly<Record<keyof SpeakerContent, string>> = {
  bio: 'FIXTURE-BIO',
  credentials: 'FIXTURE-CREDENTIAL',
  audiences: 'FIXTURE-AUDIENCE-TITLE',
  venues: 'FIXTURE-VENUE',
  video: 'fixture-video',
  pressMentions: 'FIXTURE-HEADLINE',
}

const FIELD_NAMES: readonly (keyof SpeakerContent)[] = [
  'bio',
  'credentials',
  'audiences',
  'venues',
  'video',
  'pressMentions',
]

/** Everything this section renders, present at once. */
const EVERYTHING: SpeakerContent = {
  ...NOTHING,
  bio: ONLY.bio.bio,
  credentials: ONLY.credentials.credentials,
  venues: ONLY.venues.venues,
  pressMentions: ONLY.pressMentions.pressMentions,
}

/** Today's props: the real declaration, the real catalogue, nothing seeded. */
function liveProps(locale: Locale): SpeakerProps {
  return { m: getMessages(locale), locale }
}

/* ── 1. Today: nothing renders, in either locale ──────────────────────────── */

test.each(LOCALES)(
  '1. [%s] with nothing declared the section puts ZERO bytes in the DOM',
  (locale) => {
    const { container } = render(<Speaker {...liveProps(locale)} />)

    expect(container.innerHTML).toBe('')
    expect(container.childNodes.length).toBe(0)
  },
)

test.each(LOCALES)(
  '2. [%s] a full six-field fixture still renders nothing while no heading exists',
  (locale) => {
    const { container } = render(
      <Speaker m={getMessages(locale)} locale={locale} content={EVERYTHING} />,
    )

    expect(container.innerHTML).toBe('')
  },
)

test.each(LOCALES)(
  '3. [%s] a heading with nothing under it renders nothing',
  (locale) => {
    const { container } = render(
      <Speaker
        m={catalogueWithHeading(locale, HEADING_SENTINEL)}
        locale={locale}
        content={NOTHING}
        heading={HEADING_REF}
      />,
    )

    expect(container.innerHTML).toBe('')
    expect(screen.queryByText(HEADING_SENTINEL)).toBeNull()
  },
)

test('4. rendering the unset section reads the catalogue ZERO times', () => {
  const m = getMessages('he')
  catalogueReads.mockClear()

  render(<Speaker m={m} locale="he" />)

  expect(catalogueReads.mock.calls.length).toBe(0)
})

/* ── 2. Seeded: the blocks appear ─────────────────────────────────────────── */

test.each(LOCALES)(
  '5. [%s] every block this section owns reaches the reader when seeded',
  (locale) => {
    render(
      <Speaker
        m={catalogueWithHeading(locale, HEADING_SENTINEL)}
        locale={locale}
        content={EVERYTHING}
        heading={HEADING_REF}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: HEADING_SENTINEL }),
    ).toBeTruthy()
    expect(screen.getByText(SENTINEL.bio)).toBeTruthy()
    expect(screen.getByText(SENTINEL.credentials)).toBeTruthy()
    expect(screen.getByText(SENTINEL.venues)).toBeTruthy()

    const link = screen.getByRole('link', { name: SENTINEL.pressMentions })
    expect(link.getAttribute('href')).toBe(
      'https://example.invalid/fixture-press',
    )
    expect(screen.getByText('2024-01-02').getAttribute('datetime')).toBe(
      '2024-01-02',
    )
  },
)

test.each(LOCALES)(
  '6. [%s] the press link falls back to the outlet when a headline is absent',
  (locale) => {
    const mention = ONLY.pressMentions.pressMentions
    if (!mention.present) throw new Error('fixture is not present')

    const [first] = mention.items
    const content: SpeakerContent = {
      ...NOTHING,
      pressMentions: {
        present: true,
        items: [{ ...first, headline: { present: false, reason: 'unset' } }],
      },
    }

    render(
      <Speaker
        m={catalogueWithHeading(locale, HEADING_SENTINEL)}
        locale={locale}
        content={content}
        heading={HEADING_REF}
      />,
    )

    expect(screen.getByRole('link', { name: 'FIXTURE-OUTLET' })).toBeTruthy()
    expect(screen.queryByText('FIXTURE-HEADLINE')).toBeNull()
  },
)

/* ── 3. Per-field independence, quantified over the contract ──────────────── */

test('7. the six fields of the contract are all covered by a fixture', () => {
  expect(FIELD_NAMES.length).toBe(Object.keys(ONLY).length)
  expect(FIELD_NAMES.length).toBe(Object.keys(SPEAKER_FIELD_DISPOSITION).length)
})

test.each(
  LOCALES.flatMap((locale) => FIELD_NAMES.map((field) => ({ locale, field }))),
)(
  '8. [$locale] $field alone renders exactly what its disposition says',
  ({ locale, field }) => {
    const { container } = render(
      <Speaker
        m={catalogueWithHeading(locale, HEADING_SENTINEL)}
        locale={locale}
        content={ONLY[field]}
        heading={HEADING_REF}
      />,
    )

    if (SPEAKER_FIELD_DISPOSITION[field] === 'deferred') {
      // `audiences` is already on the page via WhatYouGet and `video` belongs to
      // another delegate. A field this section does not own puts NOTHING here —
      // not even the heading, because a heading over nothing is the defect.
      expect(container.innerHTML).toBe('')
      return
    }

    expect(screen.getByText(SENTINEL[field])).toBeTruthy()

    // ...and only that block. Every other field's sentinel is absent.
    FIELD_NAMES.filter((other) => other !== field).forEach((other) => {
      expect(screen.queryByText(SENTINEL[other])).toBeNull()
    })
  },
)

/* ── 4. No raw message key can ever be read by a human ────────────────────── */

test.each(LOCALES)(
  '9. [%s] a heading that resolves to its own key name renders nothing',
  (locale) => {
    const { container } = render(
      <Speaker
        m={catalogueWithHeading(locale, HEADING_FIXTURE_KEY)}
        locale={locale}
        content={EVERYTHING}
        heading={HEADING_REF}
      />,
    )

    expect(container.innerHTML).toBe('')
    expect(container.textContent).not.toContain(HEADING_FIXTURE_KEY)
  },
)

test.each(['', '   ', '\n\t'])(
  '10. a heading whose catalogue value is %j renders nothing',
  (blank) => {
    const { container } = render(
      <Speaker
        m={catalogueWithHeading('he', blank)}
        locale="he"
        content={EVERYTHING}
        heading={HEADING_REF}
      />,
    )

    expect(container.innerHTML).toBe('')
  },
)

test.each(LOCALES)(
  '11. [%s] no key name appears as visible text in a fully seeded render',
  (locale) => {
    const { container } = render(
      <Speaker
        m={catalogueWithHeading(locale, HEADING_SENTINEL)}
        locale={locale}
        content={EVERYTHING}
        heading={HEADING_REF}
      />,
    )

    const visible = container.textContent ?? ''
    expect(visible).not.toBe('')

    Object.keys(getMessages(locale)).forEach((key) => {
      expect(visible).not.toContain(key)
    })
  },
)

/* ── 5. Hebrew-codepoint self-scan ────────────────────────────────────────── */

// Built from NUMERIC code points, never from string escapes (ledger D-82).
const HEBREW_BLOCK_FIRST = 0x0590
const HEBREW_BLOCK_LAST = 0x05ff
const HEBREW_PRESENTATION_FIRST = 0xfb1d
const HEBREW_PRESENTATION_LAST = 0xfb4f

function hebrewCodePoints(source: string): readonly number[] {
  return Array.from(source)
    .map((character) => character.codePointAt(0) ?? 0)
    .filter(
      (point) =>
        (point >= HEBREW_BLOCK_FIRST && point <= HEBREW_BLOCK_LAST) ||
        (point >= HEBREW_PRESENTATION_FIRST &&
          point <= HEBREW_PRESENTATION_LAST),
    )
}

test('12. the scanner sees Hebrew when Hebrew is there', () => {
  // Proof the scan is alive rather than vacuously green: a code point built by
  // number, never typed as a letter.
  const aleph = String.fromCodePoint(HEBREW_BLOCK_FIRST + 0x20)

  expect(hebrewCodePoints(aleph).length).toBe(1)
  expect(hebrewCodePoints('plain ASCII').length).toBe(0)
})

test.each(['../Speaker.tsx', './Speaker.test.tsx'])(
  '13. %s contains no Hebrew codepoint at all',
  (relativePath) => {
    const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8')

    expect(hebrewCodePoints(source)).toEqual([])
  },
)

/* ── 6. Mounting the section costs the served page zero bytes ─────────────── */

/**
 * Which Speaker the page is composed with. Two spellings of one difference, and
 * it is the ONLY difference between the two renders below.
 */
type SpeakerUnderTest =
  | 'the-real-section'
  | 'a-mount-point-that-renders-nothing'

/**
 * The whole served page's HTML, rendered HERE, NOW, in this run.
 *
 * Both sides go through these same four lines, in the same process, against the
 * same `messages/*.json` — so the catalogue's copy is identical on both sides
 * whatever anyone has edited, and cancels. What does not cancel is the section:
 * the 'real' side runs `components/sections/Speaker.tsx`, the other replaces it
 * with a component that emits nothing. The comparison is therefore a statement
 * about that file's OUTPUT and about nothing else on the page.
 */
async function pageHtml(
  locale: Locale,
  speaker: SpeakerUnderTest,
): Promise<string> {
  vi.resetModules()

  if (speaker === 'a-mount-point-that-renders-nothing') {
    // THE BASELINE, written as code instead of carried as a constant. Not a
    // claim that "the component returns null" — a page in which that mount point
    // provably contributes zero bytes, to measure the real one against.
    vi.doMock('@/components/sections/Speaker', () => ({ Speaker: () => null }))
  } else {
    vi.doUnmock('@/components/sections/Speaker')
  }

  const page = await import('@/app/[locale]/page')
  const { container } = render(
    await page.default({ params: Promise.resolve({ locale }) }),
  )

  return container.innerHTML
}

test.each(LOCALES)(
  '14. [%s] mounting this section adds ZERO bytes to the served page',
  async (locale) => {
    const mounted = await pageHtml(locale, 'the-real-section')
    const absent = await pageHtml(locale, 'a-mount-point-that-renders-nothing')

    // Non-vacuity. Two empty strings are equal, and would prove nothing at all.
    expect(absent.length).toBeGreaterThan(0)

    // Bytes, not a digest of them: the invariant is "the same HTML", and a name
    // for the HTML is one indirection further from the thing being asserted.
    expect(mounted).toBe(absent)
  },
)
