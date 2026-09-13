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
    page.tsx              composition point: ONE getMessages() call, 14 components
    not-found.tsx         the 404 copy and markup (D-25)
    [...rest]/            catch-all that makes the localised 404 reachable
  api/lead/route.ts       the lead endpoint
  sitemap.ts robots.ts opengraph-image.tsx    Next file-convention metadata routes
components/
  sections/               16 .tsx files — see the note below
  Analytics.tsx           GA4 loader; renders null when unconfigured
content/
  speaker.ts              the speaker's own biography — typed, proved, and EMPTY (§OPEN 17)
i18n/
  routing.ts              the routing contract; owns LOCALES-derived config
  request.ts              per-request locale resolution
  messages.ts             the ONLY sanctioned message reader (D-19, D-20, D-23)
                          ⚠️ z.strictObject — a catalogue key with no schema key
                          throws at MODULE LOAD and the site fails to serve
lib/
  seo.ts validation.ts analytics.ts utils.ts
  analytics/              track.ts + events.ts — the nine funnel events
  leads/                  the lead sink port: types, port, log, autoresponse
    sinks/                kv · webhook · http · composite · unconfigured · resolver
  seo/jsonld.ts           structured data
config/site.ts            every seeded constant and env-var NAME, one place (D-7)
messages/{he,en}.json     all copy
middleware.ts             / → /he, the metadata-route matcher, the method guard
scripts/                  build-time asset optimiser (not shipped)
public/images/            optimised .webp assets + MANIFEST.md
_legacy/                  quarantine — see _legacy/WHY.md
playwright.config.ts      the e2e runner's config
__tests__/                repo-level tests (middleware matcher, security headers)
tests/e2e/                *.spec.ts = Playwright · *.mjs = standalone node probes
artifacts/                screenshots and e2e output
```

**On `components/sections/`:** 16 `.tsx` files, of which `app/[locale]/page.tsx` composes **14** — 13
sections plus `LanguageSwitcher`. The other two are not page-level sections: `TrackedLink.tsx` is the
analytics-instrumented link used by five sections, and `PrivacyNotice.tsx` is rendered *by* `LeadForm`
(`LeadForm.tsx:964`), gated on `resolvePrivacyNotice(m)`, and emits **zero bytes** until §OPEN 19 is
answered. Older docs said "13 sections"; that count was correct before `Speaker.tsx`,
`PrivacyNotice.tsx` and `TrackedLink.tsx` existed.

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
| `npm run e2e` | Playwright — real Chromium at 390×844, `/he` |

✅ **`npm run e2e` now works.** The "dead script" warning that stood here until 2026-09-13 was true when
it was written and is now FALSE: `playwright.config.ts` exists at the repo root and
`tests/e2e/cta-visibility.spec.ts` is a real spec. Measured by W15 at 06:29 on 2026-09-13:
**6 passed, exit 0, 12.8 s, 1 worker, project `chromium-mobile-390`.**

`tests/e2e/` now holds **both** kinds of probe and they are not interchangeable — `*.spec.ts` are
Playwright specs that `npm run e2e` collects; `*.mjs` (`capture-screenshots`, `form-and-rtl`,
`visual-verify`, plus the shared `e2e.env.mjs`) are standalone scripts still invoked directly with
`node` and are **not** collected by the Playwright run. A green `npm run e2e` says nothing about them.

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
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `lib/analytics.ts` → `components/Analytics.tsx` | `Analytics` renders `null`; no analytics script is emitted and no request is made. This is the current state. ⚠️ **There is no consent banner. Setting this variable starts tracking without one** — ledger §OPEN 15, the one open row with consequences beyond the screen. |
| `KV_REST_API_URL` | the lead sink resolver, `lib/leads/sinks/**` | **see the block below — this is the first thing to check on the live host** |
| `KV_REST_API_TOKEN` | as above (the two are resolved together) | as above |
| `LEAD_WEBHOOK_URL` | as above — the *alternative* to the KV pair | as above. ⚠️ A value whose scheme is not `https:` counts as **unconfigured**, not as a misconfigured webhook. |

A variable that is present but blank counts as unset.

🔴 **The lead sink is what makes an enquiry outlive the email.** Either the `KV_REST_API_*` pair **or**
`LEAD_WEBHOOK_URL` must be set on the deployed host. **With none of them set, `/api/lead` returns 503 and
nothing is stored** — a real enquiry from a bereaved family is not queued, not retried and not recorded
anywhere. Nothing in this repository can observe the live host, so **this is a check, not a known
failure.** Confirm it in the hosting dashboard.

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

`START_HERE.md` (one page, and it names the first action owed) · `MASTER_PLAN.md` (architecture and why) ·
`SESSION_3_DELTA.md` (what changed in the second overnight run — **and the two changes Ravid must approve**) ·
`SESSION_2_DELTA.md` (the first run) · `STATUS_DASHBOARD.html` (the same picture on one offline page) ·
`REBUILD_STATUS_v1_00.md` (the ledger — every count, every decision, every open item).
