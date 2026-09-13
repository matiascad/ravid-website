# ravid_website

A bilingual memorial and lecture-booking site. Hebrew is the source locale, English is served from a
parallel catalogue, and both locales are prerendered as static HTML.

New to the repo? Read **`START_HERE.md`** first — it is one page and it names the first action owed.

> **Every count, measurement and open question in this project lives in `REBUILD_STATUS_v1_00.md`**
> (the ledger). This README deliberately restates none of them: four documents that each retype the same
> number are four future contradictions. Where a figure matters, this file points at the ledger section
> that owns it.

---

## Content and memorial facts

Every word the site displays comes from `messages/he.json` and `messages/en.json`. No memorial fact is
inlined in a component, interpolated into a template string, or duplicated into metadata. **A name, a
date or a unit designation has exactly one home**, so correcting one is one edit in one file.

Some facts exist only in Hebrew, because no English equivalent exists anywhere in the customer's own
material and none was invented. Those gaps are visible in `en.json` rather than papered over. See the
ledger's §OPEN 7 and §OPEN 9, and the ▶ FIRST ACTION block at the head of the ledger.

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · next-intl · Tailwind CSS 3 · zod · vitest ·
sharp (build-time only).

`package.json` declares the ranges; the exact resolved versions installed for this build are recorded in
the ledger at **§W2 — "Stack resolved (exact)"**. No shadcn `ui/*` component and no icon library is
installed; the sections are plain HTML and Tailwind (ledger D-2).

---

## Layout

```
app/
  layout.tsx              root shell — emits no markup; owns metadataBase (D-43)
  not-found.tsx           the project's only 404 page's outer shell (D-27)
  [locale]/
    layout.tsx            the one <html lang dir> in the project (D-5)
    page.tsx              composition point: one getMessages() call, 13 sections
    not-found.tsx         the 404 copy and markup (D-25)
    [...rest]/            catch-all that makes the localised 404 reachable
  api/lead/route.ts       the lead endpoint
  sitemap.ts robots.ts opengraph-image.tsx    Next file-convention metadata routes
components/
  sections/               the 13 sections + LanguageSwitcher — pure, props-driven, server
  Analytics.tsx           GA4 loader; renders null when unconfigured
i18n/
  routing.ts              the routing contract; owns LOCALES-derived config
  request.ts              per-request locale resolution
  messages.ts             the ONLY sanctioned message reader (D-19, D-20, D-23)
lib/
  seo.ts validation.ts analytics.ts utils.ts
config/site.ts            every seeded constant and env-var NAME, one place (D-7)
messages/{he,en}.json     all copy
middleware.ts             / → /he, the metadata-route matcher, the method guard
scripts/                  build-time asset optimiser (not shipped)
public/images/            optimised .webp assets + MANIFEST.md
_legacy/                  quarantine — see _legacy/WHY.md
tests/e2e/                standalone .mjs browser probes (NOT Playwright specs)
artifacts/screenshots/    the browser-pass screenshots
```

Tests sit in `__tests__/` beside what they test.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | development server |
| `npm run build` | production build |
| `npm run start` | serve the production build |
| `npm run lint` | ESLint — enforces the message-reader ban and the `any`/`!` bans |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | vitest, single run (`npm run test:watch` to watch) |
| `npm run e2e` | ⚠️ **dead script** — see below |

⚠️ **`npm run e2e` is declared but cannot run.** There is no Playwright config and no Playwright spec in
the repo. `tests/e2e/` holds standalone `.mjs` scripts invoked directly with `node`. Recorded in the
ledger at §W7-A; treat any exit code from `npm run e2e` as meaningless.

The lint and typecheck commands examine different file sets — `tests/e2e/**` is linted but sits outside
the tsconfig include. That is intended; see the note under the ledger's §W7 final gate before trying to
reconcile the two counts.

---

## Environment variables

**No value belongs in this repository.** Only the variable *names* appear in code, each declared once as
a typed constant. Nothing here is required to run the site locally.

| Name | Read by | When UNSET |
|---|---|---|
| `RESEND_API_KEY` | `app/api/lead/route.ts`, per request | `/api/lead` returns **503 `delivery_unavailable`** and logs which names are unset to stderr. **It never returns a success.** |
| `LEAD_TO_EMAIL` | `app/api/lead/route.ts` (name declared in `config/site.ts`) | as above — the three are resolved together |
| `LEAD_FROM_EMAIL` | `app/api/lead/route.ts` | as above |
| `NEXT_PUBLIC_SITE_URL` | `lib/seo.ts`, env-first | falls back to the `SITE_URL` constant in `config/site.ts`. Propagates to canonical tags, sitemap, hreflang and the OG card, so a wrong value is wrong in four places at once — which is why it is overridable at deploy time rather than only in code (ledger D-14). |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `lib/analytics.ts` → `components/Analytics.tsx` | `Analytics` renders `null`; no analytics script is emitted and no request is made. This is the current state. |

A variable that is present but blank counts as unset.

**On the three lead variables:** with any of them missing the form still works — it reports the failure
to the visitor and offers a WhatsApp fallback. It does **not** tell the visitor the message was sent.
That guarantee is the reason this rebuild exists; `MASTER_PLAN.md` explains how it is held at both
layers.

---

## `_legacy/`

A **quarantine, not a bin.** Every file in it still exists byte-for-byte, moved with `mv`, never copied
and never deleted. `_legacy/WHY.md` records, for each item, its original path, the named replacement
that supersedes it, and its size. Restoring any item is one `mv` back. Nothing in the live tree imports
anything from it.

---

## Further reading

`START_HERE.md` (one page) · `MASTER_PLAN.md` (architecture and why) ·
`SESSION_2_DELTA.md` (what changed this session) · `REBUILD_STATUS_v1_00.md` (the ledger).
