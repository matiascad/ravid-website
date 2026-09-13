// ─────────────────────────────────────────────────────────────────────────────
// W9-FIX2 · THE LEAD PORT'S REFUSALS, AS STANDING PROOFS — lib/leads/__tests__/port-structural.test.ts
//
// `lib/leads/port.ts` says its bad states are unconstructible and said the
// refusal "was observed, not assumed (a probe was compiled, the error captured
// verbatim, the probe removed)". The probe was removed, so NOTHING RE-EXECUTED
// THE PROOF. A captured error is a photograph: it proves the property held on
// the day it was taken. `tsc --noEmit` then proved only that the code which
// EXISTS compiles — it proved nothing about what the type system REJECTS, and a
// widening of `LeadStoreResult` to `id?: LeadId` would have left `tsc`, ESLint
// and every test green while the header kept claiming a proof that no longer
// held. That is Law 8 at the type layer: a header asserting an effect that
// nothing computes.
//
// This file is that effect, computed. Each refusal the header claims is an
// executing assertion here, so every `tsc --noEmit` re-proves it.
//
// INVARIANT     Every claim in `port.ts`'s IMPOSSIBLE block has a corresponding
//               `@ts-expect-error` below, and each one sits on a SINGLE line
//               whose error is the one named beside it.
//
// THE MECHANISM, STATED. An UNUSED `@ts-expect-error` is itself a `tsc` error
//               ("Unused '@ts-expect-error' directive."). So the day a refusal
//               stops happening — `id` made optional, the brand dropped from
//               `LeadId`, the union flattened to `{ stored: boolean; id?: … }` —
//               the directive above it goes unsatisfied and THE TYPECHECK FAILS.
//               The proof is not this file's prose; it is `tsc`'s exit code.
//
// WHY THERE IS ALMOST NO `expect` HERE. The assertions are the `@ts-expect-error`
//               comments; they are checked by the compiler, not the runner.
//               vitest strips types, so this run cannot fail on them — the
//               typecheck gate is where they land. The runtime tests below exist
//               so the file is a legal test, so a reader sees it in the suite
//               count, and so a DELETED `compileTimeProofs` fails loudly in the
//               runner as well as in `tsc`.
//
// CLASS         Closed for the port's whole IMPOSSIBLE list, not for one shape:
//               the last probe is an arbitrary `LeadSink` IMPLEMENTATION, which
//               is the claim `port.ts` makes about every sink present and
//               future — file, database, spreadsheet, CRM, queue, composite.
//
// HONEST LIMIT  1. These prove what the COMPILER refuses. They prove nothing
//                  about what an adapter does at runtime: `{ stored: true, id:
//                  newLeadId() }` having written nothing still compiles, and
//                  always will. That guarantee belongs to the adapters' own
//                  tests, exactly as `port.ts` says.
//               2. `@ts-expect-error` suppresses EVERY error on its line, so a
//                  probe that is wrong for an unrelated reason would go green
//                  and hide a real regression. Each probe below is therefore
//                  minimal and single-line, and each was compiled WITHOUT its
//                  directive first, with the resulting error read and matched to
//                  the reason beside it. That capture is in the W9-FIX2 report.
//                  Nothing in this file re-checks the MATCH; only review does.
//               3. Two probes (a success arm carrying a `failure`, a failure arm
//                  carrying an `id`) rest on EXCESS PROPERTY CHECKING, which
//                  applies to fresh object literals only. A value of the wrong
//                  shape laundered through a variable is structurally assignable
//                  to the failure arm and would compile. What is closed WITHOUT
//                  that caveat is the READ side — after narrowing to
//                  `stored === false` there is no `id` in scope at all — and
//                  that is the half the header's "no id to log as if a lead had
//                  been saved" actually depends on.
//               4. It asserts nothing about `port.ts`'s prose. A header claim
//                  with no probe here is unproven again; that is the defect this
//                  file closes, and it reopens the moment a claim is added
//                  without a line below.
// ─────────────────────────────────────────────────────────────────────────────

import type { LeadSink, LeadSinkFailure, LeadStoreResult } from '@/lib/leads/port';
import { newLeadId, type LeadId, type LeadRecord } from '@/lib/leads/types';

/**
 * Values with a TYPE and no VALUE. `declare const` is deliberate: these exist
 * for the typechecker and must never be evaluated, which is why every probe
 * lives in a function that is never called.
 */
declare const id: LeadId;
declare const failure: LeadSinkFailure;
declare const result: LeadStoreResult;
declare const idlessRecord: Omit<LeadRecord, 'id'>;
declare const sink: LeadSink;

/**
 * NEVER CALLED, and that is the design. `tsc` checks the body of an
 * unreferenced function exactly as it checks any other, so every line here is an
 * assertion the TYPECHECKER runs. Executing it would be a ReferenceError on the
 * `declare const`s above — a proof, not a program.
 */
function compileTimeProofs(): void {
  /* ── 1. `{ stored: true }` with no id ───────────────────────────────────── */
  // @ts-expect-error -- the success arm REQUIRES `id`; there is no success without one.
  const noId: LeadStoreResult = { stored: true };

  /* ── 2. `{ stored: true, id: undefined }` ───────────────────────────────── */
  // @ts-expect-error -- `id` is required and branded; `undefined` is no optionality to exploit.
  const undefinedId: LeadStoreResult = { stored: true, id: undefined };

  /* ── 3. `{ stored: true, id: '' }` ──────────────────────────────────────── */
  // @ts-expect-error -- `LeadId` is branded: no plain string is assignable, least of all ''.
  const emptyId: LeadStoreResult = { stored: true, id: '' };

  /* ── 3b. and no well-formed-LOOKING string either ───────────────────────── */
  // @ts-expect-error -- 26 Crockford characters are still a `string`; only `newLeadId`/`parseLeadId` mint the brand.
  const forgedId: LeadStoreResult = { stored: true, id: '01ARZ3NDEKTSV4RRFFQ69G5FAV' };

  /* ── 4a. a success value that also carries a failure ────────────────────── */
  // @ts-expect-error -- the arms are disjoint: the `true` arm has nowhere for `failure` to land.
  const successWithFailure: LeadStoreResult = { stored: true, id, failure };

  /* ── 4b. a failure that also carries an id ──────────────────────────────── */
  // @ts-expect-error -- the `false` arm has no `id`: a failure cannot be dressed as a stored lead.
  const failureWithId: LeadStoreResult = { stored: false, failure, id };

  /* ── 5. reading `.id` UN-NARROWED ───────────────────────────────────────── */
  // @ts-expect-error -- the union must be narrowed before `.id` exists; forgetting the failure is a compile error.
  void result.id;

  /* ── 6. reading `.id` after narrowing to the FAILURE arm ────────────────── */
  if (!result.stored) {
    // @ts-expect-error -- narrowed to `stored === false`, there is NO `id` in scope to log as if a lead had been saved.
    void result.id;
  }

  /* ── 7. a failure that does not say WHICH kind ──────────────────────────── */
  // @ts-expect-error -- every failure names a `LeadFailureKind`; "could not store" alone is not a failure value.
  const kindless: LeadStoreResult = { stored: false, failure: { detail: 'FIXTURE-DETAIL' } };

  /* ── 8. a kind the `Extract` pin does not recognise ─────────────────────── */
  // @ts-expect-error -- the kinds are pinned to `LeadFailureKind` by `Extract`; an invented one has no arm.
  const bogusKind: LeadStoreResult = { stored: false, failure: { kind: 'unstorable', detail: 'FIXTURE-DETAIL' } };

  /* ── 9. `not_configured` without the names it owes the operator ─────────── */
  // @ts-expect-error -- the `not_configured` arm REQUIRES `missingEnvVars`; an unactionable outage report is unconstructible.
  const namelessOutage: LeadStoreResult = { stored: false, failure: { kind: 'not_configured', detail: 'FIXTURE-DETAIL' } };

  /* ── 10. THE CLASS CLAIM: any sink, present or future ───────────────────── */
  // @ts-expect-error -- an adapter cannot claim success without naming what it stored; the refusal lands in the ADAPTER's own file.
  const liar: LeadSink = { name: 'FIXTURE-SINK', store: async () => ({ stored: true }) };

  /* ── 11. …and cannot fail without a reason either ───────────────────────── */
  // @ts-expect-error -- the `false` arm REQUIRES `failure`; a bare "no" is not a result.
  const mute: LeadSink = { name: 'FIXTURE-SINK', store: async () => ({ stored: false }) };

  /* ── 12. the port takes a COMPLETE record ───────────────────────────────── */
  // @ts-expect-error -- `store` takes a whole `LeadRecord`; a sink is never handed an idless lead to mint an id for.
  void sink.store(idlessRecord);

  void noId;
  void undefinedId;
  void emptyId;
  void forgedId;
  void successWithFailure;
  void failureWithId;
  void kindless;
  void bogusKind;
  void namelessOutage;
  void liar;
  void mute;
}

/* ── POSITIVE CONTROLS ────────────────────────────────────────────────────── */

/**
 * The other half of an honest negative test: if the import were broken or
 * `LeadStoreResult` had collapsed to `unknown`, every probe above would still
 * error and every directive would still be satisfied. These lines fail in that
 * world, so the suite distinguishes "the refusals hold" from "nothing compiles".
 */
function compileTimeControls(): void {
  const stored: LeadStoreResult = { stored: true, id: newLeadId() };
  const notStored: LeadStoreResult = {
    stored: false,
    failure: { kind: 'transient', detail: 'FIXTURE-DETAIL' },
  };
  void stored;
  void notStored;
}

/** Narrowing is the ONLY way to an id — and it does work. */
function idOf(outcome: LeadStoreResult): LeadId | null {
  return outcome.stored ? outcome.id : null;
}

describe('the lead port refuses "accepted but unstored"', () => {
  it('has fourteen compile-time assertions, each satisfied by a real tsc error', () => {
    // The assertions are the `@ts-expect-error` comments above; a satisfied one
    // is invisible to this runner and a FAILING typecheck the day the refusal
    // stops happening. What this runtime line adds is that the proofs still
    // EXIST and were compiled — a deleted `compileTimeProofs` fails here and in
    // `tsc` alike, which is precisely the hole a removed probe left.
    expect(typeof compileTimeProofs).toBe('function');
    expect(typeof compileTimeControls).toBe('function');
  });

  it('lets a real success through, and it carries an id', () => {
    const outcome: LeadStoreResult = { stored: true, id: newLeadId() };
    expect(outcome.stored).toBe(true);
    expect(idOf(outcome)).toHaveLength(26);
  });

  it('lets a real failure through, and it carries no id to mistake for one', () => {
    const outcome: LeadStoreResult = {
      stored: false,
      failure: { kind: 'not_configured', missingEnvVars: [], detail: 'FIXTURE-DETAIL' },
    };
    expect(outcome.stored).toBe(false);
    expect(idOf(outcome)).toBeNull();
    expect(Object.prototype.hasOwnProperty.call(outcome, 'id')).toBe(false);
  });
});
