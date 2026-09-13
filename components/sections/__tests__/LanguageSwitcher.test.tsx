// ─────────────────────────────────────────────────────────────────────────────
// W4-13 LANGUAGE SWITCHER · components/sections/__tests__/LanguageSwitcher.test.tsx
//
// INVARIANT     Every assertion in this file is derived from `LOCALES`. There is
//               no literal `2`, no literal `'he'`/`'en'` control count, and no
//               hardcoded language name: the suite iterates the same list the
//               component iterates, so adding a third locale to config/site.ts
//               changes what these tests demand without a line being edited here.
//
// IMPOSSIBLE    The customer's defect cannot pass this file. A switcher that
//               changes a variable instead of the URL records no navigation
//               target and fails test 3; a switcher that sends every visitor to
//               the site root records the wrong target and fails test 3; a
//               switcher that loses the current locale's marking fails test 2.
//               Test 3 was PROVED able to fail — see the delegate report's RED
//               proof, which forced `href` to the site root and watched exactly
//               that assertion go red before restoring the file byte-for-byte.
//
// CLASS         This closes the CONTRACT BETWEEN the switcher and the navigation
//               factory: which controls exist, what each one is called, which is
//               current, and what destination each hands over. It is NOT a test
//               of next-intl's URL construction — that is next-intl's own
//               contract and is asserted at the redirect level by
//               i18n/__tests__/routing.test.ts.
//
// HONEST LIMIT  Four. (1) `@/i18n/routing` is MOCKED, so this proves what the
//               component GIVES the navigation factory, never what the factory
//               then renders as an href; a next-intl upgrade that broke prefixing
//               would leave this suite green. (2) jsdom has no layout and no
//               viewport, so nothing here can prove the control is above the fold,
//               visible on a phone, or not hidden behind a menu — the D-24
//               responsibility in the component's HONEST LIMIT 1 is enforced by
//               review alone. (3) The expected label is computed with the same
//               platform API the component uses, so this catches a label built
//               from the WRONG locale, an empty label, or a bare code — it cannot
//               catch the component abandoning `Intl.DisplayNames` for a
//               hand-typed string that happens to match CLDR. (4) It asserts
//               `aria-current` and focusability; it does not run an accessibility
//               engine, so it cannot see a contrast or focus-visibility failure.
// ─────────────────────────────────────────────────────────────────────────────

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'

import { LanguageSwitcher } from '@/components/sections/LanguageSwitcher'
import { LOCALES, type Locale } from '@/config/site'

/**
 * Hoisted with the `vi.mock` factory that reads it — a plain module-scope `const`
 * is still in its temporal dead zone when the factory first runs.
 *
 * The only requirement on CURRENT_PATH is that it is NOT the site root: that is
 * what lets test 3 distinguish "same page, other language" from the regression
 * where switching language throws the visitor back to the homepage.
 */
const nav = vi.hoisted(() => {
  const CURRENT_PATH = '/lectures'
  const SITE_ROOT = '/'
  const targets: Array<{ href: string; locale: string }> = []
  const activations: Array<{ href: string; locale: string }> = []
  return { CURRENT_PATH, SITE_ROOT, targets, activations }
})

type MockLinkProps = {
  href: string
  locale: Locale
  children: ReactNode
  lang?: string
  hrefLang?: string
  className?: string
  'aria-current'?: 'true'
}

/**
 * Stands in for the project's ONE navigation factory and records exactly what it
 * is handed. Asserting the recorded arguments — rather than a rendered href — is
 * what makes a hand-built URL or a dropped path visible: both would arrive here
 * as a different `href`.
 */
vi.mock('@/i18n/routing', () => ({
  usePathname: () => nav.CURRENT_PATH,
  Link: ({ href, locale, children, ...rest }: MockLinkProps) => {
    nav.targets.push({ href, locale })
    return (
      <a
        href={href}
        {...rest}
        onClick={(event) => {
          event.preventDefault()
          nav.activations.push({ href, locale })
        }}
      >
        {children}
      </a>
    )
  },
}))

/** The oracle for test 2/4: the same platform data, asked the same question. */
function endonymOf(locale: Locale): string {
  return new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale
}

beforeEach(() => {
  nav.targets.length = 0
  nav.activations.length = 0
})

describe('LanguageSwitcher', () => {
  it('renders one control per entry in LOCALES — the count follows the data', () => {
    render(<LanguageSwitcher locale="he" />)

    expect(screen.getAllByRole('link')).toHaveLength(LOCALES.length)
  })

  it('marks the current locale, and only the current locale, for every locale', () => {
    for (const current of LOCALES) {
      const { unmount } = render(<LanguageSwitcher locale={current} />)

      for (const target of LOCALES) {
        const link = screen.getByRole('link', { name: endonymOf(target) })

        if (target === current) {
          expect(link).toHaveAttribute('aria-current', 'true')
        } else {
          expect(link).not.toHaveAttribute('aria-current')
        }
      }

      unmount()
    }
  })

  it('sends every control to the CURRENT path under its own locale, never to the site root', () => {
    render(<LanguageSwitcher locale="he" />)

    // One target per locale, each carrying the path the visitor is already on.
    for (const target of LOCALES) {
      expect(nav.targets).toContainEqual({ href: nav.CURRENT_PATH, locale: target })
    }

    // …and nothing else was ever handed over — in particular, not the homepage.
    for (const handed of nav.targets) {
      expect(handed.href).toBe(nav.CURRENT_PATH)
      expect(handed.href).not.toBe(nav.SITE_ROOT)
    }
  })

  it('gives every control an accessible name: that language, in that language', () => {
    render(<LanguageSwitcher locale="he" />)

    const names = LOCALES.map((target) => {
      const link = screen.getByRole('link', { name: endonymOf(target) })
      expect(link).toHaveAttribute('lang', target)
      expect(link).toHaveAttribute('hreflang', target)
      return link.textContent ?? ''
    })

    for (const name of names) {
      expect(name.length).toBeGreaterThan(0)
    }
    expect(new Set(names).size).toBe(LOCALES.length)
  })

  it('is reachable and operable by keyboard alone', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher locale="he" />)

    const links = screen.getAllByRole('link')

    // Every control is in the tab order, in the order LOCALES declares.
    for (const link of links) {
      await user.tab()
      expect(link).toHaveFocus()
    }

    // Focus now rests on the last control; Enter must activate it.
    await user.keyboard('{Enter}')

    // `slice(-1)` rather than `LOCALES[LOCALES.length - 1]`: under
    // noUncheckedIndexedAccess the index would be `Locale | undefined`, and the
    // only ways to spend that are `!` or a cast. Both are banned; neither is
    // needed.
    const lastLocale = LOCALES.slice(-1)
    expect(nav.activations).toEqual(
      lastLocale.map((locale) => ({ href: nav.CURRENT_PATH, locale })),
    )
  })
})
