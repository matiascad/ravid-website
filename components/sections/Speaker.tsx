// ─────────────────────────────────────────────────────────────────────────────
// W11-B · components/sections/Speaker.tsx — WHO IS RAVID
//
// TODAY THIS SECTION RENDERS NOTHING, AND THAT IS THE DELIVERABLE. The customer's
// own newest build carries no bio, no credentials, no venue, no video and no
// press mention for Ravid — not in Hebrew and not in English (W11-A's measurement
// of `ravid_website1/src/i18n/translations.ts`, re-checked by this delegate). A
// string that is not there does not exist, so `content/speaker.ts` declares
// nothing and this file renders nothing. Not an empty `<section>`, not a heading,
// not a wrapper div: the component returns `null` and the page's `innerHTML` is
// byte-for-byte what it was before this file existed.
//
// INVARIANT     NOTHING USER-VISIBLE IS AUTHORED HERE. Every word this file can
//               put on the page comes from `messages/*.json` (the heading) or
//               from a value `content/speaker.ts` proved renderable (the blocks).
//               There is no string literal below that a reader could ever see,
//               and there are no Hebrew codepoints in this file at all —
//               including in these comments (ledger D-13). Its own test scans it.
//
// THE HEADING   A section needs a heading; a heading is user-visible copy; this
//               delegate is forbidden to author copy. Three options were open.
//               (a) REUSE A CATALOGUE KEY. Both catalogues were read end to end
//                   (69 he keys, 67 en). Not one of them means "about the
//                   speaker": the closest are `storyTitle` (Tuval's story, not
//                   Ravid's), `whatTitle` ("what will you get") and `whyTitle`
//                   ("why book this lecture"). Reusing any of them would put a
//                   heading over content it does not describe. REJECTED.
//               (b) CARRY A REAL STRING ACROSS from the customer's build. There
//                   is none. `ravid_website1/src/i18n/translations.ts` was read
//                   and searched, and so was the whole of its `src/`: no "about",
//                   no "who is", no speaker-heading string exists in either
//                   locale. There was nothing to carry. REJECTED.
//               (c) THE SECTION STAYS ABSENT UNTIL THE COPY EXISTS. Chosen. The
//                   heading is modelled the same way every other fact in this
//                   wave is modelled — as a POINTER at the catalogue that is
//                   currently unset (`SPEAKER_HEADING`), never as text. It is a
//                   §OPEN row for the seat, not a gap in this file.
//
// IMPOSSIBLE    (1) AN INVENTED HEADING. `SPEAKER_HEADING` is typed
//                   `CatalogueRef<TextKey>`, and `TextKey` is derived from
//                   `keyof Messages`. There is nowhere in this file to type a
//                   sentence: a heading can only ever be a key that the catalogue
//                   already has, and a key the catalogue does not have is a
//                   COMPILE ERROR here rather than a dotted name on the page.
//               (2) A RAW KEY NAME ON THE PAGE. `renderableHeading` rejects a
//                   catalogue value that is blank, whitespace, or equal to the
//                   key that produced it — the text-shaped form of the `bg-gold`
//                   defect, where every gate is green and the reader sees
//                   nothing (or worse, sees `speakerTitle`). Rejection returns
//                   `null` from the whole component: no heading, no section.
//               (3) A HEADING OVER NOTHING, AND CONTENT UNDER NO HEADING. Both
//                   gates must open. Heading absent ⇒ nothing renders even with
//                   six full fields. Every block this section owns absent ⇒
//                   nothing renders even with a perfect heading.
//               (4) HALF-RENDERING A FIELD. Every field is narrowed on
//                   `.present` before it is touched; the absent arm carries no
//                   `value`/`items` at all, so there is no accidental `''`.
//
// TWO FIELDS ARE DELIBERATELY NOT RENDERED HERE, and the type says so out loud
// in `SPEAKER_FIELD_DISPOSITION` — a `Record<keyof SpeakerContent, …>`, so a
// seventh field added to the contract stops this file compiling instead of being
// silently dropped:
//   · `audiences` — ONE FACT ONE PLACE. Real audience content EXISTS
//     (`whatAudience`, four entries, both locales) and
//     `components/sections/WhatYouGet.tsx` ALREADY RENDERS IT. Rendering it again
//     would put one fact on the page twice. Moving it here means deleting it
//     there IN THE SAME CHANGE — an editorial decision nobody delegated, so this
//     file declines it and renders the field not at all. Proved by test, not by
//     this comment: an audiences-only fixture renders literally nothing.
//   · `video` — owned by a later delegate (the video surface is not this wave's).
//     Same treatment, same proof.
//
// CLASS         THIS INSTANCE for the heading decision (it is a judgement about
//               one section's copy). DERIVATION for the rendering policy: every
//               present field is reached through the same `.present` narrowing,
//               and the field disposition is exhaustive over the contract at the
//               type, so a new field cannot join the page by accident.
//
// HONEST LIMIT  Six, stated plainly.
//   1. THIS FILE PROVES NOTHING ABOUT HOW THE SECTION LOOKS. Its tests run in
//      jsdom, which loads no stylesheet: a Tailwind class that resolves to
//      nothing — the exact `bg-gold` shape — is INVISIBLE to every check here.
//      The classes below are copied from sibling sections that are already on
//      the page, which is an argument, not a measurement. Layout, contrast,
//      RTL/LTR behaviour and whether any of this is legible are NOT-MEASURED,
//      owner W14-B.
//   2. THE NON-BLANK RULE IS STATED TWICE. `content/speaker.ts` has
//      `readNonBlank` (blank ⇒ reject, key-name echo ⇒ reject) and it is not
//      exported; the heading is not part of `SpeakerContent`, so this file
//      restates the rule in `renderableHeading`. The closer is exporting
//      `readNonBlank`, which is an edit to `content/speaker.ts` that this
//      delegate is forbidden to make. Owed to the seat, not hidden.
//   3. THE SECOND CATALOGUE READ IS DEFERRED, NOT REMOVED.
//      `resolveSpeakerContent` reads the catalogue itself, so a page carrying an
//      ACTIVE Speaker section reads messages twice per render, against
//      `app/[locale]/page.tsx`'s ONE READ invariant. It cannot disagree with the
//      page (it is handed the page's own `locale`), and TODAY it never happens:
//      the heading gate returns before the resolver is called, measured at zero
//      calls by this file's test. The day the heading exists, that invariant's
//      prose needs revisiting. Owed to the seat.
//   4. `m` IS TYPED AS EVERY TEXT KEY, not one. The heading is a DECLARATION, so
//      its key is not known at the type — `Pick<Messages, TextKey>` is the
//      narrowest honest statement of "one text key, chosen by declaration". At
//      runtime exactly one is read. This is a weaker statement than every other
//      section's `Pick`, and it is the price of not inventing the key.
//   5. NO SECTION ID, NO ANCHOR. `SECTION_IDS` lives in `config/site.ts`, which
//      is outside this write-set, so this section is not linkable and is not in
//      the nav. Correct today (it does not render); a real decision when it does.
//   6. THIS FILE CANNOT KNOW IF A SENTENCE IS TRUE. It proves no blank, no empty
//      list and no key name reaches the DOM. It proves nothing about whether a
//      value someone eventually declares is real. That is human review against
//      the customer's own source, and on this site it is the whole ballgame.
// ─────────────────────────────────────────────────────────────────────────────
import {
  type CatalogueRef,
  type SpeakerContent,
  type TextKey,
  resolveSpeakerContent,
} from '@/content/speaker'
import { type Locale } from '@/config/site'
import { type Messages } from '@/i18n/messages'

/**
 * THE ONE EDIT THAT ACTIVATES THIS SECTION'S HEADING.
 *
 * `undefined` means: nobody has written a heading for this section, in either
 * locale, and none exists to carry over. It is not a placeholder and it is not
 * an empty key — an empty key IS placeholder prose with the prose deleted.
 *
 * When Ravid answers, a real string lands in BOTH `messages/he.json` and
 * `messages/en.json` under one new key, and this line becomes
 * `{ kind: 'catalogue', key: 'thatKey' }`. Nothing else in this file changes.
 * A key that does not exist in the catalogue will not compile here.
 */
const SPEAKER_HEADING: CatalogueRef<TextKey> | undefined = undefined

/**
 * Which of the contract's six fields this section puts on the page.
 *
 * Exhaustive at the TYPE over `SpeakerContent`: a seventh field is a compile
 * error in this object, not a field that quietly never renders. See the header
 * for why `audiences` and `video` are deferred rather than missing.
 *
 * Exported so the test can drive per-field assertions off this declaration
 * instead of off a second list that someone later forgets to update.
 */
export const SPEAKER_FIELD_DISPOSITION: Readonly<
  Record<keyof SpeakerContent, 'rendered-here' | 'deferred'>
> = {
  bio: 'rendered-here',
  credentials: 'rendered-here',
  audiences: 'deferred',
  venues: 'rendered-here',
  video: 'deferred',
  pressMentions: 'rendered-here',
}

/**
 * A catalogue value proved safe to show as this section's heading, or `null`.
 *
 * Three rejections, the same three `content/speaker.ts` applies to everything
 * else (HONEST LIMIT 2): not a string, the key's own name handed back, blank
 * after trimming. Each one would otherwise be a heading a reader cannot read.
 */
function renderableHeading(value: string, key: string): string | null {
  if (value === key) return null
  if (value.trim() === '') return null
  return value
}

/** Is any field THIS SECTION renders present? */
function hasRenderableBlock(content: SpeakerContent): boolean {
  // NOT `hasAnySpeakerContent`, deliberately. That function answers "is there
  // anything at all", and `content/speaker.ts` says of it, in its own words,
  // "It is not a rendering policy". With `audiences` and `video` owned
  // elsewhere, "anything at all" is TRUE in cases where this section has
  // nothing to show — and a heading over nothing is exactly the defect this
  // wave exists to prevent. The four fields below are the four in
  // SPEAKER_FIELD_DISPOSITION marked 'rendered-here'.
  return (
    content.bio.present ||
    content.credentials.present ||
    content.venues.present ||
    content.pressMentions.present
  )
}

export type SpeakerProps = {
  /**
   * Every text-valued key, because the heading's key is a declaration rather
   * than a literal. Exactly one is read. See HONEST LIMIT 4.
   */
  m: Pick<Messages, TextKey>
  locale: Locale
  /**
   * The resolved content. Defaults to the real declaration in
   * `content/speaker.ts`, resolved against `locale` — and that resolution is
   * only reached once the heading gate has opened, so today it never runs.
   * Supplying it is how the test seeds fixtures without inventing catalogue
   * keys; production never passes it.
   */
  content?: SpeakerContent
  /** Override for the same reason. Production never passes it. */
  heading?: CatalogueRef<TextKey>
}

export function Speaker({
  m,
  locale,
  content,
  heading = SPEAKER_HEADING,
}: SpeakerProps) {
  // GATE 1 — the heading. No heading, no section: content with no heading is
  // prose the reader cannot place, and there is no heading to have today.
  if (heading === undefined) return null

  const title = renderableHeading(m[heading.key], heading.key)
  if (title === null) return null

  // Reached only when a heading exists — which is why mounting this component
  // today costs the page zero extra catalogue reads (HONEST LIMIT 3).
  const resolved = content ?? resolveSpeakerContent(locale).content

  // GATE 2 — something to put under it.
  if (!hasRenderableBlock(resolved)) return null

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-[700px]">
        <h2 className="mb-8 text-center text-3xl font-black text-white md:text-4xl">
          {title}
        </h2>

        {resolved.bio.present ? (
          <p className="mb-8 text-[0.97rem] leading-[1.85] text-gray-200">
            {resolved.bio.value}
          </p>
        ) : null}

        {resolved.credentials.present ? (
          <ul className="mb-8 flex list-none flex-col gap-3 p-0">
            {resolved.credentials.items.map((credential) => (
              <li
                key={credential}
                className="rounded-xl border border-white/20 bg-black/50 p-4 text-sm text-gray-200"
              >
                {credential}
              </li>
            ))}
          </ul>
        ) : null}

        {resolved.venues.present ? (
          <ul className="mb-8 flex list-none flex-wrap gap-3 p-0">
            {resolved.venues.items.map((venue) => (
              <li
                key={venue.name}
                className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-gray-200"
              >
                {venue.name}
              </li>
            ))}
          </ul>
        ) : null}

        {resolved.pressMentions.present ? (
          <ul className="flex list-none flex-col gap-3 p-0">
            {resolved.pressMentions.items.map((mention) => (
              <li key={mention.url} className="text-sm text-gray-200">
                <a
                  href={mention.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="font-bold text-gold underline"
                >
                  {/*
                    The outlet is required by the contract and the headline is
                    not, so the link always has an accessible name — never an
                    empty anchor, and never a headline invented to fill one.
                  */}
                  {mention.headline.present
                    ? mention.headline.value
                    : mention.outlet}
                </a>
                {/*
                  The ISO date verbatim. Formatting it per locale would be this
                  file authoring a user-visible string, which it does not do.
                */}
                <time dateTime={mention.publishedOn} className="ms-2">
                  {mention.publishedOn}
                </time>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
