# W16 — full paste block (self-contained). Paste into Claude Code as one message.

```
W16 — CLOSE THE LAST FIVE DEFECTS. Run to completion without asking me anything.

════════ CONTEXT ════════
Repo: ~/project/ravid_website (Next 15.5.25, live at ravid-speaks.com, deployed from commit
8bddb527). Prior runs: rebuild W1–W8, funnel W9–W15. Ledger: REBUILD_STATUS_v1_00.md
(D-1..D-156) — the ONLY home of every count.
READ FIRST, IN FULL: /home/mati/Downloads/PROMPT_RULES_v1_00.md · REBUILD_STATUS_v1_00.md ·
REDTEAM_v1_00.html. Mati has APPROVED every change currently live (wine block after the
form, the חלל צה״ל headline, all four changed strings) — do not revisit them.

════════ THE LAWS THAT GOVERN THIS RUN ════════
SEVEN LAWS (PROMPT_RULES_v1_00.md — read it, this is the summary, not a replacement):
 1 BOUND EVERY DELEGATE — each has a named write-set and a budget. More than that: ask.
 2 DENOMINATOR BEFORE VERDICT — how many exist / examined / changed. An empty sweep is
   CANNOT TELL, never "none found".
 3 EVIDENCE MUST BE ABLE TO FAIL — prove every check RED on purpose before trusting GREEN.
 4 NEVER LET THE BUILDER GRADE THE BUILD — the verifier wrote none of what it verifies.
 5 ABSENCE IS NOT PERMISSION — PRESENT · ABSENT · NOT-MEASURED, never collapsed. A skipped
   test is not a passed test.
 6 ONE FACT, ONE PLACE — every count lives in the ledger only; everything else derives.
 7 VERIFY THE PREMISE YOU WERE GIVEN, INCLUDING MINE — if a stated fact does not hold:
   report, stop, do not execute. (16 of my briefs carried false premises last run; delegates
   caught all 16. Expect more here.)
LAW 8 — A NAME IS NOT A THING. Never assert an identifier; assert the computed effect.
 Proof: tsc + ESLint + 261 tests + 5 gates + HTTP probes were GREEN while the booking button
 was invisible — `bg-gold` was undefined and Tailwind silently emits nothing. Every test
 about appearance, delivery, security or navigation must read the COMPUTED result
 (getComputedStyle, served bytes, a real status code, a stored row), never a class name, a
 message key, a script tag, or a declared npm script.
ARCHITECTURE LAW (Mati's standing order — outranks speed, scope and budget):
 · RIGHT ARCHITECTURE OR NOTHING. If correctness needs a unit deleted and rewritten, rewrite it.
 · NEVER PATCH OVER A PATCH — second fix on a spot = step up a level (check → type → remove
   the capability); third cycle on that spot = rewrite the unit.
 · NEVER ASK PERMISSION TO DO IT WORSE. No "quick vs proper", no "patch now refactor later".
 · NO PARTIAL LANDING — not correct + tested + independently verified = NOT DONE.
 · ONE FACT ONE PLACE · DELETE DEAD THINGS (quarantine to _legacy/, never rm) · HONEST LIMIT
   written into each file's own header.
FOUR-PART TEST — every fix declares: 1 INVARIANT (what is now always true) · 2 IMPOSSIBLE
 (what can no longer be CONSTRUCTED) · 3 CLASS (closed by derivation or this instance only)
 · 4 HONEST LIMIT (what it does not fix). All four = ARCHITECTURE; fewer = it must say PATCH
 and why it was accepted. NON-CONVERGENCE: a fix that opens new problems steps UP a level;
 after 3 cycles record "not closable at this level", DEFER with reversal cost, move on.

════════ MODEL POLICY ════════
· THE SEAT = this session. It TOUCHES NO FILES except REBUILD_STATUS_v1_00.md. It launches,
  joins, judges, records. Every read, grep, test and check is delegated.
· Every delegate that reads, writes, analyses or attacks = Task(model="opus").
· Mechanical, fully-specified work only (formatting, doc assembly) = Task(model="sonnet").
· No delegate is ever frontier. A delegate meeting a judgement its brief did not settle
  STOPS AT THE BOUNDARY and reports — it never decides and continues.

════════ COST DISCIPLINE ════════
· Parallel delegates go out in ONE message. One verification run per delegate — re-running
  to feel sure is banned. Budget exceeded = kill it, split the brief in two, relaunch;
  never raise a budget silently. Compact between phases: keep decisions, drop raw findings.

════════ AUTONOMY ════════
Run A–D in parallel, join, then run E. Do not ask me to proceed. Append the ledger BEFORE
compacting. A failed gate spawns ONE atomic fix delegate per defect (write-set = the
offending file + its test), re-verified by a delegate that did not write the fix; 3 cycles
max per defect → rewrite the unit → still failing → §DEFERRED with reversal cost, continue.

════════ HARD LINES ════════
⛔ NO GIT — no commit/push/branch/tag/hooks, and never suggest it. Git is Mati's.
⛔ NO DEPLOY, no Vercel/DNS/publish. ⛔ NO rm — quarantine to _legacy/ with a reason.
⛔ NO SECRET VALUES in any file — env var NAMES only. ⛔ Zero writes to ~/project/ravid_website1.
⛔ No _v2/_new/_final files — edit in place. ⛔ No invented fact about Tuval or Ravid:
   numbers, institutions, testimonials, ranks, availability and dates are copied or absent.
   Translation and public unit names are NOT inventions (see delegate D).
⛔ NOT THIS SESSION: no redesign, no new sections, no dependency upgrades, no touching the
   approved live copy, no reordering anything.

════════ THE WORK — 4 delegates in parallel, then 1 verifier ════════

A) Task(model="opus") — PRIVACY NOTICE · write-set: components/sections/PrivacyNotice.tsx,
   the lead-form section that must render it, i18n/messages.ts, messages/he.json,
   messages/en.json, and their tests. Budget 80k / 25 min.
   Defect: the component exists and is NOT rendered — confirmed absent on the live page.
   Bereaved families type name, phone and email and are told nothing.
   · Render it beside the lead form in BOTH locales.
   · i18n/messages.ts is a strictObject: the schema key and the catalogue key must be added
     in the SAME edit, or the site goes down. Write a test that FAILS when only one exists
     (prove it red before trusting it).
   · Content: what is collected · why · where it is stored · how long it is kept · how to
     ask for deletion · the contact address. Hebrew is the source, English is its translation.
   · Assert the notice is in the SERVED bytes of /he and /en, not that a component exists.

B) Task(model="opus") — LEAD READ-BACK & LOSS ALARM · write-set: lib/leads/** (read paths
   only), app/api/admin/leads/route.ts (or equivalent), a CLI script under scripts/, tests.
   Budget 90k / 30 min.
   Defect: nothing in the repo ever reads a stored lead back, so a loss is silent forever.
   · A protected read path (token from an env var NAME; no token = 401, never a listing) that
     lists stored leads with their deliveryState.
   · A reconciliation counter: stored vs notified vs failed. A mismatch must be visible.
   · Prove it CAN fail: kill the mailer, store a lead, show the mismatch surfacing; then
     prove the unauthenticated request returns 401 and leaks nothing.

C) Task(model="opus") — FORM SECURITY · write-set: app/api/lead/route.ts, middleware.ts,
   components/sections/LeadForm.tsx, their tests. Budget 90k / 30 min.
   Two defects: (1) text/plain POSTs are accepted from any page on the internet;
   (2) with JavaScript disabled the form puts name, phone, email and message in the URL.
   · Enforce content type + same-origin (Origin/Sec-Fetch-Site or a token). A cross-origin
     or text/plain POST must fail closed.
   · The no-JS path must never place personal data in a URL — POST, or no no-JS submit at all
     with the WhatsApp route shown instead. Decide with the four-part test and record it.
   · PROVE BY ATTACK against the running server, not by reading the code: a real cross-origin
     POST, a real text/plain POST, a real no-JS submit with JS disabled in the browser.

D) Task(model="opus") — CONTENT DERIVE (no Ravid needed) · write-set: messages/he.json,
   messages/en.json, i18n/messages.ts, the alt-text call sites, app/[locale]/not-found.tsx,
   app/not-found.tsx, their tests. Budget 80k / 25 min.
   These were wrongly blocked as "needs the family". Translation and public unit names are
   not inventions. Derive them, use them, and flag each for later confirmation.
   · BADGE NAMES: reuse the EXISTING English catalogue strings first — the site already says
     "Barak Brigade (188)" and "Battalion 53". Only two are new: פלוגת גולן → "Golan Company",
     סופה → "Sufa". Nothing about Tuval's service is restated.
   · HEBREW 404, from the site's own motto:
       title  : 404 — הדף לא נמצא
       body   : לא מצאנו את העמוד שחיפשתם — אבל בסוף הכל יהיה בסדר
       action : חזרה לעמוד הבית
     English keeps its existing wording. FIX THE LATENT REGRESSION IN THE SAME EDIT: the two
     catalogues are currently identical, which is the only reason /en/* 404s look correct —
     add a test that fails if he and en 404 copy are byte-identical again.
   · ALT TEXT: translate the 6 Hebrew alts into English. An alt describes a photo; it asserts
     nothing. No new claim, no rank, no institution.
   · Every derived string goes in ONE place and is logged in the ledger under §CONFIRM-LATER
     (not §OPEN) with file:line, so a correction from Ravid is one edit.

E) Task(model="opus") — INDEPENDENT VERIFIER (launch only after A–D join; it wrote none of
   this) · write-set: REPORT_W16.md only. Budget 120k / 40 min.
   · Replay everything: npx tsc --noEmit · npm run lint · npx vitest run · npm run e2e ·
     npm run build twice from clean. Report replayed / still failing / NEWLY failing, with
     skips counted SEPARATELY from passes.
   · Composition pass in a real browser (the bg-gold lesson): /he and /en × mobile+desktop —
     the privacy notice is visible with real computed styles, every CTA and form field still
     renders, focus rings are alive, the 404 copy differs between locales.
   · Adversarial: cross-origin POST · text/plain POST · no-JS submit · unauthenticated
     read-back · mailer down · duplicate idempotency key · missing message key. For each:
     PRESENT · ABSENT · NOT-MEASURED.
   · A verifier REPORTS; it never repairs. Each defect returns as its own atomic fix delegate.

════════ GATES (seat-measured, by number) ════════
 · privacy notice present in the served bytes of /he AND /en, with computed styles
 · a catalogue key without its schema key fails a test (proved red)
 · read-back returns 401 unauthenticated; a mailer failure surfaces as a counter mismatch
 · cross-origin POST fails closed · text/plain POST fails closed · no-JS submit puts zero
   personal data in the URL — all three proved by attacking the running server
 · he and en 404 copy are no longer byte-identical, and a test enforces that
 · tsc 0 · lint 0/0 · vitest 0 failed · e2e passes · build ×2 exit 0 with identical route hash

════════ FINISH BY ════════
 · Table: what changed · how it was proved · counts before/after
 · Verification counts per cycle: replayed · still failing · NEWLY failing (skips separate)
 · What survived INDEPENDENT verification — that list alone is "done"
 · DECISIONS: alternatives priced AND the cost of reversing each
 · §CONFIRM-LATER: every derived string with file:line · §OPEN: what remains · §DEFERRED:
   each with what would close it
 · Update STATUS_DASHBOARD.html and the ledger (D-157 onward, no gaps)
 · ONE LINE: the first action owed to Mati.

START NOW with A–D in one message. Do not reply with a plan or a question — launch it.
```
