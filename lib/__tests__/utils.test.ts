// ─────────────────────────────────────────────────────────────────────────────
// W2-FIX-B TEST HARNESS — lib/__tests__/utils.test.ts
//
// THIS FILE IS THE PATTERN. W4's 13 section delegates copy its shape: colocated
// `__tests__/` directory, `*.test.ts(x)`, `@/…` alias import (never a relative
// climb), no `describe`/`it`/`expect` import (globals: true), no `cleanup()` call
// (vitest.setup.ts owns that), four-part header.
//
// INVARIANT     The real `cn()` from `@/lib/utils` — not a copy, not a mock — is
//               asserted to do the three things every call site depends on:
//               join classes, drop falsy/conditional ones, and resolve conflicting
//               Tailwind utilities LAST-WINS. `cn('p-2','p-4')` is `'p-4'`, and
//               that assertion executes on every run.
//
// IMPOSSIBLE    A silent regression in class merging can no longer be CONSTRUCTED
//               by a dependency swap. If `tailwind-merge` is removed, downgraded,
//               or `cn()` is rewritten as a naive `join(' ')` — the exact shortcut
//               that looks correct in review — `p-2 p-4` survives into the output
//               and this test goes RED with a non-zero exit code. The failure is
//               reported, not absorbed: proved by deliberately breaking this file
//               (see W2-FIX-B report, red proofs 2 and 3). Also impossible: a
//               W4 delegate concluding the `@` alias "doesn't work in tests" and
//               inventing a relative-path convention — this file imports through
//               the alias, so the alias is exercised on every run.
//
// CLASS         THIS INSTANCE for `cn()`'s behaviour — it closes the three merge
//               cases named above and no others. But by DERIVATION for the
//               harness: this file is the single executable proof that collection,
//               the jsdom environment, the setup file, and the `@` alias all work,
//               so every later test inherits a harness that has been shown green
//               AND shown red rather than merely assumed.
//
// HONEST LIMIT  This tests `cn()`'s OUTPUT STRING, never the rendered pixel. It
//               cannot tell you a merged class is the RIGHT class for the design,
//               cannot catch a component that bypasses `cn()` with string
//               concatenation, and asserts only the conflict groups named here —
//               twMerge's handling of arbitrary values (`p-[13px]`), custom plugin
//               classes, and `!important` variants is UNTESTED by this file, and
//               untested is NOT-MEASURED, not passing. It proves nothing about any
//               React component; the first component test is W4's to write.
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from '@/lib/utils';

describe('cn()', () => {
  it('joins plain class names in order', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center');
  });

  it('drops falsy and unmet conditional classes', () => {
    const isActive = false;
    const isOpen = true;

    expect(cn('base', isActive && 'active', isOpen && 'open')).toBe('base open');
    expect(cn('base', null, undefined, false, '')).toBe('base');
  });

  it('flattens array and object inputs (clsx composition)', () => {
    expect(cn(['flex', 'gap-2'], { 'text-right': true, hidden: false })).toBe(
      'flex gap-2 text-right'
    );
  });

  it('resolves conflicting Tailwind utilities last-wins (tailwind-merge)', () => {
    // The whole reason tailwind-merge is a dependency. A naive join returns
    // 'p-2 p-4' here and this assertion goes red.
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('px-2', 'p-4')).toBe('p-4');
  });

  it('keeps non-conflicting utilities from the same call', () => {
    expect(cn('p-4', 'text-lg', 'flex')).toBe('p-4 text-lg flex');
  });

  it('always returns a string, even with no usable input', () => {
    expect(cn()).toBe('');
    expect(cn(false, null, undefined)).toBe('');
  });
});
