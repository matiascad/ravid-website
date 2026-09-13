// ─────────────────────────────────────────────────────────────────────────────
// W3-K REDIRECT-FALSIFIABILITY · i18n/__tests__/routing.test.ts
//   — THE CHECK THAT CAN GO RED
//
// INVARIANT     `/` has exactly ONE target, `/he`, for every caller on earth, and
//               the response carries NO locale state. This file is the only thing
//               in the repo that can DISAGREE with that sentence. It asserts the
//               observable output of middleware.ts — status, `Location` and
//               `Set-Cookie` — for a request built the way the runtime builds one.
//               It never reads `routing.localeDetection`, `routing.localeCookie`,
//               or any other field of the config object. Asserting the config
//               would restate the line it guards and would pass on a config that
//               produced the wrong redirect; asserting the redirect cannot.
//
// IMPOSSIBLE    A SILENT regression of the root redirect can no longer be
//               CONSTRUCTED. Before this file, `localeDetection: false` and
//               `localeCookie: false` were two lines with no compile-time
//               consequence: deleting either left `tsc`, `lint`, `vitest` and
//               `build` all green while `/` started answering `/en` to an English
//               browser and shipping a cookie nothing reads. Both are now load-
//               bearing — each has an assertion that fails for its own distinct,
//               named reason. PROVED, not asserted, by three mutations, each run
//               ONCE and each restored byte-identically (sha256 recorded in the
//               W3-K report):
//                 1. `localeDetection: true` → 2 failed, exit 1. "sends an
//                    English browser to /he, NOT /en":
//                    AssertionError: expected '/en' to be '/he'. The q-value case
//                    fell with it. This is THE regression, caught.
//                 2. `localeCookie: true`     → 2 failed, exit 1. Both Set-Cookie
//                    cases: expected 'NEXT_LOCALE=he; Path=/; SameSite=lax' to be
//                    null. A DIFFERENT flag failing DIFFERENT tests — the two
//                    lines are independently load-bearing, not one guard counted
//                    twice.
//                 3. one expected target flipped to '/en' → 1 failed, exit 1:
//                    expected '/he' to be '/en'. The assertions COMPARE; they are
//                    not vacuously true.
//               Mutation 3 matters as much as 1 and 2: a test that cannot fail
//               when the EXPECTATION is wrong is not measuring anything.
//
// CLASS         DERIVATION over the locale-resolution INPUTS, not a list of the
//               examples below. Locale resolution in next-intl v4.14.4 has
//               exactly four prioritised inputs (`resolveLocaleFromPrefix`):
//               Prio 1 path prefix · Prio 2 NEXT_LOCALE cookie · Prio 3
//               `accept-language` · Prio 4 `defaultLocale`. This file pins all
//               four at once: Prio 1 by the direct `/he` and `/en` cases, Prio 2
//               by the no-Set-Cookie cases AND by a request that SENDS the cookie,
//               Prio 3 by the header cases (the default locale, a served other
//               locale, an unserved one, and a realistic q-value header), Prio 4
//               by the bare `/`. Any future change to locale resolution has to
//               move one of those four, and each of the four is held by an
//               assertion here. NOT closed over the locale SET — see limit 3.
//
// HONEST LIMIT  1. THIS RUNS THE MIDDLEWARE, NOT THE SERVER. `createMiddleware`
//                  is invoked in-process against a hand-built `NextRequest`. It
//                  therefore cannot catch anything Next.js does AROUND middleware:
//                  a broken `config.matcher` (so middleware never runs for `/` at
//                  all), a conflicting `redirects()` in next.config.js, or a
//                  platform-level rule. The matcher in particular is a real gap —
//                  `matcher` is a static export read by the framework at build
//                  time and NOTHING here reads it, so `matcher: '/nothing'` keeps
//                  this file green while `/` stops redirecting entirely. Only a
//                  request to a built server closes that, and that is W3's build
//                  gate, not this file. Consequence, stated plainly: that
//                  `Set-Cookie: NEXT_LOCALE` actually stops appearing ON THE WIRE
//                  is NOT measured here. What IS measured, and is the stronger of
//                  the two, is that the middleware emits no such header at all.
//               2. It pins the TARGET, not the STATUS CODE's permanence. 307 vs
//                  308 is asserted as "a redirect" (3xx + Location), because
//                  next-intl owns that choice and changing it is not the
//                  regression this file exists to catch.
//               3. NOT closed over the locale set. `/he` and `/en` appear as
//                  literals below. Adding 'fr' to LOCALES adds a directly-
//                  addressable `/fr` that no case here covers — and the `fr` case
//                  below would then change meaning from "unserved locale" to
//                  "served locale", silently. A delegate adding a locale MUST
//                  re-read this file; the compiler will not make them.
//               4. `toBeNull()` on Set-Cookie proves next-intl's MIDDLEWARE writes
//                  no cookie. It does not prove no cookie is written anywhere in
//                  the project — a route handler or a server action could still
//                  set NEXT_LOCALE, and nothing here would see it. Today none
//                  exists; that is an observation about the repo, not a property
//                  of this test.
//               5. THE COOKIE-IS-IGNORED CASE IS THE WEAKEST ASSERTION HERE, and
//                  the mutation runs are why I can say so instead of guessing.
//                  `/` with `Cookie: NEXT_LOCALE=en` → `/he` survived mutation 1
//                  (detection on, cookie off) AND mutation 2 (detection off,
//                  cookie on). It went red only under a FOURTH, unmandated probe
//                  with BOTH flags on — next-intl's own defaults — where it
//                  produced `expected '/en' to be '/he'` alongside 4 others
//                  (5 failed, exit 1; i18n/routing.ts restored, sha256
//                  87eceae1d9973ff3b40da56c83c1e89fa7e93bbf08b7c334dce0836aee130b97).
//                  So: cookie READING in v4.14.4 requires `localeCookie !== false`
//                  AND `localeDetection: true` — BOTH, not `localeDetection`
//                  alone. This case therefore cannot catch a single-flag
//                  regression; it catches only the wholesale revert to defaults.
//                  It is kept because that revert is the likely one (see the ⚠️
//                  block in i18n/routing.ts: the two flags move together), but it
//                  must not be counted as independent evidence for Prio 2.
//                  ⚠️ OWED ELSEWHERE: i18n/routing.ts's header states next-intl
//                  "gates cookie WRITING on `localeCookie` and cookie READING on
//                  `localeDetection`". The reading half is incomplete by the
//                  measurement above. That file was not in this delegate's
//                  write-set; the correction is reported as owed, not made here,
//                  and NOT duplicated into a second copy of the fact.
//               6. This file depends on a test-harness fact that lives elsewhere:
//                  `next-intl` must be INLINED by Vite (vitest.config.ts,
//                  `test.server.deps.inline`), because it ships ESM that imports
//                  `next/server` extensionlessly and `next` publishes no exports
//                  map. Nothing here states that dependency at runtime; if that
//                  line is removed this file fails at COLLECTION, loudly — which
//                  is a tolerable failure mode, but it is a second file that must
//                  agree with this one.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'

import middleware from '@/middleware'

const ORIGIN = 'https://ravid.example'

/**
 * Builds a request the same shape the Next.js runtime hands to middleware.
 * An omitted `acceptLanguage` means the header is ABSENT, which is a distinct
 * case from any value and is one of the cases below.
 */
function requestFor(
  pathname: string,
  options: { acceptLanguage?: string; cookie?: string } = {},
): NextRequest {
  const headers = new Headers()
  if (typeof options.acceptLanguage === 'string') {
    headers.set('accept-language', options.acceptLanguage)
  }
  if (typeof options.cookie === 'string') {
    headers.set('cookie', options.cookie)
  }
  return new NextRequest(new URL(pathname, ORIGIN), { headers })
}

interface Outcome {
  status: number
  location: string | null
  setCookie: string | null
}

/**
 * The observable outcome, reduced to the three things a caller can see.
 * `location` is normalised to a pathname so the assertions hold whether
 * next-intl emits a relative `/he` or an absolute `https://…/he` — that is a
 * next-intl implementation detail and is not what this file is pinning.
 */
async function outcomeFor(
  pathname: string,
  options: { acceptLanguage?: string; cookie?: string } = {},
): Promise<Outcome> {
  const response = await middleware(requestFor(pathname, options))
  const rawLocation = response.headers.get('location')
  return {
    status: response.status,
    location: rawLocation === null ? null : new URL(rawLocation, ORIGIN).pathname,
    setCookie: response.headers.get('set-cookie'),
  }
}

describe('the `/` redirect is deterministic', () => {
  // Prio 4 — the fall-through that `localeDetection: false` forces every caller
  // into. If this fails, `/` has stopped having a single answer.
  it('sends a request with NO accept-language to /he', async () => {
    const outcome = await outcomeFor('/')
    expect(outcome.status).toBeGreaterThanOrEqual(300)
    expect(outcome.status).toBeLessThan(400)
    expect(outcome.location).toBe('/he')
  })

  // ⚠️ THE REGRESSION THIS FILE EXISTS TO CATCH. With next-intl's default
  // `localeDetection: true` this case resolves at Prio 3 and receives '/en'.
  // Measured on the built server before the fix: GET / with accept-language: en
  // returned 307 → /en. Do not weaken this expectation; change the config back
  // instead, and then argue with i18n/routing.ts's header.
  it('sends an English browser to /he, NOT /en', async () => {
    const outcome = await outcomeFor('/', { acceptLanguage: 'en' })
    expect(outcome.location).toBe('/he')
  })

  it('sends a Hebrew browser to /he', async () => {
    const outcome = await outcomeFor('/', { acceptLanguage: 'he' })
    expect(outcome.location).toBe('/he')
  })

  // An UNSERVED locale. This passed even before the fix — header matching is
  // constrained to `routing.locales` — so it is a CONTROL, not evidence: it is
  // here to show that the `en` case above fails for the RIGHT reason (detection),
  // and not because all redirects happen to go to /he.
  it('sends a browser preferring an unserved locale (fr) to /he', async () => {
    const outcome = await outcomeFor('/', { acceptLanguage: 'fr' })
    expect(outcome.location).toBe('/he')
  })

  // A realistic header, not a bare tag: this is what a browser actually sends,
  // and q-value parsing is a separate code path from an exact-match tag.
  it('ignores quality values in a real accept-language header', async () => {
    const outcome = await outcomeFor('/', { acceptLanguage: 'en-US,en;q=0.9,fr;q=0.8' })
    expect(outcome.location).toBe('/he')
  })

  // Prio 2. A returning visitor who once chose English. The cookie is no longer
  // written (see below) but a stale one from an earlier deploy still arrives.
  it('ignores a NEXT_LOCALE cookie that asks for English', async () => {
    const outcome = await outcomeFor('/', { cookie: 'NEXT_LOCALE=en' })
    expect(outcome.location).toBe('/he')
  })
})

describe('direct locale access still works', () => {
  // Prio 1. `localeDetection: false` disables Prio 2 and 3 ONLY. If this fails,
  // the fix went too far.
  it('serves /he without redirecting', async () => {
    const outcome = await outcomeFor('/he')
    expect(outcome.location).toBeNull()
    expect(outcome.status).toBe(200)
  })

  // The load-bearing half: an English URL must win over the Hebrew default even
  // though the browser asking for it prefers Hebrew. If this ever redirects to
  // /he, English is unreachable by URL and the switcher is the ONLY path to it —
  // see i18n/routing.ts HONEST LIMIT 6.
  it('serves /en without redirecting it to /he', async () => {
    const outcome = await outcomeFor('/en', { acceptLanguage: 'he' })
    expect(outcome.location).toBeNull()
    expect(outcome.status).toBe(200)
  })
})

describe('no locale state is written', () => {
  // GUARDS `localeCookie: false`. Before it, this response carried
  // `NEXT_LOCALE=he; Path=/; SameSite=lax` — a write with no reader, which reads
  // to a future maintainer as "the choice is remembered". It is not.
  it('sets no NEXT_LOCALE cookie on the / redirect', async () => {
    const outcome = await outcomeFor('/')
    expect(outcome.setCookie).toBeNull()
  })

  it('sets no NEXT_LOCALE cookie when serving a locale directly', async () => {
    const outcome = await outcomeFor('/en')
    expect(outcome.setCookie).toBeNull()
  })
})
