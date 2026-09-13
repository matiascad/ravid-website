# SESSION 3 DELTA — what the second overnight run changed

▶ **FIRST ACTION OWED TO MATI: confirm the lead-sink environment variables are set on the live host — `KV_REST_API_URL` + `KV_REST_API_TOKEN`, or `LEAD_WEBHOOK_URL` with an `https:` scheme; with none set, every real enquiry gets a 503 and nothing is stored.**

⚠️ **That line is a CHECK, not a known failure.** Nothing in this repository can observe the live host.
No agent has seen the hosting dashboard. A comment in a test file asserting the variables are unset is
**prose, not a measurement**, and this document will not promote it to one.

---

This file describes **run #2** (waves W9–W15) against what `SESSION_2_DELTA.md` and the previous
handoff described (waves W1–W8). It restates no count that the ledger owns: where a figure matters,
it names the ledger section, or it is a measurement **this document took itself** and says so.

**Written by W15 on 2026-09-13. Every number below is either measured by W15 at the timestamp given, or
cited to `REBUILD_STATUS_v1_00.md`. Nothing is retyped from memory.**

---

## 1. The gates, measured by W15 rather than inherited

Run at 06:27–06:41 on 2026-09-13, in `/home/mati/project/ravid_website`, by the delegate that wrote
none of the code under test.

| Gate | Command | Result |
|---|---|---|
| Types | `npx tsc --noEmit` | **exit 0**, no output |
| Lint | `npx eslint . --format json` | **exit 0** · **106 files examined** · 0 errors · 0 warnings |
| Unit | `npx vitest run` | **exit 0** · **42 files** · **608 tests** = **607 passed** + **1 skipped**, **0 failed** |
| Browser | `npm run e2e` | **exit 0** · **6 passed** · 12.8 s · 1 worker · project `chromium-mobile-390` |
| Build | `npm run build` | ⛔ **NOT-MEASURED — deliberately not run.** See below. |

**Passed and skipped are reported separately on purpose.** A suite quoted as "608 passing" would be
wrong by one, and the one is the interesting one.

⛔ **`npm run build` was not run and its result is NOT-MEASURED.** It is non-deterministic in this tree
while a stale `next-server` holds `.next/` (ledger D-130: W14-A ran it twice and got **exit 1 then exit
0**, the failure being `ENOENT ... rename '.next/export/500.html'`). W15 confirmed the cause is still
present: **two `next-server (v15.5.25)` processes are listening — pid 2368374 on port 3947 (uptime
10h08m) and pid 2604936 on port 3861.** Neither was started by W15 and neither was killed. **Reporting a
flaky green here would be worse than reporting nothing.**

⚠️ **Therefore "all gates green" remains a claim about four gates, not five** — which is precisely the
correction D-130 exists to make.

---

## 2. What run #2 added that run #1 did not have

Named at the level of "what is now possible", not at the level of file counts (the ledger owns those).

- **W9 — lead durability.** An email is a delivery, not a record. The lead now also goes to a **sink**
  behind a port: a KV store, or an HTTP webhook, or both, with an explicit `unconfigured` arm that
  returns **503** rather than pretending. See `MASTER_PLAN.md` §4a.
- **W10 — measurement.** Nine funnel events and a tracking layer, wired through a `TrackedLink`
  component. **It is inert today** and measured inert: zero scripts, zero network calls, zero globals.
- **W11 — speaker proof.** A complete, typed, compile-proved path for the speaker's own biography —
  which renders **zero bytes**, because no true answer exists yet.
- **W12 — findability.** Structured data, and the canonical-host question **closed by measurement**.
- **W13 — hardening.** A privacy notice path (also rendering zero bytes), and the refusal described in
  §5 below.
- **W14 — independent verification.** Three verifiers who wrote none of it, plus five atomic fixes.
- **W15 — this handoff.**

**Three of those six waves shipped something that deliberately renders nothing.** That is the honest
shape of the run: the machinery is built and proved; the words are Ravid's to supply.

---

## 3. 🔴 TWO THINGS RAVID MUST DECIDE

**These are the only changes a visitor to the site would actually notice. Neither is a bug. Both were
deliberate, both are reversible, and both need a human yes or no.**

### 3.1 The wine block now renders AFTER the booking form

This is a departure from the order on Ravid's own shipped page.

W15 measured the current order directly in `app/[locale]/page.tsx`: **`LeadForm` at line 196, `Wine` at
line 214.** The ledger records the change at **D-120** as "the one change a visitor would notice", and
states the trade in its own words: the page sells **one** thing, and the wine block sat between the
reader and the form.

⚠️ **Reversing it is two lines in one file.** No copy moves; `messages/**` is untouched by it.
**If Ravid wants his original order back, it costs nothing to give it back.**

### 3.2 Four marketing strings were rewritten — and one describes his brother in a selling headline

W15 measured this with `git diff` rather than trusting any summary: **`messages/en.json` and
`messages/he.json` show exactly 4 insertions and 4 deletions, across 2 keys in 2 locales, and nothing
else.** The strings, quoted verbatim from that diff:

| Key | Was | Now |
|---|---|---|
| `whatTitle` (he) | `ההרצאות שלי – מה תקבלו?` | `הרצאה לזכר חלל צה״ל – מה תקבלו?` |
| `whatTitle` (en) | `My Lectures – What Will You Get?` | `A Lecture in Memory of a Fallen IDF Soldier – What Will You Get?` |
| `whatAudienceTitle` (he) | `התאמה לכל קהל` | `התאמה לכל קהל – מהרצאת השראה למלש״בים ועד מנהיגים ומקבלי החלטות` |
| `whatAudienceTitle` (en) | `Tailored for every audience` | `Tailored for every audience – from an inspiration lecture for pre-military youth to leaders and decision makers` |

🔴 **THE APPROVAL ITEM is the first pair.** `חלל צה״ל` — "a Fallen IDF Soldier" — now describes Ravid's
own brother, in a headline whose job is to sell a lecture. It is factually true and it was written for
findability. **Whether Tuval is described that way in a selling headline is not an engineering
judgement, and no agent should have made it alone.** Ledger D-101.

⚠️ On the second pair the ledger records a mitigating fact worth repeating: **both endpoints of the
audience heading are quoted verbatim from the cards directly beneath it** — the heading now says
exactly what the cards already said, and no new audience was introduced.

**Reversal for all four: paste the "Was" column back. Two files, four lines.** The proof method was a
hash census, not a claim: SHA-256 of every value in all 69 `he` and 67 `en` keys, before and after —
**exactly four hashes changed**, and those digests are now a standing test.

### 3.3 Two more booker phrases were drafted, then REFUSED — and still await a yes or no

`הרצאה ליום הזיכרון` ("a Memorial Day lecture") and `יום גיבוש חברה` ("a company team-building day")
have **zero occurrences in either repository**. ⚠️ **Placing them would claim Ravid's availability for
Memorial Day ceremonies and for corporate team-building — a claim about what he will do, not a
description of what he has done.** The delegate drafted both lines and shipped neither.

**Cost when answered: one line each, already written.** Ledger D-99.

### 3.4 And one design verdict left explicitly to a human

⚠️ **The Wine CTA is pure white and is now the loudest button on the page — louder than the blue booking
CTAs.** §3.1 fixed wine's *positional* competition with the form and **did not fix its chromatic
competition.** Owner: whoever holds the palette. Separately, `hero_story`'s ghost-button border measures
**1.48:1**, below the 3:1 non-text minimum; the e2e gate deliberately does not enforce that, so it is not
red-on-arrival against the shipped design. Ledger D-134 and D-152.

---

## 3A. 🔴 LIVE DEFECTS W14's VERIFIERS FOUND — open today, none of them fixed

**These are not process notes. Each affects a real visitor to a memorial page right now.** W15 reports
them and fixed none of them; that is the seat's call, not a handoff delegate's.

| D | What a real visitor gets | What would close it |
|---|---|---|
| **D-139** | 🔴 **With JavaScript off, the form loses the enquiry and puts the visitor's name, phone, email and message in the URL.** No `action`, no `method`, no `<noscript>` — a submit is a GET back to `/he` with everything in the query string, **into browser history and the next `Referer` header.** | A `<noscript>` block pointing at WhatsApp and the phone number — cheap, honest, composable from existing keys with no new copy. Or a real `action`/`method`. |
| **D-145** | 🔴 **`Content-Type: text/plain` is accepted, so any web page anywhere can drive unlimited leads into the family's inbox** from a visitor's browser — no preflight, no cooperation from this site. | Require a JSON content type, or an `Origin` / `Sec-Fetch-Site` check, on `/api/lead`. **Verify the real form still posts.** |
| **D-144** | **Bidi and zero-width control characters survive into the owner's email Subject** (a reversed, attacker-chosen subject line) **and into the webhook payload verbatim** — including `"organization":"<script>alert(1)</script>"`, a live XSS for any downstream that renders a lead as HTML. | Escape at the **render** boundaries (mail subject, webhook body), not at the input — narrowing the input would reject real Hebrew enquiries. |
| **D-137** | 🔴 **Every 404 page tells Google it is the canonical memorial page** — `rel="canonical"` at `/he` plus the memorial `og:*`. ⚠️ **The `<title>404</title>` fix recorded as landed exists in the stream only and does not survive hydration.** | A `generateMetadata` on the not-found boundary overriding `canonical` and `og:*` **and holding the title after hydration**. |
| **D-146** | **`messages/he.json`'s `notFound` block is English**, byte-identical to `en.json`, and the 404 reads `getMessages(DEFAULT_LOCALE)` — **so an English visitor's only link out of a 404 goes to `/he`.** | Closes with §OPEN 9 (one of the family's three questions), or sooner by deriving `lang`/`dir` from the copy's own locale. |
| **D-142** | **Five parallel identical submissions produced five records.** Every idempotency test awaited sequentially, so the suite proved the happy path and could not see the race — **and the W9 gate missed it too.** | ✅ **FIXED** by W14-FIX3 (D-150): reservation is synchronous with zero awaits. Three concurrent duplicates against a failing sink → all three 503, no id, zero records. |
| **D-140** | **The site told a visitor "sent" when nothing was stored** — `LeadForm` decided success on `response.ok` alone and never looked for an id. **The original defect, returned through a different door.** | ✅ **FIXED** by W14-FIX1 (D-148): success is now `storedId !== null`. 25 executable lines, zero JSX changed; RED proof 11 red / 21 green. |

⚠️ **The two fixed rows are listed deliberately.** Both were found by verifiers checking the run's **own**
work, and both were the original defect wearing a new costume. **A run that showed only the closed ones
would be lying by selection.**

⚠️ **One more thing to do before pasting a GA4 id, beyond the consent question:** the five wire
parameters are **custom event parameters**. They appear in Realtime, DebugView and BigQuery immediately
and in **no standard report** until a human registers each as an event-scoped custom dimension — **and
registration is not retroactive** (D-112). Register first, or the first weeks are unreadable.

⚠️ **If you use the webhook sink:** add **one header cell at the right-hand end** of the spreadsheet
(`deliveryState`). A filter on `deliveryState = failed` then *is* the call-back list (D-118).

---

## 4. 🔴 Ten questions only Ravid can answer

Three waves built complete paths that **render nothing** because inventing the content was forbidden.

| § | What is missing | Where it goes | Cost when answered |
|---|---|---|---|
| **§OPEN 17** | Six facts about Ravid himself: bio · credentials · venues · video · pressMentions · audiences | `content/speaker.ts:389` (`SPEAKER_CONTENT`, currently `{}`) — **W15 re-measured; the ledger says `:388`** | one edit at one constant — ⚠️ but see §OPEN 18 |
| **§OPEN 18** | One heading string, in both locales | `components/sections/Speaker.tsx:135` (`SPEAKER_HEADING`, currently `undefined`) + one key in each catalogue | ⚠️ **NOT one edit** |
| **§OPEN 19** | Three answers: what happens to an enquiry, who else sees it, how long it is kept | `messages/he.json` + `messages/en.json` → `privacyTitle` · `privacyData` · `privacyRetention` | ⚠️ **THREE edits in TWO files** |

⚠️ **`video` needs TWO values, not one** — a URL *and* a poster frame Ravid chooses. A URL without a
poster is unconstructible on purpose. ⚠️ **Each press mention needs outlet, date and link**; a claim of
media coverage without all three is unconstructible by design.

### The three traps in that table

1. **§OPEN 17 and 18 are not the one-edit items the rest of §OPEN is.** Activating the Speaker section
   makes `app/[locale]/page.tsx` read the catalogue **twice**, against that file's own stated ONE READ
   invariant, and its header prose ("thirteen sections") becomes false the same day. Recorded **before**
   it happens at **D-90**. It needs the seat's pen on `page.tsx` and a `SECTION_IDS` anchor decision —
   not just Ravid's words.

2. 🔴 **§OPEN 19 can take the site down if done carelessly.** `i18n/messages.ts` is a `z.strictObject`.
   **A catalogue key with no matching schema key throws at module load and the site fails to serve.**
   The schema edit (`i18n/messages.ts:292`, beside `formDirect: z.string()`) is not optional and is not
   second — it is one of the three edits. Adding the three keys to the two JSON files alone is an
   outage. ⚠️ No page or component change is needed: W15 verified `PrivacyNotice` is already wired into
   `LeadForm.tsx:964` and gated on `resolvePrivacyNotice(m)`.

3. 🔴 **§OPEN 15 is the one row where activating a constant has legal consequences beyond the screen.**
   **There is no consent banner, and the moment a GA4 id is set, tracking begins without one.** The
   activation point is `lib/analytics.ts:76`. The delegate that built the measurement layer refused to
   build or decide a consent gate and stopped at the boundary. **This is a legal question in a
   jurisdiction, not an engineering one**, on a site whose visitors are bereaved families and serving
   soldiers' relatives. ⛔ **Do not set that variable to "see if it works".**

### ⚠️ Every `config/site.ts` line number in §OPEN is stale by six

W15 re-measured with `grep -n 'export const' config/site.ts`. The constant **names** are correct; the
line numbers are not. The ledger warns about exactly this and W15 is taking the warning rather than the
numbers.

| §OPEN | Constant | Ledger says | **Measured 2026-09-13** |
|---|---|---|---|
| 1 | `INSTAGRAM_HANDLE` | `:78` | **`:84`** |
| 1 | `INSTAGRAM_URL` (derived) | `:82` | **`:88`** |
| 2 | `PUBLIC_EMAIL` | `:58` | **`:64`** |
| 2 | `LEAD_TO_EMAIL_ENV_VAR` | `:61` | **`:67`** |
| 4 | `WINE_URLS.red/rose/white/trio` | `:88, 90, 92, 94` | **`:94, 96, 98, 100`** |
| 5 | `SITE_URL` | `:102` | **`:108`** |
| 15 | `MEASUREMENT_ID_ENV_VAR` | `lib/analytics.ts:76` | **`:76` — correct** |
| 17 | `SPEAKER_CONTENT` | `content/speaker.ts:388` | **`:389`** |
| 18 | `SPEAKER_HEADING` | (no line given) | **`components/sections/Speaker.tsx:135`** |

⛔ W15 did not edit the ledger to correct these; the seat owns it.

---

## 5. What is NOT trustworthy

**This is the most useful section in this document. Read it before you believe section 1.**

- ⛔ **"All gates green" excludes the build, and always did.** No delegate ran `npm run build` all night
  (D-130). Four gates are green. The fifth is NOT-MEASURED.
- ⛔ **"0 Hebrew codepoints in source" is an honoured convention, not an enforced invariant.** The gate
  at `app/__tests__/seo.test.ts:344` iterates **that file's own hand-listed `WRITE_SET`** — it does not
  cover `lib/**` and never has, though briefs have described it as repo-wide since W4. It has been true
  in effect because every delegate obeyed the rule. **The discipline held; the gate did not.** (D-58.)
- ⛔ **About thirty file headers across this repo claim a COMPILE refusal that nothing re-executes.**
  Executing assertions exist in only three directories. The claims are believed true today — this is a
  **proof gap, not a defect** — but a header that says "this is impossible" and is backed by prose alone
  is exactly the thing this project distrusts everywhere else. (D-119, §DEFERRED.)
- ⛔ **`deliveryState: 'pending'` means "unknown", never "in progress".** No sweeper exists (D-65).
- ⛔ **Partial sink failure is invisible to the caller.** With both sinks configured and one down, the
  route sees plain success; the only trace is one `console.warn`, and nobody reads server logs on a
  memorial site (D-61).
- ⛔ **"5 per minute per IP" is per instance, not per IP globally.** The rate limiter and the idempotency
  cache are per-process memory and reset on cold start (D-66).
- ⛔ **Nobody has ever looked at the OpenGraph share card's pixels.** It renders **English for both
  locales** by design, and satori is never invoked without a build, so its output is NOT-MEASURED
  (§OPEN 13). This memorial is shared in bereavement groups, where the unfurl *is* the first impression.
- ⛔ **Nothing in this repo reads the funnel counters back.** `readLeadFunnel()` (`lib/leads/log.ts:480`)
  returns real numbers and **no page, route or script calls it** (§OPEN 16). The measurement wave
  produced an integer in a database, not something a grieving family can check.
- ⛔ **`lib/validation.ts`'s character screen is load-bearing and one formatter run from breaking
  silently** (D-129, sharpened by D-146). It holds today — verified under attack — which makes the
  fragility worse news, not better.
- ⛔ **A green `npm run e2e` says nothing about `tests/e2e/*.mjs`.** Those are standalone node probes and
  the Playwright run does not collect them.

---

## 6. 🔴 The process finding: the seat's own briefs kept being wrong

**This is the single most important finding of the run, and it is a finding about the run, not about the
site.**

The orchestrating seat issued briefs containing **false premises**, repeatedly, all night. **Every one
was caught by a delegate that checked rather than complied.**

**SIXTEEN individually-enumerated false premises, recorded across 13 decision rows** — D-58, D-62,
**D-71 (which alone names five)**, D-76, D-89, D-91, D-92, D-103, D-104, D-117 (two), D-122, D-125,
D-128.

🔴 **And the false-premise counter is itself wrong, by exactly one, from D-122 onward.** D-122 enumerates
its own predecessors; **that enumeration sums to fourteen, and the row labels itself "THIRTEENTH".** The
seat dropped one. So D-125's "FOURTEENTH" is really the 15th, and D-128's **"FIFTEENTH" is really the
16th**. ⚠️ **D-55's lesson — a number in a document is a measurement with an expiry date — has now landed
on the counter that counts the seat's own mistakes.**

⚠️ Counting every row where a delegate caught the seat being wrong about **anything**, not only a brief
premise, reaches roughly **32 rows**. **Every one was caught by someone checking. Not one by the seat
re-reading itself.**

**Two of them are worth knowing by name:**

🔴 **D-103 — a CSP nonce would have served a dead memorial page at HTTP 200 with every gate green.** The
brief ordered a middleware nonce for `script-src`. The delegate **measured instead of implementing and
refused to ship it**: `/he` and `/en` are **prerendered static**, Next derives a script nonce only inside
`app-render`, which never runs for a prerendered page. The nonce in the header would have matched no
script on the page. **Nothing would have gone red.** The page would simply have stopped working.

**D-71** records the moment the pattern became undeniable: a brief described an entire component tree as
"(new)" when it had shipped the night before, already mounted and already tested. The delegate wrote
none of it and proved so with an empty diff.

**The operational lesson, and it outranks every gate in section 1:** on this project, *a delegate that
complies with a confident brief is more dangerous than one that argues with it.* Every serious defect
found in run #2 was found in the run's **own work**, by someone declining to take an instruction on
faith.

---

## 7. And the lesson the ledger has now learned six times

**A number in a document is a measurement with an expiry date.**

The clearest instance in run #2: **`public/` had been recorded as 1.00 MB since W1 and is actually
3.427 MB — wrong by 3.4×, and it survived eight waves because every reader trusted it.** W15
independently re-measured and confirms the corrected figure: **3,593,766 bytes across 34 files**
(`find public -type f -printf '%s\n'`). The ledger also diagnosed the original error rather than merely
replacing it — the seven `.jpg` files total 1,002,460 B, so someone measured **one file type** and
recorded it as the directory (D-123).

Three more stale figures W15 found and is reporting rather than fixing:

1. **The ledger's `§WAVES` status board stops at W8.** Waves W9–W15 have run and are not on it.
2. **The ledger's own `▶ FIRST ACTION` header says "§OPEN carries 13 numbered rows".** W15 counted
   **19**. (D-55 records this same figure going stale once already, at 8→13.)
3. **The ledger's decision range.** W15 counted **152** line-anchored rows (`grep -c '^| \*\*D-'`),
   highest number **D-152**. W15's own brief said D-1…D-151. ⚠️ A plain unanchored count returns **157**
   and overcounts, because D-numbers appear in prose.

⛔ **W15 corrected none of these in the ledger — the seat owns that file.** They are reported here.

---

## HONEST LIMIT OF THIS DOCUMENT

- **W15 wrote no source file, no test, no message catalogue and no `config/site.ts` entry**, and did not
  touch `REBUILD_STATUS_v1_00.md`. Every defect above is **reported, not fixed** — including the nine
  stale `config/site.ts` line numbers, which W15 measured and left in place.
- **W15 verified four gates by running them and marked the fifth NOT-MEASURED.** It did not re-verify
  any wave's internal claims; for those it is reading the ledger, and it says so at each point.
- **W15 did not open the site in a browser** beyond what `npm run e2e` does on its own (one locale,
  `/he`, one viewport, 390×844). **Nobody looked at `/en` this session**, and nobody looked at the
  OpenGraph card ever.
- **W15 cannot see the live host.** The first action at the top of this file is a check it was unable to
  perform and is not pretending to have performed.
- **The §W14 verification-cycle counts — findings replayed, still failing, newly failing — are
  NOT-MEASURED by W15.** It did not re-run the three verifiers, and it will not print numbers for work
  it did not do. They are in the ledger's W14 prose.
- **No memorial fact, institution, testimonial, review, number or statistic was invented here, and no
  Hebrew was authored.** Every Hebrew string in section 3.2 is transcribed from `git diff` output
  against the repository's own catalogues.
