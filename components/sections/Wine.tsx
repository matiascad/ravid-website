// ─────────────────────────────────────────────────────────────────────────────
// W4-10 WINE — components/sections/Wine.tsx
//
// INVARIANT     A shop URL is written down exactly ONCE, in `WINE_URLS`
//               (config/site.ts, ledger §OPEN 4), and this section reads it —
//               never retypes it, never rebuilds it by concatenation, never
//               interpolates a host into it. The set of products rendered is
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
//      Nothing in the type system enforces that. The test asserts the exact
//      href of each card against the named `WINE_URLS` key, which is what makes
//      a reordered catalogue red instead of silent.
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
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image'

import { WINE_URLS, type WineVariant } from '@/config/site'
import type { Messages } from '@/i18n/messages'

/** Exactly the keys this section reads. Derived from the catalogue type. */
export type WineMessages = Pick<
  Messages,
  'wineTitle' | 'wineSubtitle' | 'wineCta' | 'wine'
>

export type WineProps = {
  readonly m: WineMessages
}

type Product = {
  /** Read from `WINE_URLS`. Never a literal — see INVARIANT. */
  readonly url: string
  /** The W6 asset contract: a full path, not a basename assembled at the use site. */
  readonly image: string
}

/**
 * THE product table: one entry per shop URL, in display order.
 *
 * `Record<WineVariant, Product>` is the load-bearing part — it makes this table
 * total over the keys of `WINE_URLS` at compile time (IMPOSSIBLE b). The array
 * literal order of the keys is the display order (HONEST LIMIT 1), and the
 * values carry no key, so nothing downstream needs to index by variant name.
 */
const PRODUCTS: Record<WineVariant, Product> = {
  red: { url: WINE_URLS.red, image: '/images/wine-red.webp' },
  rose: { url: WINE_URLS.rose, image: '/images/wine-rose.webp' },
  white: { url: WINE_URLS.white, image: '/images/wine-white.webp' },
  trio: { url: WINE_URLS.trio, image: '/images/wine-trio.webp' },
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
                  <a
                    href={product.url}
                    {...EXTERNAL_LINK}
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
                  </a>
                )}
              </li>
            )
          })}
        </ul>

        <div className="text-center">
          <a
            href={PRODUCTS.trio.url}
            {...EXTERNAL_LINK}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-base font-bold text-black transition-colors hover:bg-gray-200"
          >
            {m.wineCta}
          </a>
        </div>
      </div>
    </section>
  )
}
