// ─────────────────────────────────────────────────────────────────────────────
// W10-B · THE CALL SITES — components/sections/__tests__/analytics-wiring.test.tsx
//
// LAW 8 IS THIS FILE'S WHOLE METHOD. Not one assertion here names a handler, an
// import or a prop. Every one of them RENDERS the real section, finds the real
// control BY ITS ACCESSIBLE ROLE AND NAME — the same way a visitor with a screen
// reader finds it — clicks it with `userEvent`, and asserts the VALUE that
// arrived at the analytics boundary. `onClick` is never inspected; a handler is
// never imported and called. The wave that earned this law shipped tsc, ESLint,
// 261 tests and five gates green over an invisible button.
//
// WHERE THE BOUNDARY IS. `@/lib/analytics/track` is replaced by a recorder, so
// what is asserted is the event VALUE each control produces — the one thing a
// call site is responsible for. That track() then does the right thing with it
// is `lib/analytics/__tests__/track.test.ts`'s question and is already proved
// there; re-proving it here would couple these tests to gtag for nothing.
//
// WHAT THIS FILE DELIBERATELY CANNOT DO
//   1. It cannot prove the browser NAVIGATES. jsdom does not follow an anchor,
//      so "the wine link reports `wine_click` AND still goes to the shop" is
//      half-proved here: the report is measured, the navigation is asserted only
//      as "the href is unchanged and nothing called preventDefault". W14-B's
//      browser pass owns the other half.
//   2. It cannot prove `scroll_depth` — there IS no call site. See the W10-B
//      report: a page-scroll reporter cannot be mounted from inside a section
//      without a section falsely owning a page-level concern, and the file that
//      could mount it is outside this delegate's write-set. NOT-MEASURED, owner
//      named in the report. No test here pretends otherwise.
// ─────────────────────────────────────────────────────────────────────────────

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'

import { Hero } from '@/components/sections/Hero'
import { LanguageSwitcher } from '@/components/sections/LanguageSwitcher'
import { LeadForm } from '@/components/sections/LeadForm'
import { Why } from '@/components/sections/Why'
import { Wine } from '@/components/sections/Wine'
import { INSTAGRAM_HANDLE, LOCALES, PHONE_DISPLAY, type Locale } from '@/config/site'
import { getMessages, SOURCE_LOCALE } from '@/i18n/messages'
import type { AnalyticsEvent } from '@/lib/analytics/events'

/* ── The analytics boundary, replaced by a recorder ───────────────────────── */

/**
 * Hoisted because the `vi.mock` factory below runs before module scope.
 *
 * `mode` is what lets ONE mock serve both questions this file asks: what event
 * does the control produce, and does the control survive a tracker that throws.
 */
const analytics = vi.hoisted(() => {
  const events: AnalyticsEvent[] = []
  const mode = { throws: false }
  return { events, mode }
})

vi.mock('@/lib/analytics/track', () => ({
  track: (event: AnalyticsEvent) => {
    analytics.events.push(event)
    if (analytics.mode.throws) {
      throw new Error('tracker down')
    }
  },
}))

/* ── The navigation factory, replaced by one that FORWARDS onClick ────────── */

type MockLinkProps = {
  href: string
  locale: Locale
  children: ReactNode
  lang?: string
  hrefLang?: string
  className?: string
  onClick?: () => void
  'aria-current'?: 'true'
}

/**
 * Records what it is handed AND forwards every remaining prop to a real anchor —
 * including `onClick`. The sibling `LanguageSwitcher.test.tsx` mock deliberately
 * overrides `onClick` to capture activations; this one must not, or the very
 * handler under test would be the thing the mock swallowed.
 */
const nav = vi.hoisted(() => ({ activations: [] as string[] }))

vi.mock('@/i18n/routing', () => ({
  usePathname: () => '/lectures',
  Link: ({ href, locale, children, ...rest }: MockLinkProps) => (
    <a
      href={href}
      {...rest}
      onClick={(clickEvent) => {
        clickEvent.preventDefault()
        rest.onClick?.()
        nav.activations.push(locale)
      }}
    >
      {children}
    </a>
  ),
}))

const he = getMessages('he')

/** A message string as a substring matcher. Messages are DATA, never retyped. */
function textOf(message: string): RegExp {
  return new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
}

beforeEach(() => {
  analytics.events.length = 0
  analytics.mode.throws = false
  nav.activations.length = 0
})

/* ── cta_click — three CTAs, three identities ─────────────────────────────── */

describe('cta_click fires from the rendered control, carrying WHICH control', () => {
  it('the hero booking CTA reports hero_book', async () => {
    const user = userEvent.setup()
    render(<Hero m={he} locale={SOURCE_LOCALE} />)

    await user.click(screen.getByRole('link', { name: textOf(he.heroCta) }))

    expect(analytics.events).toEqual([{ name: 'cta_click', cta: 'hero_book' }])
  })

  it('the hero story CTA reports hero_story — a DIFFERENT identity', async () => {
    const user = userEvent.setup()
    render(<Hero m={he} locale={SOURCE_LOCALE} />)

    await user.click(screen.getByRole('link', { name: textOf(he.heroStory) }))

    expect(analytics.events).toEqual([{ name: 'cta_click', cta: 'hero_story' }])
  })

  it('the Why CTA reports why_book', async () => {
    const user = userEvent.setup()
    render(<Why m={he} locale={SOURCE_LOCALE} />)

    await user.click(screen.getByRole('link', { name: textOf(he.whyCta) }))

    expect(analytics.events).toEqual([{ name: 'cta_click', cta: 'why_book' }])
  })

  it('the three CTAs are DISTINGUISHABLE — the whole point of D-73', async () => {
    const user = userEvent.setup()
    render(<Hero m={he} locale={SOURCE_LOCALE} />)
    render(<Why m={he} locale={SOURCE_LOCALE} />)

    await user.click(screen.getByRole('link', { name: textOf(he.heroCta) }))
    await user.click(screen.getByRole('link', { name: textOf(he.heroStory) }))
    await user.click(screen.getByRole('link', { name: textOf(he.whyCta) }))

    expect(analytics.events).toEqual([
      { name: 'cta_click', cta: 'hero_book' },
      { name: 'cta_click', cta: 'hero_story' },
      { name: 'cta_click', cta: 'why_book' },
    ])
  })
})

/* ── wine_click — the variant comes from the link that was pressed ────────── */

describe('wine_click reports the wine whose link was actually pressed', () => {
  it('each of the four bottles reports its own variant, in display order', async () => {
    const user = userEvent.setup()
    render(<Wine m={he} />)

    for (const label of he.wine) {
      await user.click(screen.getByRole('link', { name: textOf(label) }))
    }

    expect(analytics.events).toEqual([
      { name: 'wine_click', variant: 'red' },
      { name: 'wine_click', variant: 'rose' },
      { name: 'wine_click', variant: 'white' },
      { name: 'wine_click', variant: 'trio' },
    ])
  })

  it('the closing wine CTA reports the trio it links to', async () => {
    const user = userEvent.setup()
    render(<Wine m={he} />)

    await user.click(screen.getByRole('link', { name: textOf(he.wineCta) }))

    expect(analytics.events).toEqual([{ name: 'wine_click', variant: 'trio' }])
  })

  it('the reported variant and the href agree — same control, one press', async () => {
    const user = userEvent.setup()
    render(<Wine m={he} />)
    const link = screen.getByRole('link', { name: textOf(he.wine[0] ?? '') })
    const href = link.getAttribute('href')

    await user.click(link)

    expect(analytics.events).toEqual([{ name: 'wine_click', variant: 'red' }])
    // The click reported; the destination is untouched by the reporting.
    expect(link.getAttribute('href')).toBe(href)
  })
})

/* ── lang_switch — the locale being switched TO ───────────────────────────── */

describe('lang_switch reports the target locale', () => {
  it('each locale link reports ITS OWN locale, not the current one', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher locale="he" />)

    for (const target of LOCALES) {
      const name = new Intl.DisplayNames([target], { type: 'language' }).of(target) ?? target
      await user.click(screen.getByRole('link', { name: textOf(name) }))
    }

    expect(analytics.events).toEqual(LOCALES.map((to) => ({ name: 'lang_switch', to })))
  })
})

/* ── The form funnel ──────────────────────────────────────────────────────── */

/**
 * A 2xx THAT REPRESENTS A REALLY STORED LEAD — the only response shape that is
 * honestly a success.
 *
 * `app/api/lead`'s honeypot guard answers a trapped submission with a
 * success-shaped, success-STATUSED 201 that carries NO `id`, having written
 * nothing; it refuses to mint a decoy precisely so that an id in a 2xx means a
 * record exists, and `LeadForm` reads the BODY rather than the status line. A
 * bare `{}` at 200 is therefore a FAILURE here, not a success, and a test that
 * mocked one and then asserted the success panel was asserting the defect.
 *
 * Not hoisted into a shared module: the contract this shape belongs to lives in
 * `app/api/lead` and in `LeadForm`'s `storedLeadId`, and a third file claiming
 * to own it would be a fourth place for one fact. A fresh `Response` per call
 * because a body may be read only once.
 */
function storedLeadResponse(): Response {
  return new Response(JSON.stringify({ ok: true, id: '01J0000000ABCDEFGHJKMNPQRS' }), {
    status: 200,
  })
}

async function submitWith(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(screen.getByLabelText(textOf(he.formName)), 'Tester')
  await user.type(screen.getByLabelText(textOf(he.formPhone)), '0500000000')
  await user.click(screen.getByRole('button', { name: textOf(he.formSubmit) }))
}

describe('the booking funnel: attempt → success | fail, always closed', () => {
  it('a successful submit reports attempt then success, in that order', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn(async () => storedLeadResponse()))
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await submitWith(user)

    expect(analytics.events).toEqual([
      { name: 'form_submit_attempt' },
      { name: 'form_success' },
    ])
    vi.unstubAllGlobals()
  })

  it('an id-less 2xx reports attempt then ok_without_id — the trap, not a success', async () => {
    const user = userEvent.setup()
    // Exactly what `app/api/lead`'s honeypot guard answers: success-shaped,
    // success-statused, and NO stored record behind it.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 201 })),
    )
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await submitWith(user)

    expect(analytics.events).toEqual([
      { name: 'form_submit_attempt' },
      { name: 'form_fail', reason: 'ok_without_id' },
    ])
    // And what the visitor sees agrees with what was reported: the fallback,
    // not the success panel. A discarded enquiry is never told it was sent.
    expect(screen.getByTestId('form-fallback')).toBeTruthy()
    expect(screen.queryByTestId('form-success')).toBeNull()
    vi.unstubAllGlobals()
  })

  it('a blank required field reports attempt then client_invalid, and makes NO request', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await user.click(screen.getByRole('button', { name: textOf(he.formSubmit) }))

    expect(analytics.events).toEqual([
      { name: 'form_submit_attempt' },
      { name: 'form_fail', reason: 'client_invalid' },
    ])
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it.each([
    [413, 'http_413'],
    [422, 'http_422'],
    [429, 'http_429'],
    [500, 'http_500'],
    [503, 'http_503'],
    [502, 'http_other'],
  ])('HTTP %i reports %s — the reason the component can actually read', async (status, reason) => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status })))
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await submitWith(user)

    expect(analytics.events).toEqual([
      { name: 'form_submit_attempt' },
      { name: 'form_fail', reason },
    ])
    vi.unstubAllGlobals()
  })

  it('a rejected fetch reports network — one name for one branch', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await submitWith(user)

    expect(analytics.events).toEqual([
      { name: 'form_submit_attempt' },
      { name: 'form_fail', reason: 'network' },
    ])
    vi.unstubAllGlobals()
  })

  it('an aborted fetch is NOT given a reason of its own — the component cannot tell', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new DOMException('The operation was aborted.', 'AbortError')
      }),
    )
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await submitWith(user)

    expect(analytics.events).toEqual([
      { name: 'form_submit_attempt' },
      { name: 'form_fail', reason: 'network' },
    ])
    vi.unstubAllGlobals()
  })

  it('a double submit reports exactly ONE attempt — the guard has an analytics twin', async () => {
    const user = userEvent.setup()
    let release: (value: Response) => void = () => undefined
    const pending = new Promise<Response>((resolve) => {
      release = resolve
    })
    vi.stubGlobal('fetch', vi.fn(() => pending))
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await user.type(screen.getByLabelText(textOf(he.formName)), 'Tester')
    await user.type(screen.getByLabelText(textOf(he.formPhone)), '0500000000')
    const submit = screen.getByRole('button', { name: textOf(he.formSubmit) })
    await user.click(submit)
    await user.click(submit)

    expect(analytics.events).toEqual([{ name: 'form_submit_attempt' }])
    release(new Response('{}', { status: 200 }))
    vi.unstubAllGlobals()
  })
})

/* ── whatsapp_click / instagram_click ─────────────────────────────────────── */

describe('the direct-contact links report, from the rendered anchor', () => {
  it('the standing WhatsApp link reports whatsapp_click', async () => {
    const user = userEvent.setup()
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await user.click(screen.getByRole('link', { name: textOf(PHONE_DISPLAY) }))

    expect(analytics.events).toEqual([{ name: 'whatsapp_click' }])
  })

  it('the Instagram link reports instagram_click, found by its accessible name', async () => {
    const user = userEvent.setup()
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await user.click(screen.getByRole('link', { name: textOf(INSTAGRAM_HANDLE) }))

    expect(analytics.events).toEqual([{ name: 'instagram_click' }])
  })

  it('the failure-fallback WhatsApp link reports too — the reachable-from-every-failure path', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })))
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await submitWith(user)
    analytics.events.length = 0

    await user.click(screen.getByRole('link', { name: textOf(PHONE_DISPLAY) }))

    expect(analytics.events).toEqual([{ name: 'whatsapp_click' }])
    vi.unstubAllGlobals()
  })
})

/* ── A THROWING TRACKER MUST NOT BREAK THE SITE ───────────────────────────── */

describe('a tracker that throws cannot break a link, a submit or a switch', () => {
  it('the submit still reaches sent, and the fields still clear', async () => {
    analytics.mode.throws = true
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn(async () => storedLeadResponse()))
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await submitWith(user)

    // The success UX rendered — from the stored id in the body, with a throwing
    // tracker on every one of the three emit() calls the happy path makes.
    expect(screen.getByTestId('form-success')).toBeTruthy()
    vi.unstubAllGlobals()
  })

  it('the failure UX still renders when the tracker throws on the fail path', async () => {
    analytics.mode.throws = true
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 500 })))
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await submitWith(user)

    expect(screen.getByTestId('form-fallback')).toBeTruthy()
    vi.unstubAllGlobals()
  })

  it('a CTA still keeps its href when the tracker throws', async () => {
    analytics.mode.throws = true
    const user = userEvent.setup()
    render(<Hero m={he} locale={SOURCE_LOCALE} />)
    const cta = screen.getByRole('link', { name: textOf(he.heroCta) })
    const href = cta.getAttribute('href')

    await user.click(cta)

    expect(cta.getAttribute('href')).toBe(href)
  })

  it('the language switch still activates when the tracker throws', async () => {
    analytics.mode.throws = true
    const user = userEvent.setup()
    render(<LanguageSwitcher locale="he" />)
    const name = new Intl.DisplayNames(['en'], { type: 'language' }).of('en') ?? 'en'

    await user.click(screen.getByRole('link', { name: textOf(name) }))

    // The navigation the mock records happened AFTER the throwing emit().
    expect(nav.activations).toEqual(['en'])
  })
})
