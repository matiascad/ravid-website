// ─────────────────────────────────────────────────────────────────────────────
// W10-B EVENT CALL SITES · components/sections/TrackedLink.tsx
//   THE ONE PLACE THAT KNOWS HOW A CLICK BECOMES AN EVENT
//
// ⚠ WHY THIS FILE EXISTS AT ALL — THE FACT THAT FORCED IT.
// Eleven of the thirteen files in `components/sections/` are React SERVER
// components. `Hero`, `Why` and `Wine` — which hold six of this wave's nine call
// sites — have no `'use client'` and must not gain one: a handler cannot be
// attached in a server component, and converting a whole section to a client
// component to reach one anchor would drag its `<Image>`s, its message reader
// and its entire subtree across the boundary for the sake of a click listener.
// So the boundary is drawn at the ANCHOR, not at the section. The section stays
// a server component and renders this four-line client component in place of
// its `<a>`.
//
// INVARIANT     There is exactly ONE wiring shape in this project, and it is
//               here. Nine call sites do not repeat nine copies of
//               `onClick={() => track(...)}`; six of them pass an `event` prop
//               to this component, and the three that cannot (they are inside
//               the already-client `LeadForm` and `LanguageSwitcher`, where the
//               control is a `<form>`, a next-intl `<Link>`, or an anchor whose
//               href is composed per-render) call `emit()` — the same totality
//               guard, also exported from here. Change how a click is reported
//               and you change it in one place.
//
// IMPOSSIBLE    (a) A SECOND `onClick` ON A TRACKED LINK. `onClick` is `Omit`ted
//                   from the accepted anchor props, so a caller cannot attach a
//                   handler that silently replaces the reporting one — the
//                   commonest way analytics wiring dies.
//               (b) AN UNTYPED EVENT. `event` is `AnalyticsEvent`, which only
//                   `@/lib/analytics/events`' constructors can produce, so no
//                   call site here or downstream types an event name.
//               (c) A TRACKER THAT BREAKS A LINK. `emit()` is the only path to
//                   `track()` in this project's call sites and it swallows.
//                   `track()` is already documented total; `emit()` is the
//                   assumption made local and TESTABLE — the wiring tests
//                   replace the module with one that throws and still assert the
//                   navigation, the submit and the status change.
//
// MARKUP        This component renders `<a>` and nothing else. `onClick` has no
//               HTML serialisation, so the markup a visitor receives is byte-for
//               -byte what it was before the prop existed. Props are spread in
//               the order the caller wrote them, so attribute ORDER is preserved
//               too — measured by hash, see the W10-B report.
//
// HONEST LIMIT  1. THIS FILE IS IN THE WRONG DIRECTORY, and that is a write-set
//                  artefact, not a design choice. It is not a page section; it
//                  belongs beside `components/Analytics.tsx` as
//                  `components/analytics/TrackedLink.tsx`. W10-B's write-set was
//                  `components/sections/**`, so moving it was not this
//                  delegate's to do. OWED TO THE SEAT.
//               2. IT CANNOT MAKE A CALL SITE EXIST. It proves that a tracked
//                  anchor reports when clicked; it cannot prove that an anchor
//                  which should be tracked is. Only a test that finds the
//                  control by role and name can, and that is what the wiring
//                  tests do.
//               3. `emit()` swallows SILENTLY. A thrown tracker leaves no trace
//                  anywhere — no console, no counter. That is deliberate (a
//                  failing tracker must never become a failing button) and it
//                  means a permanently broken `track()` would be invisible from
//                  inside the app. W14-B's browser pass owns detecting that.
//               4. IT REPORTS THE CLICK, NOT THE NAVIGATION. The event is sent
//                  when the anchor is activated; whether the browser then
//                  reaches WhatsApp, Instagram or the wine shop is not something
//                  this file — or any test in jsdom — observes.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'

import type { AnalyticsEvent } from '@/lib/analytics/events'
import { track } from '@/lib/analytics/track'

/**
 * Report one event, and NEVER let reporting become the visitor's problem.
 *
 * `track()` is documented total and measured total; this wrapper does not
 * distrust it, it makes the guarantee LOCAL so a call site's behaviour under a
 * throwing tracker is a property this project can TEST rather than a sentence
 * in another file's header. The wiring tests do exactly that.
 */
export function emit(event: AnalyticsEvent): void {
  try {
    track(event)
  } catch {
    // IMPOSSIBLE (c). A tracker that throws must not stop a navigation, a
    // submit or a language switch. See HONEST LIMIT 3 for what this costs.
  }
}

export type TrackedLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'onClick'
> & {
  /** Built by a constructor in `@/lib/analytics/events`. Never a literal. */
  readonly event: AnalyticsEvent
  readonly children: ReactNode
}

/**
 * An `<a>` that reports when it is activated. Everything else about it — href,
 * className, target, rel, aria — is the caller's, passed straight through in the
 * order it was written.
 *
 * Activation, not click: this is a real anchor, so a keyboard Enter fires the
 * same handler through the browser's own synthetic click. Nothing here calls
 * `preventDefault`, so the navigation is untouched.
 */
export function TrackedLink({ event, children, ...anchor }: TrackedLinkProps) {
  return (
    <a
      {...anchor}
      onClick={() => {
        emit(event)
      }}
    >
      {children}
    </a>
  )
}
