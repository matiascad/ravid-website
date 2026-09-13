// ─────────────────────────────────────────────────────────────────────────────
// W9-B FAN-OUT LEAD SINK — lib/leads/sinks/composite.ts
//
// THE BOTH-CONFIGURED DECISION, and the whole of its justification.
//
// When a deployment has configured BOTH a key-value store and a webhook, this
// wave writes to BOTH, and `store()` succeeds if AT LEAST ONE of them stored the
// lead. The alternative — a documented precedence, "use the store, ignore the
// webhook" — was considered and refused, because the defect being closed is "a
// lead exists in exactly one place and that place failed". An operator who
// configured two sinks asked for two traces; handing them one and silently
// dropping the other reintroduces the single point of failure under a new name.
// And the family's actual recovery path is the spreadsheet, not the Redis
// console: dropping the webhook because a database is present would drop the
// copy a human can read.
//
// `port.ts` anticipated this member of the class by name ("or a composite that
// fans out to several"), so the decision is inside the contract, not around it.
//
// WHAT "stored" MEANS HERE, stated once: at least one sink holds this record
// under `record.id`. The id echoed is `record.id`, which is the SAME id in every
// sink — the caller mints it once and hands the same finished record to each —
// so a partial write is still fully correlated: the row in the sheet and the key
// in the store carry one identity, and neither is a different lead.
//
// REVERSAL COST, stated plainly so the seat can price it: switching to
// precedence is a three-line edit in `./index.ts` (return the first non-null
// sink instead of composing), deleting this file into `_legacy/`, and deleting
// its test. NO CALL SITE CHANGES — `resolveLeadSink` returns `LeadSink` either
// way, and `app/api/lead/route.ts` cannot tell the difference. That is the whole
// price, and it is low BECAUSE the decision is behind the port; it would be a
// rewrite if the route knew how many sinks there were.
//
// INVARIANT     Every sink in the composite is offered every record: they are
//               started together and all of their outcomes are awaited, so no
//               sink's failure can prevent another sink's write. `store()`
//               resolves `{ stored: true, id: record.id }` if at least one sink
//               stored, and `{ stored: false, failure }` only when EVERY sink
//               failed. It never rejects, even if a member sink rejects.
//
// IMPOSSIBLE    A silent partial failure can no longer be CONSTRUCTED: the one
//               path where a failure would otherwise be discarded — some stored,
//               some did not — is the one path that writes an operator log line,
//               naming the sink, the kind and the lead id. That is what `name`
//               exists for (`port.ts` HONEST LIMIT 5). Also out of reach by
//               construction:
//                 · a composite over ZERO sinks — the parameter is a non-empty
//                   tuple type, so `[]` is a compile error, and "succeeded
//                   because nothing failed" is not a state this type can reach;
//                 · one buggy adapter losing a lead another adapter stored — a
//                   member that REJECTS (a genuine adapter bug, the only case
//                   `port.ts` permits a rejection) is caught per-member and
//                   becomes that member's `transient` failure, so the other
//                   member's success still stands and is still returned;
//                 · a fabricated id — `newLeadId` is not imported here either;
//                   the echo is the record's own id.
//
// CLASS         Derivation for fan-out over ANY set of lead sinks, not for these
//               two: the parameter is `readonly [LeadSink, ...LeadSink[]]`, so a
//               third sink added later joins by being passed in, with no edit
//               here and no new merge rule. The merge itself is a closure over
//               the three failure kinds, which are closed in `types.ts`.
//
// HONEST LIMIT  PARTIAL FAILURE IS INVISIBLE TO THE CALLER. The port's success
//               arm is `{ stored: true, id }` and has no room for "…but the
//               webhook was down", so a caller that stored to one of two sinks
//               gets the same value as one that stored to both. The only trace
//               is the `console.warn` below — an operator log line nobody is
//               paged on. Closing that needs either a richer success arm in
//               `port.ts` (not this delegate's file) or a notifier the route
//               passes in (and the route is being rewired by another delegate
//               tonight, so a parameter added here today would be a parameter
//               nobody passes). It is named here and it is owed to the seat.
//               Four further limits, deliberately:
//               (1) NO ROLLBACK. If the store succeeds and the webhook fails,
//               nothing is undone and nothing is replayed. The lead is stored
//               once and missing from one sheet; reconciling is manual.
//               (2) NO TIMEOUT OF ITS OWN. The composite is as slow as its
//               slowest member, because it awaits all of them. With two HTTP
//               sinks at the transport's 8s ceiling that is 8s, not 16s (they
//               run concurrently) — but it is 8s of a serverless request.
//               (3) THE MERGED KIND IS THE MOST RECOVERABLE ONE, not the most
//               common: transient beats permanent beats not_configured, because
//               if any member could work on a retry then a retry is worth doing.
//               A deployment where one sink is permanently misconfigured
//               therefore reports `transient` while the other sink flaps, which
//               is the correct instruction and an incomplete diagnosis; the
//               `detail` carries every member's reason so the log has the rest.
//               (4) IT TRUSTS MEMBER DETAILS. `detail` strings from member sinks
//               are concatenated into the merged detail and logged. The two
//               sinks in this directory put no URL, token or personal data in a
//               detail (each says so in its own header); a future sink that did
//               would leak it into this log line, and nothing here would notice.
// ─────────────────────────────────────────────────────────────────────────────

import type { LeadSink, LeadSinkFailure, LeadStoreResult } from '../port';
import type { LeadRecord } from '../types';

/** One member's outcome: its label, and why it failed if it did. */
type Attempt = {
  readonly name: string;
  readonly failure: LeadSinkFailure | null;
};

/**
 * Most recoverable first. See HONEST LIMIT 3 for why `transient` outranks the
 * others: it is the only kind whose instruction is "try again", and if any
 * member can still work, the caller should hear that.
 */
function worstKind(failures: readonly LeadSinkFailure[]): LeadSinkFailure['kind'] {
  if (failures.some((failure) => failure.kind === 'transient')) {
    return 'transient';
  }
  if (failures.some((failure) => failure.kind === 'permanent')) {
    return 'permanent';
  }
  return 'not_configured';
}

/** Names only, each once, in first-seen order. Values never reach this array. */
function mergeMissingEnvVars(failures: readonly LeadSinkFailure[]): readonly string[] {
  const names: string[] = [];
  for (const failure of failures) {
    if (failure.kind !== 'not_configured') {
      continue;
    }
    for (const name of failure.missingEnvVars) {
      if (names.includes(name) === false) {
        names.push(name);
      }
    }
  }
  return names;
}

/** The first cause any member attached, for the operator log. Never rendered. */
function firstCause(failures: readonly LeadSinkFailure[]): unknown {
  for (const failure of failures) {
    if (failure.kind !== 'not_configured' && failure.cause !== undefined) {
      return failure.cause;
    }
  }
  return undefined;
}

/**
 * Fan one record out to every sink. Non-empty by type: a composite over nothing
 * would report success for having failed at nothing.
 */
export function createCompositeLeadSink(sinks: readonly [LeadSink, ...LeadSink[]]): LeadSink {
  return {
    name: sinks.map((sink) => sink.name).join('+'),

    async store(record: LeadRecord): Promise<LeadStoreResult> {
      const attempts: readonly Attempt[] = await Promise.all(
        sinks.map(async (sink): Promise<Attempt> => {
          try {
            const result = await sink.store(record);
            return { name: sink.name, failure: result.stored ? null : result.failure };
          } catch (cause) {
            // `port.ts`: a rejection is an adapter BUG, not an expected failure.
            // It is caught here so that one broken adapter cannot discard
            // another adapter's successful write.
            return {
              name: sink.name,
              failure: {
                kind: 'transient',
                detail: `${sink.name}: sink threw instead of returning a failure`,
                cause,
              },
            };
          }
        }),
      );

      const failed = attempts.filter((attempt): attempt is Attempt & { failure: LeadSinkFailure } =>
        attempt.failure !== null,
      );

      if (failed.length < attempts.length) {
        // At least one sink holds this lead. The failures of the others would be
        // discarded by the port's success arm, so they are logged here — the
        // only trace of a partial write. Names, kinds and the lead id only.
        for (const attempt of failed) {
          console.warn(
            `[lead] sink "${attempt.name}" did not store lead ${record.id} (${attempt.failure.kind}): ${attempt.failure.detail}`,
          );
        }
        return { stored: true, id: record.id };
      }

      const failures = failed.map((attempt) => attempt.failure);
      const detail = failures.map((failure) => failure.detail).join('; ');
      const kind = worstKind(failures);

      if (kind === 'not_configured') {
        return {
          stored: false,
          failure: {
            kind: 'not_configured',
            missingEnvVars: mergeMissingEnvVars(failures),
            detail,
          },
        };
      }
      if (kind === 'transient') {
        return { stored: false, failure: { kind: 'transient', detail, cause: firstCause(failures) } };
      }
      return { stored: false, failure: { kind: 'permanent', detail, cause: firstCause(failures) } };
    },
  };
}
