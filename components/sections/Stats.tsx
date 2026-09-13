// ─────────────────────────────────────────────────────────────────────────────
// W4-05 STATS — components/sections/Stats.tsx
//
// INVARIANT     A figure reaches the DOM as the EXACT string the catalogue holds.
//               There is exactly one expression in this file that produces a
//               figure — `{stat.num}` — and it is a plain interpolation of the
//               catalogue value. No formatter, no parser, no locale-aware number
//               API, no sign concatenation, no length assumption. Equally: the
//               number of tiles is `m.stats.length` by construction, because the
//               only way a tile is produced here is `m.stats.map(...)`; and the
//               `desc` paragraph exists if and only if `stat.desc.length > 0`.
//
// IMPOSSIBLE    Four things can no longer be CONSTRUCTED in this file:
//               (a) A REFORMATTED figure. `+1000` cannot silently become `1,000`
//                   or `1000`, because nothing here treats `num` as a number:
//                   there is no `Number(...)`, no `Intl.NumberFormat`, no
//                   template that splices a sign onto digits. The four catalogue
//                   strings (`+1000`, `+57`, `100%`, the infinity sign) are
//                   opaque and are passed through untouched. The test asserts
//                   `textContent === '+1000'`, so a formatter added later is RED,
//                   not a quiet visual change nobody diffs.
//               (b) A HARDCODED TILE COUNT. There is no index literal and no `4`
//                   anywhere in the render; a catalogue of 3 or 5 stats renders 3
//                   or 5 tiles with no edit here. `noUncheckedIndexedAccess` has
//                   nothing to bite on, so there is also no `!` and no cast.
//               (c) AN EMPTY ELEMENT FOR AN EMPTY `desc`. `""` is real customer
//                   data in three of the four stats. The branch is explicit and
//                   returns `null`, so no `<p></p>` is emitted and no filler copy
//                   is invented to fill one.
//               (d) A LOCALE-CONDITIONAL RENDER. `locale` is accepted (the page
//                   passes it to all thirteen sections uniformly) and is
//                   deliberately NOT destructured: this section has no
//                   locale-dependent branch. That is not an assertion — the test
//                   renders `he` and `en` against one fixture and compares
//                   `innerHTML` byte for byte, so adding such a branch turns the
//                   suite red.
//
// CLASS         DERIVATION for figure fidelity, tile count and the empty-`desc`
//               branch: each is closed by the shape of the code (one
//               interpolation, one `map`, one explicit guard), not by a rule a
//               reviewer must remember, and it holds for any future catalogue
//               this schema admits. INSTANCE, explicitly, for the four figures
//               themselves — this file guarantees they are rendered unchanged; it
//               cannot know whether they are TRUE. See HONEST LIMIT 1.
//
// HONEST LIMIT  Five, stated plainly.
//   1. THE FIGURES ARE UNCONFIRMED CUSTOMER DATA (ledger OPEN 3). This file
//      renders them faithfully; it does not validate them. Nothing here would
//      notice if `+57` were wrong. The test uses FIXTURES, not the real
//      catalogue, on purpose: pinning an unconfirmed memorial figure in an
//      assertion would make the customer's own answer break the suite.
//   2. THE BACKGROUND ASSET DOES NOT EXIST YET. `/images/stats-bg-soldier.webp`
//      is the W6 contract; `public/images/` does not contain it at the time this
//      file was written. The declared 1920x1080 is the aspect ratio this section
//      REQUESTS of that asset, not a measurement of a file — it is required by
//      `next/image` and it caps the generated srcset. `object-cover` absorbs a
//      different intrinsic ratio, but a much smaller asset will upscale. If W6
//      ships different dimensions, these two numbers are the single place to
//      change and nothing else in this file depends on them.
//   3. `alt=""` IS A DELIBERATE EMPTY ALT, not a missing one: the photograph is a
//      decorative scrim behind text that already carries the whole meaning, and
//      the catalogue holds no alt key for it. Inventing one would be inventing
//      copy. If the customer later decides the photograph is informative, that is
//      a new message key, not an edit here.
//   4. NO SECTION ID. `SECTION_IDS` in `@/config/site` is a live contract listing
//      exactly four scroll targets, and `stats` is not one of them. This section
//      is therefore not an anchor target and does not invent an id to become one.
//   5. THE EXPORT SHAPE HEDGE IS RESOLVED. Thirteen sections were written
//      concurrently against a brief that never fixed named-vs-default. D-31 has
//      since settled it: one named export, no default. The default export that
//      once existed here as an integration hedge has been removed; this file now
//      exports `Stats` by name only, like every other section.
//
// CASTS: no `any`, no `!`, no `as`. Physical-direction utilities (ml/mr/pl/pr/
// left/right/text-left/text-right) do not appear; direction is owned by the
// `dir` attribute the layout sets, never re-derived here.
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image';

import type { Locale } from '@/config/site';
import type { Messages } from '@/i18n/messages';

type StatsProps = {
  m: Pick<Messages, 'statsTitle' | 'stats'>;
  locale: Locale;
};

/** Local DOM id for `aria-labelledby`. Not a site anchor — see HONEST LIMIT 4. */
const TITLE_ID = 'stats-title';

/** The W6 contract. See HONEST LIMIT 2. */
const BACKGROUND_SRC = '/images/stats-bg-soldier.webp';
const BACKGROUND_WIDTH = 1920;
const BACKGROUND_HEIGHT = 1080;

/**
 * `locale` is intentionally not destructured: nothing in this section varies by
 * locale. See IMPOSSIBLE (d) — the claim is tested, not asserted.
 */
export function Stats({ m }: StatsProps) {
  return (
    <section
      aria-labelledby={TITLE_ID}
      className="relative overflow-hidden px-6 py-[70px] text-center"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src={BACKGROUND_SRC}
          alt=""
          width={BACKGROUND_WIDTH}
          height={BACKGROUND_HEIGHT}
          sizes="100vw"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="relative z-10 mx-auto max-w-[700px]">
        <h2 id={TITLE_ID} className="mb-8 text-3xl font-black text-white md:text-4xl">
          {m.statsTitle}
        </h2>

        <ul className="mt-9 grid grid-cols-2 gap-5 md:grid-cols-4">
          {m.stats.map((stat, index) => (
            <li
              // The list is static and never reorders; an index key cannot
              // collide, where a duplicated `label` could.
              key={index}
              className="rounded-xl border border-white/20 bg-black/40 px-4 py-6 backdrop-blur-sm"
            >
              {/* The one and only figure expression in this file. */}
              <p className="mb-1.5 block text-4xl font-black text-gold">{stat.num}</p>
              <p className="mb-1 block text-sm font-bold text-white">{stat.label}</p>
              {stat.desc.length > 0 ? (
                <p data-testid="stat-desc" className="text-xs text-gray-300">
                  {stat.desc}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
