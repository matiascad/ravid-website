// ─────────────────────────────────────────────────────────────────────────────
// W11-A SPEAKER CONTENT MODEL — TESTS
//
// WHAT THESE TESTS ASSERT, AND WHAT THEY DELIBERATELY DO NOT
//   They assert what a CONSUMER RECEIVES. Not once does a test here say "the key
//   `x` exists in the catalogue" — that is Law 8, and this repo earned the law
//   the hard way: tsc, ESLint, 261 tests, 5 gates and HTTP probes were all green
//   while the booking button was invisible, because `bg-gold` was an undefined
//   Tailwind class and Tailwind emits nothing for those, silently. The text-mode
//   version of that failure is a next-intl key rendering as its own dotted name.
//   So every assertion below resolves through `getMessages` — the REAL catalogue
//   accessor a page uses — and inspects the VALUE that comes back.
//
//   No fixture in this file is prose. Every synthetic string is an ASCII token
//   in SHOUTING-HYPHEN-CASE, chosen so that it could never be mistaken for copy
//   about a dead soldier if it ever escaped onto a page. There is no sample bio
//   here, and there is no sample bio anywhere in this wave.
//
//   Nothing here contains a Hebrew codepoint. The repo gate that forbids Hebrew
//   in `.ts` was measured this run and does NOT cover `content/**`, so the last
//   test in this file scans both `content/speaker.ts` and this file for the
//   Hebrew ranges — declared as NUMERIC CODE POINTS, so that the scanner cannot
//   become the thing it forbids. It already caught exactly that: the first draft
//   wrote the ranges as string escapes and the editor unescaped them into real
//   Hebrew characters. The test failed on its own source. See section 6.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { LOCALES, type Locale } from '@/config/site';
import {
  type Audience,
  type Field,
  type ListField,
  type NonBlankText,
  type PressMention,
  type PressMentionDraft,
  type SpeakerContent,
  type SpeakerContentSource,
  type SpeakerVideo,
  type VenueDraft,
  SPEAKER_CONTENT,
  absoluteUrl,
  hasAnySpeakerContent,
  isoDate,
  resolveSpeakerContent,
  sitePath,
  text,
} from '@/content/speaker';
import { SOURCE_ONLY_KEYS } from '@/i18n/messages';
import enMessages from '@/messages/en.json';
import heMessages from '@/messages/he.json';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/** vitest's root is this repo's root — the same directory the `@` alias maps to. */
const REPO_ROOT = process.cwd();

/** Every field name, so "for every field independently" is a LIST, not a habit. */
const FIELDS = [
  'bio',
  'credentials',
  'audiences',
  'venues',
  'video',
  'pressMentions',
] as const satisfies readonly (keyof SpeakerContent)[];

/**
 * The three shapes that must NEVER appear on a page. A present value equal to
 * any of them is the defect, whatever the type says.
 */
function isLeak(value: unknown, key: string): boolean {
  return value === undefined || value === null || value === '' || value === key;
}

/* ── 1. UNSET → ABSENT, for every field independently ─────────────────────── */

describe('unset is a first-class absent branch, not an empty string', () => {
  it.each(LOCALES)('every field of the shipped declaration is absent in %s', (locale: Locale) => {
    const { content } = resolveSpeakerContent(locale);

    for (const field of FIELDS) {
      const resolved: Field<unknown> | ListField<unknown> = content[field];
      expect(resolved.present).toBe(false);
      // The absent arm carries NO value and NO items — not `''`, not `undefined`
      // sitting in a property, not the key name. There is nothing to render.
      expect('value' in resolved).toBe(false);
      expect('items' in resolved).toBe(false);
      if (!resolved.present) expect(resolved.reason).toBe('unset');
    }
  });

  it.each(LOCALES)('nothing is shown at all when nothing is declared (%s)', (locale: Locale) => {
    const { content, diagnostics } = resolveSpeakerContent(locale);
    expect(hasAnySpeakerContent(content)).toBe(false);
    // Unset is not a failure, so it is not a diagnostic either.
    expect(diagnostics).toEqual([]);
  });

  it('the shipped declaration declares nothing', () => {
    // The FINDING of this wave, asserted rather than described: the customer's
    // own newest build contains no bio, credentials, venues, video or press
    // mention, so there is nothing honest to declare.
    expect(Object.keys(SPEAKER_CONTENT)).toEqual([]);
  });

  it.each(FIELDS)('%s is absent independently of the other five', (field) => {
    // Declaring ONE field must not accidentally make another present. Declared
    // here with the one real, non-invented list in the catalogue.
    const source: SpeakerContentSource = { credentials: { kind: 'catalogue', key: 'wine' } };
    const { content } = resolveSpeakerContent('he', source);
    const resolved: Field<unknown> | ListField<unknown> = content[field];
    expect(resolved.present).toBe(field === 'credentials');
  });
});

/* ── 2. PRESENT-BUT-EMPTY IS NEVER PRESENT ────────────────────────────────── */

describe('a blank value never reaches a render branch', () => {
  it.each(LOCALES)('a blank catalogue entry is dropped, not rendered (%s)', (locale: Locale) => {
    // MEASURED, not hypothetical: `lectureItems[3]` is `""` in BOTH catalogues,
    // because the schema uses `z.string()` with no `.min(1)`. Ten such blanks
    // exist in this repo today. This is the exact value that would render as a
    // blank bullet above a dead soldier's name.
    const raw: readonly string[] = locale === 'he' ? heMessages.lectureItems : enMessages.lectureItems;
    expect(raw.some((entry) => entry.trim() === '')).toBe(true);

    const source: SpeakerContentSource = { credentials: { kind: 'catalogue', key: 'lectureItems' } };
    const { content, diagnostics } = resolveSpeakerContent(locale, source);

    expect(content.credentials.present).toBe(true);
    if (!content.credentials.present) return;

    for (const entry of content.credentials.items) {
      expect(isLeak(entry, 'lectureItems')).toBe(false);
      expect(entry.trim()).not.toBe('');
    }
    expect(content.credentials.items.length).toBe(raw.length - 1);
    expect(diagnostics).toContainEqual({
      field: 'credentials',
      reason: 'blank',
      detail: 'lectureItems[3]',
    });
  });

  it('whitespace-only is blank', () => {
    // The runtime half of the guarantee (the compile-time half is section 3).
    // `text('   ')` does not compile, but a catalogue value can widen to
    // `string` at runtime, so both layers exist. HONEST LIMIT 2.
    expect(absoluteUrl('   ').present).toBe(false);
    expect(sitePath('   ').present).toBe(false);
    expect(isoDate('   ').present).toBe(false);
  });

  it('an empty recorded list is recorded-as-none, and does NOT render', () => {
    // J1: "no venues recorded" and "we never asked" are DIFFERENT FACTS and the
    // model keeps them apart — and neither one renders a heading over nothing.
    const asked: SpeakerContentSource = { venues: { kind: 'recorded', recorded: [] } };
    const { content: askedContent } = resolveSpeakerContent('he', asked);
    expect(askedContent.venues.present).toBe(false);
    if (!askedContent.venues.present) expect(askedContent.venues.reason).toBe('none_recorded');

    const { content: neverAsked } = resolveSpeakerContent('he', {});
    expect(neverAsked.venues.present).toBe(false);
    if (!neverAsked.venues.present) expect(neverAsked.venues.reason).toBe('unset');
  });

  it('an empty press list is recorded-as-none, and does NOT render', () => {
    const source: SpeakerContentSource = { pressMentions: { kind: 'recorded', recorded: [] } };
    const { content } = resolveSpeakerContent('he', source);
    expect(content.pressMentions.present).toBe(false);
    if (!content.pressMentions.present) expect(content.pressMentions.reason).toBe('none_recorded');
  });

  it('rejects a date that is not a real calendar day', () => {
    expect(isoDate('2026-02-31').present).toBe(false);
    expect(isoDate('2026-2-3').present).toBe(false);
    expect(isoDate('2026-02-28').present).toBe(true);
  });

  it('rejects a video URL that is not absolute https, and a poster that is not a site path', () => {
    // J2's companions: an http embed and a protocol-relative poster are both
    // third-party loads wearing a local costume.
    expect(absoluteUrl('http://example.test/v').present).toBe(false);
    expect(absoluteUrl('/relative').present).toBe(false);
    expect(absoluteUrl('https://example.test/v').present).toBe(true);
    expect(sitePath('//example.test/p.jpg').present).toBe(false);
    expect(sitePath('p.jpg').present).toBe(false);
    expect(sitePath('/p.jpg').present).toBe(true);
  });
});

/* ── 3. COMPILE ERRORS — the bad state is UNCONSTRUCTIBLE ─────────────────── */

describe('the compiler refuses the shapes that leak', () => {
  // Every `@ts-expect-error` below is a PERMANENT proof: if the refusal ever
  // stops happening, `npx tsc --noEmit` fails on the unused directive. vitest
  // strips types, so these are enforced by the typecheck gate, not by this run.
  // The verbatim errors are captured in the W11-A report.

  it('refuses an empty string literal as text', () => {
    // @ts-expect-error - NonBlank<''> is `never`: '' is not a value, it is a defect.
    const blank = text('');
    expect(blank).toBe('');
  });

  it('refuses a whitespace-only literal as text', () => {
    // @ts-expect-error - NonBlank<'   '> is `never` after Trim.
    const spaces = text('   ');
    expect(spaces.trim()).toBe('');
  });

  it('refuses a present arm with no value', () => {
    // @ts-expect-error - the `true` arm REQUIRES `value`; there is no success without one.
    const noValue: Field<NonBlankText> = { present: true };
    expect(noValue.present).toBe(true);
  });

  it('refuses a plain string as a proven-non-blank value', () => {
    // @ts-expect-error - NonBlankText is branded; no plain string is assignable.
    const unproven: Field<NonBlankText> = { present: true, value: 'FIXTURE-UNPROVEN' };
    expect(unproven.present).toBe(true);
  });

  it('refuses an empty list on the RENDERABLE arm', () => {
    // J1 enforced by the type: the present arm is `NonEmpty<T>`.
    // @ts-expect-error - [] is not assignable to readonly [Audience, ...Audience[]].
    const emptyRender: ListField<Audience> = { present: true, items: [] };
    expect(emptyRender.present).toBe(true);
  });

  it('refuses a video with a url and no poster', () => {
    // J2 enforced by the type, not by a runtime check in a component.
    // @ts-expect-error - `poster` is required beside `url`.
    const unpostered: SpeakerVideo = { url: absoluteUrlOrThrow('https://example.test/v') };
    expect(unpostered.url).toContain('https://');
  });

  it('refuses a press mention with no outlet, no date, or no url', () => {
    // J3 enforced by the type: an unattributed claim is unconstructible.
    // @ts-expect-error - `outlet` is required.
    const noOutlet: PressMentionDraft = { publishedOn: isoDateOrThrow('2026-01-01'), url: absoluteUrlOrThrow('https://example.test/a') };
    // @ts-expect-error - `publishedOn` is required.
    const noDate: PressMentionDraft = { outlet: text('FIXTURE-OUTLET'), url: absoluteUrlOrThrow('https://example.test/a') };
    // @ts-expect-error - `url` is required.
    const noUrl: PressMentionDraft = { outlet: text('FIXTURE-OUTLET'), publishedOn: isoDateOrThrow('2026-01-01') };
    expect([noOutlet, noDate, noUrl]).toHaveLength(3);
  });

  it('refuses a reference to a message key the catalogue does not have', () => {
    // The key-typo class, closed at the type: `TextKey` is derived from
    // `keyof Messages` by value type, so this never becomes a dotted name on a page.
    // @ts-expect-error - 'speaker.bio' is not a key of Messages.
    const typo: SpeakerContentSource = { bio: { kind: 'catalogue', key: 'speaker.bio' } };
    expect(typo.bio?.kind).toBe('catalogue');
  });

  it('refuses a reference whose catalogue value is the wrong shape', () => {
    // `heroTitle` is a string, not a list of { title, desc }.
    // @ts-expect-error - 'heroTitle' is not a TitleDescListKey.
    const wrongShape: SpeakerContentSource = { audiences: { kind: 'catalogue', key: 'heroTitle' } };
    expect(wrongShape.audiences?.kind).toBe('catalogue');
  });

  it('refuses a venue draft carrying prose instead of a key', () => {
    // There is nowhere in the source type to TYPE A SENTENCE. That is the point.
    // @ts-expect-error - 'FIXTURE-VENUE' is not a key of Messages.
    const prose: VenueDraft = { nameKey: 'FIXTURE-VENUE' };
    expect(prose.nameKey).toBe('FIXTURE-VENUE');
  });
});

/* Narrow helpers for the compile probes above: they take the `Field` returned by
 * a constructor and hand back the branded value, so a probe can be about the ONE
 * thing it is probing. They throw on absence rather than defaulting — a default
 * here would be the very substitution this wave forbids. */
function absoluteUrlOrThrow(value: string): PressMention['url'] {
  const parsed = absoluteUrl(value);
  if (!parsed.present) throw new Error(`test fixture is not an absolute https url: ${value}`);
  return parsed.value;
}

function isoDateOrThrow(value: string): PressMention['publishedOn'] {
  const parsed = isoDate(value);
  if (!parsed.present) throw new Error(`test fixture is not an iso date: ${value}`);
  return parsed.value;
}

/* ── 4. BOTH LOCALES RESOLVE; A ONE-SIDED KEY IS CAUGHT ───────────────────── */

describe('both locales resolve, and a one-sided key is caught rather than defaulted', () => {
  it.each(LOCALES)('%s resolves through the real catalogue without throwing', (locale: Locale) => {
    const source: SpeakerContentSource = {
      credentials: { kind: 'catalogue', key: 'wine' },
      audiences: { kind: 'catalogue', key: 'whatAudience' },
    };
    const { content } = resolveSpeakerContent(locale, source);

    expect(content.credentials.present).toBe(true);
    expect(content.audiences.present).toBe(true);
    if (!content.credentials.present || !content.audiences.present) return;

    // Law 8: not "the key exists" — what the consumer RECEIVED.
    for (const entry of content.credentials.items) {
      expect(isLeak(entry, 'wine')).toBe(false);
    }
    for (const audience of content.audiences.items) {
      expect(isLeak(audience.title, 'whatAudience')).toBe(false);
      expect(isLeak(audience.description, 'whatAudience')).toBe(false);
    }
  });

  it('the two locales return DIFFERENT text for the same reference', () => {
    // A fallback that silently served the source locale would pass every
    // "resolves" test above while showing Hebrew to an English booker. This is
    // the assertion that can tell the difference.
    const source: SpeakerContentSource = { audiences: { kind: 'catalogue', key: 'whatAudience' } };
    const he = resolveSpeakerContent('he', source).content.audiences;
    const en = resolveSpeakerContent('en', source).content.audiences;
    expect(he.present && en.present).toBe(true);
    if (!he.present || !en.present) return;
    expect(he.items.length).toBe(en.items.length);
    expect(he.items[0]?.title).not.toBe(en.items[0]?.title);
  });

  it('a key present in one catalogue and missing in the other is CAUGHT', () => {
    // The mechanism, exercised against the two real files. The only permitted
    // one-sided keys are the ones i18n/messages.ts already declares and fills by
    // an explicit, typed fallback — `SOURCE_ONLY_KEYS`, imported rather than
    // retyped here, so this test cannot drift from that list.
    const gaps = keyGaps(Object.keys(heMessages), Object.keys(enMessages));
    const undeclared = gaps.filter((key) => !SOURCE_ONLY_KEYS.some((allowed) => allowed === key));
    expect(undeclared).toEqual([]);
  });

  it('the gap checker actually detects a gap', () => {
    // Law 8 again: the test above passes when the checker is broken and returns
    // nothing. This one proves the checker is not inert.
    expect(keyGaps(['a', 'b'], ['a'])).toEqual(['b']);
    expect(keyGaps(['a'], ['a', 'c'])).toEqual(['c']);
    expect(keyGaps(['a'], ['a'])).toEqual([]);
  });
});

/** Top-level keys present in one catalogue and absent from the other, sorted. */
function keyGaps(left: readonly string[], right: readonly string[]): readonly string[] {
  const inLeft = new Set(left);
  const inRight = new Set(right);
  const missing = [
    ...left.filter((key) => !inRight.has(key)),
    ...right.filter((key) => !inLeft.has(key)),
  ];
  return [...new Set(missing)].sort();
}

/* -- 6. NO HEBREW IN `.ts` SOURCE --------------------------------------- */

describe('no Hebrew codepoint reaches a .ts file', () => {
  // The repo gate for this was measured this run and iterates only a wave's own
  // write-set; it does NOT cover `content/**`. So the discipline is here.
  //
  // The ranges are NUMERIC CODE POINTS, not string escapes, and that is not
  // fussiness: the first draft of this test used `\uXXXX` escapes inside a regex
  // literal and the editor wrote the actual Hebrew characters into the file. The
  // test below FAILED on its own source and is the only reason it was noticed.
  // A hexadecimal integer cannot be silently unescaped into the thing it names.
  const HEBREW_RANGES: readonly (readonly [number, number])[] = [
    [0x0590, 0x05ff], // Hebrew block
    [0xfb1d, 0xfb4f], // Alphabetic presentation forms (Hebrew)
    [0x200f, 0x200f], // RIGHT-TO-LEFT MARK, which copy-paste drags along
  ];

  /** The index of the first Hebrew codepoint, or -1. Never a boolean: a failure
   * that cannot say WHERE is a failure someone has to re-find by hand. */
  function findHebrew(source: string): number {
    for (let index = 0; index < source.length; index += 1) {
      const point = source.codePointAt(index);
      if (point === undefined) continue;
      for (const [low, high] of HEBREW_RANGES) {
        if (point >= low && point <= high) return index;
      }
    }
    return -1;
  }

  it.each(['content/speaker.ts', 'content/__tests__/speaker.test.ts'])(
    '%s contains no Hebrew codepoint',
    (relative: string) => {
      const source = readFileSync(path.join(REPO_ROOT, relative), 'utf8');
      expect(findHebrew(source)).toBe(-1);
    },
  );

  it('the Hebrew scanner is not inert', () => {
    // Built from code points so this file stays ASCII while proving the range.
    expect(findHebrew(String.fromCodePoint(0x05ea))).toBe(0);
    expect(findHebrew(String.fromCodePoint(0xfb2a))).toBe(0);
    expect(findHebrew(String.fromCodePoint(0x200f))).toBe(0);
    expect(findHebrew('FIXTURE-ASCII')).toBe(-1);
  });
});
