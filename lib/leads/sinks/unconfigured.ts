// ─────────────────────────────────────────────────────────────────────────────
// W9-B THE SINK THAT STORES NOTHING — lib/leads/sinks/unconfigured.ts
//
// A site with no lead store configured is the site as it stands tonight, and its
// behaviour is CORRECT: `app/api/lead/route.ts` answers 503
// `delivery_unavailable`, logs which variables are unset to stderr, and tells
// the public client nothing about the deployment. This wave must not regress
// that into a page that says "sent" over an empty database.
//
// So "nothing is configured" is not a null the caller has to remember to check,
// and not a throw it has to remember to catch. It is a `LeadSink` like any
// other, whose `store()` RESOLVES `{ stored: false, failure: { kind:
// 'not_configured', missingEnvVars } }`. The caller's code is identical in every
// deployment; only the value differs. A branchless caller cannot forget a branch.
//
// INVARIANT     `store()` on this sink resolves — never rejects — to the
//               `not_configured` arm, carrying the exact variable NAMES it was
//               constructed with and nothing else. It performs no I/O of any
//               kind: it holds no transport, no url, no token, no `fetch`, and
//               imports nothing that could reach a network. Its `missingEnvVars`
//               are names, never values, because a name is all it is ever given.
//
// IMPOSSIBLE    A deployment that stores nothing while CLAIMING to have stored
//               something cannot be constructed from here: there is no `stored:
//               true` literal in this file, so no code path through it can
//               produce a success value, with or without an id. Also out of
//               reach by construction:
//                 · a network call on the unconfigured path — this module has no
//                   import that can make one, so the transport call count on
//                   this path is zero by the module graph, not by discipline;
//                 · a caller that gets `null` and dereferences it — this is the
//                   value the resolver returns INSTEAD of null;
//                 · an environment VALUE leaking into the failure: the
//                   constructor takes `missingEnvVars` and a `detail` string, and
//                   the only callers are the two adapters and the resolver, each
//                   passing the names it owns.
//
// CLASS         Derivation for the whole "not wired up" class across every sink
//               in this directory, and for every sink added later: an adapter
//               that finds its configuration incomplete returns THIS rather than
//               inventing a second way to say so, so there is exactly one shape
//               for "a human must change the deployment" and exactly one place
//               it is built.
//
// HONEST LIMIT  This file guarantees the RESULT of an unconfigured store, and
//               nothing about what the caller does with it. If
//               `app/api/lead/route.ts` were to treat `{ stored: false }` as
//               success, or render `failure.detail` into a response body, that
//               would be a leak this module cannot prevent — it hands the names
//               to the server, and the server's discipline about not returning
//               them is the route's own (it has it today: the 503 body is
//               `{ ok: false, error: 'delivery_unavailable' }` and nothing more).
//               Two further limits: it does not verify that the names it was
//               given are real variable names — a caller passing a typo produces
//               an operator log pointing at a variable that does not exist; and
//               it cannot distinguish "never configured" from "configured wrong"
//               on its own, which is why the adapters pass a `detail` that says
//               which case they found.
// ─────────────────────────────────────────────────────────────────────────────

import type { LeadSink, LeadStoreResult } from '../port';

/**
 * A sink that stores nothing, says so, and names what is missing.
 *
 * @param name           operator-facing label, so a composite's log line says
 *                       WHICH sink was unconfigured (`port.ts` HONEST LIMIT 5).
 * @param missingEnvVars environment variable NAMES — never values. Empty is
 *                       allowed and means "the missing thing is not a variable",
 *                       which `detail` then explains (see `LeadSinkFailure`).
 * @param detail         operator-facing text for a log. NEVER a response body.
 */
export function createUnconfiguredLeadSink(
  name: string,
  missingEnvVars: readonly string[],
  detail: string,
): LeadSink {
  return {
    name,
    store(): Promise<LeadStoreResult> {
      return Promise.resolve({
        stored: false,
        failure: { kind: 'not_configured', missingEnvVars, detail },
      });
    },
  };
}
