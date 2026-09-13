# REPORT_W1 — RECON (read-only) · ravid_website rebuild
**Wave** W1 · **Date** 2026-09-12 · **Mode** READ-ONLY (0 files created, 0 edited, 0 deleted in either repo)
**Delegates** 3 (A opus INVENTORY-OURS · B opus INVENTORY-CUSTOMER · C sonnet ASSET+CONTENT DIFF)
**Law** PROMPT_RULES_v1_00.md · **Design** REBUILD_PLAN_v1.00.md · **Counts live in** REBUILD_STATUS_v1_00.md

> **HONEST LIMIT OF THIS REPORT.** Static analysis only. Nothing was built, installed or run:
> `node_modules` is not installed in our repo, no `npm run build`, no `tsc`, no browser, no network.
> Every "renders as" statement is derived from source, not observed. Import graphs are literal-string
> sweeps: blind to dynamic `import()`, template-literal paths, CSS `url()` and barrel re-exports
> (checked: no barrel exists in `ui/`, zero dynamic `import(` in customer `src/`). Git history was
> not examined. Wine prices and the live site's real domain are outside both repos.

---

## §1 DENOMINATOR BEFORE VERDICT — what exists · what was examined

| Sweep | Exists | Examined | Result | State |
|---|---|---|---|---|
| Our repo files (excl. node_modules/.git/lock/.next) | 43 | 43 | 35 text + 8 binary | PRESENT |
| Our git-tracked files | 34 | 34 | 9 untracked non-ignored | PRESENT |
| Our monolith visual blocks | 1 file, 594 L | read in full | 8 `<section>` + 1 `<footer>` + 1 floating CTA = **10** | PRESENT |
| Our hardcoded-Hebrew files | 11 code/config | 11 | 2 files · 120 lines · 122 runs | PRESENT |
| Our form endpoints | 11 code files | 11 | **0** | measured-ABSENT |
| Our test files / test config | 43 | 43 | **0** | measured-ABSENT |
| Customer repo files (no node_modules present) | 124 | 124 | full tree | PRESENT |
| Customer render sites | 1 page + 1 router | 2 | **13** render sites, 2 routes | PRESENT |
| Customer `src/components/*.tsx` (non-ui) | 14 | 14 | 12 rendered + 1 unused helper | PRESENT |
| Customer `src/components/ui/*` | **49** | 49 | 12 with any edge · **4** reachable from `main.tsx` · **37** zero edges | PRESENT |
| Customer translation keys | 65 top-level × 2 locales | 130 | 120 flattened leaves each · **0 one-sided** | PRESENT |
| Customer `lovable` sweep | whole repo | all | 17 source hits / 5 files (+156 lockfile) | PRESENT |
| Media files, BOTH repos | **39** (ours 11, customer 28) | 39 | all bytes measured; 38 raster dims measured, 1 SVG vector | PRESENT |
| Customer `src/assets/` | **26** | 26 | 25 referenced · 1 UNREFERENCED | PRESENT |
| gif / avif / mp4 / mov / pdf, both repos | — | both trees | **0** | measured-ABSENT |
| **NOT-MEASURED, counted separately: 8** | | | runtime behaviour · build/lint exit codes · rendered page · image visual content · our `docs/*` accuracy · wine prices · live domain · git history | NOT-MEASURED |

---

## §2 PREMISE TABLE — every REBUILD_PLAN_v1.00.md number is a CLAIM (law 7)

### 2a — claims about OUR repo
| Plan ref | Claim | Verdict | Truth |
|---|---|---|---|
| §0, §1#1 | monolith **594 lines** | **CONFIRMED** | `wc -l` = 594 (595 text lines; final `}` has no trailing newline). 32,927 B |
| §1#1 | **8 sections** | **FALSE as stated** | 8 `<section>` tags, but **10 top-level visual blocks** (+`<footer>`, +floating WhatsApp CTA); 14 if the 4 named nested sub-blocks are split |
| §1#1 | 1 file · no i18n · no component boundaries | **CONFIRMED** | 2 components total, 1 of them dead; no `messages/`, no `[locale]/` |
| §1#2 | `handleSubmit` = `alert()` only, zero delivery | **CONFIRMED** | 2 `alert()` + state reset. 0 `fetch`, 0 `<form>`, 0 `action=` |
| §1#2 | at **L30–45** | **CONFIRMED exactly** | lines 30–45 inclusive |
| §1#3 | `i18n{}` in `next.config.js`, Pages-Router-only | **CONFIRMED (structural)** | L8–11 `locales:['he']`. No `pages/` dir exists. Runtime effect NOT-MEASURED (no build run) |
| §1#9 | our Instagram = `ravid._.t` | **CONFIRMED** | 6 consistent occurrences, **zero internal conflict** |
| §1#8 | our old numbers 300+ / 15+ | **CONFIRMED** | `:292` `300+`, `:297` `15+` |
| §1#8 | email `ravidtzanani6@gmail.com` | **FALSE about our repo** | our repo contains **no email address at all**; only the form placeholder `example@email.com` |
| §5 | "formsubmit.co is 3rd-party" risk | **FALSE about our repo** | 0 occurrences. Ours has **no delivery path whatsoever** — strictly worse than the row implies |
| §0 | stack is **Next.js 15** | **FALSE as a present fact** | `package.json` pins `next@^14.0.4`, `react@^18.2.0`. Next 15 is a major upgrade, unbudgeted in §4 |
| §5 | image weight / LCP risk | **FALSE about our repo** | our `public/` = 1,003,383 B (1.00 MB) across 8 files, already under the 1.5 MB page budget |
| §4 | 15 files moved to `_legacy/` | **CANNOT-TELL** | plan names none. Candidate pool = 23 tracked non-asset files. Closed by: the seat naming the manifest (done — see ledger §DECISIONS D-W2-1) |
| §6 DoD#6 | 0 hardcoded Hebrew in `components/sections/` | **CANNOT-TELL (vacuous today)** | that directory does not exist; the grep passes over 0 files. Closed by: re-running with the denominator printed after W4 |

### 2b — claims about the CUSTOMER repo
| Plan ref | Claim | Verdict | Truth |
|---|---|---|---|
| §1#7 | **26 assets** | **CONFIRMED** | exactly 26 in `src/assets/` — but only **25 are referenced** |
| §1#7 | **≈8.7 MB** raw | **FALSE** | **8,113,564 B = 8.11 MB** (7.74 MiB). Plan's figure is block-rounded `du`, ~7% high |
| §1#7 | `blood-donation.jpg` 2.3 MB | **CONFIRMED** | 2,296,067 B · 1440×1920 |
| §1#7 | `tuval-hero.png` 1.29 MB | **CONFIRMED** | 1,285,929 B · 843×1264 |
| §1#7 | served unoptimized via `<img>` | **CONFIRMED** | every asset is a raw `<img src={import}>` |
| §1#6 | **49** shadcn `ui/*` files | **CONFIRMED** | 49 |
| §1#6 | **~13 used** | **FALSE** | **4** reachable from `main.tsx` (`sonner`,`toaster`,`toast`,`tooltip`); 12 have any inbound edge; **37 have none**. **Zero shadcn primitives are used by any of the 13 sections** — they are raw HTML + Tailwind |
| §2 | **13 sections** | **CONFIRMED** | 13 render sites in `src/pages/Index.tsx` (11 `<section>` + `<footer>` + floating switcher). The plan's own 13 names match 1:1 |
| §1#5 | `t: any` | **CONFIRMED — and worse** | `LanguageContext.tsx:6` `t: any`, **plus a second undeclared leak** `HowItLooksSection.tsx:20` `(f: any)`. The declared `Translations` type at `translations.ts:239` is **never applied** |
| §1#5 | language in memory only, no URL/persistence/SEO | **CONFIRMED** | `useState<Lang>("he")`; 0 localStorage/cookie/`navigator.language`; `dir` on an inner `<div>`, **never on `<html>`**; `index.html` permanently `lang="he" dir="rtl"` |
| §1#4 | Vite SPA, no SSR, no per-locale URLs | **CONFIRMED** | Vite 5.4.19, React 18.3.1, `createRoot().render()`, routes `/` and `*` only |
| §1#4 | `og:image` → lovable.dev | **CONFIRMED** | `index.html:15` and `:19` |
| §1#4 | `author: Lovable` | **CONFIRMED** | `index.html:9`; also `og:title` `Lovable App`, `twitter:site` `@Lovable` |
| §1#4 | `lovable-tagger` dep | **CONFIRMED** | `package.json:82`, used `vite.config.ts:4,15` |
| §1#8 | email `ravidtzanani6@gmail.com` | **CONFIRMED** | `Footer.tsx:23-24`, `FormSection.tsx:20` |
| §1#8 | 1000+ soldiers | **CONFIRMED, string differs** | verbatim **`+1000`** (not `1000+`), label `חיילים השתתפו` — `translations.ts:46`/`:164` |
| §1#8 | 57 lectures | **CONFIRMED, string differs** | verbatim **`+57`**, label `הרצאות הועברו`, desc `ברחבי הארץ` — `:47`/`:165` |
| §1#8 | 1400 donations | **CONFIRMED, not a standalone number** | it is a sentence: he `למעלה מ 1400 תרומות דם...` `:38` / en `Over 1,400 blood donations...` `:157`. **he has no thousands comma, en does** |
| §1#8 | Wine section, 3 SKUs + trio | **CONFIRMED** | `WineSection.tsx:9,10,11` + `TRIO_URL:14` |
| §1#8 | Knesset/media | **SPLIT** | media = PRESENT as text (`lectureItems[2]` `הרצאות אל מול נבחרי ציבור וכלי תקשורת`). **Knesset = ABSENT as text** — it exists only as the image `knesset-bg.jpeg` |
| §1#9 | customer Instagram = `ravid_.t` | **CONFIRMED** | `FormSection.tsx:133` href, `:138` display |
| §5 | formsubmit.co + WhatsApp fallback kept | **CONFIRMED present — but the fallback is broken by construction** | see §6-F |
| §7 Q5 | domain `www.ravid-speaks.com` | **CANNOT-TELL** | **zero occurrences in EITHER repo** (denominator: all 16 customer URLs + our full tree). Closed by: the customer, or DNS/host records |

---

## §3 CONTRADICTIONS BETWEEN DELEGATES — found and resolved

| # | Contradiction | Resolution | Adopted value |
|---|---|---|---|
| 1 | B: customer `src/assets` = **8,117,660 B**. C: **8,113,564 B**. | Difference is exactly **4,096 B** = one directory inode. B used `du -b` (counts the directory entry); C summed `os.path.getsize` over the 26 files. For a page-weight budget the file sum is the correct figure. | **8,113,564 B (8.11 MB)** |
| 2 | A: "our repo total assets" vs C: "3.95 MB total found in ours". | A counted `public/` only (the shipped surface); C also counted 3 dev screenshots in `Claude outputs/` (2.95 MB) which are not site assets. Both correct under their own denominators. | site assets **1,003,383 B** (8 files); non-site screenshots 2,946,230 B, excluded from every page-weight figure |
| 3 | A: "our repo has 10 visual blocks, plan's 8 is wrong — what is W4's fan-out?" vs plan §3: 13 sections. | **Seat judgement:** the fan-out is derived from the **target** (the customer build we are matching), not from the monolith we are discarding. B measured the target at **13 render sites** and the plan's 13 names match 1:1. | **W4 fan-out = 13, CONFIRMED** |
| 4 | Plan §1#8 lists "Knesset/media" as one migrated fact. | B: media is a translation string; Knesset is only a background image filename. | recorded separately: media **PRESENT**, Knesset-as-text **ABSENT** |

No other disagreement was found between the three reports. Where two delegates measured the same thing independently (26 assets, `blood-donation.jpg` bytes, `tuval-hero.png` bytes, the Instagram handles, the WhatsApp number, the named friends, the unit line, the Hebrew dates) they **agreed exactly**.

---

## §4 OUR REPO — the eight findings

**File census** 43 files / 43 examined. Monolith `components/TuvalMemorialLanding.tsx` 594 L. Other code: `app/layout.tsx` 30 L, `app/page.tsx` 7 L (`'use client'` at the **root** — the whole tree is a client component today), `app/globals.css` 32 L, `components/Analytics.tsx` 54 L (**dead: 0 importers of 11 files scanned**, and self-disabling with both id constants empty). 11 `docs/*` files, 2,142 L, nothing imports any of them. `public/` 8 files / 1,003,383 B. `.next/` present on disk (48 files, 22.7 MB) but correctly gitignored and **not tracked**. `node_modules` **not installed**.

**Monolith block map** — 0: floating WhatsApp CTA L56–66 · 1: hero L68–117 · 2: story `#about` L119–243 (nested 2a personal L126–194, 2b military L196–216, 2c last battle L218–240) · 3: lecture gallery L245–284 · 4: stats L286–313 · 5: lecture content L315–409 (nested 5a format L387–407) · 6: testimonials L411–450 · 7: why L452–474 · 8: contact `#contact` L476–573 · 9: footer L575–592. Logic L1–53.

**Hardcoded copy** 2 of 11 files carry Hebrew: monolith 115 lines / 117 runs, `app/layout.tsx` 5 lines / 5 runs. **100% of user-visible copy is hardcoded; there is no catalogue of any kind.** `app/layout.tsx` metadata is an independent second copy of the hero copy — a live ONE-FACT-ONE-PLACE violation.

**Form** `handleSubmit` L30–45: validates name+phone non-empty, shows a Hebrew alert reading *"Thank you for your enquiry. We will contact you shortly."*, then destroys the lead. There is **no `<form>` element** — a `<div>` with 5 inputs and a `<button onClick>`: no native submit, no Enter-key submit, no browser validation. **100% silent lead loss, while telling the user the opposite.** Highest-severity finding in our repo.

**ONE-FACT-ONE-PLACE violations already live in our repo** (all currently agree; each is a future contradiction): WhatsApp number ×4 copies · Instagram ×7 copies · life dates ×5 files · unit `גדוד 53`/`188` ×5 files / 7 occurrences · hero copy duplicated between the monolith and `app/layout.tsx` metadata · `OVERNIGHT_RUN_v1_00.md` byte-identical in root and `Claude outputs/`.

---

## §5 CUSTOMER REPO — section order, the message catalogue, the real endpoint

**Render order (`src/pages/Index.tsx:18–30`)** — 1 LanguageSwitcher(17 L) · 2 HeroSection(76) · 3 StorySection(32) · 4 MilitarySection(48) · 5 LecturesPreviewSection(53) · 6 StatsSection(31) · 7 WhatYouGetSection(46) · 8 HowItLooksSection(33) · 9 TestimonialsSection(37) · 10 WhySection(43) · 11 WineSection(87) · 12 FormSection(149) · 13 Footer(40). Total 692 L rendered. **`NavLink.tsx` (28 L) has 0 importers — dead.**

**Anchor contract the plan never records: `#top` · `#story` · `#form` · `#copyright`** (`HeroSection.tsx:12`, `StorySection.tsx:8`, `FormSection.tsx:40`, `Footer.tsx:30`, linked from `Footer.tsx:27`), with `html{scroll-behavior:smooth}`. Every CTA depends on these four ids. Dropping them silently breaks every call to action.

**Message catalogue** 65 top-level keys per locale, **120 flattened leaves each, 0 one-sided** — he and en are in exact parity. Arrays that must stay arrays: `militaryCards[3]`, `lectureItems[4]`, `stats[4]`, `whatContent[3]`, `whatAudience[4]`, `howFormats[3]`, `testimonials[3]`, `whyReasons[3]`.

**The real endpoint** `POST https://formsubmit.co/ajax/ravidtzanani6@gmail.com` (`FormSection.tsx:20-30`), JSON body `{name,phone,email,organization,message,_subject}`, `_subject` = `` `פנייה חדשה מ${name} – הזמנת הרצאה` ``. Required inputs: name, phone only.

**Design tokens** — the full `:root` HSL block was captured verbatim from `src/index.css:8–50` for W2 to copy, including the two non-shadcn customs `--bg2: 240 30% 10%` and `--bg3: 240 35% 7%`, the utility `.text-gold`, and `--accent: 40 60% 55%` (the gold). Dark is the **only** theme: `:root` is already dark and there is no `.dark` block. Font: Heebo 300–900 via a render-blocking Google Fonts `@import` with no `preconnect`.

---

## §6 WHAT THE PLAN DOES NOT KNOW — the highest-value class

| # | Finding | Evidence | Consequence for the rebuild |
|---|---|---|---|
| **A** | **Wine SKU names, image mapping and shop URLs are hardcoded in the component, not in `translations.ts`** — including the bilingual pair `"מארז שלישייה"`/`"Trio Package"` inline | `WineSection.tsx:8-14,43,48,63,68` | W4's Wine delegate must **author ~8 message keys that do not exist**, not translate existing ones. Plan's "no new copy" rule needs this explicit carve-out: the strings exist, only their *location* changes |
| **B** | **The phone number `972503112243` / `050-311-2243` appears nowhere in the plan** | `FormSection.tsx:35,125,130`; ours `:58,562,564` | It is a publishable contact fact in both repos and must become a typed constant |
| **C** | `lovable-agent-playwright-config` is **imported but not installed** (absent from `package.json` and the lockfile) | `playwright.config.ts:1`, `playwright-fixture.ts:3` | Two customer files are dead on arrival. Do not carry them across; W7 writes its own playwright config |
| **D** | **A working vitest harness already exists in the customer repo** — `vitest.config.ts`, `src/test/setup.ts` (jsdom + matchMedia polyfill), `@testing-library/react` + `jest-dom`, scripts `test`/`test:watch` | `package.json:12-13,68-71,81` | W2 copies this pattern instead of inventing one. Our repo has **zero** test infrastructure, so W2 must install it **before** W4 can gate on anything |
| **E** | The four in-page anchors `#top #story #form #copyright` | §5 above | A contract with the live design; must be preserved by name |
| **F** | **The WhatsApp fallback is unreachable for HTTP errors** — the `catch` branch only fires on network failure; a formsubmit 4xx/5xx **resolves**, so `setSubmitted(true)` runs and the user is shown `הפנייה נשלחה בהצלחה!` for a lead that was never delivered. No `res.ok`, no `await res.json()`, no `_captcha:false`, no loading state, no double-submit guard | `FormSection.tsx:19-37` | Plan §5 says "WhatsApp deep-link fallback kept". **Keeping it as written keeps the bug.** This is an architecture correction, not a port |
| **G** | **`lectureItems[3]` is a deliberate empty string `""`** in both locales, paired 1:1 with a 4-image array; the component renders `images[i]` for every item | `translations.ts:40,159`; `LecturesPreviewSection.tsx:8,12,26-41` | The 4th image (`media-interview.jpeg`) renders with an **empty heading and empty `alt`** — an a11y defect and a content hole the plan does not know exists |
| **H** | `dir` is applied to an inner `<div>`, **never to `<html>`**; `index.html` is permanently `lang="he" dir="rtl"` | `LanguageContext.tsx:24`; `index.html:2` | English renders LTR content inside an RTL document root. **The customer's visual reference therefore contains this artefact** — W7's screenshot diff must expect our correct version to differ from their broken one, and must not treat that as a regression |
| **I** | **4 dead things in the customer build**: `NavLink.tsx` (28 L), `src/App.css` (42 L), `public/placeholder.svg`, `src/assets/hero-memorial.jpg` (222,345 B) | import + asset sweeps | Only **25** assets migrate, not 26 |
| **J** | **Three hero unit badges carry unit facts only in `alt` text** — `hativa188.png` `alt="סמל חטיבה 188"`, `plugat-golan.png` `alt="פלוגת גולן"`, `sufa-badge.png` `alt="סמל סופה"` | `HeroSection.tsx:1-3,27,30,33` | `פלוגת סופה` / `פלוגת גולן` exist **nowhere in `translations.ts`**. Without new keys these unit facts are lost or machine-translated |
| **K** | `public/robots.txt` already exists with explicit Googlebot/Bingbot/Twitterbot/facebookexternalhit allows | `public/robots.txt` | W5 must preserve that intent, not overwrite it blind |
| **L** | **A second `any` leak the DoD grep would miss** — DoD #6 greps the literal `t: any`; `HowItLooksSection.tsx:20` is `(f: any)` | — | **The gate must be `\bany\b` scoped to `components/`, or it passes while `any` survives.** A check that cannot go red is decoration (law 3) |
| **M** | Custom tokens `--bg2`, `--bg3` and utility `.text-gold` are **not** part of any stock shadcn init | `index.css:12-13,74-76` | A plain `shadcn init` in W2 will silently not produce them |
| **N** | ~25 heavy runtime deps shipped unused: recharts, embla-carousel, react-day-picker, date-fns, cmdk, vaul, input-otp, react-resizable-panels, next-themes, react-hook-form+resolvers, zod, @tanstack/react-query (instantiated at `App.tsx:10,13`, **never queried**) | `package.json:16-64` | Plan's prune list covers ui *files*, not the npm deps they drag in |
| **O** | Both `bun.lock`/`bun.lockb` **and** `package-lock.json` are committed | repo root | Package-manager ambiguity — irrelevant to us (we scaffold our own), recorded so nobody copies the ambiguity across |

---

## §7 ASSET CENSUS — 39 media files, all measured

**Customer `src/assets/` — 26 files · 8,113,564 B · 25 referenced · 1 UNREFERENCED**

| file | bytes | WxH | ref |
|---|---|---|---|
| blood-donation.jpg | 2,296,067 | 1440×1920 | LecturesPreviewSection.tsx:2 |
| tuval-hero.png | 1,285,929 | 843×1264 | HeroSection.tsx:4 |
| plugat-golan.png | 430,938 | 1536×1024 | HeroSection.tsx:2 |
| wine-rose.png | 394,430 | 1000×1000 | WineSection.tsx:2 |
| lecture-soldiers.jpg | 361,916 | 2000×1500 | WhatYouGetSection.tsx:2 |
| wine-trio.png | 295,702 | 600×600 | WineSection.tsx:5 |
| wine-white.png | 288,284 | 1000×1000 | WineSection.tsx:4 |
| wine-bg-tanks.jpg | 267,440 | 1440×1920 | WineSection.tsx:6 |
| speech-event.jpeg | 261,714 | 1920×1280 | LecturesPreviewSection.tsx:3 |
| wine-red.png | 252,988 | 1000×1000 | WineSection.tsx:3 |
| tank-firing.jpeg | 244,497 | 1600×844 | MilitarySection.tsx:1 |
| knesset-bg.jpeg | 235,939 | 1200×1600 | HowItLooksSection.tsx:1 |
| **hero-memorial.jpg** | **222,345** | 1920×1080 | **UNREFERENCED → _legacy/** |
| soldier-landscape.jpg | 175,979 | 1508×1439 | WhySection.tsx:2 |
| helmet-bird.jpg | 168,896 | 1440×1920 | StorySection.tsx:2 |
| stats-bg-soldier.jpg | 162,597 | 934×2000 | StatsSection.tsx:2 |
| tank-friends.jpg | 155,113 | 1080×1080 | Footer.tsx:2 |
| tuval-gdud53.jpeg | 146,834 | 1920×1440 | MilitarySection.tsx:2 |
| form-bg-tank.jpg | 92,893 | 1024×683 | FormSection.tsx:3 |
| tuval-samar.jpeg | 73,622 | 1296×864 | MilitarySection.tsx:3 |
| israel-flag.jpg | 73,345 | 1024×1024 | TestimonialsSection.tsx:2 |
| military-bg-flag.webp | 68,836 | 1024×1024 | MilitarySection.tsx:4 |
| media-interview.jpeg | 59,984 | 1080×607 | LecturesPreviewSection.tsx:4 |
| lectures-bg-soldiers.jpg | 49,672 | 720×896 | LecturesPreviewSection.tsx:5 |
| hativa188.png | 32,444 | 596×845 | HeroSection.tsx:1 |
| sufa-badge.png | 15,160 | 126×150 | HeroSection.tsx:3 |

Customer `public/`: `favicon.ico` 20,373 B (256×256, **not linked from index.html**), `placeholder.svg` 28,625 B (**0 references**).
**Our `public/`** — 8 files, 1,003,383 B, all referenced: tuval_04.jpg 371,724 (2048×1536) · ravid-lecture-1 260,238 (2048×1365) · ravid-lecture-2 124,560 (1600×1066) · ravid-lecture-3 84,140 (1079×714) · tuval_01.jpg 72,392 (519×673) · tuval_03.jpg 46,182 (720×471) · tuval_02.jpg 43,224 (720×960) · favicon.ico 923 (48×48).
**Excluded from every page-weight figure:** 3 dev screenshots in `Claude outputs/`, 2,946,230 B, UNREFERENCED — not site assets.

**W6 arithmetic (from measured bytes, not estimates):** 25 live customer assets = 7,891,219 B. The 300 KB cap binds on 2 files only (blood-donation 2.30 MB, tuval-hero 1.29 MB); 23 of 25 are already under 300 KB before conversion. Our own 7 photos (1.00 MB) are a **separate set** — W1 did not determine whether they are also wanted on the new site. Recorded OPEN.

---

## §8 CONTENT DIFF — verbatim, both repos

| Fact | OURS | CUSTOMER | Verdict |
|---|---|---|---|
| Soldier count | `300+` (`:292`) | `+1000` (`translations.ts:46`) | **DIFFERENT** |
| Lecture count | `15+` (`:297`) | `+57` (`:47`) | **DIFFERENT** |
| Blood donations | **ABSENT** (Stats has exactly 4 tiles, all read) | `למעלה מ 1400 תרומות דם...` (`:38`) | **ONLY-IN-CUSTOMER** |
| Instagram | `ravid._.t` (`:566`,`:568`) | `ravid_.t` (`FormSection.tsx:133,138`) | **DIFFERENT — one character** |
| Email | **ABSENT** (only field placeholder `example@email.com`) | `ravidtzanani6@gmail.com` | **ONLY-IN-CUSTOMER** |
| WhatsApp | `972503112243` / `050-311-2243` | `972503112243` / `050-311-2243` | **SAME** |
| Recommendations stat | `100%` | `100%` | SAME |
| 4th stat | `∞` label `השראה וזיכרון` | `∞` label `זיכרון` | symbol SAME, label differs |
| Name + rank | `סמ"ר תובל יעקב צנעני ז"ל` | `סמ"ר תובל יעקב צנעני ז"ל` | **SAME verbatim** |
| Brigade / battalion | `עוצבת ברק (188)` / `גדוד 53` | identical | **SAME** |
| Memorial-family line | `משפחת ברק גדוד 53 פלוגת גולן` | identical | **SAME** |
| Life dates | `20.11.2003 - 04.12.2023` (hyphen-minus) | `20.11.2003 – 04.12.2023` (en-dash) | **DIFFERENT — dash character only** |
| Hebrew dates | `כ' בחשוון תשס"ד` / `כ"א בכסלו התשפ"ד` | identical | **SAME** |
| Age at death | `בן 20 בנופלו` | `בן 20 בנופלו` | **SAME** |
| Named friends | `איתן פיש ויקיר ידידיה שינקולבסקי ז"ל` | identical | **SAME verbatim** |
| Motto | `"בסוף הכל יהיה בסדר"` | `"בסוף הכל יהיה בסדר"` | **SAME** |
| Wine (4 SKU links) | ABSENT | wineandfriends.co.il ×4 | **ONLY-IN-CUSTOMER** |
| Any price / ₪ | ABSENT (0 hits) | ABSENT (0 hits) | **SAME — both ABSENT** |
| Site domain | ABSENT | ABSENT | **SAME — both ABSENT** |
| Speaker `רביד צנעני` | our repo: **metadata only**, never in visible copy | `copyright` key, visible | DIFFERENT placement |

---

## §9 RED-PROOFS — every zero-result check proved able to return non-zero

| Zero result | Proof it can go RED |
|---|---|
| Hebrew grep = 0 on 9 of 11 our files | identical grep returned **115** on the monolith and **5** on `app/layout.tsx`, same invocation |
| our endpoint grep = 0 over 11 code files | identical pattern matched **7 files** inside `.next/` |
| our `<form>` = 0 | same `grep -rn` on the same file returned **5** for `onClick|useState` |
| `Analytics` import sites = 0 | the same method returned **2 files** for `TuvalMemorialLanding` — a genuinely-imported component does show its import site |
| our test files = 0 | same `find -name` shape returned **3** for `*.config.js` |
| our `_v2/_new/_final` = 0 | same `find` shape returned **5** for `*v1_00*` |
| `.next/` tracked in git = 0 | `git ls-files \| wc -l` = **34** in the same invocation |
| 37 customer `ui/*` unimported | identical per-file loop returned non-empty importer lists for **12** others |
| no section imports shadcn | same grep returned **4** hits outside `ui/` and **14** inside it |
| no localStorage/cookie for language | same alternation fired on `ui/sidebar.tsx:68` (`document.cookie`) |
| no analytics id | tight regex `\bG-[A-Z0-9]{9,}\b` **matched** a synthetic control string, then returned 0 over the repo (a looser first regex false-positived on `bg-background` and was discarded) |
| no SSR / `'use client'` / `next/` | same invocation returned `createRoot` at `main.tsx:1,5` |
| no `gpt-engineer` / `.lovable` | the same case-insensitive sweep returned **17** `lovable` hits |
| `placeholder.svg` 0 refs | same invocation style found 17 `lovable` hits; `ls -l` confirms the path spelling |
| Knesset text absent | same grep form returned `תקשורת` at `:39` — Hebrew matching works; the literal `knesset` fires on the asset. Only the word `כנסת` is genuinely absent |
| 0 one-sided translation keys | the same comparator printed a **non-empty** `DUP_HE` list (`text`,`icon`) — the set-difference machinery produces output when a difference exists |
| no `ravid-speaks.com` | the URL regex producing this zero returned **16** other URLs in the same run |
| unreferenced assets (3 ours, 3 customer) | same grep returned 1 hit for `tuval_01.jpg` / `blood-donation.jpg` |
| no ₪ / price in either repo | same session's `wine` grep returned 20+ hits |
| no gif/avif/mp4/mov/pdf | the identical single `find` returned **11** and **28** hits for the other extensions |
| donations / Wine / Knesset absent from our repo | backed by a **positive read**, not only a grep: the whole 595-line file was read and the Stats section has exactly 4 tiles, all transcribed |

**Three-state tally, W1: PRESENT 54 · measured-ABSENT 18 · NOT-MEASURED 8.** Skips are counted separately and never folded into passes.
