// ─────────────────────────────────────────────────────────────────────────────
// W9-B THE RESOLVER — lib/leads/sinks/index.ts
//
// One function, and the reason it cannot return `null`.
//
// `app/api/lead/route.ts` already answers 503 `delivery_unavailable` when the
// mailer is unconfigured, and that behaviour is CORRECT and must survive this
// wave unchanged. The way it survives is that "no lead store is configured" is
// not a special case in the caller: `resolveLeadSink` ALWAYS returns a
// `LeadSink`, and an unconfigured deployment gets one whose `store()` resolves
// `{ stored: false, failure: { kind: 'not_configured', missingEnvVars } }`. The
// route stores, reads one union, and branches on the result — the same three
// lines in every deployment. A `null` return, or a throw, would put the "did we
// even have a sink?" question back into the caller, and a question in the caller
// is a question someone eventually forgets to ask.
//
// WHICH SINK, from the environment — names only, values never read into a log:
//   KV_REST_API_URL + KV_REST_API_TOKEN   -> the key-value store (`./kv`)
//   LEAD_WEBHOOK_URL                      -> the append-only webhook (`./webhook`)
//   both                                  -> BOTH, fanned out (`./composite`)
//   neither                               -> the unconfigured sink, naming all
//                                            three, storing nothing, sending
//                                            nothing
// A partially configured adapter (one of the two key-value variables set, or an
// endpoint that is not an https URL) resolves to a sink that reports the exact
// variable — never to `null`, because a typo must not look like a deliberate
// absence. Each adapter owns that judgement about its own variables; this file
// owns only the composition.
//
// INVARIANT     `resolveLeadSink` is TOTAL IN BOTH DIRECTIONS: every possible
//               environment maps to a `LeadSink`, and no input makes it return
//               `null`, `undefined`, or throw — AND the sink it returns is
//               total in turn, because `store()` on it RESOLVES a
//               `LeadStoreResult` for every outcome including an adapter that
//               rejects. The second half is `asTotalLeadSink` below, and it is
//               the difference between a contract a caller is asked to trust
//               and one a caller cannot be handed a violation of. It performs
//               NO I/O — it reads `env` and constructs objects; the first
//               network access any sink makes is inside a `store()` call that
//               someone made. The variable NAMES it can report are exactly the
//               ones the two adapter modules export; this file declares none of
//               its own.
//
// IMPOSSIBLE    A deployment that accepts a lead, stores it nowhere, and tells
//               the visitor it worked cannot be CONSTRUCTED through this
//               resolver: there is no `stored: true` literal anywhere in this
//               file or in `./unconfigured`, so no unconfigured path can produce
//               a success value for the route to mistake for one. Also out of
//               reach by construction:
//                 · a caller crashing on an unconfigured deployment — there is
//                   no null to dereference and no throw to catch;
//                 · a caller crashing on a BROKEN one — a sink obtained here
//                   cannot reject, so `await sink.store(record)` needs no
//                   `try` at the call site and a call site that omits one is
//                   correct rather than lucky. `app/api/lead/route.ts` has two
//                   such call sites and will grow more; this is why the
//                   guarantee lives at the constructor and not at either;
//                 · a network call on the unconfigured path — the sink returned
//                   holds no transport and its module imports nothing that could
//                   make one, so the call count is zero by the module graph;
//                 · an environment variable name stated twice in this repository
//                   — `KV_ENV_VARS` and `WEBHOOK_ENV_VARS` are imported from the
//                   modules that own them, so the unconfigured report and the
//                   adapters cannot disagree about what is missing;
//                 · an empty composite — `createCompositeLeadSink` takes a
//                   non-empty tuple, and this file only builds one when it holds
//                   two sinks.
//
// CLASS         Derivation for sink SELECTION across every deployment of this
//               site — local, preview, production — because the selection is a
//               pure function of `env` and `env` is a parameter, not an ambient
//               read: the same function that production calls is the one a test
//               calls, with no process mutation and nothing to restore. Adding a
//               third sink is one import and one branch here; adding a third
//               CALLER is nothing at all.
//
// HONEST LIMIT  This proves which sink is SELECTED, never that the selected sink
//               works. A `KV_REST_API_URL` pointing at an https endpoint that is
//               not a key-value store resolves to a perfectly valid sink that
//               fails on every lead — configuration is checked for PRESENCE and
//               shape, never reachability, and nothing here makes a probe
//               request to find out. Three further limits, deliberately:
//               (1) `process.env` is the DEFAULT argument, so a caller that
//               passes nothing reads the ambient environment. That is the one
//               ambient read in this directory and it exists so the route can
//               say `resolveLeadSink()`; every test passes an explicit object.
//               (2) NO CACHING. Each call resolves again and constructs new
//               objects. On a serverless platform that is once per request,
//               which is cheap (no I/O) and correct (an environment change takes
//               effect without a warm-instance restart).
//               (3) WHAT A THROWING SINK NOW DOES, precisely: `asTotalLeadSink`
//               turns a rejection from `store()` into
//               `{ stored: false, failure: { kind: 'transient', … , cause } }`,
//               so `app/api/lead/route.ts` answers 503 `storage_unavailable`
//               with `Retry-After: 30` and counts `lost_transient`, instead of
//               rejecting `POST` and handing the visitor an opaque framework
//               500 with the enquiry neither stored nor counted nor notified.
//               `transient` is a DELIBERATE OVER-ESTIMATE of recoverability: a
//               thrown adapter is by definition one whose state nobody
//               understands, and the two ways of being wrong are not
//               symmetrical. Wrong as `permanent`, a store that would have
//               worked on the next attempt loses the enquiry for good. Wrong as
//               `transient`, the visitor is invited to retry against a bug that
//               throws identically — and gets the same honest 503, never a
//               fabricated 201, because no arm of this wrapper can produce
//               `stored: true`. It also matches `./composite`, which has
//               classified a thrown CHILD as `transient` since it was written.
//               NO ADAPTER IN THIS DIRECTORY CAN REACH THIS ARM TODAY: `./kv`,
//               `./webhook`, `./unconfigured` and `./composite` each already
//               return their failures as data, and `./http`'s only rejection is
//               awaited inside an adapter's `try`. The wrapper is therefore a
//               guarantee about every adapter that has not been written yet,
//               and it costs one closure per resolution.
//               (4) IT CANNOT CATCH A SINK THE RESOLVER NEVER BUILT. A caller
//               that constructs a `LeadSink` by hand — a test harness standing
//               in for this module, a future direct `new` — gets no wrapper and
//               no guarantee. `resolveLeadSink` is the guarantee's only door,
//               which is why `asTotalLeadSink` is exported: a substitute
//               resolver that does not apply it is not standing in for this
//               one.
//               (5) The "a throw is `transient`" JUDGEMENT is stated twice in
//               this directory — here, and in `./composite`'s per-child catch,
//               which exists for a different reason (one broken adapter must
//               not discard a healthy sibling's successful write, so it cannot
//               simply be deleted in favour of this one). Collapsing the two
//               would mean a third module for the mapping and an import both
//               can reach; it was not worth the file tonight, and the cost of
//               the duplication is that changing the kind means changing two
//               lines, not one.
// ─────────────────────────────────────────────────────────────────────────────

import type { LeadSink, LeadStoreResult } from '../port';
import type { LeadRecord } from '../types';

import { createCompositeLeadSink } from './composite';
import { KV_ENV_VARS, resolveKvSink } from './kv';
import { createUnconfiguredLeadSink } from './unconfigured';
import { WEBHOOK_ENV_VARS, resolveWebhookSink } from './webhook';

/** Operator-facing label for the "nothing is wired" sink. */
const UNCONFIGURED_SINK_NAME = 'none';

/**
 * The port's promise — "`store()` RESOLVES a `LeadStoreResult`; a rejection is
 * an adapter BUG" — enforced rather than documented.
 *
 * Before this wrapper the promise was kept by four adapters that each remembered
 * to keep it, and a caller's unguarded `await sink.store(record)` was correct
 * only for as long as the fifth adapter remembered too. The alternative fix was
 * a `try` at each call site, which concedes that sinks throw and makes the
 * guarantee something every future caller has to re-derive; this makes the
 * guarantee a property of the value, so there is nothing left to remember.
 *
 * `await` inside the `try` is load-bearing: `return sink.store(record)` would
 * hand the rejected promise straight past this catch.
 *
 * Why `transient` rather than `permanent`, and what it costs to be wrong: see
 * HONEST LIMIT 3.
 */
export function asTotalLeadSink(sink: LeadSink): LeadSink {
  return {
    name: sink.name,

    async store(record: LeadRecord): Promise<LeadStoreResult> {
      try {
        return await sink.store(record);
      } catch (cause) {
        return {
          stored: false,
          failure: {
            kind: 'transient',
            detail: `${sink.name}: sink threw instead of returning a failure`,
            cause,
          },
        };
      }
    },
  };
}

/**
 * The one entry point. Inspect the environment, return the sink it describes.
 *
 * Never `null`, never a throw, and never a sink that can reject: see the header.
 * The `env` parameter is what makes this testable without touching
 * `process.env`. Selection happens in `select` below; the totality guarantee is
 * applied HERE, at the single exit, so a future branch cannot be added that
 * skips it.
 */
export function resolveLeadSink(env: NodeJS.ProcessEnv = process.env): LeadSink {
  return asTotalLeadSink(select(env));
}

function select(env: NodeJS.ProcessEnv): LeadSink {
  const kv = resolveKvSink(env);
  const webhook = resolveWebhookSink(env);

  if (kv !== null && webhook !== null) {
    // Both configured -> both written. The decision and its reversal cost are
    // argued in `./composite`'s header, which is the one place they live.
    return createCompositeLeadSink([kv, webhook]);
  }
  if (kv !== null) {
    return kv;
  }
  if (webhook !== null) {
    return webhook;
  }

  const missing = [...KV_ENV_VARS, ...WEBHOOK_ENV_VARS];
  return createUnconfiguredLeadSink(
    UNCONFIGURED_SINK_NAME,
    missing,
    `no lead sink is configured; set either ${KV_ENV_VARS.join(' + ')} or ${WEBHOOK_ENV_VARS.join(', ')}`,
  );
}
