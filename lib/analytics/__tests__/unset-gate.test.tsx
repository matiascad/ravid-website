// ─────────────────────────────────────────────────────────────────────────────
// W10-A · THE UNSET-STATE GATE — lib/analytics/__tests__/unset-gate.test.tsx
//
// THE PROPERTY THE WHOLE NIGHT DEPENDS ON: with `NEXT_PUBLIC_GA_MEASUREMENT_ID`
// absent — today's actual state — the analytics substrate does NOTHING. Not
// "renders a tag that is harmless": nothing. Zero injected nodes, zero network
// calls, zero new `window` properties, zero throws, across the shell mount and
// all nine events.
//
// LAW 8, APPLIED TO THIS FILE. It asserts no identifier. It does not check that
// a component is named Analytics or that a module exports `track`. Every
// assertion below is a COUNTED EFFECT: nodes observed entering the document,
// calls recorded on `fetch`, property names appearing on `window`, exceptions
// escaping a call. "A script tag exists" is a name; "the document gained zero
// nodes" is a thing.
//
// WHY A MutationObserver AND NOT A SPY ON `appendChild`. The brief asked for a
// spy on script insertion. An observer is STRICTLY STRONGER and was chosen for
// that reason: a spy covers the one method it wraps, so `insertBefore`,
// `replaceChildren`, `append`, `insertAdjacentHTML`, `innerHTML` and a
// `DocumentFragment` flush all walk past it. The observer sees every node that
// enters the document however it got there, which is the effect the gate is
// about. `takeRecords()` is synchronous, so nothing is missed to timing.
//
// HONEST LIMIT  1. jsdom, not a browser. jsdom never fetches an appended
//                  `<script src>` (vitest leaves `resources` unset), so "zero
//                  network calls" here is evidence about THIS code's behaviour,
//                  not proof that a browser would stay quiet. W14-B's browser
//                  pass owns that.
//               2. `getOwnPropertyNames(window)` catches enumerable and
//                  non-enumerable own properties, but not a symbol key and not a
//                  mutation of an EXISTING global's contents (e.g. pushing onto
//                  an already-present `dataLayer`). Neither is reachable from
//                  this substrate, which creates no globals at all, but the
//                  assertion does not close them.
//               3. It proves the UNSET state only. The configured state is
//                  `./track.test.ts`, and what that can and cannot prove is
//                  named there.
// ─────────────────────────────────────────────────────────────────────────────

import { render } from '@testing-library/react';

import { Analytics } from '@/components/Analytics';
import { MEASUREMENT_ID_ENV_VAR } from '@/lib/analytics';
import {
  ctaClick,
  formFail,
  formSubmitAttempt,
  formSuccess,
  instagramClick,
  langSwitch,
  scrollDepth,
  whatsappClick,
  wineClick,
  type AnalyticsEvent,
} from '@/lib/analytics/events';
import { track } from '@/lib/analytics/track';

/**
 * All nine, each built through its own constructor — which is also the proof
 * that a call site never needs to type an event name. Every payload value here
 * comes from a closed union; there is no string literal payload to invent.
 */
const EVERY_EVENT: readonly AnalyticsEvent[] = [
  ctaClick('hero_book'),
  formSubmitAttempt(),
  formSuccess(),
  formFail('network'),
  whatsappClick(),
  instagramClick(),
  wineClick('red'),
  langSwitch('en'),
  scrollDepth(25),
];

/* ── instrumentation ──────────────────────────────────────────────────────── */

const ORIGINAL_FETCH = globalThis.fetch;

let fetchCalls: readonly unknown[][] = [];
let savedEnv: string | undefined;

function recordingFetch(
  ...args: Parameters<typeof globalThis.fetch>
): Promise<Response> {
  fetchCalls = [...fetchCalls, args];
  return Promise.reject(new Error('the gate test permits no network call'));
}

/** Every node that entered the document while the observer was connected. */
function observeInsertions(): { added: () => readonly Node[]; stop: () => void } {
  const collected: Node[] = [];
  const observer = new MutationObserver(() => {
    /* records are drained synchronously below; nothing to do per batch */
  });
  observer.observe(document, { childList: true, subtree: true });

  const drain = (): void => {
    for (const record of observer.takeRecords()) {
      collected.push(...Array.from(record.addedNodes));
    }
  };

  return {
    added: () => {
      drain();
      return collected;
    },
    stop: () => {
      drain();
      observer.disconnect();
    },
  };
}

beforeEach(() => {
  savedEnv = process.env[MEASUREMENT_ID_ENV_VAR];
  delete process.env[MEASUREMENT_ID_ENV_VAR];

  // `next/script` at `afterInteractive` appends to document.body from an effect,
  // OUTSIDE the container Testing Library unmounts — so `cleanup()` cannot reach
  // it and a leaked node from any other file would be misread as this file's.
  // Same sweep, same reason, as components/__tests__/Analytics.test.tsx.
  for (const node of Array.from(document.querySelectorAll('script'))) {
    node.remove();
  }

  fetchCalls = [];
  globalThis.fetch = recordingFetch;
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  if (savedEnv === undefined) {
    delete process.env[MEASUREMENT_ID_ENV_VAR];
  } else {
    process.env[MEASUREMENT_ID_ENV_VAR] = savedEnv;
  }
});

/* ── the gate ─────────────────────────────────────────────────────────────── */

describe('analytics substrate, measurement id UNSET — the night-wide gate', () => {
  it('mounts the shell and fires all nine events with ZERO observable effect', () => {
    // Warm-up render/unmount FIRST, so that anything the test harness itself
    // installs on `window` (React Testing Library sets IS_REACT_ACT_ENVIRONMENT)
    // is already present when the baseline is taken. Without this the assertion
    // would measure the harness instead of the substrate.
    render(<div />).unmount();

    // THE HARNESS'S OWN CONTAINER IS CREATED AND ATTACHED *BEFORE* THE OBSERVER
    // STARTS, and handed to `render`. Testing Library would otherwise append a
    // fresh <div> to document.body during the render, and the observer — which
    // is deliberately blind to intent and sees every insertion — would count
    // that harness node as an effect of the substrate. Measured, not assumed:
    // the first run of this test failed on exactly that <div>. Filtering it out
    // afterwards would weaken the assertion to "no node I decided to care
    // about"; moving the container outside the measured window keeps the
    // assertion at a literal zero.
    const container = document.createElement('div');
    document.body.appendChild(container);

    const globalsBefore = new Set(Object.getOwnPropertyNames(window));
    const insertions = observeInsertions();

    let threw: unknown = null;
    try {
      render(<Analytics />, { container });
      expect(container).toBeEmptyDOMElement();

      for (const event of EVERY_EVENT) {
        track(event);
      }
    } catch (error: unknown) {
      threw = error;
    }

    const added = insertions.added();
    const globalsAfter = Object.getOwnPropertyNames(window);
    const newGlobals = globalsAfter.filter((key) => !globalsBefore.has(key));
    insertions.stop();
    container.remove();

    // 1. no throw — the nine events are safe to call from any handler
    expect(threw).toBeNull();

    // 2. zero nodes entered the document, by ANY insertion path
    expect(added).toHaveLength(0);

    // 3. zero scripts in the whole document — the tag itself
    expect(document.querySelectorAll('script')).toHaveLength(0);
    expect(document.querySelector('[data-nscript]')).toBeNull();

    // 4. zero network calls
    expect(fetchCalls).toHaveLength(0);

    // 5. zero new window properties — no dataLayer, no gtag, nothing
    expect(newGlobals).toEqual([]);
    expect(Object.getOwnPropertyNames(window)).not.toContain('dataLayer');
    expect(Object.getOwnPropertyNames(window)).not.toContain('gtag');
  });

  it('drops every event even when a gtag IS present — the gate is the id', () => {
    // Proves the silence above comes from the unset id and not merely from gtag
    // being absent. If the guard in track.ts were removed, this is the assertion
    // that would still catch it on a configured-looking page.
    const spy = vi.fn();
    window.gtag = spy;

    try {
      for (const event of EVERY_EVENT) {
        track(event);
      }
      expect(spy).not.toHaveBeenCalled();
    } finally {
      delete window.gtag;
    }
  });

  it('survives a gtag that throws — a broken tracker is never a broken button', () => {
    process.env[MEASUREMENT_ID_ENV_VAR] = 'G-GATEONLY0';
    window.gtag = () => {
      throw new Error('vendor script exploded');
    };

    try {
      for (const event of EVERY_EVENT) {
        expect(() => {
          track(event);
        }).not.toThrow();
      }
    } finally {
      delete window.gtag;
    }
  });
});
