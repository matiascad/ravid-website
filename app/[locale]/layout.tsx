// ─────────────────────────────────────────────────────────────────────────────
// W3-A I18N-ROUTING · app/[locale]/layout.tsx  — THE DOCUMENT SHELL
//
// INVARIANT     The one <html> element in this project is created here, and its
//               `lang` and `dir` are DERIVED from the same locale that produced
//               the URL - `lang` is the segment itself, `dir` is that segment
//               looked up in LOCALE_DIRECTION. The URL, the document language and
//               the text direction are therefore three views of ONE fact, and
//               they cannot be set independently because only one of them is
//               written by hand.
//
// IMPOSSIBLE    (a) THE CUSTOMER'S DEFECT H. Their `dir` was applied to an inner
//                   <div> while index.html stayed permanently `lang="he"
//                   dir="rtl"`, so English content rendered inside an RTL
//                   document root. That cannot be CONSTRUCTED here: `dir` is on
//                   <html>, and there is no other <html> in the project to
//                   disagree with it (app/layout.tsx is a pass-through that emits
//                   no markup at all). An inner-<div> direction would now be a
//                   visible, redundant override rather than the only one.
//               (b) A document whose `lang` and `dir` disagree. Both come from
//                   `locale` in the same expression; there is no second variable.
//               (c) A locale segment that is not a real locale. `/unknown.txt`
//                   reaches this layout as a [locale] value (next-intl documents
//                   the segment as an effective catch-all); `hasLocale` narrows
//                   it or `notFound()` ends the render. There is no branch that
//                   renders an unvalidated string into `lang`.
//               (d) A locale rendered dynamically by accident.
//                   `generateStaticParams` enumerates routing.locales, so both
//                   /he and /en are prerendered from the routing contract rather
//                   than from a list someone maintained here.
//
// CLASS         DERIVATION for the shell: one <html>, one lang/dir source, one
//               font attachment, for every localised route that exists or will
//               exist - W4's thirteen sections inherit it without opting in. It
//               is THIS INSTANCE for `generateStaticParams`: it makes THESE
//               routes static; it installs no rule that a future route must be.
//
// HONEST LIMIT  1. NO CLIENT PROVIDER IS RENDERED, deliberately. `NextIntlClient-
//                  Provider` exists and is the documented way to give CLIENT
//                  components access to messages - and the brief's condition for
//                  adding it ("only if interactivity requires it") is measurably
//                  FALSE today: 0 files in app/, i18n/, lib/ or components/ carry
//                  'use client' as their first statement. Adding it now would
//                  serialise the whole catalogue into the client bundle to serve
//                  nothing. CONSEQUENCE, stated so it cannot surprise anyone: the
//                  first client component that calls `useTranslations` will throw
//                  at runtime until a provider is added. That is W4's call, at
//                  W4's leaf, with W4's justification - not a silent default.
//               2. [W5-B, CLOSED] Metadata is now PER-LOCALE and complete:
//                  `generateMetadata` below is the single author of title,
//                  description, canonical, hreflang and the share cards, and
//                  every URL in it is built by `@/lib/seo`. Nothing else in this
//                  project may declare any of them.
//               3. [W5-B, CLOSED] The hardcoded locale-invariant title is gone.
//                  Title and description are now READ from the catalogue via
//                  `getMessages()` - they are the same two facts the page's own
//                  <h1> and lede render (Hero.tsx:240, :244-245), so the share
//                  preview cannot drift from the page's words. W5-B LIMIT: the
//                  string 'Ravid Tzanani' that used to be the title has NO
//                  catalogue key of its own (measured: `Ravid` appears in en.json
//                  only inside `testimonials[].text` and `copyright`, and 0 times
//                  in he.json), so the speaker's name is no longer in <title>.
//                  Restoring it would mean either hardcoding it again or adding a
//                  catalogue key - both outside this write-set.
//               4. `dir` is correct at the DOCUMENT level. It does not make any
//                  individual component RTL-correct; a section that hardcodes
//                  `ml-4` instead of a logical property is still wrong in LTR,
//                  and nothing here detects that.
//               5. This file cannot prove the font actually loads. It attaches
//                  `--font-heebo` to <html>; if tailwind.config.ts is changed to
//                  read another variable name, both families fall back to the
//                  system stack with no build error - the same limit the previous
//                  shell declared, carried with the code that owns it.
// ─────────────────────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

import { Analytics } from '@/components/Analytics'
import { getMessages } from '@/i18n/messages'
import { LOCALE_DIRECTION, routing } from '@/i18n/routing'
import {
  OG_IMAGE_SIZE,
  languageAlternates,
  localeUrl,
  metadataCopy,
  ogImageUrl,
  siteOrigin,
} from '@/lib/seo'

import '../globals.css'

// `variable: '--font-heebo'` is a CONTRACT with tailwind.config.ts, which reads
// var(--font-heebo) for both `font-body` and `font-display`. Moved here from
// app/layout.tsx with the <html> element it must be attached to.
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-heebo',
})

/**
 * W5-B SEO — THE SINGLE AUTHOR OF THIS SITE'S METADATA.
 *
 * INVARIANT     Title, description, canonical, hreflang and both share cards are
 *               produced here, per locale, from two sources and no third: the
 *               message catalogue (`getMessages`, zod-validated) for the words,
 *               and `@/lib/seo` for every URL. This file types out no prose, no
 *               origin and no locale.
 * IMPOSSIBLE    (a) The old repo's defect - metadata holding a hand-typed second
 *                   copy of the hero copy that drifts from the page. There is no
 *                   string literal of copy below; `metadataCopy()` reads the very
 *                   keys Hero.tsx renders. (b) A canonical that disagrees with the
 *                   self-referential hreflang: both come from `localeUrl()`.
 *                   (c) A share image on someone else's CDN: `ogImageUrl()` can
 *                   only point at this project's own route.
 * HONEST LIMIT  `og:locale` is DELIBERATELY OMITTED. The OG spec wants
 *               `language_TERRITORY` (`he_IL`), and this project knows only the
 *               language - inventing a territory is inventing a fact, and
 *               emitting a bare `he` is emitting a malformed tag. hreflang, which
 *               correctly takes a bare language code, carries the locale
 *               targeting instead. Also: NOTHING HERE IS PROVED OVER HTTP. No
 *               test renders these tags; `next build` is another delegate's gate.
 *
 * Next 15: `params` is a Promise here exactly as in the layout (ledger D-3).
 * NOTE: a static `metadata` export must NOT coexist with this function - Next
 * treats declaring both in one file as an error. This replaces it.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  // The same single validation the layout uses, for the same reason: the
  // segment is an effective catch-all, and `getMessages` takes a real `Locale`.
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const copy = metadataCopy(getMessages(locale))
  const canonical = localeUrl(locale)
  const image = ogImageUrl()

  return {
    metadataBase: new URL(siteOrigin()),
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: languageAlternates(),
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title: copy.title,
      description: copy.description,
      images: [{ url: image, alt: copy.description, ...OG_IMAGE_SIZE }],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [image],
    },
  }
}

/** Prerender one route per locale, enumerated from the routing contract. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  // Next 15: params is a Promise and must be awaited (ledger D-3).
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // The segment is an effective catch-all, so this is an untrusted input at this
  // boundary even though middleware matched the request. `routing.locales` is the
  // single list; `hasLocale` is the single validation. Narrows `locale` to the
  // `Locale` union for both the direction lookup and setRequestLocale.
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Opts this subtree into STATIC rendering with next-intl. Without it, any
  // translation lookup forces the route dynamic.
  setRequestLocale(locale)

  // Ledger D-5: lang and dir belong on <html>, never on an inner <div>.
  return (
    <html lang={locale} dir={LOCALE_DIRECTION[locale]} className={heebo.variable}>
      <body>
        {children}
        {/* W5-B: the fix for the old repo's measured defect - Analytics.tsx
            existed and was imported 0 times across 11 files. It renders null
            when its env var is unset, so mounting it here is unconditional. */}
        <Analytics />
      </body>
    </html>
  )
}
