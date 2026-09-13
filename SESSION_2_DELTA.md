# SESSION 2 — WHAT CHANGED

For someone who knew the previous repository. If you are new, read `START_HERE.md` instead.

Every figure below is cited to the section of `REBUILD_STATUS_v1_00.md` that owns it. Where a number is
not in the ledger it is not in this file.

---

## The shape of the change

| | Before | After |
|---|---|---|
| The page | one **594-line** component (§W1) | 13 sections, one composition point |
| Languages | Hebrew hardcoded into components (§W1) | two message catalogues; no copy in any component |
| `lang` / `dir` | never updated on `<html>` | on `<html>`, per locale, in the served bytes |
| URLs | one page, language invisible to the URL | `/he` and `/en`, both prerendered static |
| Lead delivery | **no delivery path whatsoever** (§W1, measured-ABSENT) | a real endpoint that cannot report a false success — design in `MASTER_PLAN.md` §4 |
| Tests | **0 test files, no harness** (§W1) | a suite, run by a delegate that wrote none of it |
| Lint | no ESLint config existed; `npm run lint` was a dead script | ESLint enforces the bans the architecture depends on |
| Images | unoptimised sources | **25** optimised assets + a regenerable manifest (§W6) |
| Dead code | 49 shadcn `ui/*` components, 0 used by any section (§W1) | none installed; the dead-file class is unconstructible (D-2) |
| Verification | none | a static pass, a browser pass and an adversarial pass, none by an author (§W7) |

**The premise check came first.** Before any code was written, the plan's own claims were checked
against both repositories: of 36, **8 were false** (§W1). Among them: the stack was not what the plan
said it was, and the *worst* claim was too generous — the plan named a risky form provider as our
problem, when the measured truth was that our repo had no delivery path at all.

---

## Nothing was deleted

Not one file, at any point in the session. Superseded files were **moved** into `_legacy/`, which is a
quarantine and not a bin; `_legacy/WHY.md` records for each item its original path, the named
replacement that supersedes it, and its size, and restoring any of them is one `mv` back. The totals,
and a correction the ledger made to its own earlier count, are at §W2 — "Quarantine".

**The customer's repository (`ravid_website1`) was never written to.** It was read as the only permitted
source for seeded values and verified untouched repeatedly through the session — including a check that
all source file modification times were unchanged after the asset wave (§W1, §W6, §W7).

---

## The defects that were closed

- **The false success on a lost lead.** Both predecessor sites shipped it. See `MASTER_PLAN.md` §4 for
  the mechanism and how it is now closed at both the server and the client.
- **The four measured i18n defects** in the customer's build — `dir` never on `<html>`, the language
  invisible to the URL and to crawlers, a `Translations` type declared and never applied, and an
  untyped translator. Three are now **structurally impossible** rather than merely absent; the fourth
  was closed by removing the capability rather than by adding a type (§W3, D-19, D-20).
- **Routes that were unreachable.** The localised 404 compiled, bundled and passed every gate while no
  URL could reach it (D-25). The OpenGraph image route answered 404 and had never once been
  successfully invoked (§W5). Both are now served and measured.
- **Methods that served the whole memorial page.** Any HTTP method that was not explicitly handled
  returned the full page; `OPTIONS` returned an empty 400 (D-49).
- **Missing security headers.** Before the fix, the only header observed present anywhere was a
  framework fingerprint one — on the HTML pages every visitor loads. It is now gone and the rest ship
  (D-51).
- **A dead component with zero importers**, carried in the old repo — quarantined, and its replacement
  is asserted by a test that actually imports the module (D-38).

---

## The near-misses — the most useful part

Each of these was green, or looked correct, and was wrong.

1. **The booking button was invisible while every automated gate was green.** An undefined Tailwind
   colour emits no CSS at all — silently. It took reading computed style in a real browser to see it,
   and it also uncovered that every form field's focus ring was dead. Told in full, with what it means
   for how you verify this repo, in `MASTER_PLAN.md` §8. **⚠️ The class is not fully closed** — see
   D-47(c).
2. **A test asserted an import for an hour over a file that did not exist**, because it matched source
   text with a regex instead of importing the module (D-38). The repo's only red was the typechecker.
3. **A quotation was deliberately paired with the wrong attribution and the obvious test stayed green**
   (§W4). "Both present somewhere on the page" is not a test of attribution.
4. **A verifier's list of referenced images was one short**, and the missing one was the lead form's
   background — the site's only business function. It surfaced only because two of the seat's own
   records disagreed and the discrepancy was checked rather than guessed (§W4).
5. **Four measuring instruments were caught lying in one night** — a Hebrew detector that could not
   decode Hebrew and returned a green it could not have failed; a warning counter blind to the glyph it
   was counting; a page-weight probe measuring uncompressed bytes where a browser gets compressed ones;
   and a CSS probe reading a stale server. Every one was caught by comparing against a value already
   known to be true (D-45, D-48).
6. **Closing two checks broke a third that had been green.** Adding the test harness made the
   typechecker fail, and it was the one check no fix owned. The first repair that went green would have
   silently dropped three type packages and detonated at W5's first environment read; the delegate
   refused it and fixed
   the cause (§W2).
7. **A failure was predicted in writing, in the file it broke, naming the wave and the failure mode —
   and was ignored anyway.** That is why the middleware matcher now has a guard test rather than a
   third, better comment (D-42, D-44).
8. **A false diagnosis from a two-path denominator.** The seat's explanation of a 500 was refuted on two
   counts by a delegate that decoded the built bundle; the real class was larger than the evidence
   behind the guess (D-50).
9. **Delegates caught false premises in their own briefs repeatedly**, including several from the seat.
   Two "gate defects" turned out to be briefing errors rather than code defects; one verifier withdrew
   three of its own six findings, one of them unprompted. A delegate that made **zero edits** — because
   it verified the line it was sent to fix was already correct, and refused to touch a file measured
   green — was recorded as having made the right call (§W2, §W3, §W5).

---

## What is open, and what was never measured

**Not closed, and not to be written up as closed:**

- The questions owed to the family — `START_HERE.md` names the three that matter most; the ledger's
  §OPEN table holds the rest, each already seeded and wired to one named constant.
- `lang`/`dir` in a 404's served bytes (D-26), and the dynamic 404 path was **not re-measured** on the
  final pass (§W7).
- The `imageAlts` language annotation, measured and uneven (D-35).
- The three gold follow-ups, one of which leaves the invisible-utility class reachable (D-47).
- The CSP `script-src` gap, recorded open by design (D-52).
- `TRACE`, which is not fixable from this repo (D-50).
- `npm run e2e`, a dead script (§W7-A).

**Never measured, and never allowed to become a zero:** the ledger keeps a §NOT-MEASURED register for
exactly this. The one most likely to be assumed closed: **nobody has looked at the pixels of the
OpenGraph share card** (§OPEN 13) — it renders English for both locales, deliberately, and this memorial
is shared in bereavement groups where the unfurl is the first impression.

---

## Reading the ledger after this

`REBUILD_STATUS_v1_00.md` corrected **its own figures** more than once during the session — a quarantine
count that outlived its measurement, and `config/site.ts` line citations that drifted twice as the file
grew. Both corrections are recorded in place rather than edited away. **Re-measure a `file:line` before
trusting it**; the constant *names* are given beside every line number precisely so that a stale number
is recoverable in one command.
