# START HERE

A bilingual (Hebrew source / English) memorial and lecture-booking site, rebuilt from scratch.
Hebrew is the source locale; every word on the page comes from `messages/he.json` or `messages/en.json`.

**State: fifteen waves have run across two overnight sessions.** The ledger `REBUILD_STATUS_v1_00.md`
§WAVES is the only place any count lives; nothing in this file restates one. ⚠️ **The §WAVES board in the
ledger stops at W8 and has not been extended to cover W9–W15** — read the per-wave prose, not the board.

---

## ▶ The first action owed

🔴 **Confirm the lead-sink environment variables are set on the live host.**

Either the pair `KV_REST_API_URL` + `KV_REST_API_TOKEN`, **or** `LEAD_WEBHOOK_URL` (whose value must
have an `https:` scheme — anything else counts as *unconfigured*, not as a broken webhook). **With none
of them set, every real enquiry gets a 503 and nothing is stored anywhere.**

⚠️ **This is a CHECK, not a known failure.** Nothing in this repository can observe the live host. No
agent has seen the hosting dashboard, and a comment in a test file asserting the variables are unset is
prose, not a measurement. Go and look.

## Then: ask the family three questions

These are the only places the site still says something it cannot fully stand behind. Each was left open
deliberately: inventing a fallen soldier's unit name, or words for his memorial, is the one thing no
agent was permitted to do.

1. **§OPEN 7 — the three hero unit badges.** They exist only in Hebrew. The English page shows Hebrew.
   Do they become real copy, and if so in what English?
2. **§OPEN 9 — the Hebrew 404 copy.** None exists anywhere in the customer's material, so both
   catalogues currently hold the customer's English.
   ⚠️ **Answer this one knowingly.** Writing the Hebrew *reveals* a latent regression: today `/en/*` 404s
   look correct only because both catalogues hold identical English. The moment Hebrew exists, English
   visitors will see it. That trade bought static prerendering for every visitor and is documented in the
   ledger at **D-26/D-27 and §W7** — it is a recorded cost, not an accident. (This file cited *D-40/D-41*
   until 2026-09-13; that citation was wrong, and the ledger's own ▶ FIRST ACTION block already carried
   the correction.)
3. **The `imageAlts` question.** Six images serve Hebrew `alt` text on the English page, for the same
   reason as §OPEN 7. Should English alt text exist, or does the Hebrew stand?

## And: Ravid has ten questions of his own

Three waves built complete, typed, compile-proved paths that render **nothing** because no true answer
exists yet — the speaker's own biography (**§OPEN 17**, six values), the heading above it
(**§OPEN 18**), and the privacy notice under the booking form (**§OPEN 19**, three values). None was
invented. See `SESSION_3_DELTA.md`, which also carries **two changes Ravid must approve or veto** —
a reordered page and four rewritten marketing headlines.

Everything else that needs an answer is listed in the ledger's §OPEN table — now **19 rows**, not the 13
the ledger's own header still claims. ⚠️ **Every `file:line` in §OPEN that points into `config/site.ts`
is stale by six lines** (re-measured by W15 on 2026-09-13). The constant NAMES beside them are correct;
`grep -n 'export const' config/site.ts` settles any of them in one command.

---

## Running it

```
npm install
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test       # vitest, single run
npm run e2e        # Playwright, real Chromium — works as of 2026-09-13
```

✅ **`npm run e2e` now works.** This file called it a dead script until 2026-09-13; that was true at §W7-A
and is now FALSE. `playwright.config.ts` and `tests/e2e/cta-visibility.spec.ts` both exist.

⛔ **Do not run `npm run build` to check anything.** Two stale `next-server` processes are holding this
tree — **pid 2368374 on port 3947** and **pid 2604936 on port 3861** — and a build against a `.next/`
they own is non-deterministic (ledger D-130). Neither was started by an agent and neither was killed.
Kill them yourself, or read the build result as meaningless.

No environment variable is required to run locally. What each one changes when you do set it is in
`README.md`.

---

## Where to look

| For | Read |
|---|---|
| Every count, decision, open item and honest limit | `REBUILD_STATUS_v1_00.md` — **the ledger, and the only home of any number** |
| The repo itself: stack, layout, commands, env vars | `README.md` |
| Why it is built this way, and which defects the architecture exists to prevent | `MASTER_PLAN.md` |
| **What changed in the second overnight run (W9–W15), and the two things Ravid must decide** | **`SESSION_3_DELTA.md` — read this one first** |
| What changed in the first session, if you knew the old repo | `SESSION_2_DELTA.md` |
| The same picture on one page, offline, no network | `STATUS_DASHBOARD.html` (open it in a browser) |
| Why a superseded file sits in `_legacy/` — a quarantine, not a bin | `_legacy/WHY.md` |

**Before editing anything**, read `MASTER_PLAN.md`. Several of the rules there exist because a specific
defect was found and removed; re-introducing one is easy and no automated gate will stop you.
