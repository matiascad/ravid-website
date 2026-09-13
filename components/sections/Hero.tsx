// ─────────────────────────────────────────────────────────────────────────────
// W4-01 HERO · components/sections/Hero.tsx — the top section, anchor `top`
//
// INVARIANT     Every user-visible string in this section — including all four
//               image `alt` values — arrives through the single typed prop `m`,
//               which is a `Pick` of the catalogue type, never a hand-written
//               shape; and every href and element id it emits is built by
//               `anchor()` / `SECTION_IDS` from config/site. There is no string
//               literal of copy in the render tree and no URL assembled here, so
//               the section states no fact of its own: it is a pure, synchronous
//               function from (catalogue slice, locale) to markup.
//
// IMPOSSIBLE    Four things can no longer be CONSTRUCTED in this section:
//               (a) Copy that the catalogue does not contain. The props type is
//                   `Pick<Messages, …>`, so renaming or deleting a key in the
//                   schema breaks THIS FILE at compile time; and because the
//                   values are only ever read from `m`, a translator changing a
//                   string cannot be contradicted by a literal baked in here.
//               (b) An anchor that drifts from the site-wide anchor contract
//                   (ledger D-11). `id` and both hrefs come from `SECTION_IDS`
//                   and `anchor()`, whose parameter is the `SectionId` union —
//                   `anchor('from')` is a compile error, not a dead link, and a
//                   stray space in `"#form "` cannot be written at all.
//               (c) A badge image with an empty or invented accessible name.
//                   Badge alts come only from `m.heroBadges[i].alt`, which the
//                   catalogue schema pins at `.min(1)`; and a badge whose
//                   catalogue entry is absent renders NOTHING rather than an
//                   image with a blank name — the `undefined` from
//                   `noUncheckedIndexedAccess` is narrowed away by a guard, never
//                   by `!` or a cast.
//               (d) A client-side hero. No client directive, no hook, no state, no
//                   effect, no fetch — the LCP section cannot acquire a hydration
//                   cost or a loading state without deleting this guarantee first.
//
// CLASS         THIS INSTANCE for the section's own markup — one section, one
//               file, and nothing here generalises to the other twelve. The
//               guarantees it leans on are closed by derivation ELSEWHERE and are
//               not re-derived here: catalogue shape and the source-locale
//               fallback in i18n/messages.ts, the anchor union and every constant
//               in config/site.ts.
//
// HONEST LIMIT  Seven, stated plainly.
//   1. THE PORTRAIT'S `alt` IS DEDICATED, AND IT IS NOW PER-LOCALE.
//      The earlier stopgap (`m.heroSubtitle`, which a screen reader then heard
//      twice) is GONE: the alt is `m.imageAlts['tuval-hero']`, a key transcribed
//      into the catalogue from the customer's own build after this section was
//      first written, schema-pinned at `.min(1)` and keyed by the image basename,
//      so it is neither borrowed from a visible string nor invented here. THIS
//      ITEM PREVIOUSLY SAID the alt was Hebrew in every locale, that the English
//      page served it with no `lang` annotation, and that the badges beside it
//      DID carry one. W16-FIX2 RE-MEASURED all three against the catalogue and
//      all three are now FALSE: messages/en.json carries its own `imageAlts` AND
//      its own `heroBadges`, the fallback in i18n/messages.ts is per-key
//      (`file.imageAlts ?? …`), so a present key is never overridden, and no
//      badge carries a `lang` in either locale (see `badgeLang`). The English
//      page therefore serves an English portrait `alt` and needs no annotation,
//      which VOIDS the "annotate the portrait" item formerly owed to the seat.
//      STILL NOT CLOSED: nothing fails if a future locale omits either key — the
//      per-key fallback is silent by design. Story.tsx was left untouched by this
//      delegate and is NOT-MEASURED here.
//   2. THE IMAGE BASENAMES ARE A CONTRACT WITH W6, NOT A DERIVATION. If W6 emits
//      a different basename or a different extension, all four images 404 and
//      nothing in this file, its test, or the type system notices.
//   3. DIRECTION IS DISCIPLINE PLUS A GREP, NOT A TYPE. Only logical utilities
//      appear here, and the test asserts that no physical-direction class reaches
//      the DOM — but jsdom lays nothing out, so neither this file nor its test
//      proves the section actually flips correctly under `dir="rtl"`. That needs
//      a browser.
//   4. BADGE `width`/`height` ARE LAYOUT SIZES CHOSEN HERE, not intrinsic asset
//      dimensions, which are unknown until W6 produces the files. They match the
//      CSS box exactly, so the aspect ratio cannot be distorted, but they are not
//      a fact about the images.
//   5. `priority` IS NOT DIRECTLY OBSERVABLE IN THE DOM on next@15.5: it emits no
//      attribute of its own, it only SUPPRESSES `loading="lazy"` (and preloads on
//      the server). The test therefore proves the portrait is the one image that
//      is not lazy — dropping `priority` turns that red — but it cannot prove the
//      preload link, and it cannot prove the image is in fact the LCP element.
//      W13-C RE-MEASURED THIS ON THE SERVED BYTES and it holds: the prerendered
//      `/he` carries 26 `<img>`, exactly one without `loading="lazy"` (this
//      portrait), and that one carried NO `fetchpriority` until this delegate
//      added the explicit prop. `fetchPriority` IS separately observable, so the
//      test now asserts it on the rendered element — that is a stronger claim
//      than "not lazy", and it does NOT replace it.
//      STILL NOT PROVED HERE: that this portrait is in fact the LCP ELEMENT.
//      That needs a real browser with a throttled mobile profile. W13-C could not
//      run one and recorded LCP as NOT-MEASURED; W14-B owns it.
//      Related: `fill` makes next/image write physical `left/right` INLINE STYLES
//      (all four insets zero). They are symmetric, so they are direction-safe,
//      but they are next/image's markup, not this file's, and the test's
//      physical-class sweep reads classNames only.
//   6. IT CHECKS SHAPE, NEVER TRUTH. That a date, a unit or a battalion number is
//      CORRECT is not knowable here; the catalogue is trusted completely.
//   7. THE GOLD ACCENT IS A UTILITY THIS FILE DOES NOT OWN. `.text-gold` is
//      defined once, by `.text-gold` in app/globals.css, as
//      `color: hsl(var(--accent))` — it
//      is a UTILITY, not a design token, which is why a search for a `--gold`
//      token finds nothing and concludes wrongly that the accent is unavailable.
//      It is applied to ONE fact, the dates, because that is where the customer's
//      own build applies it (ravid_website1/src/components/HeroSection.tsx:48).
//      The test asserts the class reaches exactly that one list item, but jsdom
//      computes no styles, so nothing here proves the rendered colour.
//
// W10-B ANALYTICS · Both hero CTAs are `TrackedLink`, not `<a>`. This section
// stays a SERVER component: only the anchor crosses the client boundary, and an
// `onClick` has no HTML serialisation, so the markup a visitor receives is
// unchanged (measured by hash, W10-B report). The two CTAs report DIFFERENT
// identities - `hero_book` and `hero_story` - which is the whole reason the
// identity field exists.
// HONEST LIMIT (analytics) The click is reported; the browser reaching the form
// anchor is not observed by any test in this repository. W14-B owns that.
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image'

import { TrackedLink } from '@/components/sections/TrackedLink'
import { ctaClick } from '@/lib/analytics/events'
import { anchor, SECTION_IDS, type Locale } from '@/config/site'
import type { Messages } from '@/i18n/messages'

/**
 * The catalogue slice this section consumes. DERIVED from `Messages` with
 * `Pick` — a hand-written shape would be a second copy of the catalogue and is
 * exactly how the customer's `Translations` type rotted into irrelevance.
 */
export type HeroMessages = Pick<
  Messages,
  | 'heroTitle'
  | 'heroSubtitle'
  | 'heroSubtitle2'
  | 'heroCta'
  | 'heroStory'
  | 'heroDates'
  | 'heroRole'
  | 'heroBrigade'
  | 'heroBattalion'
  | 'heroBadges'
  // The portrait's accessible name. Keyed by image basename — see HONEST LIMIT 1.
  | 'imageAlts'
>

export type HeroProps = {
  m: HeroMessages
  /**
   * The page's locale. NOT READ BY THIS SECTION ANY MORE. Its one consumer was
   * the badge `lang` override, which is gone (see `badgeLang`), and nothing else
   * here branches on locale. It stays in the CONTRACT because the call site
   * (the `<Hero>` element in app/[locale]/page.tsx) and this section's tests
   * pass it, and because it
   * is the input a re-introduced override would need; dropping it from the type
   * would be a change to this section's CALLERS, not to this section. Accepted
   * and deliberately unused — which is why the function below destructures `m`
   * only.
   */
  locale: Locale
}

/**
 * The unit badges, in the customer's own order and at the customer's own sizes
 * (ravid_website1/src/components/HeroSection.tsx:26-34). The `alt` for each is
 * NOT here: it is `m.heroBadges[i].alt`, because these are unit designations and
 * a designation is catalogue content, not layout.
 *
 * `box` is the circle's diameter, `img` the badge inside it — both in px, and
 * both restated in the className so the rendered box and the declared intrinsic
 * size cannot disagree.
 */
const BADGE_IMAGES = [
  { src: '/images/hativa188.webp', box: 'size-28', img: 'size-20', px: 80 },
  { src: '/images/plugat-golan.webp', box: 'size-16', img: 'size-12', px: 48 },
  { src: '/images/sufa-badge.webp', box: 'size-16', img: 'size-12', px: 48 },
] as const

/**
 * The LCP image. The only `priority` image on the page.
 *
 * `PORTRAIT_KEY` is the same basename as the path, because `imageAlts` is keyed
 * by basename (i18n/messages.ts) — one fact, spelled once per role. The key is a
 * literal member of a `strictObject`, so `m.imageAlts[PORTRAIT_KEY]` is `string`,
 * not `string | undefined`: no guard, no `!`, and a renamed key is a compile
 * error here rather than a blank `alt` in production.
 */
const PORTRAIT_SRC = '/images/tuval-hero.webp'
const PORTRAIT_KEY = 'tuval-hero' as const

/** The shared shape of one fact in the meta row, including its bullet. */
const META_CLASS =
  "after:ms-2 after:text-border after:content-['•'] last:after:content-none"

/**
 * The customer's gold accent on the dates (HeroSection.tsx:48). `.text-gold` is
 * a utility declared once as `.text-gold` in app/globals.css and bound to
 * `--accent`; this
 * file names it, it does not define a colour. See HONEST LIMIT 7.
 */
const META_ACCENT_CLASS = 'text-gold'

export function Hero({ m }: HeroProps) {
  /**
   * NO `lang` OVERRIDE ON A BADGE — and the reason is DATA, not style.
   *
   * Until W16-D, messages/en.json carried no `heroBadges`, so the English page
   * served the source-locale alt strings through the documented per-key fallback
   * in i18n/messages.ts (ledger D-18), and an English document had to declare
   * their language or a screen reader would voice them with English phonemes.
   * en.json now carries its OWN badge alts — MEASURED, three entries, all
   * English — so `m.heroBadges[i].alt` is always in the page's own language, and
   * `lang="he"` on it would now be a LIE about the text beneath it: the same
   * defect inverted. The override is held at `undefined` rather than deleted so
   * that this constant, and the wrapper attribute it feeds, remain the ONE place
   * a future locale's re-annotation would land.
   *
   * It is set on each badge's WRAPPER, not on the `<Image>`: next/image does not
   * forward a `lang` prop to the `<img>` it renders (measured in this repo's own
   * harness on next@15.5 — the prop is silently dropped). `lang` inherits to
   * descendants, so the wrapper delivers the same language context to the alt.
   *
   * HONEST LIMIT If a FUTURE locale ships without its own `heroBadges`, the
   * per-key fallback fires and this annotation must come back — and NO test in
   * this repository fails when that happens; the fallback is silent by design
   * (i18n/messages.ts). That condition belongs where the fallback is decided,
   * not here; this comment is the pointer. Consequence for this section: NOTHING
   * in it varies by locale any more — every locale renders identical markup and
   * flips through `dir` on <html> plus logical CSS, never through a branch here.
   */
  const badgeLang: string | undefined = undefined

  /**
   * The four facts under the subtitle, in the customer's order. Exactly one of
   * them carries the gold accent — the dates — because that is the one the
   * customer's own build accents (HeroSection.tsx:48). `accent` is a flag on the
   * data, not an index test in the JSX, so the pairing is readable in one place.
   */
  const meta = [
    { fact: m.heroDates, accent: true },
    { fact: m.heroRole, accent: false },
    { fact: m.heroBrigade, accent: false },
    { fact: m.heroBattalion, accent: false },
  ]

  return (
    <section
      id={SECTION_IDS.top}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-center"
    >
      <div className="absolute inset-0">
        <Image
          src={PORTRAIT_SRC}
          alt={m.imageAlts[PORTRAIT_KEY]}
          fill
          priority
          // `priority` alone emits NO fetchpriority attribute on next@15.5.25 —
          // MEASURED on the rendered bytes, not assumed: see HONEST LIMIT 5 and
          // W13-C. It only suppresses `loading="lazy"` and adds the preload link,
          // and a preloaded image still enters Chrome's queue at image priority,
          // behind the nine scripts and two stylesheets this page also requests.
          // This prop is what raises THIS fetch — and only this one — to High.
          // It is the one image on the page that may carry it.
          fetchPriority="high"
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8 flex flex-col items-end gap-3 self-end pe-4">
          {BADGE_IMAGES.map((badge, index) => {
            // `noUncheckedIndexedAccess`: narrowed, never asserted. A catalogue
            // with fewer badges renders fewer images — never a blank `alt`.
            const content = m.heroBadges[index]
            if (content === undefined) return null

            return (
              <div
                key={badge.src}
                lang={badgeLang}
                className={`${badge.box} flex items-center justify-center overflow-hidden rounded-full border-2 border-border bg-card/80`}
              >
                <Image
                  src={badge.src}
                  alt={content.alt}
                  width={badge.px}
                  height={badge.px}
                  className={`${badge.img} object-contain`}
                />
              </div>
            )
          })}
        </div>

        <h1 className="mb-5 text-4xl font-black leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
          {m.heroTitle}
        </h1>

        <p className="mb-5 max-w-md text-base leading-relaxed text-muted-foreground">
          <span className="block">{m.heroSubtitle}</span>
          <span className="block">{m.heroSubtitle2}</span>
        </p>

        <ul className="mb-9 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {meta.map((item) => (
            <li
              key={item.fact}
              className={
                item.accent ? `${META_CLASS} ${META_ACCENT_CLASS}` : META_CLASS
              }
            >
              {item.fact}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap justify-center gap-3.5">
          <TrackedLink
            href={anchor(SECTION_IDS.form)}
            event={ctaClick('hero_book')}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-7 py-3.5 text-base font-bold text-secondary-foreground transition-all duration-200 hover:bg-primary"
          >
            {m.heroCta}
          </TrackedLink>
          <TrackedLink
            href={anchor(SECTION_IDS.story)}
            event={ctaClick('hero_story')}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-7 py-3.5 text-base font-semibold text-foreground transition-all duration-200 hover:border-primary"
          >
            {m.heroStory}
          </TrackedLink>
        </div>
      </div>
    </section>
  )
}
