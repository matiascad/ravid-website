// ─────────────────────────────────────────────────────────────────────────────
// W16-CITE-B COMMENT-CITATION GUARD — __tests__/comment-citations.test.ts
//
// THE DEFECT CLASS THIS CLOSES. Comments in this repo cite other files by LINE
// NUMBER. Line numbers rot the moment anyone inserts a line above the target.
// The ledger recorded the same defect SEVEN separate times (D-55, D-114, D-116,
// D-123, D-169, D-174, D-188); a single-file sweep of `lib/seo/jsonld.ts` found
// 8 citations of which 4 were stale — a 57% rot rate — one of them pointing at a
// BLANK LINE, one a half-correct range (right start, wrong end) that looks
// checked and is not, and one falsified within minutes by an edit to the very
// file it pointed at. Replacing a stale number with a fresh number is not a fix;
// it restarts the clock. The only durable citation is a NAME — a constant,
// function, type, interface or component — or, for prose with no enclosing
// symbol, a short distinctive quoted phrase a `grep` finds in one hit. A name
// survives an insertion; a number does not.
//
// INVARIANT     No comment in the maintained source tree (app/ components/ lib/
//               i18n/ config/, plus the repo-root config files) cites a file
//               THAT EXISTS IN THIS REPOSITORY together with a line number,
//               unless that exact comment line is named in ALLOWED below.
//
// IMPOSSIBLE    (a) A new `file.ts:NN` citation landing unnoticed. It fails this
//                   test on the next run, naming the file, the line and the
//                   citation text.
//               (b) The allow-list degrading into a rubber stamp — see WHY THIS
//                   MECHANISM below. There is no opt-out comment to paste.
//               (c) The matcher rotting into decoration. It is proved able to go
//                   RED against a scratch string inside this file, so "0
//                   violations" means the matcher ran, not that it can no longer
//                   match anything.
//
// WHY A VITEST TEST AND NOT AN ESLINT RULE. An ESLint rule would read comments
// from the AST, which is strictly more accurate than the line scanner below. It
// was rejected on what this repo can KEEP green: there is no local rule package,
// no plugin directory and no rule-resolution config here, so an ESLint rule
// means new build surface (a plugin entry point, a resolver path in the flat
// config, its own tests) whose only consumer is this one rule — and a lint rule
// that lives in an untested local plugin is itself an unguarded fact. Vitest
// already runs every source file's invariants in CI, this repo already keeps
// repo-wide grep-style invariants in tests (see `app/__tests__/seo.test.ts`),
// and a failure here prints the offending line verbatim, which is what the next
// author actually needs. Accuracy was traded for a guard that will still be
// running in six months.
//
// WHY THE ALLOW-LIST IS NOT A RUBBER STAMP — the question this guard must
// survive is "what stops the next person waving an exception through?". Four
// things, and the fourth is the one that bites:
//   1. THERE IS NO OPT-OUT COMMENT. A blanket `// eslint-disable`-style marker
//      can be pasted by anyone, in any file, in the same edit that introduces
//      the violation, and review sees one line where two were needed. The only
//      way to permit a citation is to edit THIS FILE, in a diff a reviewer must
//      approve separately from the code.
//   2. AN ENTRY QUOTES THE EXACT COMMENT LINE, not a file or a pattern. It
//      cannot pre-authorise a file, a directory or a shape of citation; it
//      authorises one sentence. A second stale citation in an already-excepted
//      file still goes red.
//   3. `why` IS REQUIRED AND ASSERTED NON-EMPTY. An exception that cannot state
//      its justification does not compile past this test.
//   4. A DEAD ENTRY FAILS THE TEST. Every entry must match a line that actually
//      exists. So the allow-list cannot be widened in advance, cannot be padded
//      "just in case", and — the load-bearing consequence — the moment someone
//      REWORDS an excepted comment, its entry stops matching and the build goes
//      RED. An exception cannot silently outlive the justification it was
//      granted under; it has to be re-argued on the spot.
//
// THE TWO EXCEPTIONS, AND WHY THEY EXIST. Both are EVIDENCE, not navigation —
// nothing is meant to be found at either number — and that is the only category
// of exception this list has ever granted.
//   1. `lib/seo/jsonld.ts` keeps a past-tense DATED RECORD that a citation
//      reading `config/site.ts:78` was measured and found to name the WhatsApp
//      comment while the constant it claimed to name stood at `:88`. That
//      sentence is this repository's only in-file proof of the failure mode this
//      very test enforces; deleting it to make the test pass would delete the
//      evidence for the rule.
//   2. `components/sections/__tests__/LeadForm.test.tsx` quotes one frame of the
//      stack trace Vitest printed when that test was PROVED RED. A stack frame
//      IS a file and a line; rewriting the quote to name a symbol would falsify
//      the record it exists to be. The non-verbatim half of that note — an
//      appended "(:NNN in the file as it now stands)" correction that was never
//      part of the tool output and had already begun to rot — was REMOVED rather
//      than excepted.
// The distinction that keeps this from spreading: a citation that says WHERE TO
// LOOK is never exceptable, because a name always says it better. A citation
// that is a QUOTATION OF A MEASUREMENT may be, because the number is the fact.
//
// ⚠️ HONEST LIMIT — what this guard does NOT catch. State these plainly; a guard
// whose blind spots are undocumented is worse than none, because it buys
// confidence it has not earned.
//   1. IT DOES NOT PARSE. Comments are found by a line scanner that tracks `/*
//      … */` and takes the text after `//`. A `//` inside a STRING LITERAL (a
//      URL, a regex) is therefore read as a comment, and a citation written
//      inside a string literal that this scanner classifies as code is MISSED.
//      Neither has occurred in this repo, and the false-positive direction is
//      the safe one — it fails loudly rather than passing silently.
//   2. IT DOES NOT CATCH A STALE **NAME**. `Hero.tsx` citing a `heroTitle` that
//      was renamed or deleted still passes. This guard makes citations DURABLE,
//      not TRUE. A name at least fails loudly under grep; a number fails silently
//      by pointing somewhere plausible and wrong.
//   3. IT DOES NOT CATCH AN INDIRECT REFERENCE. "the line above", "three lines
//      down", "the second branch of the function below" all rot exactly like a
//      number and are invisible here.
//   4. IT ONLY POLICES FILES THAT EXIST IN THIS REPOSITORY. A citation into the
//      customer's separate `ravid_website1` tree, into `_legacy/**`, or into
//      `next/dist/**` carries a line number this repo cannot verify and does not
//      control, and those are historical provenance records rather than
//      navigation aids. They are deliberately out of scope. The consequence is a
//      rule with teeth: if a cited BASENAME resolves inside this repo, spelling
//      it without a path is ambiguous, so an external citation must be written
//      with its full external path — which is already this repo's convention.
//   5. IT SCANS `.ts`/`.tsx` ONLY. A citation in a `.css`, `.mjs`, `.json` or
//      `.md` file is not read.
//   6. IT IS NOT A UNIQUENESS CHECK. A replacement citing a NAME that occurs in
//      forty places is durable but not useful; only a human can judge that.
// ─────────────────────────────────────────────────────────────────────────────

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, basename } from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = resolve(__dirname, '..');

/** The maintained source tree. `_legacy/**` is quarantined; see HONEST LIMIT 4. */
const SCAN_DIRS = ['app', 'components', 'lib', 'i18n', 'config'] as const;

/** Directories that are never source, wherever they appear. */
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', '_legacy', 'e2e']);

/** Repo-root files a comment may legitimately cite by bare name. */
const ROOT_FILES = ['vitest.config.ts', 'next.config.ts', 'tailwind.config.ts'] as const;

/**
 * A citation this repo has decided to keep, as an exact comment line.
 *
 * ⚠️ ADDING AN ENTRY HERE IS THE EXCEPTION, NOT THE ROUTE. Read "WHY THE
 * ALLOW-LIST IS NOT A RUBBER STAMP" above before you do. `line` must be the
 * comment line VERBATIM (leading and trailing whitespace trimmed) and `why`
 * must say why a NAME cannot carry the same meaning. An entry that matches
 * nothing FAILS this test, so a reworded comment forces the exception to be
 * argued again rather than inherited.
 */
const ALLOWED: ReadonlyArray<{ file: string; line: string; why: string }> = [
  {
    file: 'lib/seo/jsonld.ts',
    line: '// cited `config/site.ts:78`; when that was MEASURED, line 78 held the WhatsApp',
    why:
      'PAST-TENSE DATED EVIDENCE, not a pointer. This sentence records a citation ' +
      'that was measured and found false, and is the repository\'s only in-file ' +
      'proof of the failure mode this test enforces. A name cannot carry it: the ' +
      'whole content of the record IS that a number named the wrong thing.',
  },
  {
    file: 'components/sections/__tests__/LeadForm.test.tsx',
    line: '//                  ❯ decodedPrefill components/sections/__tests__/LeadForm.test.tsx:513:11',
    why:
      'VERBATIM PASTED TOOL OUTPUT. This is one frame of the stack trace Vitest ' +
      'printed when that test was PROVED RED, quoted unaltered as the evidence ' +
      'the proof happened. A name cannot carry it: a stack frame IS a file and a ' +
      'line, and rewriting the quote would falsify the record it exists to be. ' +
      'The rotting half - an appended "(:NNN in the file as it now stands)" ' +
      'correction, which was not part of the tool output - has been REMOVED.',
  },
];

/** Every `.ts`/`.tsx` file under the maintained tree, repo-relative. */
function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.tsx?$/.test(entry)) out.push(relative(ROOT, full));
    }
  };
  for (const d of SCAN_DIRS) walk(join(ROOT, d));
  for (const f of ROOT_FILES) {
    try {
      statSync(join(ROOT, f));
      out.push(f);
    } catch {
      // Absent config file: nothing to scan, nothing to report.
    }
  }
  return out;
}

/**
 * Every path and basename that names a file INSIDE this repository, so a
 * citation can be told from a reference into the customer's separate tree.
 */
function repoNames(files: readonly string[]): { paths: Set<string>; bases: Set<string> } {
  const paths = new Set<string>();
  const bases = new Set<string>();
  for (const f of files) {
    paths.add(f);
    bases.add(basename(f));
  }
  // Non-`.ts` files comments legitimately cite by path.
  for (const extra of ['app/globals.css']) {
    paths.add(extra);
    bases.add(basename(extra));
  }
  return { paths, bases };
}

/**
 * The comment text of each line, indexed by 1-based line number. Lines with no
 * comment are absent. See HONEST LIMIT 1 — this is a scanner, not a parser.
 */
function commentLines(source: string): Map<number, string> {
  const found = new Map<number, string>();
  let inBlock = false;
  source.split('\n').forEach((raw, i) => {
    const lineNo = i + 1;
    if (inBlock) {
      found.set(lineNo, raw.trim());
      if (raw.includes('*/')) inBlock = false;
      return;
    }
    const block = raw.indexOf('/*');
    const slash = raw.indexOf('//');
    if (block !== -1 && (slash === -1 || block < slash)) {
      found.set(lineNo, raw.trim());
      if (!raw.includes('*/', block + 2)) inBlock = true;
      return;
    }
    if (slash !== -1) found.set(lineNo, raw.trim());
  });
  return found;
}

/**
 * `Hero.tsx:240`, `lib/seo.ts:12-30`, `app/globals.css:108`. The trailing
 * `(?!\d)` keeps `foo.ts:12:5` (a stack-trace column) matching as `:12`.
 */
const CITATION = /([A-Za-z0-9_.[\]-]+(?:\/[A-Za-z0-9_.[\]-]+)*\.(?:tsx?|jsx?|mjs|css))\s*:\s*(\d+)/g;

interface Violation {
  readonly file: string;
  readonly lineNo: number;
  readonly text: string;
  readonly citation: string;
}

function scan(files: readonly string[]): Violation[] {
  const { paths, bases } = repoNames(files);
  const violations: Violation[] = [];
  for (const file of files) {
    const source = readFileSync(join(ROOT, file), 'utf8');
    for (const [lineNo, text] of commentLines(source)) {
      for (const match of text.matchAll(CITATION)) {
        const cited = match[1] ?? '';
        const inRepo = cited.includes('/') ? paths.has(cited) : bases.has(cited);
        if (!inRepo) continue;
        violations.push({ file, lineNo, text, citation: match[0] });
      }
    }
  }
  return violations;
}

describe('comment citations name symbols, never line numbers', () => {
  const files = sourceFiles();

  it('scans a non-trivial number of source files', () => {
    // Guards the guard: a broken walk that finds nothing would otherwise pass.
    expect(files.length).toBeGreaterThan(50);
  });

  it('CAN go red — the matcher is not decoration', () => {
    const probe = '// a scratch citation: lib/seo/jsonld.ts:42 must be seen';
    const hits = [...probe.matchAll(CITATION)];
    expect(hits).toHaveLength(1);
    expect(hits[0]?.[0]).toBe('lib/seo/jsonld.ts:42');
    // ...and a reference outside this repo is correctly left alone.
    const { bases } = repoNames(files);
    expect(bases.has('HeroSection.tsx')).toBe(false);
  });

  it('finds no un-allowed `file.ts:NN` citation in any comment', () => {
    const allowed = new Set(ALLOWED.map((a) => `${a.file}::${a.line}`));
    const offending = scan(files).filter((v) => !allowed.has(`${v.file}::${v.text}`));

    const report = offending.map((v) => `${v.file}:${v.lineNo}  cites ${v.citation}\n    ${v.text}`);
    expect(report).toEqual([]);
  });

  it('every allow-list entry is justified and still matches a real line', () => {
    // A dead entry is how an allow-list becomes a rubber stamp: it lets someone
    // widen the exception in advance, and lets an exception outlive the comment
    // it was granted for. Both fail here.
    const dead: string[] = [];
    for (const entry of ALLOWED) {
      expect(entry.why.trim().length, `allow-list entry for ${entry.file} states no reason`)
        .toBeGreaterThan(40);
      const source = readFileSync(join(ROOT, entry.file), 'utf8');
      const present = [...commentLines(source).values()].includes(entry.line);
      if (!present) dead.push(`${entry.file}  no longer contains:\n    ${entry.line}`);
    }
    expect(dead).toEqual([]);
  });
});
