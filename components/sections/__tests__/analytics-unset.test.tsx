// ─────────────────────────────────────────────────────────────────────────────
// W10-B · THE NIGHT-WIDE GATE, AT THE CALL SITES
//   components/sections/__tests__/analytics-unset.test.tsx
//
// `lib/analytics/__tests__/unset-gate.test.tsx` proves that `track()` does
// nothing with the measurement id unset. That is a proof about a FUNCTION. This
// file asks the question the visitor actually poses: with the id unset — today's
// real state — does PRESSING THE BUTTONS do anything?
//
// It uses the REAL `track`, not a recorder. Nothing is mocked but the navigation
// factory, which has no analytics in it. A `gtag` spy is installed on `window`
// BEFORE the clicks, so "nothing was reported" is a counted call list, not the
// absence of a mock. Law 8: the assertion is the effect, never the name.
//
// HONEST LIMIT  1. It proves the UNSET state. What the call sites do when a real
//                  GA4 property is configured is not provable in this repository
//                  at all — there is no property. W14-B's browser pass owns it.
//               2. `window.gtag` is a stand-in for Google's own. It is the same
//                  stand-in `track.test.ts` uses, and for the same reason: the
//                  asserted thing (a call, or none) is one this code performs.
//               3. It does not prove the served HTML is unchanged. That is the
//                  markup-hash measurement in the W10-B report, taken across all
//                  five wired sections before and after wiring.
// ─────────────────────────────────────────────────────────────────────────────

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'

import { Hero } from '@/components/sections/Hero'
import { LanguageSwitcher } from '@/components/sections/LanguageSwitcher'
import { LeadForm } from '@/components/sections/LeadForm'
import { Why } from '@/components/sections/Why'
import { Wine } from '@/components/sections/Wine'
import { INSTAGRAM_HANDLE, type Locale } from '@/config/site'
import { getMessages, SOURCE_LOCALE } from '@/i18n/messages'
import { MEASUREMENT_ID_ENV_VAR } from '@/lib/analytics'

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

vi.mock('@/i18n/routing', () => ({
  usePathname: () => '/lectures',
  Link: ({ href, locale: _locale, children, ...rest }: MockLinkProps) => (
    <a
      href={href}
      {...rest}
      onClick={(clickEvent) => {
        clickEvent.preventDefault()
        rest.onClick?.()
      }}
    >
      {children}
    </a>
  ),
}))

const he = getMessages('he')

function textOf(message: string): RegExp {
  return new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
}

/** The shape `track()` calls. Declared here so the spy needs no cast. */
type GtagSpy = (
  command: 'event',
  name: string,
  params?: Readonly<Record<string, string | number>>,
) => void

let savedEnv: string | undefined
let gtag = vi.fn<GtagSpy>()

beforeEach(() => {
  savedEnv = process.env[MEASUREMENT_ID_ENV_VAR]
  delete process.env[MEASUREMENT_ID_ENV_VAR]
  gtag = vi.fn<GtagSpy>()
  window.gtag = gtag
})

afterEach(() => {
  delete window.gtag
  vi.unstubAllGlobals()
  if (savedEnv === undefined) {
    delete process.env[MEASUREMENT_ID_ENV_VAR]
  } else {
    process.env[MEASUREMENT_ID_ENV_VAR] = savedEnv
  }
})

describe('measurement id UNSET — every call site is a silent no-op', () => {
  it('the three CTAs report nothing and throw nothing', async () => {
    const user = userEvent.setup()
    render(<Hero m={he} locale={SOURCE_LOCALE} />)
    render(<Why m={he} locale={SOURCE_LOCALE} />)

    await user.click(screen.getByRole('link', { name: textOf(he.heroCta) }))
    await user.click(screen.getByRole('link', { name: textOf(he.heroStory) }))
    await user.click(screen.getByRole('link', { name: textOf(he.whyCta) }))

    expect(gtag.mock.calls).toEqual([])
  })

  it('all five wine links report nothing', async () => {
    const user = userEvent.setup()
    render(<Wine m={he} />)

    for (const label of he.wine) {
      await user.click(screen.getByRole('link', { name: textOf(label) }))
    }
    await user.click(screen.getByRole('link', { name: textOf(he.wineCta) }))

    expect(gtag.mock.calls).toEqual([])
  })

  it('the language switch reports nothing', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher locale="he" />)
    const name = new Intl.DisplayNames(['en'], { type: 'language' }).of('en') ?? 'en'

    await user.click(screen.getByRole('link', { name: textOf(name) }))

    expect(gtag.mock.calls).toEqual([])
  })

  it('the whole form funnel — attempt, success, and the contact links — reports nothing', async () => {
    const user = userEvent.setup()
    // A 2xx carrying a stored lead's id — the only shape `LeadForm` accepts as
    // a success, because `app/api/lead`'s honeypot guard answers a discarded
    // submission with an id-less 2xx and stores nothing. A bare `{}` here would
    // exercise the FAILURE path while the test's name says success.
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ ok: true, id: '01J0000000ABCDEFGHJKMNPQRS' }), {
            status: 200,
          }),
      ),
    )
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await user.click(screen.getByRole('link', { name: textOf(INSTAGRAM_HANDLE) }))
    await user.type(screen.getByLabelText(textOf(he.formName)), 'Tester')
    await user.type(screen.getByLabelText(textOf(he.formPhone)), '0500000000')
    await user.click(screen.getByRole('button', { name: textOf(he.formSubmit) }))

    // The behaviour the visitor sees is UNCHANGED by the wiring...
    expect(screen.getByTestId('form-success')).toBeTruthy()
    // ...and nothing at all was reported.
    expect(gtag.mock.calls).toEqual([])
  })

  it('a failing submit reports nothing either, and still offers the fallback', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })))
    render(<LeadForm m={he} locale={SOURCE_LOCALE} />)

    await user.type(screen.getByLabelText(textOf(he.formName)), 'Tester')
    await user.type(screen.getByLabelText(textOf(he.formPhone)), '0500000000')
    await user.click(screen.getByRole('button', { name: textOf(he.formSubmit) }))

    expect(screen.getByTestId('form-fallback')).toBeTruthy()
    expect(gtag.mock.calls).toEqual([])
  })
})
