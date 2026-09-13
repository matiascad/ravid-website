# 🌙 OVERNIGHT RUN #2 — close the booking funnel · v1.00
**Target:** every P0/P1/P2 in `REDTEAM_v1_00.html` · **Waves W9 → W15** · Law: `PROMPT_RULES_v1_00.md` · Repo: `~/project/ravid_website` (Next 15.5.25, deployed)

---
## NEW LAW carried from last night (law 8 — earn it into PROMPT_RULES)
```
A NAME IS NOT A THING. Never assert an identifier — assert the computed effect.
Proof: tsc + ESLint + 261 tests + 5 wave gates + HTTP probes were all GREEN while the
booking button was invisible: `bg-gold` was undefined and Tailwind silently emits nothing.
Every test written tonight that concerns appearance, delivery or navigation must read the
COMPUTED result (getComputedStyle, served bytes, an actual 2xx, a row that exists), never
the presence of a class name, a key, a script tag or a declared npm script.
```

## STEP 1 — the goal (type it in Claude Code)
```
/goal OVERNIGHT RUN #2 — close the booking funnel of ravid_website. Execute
OVERNIGHT_RUN_2_v1_00.md waves W9→W15 back-to-back without waiting for Mati.
Law = /home/mati/Downloads/PROMPT_RULES_v1_00.md + law 8 (a name is not a thing: assert
computed effect, never an identifier). Truth = REBUILD_STATUS_v1_00.md.
ARCHITECTURE LAW: right architecture or nothing — rewrite rather than patch, never patch
over a patch, never ask whether to do it worse. Seat touches no files except the ledger;
delegates = opus, mechanical = sonnet; verifiers wrote none of the code they verify.
Never git, never rm (quarantine to _legacy/), never deploy, never write a secret VALUE,
never invent a memorial fact, never fabricate a testimonial, institution, number or review.
Human-blocked values are built to activate from ONE constant/env var and logged in §OPEN
with file:line — they never stop the run. Finish with an updated STATUS_DASHBOARD.html,
ledger, tarball and a decision list for the morning.
```

## STEP 2 — the run block (paste once; it runs the night)
```
OVERNIGHT RUN #2 — W9 → W15, no human in the loop until morning.

READ FIRST AND OBEY VERBATIM:
  /home/mati/Downloads/PROMPT_RULES_v1_00.md        (seven laws)
  ~/project/ravid_website/REDTEAM_v1_00.html         (the 13 findings, P0/P1/P2)
  ~/project/ravid_website/OVERNIGHT_RUN_2_v1_00.md   (wave briefs W9..W15 — binding)
  ~/project/ravid_website/REBUILD_STATUS_v1_00.md    (ledger — the only home of counts)
Paste into EVERY delegate: MODEL POLICY · COST DISCIPLINE · STANDARD+PROOF · ARCHITECTURE
LAW · LAW 8 (a name is not a thing).

MODEL POLICY: seat = this session, touches no files but the ledger. Every reading/writing/
attacking delegate = Task(model="opus"). Mechanical only (codemod, asset, docs, extraction)
= Task(model="sonnet"). No delegate is frontier. A delegate meeting a judgement its brief
did not settle STOPS at the boundary and reports.

AUTONOMY: run waves back-to-back; judge each GATE; append the ledger BEFORE compacting;
never ask to proceed. A failed gate spawns ONE atomic fix delegate per defect (write-set =
that file + its test), re-verified by a delegate that did not write the fix. 3 cycles max
per defect → rewrite the unit → still failing → §DEFERRED with reversal cost, continue.
Budget exceeded = split the brief, never raise the budget.

HUMAN-BLOCKED VALUES (never stop, never invent, never fake):
  instagram handle · English badge names · Hebrew 404 copy · English alt text ·
  institution names behind the numbers · testimonial attributions · video URL ·
  RESEND_API_KEY / LEAD_TO_EMAIL / LEAD_FROM_EMAIL / GA4 id / storage credentials.
  For each: build the full path, seed ONE typed constant or env-var NAME, make the feature
  render-absent (not broken) while unset, add a test proving the unset state is safe, and
  log "§OPEN — one-edit item: file:line" in the ledger. A section with no real content is
  NOT shipped with placeholder text — it is hidden behind a typed "content absent" branch.

HARD LINES: no git · no deploy · no rm · no secret VALUES (env NAMES only) · zero writes to
~/project/ravid_website1 · no _v2/_new/_final files · no invented memorial fact, institution,
testimonial, review, logo or statistic.

START NOW with §W9. Do not reply with a plan or a question — launch it.
```

---
# THE WAVES

## W9 — LEAD DURABILITY (P0-1, P0-2, P2-autoresponse) · 4 delegates
```
GOAL: an enquiry can never be lost, and the visitor always knows the truth.
ARCHITECTURE: persist-then-notify. The record is the truth; email is best-effort.
 A) opus · write-set lib/leads/port.ts, lib/leads/types.ts · 60k
    Define LeadSink port + LeadRecord (id ULID, receivedAt, locale, payload, source,
    deliveryState). Make "accepted but unstored" UNREPRESENTABLE: the success type carries
    the stored record id; there is no success value without one.
 B) opus · write-set lib/leads/sinks/*.ts + tests · 90k
    Two adapters behind the port: (1) Vercel KV/Postgres via env NAMES, (2) append-only
    webhook sink (Google Sheets / Make / n8n) via env NAME. NO sink configured →
    503 unchanged (today's honest behaviour). Test each adapter against a fake transport,
    and prove the 503 path stores nothing and claims nothing.
 C) opus · write-set app/api/lead/route.ts + its tests · 90k
    Rewire: validate → persist → respond 201 with the record id → notify (email) out of
    band; a notify failure downgrades deliveryState, never the 201. Add: idempotency key,
    honeypot field, per-IP rate limit, payload size cap. Autoresponse to the sender in
    THEIR locale (template in messages/, no new copy invented — derived from existing keys).
 D) opus · write-set components/sections/LeadForm.tsx + tests · 70k
    Failure UX: on any non-2xx, show the WhatsApp deep link PREFILLED with what they typed,
    so a broken backend still produces a conversation. Assert the prefill by reading the
    rendered href (law 8), not the handler.
GATE: 201 carries a stored id · killed sink → 503 and nothing claimed · notify failure →
201 + degraded state · duplicate idempotency key stores once · honeypot/rate-limit proven
· rendered WhatsApp href contains the typed text.
```

## W10 — MEASUREMENT (P0-3) · 3 delegates
```
GOAL: nothing on this site is unmeasured again. Evidence, not taste.
 A) opus · write-set lib/analytics/* + components/Analytics.tsx + tests · 70k
    GA4 via env NAME; renders NOTHING when unset (assert the unset case). Typed event
    catalogue — no string literals at call sites.
 B) opus · write-set section call-sites (events only) + tests · 70k
    Events: cta_click · form_submit_attempt · form_success · form_fail · whatsapp_click ·
    instagram_click · wine_click(variant) · lang_switch · scroll_depth(25/50/75/100).
    Assert each fires from the RENDERED element, not from the handler in isolation.
 C) opus · write-set lib/leads/log.ts + tests · 50k
    Server-side funnel counters that work with GA absent: attempts, stored, notified,
    failed, by locale. This is the number the family can trust even with no GA account.
GATE: GA unset → zero network calls, zero errors · 9 events proven to fire from the DOM ·
server counters increment on a real POST.
```

## W11 — SPEAKER PROOF (P1-1, P1-2) · 4 delegates
```
GOAL: a booker learns who Ravid is and why to trust him — WITHOUT inventing anything.
 A) opus · write-set content/speaker.ts + messages keys + tests · 70k
    A typed Speaker content model: bio, credentials, audiences, venues[], video{url,poster},
    pressMentions[]. EVERY field optional-with-absent-branch; unset → the block is not
    rendered at all. No placeholder prose, ever.
 B) opus · write-set components/sections/Speaker.tsx + tests · 70k
    "Who is Ravid" section, both locales, seeded ONLY from strings that already exist in
    ravid_website1. Anything missing = absent branch + §OPEN entry.
 C) opus · write-set components/sections/VideoHero.tsx + tests · 60k
    A lazy, privacy-friendly video block (poster + click-to-load, no third-party iframe
    until clicked). Hidden entirely while no URL constant exists. Assert both states.
 D) opus · write-set components/sections/Testimonials.tsx + content + tests · 60k
    Attribution fields (name, role, organisation) added to the model. Where the source has
    no attribution, render the quote WITHOUT a fabricated name and log §OPEN. Never invent
    an institution, a rank or a logo.
GATE: with all new content unset the page is byte-identical to today (prove it) · with a
seeded fixture all four blocks render in both locales · 0 invented strings (diff-proved).
```

## W12 — FINDABILITY (P1-3, P1-5) · 3 delegates
```
GOAL: the people searching for exactly this speaker can find him, and the shop stops
leaking the funnel.
 A) opus · write-set lib/seo/jsonld.ts, app/[locale]/layout.tsx metadata, app/sitemap.ts · 80k
    JSON-LD Person + Service (+ Review ONLY if a real attributed review exists — otherwise
    omit the type entirely; never synthesise a rating). Canonical/OG/sitemap must match the
    host that actually serves 200 — measure the redirect first, then pick apex or www, and
    record the decision with its reversal cost.
 B) opus · write-set messages/*.json (copy pass) + tests · 70k
    Booker-phrase pass on EXISTING copy: titles/description/H2s use the words an Israeli
    booker types (הרצאה לזכר חלל צה״ל · הרצאת השראה למלש״בים · הרצאה ליום הזיכרון · יום גיבוש
    חברה). Marketing copy may be drafted; memorial facts may NOT be touched — diff every
    changed key and flag it for Ravid's approval in §OPEN.
 C) sonnet · write-set components/sections/Wine.tsx, config/site.ts (UTM only) + tests · 50k
    Move the wine block AFTER the lead form; every outbound link gets UTM + wine_click
    event + rel="noopener". Assert order in the rendered DOM (law 8).
GATE: JSON-LD validates · canonical host == the host serving 200 · wine block after the
form in served bytes · every copy change listed key-by-key for approval.
```

## W13 — HARDENING & DUTY OF CARE (P2) · 3 delegates
```
 A) opus · privacy notice beside the form (both locales, derived keys), retention statement,
    mailto de-obfuscation removed in favour of the form · + tests · 60k
 B) opus · CSP script-src with a middleware nonce (the W7 deferred item), security headers,
    404 page title fixed, /en 404 regression closed together with the Hebrew 404 copy
    (absent branch until the family answers) · 80k
 C) sonnet · performance: full-scroll weight below the 1.5 MB gate (lazy below-fold images,
    poster sizing), LCP measured on a throttled mobile profile, both numbers recorded · 50k
GATE: CSP present and the page still works (computed, not declared) · headers asserted on a
real response · full-scroll < 1.5 MB measured gzipped · LCP number recorded.
```

## W14 — INDEPENDENT VERIFY · 3 delegates, fresh contexts, wrote none of it
```
 A) opus · static: tsc, ESLint, full vitest, build — replayed / still failing / NEWLY failing
 B) opus · COMPOSITION (the bg-gold lesson): a real browser reads computed style for every
    CTA, form field, focus ring, and the new sections, in he+en × mobile+desktop. A class
    that resolves to nothing is a FAILURE. Playwright specs must exist and run — the e2e
    script being declared is not evidence it runs (W7-A's finding).
 C) opus · adversarial: submit with sink down, provider down, both down, duplicate key,
    honeypot filled, 1 MB payload, 100 req/min, JS disabled, missing message key, /en/404,
    locale cookie tampering. Each: PRESENT · ABSENT · NOT-MEASURED.
GATE: only what survives here is "done". Verifiers REPORT; fixes are separate atoms.
```

## W15 — HANDOFF
```
sonnet · README · MASTER_PLAN · START_HERE · STATUS_DASHBOARD.html (real numbers, same card
format) · SESSION_3_DELTA.md · tarball. Counts READ from the ledger, never retyped.
FINISH BY: changed/proved/counts · verification counts per cycle · what survived independent
verification · DECISIONS with reversal costs · §OPEN one-edit items with file:line ·
§DEFERRED with closers · ONE LINE: the first action owed to Mati.
```

---
## What the night CANNOT produce (and will therefore prepare, not fake)
| Blocked | Prepared tonight | Activation |
|---|---|---|
| Resend key, lead-to/from, storage creds, GA4 id | full paths + adapters + unset-safe tests | you paste values in Vercel |
| Instagram handle | one constant, URL derived | 1 edit |
| English badge names · Hebrew 404 · English alt text | absent branches + §OPEN | family answers |
| Institution names, testimonial attributions | optional fields, no invention | Ravid confirms |
| Video | lazy block, hidden while unset | one URL |
