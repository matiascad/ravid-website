// ─────────────────────────────────────────────────────────────────────────────
// W4-10 WINE — components/sections/Wine.tsx
//
// INVARIANT     A shop URL is written down exactly ONCE, in `WINE_URLS`
//               (config/site.ts, ledger §OPEN 4), and since W12-C this file no
//               longer even READS it: the only way out of this section is
//               `wineShopLink(variant)`, which owns both the address and its
//               UTM query. There is no URL and no query string in this file —
//               never retyped, never rebuilt by concatenation, never a host
//               interpolated into one. The set of products rendered is
//               likewise stated once: `PRODUCTS` below is
//               `Record<WineVariant, …>`, so the products this section knows
//               about ARE the keys of `WINE_URLS`, by type, not by agreement.
//               Every visible string comes from `m`; this file contains no copy.
//
// IMPOSSIBLE    Four things can no longer be CONSTRUCTED here.
//               (a) An inlined or stale shop link. There is no URL literal in
//                   this file, so "the customer changed shops" is one edit in
//                   config/site.ts, not a hunt across sections.
//               (b) A product this section silently forgets. `PRODUCTS` is total
//                   over `WineVariant` by TYPE: adding a fifth entry to
//                   `WINE_URLS` makes THIS FILE fail to compile until that
//                   variant is given an image, rather than quietly rendering
//                   four of five.
//               (c) A card whose label and link disagree. Label and product are
//                   paired by position exactly once, at the single `map` below,
//                   and the pairing is NARROWED, never asserted: with
//                   `noUncheckedIndexedAccess`, `PRODUCTS_IN_ORDER[index]` is
//                   `Product | undefined`, and the `undefined` branch renders a
//                   plain, UNLINKED card. A surplus label therefore cannot
//                   inherit the previous product's href or image — the failure
//                   mode is a missing link, never a wrong one.
//               (d) A price. There is no price in either repo (W1 swept both),
//                   no price key in the catalogue, and nothing here renders a
//                   number or a currency. The shop owns pricing; inventing one
//                   for a memorial page is not available through this file.
//
// CLASS         DERIVATION for URL ownership and for product totality — both are
//               closed by the type of `PRODUCTS`, for every variant present and
//               future, with no list to keep in sync. INSTANCE for ORDER and for
//               LABEL PAIRING: see HONEST LIMIT 1 and 2. That half is closed by
//               this section's test, not by the compiler, and the test is written
//               to go red on exactly those two drifts.
//
// HONEST LIMIT  Five, stated plainly.
//   1. ORDER IS THE LITERAL'S ORDER. `Object.values` on `PRODUCTS` yields
//      insertion order (spec-guaranteed for non-integer string keys), so
//      reordering the keys below reorders the page. That is deliberate — it
//      keeps the order in one place, beside the assets — but it is a convention
//      the compiler cannot check.
//   2. LABEL↔PRODUCT PAIRING IS POSITIONAL. `m.wine` is `string[]` with no
//      variant keys (ledger: array values are why the catalogue is flat), so
//      `m.wine[0]` is the red wine only because both lists agree on order.
//      Nothing in the type system enforces that. The test parses each card's
//      rendered href and asserts its base against the named `WINE_URLS` key AND
//      its `utm_content` against that position's variant name, which is what
//      makes a reordered catalogue red instead of silent.
//   3. THE IMAGE FILES DO NOT EXIST YET. `/images/wine-*.webp` is the contract
//      with W6; `public/images/` contains none of them at the time of writing.
//      This file will render `<img src>` pointing at 404s until W6 lands them.
//      Verified absent, not assumed.
//   4. `alt` IS THE LABEL. Each product image's alt is `m.wine[i]` — the label
//      already IS the description of the bottle, and a second `alt` key would be
//      one fact in two places (i18n/messages.ts records this exclusion by name).
//      Consequence: the alt is as good as the label, no better.
//   5. THE CTA POINTS AT THE TRIO PRODUCT. That is the customer's own shipped
//      behaviour (ravid_website1/src/components/WineSection.tsx:74), reproduced,
//      not chosen: no shop-collection URL exists in either repo, and inventing
//      one is banned. If the CTA should point elsewhere, that is a customer
//      question and a one-line edit in config/site.ts, not a change here.
//
// This section takes no `locale` prop: nothing in it varies by locale (`lang`
// and `dir` live on `<html>`, ledger D-5). Locale invariance is therefore
// structural, and the test asserts it rather than pretending at a difference
// (ledger D-30). It renders no `id`: `SECTION_IDS` has four entries and this is
// not one of them (C8) — inventing an anchor id would create a scroll target
// nothing links to.
//
// W10-B ANALYTICS · All five shop links are `TrackedLink`s reporting
// `wine_click`. The variant is read from `product.variant`, which the mapped
// `ProductTable` pins to the entry's own key - so the event and the href cannot
// name different wines. Server component unchanged; markup byte-identical.
// HONEST LIMIT (analytics) Reports the press, not whether the shop was reached.
//
// W12-C ATTRIBUTION + POSITION · Two changes, both deliberate, both visible.
//   (1) Every outbound href now comes from `wineShopLink(product.variant)`, so
//       it carries the UTM params declared in config/site.ts. The `url` field is
//       GONE from the product table: href and event now derive from ONE pinned
//       field, so they cannot name different wines. `rel` is UNCHANGED —
//       `noopener noreferrer` was already here and W12-C kept it; the UTM exists
//       precisely because `noreferrer` strips the header the shop would
//       otherwise have read. See config/site.ts for that argument in full.
//   (2) THIS SECTION NOW RENDERS AFTER THE LEAD FORM (app/[locale]/page.tsx).
//       It did not move because it is less important; it moved because it is the
//       page's strongest OUTBOUND link and it was standing in front of the
//       page's only conversion. Nothing in this file changed to achieve that —
//       the move is one line in the composition, and page.test.tsx asserts it in
//       the RENDERED DOM.
// HONEST LIMIT (W12-C) The UTM proves nothing about what the shop records. No
//   test here, and none possible here, observes the shop receiving a param; and
//   a shop that strips or ignores the query would leave every assertion in this
//   repo green. It also cannot see a click that never becomes a visit.
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image'

import { TrackedLink } from '@/components/sections/TrackedLink'
import { wineClick } from '@/lib/analytics/events'
import { wineShopLink, type WineVariant } from '@/config/site'
import type { Messages } from '@/i18n/messages'

/** Exactly the keys this section reads. Derived from the catalogue type. */
export type WineMessages = Pick<
  Messages,
  'wineTitle' | 'wineSubtitle' | 'wineCta' | 'wine'
>

export type WineProps = {
  readonly m: WineMessages
}

/**
 * The product table, as a MAPPED type over `WineVariant`. Mapped, not
 * `Record<WineVariant, Product>`, for one reason W10-B needed: each entry's
 * `variant` field is pinned to ITS OWN KEY, so `red: { variant: 'rose', … }` is
 * a compile error. That is what lets a wine link carry its identity to the
 * `wine_click` event without the event and the URL being able to name different
 * wines — the INVARIANT at the top of this file, now enforced for the analytics
 * payload as well as for the href.
 */
type ProductTable = {
  readonly [V in WineVariant]: {
    /**
     * ITS OWN KEY, and since W12-C the ONLY identity in this table. The href
     * and the `wine_click` event are BOTH derived from this one field at the
     * use site, so a card that links to the rosé and reports the white is no
     * longer merely unlikely — it is unconstructible. (Before W12-C a `url`
     * field sat beside it and the two could be written out of step.)
     */
    readonly variant: V
    /** The W6 asset contract: a full path, not a basename assembled at the use site. */
    readonly image: string
  }
}

/** One entry of the table, whichever wine it is. */
type Product = ProductTable[WineVariant]

/**
 * THE product table: one entry per shop URL, in display order.
 *
 * `ProductTable` is the load-bearing part — it makes this table
 * total over the keys of `WINE_URLS` at compile time (IMPOSSIBLE b). The array
 * literal order of the keys is the display order (HONEST LIMIT 1), and the
 * values carry no key, so nothing downstream needs to index by variant name.
 */
const PRODUCTS: ProductTable = {
  red: { variant: 'red', image: '/images/wine-red.webp' },
  rose: { variant: 'rose', image: '/images/wine-rose.webp' },
  white: { variant: 'white', image: '/images/wine-white.webp' },
  trio: { variant: 'trio', image: '/images/wine-trio.webp' },
}

/** Ordered, total, and carrying no index-signature lookup. */
const PRODUCTS_IN_ORDER: readonly Product[] = Object.values(PRODUCTS)

/** Decorative backdrop (D-29/D-32): `next/image` + `fill` + `alt=""`, never CSS. */
const BACKDROP_IMAGE = '/images/wine-bg-tanks.webp'
const BACKDROP_SIZES = '100vw'
const BOTTLE_SIZES = '(min-width: 768px) 220px, 33vw'

/** External links leave the site: every one of them carries this pair. */
const EXTERNAL_LINK = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

/**
 * The closing CTA's product. Named ONCE so its href and its event read the same
 * pinned `variant` field — see `ProductTable.variant`. HONEST LIMIT 5 (which
 * product the CTA points at) is unchanged; this only removes the chance of the
 * link and the event disagreeing about it.
 */
const CTA_PRODUCT = PRODUCTS.trio

export function Wine({ m }: WineProps) {
  return (
    <section className="relative overflow-hidden px-6 py-16">
      <Image
        src={BACKDROP_IMAGE}
        alt=""
        aria-hidden
        fill
        sizes={BACKDROP_SIZES}
        className="object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 mx-auto max-w-[700px]">
        <h2 className="mb-3 text-center text-3xl font-black text-white md:text-4xl">
          {m.wineTitle}
        </h2>
        <p className="mb-10 text-center text-gray-300">{m.wineSubtitle}</p>

        <ul className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {m.wine.map((label, index) => {
            // Narrowed, never asserted. A label with no product renders WITHOUT
            // a link rather than borrowing another product's — IMPOSSIBLE (c).
            const product = PRODUCTS_IN_ORDER[index]

            return (
              <li key={`${index}-${label}`} className="flex">
                {product === undefined ? (
                  <div className="flex w-full flex-col items-center rounded-xl border border-white/20 bg-black/50 p-4 backdrop-blur-sm">
                    <span className="mt-3 text-center text-sm font-bold text-white">
                      {label}
                    </span>
                  </div>
                ) : (
                  <TrackedLink
                    href={wineShopLink(product.variant)}
                    {...EXTERNAL_LINK}
                    event={wineClick(product.variant)}
                    className="group flex w-full flex-col items-center rounded-xl border border-white/20 bg-black/50 p-4 backdrop-blur-sm transition-colors hover:border-white/60"
                  >
                    <Image
                      src={product.image}
                      alt={label}
                      width={400}
                      height={600}
                      sizes={BOTTLE_SIZES}
                      className="h-48 w-auto object-contain md:h-56"
                    />
                    <span className="mt-3 text-center text-sm font-bold text-white">
                      {label}
                    </span>
                  </TrackedLink>
                )}
              </li>
            )
          })}
        </ul>

        <div className="text-center">
          <TrackedLink
            href={wineShopLink(CTA_PRODUCT.variant)}
            {...EXTERNAL_LINK}
            event={wineClick(CTA_PRODUCT.variant)}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-base font-bold text-black transition-colors hover:bg-gray-200"
          >
            {m.wineCta}
          </TrackedLink>
        </div>
      </div>
    </section>
  )
}
