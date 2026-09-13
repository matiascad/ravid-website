// ─────────────────────────────────────────────────────────────────────────────
// W2-A2b CONSTANTS — lib/utils.ts
//
// INVARIANT     There is exactly ONE way to merge Tailwind class names in this
//               repo: cn(). It is clsx (conditional composition) piped through
//               twMerge (last-wins conflict resolution), and it always returns a
//               string. This file exports that one function and nothing else.
//
// IMPOSSIBLE    A second class-merging helper cannot be justified into existence
//               here, and — more importantly — this file cannot become the place
//               dead code hides. A "utils" file that accepts anything accretes
//               orphans; this one has a stated single purpose in its own header,
//               so an unrelated export is visibly a violation rather than a
//               judgement call. Also impossible: `cn(someAny)` silently passing
//               a wrong shape — the parameter is `ClassValue[]`, not `any[]`.
//
// CLASS         Closed by derivation for class merging: every call site that
//               needs conditional/conflicting Tailwind classes has one name to
//               import, so "two components merge classes differently" cannot
//               arise from this layer. NOT a general utility policy — it closes
//               this one operation, not the category "helpers".
//
// HONEST LIMIT  This guarantees only that the merge is CORRECT ONCE CALLED. It
//               cannot make a component call it: `className={"a " + b}` still
//               compiles, and twMerge only understands Tailwind's own conflict
//               groups — arbitrary values and custom plugin classes may not be
//               deduped. It also cannot stop a future edit from adding a second
//               export to this file; only review (or the W7 gate) can.
// ─────────────────────────────────────────────────────────────────────────────

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names. Conditional/array/object inputs are flattened by
 * clsx, then conflicting Tailwind utilities are resolved last-wins by twMerge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
