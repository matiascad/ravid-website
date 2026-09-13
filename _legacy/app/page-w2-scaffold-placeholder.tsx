// ─────────────────────────────────────────────────────────────────────────────
// W2-A2a SHELL+TOKENS · app/page.tsx
// Placeholder. W3 replaces this with the `/` → default-locale redirect; the real
// page is `app/[locale]/page.tsx`.
//
// INVARIANT     This file is a SERVER component. It carries no 'use client', no
//               hook, no event handler and no browser API, so the root route's
//               React tree is server-rendered by default. Server-by-default is
//               the rebuild's premise, and the root of the tree is where it is
//               either established or lost.
// IMPOSSIBLE    A whole-tree client boundary cannot be CONSTRUCTED at the root
//               route from this file. In the App Router 'use client' is
//               inherited downward, so the single directive W1 found at the top
//               of the old page pulled every descendant - all 594 lines of the
//               monolith - into the client bundle. With no directive here, a
//               future component that needs interactivity must declare its own
//               boundary at its own leaf, and that declaration is a visible,
//               greppable line in the file that needs it.
// CLASS         This instance only, for now. It closes the defect for `/`; the
//               same discipline must be re-established by W3 on
//               app/[locale]/page.tsx and by W4 on each of the 13 sections. The
//               class is not closed by derivation until a check exists that
//               fails on a 'use client' at a route root (nothing enforces it
//               today - see HONEST LIMIT).
// HONEST LIMIT  This renders NOTHING a visitor should see. It is a build-gate
//               placeholder with no copy, no sections, no locale awareness and
//               no redirect. `/` does not yet reach the Hebrew site. Nothing in
//               the toolchain prevents a later delegate from adding 'use client'
//               to this file or to its replacement; only review catches that.
// ─────────────────────────────────────────────────────────────────────────────

export default function RootPlaceholderPage() {
  return (
    <main>
      <p className="text-gold">ravid_website — W2 scaffold placeholder</p>
    </main>
  )
}
