// ─────────────────────────────────────────────────────────────────────────────
// W11-A SPEAKER CONTENT MODEL — content/speaker.ts
//
// The type that makes INVENTION structurally impossible on a memorial page, and
// ABSENCE a first-class, renderable state.
//
// THE LIE THIS FILE EXISTS TO MAKE UNBUILDABLE: "a heading with nothing under
// it". The reflex shape is `{ bio?: string; venues?: string[] }`, and it permits
// three things that all type-check, compile and pass review while putting a lie
// on a bereaved brother's page:
//   (1) `{ bio: '' }`      — present, empty, renders a blank <h2> above a dead
//                            soldier's name. MEASURED, not hypothetical: this
//                            repo's own catalogue already contains ten blank
//                            strings (`lectureItems[3]`, `stats[0|2|3].desc`,
//                            `testimonials[0].sub`, in BOTH locales), because
//                            `z.string()` has no `.min(1)`. The shape that leaks
//                            is already in the building.
//   (2) `{ venues: [] }`   — "we have venues" followed by none of them.
//   (3) `t('speaker.bio')` resolving to the STRING `"speaker.bio"` — a missing
//                            next-intl key rendering as its own dotted name.
//                            That is `bg-gold` in text form: tsc green, ESLint
//                            green, tests green, and a raw key on the page.
//
// So: EVERY field is a two-arm union discriminated by the literal `present`, the
// present arm carries a REQUIRED branded value, and there is no optional
// property anywhere for a caller to exploit. A consumer that has narrowed to
// `present === false` has NO `value` in scope to render.
//
// ONE FACT ONE PLACE — and it decides the whole architecture. Localised prose
// lives in `messages/*.json` and NOWHERE ELSE; this repo also forbids Hebrew
// codepoints in `.ts` source, so it could not live here even if we wanted it to.
// This model therefore holds REFERENCES (`keyof Messages`, compile-checked) to
// text it does not own, plus the few facts that are genuinely not localised (a
// video URL, a poster path, a press date). A string is never in two places.
//
// INVARIANT     `resolveSpeakerContent()` returns, for every one of the six
//               fields independently, exactly one of two arms. The `true` arm
//               carries a required, branded, PROVEN-NON-BLANK value; the `false`
//               arm carries a required `reason` and no value. Nothing else is
//               reachable. Every string on a present arm has passed through
//               `readNonBlank`, which rejects `''`, whitespace-only, and a value
//               equal to the key that produced it. Absence is DATA, never a
//               thrown error and never an empty string, so a consumer cannot get
//               a renderable value by forgetting a guard.
//
// IMPOSSIBLE    Constructed values the compiler refuses (observed, captured
//               verbatim in the W11-A report and pinned permanently by
//               `@ts-expect-error` in this file's tests):
//                 · `text('')` and `text('   ')` — `NonBlank<S>` maps a blank
//                   string LITERAL to `never`, so the authoring path cannot
//                   write a present-but-empty value at all;
//                 · `{ present: true }` with no `value` — required on the arm;
//                 · `{ present: true, value: 'x' }` — `NonBlankText` is branded,
//                   so no plain string is assignable and no `''` can be passed
//                   off as one;
//                 · `{ present: true, items: [] }` — the present arm of a list
//                   carries `NonEmpty<T>` (`readonly [T, ...T[]]`), so an empty
//                   array is not assignable to the RENDERABLE arm. J1 below.
//                 · `{ url }` with no `poster` on a video — required. J2 below.
//                 · a `PressMention` without `outlet`, `publishedOn` or `url` —
//                   all three required. J3 below.
//                 · a reference to a message key that does not exist in the
//                   catalogue schema — `TextKey`/`TextListKey`/`TitleDescListKey`
//                   are derived
//                   from `keyof Messages` by value type, so a typo is a compile
//                   error in THIS file, before any test runs;
//                 · a present arm carrying a value the catalogue does not
//                   actually hold: the only way to build one is `readNonBlank`,
//                   which is fed by `getMessages(locale)` — the real accessor,
//                   zod-parsed — and not by a key name.
//
// THE THREE JUDGEMENT CALLS, DECIDED AND ENFORCED BY THE TYPE
//   J1  EMPTY ARRAY vs ABSENT ARRAY — DIFFERENT FACTS, NEITHER RENDERS.
//       "No venues recorded" and "we never asked Ravid" are different things to
//       know, and the difference tells the next human whether to go ask. So both
//       are representable, as `reason: 'none_recorded'` and `reason: 'unset'`.
//       But they are the SAME rendering decision: a "Venues" heading above zero
//       venues is defect (2). So neither reaches the present arm, and the
//       present arm is typed `NonEmpty<T>` — W11-B cannot map over an empty list
//       inside the render branch, because an empty list cannot be in it.
//
//   J2  A VIDEO WITH A URL AND NO POSTER DOES NOT RENDER — AND CANNOT BE
//       RECORDED. `poster` is REQUIRED beside `url`. Two reasons, neither about
//       layout. First, privacy: an unpostered third-party embed is an iframe
//       that loads on paint, which hands a booker's IP and cookies to YouTube
//       before anyone consented, and this repo has no consent mechanism —
//       nobody gave me one and I did not invent one. Second, dignity: with no
//       poster the first image of a dead soldier that a booker sees is a frame
//       chosen by a third party's thumbnail algorithm, not by his brother. The
//       poster IS the family's choice of frame. A url-without-poster is
//       therefore not an incomplete video, it is not a video; recording one
//       would create the tempting half-state ("we have the link, just ship it").
//       Where that half-state belongs is the OPEN ledger, not a shipped type.
//
//   J3  A PRESS MENTION REQUIRES OUTLET **AND** DATE **AND** URL. A press
//       mention is not prose, it is a VERIFIABILITY CLAIM: "someone can check
//       this". Outlet without date is uncheckable (which broadcast?); date
//       without outlet is uncheckable (where?); either without a URL is not
//       checkable by a booker in the thirty seconds they will give it. An
//       unattributed press claim is indistinguishable from an invented one, and
//       on this site that is the whole ballgame. All three are required on the
//       type. The headline is the only localised part and is the only optional
//       one — and it is optional-with-an-absent-branch, not optional-with-''.
//
// CLASS         Closed by derivation for EVERY field of this model, present and
//               future: a new field is a new `Field<T>`/`ListField<T>` line, so
//               it inherits the absent branch, the blank rejection and the
//               key-name guard without a decision. Closed at the TYPE, not at a
//               review checklist. NOT closed: whether a field SHOULD exist, and
//               what the customer's real content is — see HONEST LIMIT.
//
// WHAT IS DECLARED TODAY: NOTHING. `SPEAKER_CONTENT` is empty, deliberately.
//               The only permitted source of content is the customer's own build
//               at `ravid_website1/src/i18n/translations.ts`, and it contains NO
//               bio, NO credentials, NO venues, NO video and NO press mention for
//               Ravid — not in Hebrew and not in English. A string that is not
//               there does not exist, so five of six fields are `unset` and the
//               sixth is a boundary (see HONEST LIMIT 1). NO key was added to
//               `messages/*.json` by this wave, because there was no real string
//               to put in one, and a key invented to be filled later is the
//               placeholder prose this wave exists to prevent.
//
// HONEST LIMIT  A type cannot know whether a sentence is TRUE. This file proves
//               that no blank, no empty list, no unattributed press claim and no
//               raw message key can reach a render branch. It proves NOTHING
//               about whether a value someone does eventually declare is real.
//               `text('Ravid has lectured at 400 schools')` compiles perfectly.
//               That guarantee is human review against a source, and this file
//               only narrows the surface it has to cover. Five further limits,
//               deliberately:
//               (1) AUDIENCES ARE A BOUNDARY I STOPPED AT, NOT A GAP. Real
//                   audience content EXISTS — `whatAudience`, four entries, both
//                   locales — but `components/sections/WhatYouGet.tsx` ALREADY
//                   RENDERS IT. Declaring it here would put one fact on the page
//                   twice, which is the rule this file opens with. Which section
//                   owns that fact is an editorial decision nobody gave me, so
//                   `audiences` is modelled and left unset. The one edit that
//                   flips it, when a human decides: add
//                   `audiences: { kind: 'catalogue', key: 'whatAudience' }` to
//                   `SPEAKER_CONTENT` — and remove the audience block from
//                   WhatYouGet.tsx in the same change, never before or after.
//               (2) COMPILE-TIME BLANK REJECTION COVERS LITERALS ONLY. `text('')`
//                   is a compile error because `S` infers the literal `''`. A
//                   runtime `string` widens, `NonBlank<string>` is `string`, and
//                   it compiles — which is why `readNonBlank` re-checks at
//                   runtime on every catalogue read. Two layers, because the
//                   authoring path and the resolution path are different paths.
//               (3) NO RENDERING POLICY. This file says what is PRESENT. It does
//                   not say what order fields appear in, whether a section with
//                   one present field is worth showing, or how a video is
//                   embedded once J2 is satisfied. That is W11-B's, and
//                   `hasAnySpeakerContent` is offered as the single question it
//                   should ask, not as an answer to it.
//               (4) NO VENUE SHAPE BEYOND A NAME. A venue record might honestly
//                   need a date, a city, or an audience size. There is no source
//                   content for any of it, so inventing the shape would be
//                   inventing the fact's precision. `name` only, until a human
//                   supplies venues and the shape follows the data.
//               (5) THE KEY-NAME GUARD IS A BELT, NOT THE BRACES. Today
//                   `getMessages` is zod-parsed, so a missing key THROWS and
//                   cannot silently become its own name. The guard in
//                   `readNonBlank` costs one comparison and exists for the day
//                   someone reaches for raw `useTranslations` instead. It cannot
//                   catch a key whose real value happens to equal its own name.
// ─────────────────────────────────────────────────────────────────────────────

import { type Locale } from '@/config/site';
import { getMessages, type Messages } from '@/i18n/messages';

/* ── Compile-time blankness: `''` is not a value, it is a defect ──────────── */

/**
 * Every codepoint `String.prototype.trim` removes that can plausibly be typed
 * into a source file. Written as `\uXXXX` escapes on purpose: this repo forbids
 * non-ASCII prose in `.ts`, and a literal NBSP here would be invisible.
 */
type Whitespace =
  | ' '
  | '\t'
  | '\n'
  | '\r'
  | '\f'
  | '\v'
  | ' '
  | ' '
  | ' '
  | ' '
  | ' '
  | ' '
  | '　'
  | '﻿';

type TrimLeft<S extends string> = S extends `${Whitespace}${infer Rest}` ? TrimLeft<Rest> : S;
type TrimRight<S extends string> = S extends `${infer Rest}${Whitespace}` ? TrimRight<Rest> : S;
type Trim<S extends string> = TrimRight<TrimLeft<S>>;

/**
 * `never` for a blank string LITERAL, the literal itself otherwise.
 *
 * This is the whole compile-time half of the guarantee: `text('')` and
 * `text('  ')` are not runtime failures, they are arguments of type `string`
 * being passed to a parameter of type `never`. See HONEST LIMIT 2 for the half
 * it does not cover.
 */
export type NonBlank<S extends string> = Trim<S> extends '' ? never : S;

declare const NON_BLANK_TEXT: unique symbol;

/**
 * A string PROVED non-blank. Branded, so `''` is not assignable to it and no
 * plain string can be passed off as one — the same device `LeadId` uses in
 * `lib/leads/port.ts` for the same reason.
 */
export type NonBlankText = string & { readonly [NON_BLANK_TEXT]: 'NonBlankText' };

declare const ABSOLUTE_URL: unique symbol;

/** An absolute `https:` URL, proved by `URL` parsing — never a bare path. */
export type AbsoluteUrl = string & { readonly [ABSOLUTE_URL]: 'AbsoluteUrl' };

declare const SITE_PATH: unique symbol;

/** A root-relative path into this site's own `public/` — proved to start `/`. */
export type SitePath = string & { readonly [SITE_PATH]: 'SitePath' };

declare const ISO_DATE: unique symbol;

/** A calendar date as `YYYY-MM-DD`, proved to be a real day. */
export type IsoDate = string & { readonly [ISO_DATE]: 'IsoDate' };

/* ── Presence, as data ────────────────────────────────────────────────────── */

/**
 * Why a field is not renderable. Four kinds, because a human reading a
 * diagnostic has four different next actions.
 */
export type AbsenceReason =
  /** Never declared. Nobody has asked Ravid for this yet. */
  | 'unset'
  /** Declared as recorded-and-empty: asked, and the honest answer is none. J1. */
  | 'none_recorded'
  /** Declared, but the catalogue returned `''` or whitespace. Defect (1). */
  | 'blank'
  /** The catalogue returned the key's own name back. Defect (3). */
  | 'unresolved'
  /** Every entry in a declared list was individually rejected. */
  | 'all_entries_rejected';

/**
 * One field. THE type this wave exists for.
 *
 * A discriminated union, NOT `T | undefined` and NOT `T` with `''` as its
 * sentinel. `present: false` carries no `value`, so a consumer that has narrowed
 * to absence has nothing to render even by accident.
 */
export type Field<T> =
  | { readonly present: true; readonly value: T }
  | { readonly present: false; readonly reason: AbsenceReason };

/** A list with at least one element, at the TYPE. J1's enforcement. */
export type NonEmpty<T> = readonly [T, ...(readonly T[])];

/**
 * A list field. The present arm is `NonEmpty<T>`, so `{ present: true, items: [] }`
 * is a compile error rather than a heading over nothing.
 */
export type ListField<T> =
  | { readonly present: true; readonly items: NonEmpty<T> }
  | { readonly present: false; readonly reason: AbsenceReason };

/* ── The resolved shapes W11-B renders ────────────────────────────────────── */

/** One audience this lecture is tailored for. Both halves required. */
export interface Audience {
  readonly title: NonBlankText;
  readonly description: NonBlankText;
}

/** One place a lecture was given. See HONEST LIMIT 4. */
export interface Venue {
  readonly name: NonBlankText;
}

/** A video. `poster` is REQUIRED beside `url` — J2. */
export interface SpeakerVideo {
  readonly url: AbsoluteUrl;
  readonly poster: SitePath;
}

/** A press mention. Outlet, date and URL are ALL required — J3. */
export interface PressMention {
  readonly outlet: NonBlankText;
  readonly publishedOn: IsoDate;
  readonly url: AbsoluteUrl;
  /** The only localised part, and so the only optional one. */
  readonly headline: Field<NonBlankText>;
}

/**
 * The contract W11-B consumes. Six fields, six independent absent branches.
 * There is no seventh state and no field that is merely `undefined`.
 */
export interface SpeakerContent {
  readonly bio: Field<NonBlankText>;
  readonly credentials: ListField<NonBlankText>;
  readonly audiences: ListField<Audience>;
  readonly venues: ListField<Venue>;
  readonly video: Field<SpeakerVideo>;
  readonly pressMentions: ListField<PressMention>;
}

/* ── The declaration a human edits ────────────────────────────────────────── */

/**
 * The message keys whose catalogue value is a single string. Derived from
 * `keyof Messages` by VALUE TYPE, so a typo or a renamed key is a compile error
 * here rather than a dotted name on the page.
 */
export type TextKey = {
  [K in keyof Messages]-?: Messages[K] extends string ? K : never;
}[keyof Messages];

/** Message keys whose value is a list of plain strings (credentials shape). */
export type TextListKey = {
  [K in keyof Messages]-?: Messages[K] extends readonly string[] ? K : never;
}[keyof Messages];

/** Message keys whose value is a list of `{ title, desc }` (audiences shape). */
export type TitleDescListKey = {
  [K in keyof Messages]-?: Messages[K] extends readonly { title: string; desc: string }[]
    ? K
    : never;
}[keyof Messages];

/** A pointer at text this model does not own. Never the text itself. */
export interface CatalogueRef<K> {
  readonly kind: 'catalogue';
  readonly key: K;
}

/**
 * A declared list of non-localised records. `recorded: []` is J1's "asked, and
 * the answer is none" — legal to DECLARE, impossible to RENDER.
 */
export interface RecordedList<T> {
  readonly kind: 'recorded';
  readonly recorded: readonly T[];
}

/** A press mention before its headline has been resolved through a catalogue. */
export interface PressMentionDraft {
  readonly outlet: NonBlankText;
  readonly publishedOn: IsoDate;
  readonly url: AbsoluteUrl;
  /** Omit entirely when there is no headline. There is no `''` option. */
  readonly headlineKey?: TextKey;
}

/** A venue before its name has been resolved through a catalogue. */
export interface VenueDraft {
  readonly nameKey: TextKey;
}

/**
 * THE human-edited declaration. Every property is optional, and omitting one is
 * the `unset` branch — the ONLY way to say "we do not have this". There is no
 * property here that accepts a string, so there is nowhere to type a sentence.
 */
export interface SpeakerContentSource {
  readonly bio?: CatalogueRef<TextKey>;
  readonly credentials?: CatalogueRef<TextListKey>;
  readonly audiences?: CatalogueRef<TitleDescListKey>;
  readonly venues?: RecordedList<VenueDraft>;
  readonly video?: SpeakerVideo;
  readonly pressMentions?: RecordedList<PressMentionDraft>;
}

/**
 * What this site knows about Ravid as a speaker, today: NOTHING that is not
 * already on the page elsewhere.
 *
 * This emptiness is the FINDING of wave W11-A, not an omission from it. The
 * customer's own newest build carries no bio, no credentials, no venue list, no
 * video and no press mention. Five fields are `unset` because the content does
 * not exist; `audiences` is unset because the content DOES exist and is already
 * rendered elsewhere (HONEST LIMIT 1). Filling any of them with plausible prose
 * is the one thing this file was built to make impossible.
 */
export const SPEAKER_CONTENT: SpeakerContentSource = {};

/* ── Constructors: the only way to mint a branded value ───────────────────── */

/**
 * Mint a `NonBlankText` from a string LITERAL. `text('')` and `text('   ')` do
 * not compile — `NonBlank<S>` is `never` for them. See HONEST LIMIT 2.
 */
export function text<S extends string>(value: NonBlank<S>): NonBlankText {
  // `String()` is an identity for a string at runtime; it exists here only to
  // collapse the DEFERRED conditional type `NonBlank<S>` down to `string`, which
  // the brand can then be applied to. The alternative is a cast through
  // `unknown`, and a cast through `unknown` in the one function that mints
  // proven-non-blank text is exactly the hole this file is about.
  return String(value) as NonBlankText;
}

/** `https:` absolute URL, or absent. Failure is data. */
export function absoluteUrl(value: string): Field<AbsoluteUrl> {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { present: false, reason: 'blank' };
  }
  if (parsed.protocol !== 'https:') return { present: false, reason: 'blank' };
  return { present: true, value: value as AbsoluteUrl };
}

/** A root-relative path into this site's own assets, or absent. */
export function sitePath(value: string): Field<SitePath> {
  if (!value.startsWith('/') || value.startsWith('//')) {
    return { present: false, reason: 'blank' };
  }
  return { present: true, value: value as SitePath };
}

/** A real `YYYY-MM-DD` calendar day, or absent. Rejects `2026-02-31`. */
export function isoDate(value: string): Field<IsoDate> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { present: false, reason: 'blank' };
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return { present: false, reason: 'blank' };
  if (parsed.toISOString().slice(0, 10) !== value) return { present: false, reason: 'blank' };
  return { present: true, value: value as IsoDate };
}

/* ── Resolution: the ONLY path from a key to a renderable value ───────────── */

/**
 * What was dropped, and why. Failure is DATA here too: a resolver that silently
 * swallowed a blank entry would hide exactly the defect this wave is about.
 */
export interface ContentDiagnostic {
  readonly field: keyof SpeakerContent;
  readonly reason: AbsenceReason;
  /** Operator-facing. The message key or index involved. Never rendered. */
  readonly detail: string;
}

/**
 * Read one catalogue value and prove it renderable.
 *
 * Three rejections, in order: not a string at all; blank after trimming
 * (defect 1 — TEN such values already sit in this repo's catalogue); equal to
 * the key that produced it (defect 3, the `bg-gold` failure in text form).
 */
function readNonBlank(value: unknown, key: string): Field<NonBlankText> {
  if (typeof value !== 'string') return { present: false, reason: 'unresolved' };
  if (value === key) return { present: false, reason: 'unresolved' };
  if (value.trim() === '') return { present: false, reason: 'blank' };
  return { present: true, value: value as NonBlankText };
}

function absent<T>(reason: AbsenceReason): Field<T> {
  return { present: false, reason };
}

function absentList<T>(reason: AbsenceReason): ListField<T> {
  return { present: false, reason };
}

/**
 * Promote a plain array to the renderable arm, or say why not.
 *
 * This is the ONLY place a `ListField` present arm is built, and it is the only
 * place the `NonEmpty` cast happens — guarded by a length check one line above
 * it, so an empty list has no path to the arm that renders. J1.
 */
function presentList<T>(items: readonly T[], reasonWhenEmpty: AbsenceReason): ListField<T> {
  const [first, ...rest] = items;
  if (first === undefined) return { present: false, reason: reasonWhenEmpty };
  return { present: true, items: [first, ...rest] };
}

/** Content plus the record of everything that did not make it. */
export interface SpeakerContentResolution {
  readonly content: SpeakerContent;
  readonly diagnostics: readonly ContentDiagnostic[];
}

/**
 * THE boundary. Turns a declaration plus a REAL catalogue into content whose
 * every present value has been read back and checked — never a key name, never
 * a blank, never an empty list.
 *
 * `getMessages` is the repo's zod-parsed accessor, so this function resolves
 * through the same path a page does. Asserting that a key "exists" would be Law
 * 8; this asserts what a consumer RECEIVES.
 */
export function resolveSpeakerContent(
  locale: Locale,
  source: SpeakerContentSource = SPEAKER_CONTENT,
): SpeakerContentResolution {
  const messages = getMessages(locale);
  const diagnostics: ContentDiagnostic[] = [];

  const note = (field: keyof SpeakerContent, reason: AbsenceReason, detail: string): void => {
    diagnostics.push({ field, reason, detail });
  };

  /* bio ──────────────────────────────────────────────────────────────────── */
  let bio: Field<NonBlankText> = absent('unset');
  if (source.bio !== undefined) {
    const key = source.bio.key;
    bio = readNonBlank(messages[key], key);
    if (!bio.present) note('bio', bio.reason, key);
  }

  /* credentials ──────────────────────────────────────────────────────────── */
  let credentials: ListField<NonBlankText> = absentList('unset');
  if (source.credentials !== undefined) {
    const key = source.credentials.key;
    const raw: readonly string[] = messages[key];
    const kept: NonBlankText[] = [];
    raw.forEach((entry, index) => {
      const one = readNonBlank(entry, key);
      if (one.present) kept.push(one.value);
      else note('credentials', one.reason, `${key}[${index}]`);
    });
    credentials = presentList(kept, raw.length === 0 ? 'none_recorded' : 'all_entries_rejected');
  }

  /* audiences ────────────────────────────────────────────────────────────── */
  let audiences: ListField<Audience> = absentList('unset');
  if (source.audiences !== undefined) {
    const key = source.audiences.key;
    const raw: readonly { title: string; desc: string }[] = messages[key];
    const kept: Audience[] = [];
    raw.forEach((entry, index) => {
      const title = readNonBlank(entry.title, key);
      const description = readNonBlank(entry.desc, key);
      // An audience with half a record is DROPPED, never rendered half. The
      // title is tested first because it is the half that would otherwise have
      // become the blank heading.
      if (!title.present) {
        note('audiences', title.reason, `${key}[${index}].title`);
        return;
      }
      if (!description.present) {
        note('audiences', description.reason, `${key}[${index}].desc`);
        return;
      }
      kept.push({ title: title.value, description: description.value });
    });
    audiences = presentList(kept, raw.length === 0 ? 'none_recorded' : 'all_entries_rejected');
  }

  /* venues ───────────────────────────────────────────────────────────────── */
  let venues: ListField<Venue> = absentList('unset');
  if (source.venues !== undefined) {
    const drafts = source.venues.recorded;
    const kept: Venue[] = [];
    drafts.forEach((draft, index) => {
      const name = readNonBlank(messages[draft.nameKey], draft.nameKey);
      if (name.present) kept.push({ name: name.value });
      else note('venues', name.reason, `${draft.nameKey} (venues[${index}])`);
    });
    venues = presentList(kept, drafts.length === 0 ? 'none_recorded' : 'all_entries_rejected');
  }

  /* video ────────────────────────────────────────────────────────────────── */
  // Nothing to re-resolve: a URL and a poster path are not localised, and the
  // TYPE already refuses a url without a poster (J2). Presence is declaration.
  const video: Field<SpeakerVideo> =
    source.video === undefined ? absent('unset') : { present: true, value: source.video };

  /* pressMentions ────────────────────────────────────────────────────────── */
  let pressMentions: ListField<PressMention> = absentList('unset');
  if (source.pressMentions !== undefined) {
    const drafts = source.pressMentions.recorded;
    const kept: PressMention[] = [];
    drafts.forEach((draft) => {
      const headlineKey = draft.headlineKey;
      const headline: Field<NonBlankText> =
        headlineKey === undefined
          ? absent('unset')
          : readNonBlank(messages[headlineKey], headlineKey);
      if (headlineKey !== undefined && !headline.present) {
        note('pressMentions', headline.reason, headlineKey);
      }
      kept.push({
        outlet: draft.outlet,
        publishedOn: draft.publishedOn,
        url: draft.url,
        headline,
      });
    });
    pressMentions = presentList(kept, 'none_recorded');
  }

  return {
    content: { bio, credentials, audiences, venues, video, pressMentions },
    diagnostics,
  };
}

/**
 * Is there anything at all to show?
 *
 * Offered so W11-B asks ONE question instead of six, and so "the section is
 * hidden entirely" is a single typed answer rather than six `&&`s that someone
 * later gets wrong. It is not a rendering policy — see HONEST LIMIT 3.
 */
export function hasAnySpeakerContent(content: SpeakerContent): boolean {
  return (
    content.bio.present ||
    content.credentials.present ||
    content.audiences.present ||
    content.venues.present ||
    content.video.present ||
    content.pressMentions.present
  );
}
