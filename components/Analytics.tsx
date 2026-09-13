// ─────────────────────────────────────────────────────────────────────────────
// W5-C ANALYTICS · components/Analytics.tsx — THE ONLY THIRD-PARTY SCRIPT
//
// INVARIANT     This component emits GA4 and nothing else, and it emits it ONLY
//               when `measurementId()` returns a validated id. Unconfigured, it
//               returns `null` before touching `next/script` at all: no element,
//               no attribute, no request, no console output. Configured, the
//               same single id produced by that one call fills both the tag URL
//               and the init snippet — the loader and the bootstrap cannot name
//               different properties, because there is only one value.
//
// IMPOSSIBLE    (a) THE DEFECT THIS FILE EXISTS TO RETIRE: a component that is
//                   present in the tree and MOUNTED NOWHERE. The old repo's
//                   components/Analytics.tsx was 54 lines with 0 import sites
//                   across 11 files scanned, so a reader saw analytics in the
//                   tree and believed it worked. That is no longer
//                   CONSTRUCTIBLE: components/__tests__/Analytics.test.tsx reads
//                   app/[locale]/layout.tsx as source and asserts BOTH the
//                   import statement and the `<Analytics />` element, and
//                   asserts in the same test that the module it imports actually
//                   resolves. Deleting the mount turns the suite red. The
//                   component cannot go dead without a failing test.
//               (b) THE OLD FILE'S SECOND DEATH — self-disablement by a
//                   hardcoded empty constant (`const GA_MEASUREMENT_ID = ''`).
//                   There is no id constant in this file to leave empty; the
//                   only source is the environment, read through one validated
//                   accessor.
//               (c) A SECOND VENDOR. The old file also carried a Meta Pixel
//                   behind an empty `META_PIXEL_ID`. Nothing here imports a
//                   second id, and there is no branch to add one to — a second
//                   vendor would be a visible new import, not a flag flip.
//               (d) AN UNVALIDATED ID REACHING THE INLINE SCRIPT. `gtagSrc` and
//                   `gtagInitSnippet` take the branded `MeasurementId`; see
//                   IMPOSSIBLE (a) in lib/analytics.ts. Enforced by the compiler.
//
// CLASS         THIS INSTANCE, and it says so. It closes "GA4 is mounted, once,
//               safely, and provably" for GA4. It installs NO general rule that
//               the next third-party script must be validated, deferred, or
//               tested — the next one is the next delegate's argument to make.
//
// SERVER COMPONENT — no 'use client', deliberately, and the reason is measured:
//               `next/script` is ALREADY a client module (node_modules/next/dist/
//               client/script.js begins with 'use client'). Marking this file
//               'use client' too would add a second, redundant client boundary
//               and pull this component's own code into the browser bundle to
//               achieve nothing it does not already achieve from the server.
//               Nothing here needs client behaviour: no state, no effect, no
//               event handler, no browser API. The project's rule is
//               server-by-default (measured today: only LeadForm.tsx and
//               LanguageSwitcher.tsx carry 'use client'), and this file keeps it.
//               The env read happens on the server and the id crosses to the
//               client as an ordinary serialisable prop.
//
// HONEST LIMIT  1. NOTHING HERE IS PROVED IN A BROWSER. The test runs in jsdom,
//                  which is configured (vitest default) with `resources`
//                  unset — so an appended `<script src>` is NEVER fetched. That
//                  is why the suite makes no network call, and equally why it
//                  cannot prove gtag.js loads, runs, or reports a single hit.
//               2. `afterInteractive` IS THE STRATEGY, and the choice is a
//                  trade, not a default. `beforeInteractive` would put a
//                  third-party tag on the critical path ahead of a memorial
//                  page's own content and is restricted to the root layout;
//                  `lazyOnload` waits for browser idle and reliably loses the
//                  short visits — a link opened, read, closed — which on this
//                  site are a large share of them. `afterInteractive` fires as
//                  soon as the page is usable. The cost, stated: it is still a
//                  third-party request competing for bandwidth after hydration.
//               3. CONSEQUENCE OF (2), and it surprises people: with
//                  `afterInteractive`, `next/script` RETURNS NULL and injects a
//                  real <script> into document.body from an effect (verified in
//                  next/dist/client/script.js). So this component renders an
//                  EMPTY React subtree in BOTH states. "Container is empty" is
//                  therefore NOT evidence that analytics is off — only the
//                  absence of a `[data-nscript]` element in the document is, and
//                  the test asserts that, not the container alone.
//               4. NO SERVER-SIDE MARKUP. Because of (3), the tag is absent from
//                  the SSR HTML and appears only after hydration. A visitor with
//                  JavaScript disabled is never counted. This is a property of
//                  `next/script`, not a bug here, and it is not worked around.
//               5. THE `NEXT_PUBLIC_` PREFIX IS NOT LOAD-BEARING TODAY. Because
//                  this is a server component, an unprefixed variable would also
//                  work — the value is read on the server. The prefix is kept
//                  because the id IS public (it ships inside the script URL),
//                  because it matches `@/lib/seo`, and because the day someone
//                  calls `measurementId()` from a client component an unprefixed
//                  name would silently be `undefined`. Declared intent, not a
//                  runtime requirement.
//               6. NO CONSENT GATE — AND THIS IS AN OPEN QUESTION, NOT A CLOSED
//                  ONE. Google Consent Mode defaults are not set. Setting
//                  `analytics_storage: 'denied'` without a consent UI anywhere
//                  in this project would make analytics collect nothing, ever —
//                  a dead component with extra steps, i.e. the exact defect
//                  above. Building the consent UI is a legal and design decision
//                  about a specific audience in a specific jurisdiction, and it
//                  is outside this write-set and outside this delegate's
//                  competence to decide. What IS true today: the env var is
//                  unset, so this component renders null and NO analytics cookie
//                  is written and NO data is collected. The safe state is the
//                  current state, and it stays that way until someone
//                  deliberately sets the variable.
// ─────────────────────────────────────────────────────────────────────────────

import Script from 'next/script';
import type { ReactElement } from 'react';

import { gtagInitSnippet, gtagSrc, measurementId } from '@/lib/analytics';

/** The id of the inline bootstrap tag. `next/script` requires an id on inline
 *  scripts, and it is also the cache key it de-duplicates on. */
const INIT_SCRIPT_ID = 'ga4-init';

/**
 * Mounted unconditionally in app/[locale]/layout.tsx. The CONDITION lives here,
 * not at the mount site, so there is exactly one place that decides whether
 * analytics runs — and a reader of the layout cannot mistake a configured site
 * for an unconfigured one by reading the wrong file.
 */
export function Analytics(): ReactElement | null {
  const id = measurementId();

  // The state tonight, and the state at first deploy. Nothing is emitted.
  if (id === undefined) {
    return null;
  }

  return (
    <>
      <Script src={gtagSrc(id)} strategy="afterInteractive" />
      <Script id={INIT_SCRIPT_ID} strategy="afterInteractive">
        {gtagInitSnippet(id)}
      </Script>
    </>
  );
}
