# REBUILD PLAN v1.00 — ravid_website → Next.js 15 + i18n
**Date** 2026-09-12 · **Mode** PLAN ONLY (no code touched) · **Executor** Claude Code (atomic agents + dynamic workflows) · **Managers** Mati + Claude (Cowork)

---

## 0. GOAL
Rebuild the memorial/lecture-booking site **in our repository** (`/home/mati/project/ravid_website`) so it matches the customer's Lovable design (`ravid_website1`) in look, content and behaviour, but on **our stack and architecture**: Next.js 15 App Router + TypeScript strict + Tailwind + shadcn/ui, **i18n-ready (he/en, RTL/LTR, locale-routed)**, SSR/SEO, real form delivery, optimized images.
**Deep rebuild — not adaptation.** The 594-line monolith and the Vite SPA are both discarded as structure; only *content, design tokens and assets* are carried over.

## 1. WHY REBUILD (evidence)
| # | Finding | Source | Verdict |
|---|---|---|---|
| 1 | Our site = 1 file, 594 L, 8 sections, no i18n, no component boundaries | `components/TuvalMemorialLanding.tsx` | not extendable → rebuild |
| 2 | Our form `handleSubmit` = `alert()` only, zero delivery | same, L30-45 | rebuild |
| 3 | Our `next.config.js` has `i18n{}` — Pages-Router-only key, ignored by App Router | `next.config.js` | rebuild config |
| 4 | Customer app is a **Vite SPA** (no SSR, no per-locale URLs, `og:image` → lovable.dev, `author: Lovable`, `lovable-tagger` dep) | `index.html`, `vite.config.ts`, `package.json` | cannot ship as-is |
| 5 | Customer i18n = React context + `t: any`, language in memory only (no URL, no persistence, no SEO hreflang) | `src/i18n/*` | re-implement properly |
| 6 | 49 shadcn `ui/*` files shipped, ~13 used | `src/components/ui/` | prune |
| 7 | 26 assets ≈ 8.7 MB raw (`blood-donation.jpg` 2.3 MB, `tuval-hero.png` 1.29 MB), served unoptimized via `<img>` | `src/assets/` | asset pipeline |
| 8 | Content changed vs our live site: 1000+ soldiers (was 300+), 57 lectures (was 15+), 1400 blood donations, **new Wine section (3 SKUs + trio, external shop)**, Knesset/media, friends named, email `ravidtzanani6@gmail.com` | `src/i18n/translations.ts`, `WineSection.tsx` | migrate content verbatim |
| 9 | ⚠️ Instagram handle conflict: ours `ravid._.t` vs customer's `ravid_.t` | both repos | **ASK CUSTOMER** |

## 2. TARGET ARCHITECTURE
```
ravid_website/
├─ app/
│  ├─ layout.tsx                 # html shell only
│  ├─ [locale]/
│  │  ├─ layout.tsx              # dir=rtl|ltr, lang, fonts(Heebo), providers, metadata/locale
│  │  ├─ page.tsx                # composes <Section/> list (server component)
│  │  └─ not-found.tsx
│  ├─ api/lead/route.ts          # POST → zod validate → email (Resend) → 200/4xx
│  ├─ sitemap.ts · robots.ts · opengraph-image.tsx
├─ components/
│  ├─ sections/                  # 13 atomic sections, one file each, props-driven
│  │  Hero · Story · Military · LecturesPreview · Stats · WhatYouGet ·
│  │  HowItLooks · Testimonials · Why · Wine · LeadForm · Footer · LanguageSwitcher
│  └─ ui/                        # shadcn, only what is used (~13)
├─ content/                      # typed content model (no strings in components)
├─ messages/he.json · en.json    # next-intl, typed keys, arrays kept as arrays
├─ i18n/routing.ts · request.ts  # next-intl middleware + locale negotiation
├─ lib/  (cn, analytics, seo, validation)
├─ public/images/                # webp/avif, ≤300 KB each
└─ _legacy/                      # old monolith + docs moved here by mv (Mati commits)
```
**Rules:** server components by default, `'use client'` only in LanguageSwitcher + LeadForm; zero hardcoded copy in components; `next/image` everywhere; design tokens = the Lovable HSL palette (dark navy + indigo + gold) in `globals.css`.

## 3. WORKFLOW FOR CLAUDE CODE — 8 waves, atomic agents
| Wave | Agents | Type | Output | Gate |
|---|---|---|---|---|
| W1 Recon | 3 ∥ | read-only | inventory(old) · inventory(new) · asset audit + content diff | REPORT_W1.md |
| W2 Scaffold | 1 | write | Next 15 app, TS strict, Tailwind tokens, shadcn init, `mv` old → `_legacy/` | `npm run build` green |
| W3 i18n core | 1 | write | next-intl routing `/he` `/en`, middleware, `translations.ts` → typed `he.json`/`en.json`, dir switch | both locales render |
| W4 Sections | 13 ∥ | write | 1 agent = 1 section + its message keys + its vitest | per-section test green |
| W5 Platform | 3 ∥ | write | `api/lead` + zod + email + WhatsApp fallback · SEO/OG/sitemap/hreflang · analytics (GA4 id placeholder) | lead POST 200 in test |
| W6 Assets | 1 | write | sharp → webp, responsive `sizes`, ≤300 KB, LCP hero priority | total page ≤1.5 MB |
| W7 Verify | 3 ∥ | read+test | tsc/eslint/build · playwright he+en × mobile+desktop screenshots · a11y + RTL audit | 0 errors |
| W8 Handoff | 1 | write | README, MASTER_PLAN, STATUS_DASHBOARD.html, SESSION_2_DELTA.md, tarball | Mati reviews |
Dynamic rule: W4 fans out per section found in W1's inventory; a section whose test fails re-enters as its own atomic fix agent, never a rewrite of the wave.

## 4. FILES / LINES ESTIMATE
| Bucket | Files | Lines ± |
|---|---|---|
| app/ (routes, api, seo) | 9 | +520 |
| components/sections | 13 | +1450 |
| components/ui (pruned shadcn) | ~13 | +900 |
| messages + content + i18n | 6 | +780 |
| lib + config + tests | 12 | +640 |
| moved to `_legacy/` | 15 | −0 (mv, no delete) |
| **Total** | **~53 new** | **≈ +4300 / −594** |

## 5. RISK
| Risk | Level | Mitigation |
|---|---|---|
| Content accuracy (memorial facts, numbers) | 🔴 high | copy verbatim from `translations.ts`; no invented numbers; customer confirms #9 |
| RTL↔LTR layout flips | 🟡 med | logical properties (`ps/pe/ms/me`), playwright screenshots both locales |
| Image weight / LCP | 🟡 med | W6 pipeline + `priority` on hero only |
| Form deliverability (formsubmit.co is 3rd-party) | 🟡 med | our `api/lead` + Resend, WhatsApp deep-link fallback kept |
| Scope creep from 49 shadcn files | 🟢 low | prune list fixed in W2 |

## 6. TEST / DEFINITION OF DONE
1. `npm run build` + `tsc --noEmit` + `eslint` → 0 errors
2. `/he` and `/en` both render 13 sections; `dir` and `lang` correct; switcher changes URL
3. Lead POST → 200 + email received; failure path opens WhatsApp
4. Playwright: 4 screenshots (he/en × mobile/desktop) diffed against customer design
5. Lighthouse ≥ 90 perf / 100 SEO / ≥ 95 a11y; page weight ≤ 1.5 MB
6. grep: 0 `lovable`, 0 `placeholder.svg`, 0 `t: any`, 0 hardcoded Hebrew inside `components/sections/`

## 7. OPEN QUESTIONS FOR THE CUSTOMER
1. Instagram: `ravid._.t` or `ravid_.t`?
2. Lead email destination: `ravidtzanani6@gmail.com` only, or + WhatsApp notification?
3. Numbers to publish: 1000+ soldiers / 57 lectures / 1400 donations — confirm final.
4. Wine section: keep external shop links (wineandfriends.co.il) as-is?
5. Domain: keep `www.ravid-speaks.com`, redirect `/` → `/he`?

---
**NEXT:** Mati answers "Y" → Claude Code receives W1 (recon, read-only) as the first atomic wave.
