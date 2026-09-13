# 🌙 OVERNIGHT RUN — ravid_website rebuild · v1.00
**Mati sleeps. The seat runs W1 → W8 without stopping.** Law: `PROMPT_RULES_v1_00.md` · Design: `REBUILD_PLAN_v1.00.md` · Waves: `CLAUDE_CODE_PROMPTS_v1_00.md` v1.01

---
## STEP 1 — set the goal (continuity across compaction). Type in Claude Code:
```
/goal OVERNIGHT AUTONOMOUS REBUILD of ravid_website. Execute CLAUDE_CODE_PROMPTS_v1_00.md
waves W1→W8 back-to-back without waiting for Mati. Law = /home/mati/Downloads/PROMPT_RULES_v1_00.md.
Design = REBUILD_PLAN_v1.00.md. Truth = REBUILD_STATUS_v1_00.md (only home of every count).
ARCHITECTURE LAW: right architecture or nothing — rewrite rather than patch, never patch over
a patch, never ask whether to do it worse; the answer is always DO IT RIGHT, REWRITE IF NEEDED.
Seat touches no files except the ledger; delegates = opus, mechanical = sonnet; verifiers wrote
none of the code. Never git, never rm (quarantine to _legacy/), never deploy, never write a
secret value, customer repo ravid_website1 is READ-ONLY. Unanswered customer questions never
stop the run: one typed constant seeded from ravid_website1 + logged as a one-edit OPEN item.
Finish with STATUS_DASHBOARD.html + ledger + tarball + a decision list for the morning.
```

## STEP 2 — paste this ONE block. It runs the whole night.
```
OVERNIGHT AUTONOMOUS RUN — W1 → W8, no human in the loop until morning.

READ FIRST, IN FULL, AND OBEY VERBATIM:
  /home/mati/Downloads/PROMPT_RULES_v1_00.md      (the seven laws)
  ~/project/ravid_website/REBUILD_PLAN_v1.00.md    (the architecture)
  ~/project/ravid_website/CLAUDE_CODE_PROMPTS_v1_00.md  (the 8 wave briefs — §W1..§W8)
Every wave brief there is binding, including its write-sets, budgets and NOT-THIS-SESSION lists.
Paste into every delegate: MODEL POLICY · COST DISCIPLINE · THE STANDARD+PROOF · ARCHITECTURE LAW.

ARCHITECTURE LAW (Mati's standing order — outranks speed, scope and budget):
· RIGHT ARCHITECTURE OR NOTHING. If correctness needs a unit deleted and rewritten — rewrite it.
· NEVER PATCH OVER A PATCH. Second fix on the same spot → step UP a level (check → type →
  remove the capability). Third cycle on that spot → rewrite the unit from scratch.
· NEVER ASK PERMISSION TO DO IT WORSE. No "quick vs proper", no "patch now refactor later",
  no "should I skip". Choose the correct architecture, implement it, and record the choice.
· NO PARTIAL LANDING. Not correct + tested + independently verified = NOT DONE.
· ONE FACT ONE PLACE. Any changeable value (handle, email, phone, number, domain) = one typed
  constant or message key. Never inlined twice.
· DELETE DEAD THINGS — into _legacy/ with a reason. Never rm.
· HONEST LIMIT written in each file's own header.

AUTONOMY RULES (this is what makes the night work):
1. RUN WAVES BACK-TO-BACK. After each wave: join delegates, judge against that wave's GATE,
   write the ledger, compact, start the next wave. Do not wait for Mati. Do not ask to proceed.
2. GATE FAILURE IS NOT A STOP. A failed gate spawns ONE atomic fix delegate per defect
   (model="opus", named write-set = only the offending file + its test), then the SAME gate is
   re-run by a delegate that did not write the fix. Max 3 cycles per defect; still failing →
   rewrite that unit; still failing after the rewrite → record "not closable at this level" +
   reversal cost in the ledger §DEFERRED and continue with the remaining waves.
3. UNKNOWN INPUT NEVER BLOCKS. Unanswered customer questions (instagram handle, lead email,
   final numbers, wine links, domain) → seed ONE typed constant in config/site.ts (or a message
   key) from ravid_website1 — the customer's own newest build, the only permitted source — and
   log it in §OPEN as "one-edit item: file:line". Never invent a memorial fact: a fact with no
   source is recorded NOT-MEASURED and rendered from the constant, never guessed.
4. HARD LINES STILL HOLD WHILE ALONE: no git (no commit/push/branch/hooks, and never suggest
   it), no rm, no deploy/DNS/publish, no secret values in files (env var NAMES only), zero
   writes to ~/project/ravid_website1, no _v2/_new/_final files — edit in place.
5. BUDGET: if a delegate exceeds its stated budget, kill it, split its brief into two smaller
   briefs, relaunch. Never raise a budget silently.
6. SELF-CHECK EVERY WAVE, BY NUMBER: denominator before verdict · every check proven RED once ·
   PRESENT/ABSENT/NOT-MEASURED never collapsed · skips counted separately from passes ·
   verifiers wrote none of what they verify · every plan number treated as a claim to verify.
7. LEDGER IS THE ONLY MEMORY THAT MATTERS. Append each wave's table to REBUILD_STATUS_v1_00.md
   immediately — before compacting — so a context loss costs nothing.
8. NO COSMETIC RE-RUNS. One verification run per delegate. Re-running to feel sure is banned.

MORNING DELIVERABLE (W8, written whatever else happened):
  · STATUS_DASHBOARD.html — same card format as PLAN_DASHBOARD_v1_00.html, real numbers
  · REBUILD_STATUS_v1_00.md — per-wave counts, replayed / still failing / NEWLY failing
  · README · MASTER_PLAN · START_HERE · SESSION_2_DELTA.md · tarball (no archiving — Mati archives)
  · DECISIONS: each alternative priced + THE COST OF REVERSING IT
  · OPEN: every one-edit item with file:line · DEFERRED: each with what would close it
  · ONE LINE at the top: the first action owed to Mati.

START NOW with §W1 (read-only recon, 3 parallel delegates, effort xhigh). Do not reply with a
plan or a question — launch it.
```

## STEP 3 — nothing. Sleep. Morning = dashboard + ledger + tarball + decision list.

---
### Why this is safe to leave alone
| Guard | What it prevents |
|---|---|
| write-set + budget per delegate | a task eating the night and touching unreviewed files |
| no git · no deploy · no rm · no secrets | anything irreversible happening while Mati is asleep |
| customer repo read-only | the source of truth being edited into agreement |
| ledger written before compaction | a context loss erasing the night's findings |
| verifier ≠ builder, fresh context | 23/23-closed reports that are really 12 new defects |
| 3-cycle rule → rewrite → DEFER | patch-over-patch loops burning tokens until morning |
| one typed constant for unknowns | a wrong handle copied into 9 files |
