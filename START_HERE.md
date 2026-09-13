# START HERE

A bilingual (Hebrew source / English) memorial and lecture-booking site, rebuilt from scratch.
Hebrew is the source locale; every word on the page comes from `messages/he.json` or `messages/en.json`.

**State: all seven rebuild waves are closed and independently verified** — see `REBUILD_STATUS_v1_00.md`
(the ledger) §WAVES. The ledger is the only place any count lives. Nothing in this file restates one.

---

## The first action owed

**Ask the family three questions.** These are the only places the site still says something it cannot
fully stand behind. Each was left open deliberately: inventing a fallen soldier's unit name, or words
for his memorial, is the one thing no agent was permitted to do.

1. **§OPEN 7 — the three hero unit badges.** They exist only in Hebrew. The English page shows Hebrew.
   Do they become real copy, and if so in what English?
2. **§OPEN 9 — the Hebrew 404 copy.** None exists anywhere in the customer's material, so both
   catalogues currently hold the customer's English.
   ⚠️ **Answer this one knowingly.** Writing the Hebrew *reveals* a latent regression: today `/en/*` 404s
   look correct only because both catalogues hold identical English. The moment Hebrew exists, English
   visitors will see it. That trade bought static prerendering for every visitor and is documented in the
   ledger at D-40/D-41 — it is a recorded cost, not an accident.
3. **The `imageAlts` question.** Six images serve Hebrew `alt` text on the English page, for the same
   reason as §OPEN 7. Should English alt text exist, or does the Hebrew stand?

Everything else that needs an answer is listed in the ledger's §OPEN table, each one already seeded from
the customer's own newest build and wired to a single named constant — one edit per answer. Read the
warning at the head of §OPEN before trusting any `file:line` there.

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
npm run e2e        # ⚠️ DEAD SCRIPT — see below
```

⚠️ **`npm run e2e` does not work.** The script is declared, but there is no Playwright config and no
Playwright spec in the repo; `tests/e2e/` holds three standalone `.mjs` probe scripts instead, run
directly with `node`. Recorded by the ledger at §W7-A. Do not read a pass from it.

No environment variable is required to run locally. What each one changes when you do set it is in
`README.md`.

---

## Where to look

| For | Read |
|---|---|
| Every count, decision, open item and honest limit | `REBUILD_STATUS_v1_00.md` — **the ledger, and the only home of any number** |
| The repo itself: stack, layout, commands, env vars | `README.md` |
| Why it is built this way, and which defects the architecture exists to prevent | `MASTER_PLAN.md` |
| What changed this session, if you knew the old repo | `SESSION_2_DELTA.md` |
| Why a superseded file sits in `_legacy/` — a quarantine, not a bin | `_legacy/WHY.md` |

**Before editing anything**, read `MASTER_PLAN.md`. Several of the rules there exist because a specific
defect was found and removed; re-introducing one is easy and no automated gate will stop you.
