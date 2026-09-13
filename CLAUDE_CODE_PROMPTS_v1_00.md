# 🧭 CLAUDE CODE PROMPTS — ravid_website rebuild · v1.01
**v1.01 adds §⑤b ARCHITECTURE LAW (right architecture or nothing · never patch over patch · never ask to do it worse) and the OVERNIGHT autonomous mode — see OVERNIGHT_RUN_v1_00.md.**
**Owner** Mati · 2026-09-12 · **Law** every block below obeys `PROMPT_RULES_v1_00.md` (7 laws · skeleton ①–⑨)
**How to use:** paste ONE wave block per Claude Code turn. Wait for its FINISH-BY table. Then paste the next.

---

## §🅹 PROJECT PROFILE (fill-once — already true for every block below)
```
PROJECT:        ravid_website — memorial + lecture-booking site for סמ"ר תובל יעקב צנעני ז"ל
LIVE DOCUMENTS: /home/mati/Downloads/PROMPT_RULES_v1_00.md   (the law)
                ~/project/ravid_website/REBUILD_PLAN_v1.00.md (the design)
                ~/project/ravid_website/REBUILD_STATUS_v1_00.md (the ledger — W1 creates it)
                ~/project/ravid_website1/src/i18n/translations.ts (the CONTENT source of truth)
TRUTH LIVES IN: REBUILD_STATUS_v1_00.md — one fact, one place. No second copy of any count.
HARD LINES:     ⛔ NEVER git — no commit/push/branch/tag/hooks, never suggest it. Git is Mati's.
                ⛔ ~/project/ravid_website1 (customer's Lovable repo) is READ-ONLY. Zero writes.
                ⛔ Never delete — quarantine into _legacy/ with a one-line note why.
                ⛔ Never invent or round a memorial fact: names, dates, unit, numbers are
                   copied verbatim from translations.ts or they are NOT-MEASURED.
                ⛔ No deploy, no Vercel, no DNS, no npm publish, no .env secrets written.
                ⛔ No _v2/_new/_final files. Edit in place.
HUMAN-ONLY:     git · deploy · /model /effort /goal /loop (Claude cannot type them) ·
                answering the 5 customer questions · spend decisions · quarantine approval
VERIFICATION:   npx tsc --noEmit  ·  npm run lint  ·  npm run build  ·  npx vitest run  ·
                npx playwright test   — reported BY NUMBER, skips counted SEPARATELY
```

## ③ MODEL POLICY — paste inside every wave
```
MODEL POLICY (PROMPT_RULES §🅲)
· THE SEAT = this Claude Code session. It is the orchestrator. IT TOUCHES NO FILES:
  it launches Task delegates, joins them, judges, and writes only REBUILD_STATUS_v1_00.md.
· EVERY delegate that reads, writes, analyses or attacks = STRONG → Task(model="opus").
· Mechanical, fully-specified work (counting, formatting, running a fixed command,
  renaming, image conversion) = FAST → Task(model="sonnet"); trivial listing → "haiku".
· A delegate is NEVER frontier. A delegate that meets a judgement its brief did not
  settle STOPS AT THE BOUNDARY and reports — it never decides and continues.
· Effort: xhigh for W1 (audit) and W3 (i18n design) only. Drop to normal from W4 on —
  those waves execute briefs already written. (Mati sets /effort; Claude cannot.)
· Compact between waves: keep the decisions, drop the raw findings.
```

## ④ COST DISCIPLINE — paste inside every wave
```
COST DISCIPLINE — the seat is the cheapest thing here.
· Seat launches/joins/judges. Every read, grep and check is delegated.
· One verification run per delegate. Re-running to feel sure is the costliest habit.
· Parallel delegates in ONE message (they run concurrently). Never serial fan-out.
· Budget is stated per delegate below. Exceeding it = stop and report, not continue.
```

## ⑤ THE STANDARD (four-part test) + ⑦ PROOF — paste inside every wave
```
THE STANDARD: every fix/section declares 1 INVARIANT · 2 IMPOSSIBLE (what can no longer
be constructed) · 3 CLASS (derivation or this instance only) · 4 HONEST LIMIT (in its own
header). All four → ARCHITECTURE. Fewer → it is a PATCH and must say PATCH and why.
NON-CONVERGENCE: if a fix opens NEW problems, step UP a level (check → type → remove the
capability). After 3 cycles still opening new ones: record "not closable at this level",
DEFER with its reversal cost, move on.

PROOF STANDARD
· DENOMINATOR BEFORE VERDICT: how many exist · how many examined · how many changed.
  An empty sweep reports CANNOT TELL — never "none found".
· EVIDENCE MUST BE ABLE TO FAIL: prove each check RED once (break it on purpose) before
  trusting its GREEN. A check that cannot go red is decoration.
· THREE STATES always: PRESENT · ABSENT · NOT-MEASURED. Never let NOT-MEASURED take the
  branch that measured-ABSENT takes. A skipped test is not a passed test.
· NEVER LET THE BUILDER GRADE THE BUILD: W7 verifiers must be delegates that did not
  write the code they check, replaying the original test set.
· VERIFY THE PREMISE — INCLUDING MINE: every number in REBUILD_PLAN_v1.00.md (594 lines,
  26 assets, 8.7 MB, 49 ui files, 13 sections) is a CLAIM. Check it. If false: report,
  stop, do not execute.
```


## ⑤b ARCHITECTURE LAW — paste inside every wave (Mati's standing order)
```
ARCHITECTURE LAW — NON-NEGOTIABLE, OUTRANKS SPEED, SCOPE AND TOKEN BUDGET.
· RIGHT ARCHITECTURE OR NOTHING. Tight, single-purpose, derived. If the correct
  solution requires deleting and rewriting a unit that was just written — REWRITE IT.
  A rewrite that is correct is cheaper than a patch that is not.
· NEVER PATCH OVER A PATCH. A second fix on the same spot is forbidden: step UP one
  level instead — check → type → remove the capability that could be wrong at all
  (PROMPT_RULES §🅴 non-convergence). Third cycle on the same spot = rewrite the unit.
· NEVER ASK PERMISSION TO DO IT WORSE. Do not offer Mati "quick vs proper", "patch now,
  refactor later", "should I skip X", or "do you want me to also do it right". The
  answer is permanently: DO IT RIGHT, REWRITE IF NEEDED. Asking that question is itself
  a defect — choose the correct architecture and report what you chose and why.
· NO PARTIAL LANDING. A unit is done when it is correct, tested and independently
  verified — not when it renders. Half-done is recorded as NOT DONE, never as done-ish.
· ONE FACT ONE PLACE, ALWAYS. Any value that could change (handle, email, phone, number,
  domain) lives in ONE typed constant/message key. Never inline it twice. This is what
  makes a late answer cost one edit instead of a hunt.
· DELETE DEAD THINGS. No unused file, no unimported component, no "maybe later" export
  left in the tree (quarantine to _legacy/ with a reason — never rm).
· HONEST LIMIT IN THE FILE HEADER. What this unit does NOT do is written down, not implied.
```

---
# ⑥ THE WORK — 8 waves. Each JOINS before the next.

## ▶️ W1 — RECON (read-only) · effort xhigh
```
TITLE+SCOPE: W1 RECON of ravid_website (ours) + ravid_website1 (customer's Lovable build).
READ-ONLY WAVE. Produce facts and the ledger. NOTHING ELSE.
⛔ NOT THIS SESSION: no scaffolding, no npm install, no file creation outside the two
   outputs named below, no edits to any existing file, no git, no deploy.

READ FIRST: PROMPT_RULES_v1_00.md · REBUILD_PLAN_v1.00.md

[PASTE: MODEL POLICY] [PASTE: COST DISCIPLINE] [PASTE: THE STANDARD + PROOF] [PASTE: ARCHITECTURE LAW]

DELEGATES — launch all 3 in ONE message, concurrently:
 A) Task(model="opus", "INVENTORY-OURS") — write-set: NONE (read-only).
    Budget 60k tokens / 15 min. Read ~/project/ravid_website. Report BY NUMBER:
    files, lines per file, the 8 sections in TuvalMemorialLanding.tsx with line ranges,
    every hardcoded Hebrew string count, every external link, config claims true/false
    (is `i18n{}` really in next.config.js? is Analytics.tsx really unimported?).
 B) Task(model="opus", "INVENTORY-CUSTOMER") — write-set: NONE. READ-ONLY REPO.
    Budget 80k / 20 min. Read ~/project/ravid_website1. Report BY NUMBER: sections and
    their order, which shadcn ui/* files are actually imported (denominator = all 49),
    every translation key with he+en presence (PRESENT/ABSENT per key), every external
    URL, the form's real endpoint, every Lovable artefact (tagger, og:image, author).
 C) Task(model="sonnet", "ASSET+CONTENT DIFF") — write-set: NONE.
    Budget 40k / 10 min. Mechanical: list all assets with exact bytes and dimensions
    (denominator first), and a side-by-side table of every number/name/handle that
    DIFFERS between the two repos (e.g. soldiers 300+ vs 1000+, instagram handle).

SEAT WRITES (only these two files):
 · REBUILD_STATUS_v1_00.md  — the ledger: one table per wave, counts, PRESENT/ABSENT/
   NOT-MEASURED per item, open questions. This is the ONLY place counts live.
 · REPORT_W1.md — the three delegate reports merged, contradictions flagged.

FINISH BY: table (what was examined / denominator / what was found) · every premise from
REBUILD_PLAN_v1.00.md marked CONFIRMED | FALSE | CANNOT-TELL · DECISIONS with reversal
cost · DEFERRED with what would close each · OPEN list · one line: first action owed to Mati.
```

## ▶️ W2 — SCAFFOLD · effort normal
```
TITLE+SCOPE: create the Next.js App Router skeleton in ~/project/ravid_website and
quarantine the old structure. NO section content yet.
⛔ NOT THIS SESSION: no sections, no i18n messages, no images, no form logic, no git.
READ FIRST: REBUILD_STATUS_v1_00.md (the ledger) · REBUILD_PLAN_v1.00.md §2
[PASTE the 4 blocks: MODEL POLICY · COST DISCIPLINE · STANDARD+PROOF · ARCHITECTURE LAW]
DELEGATES:
 A) Task(model="opus", "SCAFFOLD") — write-set: package.json, tsconfig.json,
    next.config.js, tailwind.config.ts, postcss.config.js, app/layout.tsx,
    app/globals.css, lib/utils.ts, components.json. Budget 80k / 25 min.
    Next.js App Router + TS strict + Tailwind; design tokens = the customer's HSL palette
    copied verbatim from ravid_website1/src/index.css; Heebo font self-hosted or next/font.
    REMOVE the dead i18n{} key from next.config.js. No Lovable deps.
 B) Task(model="sonnet", "QUARANTINE") — write-set: _legacy/** only. Budget 20k / 8 min.
    mv (never rm) the old monolith + docs/* + .next into _legacy/, add _legacy/WHY.md
    naming each moved file and the reason. Nothing outside _legacy/ may be touched.
GATE: npm run build green on an empty page · 0 files deleted (prove by count) ·
ledger updated by the seat.
```

## ▶️ W3 — i18n CORE · effort xhigh
```
TITLE+SCOPE: locale routing + typed messages. he + en. RTL/LTR. No section markup.
⛔ NOT THIS SESSION: no visual sections, no new copy, no translation authored by an agent —
   every string is COPIED from ravid_website1/src/i18n/translations.ts or it is NOT-MEASURED.
READ FIRST: REBUILD_STATUS_v1_00.md · ravid_website1/src/i18n/translations.ts
[PASTE the 4 blocks: MODEL POLICY · COST DISCIPLINE · STANDARD+PROOF · ARCHITECTURE LAW]
DELEGATES:
 A) Task(model="opus", "I18N-ROUTING") — write-set: i18n/**, middleware.ts,
    app/[locale]/layout.tsx, app/[locale]/page.tsx (placeholder), app/[locale]/not-found.tsx.
    Budget 90k / 30 min. next-intl: /he + /en, dir=rtl|ltr on <html>, lang attr, hreflang,
    / → /he redirect. Typed message keys (no `any` anywhere — that is the customer's defect).
 B) Task(model="sonnet", "MESSAGE EXTRACTION") — write-set: messages/he.json, messages/en.json.
    Budget 60k / 20 min. Mechanical: translations.ts → two JSON files, arrays stay arrays,
    key names preserved. Report denominator: keys in he · keys in en · keys missing on
    either side listed individually (PRESENT/ABSENT).
GATE: /he and /en both render · dir flips · key-count he == key-count en, or the diff is
listed in the ledger as OPEN.
```

## ▶️ W4 — SECTIONS · 13 atomic delegates · effort normal
```
TITLE+SCOPE: one delegate per section. Each writes exactly ONE component + its test.
⛔ NOT THIS SESSION: no new copy, no design invention, no touching another section's file,
   no images beyond referencing the paths W6 will produce, no git.
   ⚠️ UNANSWERED CUSTOMER QUESTIONS DO NOT STOP THIS WAVE (overnight mode). Policy:
      every uncertain value lives in ONE typed constant (config/site.ts or a message key),
      seeded from ravid_website1 (the customer's own newest build = the only permitted
      source), and logged in REBUILD_STATUS_v1_00.md §OPEN as "one-edit item: <file:line>".
      Never invent a memorial fact; never duplicate the value anywhere.
READ FIRST: REBUILD_STATUS_v1_00.md · REPORT_W1.md · the matching customer component
[PASTE the 4 blocks: MODEL POLICY · COST DISCIPLINE · STANDARD+PROOF · ARCHITECTURE LAW]
DELEGATES — 13 × Task(model="opus"), launched in batches of 4-5 in ONE message each.
  Budget 70k / 20 min EACH. One write-set each, nothing shared:
   1 components/sections/Hero.tsx          2 Story.tsx        3 Military.tsx
   4 LecturesPreview.tsx                   5 Stats.tsx        6 WhatYouGet.tsx
   7 HowItLooks.tsx                        8 Testimonials.tsx 9 Why.tsx
  10 Wine.tsx                             11 LeadForm.tsx    12 Footer.tsx
  13 LanguageSwitcher.tsx
  Each delegate also writes ONLY its own test file components/sections/__tests__/<name>.test.tsx.
  Rules per delegate: server component unless it needs state ('use client' allowed only in
  LeadForm + LanguageSwitcher); zero hardcoded copy (message keys only); logical CSS
  properties (ps/pe/ms/me) so RTL↔LTR flips; next/image only; declare the four-part test
  in the file header.
GATE: each section's own test green · grep proves 0 hardcoded Hebrew in components/sections/
· seat records 13/13 with any FAILED named individually.
```

## ▶️ W5 — PLATFORM · 3 delegates · effort normal
```
TITLE+SCOPE: lead delivery, SEO, analytics.
⛔ NOT THIS SESSION: no secrets in files (env var names only), no sending real mail to the
   customer, no third-party script beyond the one analytics id placeholder, no git.
[PASTE the 4 blocks: MODEL POLICY · COST DISCIPLINE · STANDARD+PROOF · ARCHITECTURE LAW]
DELEGATES — 3 in ONE message:
 A) Task(model="opus", "LEAD API") — write-set: app/api/lead/route.ts, lib/validation.ts,
    app/api/lead/__tests__/*. Budget 70k / 20 min. POST → zod → email provider behind an
    interface (provider key from env, NEVER written to a file) → 200/4xx; WhatsApp
    deep-link fallback preserved. PROVE THE CHECK CAN FAIL: a test that posts invalid
    input and asserts 4xx, and one that simulates provider failure.
 B) Task(model="opus", "SEO") — write-set: app/sitemap.ts, app/robots.ts,
    app/opengraph-image.tsx, lib/seo.ts, app/[locale]/layout.tsx (metadata only).
    Budget 60k / 20 min. Per-locale metadata + hreflang + our own OG image.
    0 references to lovable.dev (prove by grep count).
 C) Task(model="sonnet", "ANALYTICS") — write-set: components/Analytics.tsx, lib/analytics.ts.
    Budget 30k / 10 min. Mechanical: GA4 via next/script, id from env, renders nothing when
    unset, imported in app/[locale]/layout.tsx. (Our old repo's defect was: it existed and
    was never imported — assert the import in a test.)
GATE: lead POST 200 in test + 4xx proven · grep lovable == 0 · analytics import asserted.
```

## ▶️ W6 — ASSETS · effort normal
```
TITLE+SCOPE: image pipeline. 26 source assets → optimized public/images.
⛔ NOT THIS SESSION: no crops or edits that change content, no new imagery, no AI-generated
   photo, no deleting originals (they stay in the customer repo, which is READ-ONLY), no git.
[PASTE the 4 blocks: MODEL POLICY · COST DISCIPLINE · STANDARD+PROOF · ARCHITECTURE LAW]
DELEGATE: Task(model="sonnet", "ASSET PIPELINE") — write-set: public/images/**,
 scripts/optimize-assets.mjs. Budget 50k / 20 min.
 Mechanical: copy from ravid_website1/src/assets (read-only source) → sharp → webp (+avif
 where it wins), ≤300 KB each, keep aspect ratio, generate a manifest with before/after
 bytes. Denominator first: 26 in · N out · any file that could not hit 300 KB listed with
 its final size (NOT-MEASURED is not an option here — every file gets a number).
GATE: manifest table 26/26 · total page weight estimate ≤1.5 MB · hero has priority.
```

## ▶️ W7 — INDEPENDENT VERIFY · 3 delegates · effort normal
```
TITLE+SCOPE: verification by delegates that WROTE NONE OF THIS (law 4). Replay the full set.
⛔ NOT THIS SESSION: no fixes. A verifier that finds a defect REPORTS it; it does not repair.
   Fixes come back as their own atomic delegate in W7b, one defect per delegate.
[PASTE the 4 blocks: MODEL POLICY · COST DISCIPLINE · STANDARD+PROOF · ARCHITECTURE LAW]
DELEGATES — 3 in ONE message, all fresh contexts:
 A) Task(model="opus", "STATIC VERIFY") — write-set: REPORT_W7_static.md only.
    npx tsc --noEmit · npm run lint · npm run build · npx vitest run.
    Report replayed · still failing · NEWLY failing. Skips counted SEPARATELY from passes.
 B) Task(model="opus", "VISUAL VERIFY") — write-set: REPORT_W7_visual.md, tests/e2e/**,
    artifacts/screenshots/**. Playwright: /he and /en × mobile+desktop = 4 screenshots,
    compared against the customer's design; every difference listed, not summarised.
 C) Task(model="opus", "ADVERSARIAL") — write-set: REPORT_W7_adversarial.md only.
    Attack it: missing message key, empty form, oversized payload, JS off, RTL overflow,
    404 locale, provider down. For each: PRESENT (handled) · ABSENT (broken) · NOT-MEASURED.
GATE: only what survived INDEPENDENT verification counts as done — that list is the answer.
```

## ▶️ W8 — HANDOFF · effort normal
```
TITLE+SCOPE: the 5-doc handoff + delta + tarball. No code changes.
⛔ NOT THIS SESSION: no code edits, no archiving of prior versions (Mati archives), no git.
[PASTE the 4 blocks: MODEL POLICY · COST DISCIPLINE · STANDARD+PROOF · ARCHITECTURE LAW]
DELEGATE: Task(model="sonnet", "HANDOFF") — write-set: README.md, MASTER_PLAN.md,
 START_HERE.md, STATUS_DASHBOARD.html, SESSION_2_DELTA.md (NEW), dist tarball.
 Budget 60k / 20 min. All five updated together; counts are READ from
 REBUILD_STATUS_v1_00.md, never re-typed (one fact, one place).
FINISH BY: changed/proved/counts table · verification counts per cycle (replayed · still
failing · NEWLY failing) · what survived independent verification · DECISIONS with reversal
costs · DEFERRED with closers · OPEN items · one line: the first action owed to Mati.
```

---
## 🅷 PRE-PASTE CHECKLIST (the seat confirms before each wave)
- [ ] delegate write-sets named · budgets stated · NOT-THIS-SESSION present
- [ ] mechanical → sonnet/haiku · judgement → opus · seat touches no files
- [ ] compact between waves · effort xhigh only W1+W3
- [ ] every plan number treated as a CLAIM to verify (law 7)
- [ ] denominators, three states, builder≠grader all in the pasted text
- [ ] FINISH BY asks reversal costs
- [ ] §⑤b ARCHITECTURE LAW pasted — no "quick vs proper" question is ever asked
