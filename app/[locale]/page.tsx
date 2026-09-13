// ─────────────────────────────────────────────────────────────────────────────
// W4-COMPOSE · app/[locale]/page.tsx — THE PAGE
//
// This file is the composition point and nothing else. It holds no copy, no
// markup decisions beyond the three landmark containers below, and no data.
// Thirteen sections existed and nothing rendered them; this renders them.
//
// INVARIANT     The message catalogue is read EXACTLY ONCE per render of this
//               route — the single `getMessages(locale)` call below — and every
//               section on the page is handed that one object. There is no
//               second read anywhere downstream, and there cannot be: no section
//               imports `getMessages` (measured: 0 call sites under
//               components/, only prose in five headers), and every next-intl
//               API that could return a message is an ESLint import ERROR
//               repo-wide (eslint.config.mjs, W3-E). So "which catalogue is this
//               page showing" has ONE answer, produced at ONE line, and a
//               section physically cannot disagree with it.
//
// IMPOSSIBLE    (a) A PER-SECTION CATALOGUE READ (ledger D-28). Thirteen reads
//                   of one fact is thirteen chances for the page to show two
//                   locales at once. It cannot be constructed here: `m` is a
//                   `const` from one call, and every section takes its messages
//                   as a PROP — none of them has a way to fetch its own.
//               (b) A SECTION READING A KEY IT DID NOT DECLARE. Each section's
//                   props type is its own `Pick<Messages, …>`, written in its own
//                   file. This page passes the whole catalogue, but inside a
//                   section `m` is typed as that Pick, so `m.wineTitle` inside
//                   `Hero` is a COMPILE error. The list of keys a section reads
//                   is stated once, by the section, and this file does not
//                   restate it — see HONEST LIMIT 2 for what that costs.
//               (c) A WHOLE-TREE CLIENT BOUNDARY. There is no 'use client' here,
//                   so the page is a server component and the two interactive
//                   leaves (`LeadForm`, `LanguageSwitcher`) each declare their
//                   own boundary in their own file, where a reader can see it.
//                   Importing a client component from a server component is the
//                   normal direction and costs this file nothing.
//               (d) AN UNVALIDATED LOCALE REACHING THE CATALOGUE.
//                   `getMessages` takes a `Locale`, not a `string`; the only path
//                   from `params` to it runs through `hasLocale` against
//                   routing.locales. Same guard as the layout, for the same
//                   reason (Next hands `params` to each route entry
//                   independently) — and it duplicates the CHECK, never the FACT:
//                   "what is a valid locale" is stated once, in routing.locales.
//               (e) SILENTLY DROPPING A SECTION. __tests__/page.test.tsx renders
//                   this page and asserts a distinct, section-owned marker for
//                   each of the thirteen. Deleting a line below turns that test
//                   RED. Without such a test an unrendered section is an
//                   invisible missing third of the page — which is exactly the
//                   state this file was written to end.
//
// CLASS         THIS INSTANCE for the composition itself. A fourteenth section
//               added tomorrow must be imported and rendered by hand here, and
//               nothing in the toolchain will notice if it is not — there is no
//               registry to derive the page from, and inventing one would put
//               the customer's ORDER (a designed sequence, not an alphabet) in a
//               data structure that cannot express why it is that order.
//               DERIVATION, and already closed elsewhere, for the rule this file
//               obeys: "a message is read in exactly one way" is enforced for
//               every file that exists or will exist by the ESLint import ban,
//               not by this page's good behaviour.
//
// HONEST LIMIT  Six, stated plainly.
//   1. THE ORDER IS A TRANSCRIPTION, not a derivation. It is W1's measurement of
//      the customer's own page (Index.tsx:18-30), typed out below. Nothing in
//      this repo can check it against that source — the customer's tree is out
//      of this delegate's reach by rule — so a wrong transcription would compile,
//      lint, and pass every test. The test pins the order this file declares; it
//      cannot pin it to the customer's intent.
//   2. EVERY SECTION RECEIVES THE WHOLE CATALOGUE, not a slice of it. The
//      alternative — building `{ heroTitle: m.heroTitle, … }` per section — would
//      copy each section's key list into this file, a second copy of a fact the
//      section already states in its own `Pick`, and that copy is exactly how the
//      customer's `Translations` type rotted. So the type governs READS (see
//      IMPOSSIBLE b) and the whole object is passed. It has ONE measurable cost,
//      and it is not hypothetical: `LeadForm` is a CLIENT component, so the props
//      it is given are serialised into the RSC payload — meaning all ~67
//      catalogue keys cross the boundary to serve the ~17 it reads. The closer is
//      a runtime key list or `pick` helper EXPORTED BY LeadForm.tsx beside its
//      type (its `LeadFormMessages` is currently not exported at all), so the
//      list stays in one file. That is an edit to a section, which this delegate
//      is forbidden to make; it is owed to the seat, not hidden.
//   3. `<main>` IS A DECISION THIS FILE MAKES. No section renders a main
//      landmark, so without it the page would have none and nothing in the
//      toolchain (jsx-a11y has no such rule) would say so. `LanguageSwitcher` is
//      outside it because a site-wide control is not page content, and `Footer`
//      is outside it because `<footer>` at page level is a sibling of `<main>`,
//      not a child. DOM ORDER IS UNCHANGED by any of that: the thirteen still
//      appear in exactly the order listed. If the customer's design ever needs a
//      different landmark structure, this is the paragraph to argue with.
//   4. THE FOUR IN-PAGE ANCHORS ARE NOT THIS FILE'S (ledger D-11). `#top`,
//      `#story`, `#form` and `#copyright` are rendered by Hero, Story, LeadForm
//      and Footer from `SECTION_IDS` in config/site.ts. This file neither writes
//      nor verifies them; it only avoids breaking them, by wrapping nothing that
//      carries one and reordering nothing.
//   5. THIS FILE CANNOT PROVE THE PAGE LOOKS RIGHT. The test asserts thirteen
//      sections are PRESENT and in order. Presence is not layout: a section that
//      renders into a zero-height box, or over another, passes every check here.
//      Only the build-and-probe gate downstream can speak to that.
//   6. NOTHING PREVENTS A LATER DELEGATE FROM ADDING 'use client' to this file
//      and pulling the entire page into the client bundle, which is the defect
//      W1 measured on the customer's root. The structural gate for that is not
//      written yet.
//
// ZERO COPY: not one user-visible string is authored here. Every word on the
// page comes from a section, which gets it from the catalogue. There are no
// Hebrew codepoints in this file, including in these comments (ledger D-13).
// ─────────────────────────────────────────────────────────────────────────────
import { notFound } from 'next/navigation'

import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { HowItLooks } from '@/components/sections/HowItLooks'
import { LanguageSwitcher } from '@/components/sections/LanguageSwitcher'
import { LeadForm } from '@/components/sections/LeadForm'
import { LecturesPreview } from '@/components/sections/LecturesPreview'
import { Military } from '@/components/sections/Military'
import { Stats } from '@/components/sections/Stats'
import { Story } from '@/components/sections/Story'
import { Testimonials } from '@/components/sections/Testimonials'
import { WhatYouGet } from '@/components/sections/WhatYouGet'
import { Why } from '@/components/sections/Why'
import { Wine } from '@/components/sections/Wine'
import { getMessages } from '@/i18n/messages'
import { routing } from '@/i18n/routing'

export default async function LocaleHomePage({
  params,
}: {
  // Next 15: params is a Promise and must be awaited (ledger D-3).
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // The segment is an effective catch-all, so this is an untrusted input even
  // though middleware matched the request. Narrows `locale` to `Locale` for both
  // `setRequestLocale` and `getMessages`.
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Required per route entry for static rendering with next-intl.
  setRequestLocale(locale)

  // THE ONE READ. See INVARIANT. Not repeated per section (ledger D-28).
  const m = getMessages(locale)

  return (
    <>
      {/*
        1. Fixed-position control, rendered first in source order but taken out
        of flow by its own `position: fixed` styles. After ledger D-24 disabled
        locale detection this is the ONLY discovery path to the English site:
        unmounted, /en is reachable only by hand-editing the URL. It takes no
        messages — its labels are CLDR endonyms, not catalogue copy.
      */}
      <LanguageSwitcher locale={locale} />

      <main>
        {/* 2-12. The customer's order, per HONEST LIMIT 1. */}
        <Hero m={m} locale={locale} />
        <Story m={m} locale={locale} />
        <Military m={m} locale={locale} />
        <LecturesPreview m={m} locale={locale} />
        <Stats m={m} locale={locale} />
        <WhatYouGet m={m} locale={locale} />
        <HowItLooks m={m} locale={locale} />
        <Testimonials m={m} locale={locale} />
        <Why m={m} locale={locale} />
        {/*
          `Wine` takes NO `locale`, alone among the twelve message-taking
          sections, because it is provably locale-invariant (ledger D-30). Its
          props type says so; passing one anyway would be a compile error. Do not
          "harmonise" this line.
        */}
        <Wine m={m} />
        <LeadForm m={m} locale={locale} />
      </main>

      {/* 13. Outside <main> by HTML semantics, not by reordering. */}
      <Footer m={m} locale={locale} />
    </>
  )
}
