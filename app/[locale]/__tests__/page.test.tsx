// ─────────────────────────────────────────────────────────────────────────────
// W4-COMPOSE · app/[locale]/__tests__/page.test.tsx — THE THIRTEEN ARE ON THE PAGE
//
// WHAT THIS FILE IS FOR, and it is one thing: thirteen sections exist, each with
// its own green test, and NONE of those tests notices if the page stops
// rendering it. A section silently missing from the page is a missing third of
// the site that every other check in this repo reports as healthy. This is the
// only test in the repo that can see that.
//
// PROVED RED BEFORE IT WAS TRUSTED: with the single line `<Wine m={m} />`
// commented out of page.tsx, MEASURED 3 failed / 2 passed — test 1 names `Wine`
// as missing, test 2 names the pair it broke, and test 3 counts 10 flow sections
// where 11 are declared. The page was then restored and the file is green again.
// The marker set can therefore fail, one section at a time, which is the only
// reason to believe it when it passes.
//
// WHY IT CAN RENDER AN ASYNC SERVER COMPONENT AT ALL: `LocaleHomePage` is an
// async function returning an element tree whose children are all synchronous.
// `render(await LocaleHomePage({ params: … }))` therefore resolves the server
// half in the test itself and hands React a plain tree. This is NOT a general
// technique for RSC — it works here precisely because this page awaits exactly
// one thing (`params`) and does no streaming.
//
// HONEST LIMIT  1. MARKERS ARE PROXIES. Each assertion proves a section's
//                  characteristic output is present, not that the section is
//                  fully correct — the section's own test file owns that.
//               2. PRESENCE AND ORDER ARE NOT LAYOUT. Every section here could
//                  render into a zero-height box and this file would stay green.
//               3. `usePathname` IS MOCKED. Outside a Next router context the
//                  real hook throws, so the switcher's HREFS are not what this
//                  file proves — its MOUNTING is. LanguageSwitcher.test.tsx owns
//                  the link behaviour.
//               4. ONE LOCALE. The page is rendered in the source locale only.
//                  A per-locale render would assert the same thirteen markers
//                  with different strings, proving nothing this does not.
//               5. `setRequestLocale` IS STUBBED, so this file says NOTHING about
//                  whether the route is opted into static rendering — the reason
//                  is at the mock itself, and the downstream build-and-probe gate
//                  is what can speak to it.
// ─────────────────────────────────────────────────────────────────────────────
import { render, screen } from '@testing-library/react'

import { SECTION_IDS } from '@/config/site'
import { getMessages, SOURCE_LOCALE } from '@/i18n/messages'

import LocaleHomePage from '../page'

// The real hook requires a mounted app router. `importOriginal` keeps `routing`
// (the page validates its locale against it) and `Link` real — only the hook
// that needs a router is replaced. See HONEST LIMIT 3.
vi.mock('@/i18n/routing', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/i18n/routing')>()),
  usePathname: () => '/',
}))

// A HARNESS ARTIFACT, not a page defect, and worth stating exactly. Node resolves
// `next-intl/server` through its normal export condition, which is the package's
// CLIENT build; every server-only API in that build is a stub that throws
// "`setRequestLocale` is not supported in Client Components". Next's own runtime
// resolves the `react-server` condition and gets the real one. Selecting that
// condition for the test run is a change to vitest.config.ts, which is outside
// this delegate's write-set, so the one call is stubbed here instead. See
// HONEST LIMIT 5: this file consequently proves nothing about static rendering.
vi.mock('next-intl/server', () => ({
  setRequestLocale: () => undefined,
}))

const m = getMessages(SOURCE_LOCALE)

/** Find the element carrying an id owned by a section. */
function byId(id: string): Element | null {
  return document.body.querySelector(`#${id}`)
}

/**
 * THE THIRTEEN, in the order `app/[locale]/page.tsx` declares — which is W1's
 * measurement of the customer's own page. Each marker is output only that
 * section produces: an anchor id it owns, a heading string only it renders, or a
 * `data-testid` its own test already relies on.
 */
const SECTIONS: ReadonlyArray<readonly [name: string, find: () => Element | null]> = [
  // Its links are the only ones on the page carrying `hreflang`.
  ['LanguageSwitcher', () => document.body.querySelector('a[hreflang]')],
  ['Hero', () => byId(SECTION_IDS.top)],
  ['Story', () => byId(SECTION_IDS.story)],
  ['Military', () => screen.getAllByText(m.militaryTitle)[0] ?? null],
  ['LecturesPreview', () => screen.getAllByText(m.lecturesTitle)[0] ?? null],
  ['Stats', () => byId('stats-title')],
  ['WhatYouGet', () => byId('what-you-get-content-heading')],
  ['HowItLooks', () => screen.getAllByText(m.howTitle)[0] ?? null],
  ['Testimonials', () => byId('testimonials-title')],
  ['Why', () => byId('why-title')],
  ['Wine', () => screen.getAllByText(m.wineTitle)[0] ?? null],
  ['LeadForm', () => byId(SECTION_IDS.form)],
  ['Footer', () => byId(SECTION_IDS.copyright)],
]

async function renderPage() {
  return render(await LocaleHomePage({ params: Promise.resolve({ locale: SOURCE_LOCALE }) }))
}

test('0. the list under test is thirteen sections — the denominator, pinned', () => {
  // If a fourteenth section is composed into the page and not added here, this
  // number is the first thing a reader compares against components/sections/.
  expect(SECTIONS).toHaveLength(13)
})

test('1. every one of the thirteen sections is rendered', async () => {
  await renderPage()

  const missing = SECTIONS.filter(([, find]) => find() === null).map(([name]) => name)

  expect(missing).toEqual([])
})

test('2. the thirteen render in the customer’s order', async () => {
  await renderPage()

  const found = SECTIONS.map(([name, find]) => ({ name, node: find() }))

  // Compared pairwise so a failure names the exact pair that swapped, rather
  // than dumping a serialised tree. `reduce` rather than an index loop because
  // `noUncheckedIndexedAccess` makes `found[i]` possibly-undefined, and the two
  // ways to silence that (`!`, `as`) are both ESLint errors in this repo.
  found.reduce((prev, next) => {
    expect(prev.node, `${prev.name} is missing`).not.toBeNull()
    expect(next.node, `${next.name} is missing`).not.toBeNull()

    const precedes =
      prev.node !== null &&
      next.node !== null &&
      (prev.node.compareDocumentPosition(next.node) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0

    expect(precedes, `${prev.name} must render before ${next.name}`).toBe(true)

    return next
  })
})

test('3. the page is one <main> landmark, with the switcher and footer outside it', async () => {
  const { container } = await renderPage()

  expect(container.querySelectorAll('main')).toHaveLength(1)

  const main = container.querySelector('main')
  // A throw, not `!` or `as`: both are ESLint errors here, and a silent early
  // return would let the three assertions below never run and still report green.
  if (main === null) throw new Error('the page rendered no <main> landmark')

  // The eleven flow sections live inside it; the fixed control and the page
  // footer are siblings, not children. This is the one markup decision page.tsx
  // makes (its HONEST LIMIT 3), so it is asserted rather than assumed.
  expect(main.querySelectorAll(':scope > section')).toHaveLength(11)
  expect(main.querySelector('a[hreflang]')).toBeNull()
  expect(main.querySelector('footer')).toBeNull()
  expect(container.querySelector('footer')).not.toBeNull()
})

test('4. the four live in-page anchor ids are reachable on the composed page', async () => {
  await renderPage()

  // Ledger D-11: every CTA on the site targets one of these four. The sections
  // own them; this asserts composition did not bury or duplicate one.
  for (const id of Object.values(SECTION_IDS)) {
    expect(document.body.querySelectorAll(`#${id}`), `#${id}`).toHaveLength(1)
  }
})
