# REPORT — W16 · independent verification, reconstructed and re-measured

> ## ▶ FIRST ACTION — a CHECK on the live host, not the 404
>
> **Go to the hosting dashboard and confirm the lead-sink environment variables are set:
> `KV_REST_API_URL` + `KV_REST_API_TOKEN`, or `LEAD_WEBHOOK_URL` with an `https:` scheme.
> With none of them set, every real enquiry gets a `503` and nothing is stored.**
>
> ⚠️ **State it as a check, not a known failure. Nothing in this repository can observe the live host** — no agent
> has seen the hosting dashboard, and a comment in a test file asserting the variables are unset is prose, not a
> measurement. ⚠️ **A `LEAD_WEBHOOK_URL` whose scheme is not TLS-secured counts as UNCONFIGURED, not as a
> misconfigured webhook — it does not half-work.**
>
> ⚠️ **And new this wave (D-159): the admin read-back route needs `LEAD_ADMIN_TOKEN` set, or it answers `404` —
> deliberately, not `401` (D-158). Unset, the alarm that tells you "enquiries are saved but nobody was told" is a
> number nobody can reach.**

---

**Who wrote this.** W16-DOC, a documentation delegate. It wrote **no source file, no test, no message catalogue and
no `config/site.ts` entry**, and did **not** touch `REBUILD_STATUS_v1_00.md`. Every defect below is **REPORTED, NOT
FIXED**.

**Why this file exists.** The independent verifier **W16-E** produced a full report and **the harness refused its file
write**, so its findings survive only as text inside the ledger's **D-179 … D-182**. This document reconstructs that
report from those four entries **plus W16-DOC's own re-measurement**, and marks at every point which of the two a
number came from. ⚠️ **The same refusal hit W16-DOC's first attempt to write this file; it was written through a
different tool. The failure mode is real and recurring, and a verifier's findings should not live only in a report
that the harness may refuse.**

**One fact, one place.** `REBUILD_STATUS_v1_00.md` owns every count. This file either **points at it with a section
or `D-` citation**, or **carries a number W16-DOC measured itself, with the command that produced it.** Nothing here
is retyped from memory.

---

## 1 · THE FIVE GATES

⚠️ **Re-measured by W16-DOC on 2026-09-13, ~10:35–10:50, in `/home/mati/project/ravid_website` at the working tree
as it stands.** Each row carries **the command**. **Passed and skipped are counted separately throughout — a skipped
test is not a passed test.**

⚠️ **Order matters and was obeyed:** `e2e` was run **before** `next build`, because `npm run e2e` starts `next dev`,
which overwrites `.next`. Running them the other way round is how a correct site measured as completely unstyled
(D-179). **No server was started and no port was probed by W16-DOC.**

| GATE | COMMAND W16-DOC RAN | RESULT W16-DOC MEASURED | LEDGER (D-179, W16-E) | VERDICT |
|---|---|---|---|---|
| Types | `npx tsc --noEmit` | **exit 0**, no output | exit 0 | **replayed** |
| Lint | `npx eslint . -f json`, summing `errorCount`/`warningCount` | **113 files examined · 0 errors · 0 warnings** (`npm run lint` also exit 0) | 113 files · 0 · 0 | **replayed** |
| Unit | `npx vitest run` | **exit 0 · 46 files · 694 tests = 693 passed + 1 skipped + 0 failed** | 46 files · **690 tests · 689 passed · 1 skipped** | ⚠️ **replayed GREEN, but the totals MOVED — see 1a** |
| Browser | `npm run e2e` | **exit 0 · 6 passed · 15.5 s · 1 worker · `chromium-mobile-390`** | 6 passed | **replayed** |
| Build | `npx next build` ×2 | **exit 0 / exit 0** · **`⚠` glyph count 0 and 0**, counted by glyph not by eye | ×3 from clean, exit 0/0/0, `⚠` 0 | **replayed** |

**STILL FAILING: 0 · NEWLY FAILING: 0 · SKIPPED: 1** (counted separately, not folded into either).

### 1a · The one number that moved, and why that is the point of this section

⚠️ **`vitest` is at 694 tests today (693 passed + 1 skipped). D-179 records 690 (689 + 1). That is +4 tests, and the
difference is NOT a failure — it is D-55 happening again, live, in this document's own source.**

**W16-E measured its 690 BEFORE the last atomic fix landed.** D-183 records W16-FIX4 changing
`app/[locale]/not-found.tsx` and its test file after the verification pass; `git status` shows
`app/[locale]/__tests__/not-found.test.tsx` modified. **So D-179's figure is STALE, not false** — it was true when it
was taken. ✅ **The file count (46), the skip count (1) and the failure count (0) are unchanged.**

⛔ **Do not quote "690 tests" again.** Quote **694 / 693 / 1 / 0**, or re-run `npx vitest run`.

### 1b · Prerendering — verified by DISK and MANIFEST, never by the bullet

🔴 **`next build`'s route table LIES about prerendering (D-176): W16-FIX1 changed exactly one variable in an isolated
rig and the table still printed the SSG bullet for `/[locale]` listing `/he` and `/en`, while `he.html` and `en.html`
were ABSENT from disk and `prerender-manifest.routes` fell 7 to 4.** ⛔ **The bullet is therefore not evidence and is
not quoted here as evidence.**

**What W16-DOC measured on disk after its own build:**

| ARTEFACT | PRESENT? | BYTES (build 1) | BYTES (build 2) |
|---|---|---|---|
| `.next/server/app/he.html` | **PRESENT** | **120,123** | 120,123 |
| `.next/server/app/en.html` | **PRESENT** | **114,014** | 114,014 |
| `.next/server/app/_not-found.html` | **PRESENT** | **8,218** | 8,218 |
| `.next/prerender-manifest.json` routes | **7** | 7 | 7 |

Manifest routes, enumerated: `/sitemap.xml` · `/_not-found` · `/en` · `/he` · `/robots.txt` · `/favicon.ico` ·
`/opengraph-image`.

✅ **The 7-to-4 degradation D-176 warns about is ABSENT in this build. The warning was right to issue; the defect is
not present.**

**Determinism.** The route table, per-route sizes and chunk hashes are **byte-identical between W16-DOC's two builds**
(`diff` of the extracted table: no output). `BUILD_ID` is a random id, not a content hash, and differs — stated, not
hidden.

⚠️ **HONEST LIMIT ON THIS ROW, and it is a real methodological gap: W16-DOC built TWICE WITHOUT CLEARING `.next`
FIRST. W16-E built THREE TIMES FROM CLEAN (D-179). The `he.html`/`en.html` mtimes did not advance on build 2, so the
second build may have reused `.next/cache` rather than re-rendering. Byte-identity across two cached builds is WEAKER
evidence than D-179's three-from-clean. Take the determinism claim from D-179, not from here.**

### 1c · Two served-byte figures in the ledger are now stale

⚠️ **D-167 records the served pages at `/he` 119,928 B and `/en` 113,819 B, each byte-identical by SHA-256 to its
prerendered artefact. W16-DOC measures the artefacts at 120,123 B and 114,014 B — each exactly +195 B.**

**This is expected and benign, not a contradiction:** D-167 measured before W16-FIX4 (D-183) added `lang` and `dir`
to the `<main>` of `app/[locale]/not-found.tsx`, and per D-162 that component is passed as the client
`NotFoundBoundary`'s **prop**, so it is serialised into the payload of **both content pages** on every render. **A
+195 B delta on both pages, identical, is exactly the shape that change predicts.**

⛔ **W16-DOC did NOT re-run the SHA-256 artefact-versus-wire comparison** — that needs a served production server, and
serving was out of scope. **Byte-identity of served page to prerendered artefact is `NOT-MEASURED` by W16-DOC and
stands on D-167.**

---

## 2 · THE COMPOSITION TABLE

⚠️ **SOURCE WARNING, and it is the most important sentence in this section: W16-E's per-element table died with its
refused file write. The ledger's D-180 preserves the AGGREGATES and four individual values; it does not preserve the
per-CTA or per-field rows. W16-DOC drove no browser and computed no style. Everything below is therefore ledger-read,
and the rows that were never written down are marked `NOT-SOURCEABLE` rather than reconstructed.**

### 2a · CTAs

| WHAT | VALUE | STATUS | SOURCE |
|---|---|---|---|
| CTAs visible at real computed styles | **16 of 16 visible, 0 invisible** | **PRESENT** | D-180 |
| `hero_book` / `why_book` box, `/he` | **223 × 52** | **PRESENT** | D-180 |
| `hero_book` / `why_book` box, `/en` | **261.4 × 52** | **PRESENT** | D-180 |
| Submit button painted colour | **`rgb(209,163,71)`** — the real painted pixel, not the class name | **PRESENT** | D-180 |
| `gold` utilities emit real CSS in the built stylesheet | all three emit; `gold` defined at `tailwind.config.ts:105` | **PRESENT** | D-180 |
| Per-CTA computed box for the other 14 | — | **NOT-SOURCEABLE** — died with W16-E's refused file write | — |

⚠️ **The `hero_book`/`why_book` row is where the seat was WRONG and W16-E corrected it: the seat carried a single
figure for both locales. It needs a locale qualifier — `/en` is about 17% wider. A one-number claim about a
two-locale site is a claim with a missing dimension.**

⚠️ **The `bg-gold` class of defect — a CTA invisible because its utility emits no CSS — is closed BY MEASUREMENT of
the painted pixel, not by the class name being present in the markup.**

### 2b · Form fields

| WHAT | VALUE | STATUS | SOURCE |
|---|---|---|---|
| Form fields unclipped | **10 of 10** | **PRESENT** | D-180 |
| Honeypot `hp_ref` | **0 × 0**, correctly | **PRESENT** | D-180 |
| Horizontal overflow at 390 and at 1440, both locales | **none** | **ABSENT (good)** | D-180 |
| Per-field computed box for each of the 10 | — | **NOT-SOURCEABLE** | — |

⚠️ **The overflow probe could have failed loudly and once did: during W16-E's dev-clobber it returned `scrollWidth`
1928 against a 390 viewport. That it returns clean now is a real reading, not a vacuous one.**

### 2c · The privacy notice's contrast over what is ACTUALLY PAINTED BEHIND IT

⚠️ **The method is the finding here, and it is worth keeping: W16-E screenshotted the element AS RENDERED, then set
EVERY GLYPH to `transparent` and re-shot. The brightest sampled pixel in the second shot is therefore genuinely
BACKDROP and not a letter.** A naive "read the backdrop" measurement samples its own text and reports a contrast no
reader experiences.

| WHAT | VALUE | STATUS |
|---|---|---|
| Body text | `rgb(209,213,219)` at 14 px | **PRESENT** |
| Heading | `rgb(255,255,255)` | **PRESENT** |
| Panel behind the notice | `rgba(0,0,0,0.4)` | **PRESENT** |
| Border | `1px solid rgba(255,255,255,0.2)` | **PRESENT** |
| Contrast, typical | **13.64 – 13.72 : 1** | **PRESENT** |
| Contrast, 99th percentile | **8.16 – 9.63 : 1** | **PRESENT** |
| Contrast, **at the brightest sampled backdrop pixel** | **at least 6.00 : 1** — above WCAG AA's 4.5 : 1 | **PRESENT — PASSES** |
| Locales × widths covered | **4 of 4** (both locales, both widths) | **PRESENT** |

✅ **The reason it passes is STRUCTURAL, not lucky:** the notice's own `rgba(0,0,0,0.4)` panel floors the backdrop
near black **regardless of what the photograph behind it does.** That is the sentence to keep, because it survives a
change of photograph and "13.7:1" does not.

✅ **Served bytes and rendered text AGREE:** `curl /he` carries the Hebrew heading and `curl /en` the English one, in
the payload — not client-injected (D-180).

### 2d · Focus indicator — the composition result that did NOT pass

⚠️ **CONFIRMED ALIVE but BELOW GUIDANCE.** `:focus-visible` genuinely matches and the border goes to
`rgb(209,163,71)` — **but it is still 1 px, below WCAG 2.2 SC 2.4.11's 2 px.** ⚠️ **And the
`outline: rgba(0,0,0,0) solid 2px` beside it PAINTS NOTHING — it is Tailwind's `outline-none` transparent-outline
idiom, not an indicator. Anyone reading "2px" out of that declaration is reading a name, not a thing.** (D-180.)

---

## 3 · THE ADVERSARIAL TABLE

🔴 **W16-DOC COULD NOT SOURCE THIS TABLE, AND SAYS SO RATHER THAN RECONSTRUCTING IT.**

**D-180 records the aggregate — "Adversarial battery 14/14 PRESENT" — and names exactly TWO of the fourteen.** The
enumeration of the other twelve was in W16-E's report, and **that file write was refused.** ⛔ **Inventing twelve
plausible attack names to fill a table of 14 would be precisely the failure this ledger has caught twenty times.**

| # | ATTACK CLASS | RESULT | STATUS | SOURCE |
|---|---|---|---|---|
| 1 | **`401` on the admin read-back, requested against a store CONFIRMED to hold a real lead** (`lead:01M2CTHVSNDBV0J6T8RWRWPCQ8` present at the moment of refusal — *"a 401 over an empty store proves nothing"*) | refused; body `=== '{"error":"unauthorized"}'`; `www-authenticate` `null` | **PRESENT** | D-180, D-158 |
| 2 | **Idempotency race, measured by counting RECORDS after defeating a confound** — first attempt fired 12 concurrent and got 12 × `429` because the rate limit fires before idempotency, so `DELTA=0` proved nothing; it waited out the window, re-fired 5, and got **`DELTA=1`** | one record from five concurrent duplicates | **PRESENT** | D-180 |
| 3–14 | **twelve further classes** | reported `14/14 PRESENT` in aggregate | ⚠️ **`NOT-SOURCEABLE` individually** — named in a report whose file write was refused | D-180 aggregate only |

⚠️ **What "14/14 PRESENT" is worth, stated honestly: an aggregate from a verifier whose per-item evidence cannot be
re-read is a CLAIM, not a citation. The two preserved rows are unusually good — each defeats a confound that would
have made a green result meaningless — which is reason to believe the other twelve were done to the same standard,
and is NOT the same as being able to check them.**

### 3a · Attack results that ARE individually sourceable, from the build wave

These are **not** part of W16-E's 14 — they are the build delegates' own before-and-after proofs against a running
server, and they are quotable because the ledger carries them:

| ATTACK | BEFORE | AFTER | STATUS | SOURCE |
|---|---|---|---|---|
| `Content-Type: text/plain;charset=UTF-8` POST | **`201 {"ok":true,"id":"01M2CSCEEPFHR132GGS2YBN7XM"}`**, a real record stored | **`415 {"ok":false,"error":"unsupported_media_type"}`** | **PRESENT** | D-170 |
| `Origin: https://evil.example` POST | **`201`**, another real record | **`403 {"ok":false,"error":"foreign_origin"}`** | **PRESENT** | D-170 |
| The honest form, real Chromium, JS on | — | **`201`**, success panel rendered, URL unchanged | **PRESENT** | D-170 |
| `OPTIONS /api/lead` | — | **`405` + `allow: POST`, NO `Access-Control-Allow-Origin`** | **PRESENT** | D-170 |
| Scriptless submit leaking fields into the URL | `/he?hp_ref=&name=No+Js+Visitor&phone=0507654321&email=nojs%40example.com&…` | **not expressible** — `method="post"` with no `action` makes a native submit a POST to the page, which `middleware.ts` refuses; Playwright `javaScriptEnabled:false`, resulting query string `(EMPTY)` | **PRESENT** | D-172 |
| Rate limit, curl sending no `x-forwarded-for` | — | `201 201 201 201 201 429 429 429` — **the limiter engaged; `next start` injects the header** | **PRESENT** | D-173 |
| Rate limit, **client-supplied EMPTY** `x-forwarded-for` / `x-real-ip` | — | 🔴 **`201` × 8 — the reachable fail-open.** Rotating `x-forwarded-for: 8.8.8.$i` also yields `201` × 8 | 🔴 **PRESENT — open, reported not fixed** | D-173 |

🔴 **The last row is the one to carry: the ATTACKER, not the platform, chooses fail-open, and one header defeats the
rate limit.** D-173 refused to fix it because `RATE_LIMIT` behaviour was a pinned outcome in another delegate's brief
— correctly. **It is open.**

---

## 4 · TAUTOLOGIES, STALE PROSE, NON-TEXT FILES, SKIPS — each with a denominator (Law 2)

### 4a · Tautologies — 1 confirmed, RE-VERIFIED BY W16-DOC

✅ **W16-DOC opened the file and read the lines. This one is real.**

`app/__tests__/seo.test.ts`, verbatim:

```
210      const alternates = languageAlternates();
211      expect(alternates[locale]).toBe(canonical);
212      // and every locale sees the identical alternate set
213      expect(alternates).toEqual(languageAlternates());
```

🔴 **Line 213 is two calls to the same ZERO-ARGUMENT function. It can fail only if `languageAlternates()` is
non-deterministic.** ⚠️ **And it is worse than empty: the comment at `:212` claims it proves "every locale sees the
identical alternate set". It proves no such thing — `alternates` is reassigned from the same no-arg call on every
iteration, and the loop variable `locale` reaches NEITHER SIDE of the assertion.** **A comment that claims more than
its assertion is a false comment at the exact place a reader stops checking.**

**Denominator (D-182):** 2 named files, **about 16 same-path candidates examined** → **1 clear tautology**, **3 weak
round-trip identities** at `lib/seo/__tests__/jsonld.test.ts:419`, `app/__tests__/seo.test.ts:260` and `:276`.
✅ **W16-DOC read `seo.test.ts:260` and `:276`: both re-derive an expected value from `siteOrigin()` and
`SITEMAP_PATH` / `OG_IMAGE_PATH`. They are weak — they can only fail if the composition changes — but they are NOT
zero-content, and "weak round-trip identity" is the right label. D-182's classification holds.**

✅ **One candidate was CLEARED rather than swept in, and that restraint is worth recording: `seo.test.ts:219` is NOT a
tautology — `app/sitemap.ts:57` calls `languageAlternates(route)` WITH an argument while the test calls it without, so
it has real content.**

⚠️ **`CANNOT TELL`, explicitly NOT "none found": "tests that faithfully prove the WRONG behaviour."** D-182 returned
this as out of budget — re-deriving intent across 694 assertions is not a sweep. ⛔ **It must never be read as a
clean result.**

### 4b · Stale prose — 0 confirmed, and the RAW count is published

**Denominator (D-182):** **the 11 files this wave touched** → **0 confirmed stale**, with the **raw count published:
17 function-name hits, all platform APIs the heuristic cannot resolve.** ✅ **Publishing the raw 17 beside the
confirmed 0 is what makes the 0 readable; a bare "0 stale" hides its own denominator.**

🔴 **BUT THE WAVE'S OWN SWEEP FOUND SIX FALSEHOODS IN ONE FILE, and they are the reason to keep doing this.** D-174,
in `i18n/messages.ts` alone:

| WHERE | THE CLAIM | THE MEASUREMENT |
|---|---|---|
| `i18n/messages.ts:11` | `he.json` has **67** top-level keys | **actually 74** |
| `i18n/messages.ts:218` | `COMMON_SHAPE` holds **57** strings | **actually 62** — the five new `privacy*` keys are exactly the gap |
| `i18n/messages.ts:96` | HONEST LIMIT 4 lists the `.min(1)` exceptions as "the ALT-TEXT values" | **incomplete — there are 12 positions** |
| `i18n/messages.ts:52` **and** `:335` | the fill happens in **`resolve()`** | 🔴 **THERE IS NO SUCH FUNCTION. It is `load()`.** |
| `SOURCE_ONLY_SHAPE` docblock | "the Hebrew is served for both locales" | **false since English `heroBadges` / `imageAlts` landed** |
| same | "a Hebrew `alt` on the English page is a known, recorded limit" | **false — measured `en` badges all non-Hebrew, `imageAlts` all English (D-175)** |

🔴 **A pointer to a function that does not exist, in the file that decides which locale every string on the site comes
from.** And separately, **D-169: `i18n/messages.ts:169` and `:179` documented `heroBadges` and `imageAlts` as
"HEBREW-ONLY (ledger D-18)" while `messages/en.json` now carries English for both — two false comments sitting
directly beside the per-key fallback at `:444-445`, the line a reader consults to learn which locale a string comes
from.** ⚠️ **A false comment at a decision point is the most expensive place to have one: it is the sentence the next
reader trusts INSTEAD OF MEASURING.**

### 4c · Non-text files — RE-MEASURED BY W16-DOC

| SCOPE | DENOMINATOR | BINARIES | VERDICT |
|---|---|---|---|
| **Production source** (`app` `components` `lib` `i18n` `config` `messages` `content` `tests`, tracked files) | **99 files** | **1** — `app/favicon.ico` | ✅ **A legitimate asset. No production source hides from `grep` today.** |
| **Whole tracked tree** (excluding `_legacy/`) | **183 files** | **more than 1** — PNG screenshots under `Claude outputs/` and `artifacts/screenshots/` | ✅ **All evidence artefacts, none of them source. Named so the two denominators are not confused.** |

⚠️ **D-182's figure is "106 files, exactly 1 binary". W16-DOC measures 99 files in the scope it chose. The scopes are
different — D-182's sweep and W16-DOC's file-set are not the same list — so these are two measurements, not a
contradiction. The CONCLUSION is identical and is the part that matters: `app/favicon.ico` is the only binary in
production source.**

### 4d · Skips — RE-MEASURED BY W16-DOC

| WHAT | W16-DOC MEASURED | SOURCE |
|---|---|---|
| Skipped tests reported by `vitest` | **exactly 1**, of 694 | `npx vitest run` |
| Where | `i18n/__tests__/messages.test.ts` — helpers at **`:36`** (`itWhenLanded = NOT_FOUND_LANDED ? it : it.skip`) and **`:37`** (`itUntilLanded = NOT_FOUND_LANDED ? it.skip : it`) | grep, read |
| Why it is legitimately dormant | `NOT_FOUND_LANDED` is **true**, so `:37`'s branch is the dormant one — that test guards the *pre-landing* state and correctly does not run | D-182 + read |
| `it.only` / `xit(` / `.todo` anywhere | **0**, across **47 test files on disk** | grep |
| Test files on disk vs run | **47 on disk, 46 run** — `tests/e2e/cta-visibility.spec.ts` correctly excluded by `vitest.config.ts` | `find` + `vitest` |

⚠️ **`vitest.config.ts`'s own honest limit warns that a test file placed outside the `__tests__` convention is
silently never run. The 47-vs-46 gap is correct TODAY; it is not self-policing.** ⛔ **A skipped test is not a passed
test, and "693 passed" is the number to quote, never "694 passing".**

---

## 5 · WHAT SURVIVED INDEPENDENT VERIFICATION

⚠️ **THIS LIST ALONE IS "DONE". Everything else in this run is built, or claimed, or measured once by whoever built
it.** Every item below was confirmed by a delegate that wrote none of the code under test.

1. **All five command gates are green at the numbers stated in section 1** — and the method, not just the result, was
   honoured: **lint was NOT trusted to its exit code**; `errorCount`/`warningCount` were summed across 113
   `eslint -f json` entries. (D-179; replayed by W16-DOC.)
2. **`/he` and `/en` are genuinely prerendered** — proved by **files on disk** and by
   `prerender-manifest.routes = 7`, **never by the route table's bullet, which D-176 proved lies.** (D-179, D-176;
   replayed by W16-DOC.)
3. **The privacy notice is delivered and legible** — visible with real computed styles in **both locales at both
   widths, 4 of 4**, and **at least 6.00 : 1 at the brightest genuinely-backdrop pixel**, above WCAG AA. (D-180.)
4. **The served bytes and the rendered text agree** — the notice is in the payload, not client-injected. (D-180.)
5. **The lead route's refusals do not break real enquiries.** The verifier's own words, offered as the one thing it
   says TO trust having tried hard to break it: *"the lead route's refusals and the admin read-back… the guards do not
   break real enquiries."* (D-182.) ⚠️ **Backed by measurement, not assertion: the honest form in real Chromium
   returns `201` (D-170), and the seat's own gate wording would have `403`'d it (D-171).**
6. **The admin read-back leaks nothing personal** — `StoredLeadSummary` is five fields and the personal ones have **no
   field to occupy**; proved both ways in one test (the stored record asserted to CONTAIN a visitor name, the response
   asserted NOT to). (D-159.)
7. **The alarm proof used no mocks at all** — zero `vi.mock`; real route, real sink, real counters, one fake wire;
   and **the negative is proved too** (with nothing wrong, `alarms` is empty), which is what makes its presence mean
   something. (D-160.)
8. **The no-JS submit is unconstructible, not hidden**, and **zero user-visible copy was authored to achieve it** —
   the `<noscript>` contains one CSS rule and nothing else. (D-172.)
9. **Exactly 1 skipped test, legitimately dormant; no `it.only`, `xit` or `.todo` in 47 files.** (D-182; replayed by
   W16-DOC.)
10. **One binary in production source, and it is `app/favicon.ico`.** (D-182; re-measured by W16-DOC.)

⚠️ **Read section 6 before treating this list as a clean bill of health. The "what not to trust" list is the more
useful document, and it always has been.**

---

## 6 · WHAT NOT TO TRUST — carried forward in priority order

⚠️ **Priority order is W16-E's, preserved (D-182). Items 5 and 6 are W16-DOC's own additions, appended rather than
interleaved so the verifier's ordering is not silently edited.**

**1. THE ENGLISH 404 PAGE.** ⚠️ `/en/<missing>` renders **Hebrew words**. The *announcement* defect is closed —
D-183 moved `lang={NOT_FOUND_COPY_LOCALE}` and `dir={LOCALE_DIRECTION[…]}` onto the `<main>` that owns the words, so
a screen reader is no longer misled — **but an English visitor still cannot read the page.** ⚠️ **D-183 also found
what the seat's brief MISSED: `dir="ltr"` over Hebrew prose. The DIRECTION was wrong too, not just the language.**
⚠️ **Before tonight every visitor got an English 404, including Hebrew ones. After tonight every visitor gets a
Hebrew 404, including English ones. Neither is correct** (D-162), and **the file predicted its own regression in
writing and nobody scheduled the fix.**

**2. "GATES ARE GREEN" AS MEANING "THE SITE LOOKS RIGHT".** 🔴 **`npm run e2e` is `/he` ONLY, at 390×844 ONLY,
against `next dev`. `/en` IS MEASURED BY NO AUTOMATED GATE IN A BROWSER, EVER.** Everything anyone knows about `/en`,
about desktop, and about the production build is measurement **no gate performs** — **it rots the moment nobody
repeats it by hand.** (D-179.)

**3. RUNNING `npm run e2e` AND THEN PROBING A PRODUCTION SERVER.** ⚠️ `e2e` starts `next dev`, which **overwrites
`.next`**. W16-E's own opening browser pass measured the site **completely unstyled** — black on white, UA-default
16 px, `scrollWidth` 1928, privacy notice `rgba(0,0,0,0)` — **which reads as "the entire stylesheet is missing in
production."** It was the rig. (D-179.) ⚠️ **And a port you asked for is a NAME: `npx next start -p 3977` was
measured silently binding 3947, so a delegate curled a sibling's server and got a stale page with no notice in it
(D-167). Confirm the binding from `ss` AND a 200 before believing anything.**

**4. THE FOCUS INDICATOR TO MEET WCAG 2.2.** It is alive and it is **1 px**, below SC 2.4.11's 2 px — and the
`outline: rgba(0,0,0,0) solid 2px` beside it **paints nothing**. (D-180.)

**5. ANY NUMBER IN ANY DOCUMENT HERE, INCLUDING THIS ONE.** ⚠️ **This report found D-179's test total stale within
hours of it being written (1a), and D-167's served-byte figures stale by +195 B each (1c). Neither was wrong when
taken.** ⛔ **Re-measure, or write `NOT-MEASURED`.**

**6. THE RATE LIMIT AS "5 PER MINUTE PER IP".** ⚠️ It is **per process** (D-66), it resets on serverless cold start,
and **an empty or rotating `x-forwarded-for` defeats it outright — measured, `201` × 8** (D-173). ⚠️ **And Guard-0
refusals (403 foreign origin, 415 wrong media type) are NOT COUNTED in the funnel (D-171), so a sustained
cross-origin flood is invisible on the funnel page and shows only in 429s and the access log.**

---

## 7 · NOT-MEASURED — each with an owner

⛔ **None of these is allowed to take the measured-ABSENT branch.**

| # | WHAT IS NOT MEASURED | OWNER | WHAT WOULD CLOSE IT |
|---|---|---|---|
| 1 | **Whether the lead-sink env vars are set on the live host** | **Mati** | Open the hosting dashboard. ⛔ Nothing in this repo can observe it. |
| 2 | **Whether `LEAD_ADMIN_TOKEN` is set on the live host** | **Mati** | Same dashboard. Unset means the admin read-back is a `404` and the alarm is unreachable (D-158, D-159). |
| 3 | **Whether the five Hebrew privacy sentences match what Ravid ACTUALLY DOES with an enquiry** | **Ravid** | ⛔ **Not closable in code. The code cannot check a privacy claim** (D-166). See section 8. |
| 4 | **Twelve of the fourteen adversarial classes, individually** | **the seat** | Re-run the battery, or accept the aggregate as a claim. The evidence died with a refused file write. |
| 5 | **Per-CTA and per-form-field computed boxes** (14 of 16 CTAs; each of the 10 fields) | **the seat** | Same refused file write. Aggregates survive; rows do not. |
| 6 | **"Tests that faithfully prove the WRONG behaviour"** | **the seat** | `CANNOT TELL`, explicitly not "none found" — re-deriving intent across 694 assertions was out of budget (D-182). |
| 7 | **Byte-identity of the SERVED page to the prerendered artefact, at today's tree** | **the seat** | W16-DOC served nothing. Stands on D-167, whose figures are now +195 B stale (1c). |
| 8 | **Build determinism from CLEAN, at today's tree** | **the seat** | W16-DOC built twice **without clearing `.next`** (1b). D-179's three-from-clean is the stronger evidence. |
| 9 | **`/en` in a browser, at any width, by any automated gate** | **the seat** | A second Playwright project. ⚠️ This is item 2 of section 6 and it has no owner in any gate today. |
| 10 | **The OpenGraph card's pixels** — nobody has ever looked at them | **the seat** | satori/resvg run only in a build; OPEN 13. ⚠️ It renders **English for both locales**, and this memorial is shared in bereavement groups, where the unfurl is the first impression. |
| 11 | **Wine prices** — absent from both repositories | **Ravid** | The four shop pages, or an answer. |
| 12 | **Whether `app/[locale]/error.tsx` and `global-error.tsx` would have D-183's identical defect** | **the seat** | ⚠️ **They DO NOT EXIST YET. D-184 named this rather than scoring itself ARCHITECTURE for a one-instance fix.** |

---

## 8 · THINGS ONLY RAVID OR MATI CAN SETTLE

⚠️ **These are not engineering questions and no delegate may answer them.**

### (a) Do the five Hebrew privacy sentences match what Ravid ACTUALLY DOES with an enquiry?

🔴 **This notice is live on the site now, and it makes a claim to bereaved families.** Every sentence was **derived
from the code** and cited (D-166) — but **code cannot verify a privacy claim.** The five keys, at
`messages/he.json:172-176` (source) and `messages/en.json:172-176` (translation), **line numbers re-verified by
W16-DOC by reading both files**:

| KEY | WHAT IT SAYS (English catalogue, abridged verbatim) | DERIVED FROM |
|---|---|---|
| `privacyTitle` | "What happens to your details" | — (heading) |
| `privacyData` | "…the name, phone, email, organization name and message you wrote, the language of the page…, an identifying number…, and the time the enquiry arrived. Your IP address is used for one minute only…and is not kept with the enquiry." | `createLeadRecord` (`lib/leads/types.ts:290`) + the 7-key body pinned at `LeadForm.test.tsx:638`; IP clause from `clientAddress()` (`route.ts:298`) + `RATE_LIMIT_WINDOW_MS = 60_000` |
| `privacyPurpose` | "…so we can get back to you about the lecture. The enquiry is saved in the site's enquiry store and sent by email to the enquiry mailbox through an external mail service." | `replyTo: record.payload.email` (`route.ts:663`) + `renderAutoresponse` + `resolveLeadSink` (`sinks/index.ts:190`) |
| `privacyRetention` | "…the system sets no expiry date for an enquiry and does not delete enquiries by itself." | 🔴 **`kv.ts:195` issues `SET` with NO TTL, and a sweep for `ttl`/`expire`/`purge`/`retention` returns ZERO code hits** — a SYSTEM FACT, because no policy exists to state |
| `privacyContact` | "To ask for your details to be deleted, or with any question about them, write to" | `config/site.ts:64 PUBLIC_EMAIL` via `mailtoLink()` — **the address is typed nowhere in the notice** |

⛔ **NOT said, because not derivable: "your details are not shared."** ⛔ **No retention period. No deletion SLA** —
the notice says where to **ask**, and promises no interval and no result, because none is enforced.

**The question for Ravid is narrow and answerable: is that what actually happens?** If a lead is forwarded anywhere
else, or deleted after a period, or seen by anyone besides him, **the notice is currently wrong**, and each correction
is one edit at one `file:line` above.

### (b) `/en/<missing>` renders HEBREW words

⚠️ **Correctly annotated now** — D-183 put `lang="he" dir="rtl"` on the `<main>` that owns the words, so assistive
technology is no longer misled. ⚠️ **An English visitor still cannot read them.** The Hebrew is Mati's own words,
transcribed verbatim from the W16 brief and not authored (CONFIRM-LATER A, at `messages/he.json:202-204`,
**re-verified by W16-DOC**). **What is missing is an English 404, and it needs someone to decide whether to write
one.** The structural fix that would let each locale serve its own 404 is (c).

### (c) Authorising the blocked structural fix

⚠️ **This closes WCAG SC 3.1.1 (Language of Page) for the 404 route, and it is REFUSED-PENDING-AUTHORISATION, not
undone through incompetence.** The ordered closer (DEFERRED, D-177):

1. `experimental.rootParams: true` in `next.config.js`
2. `app/layout.tsx` retired to `_legacy/` so `app/[locale]/layout.tsx` becomes the root layout
3. read the locale from `next/root-params`
4. **a BUILD-ARTEFACT gate asserting `he.html` and `en.html` exist** — because **per D-176 the route table will not
   say.**

🔴 **Why no delegate did it: a request-scoped locale read takes BOTH CONTENT PAGES OUT OF THE PRERENDER.** W16-FIX1
measured it in an isolated rig — `prerender-manifest.routes` fell **7 to 4**, `he.html` and `en.html` vanished from
disk, **and the route table still printed the SSG bullet.** ⚠️ **The remedy the repo's own honest limit pointed at
(`next/root-params`) DOES NOT EXIST in the installed Next 15.5.25 without that flag: it is refused by a webpack
invalid-import rule, `unstable_rootParams()` warns it is deprecated in this very version, and its
`case 'prerender-client'` branch THROWS `InvariantError` — "must not be used within a client component" — which is
the exact position this component occupies** (D-177). ⚠️ **It is a whole-site routing change with three siblings live
in the repo. It needs Mati's pen, not a delegate's.**

---

## 9 · WHAT THIS RUN FOUND WRONG IN ITS OWN WORK

⛔ **This is not a victory lap, and this section is the most useful thing in the run.**

🔴 **TWENTY of the seat's briefed premises were FALSE across three runs. Every single one was caught by a delegate
CHECKING rather than complying. NOT ONE was caught by the seat re-reading its own work.** (Running tally at D-165.)

🔴 **In W16, exactly ONE of the premises given to the four build delegates HELD.**

🔴 **In THREE separate cases, obeying the brief literally would have CREATED a defect:**

| # | THE BRIEF SAID | THE TRUTH | WHAT COMPLIANCE WOULD HAVE PRODUCED |
|---|---|---|---|
| 1 | *"`PrivacyNotice` exists and is NOT rendered."* | **Half false. `components/sections/LeadForm.tsx:964` ALREADY renders `<PrivacyNotice m={m} />`** and `:726-727` already derives `formDescribedBy`. It emitted nothing only because the catalogue answered no key and the resolver returned `null`. (D-165) | 🔴 **A DUPLICATE MOUNT**, inside a file a sibling was concurrently writing. The delegate's own words: *"Had I believed the premise I would have re-mounted an already-mounted component."* It made **zero code edits to `LeadForm.tsx`** and shipped the notice by editing three other files. |
| 2 | *"only two are genuinely new: Golan Company, Sufa."* | **False. `messages/en.json:129` ALREADY carried "Barak Family, Battalion 53, Golan Company".** Only **ONE** string was genuinely new: "Sufa". (D-163) | 🔴 **A DUPLICATE STRING** — a second copy of one fact, which is how catalogues drift. |
| 3 | *"enforce Origin/Sec-Fetch-Site… a cross-origin or `text/plain` POST must fail closed."* | **Real Chromium's honest same-origin form post sends `origin` and `content-type`, but `Sec-Fetch-Site` was ABSENT.** (D-171) | 🔴 **A `403` ON THE REAL BOOKING FORM.** Fail-closed-on-missing is the obvious reading of that brief. The delegate shipped a third value, `unstated`, never collapsed (Law 5), and wrote the measurement into the function's own docblock. ⚠️ **Its price was stated both ways: failing closed *"refuses real people — old devices, corporate proxies, privacy extensions. A bereaved family's booking enquiry silently becomes the failure UX, unrecoverable, invisible to everyone."*** |

⚠️ **A failure mode this ledger had not seen: a brief can be wrong by OMISSION.** The seat briefed a delegate to add
privacy keys and **never told it a memorial guard exists that classifies every top-level catalogue key and THROWS on
an unclassified one** — six tests went red on `unclassified catalogue key: privacyTitle`. ⚠️ **The guard did exactly
its job. "Verify the premise you were given" cannot catch this: there was no premise to verify.** (D-161.)

⚠️ **And the verifier turned the same suspicion on itself, twice, before filing.** W16-E caught its own dev-clobber
reading — which would have reported the entire stylesheet missing in production — **and then applied the same doubt to
its second reading and caught a focus-ring value read mid-transition.** Its sentence: ***"Law 7 includes me."***
(D-179.) ⚠️ **D-167 is the same discipline one level down: a delegate detected that the server it curled was not the
server it started, because the artefact on disk disagreed with the wire — and had it trusted the port it asked for, it
would have reported a working feature ABSENT and possibly "fixed" it.**

⚠️ **Three delegates in a row declined to score their fix ARCHITECTURE and took `PATCH` instead** (D-184), giving the
denominator rather than the flattering word: **1 of 1 fixed-locale subtree in that file; 1 of an unknown number
app-wide.**

---

## 10 · CLAIMS W16-DOC FOUND FALSE OR STALE — reported, not fixed

⛔ **W16-DOC has no write access to the ledger and changed nothing outside its two documents.**

| WHERE | THE CLAIM | WHAT W16-DOC MEASURED | STATUS |
|---|---|---|---|
| `REBUILD_STATUS_v1_00.md` **D-179** | vitest *"690 tests · 689 passed · 1 skipped"* | **694 tests · 693 passed · 1 skipped · 0 failed** | ⚠️ **STALE, not false** — W16-FIX4's tests landed after W16-E measured. **The seat should update or annotate D-179.** |
| `REBUILD_STATUS_v1_00.md` **D-167** | served `/he` **119,928 B**, `/en` **113,819 B** | artefacts at **120,123 B** and **114,014 B** — each **+195 B** | ⚠️ **STALE**, consistent with D-183 landing afterwards. |
| `REBUILD_STATUS_v1_00.md` **WAVES board** (lines 20–33) | stops at **W8** | **the ledger documents W9, W14 and W16** (D-1 … D-184) | ⚠️ **INCOMPLETE — and W15 already flagged it. It is still not extended. Only the seat may fix it.** |
| `REBUILD_STATUS_v1_00.md` **ARTEFACTS** | `STATUS_DASHBOARD.html` *"is the seven-wave handoff, **51,080 B**"* | **54,351 B before W16-DOC's edit** — W15 updated it in place and the paragraph beneath was left standing | 🔴 **STALE AGAIN, for the second time.** ⚠️ **W16-DOC has now updated the same file in place, so the byte figure is stale a THIRD time. The ARTEFACTS header's correction notice is accurate; the paragraph under it is not. Only the seat may fix the ledger.** |
| `REBUILD_STATUS_v1_00.md` **FIRST ACTION** block (lines 6–18) | *"Ask the family three questions"* — OPEN 7 (badges Hebrew-only), OPEN 9 (no Hebrew 404), the `imageAlts` question | **All three have since been ACTED ON by W16:** `en.json:198, 201, 204` now carry English badge alts; `he.json:202-204` carry Hebrew 404 copy; `en.json:209-214` carry English `imageAlts` — **all verified present by W16-DOC reading the files** | ⚠️ **STALE FRAMING.** The strings are no longer ABSENT; they are **DERIVED and live**, and they moved from OPEN to CONFIRM-LATER. ⛔ **The correct first action is now the env-var check, not those three questions.** |
| **`STATUS_DASHBOARD.html`** (W15's version, before W16-DOC's edit) | *"Build — `NOT-MEASURED`, deliberately not run"*; *"two `next-server` processes… pid 2368374 on port 3947 and pid 2604936 on port 3861"* | **Build now measured: exit 0 ×2, `⚠` glyph count 0.** ⚠️ **D-163 measured pid 2604936 / port 3861 ABSENT; D-180 corrected the count to ONE stale server, pid 2751219 on port 4873** | ⚠️ **SUPERSEDED — corrected in the updated dashboard.** ⛔ **W16-DOC killed no process and started no server.** |
| `app/__tests__/seo.test.ts:212` | comment: *"every locale sees the identical alternate set"* | **The assertion at `:213` proves no such thing** — two calls to the same no-arg function; `locale` reaches neither side | 🔴 **FALSE COMMENT, CONFIRMED BY READING. Reported, not fixed** — test files are outside W16-DOC's write-set. |

---

## 11 · HONEST LIMIT OF THIS DOCUMENT

- **W16-DOC drove no browser, started no server, and computed no style.** ⛔ **Every value in section 2 is read from
  the ledger, and the per-element rows that were never written to the ledger are marked `NOT-SOURCEABLE`, not
  reconstructed.**
- **W16-DOC could not source 12 of the 14 adversarial classes** (section 3). **"14/14 PRESENT" is repeated as an
  aggregate claim with its provenance stated, and is not promoted to a citation.**
- **W16-DOC built twice WITHOUT clearing `.next`** (1b). The mtimes did not advance on the second build, so
  determinism here is weaker evidence than D-179's three-from-clean.
- **W16-DOC did not re-verify any wave's internal claims.** For those it is reading the ledger, and it says so at
  every point.
- **W16-DOC cannot see the live host.** The block at the top of this file is a check it was **unable to perform** and
  is **not pretending to have performed.**
- **CONFIRM-LATER line numbers were re-verified by reading the files** (`messages/he.json:172-176, 202-204`;
  `messages/en.json:172-176, 198, 201, 204, 209-214`). ⚠️ **They are a measurement with an expiry date. Prefer the
  KEY NAME: `grep -n '"privacyTitle"' messages/*.json` settles it in one command.**
- **W16-DOC wrote exactly two files: this one and `STATUS_DASHBOARD.html`.** It touched no source file, no test, no
  message catalogue, no `content/**`, no `config/site.ts`, and **not `REBUILD_STATUS_v1_00.md`**. ⛔ **It ran no git
  command that writes, deleted nothing, and deployed nothing.**
- ⛔ **No fact about Tuval or Ravid was invented here — no number, institution, rank, date or testimonial. No Hebrew
  was authored: every Hebrew string referenced above is cited by `file:line` to the repository's own catalogues. No
  new user-visible site copy was written.**

---

## 12 · `STATUS_DASHBOARD.html` — the six-way offline scan, and the artefact collision

**W16-DOC UPDATED `STATUS_DASHBOARD.html` IN PLACE**, at the same path, keeping its existing stylesheet and card format
byte-for-byte and replacing only the body. ⚠️ **A third dashboard would be a `_v2` by another name** — that was W15's
reasoning for doing the same thing, and it holds.

### 12a · The six-way scan, counts printed rather than summarised

| PATTERN | COUNT | NOTE |
|---|---|---|
| `src=` | **0** | |
| `href=` | **0** | |
| `<script` | **0** | |
| `<link` | **0** | |
| `url(` | **0** | |
| `http` | **2** case-sensitive, **4** ignoring case | ⚠️ **EVERY ONE IS PROSE, NOT A REFERENCE** — see below |
| **`://`** | **0** | ✅ **the check that settles it: no scheme-plus-host anywhere** |
| **`www.`** | **0** | ✅ |

⚠️ **The hits, named exactly and counted honestly:** (1) the word **https** naming the required URL **scheme** for
`LEAD_WEBHOOK_URL` in the FIRST ACTION block — **load-bearing for Mati, who has to check that variable**; (2) the
phrase **HTTP 200** inside the D-103 decision row; **(3) and (4) are the footer's own sentence explaining (1) and
(2)** — a scan that describes itself raises its own count. **None is an address and none is fetchable.**

⚠️ **AND THE FIRST ATTEMPT AT THIS FOOTER FAILED ITS OWN SCAN, which is worth recording rather than quietly
correcting: W16-DOC first printed the six raw patterns on the page as a table. That put `src=`, `href=`, `url(` and
`://` into the file, and the next scan returned `src=` 1, `href=` 1, `url(` 1, `://` 1. The page documenting its own
scan broke its own scan.** ✅ **Caught by re-running the scan after the edit instead of trusting the edit. The footer
now describes the patterns in words and the raw counts live only here.**

⛔ **W16-DOC did NOT reword the page to make the scan print six zeros.** **Reporting 2 and explaining it beats
reporting 0 and editing the page to earn it** — and removing the word "https" would make the one instruction Mati
most needs to act on less precise. **The counts are printed on the page's own footer, not summarised there as a clean
zero.**

### 12b · Structural checks

`<div>` **72 open / 72 close** · `<table>` **8 open / 8 close** · **0 backslash-u escapes** in either file written.

### 12c · `STATUS_DASHBOARD_W7.html` is UNTOUCHED

✅ **Verified by checksum before and after W16-DOC's work: md5 `178b30eb9157fc94be701447586ab25c`, 13,599 B, mtime
unchanged (Sep 12 21:46).** ⛔ **It was NOT overwritten, NOT edited and NOT deleted.** It is **W7-B's own browser-pass
evidence** and a different artefact, as the ledger's ARTEFACTS section records.

### 12d · The selection criterion for the dashboard, stated so it can be argued with

**184 decisions is too many to print, and printing them all would be a way of printing nothing.** ⚠️ **W16-DOC kept
only decisions that CHANGE WHAT MATI OR RAVID ACTUALLY DOES — something to approve, something to check, or something
that can bite — and dropped every decision that is internal engineering rationale, however good.**

**Ten of 184 passed that filter** (D-176, D-158/D-159, D-166, D-171, D-173, D-103, D-120, D-101, D-165, D-55).
⚠️ **The other 174 are not less true. They are less actionable, and they read the same way in the ledger.**

⚠️ **The filter's known bias, stated rather than hidden: it favours defects and refusals over things that worked.
A reader using this page alone would form a darker picture of the site than the ledger supports.** The ledger is the
corrective, and the page says so.
