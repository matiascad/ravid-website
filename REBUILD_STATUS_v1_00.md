# REBUILD STATUS — ravid_website · v1.00 (THE LEDGER)
**TRUTH LIVES HERE.** One fact, one place. No count is duplicated in any other document; every other
doc READS from this one. Law: `PROMPT_RULES_v1_00.md` · Design: `REBUILD_PLAN_v1.00.md` · Waves:
`CLAUDE_CODE_PROMPTS_v1_00.md` v1.01 · Mode: OVERNIGHT AUTONOMOUS (`OVERNIGHT_RUN_v1_00.md`)

> ## ▶ FIRST ACTION OWED TO MATI
> **Ask the family three questions. They are the only places this site still says something it cannot fully stand behind.**
> **§OPEN 7** — the three hero unit badges (`סמל חטיבה 188`, `פלוגת גולן`, `סמל סופה`) exist **only in Hebrew**; the English page shows Hebrew. **§OPEN 9** — there is **no Hebrew 404 copy anywhere in the customer's material**, so both catalogues currently hold their English. **The `imageAlts` question** — 6 images serve Hebrew `alt` text on the English page. In all three cases an agent could have invented English and **deliberately did not**: inventing a fallen soldier's unit name, or words for his memorial, is the one thing no delegate was ever permitted to do.
> ⚠️ **Do §OPEN 9 knowingly:** writing the Hebrew 404 copy also *reveals* a latent regression — today `/en/*` 404s look correct only because both catalogues hold identical English. The moment Hebrew exists, English visitors will see it. That trade bought static prerendering for every visitor (**D-26/D-27 and §W7**, not D-40/D-41 — corrected after W8-A rendered the citation exactly as it found it and flagged it rather than silently fixing it) and is documented, not accidental.
>
> Everything else is closed and independently verified. **§OPEN carries 13 numbered rows; the ones still needing an answer are the three above plus the one-edit constants below** — each
> seeded from the customer's own newest build (`ravid_website1`) and wired to **one typed constant at a named
> `file:line`** — so each answer costs exactly one edit. Nothing is blocked; nothing was invented.
> The loudest is the Instagram handle: our repo says **`ravid._.t`** (7 places), the customer's newest build says
> **`ravid_.t`** (2 places). One character apart, and **both are Mati's own sources** — W1 could not settle it,
> and no delegate was willing to guess. It is seeded from the customer's build at `config/site.ts:78`.

---

## §WAVES — status board

| Wave | Delegates | Status | Gate | Verdict |
|---|---|---|---|---|
| W1 RECON | 3 (2 opus, 1 sonnet) | **CLOSED** | REPORT_W1.md exists, premises verified | **PASS** |
| W2 SCAFFOLD | 4 + 5 fixes + 3 gate passes | **CLOSED** | build ✔ tsc ✔ lint ✔ vitest ✔ · 0 deleted ✔ | **PASS** |
| W3 i18n CORE | 12 (A–L) + 2 gate passes | **CLOSED** | /he+/en 200 ✔ · dir flips ✔ · key parity ✔ | **PASS** |
| W4 SECTIONS | 13 + ALT + 3 fixes + compose | **CLOSED** | 13/13 both locales ✔ · 0 Hebrew in sections ✔ | **PASS** |
| W5 PLATFORM | 3 + 5 fixes + 2 gate passes | **CLOSED** | lead 422/503/405 ✔ · OG 200 PNG 1200×630 ✔ · 0 ⚠ ✔ | **PASS** |
| W6 ASSETS | 1 + 1 fix | **CLOSED** | manifest 25/25 ✔ · 25/25 resolve 200 ✔ · **first-paint 0.218 MB ✔** | **PASS** |
| W7 VERIFY | 3 + 6 fixes + 2 gate passes | **CLOSED** | prerender ✔ · button 9.04:1 ✔ · 35/35 headers ✔ · 13/13 routes ✔ | **PASS** |
| W8 HANDOFF | 4 | **CLOSED** | 5 docs ✔ · dashboard ✔ · tarball ✔ · 0 deleted ✔ | **DONE** |

---

## §W1 — RECON (read-only) · CLOSED · PASS

**Delegates** A `INVENTORY-OURS` (opus) · B `INVENTORY-CUSTOMER` (opus) · C `ASSET+CONTENT DIFF` (sonnet)
**Files written by delegates: 0.** Files written by the seat: 2 (`REPORT_W1.md`, this ledger).
**Zero writes to `~/project/ravid_website1`** — confirmed by all three briefs and by write-set = NONE.

### Counts
| Metric | Denominator | Examined | Value |
|---|---|---|---|
| Our repo files | 43 | 43 | 35 text + 8 binary; 34 git-tracked |
| Our monolith | 1 | 1 (full read) | **594 lines**, 32,927 B, **10 visual blocks** |
| Our hardcoded-Hebrew files | 11 code/config | 11 | **2 files · 120 lines · 122 runs** |
| Our lead-delivery paths | 11 code files | 11 | **0** (measured-ABSENT) |
| Our test files + test config | 43 | 43 | **0** (measured-ABSENT) |
| Our `public/` weight | 8 files | 8 | **1,003,383 B (1.00 MB)** |
| Customer repo files | 124 | 124 | full tree |
| Customer sections (render sites) | 13 | 13 | **13** — plan's 13 names match 1:1 |
| Customer `ui/*` | **49** | 49 | **4 reachable · 12 with any edge · 37 dead** |
| Customer translation keys | 65 top-level ×2 | 130 | **120 leaves each · 0 one-sided** |
| Customer assets | **26** | 26 | **8,113,564 B (8.11 MB) · 25 live · 1 dead** |
| Media files, both repos | 39 | 39 | all bytes measured; 38/39 dimensions (1 SVG is vector) |
| Lovable artefacts | whole repo | all | **17 source hits / 5 files** |
| **Three-state tally** | | | **PRESENT 54 · measured-ABSENT 18 · NOT-MEASURED 8** |

### Premises verified (law 7) — 36 plan claims checked
**CONFIRMED 22 · FALSE 8 · CANNOT-TELL 3 · SPLIT 1 · NOT-MEASURED 2.**

The 8 FALSE, with the true value:
| # | Plan said | Truth |
|---|---|---|
| 1 | our monolith has **8 sections** | 8 `<section>` tags, **10 top-level visual blocks** (14 with nested) |
| 2 | email `ravidtzanani6@gmail.com` is in our repo | our repo has **no email address at all** |
| 3 | formsubmit.co is our form risk | our repo has **no delivery path whatsoever** — strictly worse |
| 4 | stack is Next.js 15 | repo pins **`next@^14.0.4`** — a major upgrade, unbudgeted in plan §4 |
| 5 | image weight is our risk | our `public/` is **1.00 MB**, already inside the 1.5 MB budget |
| 6 | customer assets ≈ **8.7 MB** | **8,113,564 B = 8.11 MB** (plan used block-rounded `du`, ~7% high) |
| 7 | **~13** shadcn files used | **4** reachable from `main.tsx`; **0** used by any of the 13 sections |
| 8 | "Knesset/media" is one migrated fact | media is a string; **Knesset exists only as an image filename**, never as text |

3 CANNOT-TELL: the `_legacy/` manifest (closed by D-1 below) · DoD #6's Hebrew grep (vacuous until `components/sections/` exists) · the domain (**zero occurrences in EITHER repo**).

### Gate
`REPORT_W1.md` produced · every plan premise marked · every zero-result check red-proved (22 proofs)
· denominators before every verdict · three states never collapsed · **0 files created or edited by any
delegate** · **0 writes to the customer repo**. → **GATE PASS.**

### Budget ledger — W1 (all three delegates overran; not silently forgiven)
| Delegate | Briefed | Actual | Factor |
|---|---|---|---|
| A INVENTORY-OURS | 60k | 80,921 | **1.35×** |
| B INVENTORY-CUSTOMER | 80k | 101,557 | **1.27×** |
| C ASSET+CONTENT DIFF | 40k | 84,495 | **2.11×** |
| **W1 total** | 180k | **266,973** | **1.48×** |
Handled per OVERNIGHT_RUN rule 5: budgets are **not** raised. From W2 on, any brief whose W1 evidence
shows it exceeds ~1.3× its stated budget is **SPLIT into two smaller briefs** instead. See D-9.

---

## §W2 — SCAFFOLD · **DONE** · gate PASS on pass 3 of 3, independently verified

**Delegates** A1 `SCAFFOLD-CONFIG` (opus) · A2a `SHELL+TOKENS` (opus) · A2b `CONSTANTS` (opus) ·
B `QUARANTINE` (sonnet, +1 increment) · **GATE** `INDEPENDENT BUILD GATE` (opus, wrote none of it).

### What landed
| File | Action | Lines |
|---|---|---|
| `package.json` | rewritten | 52 | 
| `tsconfig.json` | rewritten | 49 |
| `next.config.js` | rewritten | 35 |
| `tailwind.config.ts` | created | 92 |
| `postcss.config.js` | rewritten | 23 |
| `components.json` | created | 21 |
| `app/globals.css` | rewritten | 111 |
| `app/layout.tsx` | rewritten | 68 |
| `app/page.tsx` | created | 38 |
| `i18n/request.ts` | created | 40 |
| `config/site.ts` | created | **164** |
| `lib/utils.ts` | created | 40 |
| `_legacy/WHY.md` | created | 18 rows |

**Stack resolved (exact):** next **15.5.25** · react/react-dom **19.3.0** · next-intl **4.14.4** · tailwindcss **3.4.19** · typescript **5.9.3** · vitest **5.0.0** · zod 4.6.2 · sharp 0.35.4 · @playwright/test 1.63.0. **478 packages added.** `lucide-react` and all 49 shadcn `ui/*` deliberately ABSENT (D-2).

### Quarantine — verified independently, not accepted
| | count |
|---|---|
| quarantined items at destination | **66** (18 files + 48 under `.next-stale-next14/`) — ⚠️ **corrected by W7-A.** This line read **65 (17 + 48)** and was stale: `_legacy/app/page-w2-scaffold-placeholder.tsx` was quarantined by W3-A *after* it was written. Not a defect — a ledger figure that outlived its measurement, which is exactly what a stale count looks like. |
| still at origin | **0** |
| **unaccounted for** | **0** — arithmetic shown both directions; git shows exactly 17 `D` entries |
| `docs/` after | **0 files** |
| bytes moved | 22,831,250 |
`_legacy/WHY.md` carries **18 rows** = 17 moved paths + the stale build dir, each with original path, reason, bytes.

### Gate results (replayed by a delegate that wrote none of the code — law 4)
| Check | Denominator | Exit | State |
|---|---|---|---|
| `npx tsc --noEmit` | 595 in program · **7 non-node_modules** · 7 clean | 0 | **PASS (weak — 7 files is the scaffold, not the repo)** |
| **`npm run build`** ← the gate | 2 routes · 4 static pages | **0** | **PASS** |
| `app/globals.css` compiled | 30,085 B emitted + linked from HTML | — | **PASS** (first time CSS was checked at all — `tsc` cannot see it) |
| `npm run lint` | **0 ESLint configs exist** | n/a | **SKIP — ABSENT, counted separately, NOT a pass** |
| `npx vitest run` | **0 test files** | 1 | **CANNOT TELL — never "passing"** |
| write-set compliance | 24 tracked + 12 untracked examined | — | **PASS — 0 files changed that no delegate declared** |
| 7 premise claims | 7 · 7 · 7 | — | **7 CONFIRMED · 0 FALSE** |

**REPLAYED 6 · STILL FAILING 0 · NEWLY FAILING 0 · SKIPPED/NOT-MEASURED 2.**

### Token contract — proved in BOTH directions, by two delegates independently
22 variables defined in `:root` · 23 distinct referenced by `tailwind.config.ts` · `--font-heebo` defined in `app/layout.tsx` by `next/font` (deliberately **not** in `:root` — putting it there would create the second source of truth the check exists to prevent). **23 = 22 + 1. Dangling 0. Dead 0.** Red-proved on a mutant with `--ring` renamed by one character: reported 2 defects at once, in both directions.

### Why W2 is NOT DONE
Gate PASS ≠ wave done. Under §⑤b **NO PARTIAL LANDING** ("correct + tested + independently verified"), a wave with **zero test harness** is not tested, and **lint has never once run** in this project. Both were recorded NOT-MEASURED, never green. Three atomic fix delegates dispatched, one defect each, named write-set each:
| Fix | Defect | Write-set |
|---|---|---|
| W2-FIX-A | `npm run lint` is a dead script — no ESLint config exists; D-13's `any` gate has nothing to run on | `eslint.config.mjs`, `package.json` (devDeps only) |
| W2-FIX-B | 0 test files, no vitest config — **W4's 13 delegates cannot each invent a harness** | `vitest.config.ts`, `vitest.setup.ts`, `lib/__tests__/utils.test.ts` |
| W2-FIX-C | `next build` roots file tracing at `/home/mati` (stray lockfile outranks the project's) | `next.config.js` |
Re-gate will be run by a delegate that wrote **none** of these fixes (autonomy rule 2).

### Contradiction between delegates — recorded, not reconciled
Two delegates measured the same command and disagreed. Both numbers and both methods are kept, because picking one silently is how a false number becomes a fact.

| Command | W2-FIX-A measured | W2-FIX-D measured | Method used by FIX-D |
|---|---|---|---|
| `npm run lint` (`next lint`) | **0 files** | **4 files** | `NEXT_TELEMETRY_DEBUG=1` → Next's own `lintedFilesCount` from `eslint.lintFiles()` |
| `next lint --dir .` | **0 files** | **12 files** | same |
| `npx eslint .` | 12 files | 12 files | `--format json`, counted |

**Adopted: FIX-D's numbers** — direct instrumentation of the tool's own counter beats inference from console output, and FIX-D supplied a mechanism that predicts its result (`next lint` with no `--dir` scans only `ESLINT_DEFAULT_DIRS` that exist on disk: `app/`, `lib/`, and an empty `components/` → 4 files). FIX-A's 0 is **unexplained and NOT reproduced**; it is not discarded, it is recorded as unresolved.
**The verdict is unchanged under either number.** The defect was never "the count is zero" — it is that `npm run lint` prints `✔ No ESLint warnings or errors` and exits 0 **without a denominator, over a subset it chose silently**. 4 of 12 is that defect, not an absence of it: it never reaches `config/site.ts`, `i18n/request.ts`, or any root config. A partial sweep announced as a clean one is what law 2 forbids.
**Second-order finding:** W2-FIX-D was handed a false premise by the seat and **stopped without executing**, exactly as law 7 requires — the second time tonight a delegate has caught an error in the seat's own brief (the first was W2-B and the 12th `docs/` file). Both were caught because the brief told the delegate to verify the premise it was given, including the seat's.


### Gate passes 2 and 3 — the regression the independent gate existed to catch
**Pass 2 (after FIX-A/B/C/D): 🔴 FAIL — 1 NEWLY FAILING.** Closing the two NOT-MEASURED checks broke a check that was green in pass 1. `npx tsc --noEmit` exited non-zero with **17 errors, all in `lib/__tests__/utils.test.ts`**: vitest injects `describe`/`it`/`expect` at runtime via `globals: true`, and nothing declared them to TypeScript.
**Why every other gate was blind to it** — vitest passes because it injects the globals itself · ESLint has no type-aware rule for undefined globals · `next build`'s type pass covers only the route graph, and no route imports a test file. **`npm run typecheck` was the only check that could see it, and it was the one check no fix delegate owned.** Two greens gained, one green lost; reporting PASS there would have been the "done-ish" §⑤b forbids.
**Closed by W2-FIX-E** — `tsconfig.json` gained `"types": ["node","react","react-dom","vitest/globals"]`. The delegate **refused the `["vitest/globals"]`-alone form despite it going green**, because `compilerOptions.types` REPLACES `@types` auto-inclusion rather than adding to it: that green would have come from silently dropping `@types/node`/`react`/`react-dom`, detonating at W5's first `process.env`. It also refused the instance-only repair (importing the three names in the test file), which would have reopened 13 times in W4.

**Pass 3: ✅ PASS — 0 still failing · 0 newly failing · 0 skipped.**
| Check | Denominator | Exit |
|---|---|---|
| `npx tsc --noEmit` | 683 in program · **15 non-node_modules** · 0 errors | 0 |
| `npm run lint` | **12 files** · 0 errors · 0 warnings | 0 |
| `npx vitest run` | 1 file · 6 tests · **6 passed · 0 skipped** | 0 |
| `npm run build` | 2 routes · 4 static pages · **0 warnings** | 0 |
| write-set compliance | 1 project file touched · 0 undeclared | — |

**The green was verified to be a real green, not a narrowed one.** Non-`node_modules` files are **set-identical** to pass 2 by `comm` (0 lost, 0 gained) — but the total program shrank 685 → 683, and the verifier named all four deltas rather than accepting the claim as worded: lost `@types/estree`, `@types/json5`, `@types/json-schema` (module-declaration-only, **zero globals**, imported by no file here), gained `vitest/globals.d.ts`. A count-only check would have hidden this. `process.env`, `__dirname` and `Buffer` were probed and all resolve.
**Strongest single proof of the night:** one `tsc` invocation, one probe file clean **and** a second file red (`TS2322`, exit 2). One green and one red in the same run is the best available evidence that a green is a checker still looking.

### W2 verdict against "correct + tested + independently verified"
· **correct** ✅ every runnable script in `package.json` exits clean · **tested** ✅ 6 real assertions, 0 skips, harness proven able to go red · **independently verified** ✅ three passes by a delegate that wrote none of the code. **W2 DONE.**

### Carried forward into W4 — not closed silently
1. `vitest.config.ts` ESM-in-CJS warning → closer: rename to `vitest.config.mts` (D-17, deferred deliberately; `"type":"module"` is FORBIDDEN — it would break the CommonJS `next.config.js`).
2. **Nothing enforces server-by-default.** `app/page.tsx` concedes it in its own HONEST LIMIT. **Low now, HIGH by W4**, where 13 delegates each decide whether to write `'use client'`.
3. `_legacy/**` vitest exclude remains pattern-only (D-16).

### Budget ledger — W2
| Delegate | Briefed | Actual | Factor |
|---|---|---|---|
| B QUARANTINE (pass 1) | 20k | 51,443 | 2.57× |
| B QUARANTINE (increment) | 8k | 55,239 cumulative | — |
| A1 SCAFFOLD-CONFIG | 50k | 80,851 | 1.62× |
| A2a SHELL+TOKENS | 40k | 69,952 | 1.75× |
| A2b CONSTANTS | 30k | 52,688 | 1.76× |
| GATE | 40k | 72,590 | 1.81× |
| FIX-A eslint | 40k | 62,391 | 1.56× |
| FIX-B vitest harness | 40k | 57,384 | 1.43× |
| FIX-C tracing root | 20k | 42,285 | 2.11× |
| FIX-D lint wiring (2 passes) | 40k | 135,042 | 3.38× |
| FIX-E tsconfig types | 25k | 56,899 | 2.28× |
| GATE passes 2+3 | 60k | 223,387 | 3.72× |
| **W2 TOTAL** | 413k | **908,728** | **2.20×** |
**Finding: the overrun is roughly constant at ~1.3–1.8× regardless of task difficulty, and the most mechanical task (quarantine, sonnet) overran the most (2.57×). The brief itself is the cost driver, not the work.** Splitting briefs (D-9) did not reduce the factor; it reduced the blast radius per delegate. Recorded, budgets still not raised.

### Operational finding — affects W7
**A subagent could not write its report file** (`REPORT_W2_gate.md`); the harness requires delegates to return findings as text. W7's brief in `CLAUDE_CODE_PROMPTS_v1_00.md` assigns `REPORT_W7_static.md` / `_visual.md` / `_adversarial.md` as delegate write-sets — **those write-sets are not executable as written.** W7 verifiers must return text and the seat persists it. Not a defect in the plan's intent, but the plan's mechanism is wrong and would have produced three failed delegates.

---

## §W3 — i18n CORE · **DONE** · gate PASS on pass 2, independently verified · 12 delegates

**Delegates** A `I18N-ROUTING` (opus) · B `MESSAGE EXTRACTION` (sonnet) · C `TYPED MESSAGE ACCESS` (opus, running) · D `LOCALISED NOT-FOUND` (opus, running).

### Landed
| File | Lines | What |
|---|---|---|
| `i18n/routing.ts` | 116 | `defineRouting` over `config/site.ts`'s `LOCALES` (**not re-declared**), `localePrefix:'always'`, total `Record<Locale,'rtl'\|'ltr'>` direction map, one navigation factory |
| `i18n/request.ts` | 145 | `requestLocale` → `hasLocale` validation → default fallback; dynamic catalogue load |
| `middleware.ts` | 70 | `createMiddleware(routing)` — **sole owner** of `/` → `/he` |
| `app/layout.tsx` | 51 | root pass-through, emits no markup |
| `app/[locale]/layout.tsx` | 128 | the one `<html lang dir>`; Heebo + `globals.css` moved here; `await params`; `generateStaticParams` |
| `app/[locale]/page.tsx` | 68 | server placeholder — W4's composition point |
| `messages/he.json` | 10,487 B | 67 keys · 127 leaves |
| `messages/en.json` | 8,686 B | 66 keys · 124 leaves |
| `app/page.tsx` → `_legacy/app/page-w2-scaffold-placeholder.tsx` | — | quarantined (`mv`); the pre-existing `_legacy/app/page.tsx` was **not** overwritten |

### Routing proved by OBSERVATION, not assertion
Build route table: `● /[locale]` with `/he` and `/en` both **prerendered SSG**; `ƒ Middleware 75.3 kB`.
Runtime (Node loopback client — `curl` is blocked in this sandbox, 30 attempts all `000`, recorded as NOT-MEASURED for curl specifically):
`/` → **307 → /he** · `/he` → 200 · `/en` → 200 · `/fr` → 307 → `/he/fr` → 404 *(not a direct 404 — recorded, not hidden)*.
**Emitted HTML:** `<html lang="he" dir="rtl">` and `<html lang="en" dir="ltr">`.

### Message extraction — byte-for-byte
**251 leaves compared · 251 identical · 0 differing.** Source parsed with Node's own engine, never retyped. Both the parity check and the round-trip check were **red-proved on a mutant** (one changed Hebrew character + one deleted key — both caught, both named).
Held the line on all four content traps: `lectureItems[3]` preserved as `""` (length 4, both locales) · the he/en thousands-comma difference copied as **data, not an error** · Hebrew quotation marks in `סמ"ר`/`ז"ל` untouched · **`heroBadges` English NOT invented** — a full-tree grep confirmed no English equivalent exists, so the key is he-only and `en.json` shows the gap honestly (see D-18).

### The customer's four measured i18n defects
| Defect (W1) | Status |
|---|---|
| `dir` never on `<html>` | **IMPOSSIBLE** — the only `<html>` lives inside `[locale]`; the root layout emits no markup. Proven by emitted HTML. |
| language invisible to URL/crawlers | **IMPOSSIBLE** — locale is a path segment resolved before React runs; both locales are prerendered static HTML; no in-memory state to reset. |
| `Translations` type declared, never applied | **IMPOSSIBLE** — `AppConfig` is global library config, proven RED twice (`'fr'` rejected, `'notFound'` rejected). |
| `t: any` | **Escape hatch gone** (ESLint error, 0 findings over 15 files) — **but key checking was INERT.** Closed by D-19, not by the augmentation. |



### W3 gate pass 2 — PASS. Measured ON THE WIRE, not inferred.
| Check | Denominator | Exit |
|---|---|---|
| `npx tsc --noEmit` | **28 non-node_modules = 21 repo + 7 `.next/types`** · 0 errors | 0 |
| `npm run lint` | **21 files examined** · 0 errors · 0 warnings | 0 |
| `npx vitest run` | 3 files · 38 tests · **37 passed · 1 skipped** | 0 |
| `npm run build` | 5 static pages · 0 errors · **0 warnings** | 0 |
**REPLAYED 4 commands + 17 wire probes + 5 ESLint stdin probes · STILL FAILING 0 · NEWLY FAILING 0 · SKIPPED 1** (legitimately inert — a runtime probe of the catalogues, not a flag).

**The three gate clauses, judged individually:** both locales 200 with a real document shell ✔ · `dir` flips — `<html lang="he" dir="rtl">` / `<html lang="en" dir="ltr">` extracted verbatim from the wire ✔ · key parity he 68/130, en 67/127, sole asymmetry `heroBadges`, **zero en-only keys**, matching D-18/§OPEN 7 ✔.

**Closed on the wire:** `/` → `/he` under **6/6** variants (none · `he-IL` · `en` · `en-US,en;q=0.9` · `fr-FR` · **and a stale `Cookie: NEXT_LOCALE=en`**) · **0 occurrences of `Set-Cookie: NEXT_LOCALE` across all 15 responses** (first wire measurement; the prior NOT-MEASURED is now measured) · all **6 of 6** 404-shaped URLs reach our own component, none gets Next's built-in page.
**The redirect test is not a tautology** — verified by inspection: it imports the real `@/middleware`, builds real `NextRequest`s, and makes 14 assertions on `location`/`status`/`setCookie`. **Zero assertions on `routing.*`.**
**Memorial-fact integrity survived 12 delegates, 4/4:** en-dash `U+0020 U+2013 U+0020` in both · `lectureItems` length 4 with `[3]===""` in both · `Over 1,400` vs `למעלה מ 1400` · **0 `\u05xx` escapes**, 3,335 literal Hebrew characters.

### The verifier withdrew THREE of its own six pass-1 defects
Two were my briefing errors (contradiction #3). **The third it withdrew unprompted:** it had reported `he.notFound`'s English copy as a defect, then found §OPEN 9 — the customer's own `NotFound.tsx` is English-only, a full grep found no Hebrew 404 copy in their material, and it was transcribed verbatim. Its conclusion: *"inventing Hebrew would have been the real defect."* It also set out to refute D-26 and **confirmed** it. Four of six pass-1 defects were real; all four are closed.

### The `tsc` file-count disagreement — resolved, not reconciled
Three delegates reported 25, 26 and 28. The gate counted from `tsconfig.tsbuildinfo`'s program `fileNames`, partitioned by path: **28 = 21 repo + 7 `.next/types`**. The spread is entirely the artefact half, which gains one file per route (W3-H's catch-all added one). **The stable number to quote is 21 repo files** — anyone citing a single unpartitioned figure will disagree with the next delegate again.

### Budget ledger — W3 (complete)
| Delegate | Briefed | Actual | Factor |
|---|---|---|---|
| A ROUTING · B MESSAGES · C ACCESSOR · D NOT-FOUND | 90/50/60/40k | 139.5k/73.0k/97.8k/94.6k | 1.55–2.37× |
| E BAN · F HEADER · G REDIRECT · H CATCH-ALL | 40/15/35/35k | 89.9k/64.5k/66.7k/84.1k | 1.91–4.30× |
| I COOKIE · J 404-SHELL · K TEST · L COMMENT | 40/40/45/15k | 78.5k/98.5k/78.3k/53.8k | 1.74–3.59× |
| GATE passes 1+2 | 45k | 226.2k | — |
| **W3 TOTAL** | 550k | **≈1,245k** | **2.26×** |

### Contradiction #2 — why the message-key augmentation is hollow. TWO accounts, UNRESOLVED.
Two delegates found two *independent* causes within an hour. Both are recorded; neither is discarded.

| | W3-A's account | W3-D's account |
|---|---|---|
| Cause | next-intl's `NestedKeyOf` collapses to `string` when **any** catalogue value is an array. Our catalogue has **10**. | `AppConfig` is a **default-exported** interface of `use-intl`, which `next-intl` only re-exports — so `declare module 'next-intl' { interface AppConfig }` declares a **new, unrelated** interface and **never merges**. |
| Evidence | Controlled A/B on the internal type: with arrays → `string`; without → a proper key union. | Read of `node_modules/use-intl/dist/types/core/AppConfig.d.ts` and next-intl's re-export chain. |
| Predicts | augmentation is **live**, key typing collapsed | augmentation is **entirely inert**, `Messages` → `Record<string, any>` |

**They cannot both be wholly right.** W3-A observed the augmentation going RED twice (`setRequestLocale('fr')` and `useTranslations('notFound')` both rejected with `TS2345`), which an entirely-inert augmentation could not do — and if `Messages` were `Record<string, any>`, `useTranslations('notFound')` would have **compiled**, yet it errors. W3-A's account fits the observations better; W3-D's is a real structural finding that may be a second, partial cause.
**RESOLVED — by measurement, in W3-A's favour, within the hour.** W3-E probed the installed code before and after editing the augmentation: `setRequestLocale('fr')` → **`TS2345: '"fr"' is not assignable to '"he" | "en"'`**, with `setRequestLocale('he')` accepted as the control. **If the augmentation did not merge, `Locale` would be `string` and `'fr'` would compile.** W3-D's "does not merge at all" account is therefore **FALSIFIED**; its observation about `AppConfig` being a default export of `use-intl` is real but is not the operative cause. **W3-A was right: the augmentation is live, and only its `Messages`/key half was collapsed by the catalogue's 10 array values.** That half has now been deleted from `i18n/request.ts` rather than left in place as a guarantee that cannot fail. The remedy (D-20) was identical under either account, so nothing done depended on resolving this — but the ledger records it closed rather than leaving a false account standing.

### Open at wave level
· `app/[locale]/not-found.tsx` did not land — W3-A refused to invent 404 copy, hardcode Hebrew, or reach into another write-set, and **stopped at the boundary with a draft parked in the scratchpad.** W3-D is closing it by sourcing the copy from the customer's own `src/pages/NotFound.tsx` (transcription, not authoring).
· A URL that never reaches `[locale]` still gets Next's un-localised 404 → DEFERRED, closer: a catch-all route + root `app/not-found.tsx`.
· `requestLocale` is `@deprecated` in next-intl 4.14.4 in favour of `next/root-params` → DEFERRED, closer: migrate when the routing contract is next opened, not mid-wave.


### Contradiction #3 — TWO gate defects were the SEAT's briefing errors, not code defects
| Gate defect | Ruling | Why |
|---|---|---|
| **#1 empty `<main />` on both locales** | **NOT A DEFECT — my brief was wrong** | I wrote *"a 200 with an empty body is not 'renders'"* into the verifier's standard, importing a CONTENT test into a wave whose scope says **"No section markup"** and whose own write-set specifies `app/[locale]/page.tsx (placeholder)`. An empty `<main/>` is exactly what W3 was scoped to produce. The delegate measured correctly and **explicitly refused to rule on the scope question**, handing it back — the right call. W3's "renders" clause is satisfied by: 200 on both locales, correct `lang`/`dir`, distinct prerendered routes. **Content is W4's gate.** |
| **#6 `tsconfig.json` on no write-set** | **NOT A VIOLATION — my brief was incomplete** | It is **W2-FIX-E's** declared file (the `"types": ["node","react","react-dom","vitest/globals"]` line), landed 20:00:58 and verified in W2 gate pass 3. I handed the W3 verifier only W3's write-sets, so it correctly reported a file it had no way to attribute. |
**Running tally of false premises caught by delegates — AS OF W3: 5. Three were mine.** ⚠️ **THIS LINE WAS NEVER UPDATED AFTER W3, and W8-A caught the seat quoting a much larger figure from memory that has no home here.** Later waves each recorded their own corrections individually (D-33 image pairing · D-34 stats desc count · D-36 route exports · D-46 gold used 12× not 3× · D-50 the TRACE diagnosis · the asset contract 24→25 · the W6 favicon size · the W7-B section count · W8-B's `npm run e2e`), but **no running total was ever maintained, so this document does not have one — and a delegate correctly refused to invent it.** The W3-era detail below stands as written (the 12th `docs/` file · the `npm run lint` file count · these two gate-brief errors), one was a stale measurement passed between delegates, one was a wrong mechanism claim. Every one was caught because each brief carries *"verify the premise you were given, including the seat's."* The cost of that instruction is a few stopped delegates; the cost of omitting it would have been a quarantine that deleted a file, a lint gate wired to the wrong premise, and W3 recorded as failed for doing exactly what it was told.

### Budget ledger — W3 so far
| Delegate | Briefed | Actual | Factor |
|---|---|---|---|
| A I18N-ROUTING | 90k | 139,503 | 1.55× |
| B MESSAGE EXTRACTION | 50k | 73,017 | 1.46× |

---

## §W4 — SECTIONS · **DONE** · gate PASS first pass · 18 delegates

| # | Section | Tests | Notable |
|---|---|---|---|
| 01 | Hero | 9 ✔ | `id="top"`; portrait `priority`; badge alts via D-18 source-locale fallback — **measured that `next/image` silently drops a `lang` prop** on next 15.5, so the wrapper carries it |
| 02 | Story | 7 ✔ | `id="story"`; refused `<q>` (its UA stylesheet would double the quote marks already inside `storyQuote`) |
| 03 | Military | 8 ✔ | 3 unit cards + 4 battle paragraphs; **0 template-string interpolation of any memorial fact** |
| 04 | LecturesPreview | 18 ✔ | the content hole: a **discriminated union** where the empty-item variant *has no `heading` field*, so an empty `<h3>` is **not representable** |
| 05 | Stats | 5 ✔ | `+1000`/`+57` asserted **byte-exact**, so a formatter producing `1,000` fails |
| 06 | WhatYouGet | 9 ✔ | 2 lists, counts derived; refused to hedge the export despite 5 of 5 siblings doing so |
| 07 | HowItLooks | 8 ✔ | **did not carry across the customer's second `any` leak** (`(f: any)`, `HowItLooksSection.tsx:20`); wrote "Knesset" nowhere — it exists only as a filename, never as catalogue copy |
| 08 | Testimonials | 9 ✔ | attribution pairing structural, not asserted — **one binding, one card** |
| 09 | Why | 7 ✔ | the booking CTA; its test reads the component's **source bytes** and asserts no literal `#` |
| ALT | image alt catalogue | — | 19 `<img>` surveyed → **6 new keys only**; 13 refused as already-catalogued, 6 as genuinely decorative |

### The measurement that justifies the whole wave's test discipline
W4-08 broke the attribution pairing on purpose (`[...m.testimonials].reverse()[index]?.name`). **The test "every text, icon and name is rendered" STAYED GREEN.** A bereaved family's quotation rendered beside the Israeli Armored Corps' name, and the obvious test passed. Only the assertion that each quote and **its own** attribution appear *within the same card element* went red. "Both present somewhere on the page" is not a test of attribution.

### Other red proofs this wave (each restored byte-identical, hash-proved)
· Stats: a plausible sign-stripper (`num.replace('+','')`) → `Unable to find an element with the text: +1000` · Why: a **real but wrong** anchor (`SECTION_IDS.story`) → `expected '#story' to be '#form'` — the failure a truthiness check sails past · Military: deleting one `desc` → caught twice, by both the render test and the dedicated drop test · LecturesPreview: re-injecting the customer's own behaviour (render every item as authored) → 7 of 18 red.

### Known fix-ups owed before composition — NOT defects in the sections
1. **Export convention (D-31).** Batch 1 shipped three conventions: `Military`/`Story` **default-only**; `Hero`/`Stats`/`LecturesPreview` **both**; batch 2 correctly **named-only**. D-31 landed after batch 1 was in flight — **my gap, not theirs.** Whatever the composition unit imports, something will not compile. **One mechanical fix-up across the divergent files.**
2. **`alt` sources.** Hero, Story and LecturesPreview used declared stopgaps (`m.heroSubtitle`, `m.storyTitle`, `m.lecturesTitle`) because no alt keys existed when they ran. W4-ALT has since landed 6 real ones. **Rule (D-29 + the survey): use `imageAlts[basename]` where a key exists, the already-catalogued key where the alt IS that key (e.g. `militaryCards[i].title`), and `alt=""` only where the customer's own build used `alt=""`.**
3. **LecturesPreview's CSS background** violates D-32 (bypasses W6's optimisation on the heaviest images). One image.


### W4 gate — PASS on the first pass. Measured on the wire.
| Check | Denominator | Exit |
|---|---|---|
| `npx tsc --noEmit` | **55 non-node_modules = 48 repo + 7 `.next/types`** · 0 errors | 0 |
| `npm run lint` | **48 files** (26 under `components/sections/`) · 0 errors · 0 warnings | 0 |
| `npx vitest run` | 17 files · 160 tests · **159 passed · 1 skipped** | 0 |
| `npm run build` | 5 static pages · **0 warnings** · `/[locale]` grew 171 B → **9.04 kB** | 0 |
**REPLAYED** 4 commands + 2 locale renders + 26 section assertions + 8 anchor counts + 3 ESLint stdin probes · **STILL FAILING 0 · NEWLY FAILING 0 · SKIPPED 1.**

**THE CENTRAL MEASUREMENT — 13/13 sections PRESENT in BOTH locales, 26/26 assertions, zero absent.** Each row matched a distinctive string from that locale's own catalogue against entity-decoded, script-stripped served markup. `/he` **97,827 B** · `/en` **103,005 B** · ~50 KB script-free markup each · 4,319 and 5,966 visible characters. Not an empty shell.
**Anchors:** `top`, `story`, `form`, `copyright` — count **1 each, both locales, 8/8**.
**`LanguageSwitcher`** in the **served** markup of both, two anchors, `aria-current` on the active locale, each carrying matching `lang`/`hrefLang`. D-24's only path to English exists in bytes, not just after hydration.

**Nine claims, 9 CONFIRMED · 0 FALSE · 0 CANNOT-TELL.** Notably: **0 Hebrew codepoints across 26 files in `components/sections/`**, comments included · `'use client'` bare grep **4**, structural **2** (the D-13 class again, third time tonight) · the ESLint `any`/`!` rules **proven in force over `components/sections/` by stdin probe**, not inferred from a green exit · **0 default exports** across 13 sections · **0 inlined `wa.me`/`wineandfriends`/`instagram.com`/`@gmail.com`/literal anchors** in code (all raw hits are comments, one of which *predicts its own false positive*) · **0 CSS `background-image`**.

**A correction to MY brief, not to the code:** I wrote that `imageAlts['tank-friends']` "ends with U+05F4". It ends with **ל (U+05DC)**; the gershayim sits second-to-last inside `ז״ל`. The substantive claim holds exactly — that string **contains U+05F4 and no U+0022**, while `footerFriends` **contains U+0022 and no U+05F4**. Two punctuation forms, each faithful to its own source, neither normalised into the other by any of 18 delegates.
**Self-reported process breach, credited:** the verifier ran vitest a second time with `--reporter=verbose` solely to name the skip, and declared it against the one-run-per-check rule rather than burying it.

### W6's ASSET CONTRACT — **25** basenames (the gate said 24; the gate was WRONG — see below)
`public/images/` holds **0 `.webp`** and 7 legacy `.jpg`; `/images/tuval-hero.webp` returns **404** on the wire — **expected, not a W4 defect.**
```
blood-donation · hativa188 · helmet-bird · israel-flag · knesset-bg · lecture-soldiers
lectures-bg-soldiers · media-interview · military-bg-flag · plugat-golan · soldier-landscape
speech-event · stats-bg-soldier · sufa-badge · tank-firing · tank-friends · tuval-gdud53
tuval-hero · tuval-samar · wine-bg-tanks · wine-red · wine-rose · wine-trio · wine-white
```
**Cross-check that raises confidence:** all 6 `imageAlts` keys appear verbatim among the 24 — the alt catalogue and the image references agree on spelling. No near-duplicate or plausible-typo pairs.
**🔴 CORRECTION TO THE GATE — caught by the seat cross-checking two of its own records.** The gate reported **24** referenced basenames. A source sweep of `components/sections/*.tsx` returns **25 distinct `/images/*.webp` paths**. The one the gate missed is **`form-bg-tank`**, referenced at `components/sections/LeadForm.tsx:221` — **the background of the lead form, the site's only business function.**
**Had W6 been handed the gate's list of 24, that asset would never have been produced**, and the form would have shipped with a missing background that no test covers. The error surfaced only because the plan's W6 gate says "25/25" while the verifier said 24, and two of my own records disagreeing was worth one read-only command rather than a guess. **Denominator before verdict, applied to a verifier.**
**Add to the 24 listed above: `form-bg-tank`. W6's contract is 25.**
✅ **And the corrected number closes cleanly:** 26 customer assets → **25 live** (W1-C) → **25 referenced by our rebuild** → **1 orphan**, `hero-memorial.jpg`, already unreferenced in the customer's own build. **W6 must migrate exactly 25 and must NOT migrate `hero-memorial`.**

### Catalogue parity generalised correctly
he **69** top-level / en **67**; the test asserts `enKeys.length === heKeys.length - SOURCE_ONLY_KEYS.length` (67 = 69 − 2: `heroBadges`, `imageAlts`). **It scales with the source-only set instead of hardcoding a number** — which is exactly why adding `imageAlts` broke it loudly rather than silently.

### Budget ledger — W4
18 delegates (13 sections · ALT · FIX-1 · FIXUP-1 · FIXUP-2 · COMPOSE) + 1 gate pass. Briefed ≈ 1,015k, actual ≈ **1,706k, 1.68×**. Consistent with the ~1.3–2.3× band every wave has run at; recorded, budgets still not raised.

---

## §W5 + §W6 — PLATFORM & ASSETS · **landed, gate pending**

### W5 — three delegates
| File | What |
|---|---|
| `lib/validation.ts` · `app/api/lead/route.ts` (+tests) | zod lead schema · `LeadMailer` interface · **14-row status table**; 200 reachable **only** after an observed `res.ok` |
| `lib/seo.ts` · `app/sitemap.ts` · `app/robots.ts` · `app/opengraph-image.tsx` · layout metadata | env-first canonical origin (D-14) · 2 sitemap entries **derived** from `LOCALES` · 3 hreflang incl. `x-default` · 4 named crawlers · our own OG image, **zero remote fetches** |
| `lib/analytics.ts` · `components/Analytics.tsx` (+test) | GA4 via `next/script`, **server component**, renders `null` when the env var is unset — which is tonight's state |

**W5-A's status table — the lie, closed at the server:** invalid → **422, mailer called 0** · provider unconfigured → **503** · provider rejects/unreachable → **502, mailer called 1** · body > 16 KiB → **413 before `JSON.parse`** · CR/LF in `name`/`email` → **422** (mail-header injection is the specific attack, and `name` reaches the Subject while `email` reaches Reply-To) · non-POST → **405**. RED proof: `return failure(502)` → `return accepted()` produced three failures reading `expected 200 to be 502`.

### W6 — the asset pipeline
**25 in · 25 out · 25 under 300 KB · 0 over · 0 resized · 0 quality reductions.** `7,891,219 B → 2,586,306 B`, **67.2%**. Manifest regenerable at `public/images/MANIFEST.md`.
· **`tuval-hero` 1,285,929 → 49,824 B (96.1%) at NATIVE dimensions, PSNR 41.25 dB** — because the source was a **PNG of a photograph**, so most of that 1.28 MB was lossless-container overhead, not detail.
· **`blood-donation` 2,296,067 → 241,642 B, PSNR 38.24 dB**, native dimensions.
· **The delegate LOOKED at both** and reported in plain words that it would be comfortable showing them to the family. **Its best observation, unprompted: the photographer's credit watermark on the portrait is legible and intact — and cropping would have removed it.** A concrete reason the no-crop rule earned its place.
· **AVIF measured, not assumed: it LOSES on 21 of 24 files** (`blood-donation` +66.3%). And `next.config.js` already sets `images.formats: ['image/avif','image/webp']`, so Next negotiates AVIF from the `Accept` header off the single `.webp` — a sidecar would be dead weight nothing selects.
· **Two files grew as WebP** and were kept rather than silently switched to `.jpg`, because 13 sections compile against the `.webp` path: `israel-flag` +1,845 B, `tank-firing` +6,077 B. Cost reported: 7,922 B.
· **Idempotence red-proved:** hashed all 25, changed only the classifier, re-ran — **24/25 byte-identical, and the one that differed was exactly the file the change targeted.**
· **Favicon (D-15):** the customer's 20,373 B / 256×256 ICO placed at `app/favicon.ico`. **Correction to my brief:** ours is not 48×48 but a **3-size ICO (16/32/48)**; left untouched.
· **`hero-memorial` NOT migrated**, 0 writes to the customer repo (all 26 source mtimes unchanged), 0 cropped, 0 upscaled, 0 renamed.


### W5 re-gate — PASS. Both defects closed ON THE WIRE.
| | Before | After |
|---|---|---|
| `/opengraph-image` | **307 → `/he/opengraph-image` → 404** | **200 · `image/png` · 43,996 B · PNG magic verified · IHDR 1200×630** |
| `metadataBase` | defaulted to `http://localhost:3000` | **`https://www.ravid-speaks.com`** in `og:image`+`twitter:image` on BOTH locales; `localhost` absent |
| build `⚠` count | 1 | **0** |
`npx tsc` 0 errors · `npm run lint` **61 files** (60→61, did not drop) 0 errors · `npx vitest run` **21 files · 261 tests · 260 passed · 1 skipped** · **10/10 regression routes byte-identical**, including the two the ledger records measured-green (`/nope` → `/he/nope`, `/fr` → `/he/fr`).
**The verifier read past the header to the bytes:** it did not trust `content-type: image/png` — it checked the PNG signature and parsed IHDR for 1200×630. *"A header is a claim and the bytes are the evidence."*

### The class was three times larger than the reported defect
The gate reported **one** broken route. W5-FIX-1 derived the convention set from Next's own classifier and found **`/icon`, `/apple-icon` and `/twitter-image` failing identically** — swallowed into a locale, undiscovered because nobody had ever requested them. `/sitemap.xml` and `/robots.txt` had survived **only because they contain dots**.
**And the failure had been predicted in writing, in the file it broke**, by a HONEST LIMIT that named the wave, the change and the failure mode — and was ignored anyway. That is why D-44 commissioned a guard test instead of a third, better comment.

### The guard test, verified non-vacuous by the gate (not taken on trust)
Both inputs derived at test time: the matcher via `import { config } from '@/middleware'`; the convention list via **two independent derivations** from Next's own module (`STATIC_METADATA_IMAGES[].filename`, plus names parsed from `isMetadataRouteFile.toString()`), unioned and **cross-checked against the count of `new RegExp(` entries in that same source** — so a ninth Next convention turns the suite RED. Served URLs computed by Next's own `normalizeMetadataRoute`; the match decision by Next's own `unstable_doesMiddlewareMatch`. **8 conventions · 25 served URLs · 8 not-over-broad controls · 36 assertions.** Red-proved in memory against the literal pre-fix matcher, **without editing `middleware.ts`**, and carrying a permanent in-file mutation witness so it cannot silently become vacuous.

### A delegate that wrote nothing, and was right
**W5-FIX-2 made ZERO edits.** Told to fix `metadataBase` in `app/[locale]/layout.tsx`, it verified the line was **already correct**, refused to touch a file measured green over HTTP, and traced the real cause by reading Next's metadata resolvers: the warning fires for routes resolving through the **root**, which never pass under `[locale]`. W5-FIX-3 then fixed it in `app/layout.tsx` — 3 executable lines, `⚠` 1 → 0, route table byte-identical. **The gate recorded that refusal as the right call.**

---

## §W7 — INDEPENDENT VERIFICATION · 3 verifiers, none of whom wrote any of it

### 🔴 THE DEFECT OF THE NIGHT — and it took a browser to see it
**The submit button is invisible.** `components/sections/LeadForm.tsx:541` uses **`bg-gold`**; measured computed style in Chromium: `background-color: rgba(0,0,0,0)`, `color: rgb(0,0,0)`. **The `bg-gold` utility does not exist** — `gold` is absent from `tailwind.config.ts`, and the only gold in the project is a hand-written `.text-gold` at `app/globals.css:108`. **Tailwind silently emits nothing for an undefined colour.**
**`border-gold` is equally non-existent**, at `:236` and **`:402` — the WhatsApp fallback link**, the one control a visitor is offered after a failed send.
**Forty-plus delegates, six waves, five green gates and 261 passing tests did not catch it.** Unit tests assert classnames; **a classname cannot tell you the class is undefined**. This is the single strongest argument in the whole run for the browser pass existing at all.

### W7-C's summary sentence, which is the finding behind the finding
> **"Every file proved itself; nothing proved the composition."**
Nine of its defects sit not in the logic any delegate reasoned about, but in the layer around it — the build's route table, the response headers, the HTTP-method dimension, and the moment a body cap fires.

### W7-A · STATIC — four gates genuinely green, nine items did not survive
`tsc` 0 errors / **60 repo files** · `lint` 0 / **61 examined** · `vitest` **260 passed · 1 skipped** (skip proven legitimately dormant) · `build` **0 `⚠`** by glyph.
**Memorial-fact integrity 5/5** after 40+ delegates. Structural invariants held: **0/13** default exports · **0** code `background-image` · **0** code inlined constants · **0** Hebrew codepoints across **26** section files · `'use client'` **bare 11 vs structural 2** — a bare gate would over-report **5.5×**.
**Did not survive (9):** DoD item 4 **wholly absent** (0 Playwright specs, 0 config, yet `"e2e": "playwright test"` is declared — **`npm run e2e` is a dead script, the W2-FIX-A class recurring on a second command**) · `vitest.config.ts`'s `exclude: ['e2e/**']` never matches the real path `tests/e2e/**`, **a no-op exclude** · and 6 further **D-38-class** text-inspection assertions, of ~20 found: **8 correctly textual, ~9 provable executably, 2 outright redundant with a stronger sibling**.

### W7-B · BROWSER — first time anyone has looked at this site
4 full-page screenshots captured at `artifacts/screenshots/`. **Zero horizontal overflow at all four measurements** (390 and 1440 × he and en). `<html lang="he" dir="rtl">` / `lang="en" dir="ltr"` — **the W1 customer defect does not reproduce**. Mirroring confirmed on asymmetric elements (the switcher sits left-16 in EN, right-16 in HE).
**A11y, counted not impressionistic:** 26 images, **0 without `alt`**, 9 `alt=""` decorative (D-29 satisfied), 17 non-empty · 32 headings, single `h1`, **0 skipped levels** · **5/5 form controls labelled** · switcher **keyboard-reachable at tab stop 1**, named, `lang`-annotated · **0 console errors, 0 failed requests, 0 image 404s** across all four runs.
**The lead form in a real browser, on the 503:** success panel **ABSENT** ✅, WhatsApp fallback **PRESENT** ✅ with a 148-char prefilled href. **The defect both predecessor sites shipped does not reproduce.**
**It also caught its own instrument lying:** its first screenshot set showed every below-the-fold section as **flat black rectangles**, which it nearly reported as the site's worst defect — `loading="lazy"` images do not paint into Playwright's `fullPage` stitch. It regenerated with eager loading and `img.decode()` awaited, and flagged the trap for whoever screenshots this site next.
**D-35 measured and UNEVEN:** of the 6 Hebrew-`alt` images on `/en`, **0 carry `lang` on the `<img>`, 3 inherit a `lang="he"` ancestor, 3 have none in their chain** (`tuval-hero`, `helmet-bird`, `tank-friends`). Worth knowing before it is scheduled.

### W7-C · ADVERSARIAL — ~160 requests, 21 attack classes
**PRESENT (handled) 11 · ABSENT (broken) 9 · NOT-MEASURED 1.**
**Survived convincingly:** the lead endpoint's entire hostile surface (**34/34** — mail-header CR/LF rejected in every header-bound field, `__proto__` stripped, 413 on oversize, 405 + `Allow` on wrong verbs, **zero 200s, zero 500s**) · locale and path attacks (**51/51**, traversal, response-splitting, `Accept-Language` injection, **nothing 500'd, no file ever served**) · the catalogue schema rejecting **20/20** mutants **by exact dotted path** · **no secret, env name or stack frame in any response body** · and **the memorial reads without JavaScript**: 4,389 visible chars on `/he`, 6,051 on `/en`, with only **14 characters** behind a suspense boundary.
**🔴 Attack 7 — the defect this entire rebuild exists to remove — is CLOSED AT BOTH LAYERS.** Server: one 2xx producer, reachable only after `send()` resolves, and `send` itself throws on `response.ok !== true`; the unconfigured branch is **unrepresentable** because `MailerResolution`'s `configured:false` arm has no `mailer` field. Client: `'sent'` assigned at exactly one site, inside `if (response.ok === true)`. **30+ POSTs, not one 200.**


### W7 final gate — PASS. All seven waves closed.
| Check | Denominator | Exit |
|---|---|---|
| `npx tsc --noEmit` | **66 = 60 repo + 6 `.next/types`** · 0 errors | 0 |
| `npm run lint` | **64 files** (floor held) · 0 errors · 0 warnings | 0 |
| `npx vitest run` | 21 files · 261 tests · **260 passed · 1 skipped** | 0 |
| `npm run build` | **0 `⚠`** by glyph | 0 |
*The two file counts measure different sets — `tests/e2e/**` is linted but outside the tsconfig include. Not a defect; worth knowing before someone reconciles them.*

**⭐ PRERENDERING — proved THREE ways, never from the route table.** Files on disk: `he.html`, `he.rsc`, `en.html`, `en.rsc`, `_not-found.html`, `_not-found.rsc` all **PRESENT** · `prerender-manifest.json` `routes` = **7** · on the wire **`s-maxage=31536000` + `x-nextjs-cache: HIT`** for both locales, **not one** `private, no-cache, no-store`. **4 → 7.** The two still dynamic are correctly so: a catch-all that calls `notFound()` and a POST handler.
**⭐ THE BUTTON, in Chromium rev 1243, by COMPUTED STYLE:** `rgb(209,163,71)` on `rgb(0,0,0)` = **9.04:1**. The stylesheet now emits **5** real `*-gold` rules where it emitted **zero**. **Every form field's focus ring flips 20%-white → gold** — the defect FIX-A found on its own. **0 console errors.**
**Security 35/35** (7 headers × 5 route types), `X-Powered-By` **gone**. **Method grid 12/12** — GET/HEAD 200, POST/PUT/DELETE **405 + `Allow`**, OPTIONS **204 + `Allow`**. **13/13 ledger-green routes hold**, including **0** `Set-Cookie: NEXT_LOCALE` across every probe. **Memorial facts 6/6.** `/api/lead` 422 / **503, not 200** / 405.

### Two findings no delegate claimed
**(1) D-26 PARTIALLY CLOSED as a side effect of FIX-E** — the prerendered `_not-found.html` now carries **`<html lang="he" dir="rtl">`** with our copy **in the markup** (`<main`, "Oops! Page not found", a real `<a href="/he">`), not only in the RSC payload. ⚠️ **Scoped honestly by the verifier: the DYNAMIC 404 path (`/[locale]/[...rest]` → `notFound()`) was NOT RE-MEASURED this pass. Re-check before claiming D-26 fully closed.**
**(2) A gap in the seat's method, worth carrying forward.** `app/[locale]/page.tsx` byte-identity after FIX-B's `dynamic = 'error'` probe is **CANNOT-TELL** — the verifier confirmed it structurally (17 imports in order, 13-section composition, `<Wine m={m} />` still without a `locale` prop) but **no baseline hash was taken at W4**, so byte-identity cannot be asserted. FIX-B's own sha256 and the seat's spot-check both say `20f75ec3…`, and nothing contradicts it. **Its recommendation, adopted: hash probe files BEFORE an experiment, not after.**

### What survived independent verification — the answer to "what is done"
Both locales prerender with correct `lang`/`dir` · `/` deterministic across every `Accept-Language` and a contrary cookie · **13/13 sections in both locales** · key parity with only the two documented source-only keys, enforced by a test that derives its expectation · the lead API **honest** (422 / **503 rather than a false 200** / 405) · SEO ships, including an OG card at **200 · image/png · 1200×630** on a route never once successfully invoked before tonight · 7 security headers everywhere · **the button visible at 9.04:1 with a working focus ring** · **no memorial fact ever invented** across ~50 delegates · quarantine intact at 160 B byte-identical · **the customer's build never touched.**

### Budget ledger — W7
3 verifiers + 6 fixes + 2 gate passes. Briefed ≈ 600k, actual ≈ **1,240k, 2.07×** — within the 1.3–2.3× band every wave has run at.

---

## §W8 — HANDOFF · dashboard + 4 documents + surname fix · tarball closing

| Artefact | Lines/Bytes | For |
|---|---|---|
| `STATUS_DASHBOARD.html` | **51,080 B · 381 lines** | What Mati opens first. Matches `PLAN_DASHBOARD_v1_00.html`'s card format and palette; adds a **three-state pill set** (PRESENT solid · ABSENT solid · NOT-MEASURED **dashed** · CANNOT-TELL **dotted**) so the states survive greyscale and print, not hue alone. **Renders offline with ZERO external requests** — verified by scan: 0 `src=`, 0 `href=`, 0 `<script`, 0 `<link`, 0 `url(`, 0 `http`. |
| `START_HERE.md` | 67 | Someone opening the repo cold. **One page**, as briefed. The only place the first action appears. |
| `README.md` | 130 | The repo itself. The only place env vars appear — **names only**. |
| `MASTER_PLAN.md` | 274 | Whoever changes the architecture. Cites ledger decisions by number instead of restating them. §8 tells the `bg-gold` near-miss in full. |
| `SESSION_2_DELTA.md` | 133 | Someone who knew the old repo. Carries the **9-item near-miss register**. |
| `dist/ravid_website_2026-09-12.tar.gz` | **4,105,123 B · 140 files** | sha256 `92e804b5ced51d5d8e9bba9dba667e245d98099b99554e12a5c3c64565576c79`, with `dist/MANIFEST.txt` |

### The tarball reconciles, and nothing was deleted on the last step either
**24,975 files on disk · 140 in the archive · 24,835 excluded — and 140 + 24,835 = 24,975.** Excluded with reasons recorded in the manifest: `node_modules/` (24,373, regenerable from the lockfile) · `.next/` (309, build output) · `.git/` (95) · **`_legacy/.next-stale-next14/` (48 — quarantined, not deleted; they simply need not travel)** · `artifacts/` and `Claude outputs/` (verification evidence, ~24 MB, not needed to read or run the project).
**`_legacy/`'s 18 quarantined SOURCE files and `WHY.md` DO travel** — they are the provenance record of what was replaced and why.
**Verified by listing the archive's own contents, not the directory it was built from:** `package.json`, `README.md`, `START_HERE.md`, `STATUS_DASHBOARD.html`, `REBUILD_STATUS_v1_00.md`, `_legacy/WHY.md` all **PRESENT**; `node_modules/`, `.next/`, `_legacy/.next-stale-next14/` all **ABSENT**.
**Source tree unchanged: 24,975 files before and after; `git status` shows 16 `D` entries, exactly the pre-existing quarantine moves, none new.** Across eight waves and ~50 delegates, **nothing was ever deleted.**

### 🔴 A delegate refused to print a number the seat had been repeating all night
W8-A's brief said "eighteen delegates caught false premises in the seat's own briefs." It checked: **the ledger's only tally reads 5 (three the seat's), at a line last updated at W3 and never revised.** It rendered **5 with its as-of scope**, listed the later corrections individually, gave **no total**, and stated plainly that *"18 is not supported anywhere in the ledger."*
**The seat had been carrying that count in its head and in briefs, and never wrote it here.** A number with no home in the single home of every number is a number that does not exist. Corrected at the tally line: later corrections were each recorded individually, **no running total was ever maintained, and the delegate was right to refuse to invent one.**

### The same delegate found three more stale items — all the seat's
· **A mis-citation** in the `▶ FIRST ACTION` block: the prerender trade cited D-40/D-41 (page weight) when the reasoning is **D-26/D-27 and §W7**. It rendered the citation **exactly as the ledger gave it** and flagged it rather than silently fixing another file's text. Corrected.
· **§NOT-MEASURED REGISTER was W1-scoped and overtaken** — items 1–3 (runtime behaviour · build/lint/tsc exit codes · the rendered page) have all since been measured by later waves.
· **§HONEST LIMIT OF THIS LEDGER was likewise W1-scoped** ("no number here has been confirmed against a running build, a browser, or the live site") — false for W2 onward.
**Both were corrected by ADDING SCOPE NOTES, not by rewriting them.** The originals stand unedited, for the same reason `_legacy/` keeps its misspellings: **rewriting a record to match what later became true is how it stops being a record.**

### D-54 closed: the speaker's surname
`package.json` carried **`Tsanani` ×3** (description ×2, author ×1), inherited from the discarded repo. Corrected to **`Tzanani`** — byte count identical (same-length substitution), JSON still valid, suite at baseline. **`_legacy/`'s `Tsanani` ×7 across 4 files was deliberately left untouched:** a quarantine is evidence, and correcting it would destroy the provenance the no-delete rule exists to preserve.

---

## §DECISIONS — seat judgements, each with the cost of reversing it

| # | Decision | Alternatives priced | Cost to REVERSE |
|---|---|---|---|
| **D-1** | **`_legacy/` manifest = 17 files + `.next/`**, named now so W2 does not improvise: `components/TuvalMemorialLanding.tsx`, `components/Analytics.tsx` (dead, 0 importers), `app/page.tsx`, all 12 `docs/*`, `DEPLOYMENT_INSTRUCTIONS.txt`, plus `.next/` (22.7 MB stale build). `README.md` and the 5 root configs are **rewritten in place**, never copied. | (a) quarantine everything incl. configs → orphans the build; (b) quarantine only the monolith → leaves 12 dead docs contradicting the new ones. | `mv` back from `_legacy/`, ~1 min. Nothing is deleted. **CORRECTION (seat error, caught by W2-B):** this decision first read "15 files" because the seat transcribed W1-A's census as 11 `docs/*` when it lists **12**. The true manifest is **17 files** (1 monolith + 1 dead Analytics + 1 `app/page.tsx` + **12** docs + 1 DEPLOYMENT_INSTRUCTIONS + 1 `tailwind.config.js`) + `.next/`. My earlier claim that the plan's unexplained "15 files" was *independently confirmed* is **WITHDRAWN** — it was an artefact of my own miscount. Plan §4's "15" is **CANNOT-TELL**: the plan names no paths, so there is nothing to compare against. W2-B stopped at the boundary instead of guessing, which is why this was caught before the `mv`. |
| **D-2** | **Install ZERO shadcn `ui/*` components speculatively.** W1 proved 0 of 49 are used by any section — all 13 are raw HTML + Tailwind. A section needing a primitive gets it added by name, with a justification recorded here. | Plan §4 budgeted "~13 ui files, +900 lines". Installing 13 would import ~25 unused npm deps and recreate the 37-dead-file class we are rebuilding to escape. | `npx shadcn@latest add <name>` ≈ 2 min per component. **This removes a capability rather than adding a check** (§🅴 non-convergence) — the class "dead ui file accumulates" becomes impossible to construct, not merely absent. |
| **D-3** | **Target Next 15 + React 19** (plan §0 is the design authority; the repo's `next@14` is the thing being replaced). Recorded consequence: **in Next 15 `params` is a Promise** — W3's `app/[locale]/layout.tsx` and `page.tsx` must `await` it or the build fails. | Staying on 14 keeps sync `params` but forfeits the stated target and the React 19 compiler path. | Pin `next@^14` + `react@^18` in `package.json`, un-`await` 2–3 `params` call sites. ≈ 1 file + 3 sites. |
| **D-4** | **Lead delivery is our own `/api/lead`; the customer's `catch`-only WhatsApp fallback is NOT ported.** It is the bug (§6-F): `fetch` rejects only on network failure, so a formsubmit 4xx/5xx resolves and the user is shown success for an undelivered lead. Ours checks `res.ok`, and the fallback is offered on **any** non-2xx, not only a thrown error. | "Keep the fallback as written" (plan §5) keeps a false success message on a lost lead — a lie to a bereaved family's customer. | Revert to a direct `formsubmit.co` POST ≈ 1 file. |
| **D-5** | **`dir`/`lang` go on `<html>`, not an inner `<div>`.** The customer's build never updates `<html>` (`index.html` is permanently `lang="he" dir="rtl"`). **W7 must therefore expect `/en` screenshots to differ from the customer's reference and must NOT score that difference as a regression** — their reference contains the defect. | Reproducing their inner-`div` `dir` would make the screenshot diff clean and the site wrong. | Move 2 attributes, ≈ 1 file. |
| **D-6** | **The `any` gate is `\bany\b` scoped to `components/` + `i18n/`, not the literal `t: any`.** DoD #6 as written passes while `HowItLooksSection.tsx:20`'s `(f: any)` survives — a check that cannot go red is decoration (law 3). | Keeping the literal grep = a green gate over a live defect. | Loosen the grep back, ≈ 1 line. |
| **D-7** | **Every unanswered customer question becomes ONE typed constant in `config/site.ts` (or one message key), seeded from `ravid_website1` — the only permitted source — and logged in §OPEN with its `file:line`.** Nothing is invented; nothing is inlined twice. | Waiting for answers blocks the night; guessing fabricates memorial facts. | One edit per answer, at the named line. That is the whole point. |
| **D-8** | **`lectureItems[3]` (the empty string paired with a 4th image) is handled explicitly**: the component renders the image with its own non-empty `alt` key and **omits the heading element entirely** when the string is empty. It never emits an empty `<h_>` or empty `alt`, and it never invents the missing sentence. | Porting as-is reproduces an a11y hole; writing the missing sentence fabricates content for a memorial. | Delete the conditional and add the string, ≈ 2 lines, once the customer supplies it. |
| **D-9** | **Budgets are split, never raised.** W1 ran at 1.48× briefed. From W2 on, a brief projected above ~1.3× its budget is cut into two briefs rather than given more room. | Silently raising budgets is how a night becomes a bill. | None — this is a process rule, reversible at any time. |
| **D-10** | **W4 fan-out = 13**, derived from the **target** (the customer build we are matching), not from the monolith we are discarding (10 blocks). Plan §3's 13 names match B's 13 render sites 1:1. | Fanning out on our monolith's 10 would under-build the site by 3 sections. | One extra delegate per added section, ≈ 20 min each. |
| **D-11** | **The four in-page anchors `#top` `#story` `#form` `#copyright` are a contract** and are carried across by name (§6-E). They are undocumented in the plan; every CTA depends on them. | Dropping them silently breaks every call to action while every test still passes. | Re-add 4 `id` attributes, ≈ 4 lines. |

| **D-12** | **W2 owns `i18n/request.ts`.** W2-A1 wrapped `next.config.js` in next-intl's plugin pointing at a file W3 was to create, which left W2's own gate ("build green") unrunnable. A config and the file it requires are ONE unit; splitting them across waves manufactures a partial landing. W2 writes the minimal typed request config; W3 rewrites it in place with real locale negotiation. | (a) unwrap the plugin in W2 and re-add it in W3 → `next.config.js` written twice, and W1 already recorded "rewritten once" as the invariant; (b) declare W2 green without a build → a partial landing, forbidden. | Delete 40 lines; W3 recreates it. ≈ 1 file. |
| **D-13** | **Gates move from grep to the compiler/linter — greps are comment-blind.** Two delegates independently tripped my own gates with *comments*: D-6's `\bany\b` fired on prose explaining why a file is clean, and a bare `grep "use client"` over `app/` returns **4 hits, all in comments** (`head -1` returns **0/3**). A gate whose obvious repair is "loosen the gate" is worse than no gate (law 3). Stepping UP a level rather than tuning the pattern a second time (§🅴 non-convergence): · **`any`** → ESLint `@typescript-eslint/no-explicit-any` as an **error**, comment-immune by construction · **`'use client'`** → structural first-statement check (`head -1`), since a directive is only a directive as the module's first statement · **Hebrew in `components/sections/`** → codepoint grep **strengthened** to forbid Hebrew anywhere in those files, comments included, so the check is exact rather than approximate. | Tuning the regex a third time is the patch-over-a-patch this law forbids. | Revert to greps: ≈ 3 lines in the W7 brief. Reversing the ESLint rule: 1 line in the eslint config. |
| **D-14** | **`SITE_URL` is read from `NEXT_PUBLIC_SITE_URL` at runtime, with `config/site.ts` as the fallback.** W2-A2b flagged that of the 8 seeds it is the only one with **no evidence in either repo** (source: Mati's plan alone) *and* the only one that propagates — canonical tags, sitemap, hreflang and OG all bake it in. Env-first makes a wrong seed a deploy-time override instead of a code edit plus a rebuild. | Constant-only: one edit, but every generated URL is wrong until a rebuild ships. | Delete the env read, keep the constant. ≈ 2 lines in `lib/seo.ts` (W5-B). |
| **D-15** | **The favicon is W6's.** W2-A2a correctly removed the hand-written `<link rel="icon">` from the shell (Next 15 emits `export const viewport` / file-convention icons itself), which left the favicon **unclaimed**. Ours is 923 B / 48×48; the customer's is 20,373 B / 256×256. W6 places `app/favicon.ico` by file convention. | Leaving it unclaimed ships a site with no icon and no one responsible for it. | Delete one file. |

| **D-16** | **Pattern-level proof of the `_legacy/**` test exclusion is ACCEPTED as sufficient.** W2-FIX-B correctly reported that `_legacy/` holds 66 files and **0** matching the include glob — so the exclude is not load-bearing today, and ABSENT of test files is *not* proof the exclude works. It proved the patterns mechanically against **picomatch 2.3.1**, the matcher underneath Vite's globbing: a hypothetical `_legacy/components/__tests__/Hero.test.tsx` matches `include` and is removed by `exclude`. | The alternative — writing a probe test *into* `_legacy/` — means a delegate creating files inside the quarantine to test the quarantine. That is worse: it makes the quarantine a working directory. | None owed. If end-to-end proof is ever wanted, it costs one throwaway probe under `_legacy/`, created and removed by the probing delegate. Recorded as an HONEST LIMIT, not a green. |
| **D-17** | **DEFERRED, not fixed: `vitest.config.ts` emits a Vite `configLoader: 'native'` warning** (ESM syntax in a file loaded as CommonJS). Harmless today — warning only, exit codes unaffected — but a future Vite major makes `native` the default and turns it into a break. **The obvious fix is forbidden:** adding `"type": "module"` to `package.json` would flip module semantics for the whole Next app and **break `next.config.js`, which is CommonJS** (`require`/`module.exports`, confirmed by W2-FIX-C). | (a) `"type":"module"` → breaks the Next config, a real outage to remove a warning; (b) rename to `vitest.config.mts` → correct and isolated, but not needed tonight and costs a delegate the night has better uses for. | **Closer: rename `vitest.config.ts` → `vitest.config.mts`, one `mv`, no content change.** Recorded in §DEFERRED with that closer rather than left as an unexplained warning. |

| **D-18** | **A key present in `he` but absent in `en` resolves to the SOURCE-LOCALE value, through one typed helper in `i18n/`, never per-component.** W3-B proved `heroBadges[0..2].alt` (`סמל חטיבה 188`, `פלוגת גולן`, `סמל סופה`) exist in the customer's build **only as Hebrew `alt` text in `HeroSection.tsx:27,30,33`**, with no English anywhere in the tree. These are **unit designations — proper nouns**. Rendering the Hebrew on the English page is correct; an agent-authored English translation of a fallen soldier's company name is a fabricated memorial fact, which the hard lines forbid outright. | (a) invent English → forbidden, fabricates a memorial fact; (b) render an empty `alt` → an a11y defect on the only images identifying his unit; (c) let next-intl emit the missing-key placeholder → ships the literal string `heroBadges.0.alt` as alt text; (d) duplicate the Hebrew into `en.json` → hides the gap and creates a second copy of one fact, so the customer's eventual answer becomes a hunt instead of one edit. | Delete the fallback branch and add the English strings, ≈ 3 lines, once the customer supplies them (§OPEN 7). The catalogue stays honest in the meantime: the gap is visible in `en.json` rather than papered over. |

| **D-19** | **Arrays stay arrays in the JSON; message ACCESS moves behind one zod-validated typed accessor (`i18n/messages.ts`).** W3-A installed next-intl's `AppConfig` augmentation to make message keys compile-checked, then **proved it inert** with a controlled A/B on next-intl's own internal type: `NestedKeyOf<{a:string; b:{c:string}}>` → `'"a"\|"b"\|"b.c"'` (typed), but `NestedKeyOf<{…; xs: string[]}>` → **`string`** (collapsed). An array is not assignable to `AbstractIntlMessages`, so **one array-valued key anywhere collapses key typing for the entire catalogue.** `he.json` has 67 keys: 57 strings, **10 arrays**, 0 nested objects → a misspelled key compiles. **This is W1's measured customer defect returning through a different door** — their `Translations` type was declared and never applied; ours was applied and does nothing. A guarantee that cannot fail is decoration (law 3), and is worse than none because it is believed. | (a) **De-array into objects keyed `"0","1"`** — W3-A's proposal. Restores next-intl key typing, but makes the catalogue hostile to the human who may correct a sentence himself (this is a memorial site, and the customer is the deceased's brother), and rewrites how all 13 W4 sections read list data. (b) **Accept inert typing + a runtime key test** — leaves a believed-but-false guarantee in the tree. (c) **CHOSEN: schema-validated access.** A zod schema is the single declared shape; `Messages` is `z.infer` of it, never hand-written; both catalogues validate against it at load; mismatches are an **observable failure**, not a silent `string`. Strictly stronger than key typing, which never checked that the data matched its declared shape at all. | Delete `i18n/messages.ts` + its test and revert sections to `useTranslations` string keys ≈ 2 files + 13 call sites. **Note this is a REWRITE of the message layer, not a patch on it** — §⑤b non-convergence: two attempts at "a type that describes the catalogue" both failed because nothing could detect their falsity, so the third attempt steps UP a level and makes the data prove itself. |

| **D-20** | **`getMessages()` is the ONLY way to read a message. next-intl's `useTranslations`/`getTranslations` are BANNED by an ESLint `no-restricted-imports` error.** This is the **third** cycle on one spot, so §🅴 non-convergence applies and the answer is not another type — it is removing the capability. Cycle 1: the customer's `t: any`. Cycle 2: our `AppConfig` augmentation, **proved inert** by W3-A (10 array keys collapse `NestedKeyOf` to `string`). Cycle 3: W3-C shipped a typed, schema-validated accessor **and named the remaining hole itself** — a caller using `t('heroTitel')` still compiles. Within the hour, W3-D independently reproduced it: `app/[locale]/not-found.tsx:83` fails `tsc` with `'"notFound"' is not assignable to parameter of type 'undefined'`. **The first of thirteen section files hit it before the wave even closed.** | (a) de-array the catalogue → rejected in D-19, hostile to the human editor; (b) document "prefer `getMessages`" → a convention, and 13 parallel delegates will not all obey one; (c) **CHOSEN: make the wrong call unwritable.** An ESLint error is comment-immune and AST-based (D-13), so a section physically cannot reach an unchecked key. Secondary effect, and a good one: `useTranslations` is a client hook, so banning it also removes the easiest accidental route to a `'use client'` boundary — the carried-forward W2 risk that "nothing enforces server-by-default", which was rated **high by W4**. | Delete one rule block from `eslint.config.mjs` ≈ 5 lines. Note the ban is **enforced, not advisory** — that is the entire point, and it is why it is worth doing before the fan-out rather than after. |
| **D-21** | ~~SUPERSEDED by D-20's consequence — see the strike note at the end of this row.~~ **`AppConfig['Messages']` in `i18n/request.ts` is DERIVED from the zod-inferred `Messages` type, not from `typeof heMessages`.** W3-C flagged, unprompted, that its schema is a second description of the catalogue sitting alongside `request.ts`'s — "they cannot silently disagree, but the duplication is real and is owed to you." That is the honest version of the customer's own rot (a `Translations` type that drifted into irrelevance). One description, one place. | Leaving two descriptions that agree today is exactly the "future contradiction with a date on it" of law 6. | **SUPERSEDED within the hour:** once D-20 banned the hooks, the augmentation has **no consumer**, so deriving a type nothing uses would be dead code carrying a guarantee. W3-E is instead **deleting** the `Messages` member and keeping only what it can prove goes red. Recorded as superseded rather than edited away, so the reasoning chain stays legible. |
| **D-22** | **Catalogue validation stays LAZY (per-locale, on first access), not eager at import.** W3-C's reasoning, accepted as given: eager validation would have thrown at import and taken the whole test suite down over a dependency outside its write-set — hiding whether the schema worked at all. Lazy keeps the guarantee that matters (no caller reaches a key without that locale having been parsed) and buys fault isolation. | Eager catches a broken catalogue at boot rather than on first request to that locale. | Four lines, and it is now safe to make eager since the dependency landed. Recorded in §DEFERRED with that closer rather than left implicit. |

| **D-23** | **The ESLint ban covers all 7 message-reading APIs, keyed on IMPORT NAME rather than file path.** The seat's brief named 2; W3-E surveyed all **26 runtime exports** of `next-intl` + `next-intl/server` and found **7 that can return a message**: `useTranslations`, `useMessages`, `useExtracted`, `createTranslator`, `getTranslations`, `getExtracted`, and — the one that matters most — **`getMessages` from `next-intl/server`, which NAME-COLLIDES with the project's sanctioned `getMessages` from `@/i18n/messages`.** An editor auto-import was a live path straight back into the defect. 19 exports were deliberately left allowed (`hasLocale`, `useLocale`, `useFormatter`, `setRequestLocale`, `defineRouting`, `createMiddleware`, …) because none returns a catalogue string. | Path-scoped exemptions (`i18n/**` may import anything) would rot the moment a file moves, and give a future delegate an escape hatch: move the file, keep the bad call. | Delete one rule block ≈ 5 lines. **Keyed on names, the ban needs ZERO file exemptions** — `i18n/**` keeps routing access because those are different *names*, not because they are on an allowlist. There is no list to maintain and nowhere to move a file to escape it. |

| **D-24** | **`/` redirects to `/he` UNCONDITIONALLY — locale detection is disabled.** The W3 gate measured that next-intl negotiates the root target from `Accept-Language`: no header → `/he`, `he` → `/he`, `fr` → `/he`, but **`en` → `/en`**. `middleware.ts`'s own INVARIANT comment asserts the target "comes from `routing.defaultLocale`" — **false as written**, and a false INVARIANT is worse than no comment because headers are this project's HONEST LIMIT mechanism. | (a) **Keep negotiation** — the better general default, and genuinely better UX for a multilingual product. Rejected for *this* product: it is a memorial page shared by link (WhatsApp, Instagram), and a URL that opens in a different language depending on the recipient's browser is a worse thing to share than one that always opens in Hebrew with a visible switcher. It also makes `/` non-deterministic, so the redirect has one *owner* but not one *behaviour*. (b) **Leave it and fix only the comment** — honest, but ships a root URL that contradicts `REBUILD_PLAN_v1.00.md` §2 ("`/` → `/he` redirect") and §7 Q5. | One line (`localeDetection`) in `i18n/routing.ts`. **What is given up, recorded rather than implied:** browsers preferring English no longer land on `/en` automatically, so the language switcher becomes the only discovery path for English. If the customer wants negotiation back, it is one line and the switcher stays. |
| **D-25** | **The localised 404 is made REACHABLE, not left as dead code.** The gate measured that `app/[locale]/not-found.tsx` compiles, bundles, and **no URL can reach it**: `/he/nope` and `/en/fr` both render Next's built-in page (`"404: This page could not be found."`, no `<html>` tag). The `[locale]` segment has only an index route, so an arbitrary path never enters it — the `notFound()` calls in the layout and page are unreachable too. | (a) **Quarantine it to `_legacy/`** — consistent with DELETE DEAD THINGS, but throws away correct work over a missing 4-line route; (b) **leave it** — a unit that looks finished, passes every gate, and cannot be seen by any visitor. That is precisely the "green but degraded" §⑤b forbids. | Delete one catch-all route file. **The 404's copy and markup stay in exactly one place** (`not-found.tsx`); the new file is a routing shim that writes no copy at all. |

| **D-26** | **404 pages ship without `lang`/`dir` in their served bytes. DEFERRED — we are NOT enabling an experimental Next flag tonight.** W3-J established the mechanism from Next 15.5.25's own source, not conjecture: `notFound()` thrown during the **server** render rejects the RSC stream before any client boundary exists; Next catches it at the top of the request (`app-render.js:1389`), **discards the entire first render attempt**, and re-renders via `getErrorRSCPayload`, which **hardcodes** `<html id="__next_error__"><head/><body/></html>` (`app-render.js:699-712`). The `[locale]` layout's `<html>` is already gone by then. **The tell:** `/api/anything`, which never enters `[locale]`, gets the identical shell — it is a property of Next's 404 path, not of any route or layout. **This also retroactively justifies the HARD STOP** placed on that brief: a layout rewrite could not have fixed it either. | (a) **Enable `experimental.globalNotFound` + `app/global-not-found.tsx`** — the only construction in 15.5.25 that can put `lang`/`dir` on a 404's served `<html>`. Rejected tonight: it is an **experimental** flag, and adopting an unstable framework API unattended, on a memorial site that must outlive this rebuild, to improve a 404 page, is the wrong trade. (b) **Rewrite the layout contract** — measured impossible above. (c) **Accept and record** — chosen. | **Closer: one delegate, `next.config.js` + `app/global-not-found.tsx` together**, enabling `experimental.globalNotFound` and deleting `app/not-found.tsx` if it is subsumed. **Measured impact, so the trade is visible:** served-byte `lang`/`dir` on 404s is ABSENT (8 of 10 URL shapes); the values ARE present in the RSC payload and applied after hydration; and with JS off Next's 404 path streams all visible content into a suspense boundary, so a 404 is **blank before and after this change alike** — unaffected by the deferral. |
| **D-27** | **`app/not-found.tsx` is KEPT, though it did not close the defect it was written for.** It earns its place for a different, measured reason: before it, `/api/*` and `/robots.txt` were served **Next's own built-in English 404** — a second 404 page, authored by the framework, that this project could not edit or translate. **The project had two 404 pages and owned one; it now owns its only one.** The file contains no copy, no markup, no message key and no link — it imports `LocaleNotFound` and wraps it in `<html lang={DEFAULT_LOCALE} dir={LOCALE_DIRECTION[DEFAULT_LOCALE]}><body>`. | W3-D had earlier objected to "a second, worse 404 page". That objection does not apply to this construction: it is a **shell around the first page**, not a second page. ONE FACT ONE PLACE is intact — nothing was extracted, nothing duplicated. | Delete one file. `app/[locale]/not-found.tsx` is **NOT dead** and must not be quarantined — it owns the `[locale]` boundary and is still the project's only 404 page. |

| **D-28** | **Sections are PURE, PROPS-DRIVEN server components. The composition unit calls `getMessages(locale)` ONCE and passes each section a typed slice** (`Pick<Messages, …>`, derived from the zod-inferred type — never hand-written). | (a) each section calls `getMessages` itself → 13 calls per render, 13 async components awkward to unit-test, and 13 chances for the access pattern to drift; (b) a React context → reintroduces the customer's own defect (state in memory rather than in the URL/type system). Plan §2 also specifies "props-driven". | Revert to self-fetching: 13 files. **A hand-written prop type is explicitly forbidden** — that is precisely how the customer's `Translations` type rotted into irrelevance (W1 §2b). |
| **D-29** | **`alt` policy: INFORMATIVE images get a non-empty `alt` from a message key; DECORATIVE and background images get `alt="" aria-hidden`.** My W4 briefs said "all images render with a non-empty `alt`". **W4-03 refused it** for a backdrop flag behind an opaque overlay, on the grounds that a non-empty `alt` there would be **invented copy (banned by C4) and worse accessibility** — a screen reader announcing a decorative background is noise. It corrected the claim rather than weakening its assertion, which is the right way round. | Blanket non-empty `alt` forces either invented copy or a meaningless string on every background image on the site. | One attribute per image. **Affects the briefs already in flight** — batch 1 carried the wrong wording; batches 2–3 carry this. Any batch-1 deviation is caught at the W4 gate. |
| **D-30** | **Locale-invariance is TESTED, not assumed, where a section does not vary by locale.** W4-03 found nothing in its component varies by `locale` — correctly, since `lang`/`dir` live on `<html>` (D-5) and duplicating either into a section would give that fact a second home. Rather than write a difference test that pretends otherwise, it asserted **invariance**: same `m`, both locales, `innerHTML` compared — **red the instant anyone adds a locale branch** — plus a separate test proving the he/en difference is real and arrives through `m`, not through `locale`. | A difference test over a component with no differences is decoration; deleting the test loses the guard entirely. | None owed. This is a better pattern than the briefs asked for and should be the default for every section that does not branch on locale. |

| **D-31** | **Sections export ONE named export. No default export.** Three batch-1 delegates independently shipped **both** — Hero, Stats and LecturesPreview each hedged because nothing fixed the convention and `app/[locale]/page.tsx` was outside their write-set. All three flagged it as duplication they were declining to decide, which was correct behaviour and a gap in my brief. | Default exports rename silently at the import site (`import Whatever from './Hero'` compiles), defeat some tree-shaking, and — with 13 sections and one composition file — give every name two spellings. | Delete one line per file, ×13. The three hedged files need the loser removed at the W4 fix-up. |
| **D-32** | **Decorative/background images use `next/image` with `fill` + `alt=""` + `aria-hidden`, never a CSS `background-image`.** Stats used `next/image`; LecturesPreview used a CSS background layer, reasoning that `next/image` on a decorative image forces either `alt=""` or an invented name. The reasoning is sound but the conclusion costs too much: **a CSS background bypasses W6's optimisation pipeline entirely** — no webp negotiation, no responsive `sizes`, no lazy-loading — on exactly the largest images on the page. `alt=""` on a decorative image is correct accessibility (D-29), not a hole. | CSS backgrounds are simpler to write and would silently forfeit the entire asset-optimisation wave on the heaviest files (`blood-donation.jpg` alone is 2.3 MB). | One image per section. LecturesPreview is the only deviation and is listed for the W4 fix-up. |
| **D-33** | **CORRECTION — the LecturesPreview image pairing in my brief was FALSE.** I listed `[blood-donation, speech-event, media-interview, lectures-bg-soldiers]`. **W4-04 verified against two independent sources** — the customer's `LecturesPreviewSection.tsx:12-13` and ledger §OPEN 6 — that the true pairing is **`[lecture-soldiers, blood-donation, speech-event, media-interview]`, with `lectures-bg-soldiers` as the BACKGROUND, not a list item.** My list dropped `lecture-soldiers` and promoted the background into the list. The delegate followed the verified pairing and flagged mine rather than obeying it. | Had it obeyed, W6 would have been handed a wrong contract and the 4th item would have shown the wrong photograph beside the memorial's empty-string content hole. | None — corrected before W6 was briefed. **W6's asset contract must use the verified pairing.** |
| **D-34** | **CORRECTION — the stats empty-`desc` count in my brief was wrong by one.** I said `stats[0].desc` and `stats[3].desc` are empty. W4-05 measured **three of four empty — indices 0, 2 and 3** (`+1000`, `100%`, `∞`), in both locales; only index 1 (`+57`, `ברחבי הארץ`) is non-empty. It did not stop, because the required handling (iterate, explicit empty branch, no filler) is identical either way — the right call — but it reported the discrepancy rather than quietly absorbing it. | None; recorded so the ledger is not wrong. | None. |

| **D-35** | **Any image whose `alt` comes from `imageAlts` carries `lang="he"` UNCONDITIONALLY — never conditionally on the active locale.** W4-FIXUP-1 raised a real gap: `imageAlts` is source-locale-only by construction (D-18), so the English page serves a Hebrew `alt` with no language context and a screen reader pronounces Hebrew with English phonetics. It offered two options and declined to choose: annotate conditionally (Hero already does this for its badges via a `badgeLang` prop) or leave it. **Both are worse than the third.** Conditional annotation makes the component read `locale`, which contradicts Story's documented invariance and the D-30 invariance tests. But the condition is unnecessary: **an `imageAlts` value is Hebrew in BOTH locales** — that is what source-locale-only means — so the annotation is simply always true. Unconditional is more correct, locale-invariant, and *removes* a conditional rather than adding one. | (a) conditional on locale → forces `locale` into components that are provably locale-invariant, and Hero's existing `badgeLang` conditional should be **simplified away** under this rule; (b) omit it → a screen reader mispronounces the names of a dead soldier's unit and of the three men in the photograph. | Remove one attribute per image. ⚠️ **Implementation detail measured by W4-01: `next/image` silently drops a `lang` prop on next 15.5**, so the annotation must sit on a wrapper element, as Hero already does for its badges. **DEFERRED tonight with this closer** — the `alt` text itself is correct and present; only its language annotation is missing, which is a refinement rather than an incorrectness. |

| **D-36** | **A Next App Router `route.ts` may export ONLY HTTP methods and route config. The lead API's test seam therefore sits at `globalThis.fetch`, not at an exported interface — and this was a FALSE PREMISE in my brief that would have broken the build.** I instructed W5-A to "mock at the interface", exporting `handleLead`/`resolveMailer`/`LeadMailer`. It verified against Next's own source (`next/dist/build/webpack/plugins/next-types-plugin/index.js:41`): the plugin generates `checkFields<Diff<{GET?, POST?, …config}, typeof import('./route')>>`, and `tsconfig.json` includes `.next/types/**/*.ts`. **Any other value export from a route file is a build-time type error** — my instruction was unbuildable, and would have failed the W5 build gate a different delegate owns. Type-only exports are invisible to that check; a test seam is not. | (a) obey the brief → the build breaks; (b) **CHOSEN:** keep the `LeadMailer` interface real and internal (the route genuinely depends on it; a second provider is one new implementation plus one line in `resolveMailer`) and mock one layer lower at `globalThis.fetch`. The delegate argues this is **stronger** for the two tests that matter — it proves the submitted values reach the real outbound payload and that the *real adapter* inspects `response.ok`. It is weaker as a boundary: a second `LeadMailer` implementation would need its own seam. | **Closer, named by the delegate and not built because it lies outside its write-set: extract `app/api/lead/mailer.ts`** — a colocated non-route module, which Next does **not** type-guard, and which is `vi.mock`-able at the interface. One file. **DEFERRED tonight**: there is exactly one provider, the interface exists, and the delegate's own assessment is that the current seam tests more, not less. |

| **D-37** | **The `grep lovable == 0` wave gate is scoped to WHAT SHIPS — dependencies, the module graph, and rendered output — NOT to prose.** W5-B found the gate will go red on `package.json:8`, where an `_IMPOSSIBLE` documentation field lists the pruned scaffolding dependencies by name. **That string is the record of the removal, not a residue of it.** Deleting it to satisfy a text match would erase provenance to make a grep happy — and this is the third time tonight a byte-level gate has produced a false red (D-13: `'use client'` 4 hits all comments; `any` 3 hits all comments; now this). | (a) reword `package.json`'s documentation to avoid the literal → the gate passes and the repo forgets *why* those deps are absent; (b) leave the gate literal → it fails on a correct repo, and the obvious repair is to weaken the gate, which is how a check becomes decoration (law 3). | Broaden the gate back: one line in W7's brief. **The gate now asks the question that matters** — is the vendor in `dependencies`/`devDependencies`, in any import, in any rendered `<meta>`/`og:`/asset URL? — rather than "does this string appear in any byte of the repo". |

| **D-38** | **A test that reads source as TEXT cannot prove a module resolves — and ours proved it by passing for an hour over a file that did not exist.** W5-C measured it: `app/__tests__/seo.test.ts:366` asserted "`Analytics` is imported into the layout" by `readFileSync` + regex. **It was green throughout the entire window in which `components/Analytics.tsx` did not exist.** The repo's only red was `tsc`. **The wave plan's own remedy for our old repo's dead-component defect (`Analytics.tsx`, 54 lines, 0 import sites) was vacuous in exactly the dimension it was written to guard.** The fix: keep both text assertions **and** add `expect(typeof Analytics).toBe('function')`, which passes only if the module actually resolves. | Text-matching is easy and reads like a real assertion. That is what makes it dangerous — law 3: *anything that cannot fail is measuring nothing, and it is MORE dangerous than no check, because it is believed.* | None owed — the stronger assertion is landed in `components/__tests__/Analytics.test.tsx`. **The weaker half at `seo.test.ts:366` is now redundant; W7 should narrow or delete it rather than leave two checks where one is decorative.** **Class finding for W7:** any other assertion in this repo that inspects source as text rather than importing it is suspect by the same argument. |

| **D-39** | **`no-console` is scoped OUT of `scripts/**` — the rule is narrowed to where it means something, not weakened.** W6's `scripts/optimize-assets.mjs` is a build-time CLI that converts 25 memorial photographs and **prints a manifest to a human**; `no-console` forbade its only output channel, producing 15 errors and `npm run lint` exit 1. Rewriting a CLI's report to `console.warn` to satisfy a misapplied rule would make normal output look like warnings — the "widen a bound to make something fit" the hard lines forbid. Same class as **D-13**: a rule applied where it has no meaning produces a red whose obvious repair is to disable the rule. | (a) rewrite the script's output → normal output masquerades as warnings; (b) add `scripts/**` to `ignores` → **rejected**: lint would stop examining the file entirely, going green because it stopped looking, which is worse than the red. The override keeps every other rule in force there (`no-unused-vars`, `no-explicit-any`, `no-non-null-assertion`). | Delete one override block. **The delegate must prove the rule still errors in `components/sections/` and does not in `scripts/` — a two-sided proof, because a scoping change that accidentally disabled the rule everywhere would also go green.** |
| **D-40** | **The 1.5 MB page-weight gate is NOT CLOSED tonight and is NOT accepted — it is handed to W7 to MEASURE.** W6 reports on-disk images totalling **2,586,306 B (2.59 MB)**, failing the gate by 1.09 MB, and refused to dress it up with a subtotal. **But the on-disk sum is the wrong metric for the gate's intent.** The gate is about what a visitor downloads: only `tuval-hero` (**49,824 B**) is eager/`priority`; the other 24 are default-lazy; and Next's optimizer serves resized, format-negotiated variants at request-time dimensions rather than the stored file. **First-paint transferred weight is therefore NOT-MEASURED, and nobody has measured it.** | (a) accept 2.59 MB on the strength of lazy-loading → accepting an unmeasured claim, which is what law 2 forbids; (b) compress further → W6 measured this as unreachable *at a fidelity it would sign*, and halving these photographs again is not a trade an agent makes on a memorial site; (c) section-level `sizes`/eager-loading work → the levers live in files W6 cannot touch. | **Closer: W7 builds, serves `/he`, and measures the bytes a browser actually fetches on first paint** — HTML + CSS + JS + eager images only. That converts NOT-MEASURED into a number. If it still fails, the fix is section-level (`sizes` props, which images are eager), and that is a named, bounded delegate — not more compression. |

| **D-41** | **D-40 RESOLVED BY MEASUREMENT — the page-weight gate PASSES at 0.218 MB first-paint, and the on-disk figure was the wrong metric.** The W5+W6 gate built, served, and measured with **browser-equivalent headers**: **first-paint transfer 217,611 B (0.218 MB)** — HTML 26,943 gzip + CSS 6,020 + JS 157,730 + **one** eager image 26,918 — against a 1.5 MB gate, **1.28 MB of headroom**. Lazy-deferred 1,293,720 B. **Full-scroll total 1,511,331 B.** Metric named explicitly: a page-weight gate protects what a visitor pays *before the page is usable*, and bytes behind `loading="lazy"` are by construction not fetched before scroll. **Stated plainly because it is close: judged against full-scroll instead, the page is over by 11,331 B (0.76%) — that reading FAILS marginally, and the choice of metric is Mati's, not a delegate's.** | Accepting W6's 2.59 MB on the strength of lazy-loading (D-40's rejected option (a)) would have been accepting an unmeasured claim — and would have been **wrong in the other direction**: **transferred full-scroll (1.511 MB) is LESS than on-disk (2.586 MB)**, because Next re-encodes to AVIF at request time. The eager-image claim was **verified by reading served markup**: exactly 1 of 26 `<img>` lacks `loading="lazy"`. | None owed. **Two honest upper bounds recorded:** the gate fetched each image's `src` (the largest srcset candidate, `w=3840` for 23 of 26), so a real browser with `sizes="100vw"` picks `w=640` on a phone — **real transfer is LOWER than every number above**; and the optimizer's cache costs CPU on a cold start, not bytes. |
| **D-42** | **The `middleware.ts` matcher excludes the whole CLASS of Next file-convention metadata routes, not just the one that broke.** `/opengraph-image` was unreachable: 307 → `/he/opengraph-image` → 404. The matcher `/((?!api\|_next\|_vercel\|.*\..*).*)` excludes paths **containing a dot** — `/sitemap.xml` and `/robots.txt` survive **only because they have dots**; `/opengraph-image` does not. **🔴 THE METHOD'S BEST MOMENT TONIGHT: this failure was predicted, in writing, in the file it broke.** `middleware.ts`'s own HONEST LIMIT 1 reads: *"Any future extension-less public path WILL be treated as a localisable route and redirected… W5 must re-read this matcher when it adds sitemap/robots/OG endpoints."* **W5 added exactly that endpoint and did not re-read it.** | Adding `opengraph-image` to the exclusion list closes the instance and leaves the class open — **and the class has already bitten once, after being documented in advance.** §🅴 requires stepping UP: exclude the finite, documented set of Next metadata conventions, determined from the installed Next source rather than from memory. | Revert one matcher line. **The new HONEST LIMIT must state what remains open** — a future Next release adding a convention — as precisely as the one that earned its keep. ⚠️ Constraint on the fix: `/nope` → `/he/nope` and `/fr` → `/he/fr` are ledger-recorded measured-green and **must survive**. |

| **D-43** | **`app/[locale]/layout.tsx`'s `metadataBase` is KEPT, though now redundant.** W5-FIX-3 set `metadataBase` on the **root** `app/layout.tsx` — where it belongs, since it is a property of the site, not of a locale — and that covers every route by construction, including `/_not-found`, which never resolves under `[locale]`. The locale layout's own line now overrides an inherited value with **the same string, from the same helper**. It concluded redundancy and **did not remove it**, correctly leaving the ruling to the seat. | **Is it "dead"?** No. It executes and produces the correct value; it is *redundant*, not dead, so DELETE DEAD THINGS does not reach it. **Is it "one fact two places"?** Also no — the **fact** (the origin) has exactly one home in `lib/seo.ts`; these are two *consumers* of it, and they **cannot drift**, because neither states the value. Removing it would mean editing a file measured green over HTTP for zero functional gain. | Delete one line. **Kept because:** the root's coverage is by construction while the locale's is an explicit same-valued override that documents intent at the locale boundary — and because the two cannot disagree, which is the only thing law 6 actually forbids. |
| **D-44** | **The middleware matcher gets a GUARD TEST — the advisory limit becomes a check that can fail.** This was the **second** failure on one spot. The first was foreseen in writing by a limit that named the wave, the change, and the failure mode — **and was ignored anyway**. §🅴 says stop writing better notes and step up. The delegate that fixed the class said it plainly: *"Without [a guard test], HONEST LIMIT 1(a) is a note a future delegate can ignore exactly as W5 ignored the last one."* | (a) a third, even more precise comment → the first one was already precise enough and did not work; (b) import Next's list into the matcher → **provably impossible**: Next extracts middleware `config` by **static analysis**, and `extract-const-value.js` throws on template literals with expressions and on unknown identifiers, so the matcher must be a single string literal. **That impossibility is exactly why a test is the only available enforcement.** | Delete one test file. ⚠️ **Both halves must be derived at test time** — Next's convention list from `node_modules`, the matcher from `middleware.ts` — because a test carrying a retyped copy of either would drift exactly as the matcher did and pass while Next adds a ninth convention. **That is the failure this entire chain started with.** |

| **D-45** | **A verifier's own instrument is part of what must be red-proved — and one of ours was broken.** W7-A's first Hebrew-codepoint sweep over `components/sections/` returned **0 files with hits**. Its red-proof on a scratchpad mutant **also returned 0**, exposing the detector itself as broken: `perl` without `-CSD` never decodes UTF-8, so it could not have found Hebrew anywhere. Its own words: *"Had I not red-proofed, I would have reported a green that could not have gone red."* It rebuilt the instrument and cross-checked with `grep -P` before reporting. | This is law 3 applied one level up: the rule says prove the CHECK can fail, and a check includes the tool that runs it. **A verifier reporting a green from a broken instrument is indistinguishable from a verifier reporting a real green** — and is more dangerous than no verifier, because it is believed. | None owed — the measurement was repaired before it was reported. **Recorded as a standing rule for W7 and beyond: every zero-result sweep red-proves its own tooling on a mutant, not just its target.** Three instruments were caught misreporting tonight: this one, `grep -ci 'warn'` missing the `⚠` glyph, and a page-weight probe sending no `Accept-Encoding` and measuring uncompressed JPEG where a browser gets gzipped AVIF. |

| **D-46** | **`gold` is defined ONCE in `tailwind.config.ts` as `hsl(var(--accent))` — the token is defined, the 12 instances are NOT patched.** The submit button measured `rgba(0,0,0,0)` on `rgb(0,0,0)`: `bg-gold` emitted **zero CSS rules**, because Tailwind silently emits nothing for an undefined colour. After: **`rgb(209,163,71)`, contrast 9.04:1 (AAA)**, one executable line. **My brief said `gold` was used in 3 places; the sweep found 12** (`text-gold` ×9, `border-gold` ×2, `bg-gold` ×1) — which strengthens the decision rather than weakening it. **And it surfaced a third dead control nobody had named:** `focus:border-gold` at `LeadForm.tsx:236` emitted nothing, so **every form field's focus ring was dead** and keyboard users had no focus feedback at all. | Renaming `bg-gold` to an existing class would have closed **1 of 12** and left the class open — and would not have found the dead focus ring. | Delete one line. **No second gold value exists:** the hue lives only at `app/globals.css:70` `--accent: 40 60% 55%`, and the measured `rgb(209,163,71)` is exactly that. |
| **D-47** | **THREE gold follow-ups are DEFERRED, each with a named closer — none of them affects a visitor today.** (a) **`.text-gold` in `app/globals.css:108` is now redundant** with the real Tailwind utility — two homes for one utility name, the drift this project spent the night removing. Measured: the dev build reports it **twice**; the production minifier dedupes to one, so **runtime cost is zero**. Closer: delete it **and** update `components/sections/__tests__/Hero.test.tsx:17,173`, which documents it as living there — 2 files, a seat ruling because both are others' write-sets. (b) **`gold` and `accent` are now two Tailwind names for one variable.** Collapsing them means renaming 12 uses across four components. (c) **`hsl(var(--accent))` carries no `<alpha-value>`, so `bg-gold/50` will silently fail exactly as `bg-gold` just did** — ⚠️ **and this is true of all 14 colours in the config, not just gold.** The delegate matched the existing convention rather than making `gold` the lone exception, which was right. | Fixing (c) properly is a project-wide convention change touching every colour — a deliberate decision, not a one-token fix, and not one to make unattended at this hour. | (a) 2 files · (b) 12 call sites · (c) 14 colour definitions. **(c) is the one with teeth: the exact failure mode just caught — a utility compiling to nothing, invisible to every static check — remains reachable through any `/opacity` variant anywhere in the palette.** |
| **D-48** | **A verifier caught its own instrument lying, for the third time tonight — by noticing a result that could not be true.** W7-FIX-A's two AFTER runs reported **zero** emitted CSS, including `text-gold`, which had worked in its own BEFORE run. Cause: `EADDRINUSE` meant its new server never started, and a zombie process was serving a `.next` that a failed concurrent build had half-rewritten. **It detected this because the value contradicted its own baseline**, killed only its own process (verified by port and cmdline), and re-measured. Its note: *"a screenshot would have shown 'broken' and I might have blamed my own token."* | — | None owed. **Joins D-45's register: `grep -ci 'warn'` missing `⚠` · a page-weight probe sending no `Accept-Encoding` · a Hebrew detector that could not find Hebrew · and now a CSS probe reading a stale server. Four instruments caught misreporting in one night — every one caught by comparing against a value already known to be true.** |

| **D-49** | **Page routes answer `{GET, HEAD, OPTIONS}`; every other method gets 405 + `Allow`.** Before: `POST`/`PUT`/`DELETE` on `/he` returned the **full 114,195-byte memorial page**, and `OPTIONS` returned a **400 with an empty body and no `Allow`**. The delegate widened the grid past my eight methods and found **`PROPFIND /he` also returned the whole page** — so the defect was never "POST/PUT/DELETE", it was **every method not otherwise handled**. That is why the fix is an **allowlist, not a denylist**. `OPTIONS` is answered in the middleware with **204 + `Allow`** (its answer *is* the `Allow` header, uniform across every matched path, which is why forwarding it produced the empty 400), and the guard runs **before** the locale redirect — a 307 handed to a method that will be refused at the destination advertises a door it will not open. | Denylisting the three reported verbs would have left `PROPFIND` and every future method serving the memorial page. | Delete the guard. **Safety measured, not assumed:** the only POST this app issues is `LeadForm` → `/api/lead`, and `api` is the first alternative in the matcher's exclusion group, so the guard never sees it; and there are **zero** `'use server'` directives in the repo. ⚠️ **The trap is written into the file's header: the first Server Action anyone adds POSTs to a page URL and this guard will 405 it.** 12/12 ledger-green behaviours re-verified; no `Set-Cookie` across all 55 grid cells, asserted programmatically. |
| **D-50** | **`TRACE` returning 500 is DEFERRED to the proxy/CDN layer — it is NOT fixable from this repo, and MY DIAGNOSIS OF IT WAS FALSE ON TWO COUNTS.** I briefed that the `TypeError` arose inside `createMiddleware`'s request construction and that only middleware-matched paths were affected. The delegate decoded the built bundle and refuted both: the throw is in **Next's own `adapter()`** (`server/web/adapter.js:129`) constructing a `NextRequest` at byte offset **32157**, while the first `.handler(` call is at **36740** — **the exception fires before one character of `middleware.ts` executes**, so no guard there could ever catch it. And `config.matcher` cannot help: Next's matcher conditions are `source`/`has`/`missing`/`locale`, and `RouteHas.type` admits only header/cookie/query/host — **there is no method predicate.** | **The second refutation is the instructive one:** I argued the crash was middleware-specific because `/robots.txt` (excluded) correctly 405s. The delegate measured **`TRACE /api/lead` also 500s — and `/api/lead` is matcher-excluded too**, with a different stack (the App Router's own request construction). `/robots.txt` survives only because it is a **static file served without building a WHATWG Request at all**. The real class is *"any path whose handling constructs a WHATWG Request from the node request"*; middleware is one member, not the class. Its verdict: **"A two-path denominator produced a false diagnosis."** | **Closer: refuse `TRACE` at the reverse proxy or CDN** (Vercel already does) **or await a Next-level fix.** ⚠️ **This is an operational note for deployment, not a code task** — and it applies to `/api/lead` as well as to pages. The delegate explicitly refused to wrap the middleware in try/catch to make the symptom vanish, correctly noting the code would never have been reached. |

| **D-51** | **Seven security headers ship on every route via ONE `headers()` rule (`source: '/:path*'`), and `X-Powered-By` is disabled.** Before: **2 of 56** header-observations present (both of them `X-Powered-By`, on the HTML pages every visitor loads). After: **49 of 56** present, `X-Powered-By` correctly gone. Shipped: `X-Content-Type-Options: nosniff` · `X-Frame-Options: DENY` · `Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy` denying 10 device features · `Cross-Origin-Opener-Policy: same-origin` · bare `HSTS max-age=31536000` · and a **partial CSP**: `base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'`. **`form-action 'self'` matters specifically here** — it stops a `<base>`/form-target hijack of the visitor's name, phone and email. | One rule for all paths was chosen over per-route tuning **so that a route added tomorrow is covered the moment it exists** — coverage closed by derivation rather than by remembering. | Delete one config block. **Enforcement was PROVEN, not assumed:** the delegate framed the page cross-origin and captured Chromium's refusal (`Framing … violates … "frame-ancestors 'none'"`), from the same collector that logged **0** violations on the page itself. A CSP that has never blocked anything is a string, not a policy. |
| **D-52** | **`script-src` is deliberately NOT set, and the CSP gap is recorded OPEN rather than papered over.** A `script-src` worth having needs a **per-request nonce**, which can only be minted in `middleware.ts` — a different write-set — because `headers()` is static per route. The nonce-free alternative is `script-src 'unsafe-inline'`, which **stops zero XSS and buys only a scanner badge**; the delegate refused it explicitly. It also refused `connect-src 'self'`, which would have **silently killed GA4 on the day `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set** — delayed, invisible breakage inflicted on someone else. | Shipping a decorative `script-src` would let the gap be marked *closed* while it is open — the exact "check that cannot fail" this project has been removing all night. | **Closer: a nonce minted in `middleware.ts` and read by the header config — crosses two write-sets, so it is a deliberate decision, not a one-file fix.** Every unset directive is named in the file's own HONEST LIMIT: `script-src`, `style-src`, `img-src`, `font-src`, `connect-src`, `default-src`, `frame-src`, `media-src`, `worker-src`, `COEP`, `CORP`, HSTS `includeSubDomains`/`preload`, and `X-XSS-Protection` (omitted **on purpose** — deprecated, and its filter was itself an exploit vector). |
| **D-53** | **CONTRADICTION RESOLVED — the build is NOT red, and a delegate's hash proved it.** W7-FIX-C reported `app/[locale]/page.tsx:130` carrying `export const dynamic = 'error'` and the repo build failing `Route /[locale] … couldn't be rendered statically because it used headers`. W7-FIX-B had used **exactly that line as a diagnostic probe** to force Next to name the offending API, then reported restoring it byte-identical with `sha256 20f75ec3…`. **Seat check: `export const dynamic` appears in NO `[locale]` file, and `page.tsx`'s sha256 begins `20f75ec3` — B's restore held; C observed the transient probe window.** | Had B reported "I restored it" rather than publishing the hash, this would have been unresolvable without a rebuild, and two credible delegates would have stood in direct contradiction over whether the project builds. | None owed. **This is why the standard asks for byte-identical restoration proved by hash rather than asserted** — it turned a blocking contradiction into a one-command check. |

| **D-54** | **The speaker's surname is `Tzanani`. `Tsanani` in the old repo is a MISSPELLING, not a second source — and the rebuild had already corrected it silently.** W8-B found the name spelled two ways in Mati's own material and **refused to write either**, correctly treating it as the same class as the Instagram handle (§OPEN 1) and reporting that it blocked naming the speaker in any document. **Seat check settles it, because unlike the Instagram handle this one has a governing rule** — the customer's own newest build is the permitted source: `ravid_website1` says **`Tzanani` ×7** (4 capitalised, 3 lowercase inside `ravidtzanani6@gmail.com`); our **old** repo says `Tsanani` ×3; **our new `messages/*.json` already says `Tzanani` ×4**, transcribed byte-for-byte in W3. | Treating it as unresolvable would have left a real person's surname unwritable in the handoff. Treating the old repo as co-equal evidence would have reversed a correction the transcription discipline had already made. | **The catalogue needs no change.** Only `package.json`'s prose field still carries the misspelling — **one string, and it is a bereaved brother's surname**, which is why it is worth a delegate rather than a shrug. |
| **D-55** | **THIRD stale figure caught in the seat's own ledger — by a delegate reading it, not by the seat writing it.** The `▶ FIRST ACTION` block said "**8** one-edit items"; §OPEN had since grown to **13 numbered rows** (9–13 appended across W4–W5), with rows 1, 2, 4, 5 marked "✔ landed" — meaning *the constant landed*, not *the question was answered*. W8-B **wrote no open-item count anywhere** rather than propagate a figure it could not reconcile. | **The pattern is now unmistakable and belongs in the handoff:** the quarantine count (65→66), `config/site.ts` line citations (drifted twice), and now this. **Every one was caught by someone reading the ledger, never by the seat writing it** — and every one was a count that was true when written and outlived its measurement. | Corrected in place. **The standing lesson, earned three times: a number in a document is a measurement with an expiry date. Cite where it was measured, or re-measure before repeating it** — which is exactly why W8's briefs forbid retyping any count and require pointing at the ledger instead. |

---

## §OPEN — one-edit items. Each is ONE constant, already seeded, at ONE place.

⚠️ **Line numbers below were MEASURED at the end of W5, not computed.** `config/site.ts` shifted twice tonight (FIXUP-1 added `mailtoLink()`; W5-C added `LEAD_FROM_EMAIL_ENV_VAR`). If anything edits that file again, **re-measure rather than trusting these** — `grep -n 'export const' config/site.ts` settles it in one command. The constant NAMES are given beside every line number precisely so a stale number is recoverable.

All eight are seeded from `ravid_website1` (the customer's own newest build — the only permitted source
per OVERNIGHT_RUN rule 3). `file:line` is filled in by the wave that creates the constant; until then
the seed value and its source are recorded here.

| # | Question | Seeded value (source) | Lives at | Set by |
|---|---|---|---|---|
| 1 | **Instagram handle** — ours `ravid._.t` vs customer's `ravid_.t` (one character) | `ravid_.t` (`ravid_website1/src/components/FormSection.tsx:133`) | **`config/site.ts:78`** (`INSTAGRAM_HANDLE`) — `:82` `INSTAGRAM_URL` is DERIVED from it, so this is **one edit, not two** | W4 ✔ landed |
| 2 | **Lead destination email** — only address found in either repo | `ravidtzanani6@gmail.com` (`Footer.tsx:23`, `FormSection.tsx:20`) | env `LEAD_TO_EMAIL` (name only, **never a value in a file**; name declared `config/site.ts:61`) + public/display fallback **`config/site.ts:58`** (`PUBLIC_EMAIL`) | W5-A ✔ landed |
| 3 | **Publishable numbers** — ours say 300+/15+, customer's say +1000/+57/1400 | `+1000` (`translations.ts:46`), `+57` (`:47`), `למעלה מ 1400 תרומות דם...` (`:38`) | `messages/he.json` + `en.json`, keys `stats[0].num`, `stats[1].num`, `lectureItems[1]` | W3-B |
| 4 | **Wine shop links** — keep wineandfriends.co.il as-is? | 4 product URLs (`WineSection.tsx:9,10,11,14`) | **`config/site.ts:88, 90, 92, 94`** (`WINE_URLS.red/rose/white/trio`) | W4 ✔ landed |
| 5 | **Domain / canonical URL** — **zero occurrences in EITHER repo**; the only source is the plan itself | `https://www.ravid-speaks.com` (`REBUILD_PLAN_v1.00.md:94` §7 Q5 — **Mati's document, not a repo fact**) | env `NEXT_PUBLIC_SITE_URL` (read first, `lib/seo.ts`) → fallback **`config/site.ts:102`** (`SITE_URL`) | W5-B ✔ landed |
| 6 | **`lectureItems[3]` is an empty string** paired with a 4th image (`media-interview.jpeg`) — missing sentence, or an intentional image-only row? | `""` verbatim (`translations.ts:40` / `:159`) | `messages/he.json` + `en.json`, key `lectureItems[3]` — **verified present as `""`, length 4, in BOTH locales**; component behaviour fixed by **D-8** | W4 (LecturesPreview) |
| 7 | **Three hero unit badges carry facts only in `alt` text** — `סמל חטיבה 188`, `פלוגת גולן`, `סמל סופה` — these exist **nowhere** in `translations.ts`. Do they become real copy? | the three `alt` strings verbatim (`HeroSection.tsx:27,30,33`) | `messages/he.json` key `heroBadges[0..2].alt` — **he-only; ABSENT in `en.json`, confirmed by a full-tree grep for English equivalents (none exist)**. Resolution mechanism fixed by **D-18** | W4 (Hero) |
| 8 | **Do our own 7 photos stay?** (`tuval_01..04`, 3 `ravid-lecture-*`, 1.00 MB) — they are in our repo and **not** in the customer's build | keep, pending an answer; they are additive and break no budget | `public/images/` | W6 |

| 9 | **Hebrew 404 copy** — the customer's own `NotFound.tsx` is **English-only** (`404` / `Oops! Page not found` / `Return to Home`, `NotFound.tsx:14,15,17`). A full grep found no Hebrew 404 copy anywhere in their material. Transcribed verbatim into **both** catalogues, because today's Hebrew 404 is *already* English (Next's default) — so this replaces Next's English with the customer's own, inside a correct `lang="he" dir="rtl"` shell with a locale-aware link. Every axis improves, none regresses. **Hebrew is ABSENT and OWED — never invented.** | English, from the customer's own build | `messages/he.json` → `notFound.{title,description,backHome}` | **needs one Hebrew sentence from the family** |

| 10 | **`militaryCards` icons** — the customer's `MilitarySection.tsx` hardcodes three emoji (🛡️🎯🏅) as position-indexed decoration. They have **no catalogue entry**, so W4-03 dropped them rather than hardcode a 3-length list (which would contradict "render whatever the array holds"). Same class as the Wine strings (W1 §6-A): real customer content living in the wrong place. **This is a visible design difference W7's screenshot diff will flag** — recorded here so it is not mistaken for a regression. | the three emoji, from `MilitarySection.tsx` | `messages/{he,en}.json` → `militaryCards[i].icon` | W7 decides: add 3 keys (transcription, permitted) or accept their absence |

| 11 | **`formSending` and `formError` do not exist in the catalogue.** W4-11 needed words for two states the customer's own site never had, *because their site never shows a failure* — that is Defect 2, not an oversight to copy. With no source to transcribe from and authoring forbidden, it closed the gap honestly using only existing keys: pending is carried by `aria-busy` + a disabled control (**no words**), an invalid submit announces the **labels** of the missing fields, and a failure renders the real `formDirect` + a prefilled WhatsApp link into the live region. All three are truthful. **But a failing user is never told, in a sentence, that the send failed.** | nothing — **no source exists in either repo** | `messages/{he,en}.json` → `formSending`, `formError` | **needs two sentences from the customer**; everything else is already wired to render them |

| 12 | **The site `<title>` no longer carries the speaker's name.** The old hardcoded title was `Ravid Tzanani`; metadata is now composed from the catalogue (correctly — W1 measured the old repo duplicating hero copy into metadata, a live drift defect). But **`Ravid` has no catalogue key**: W5-B measured it appearing in `en.json` only inside `testimonials[].text` and `copyright`, and **0 times in `he.json`**. So the title is now the motto alone. For a lecture-booking site, a title with no speaker name is a real discoverability loss. | nothing — no key exists | `messages/{he,en}.json` → a `siteTitle` (or similar) key | **needs the customer's preferred title**; then one line in `lib/seo.ts` |
| 13 | **The OpenGraph share card renders ENGLISH for both locales.** `next/og` ships exactly one face — Latin-only Noto Sans — and there are **0 font files** in this repo outside `node_modules`; remote fetch is unreachable by design (`next.config.js` sets no image `domains`). So a share of `/he` unfurls with English text. **Deliberate:** a restrained card that renders beats one full of tofu boxes, and every string still comes from the catalogue — nothing was authored. ⚠️ **Nobody has looked at this image** — satori/resvg are never invoked without a build, so its pixels are **NOT-MEASURED**. | English catalogue keys (`heroTitle`, `heroSubtitle`, `heroSubtitle2`, `heroDates`) | `app/opengraph-image.tsx` | **Closer: add a licensed Hebrew face (Heebo is SIL OFL, freely redistributable) + a per-locale image route.** Matters because this memorial is shared in bereavement groups, where the unfurl *is* the first impression. |

**Also OPEN, not one-edit:** wine prices are absent from both repos (**NOT-MEASURED**, closable only by
the customer or by fetching the 4 shop pages — no network this session).

---

## §DEFERRED — with what would close each

| Item | Why deferred | What would close it |
|---|---|---|
| **Comment churn: the cookie-gating fact is documented in TWO files** (`i18n/routing.ts` and `middleware.ts`). Three delegates edited comments about it in sequence (W3-I flagged, W3-K fixed one side, W3-L fixed the other), and a cross-reference may now be stale. **This is the patch-over-a-patch spiral in comment form**, and the root cause is ONE FACT TWO PLACES, not any individual edit. | **Closer: give the fact ONE owner — `i18n/routing.ts`, which owns the config — and have `middleware.ts` point at it rather than restate it.** Comment-only, 2 files. Not done tonight: it is documentation, it blocks nothing, and a fourth comment edit before the structural fix would be the very spiral it describes. |
| Runtime proof that `i18n{}` is ignored under App Router | no build was run in W1 (out of scope) | W2's first `npm run build` |
| Whether our 11 `docs/*` are content of record or superseded scratch | a human call; nothing imports any of them | Mati's review of `_legacy/WHY.md` after W2 |
| Rendered-page truth for the customer build (does the empty lecture row visibly break?) | no install/build/browser this session | W7-B playwright, or Mati opening the customer site |
| Wine prices | absent from both repos; needs network or the customer | customer answer, or fetching the 4 product pages |
| Consequences of applying the real `Translations` type to `t` | the customer never applies it, so nothing has type-checked | W3's first `tsc --noEmit` |

---

## §NOT-MEASURED REGISTER — never allowed to take the measured-ABSENT branch

⚠️ **THIS REGISTER IS W1-SCOPED AND HAS BEEN OVERTAKEN — caught by W8-A reading it, not by the seat writing it (the fourth stale figure tonight, see D-55).** Items **1, 2 and 3 below have since been measured** in later waves: runtime behaviour was probed on the wire from W3 onward; `build`/`lint`/`tsc` were executed by every wave gate from W2 on; and the rendered page was opened in Chromium at W7. **The items that remain genuinely unmeasured are 4–8**, plus those recorded in §DEFERRED and §OPEN 13 (the OG card's pixels) and the dynamic-404 half of D-26. The original W1 text is kept below **unedited**, because rewriting a register to match what later became true is how a record stops being one.

1. Runtime behaviour of either site (nothing was built or served)
2. `npm run build` / `lint` / `tsc` exit codes — **read from `package.json`, never executed**
3. The rendered page in any browser
4. Visual content of any image (bytes and dimensions only)
5. Accuracy of our 11 `docs/*` prose
6. Wine prices — absent from both repos
7. The live site's real domain — **zero occurrences in either repo**
8. Git history (deleted/renamed assets, prior versions)

---

## §ARTEFACTS — two similarly-named dashboards, deliberately
`STATUS_DASHBOARD.html` (W8-A) is **the** dashboard: the seven-wave handoff, 51,080 B, renders offline with **zero external requests** (verified by scan: 0 `src=`, 0 `href=`, 0 `<script`, 0 `<link`, 0 `url(`, 0 `http`). `STATUS_DASHBOARD_W7.html` is **W7-B's own verification artefact**, produced hours earlier during the browser pass, and is kept as evidence rather than deleted. **Neither was overwritten by the other**; W8-A flagged the collision rather than resolving it unasked.

## §HONEST LIMIT OF THIS LEDGER
⚠️ **The paragraph below was written at W1 and is now FALSE for most of this document** — kept unedited for the same reason as the register above. Counts from W2 onward *are* confirmed against running builds, a served site and a real browser; see each wave's gate section. What follows describes W1's counts only.

Every count here is static-analysis-derived as of 2026-09-12, before any code was written. No number in
this file has been confirmed against a running build, a browser, or the live site. Import graphs are
literal-string sweeps (blind to dynamic `import()`, template-literal paths, CSS `url()`); barrel files
and dynamic imports were checked for and are absent in both repos. Where a count could not be taken it
appears in §NOT-MEASURED, never as a zero.
