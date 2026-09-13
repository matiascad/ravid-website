# MASTER PLAN — the architecture, and why it is this shape

This document exists for one purpose: **to stop the next person re-introducing a defect this rebuild
removed.** Several of the rules below look like taste. They are not. Each one is the third attempt at a
spot where the first two attempts failed silently, and in most cases the failure was *invisible to every
automated check in the repo*.

Decisions are referenced by their ledger number (D-4, D-19, D-20 …). **The ledger
`REBUILD_STATUS_v1_00.md` §DECISIONS holds the full reasoning, the alternatives that were priced, and
the cost of reversing each one.** They are not restated here — a decision described in two places drifts.

One rule governs all of them, and it is worth stating once in full:

> **Anything that cannot fail is measuring nothing, and it is more dangerous than no check, because it
> is believed.**

---

## 1. The message catalogue: `getMessages()` is the only sanctioned reader

**The model.** `messages/he.json` and `messages/en.json` are the single home of every string the site
displays. Hebrew is the source locale. A key present in `he` and absent in `en` resolves to the
source-locale value through one typed helper — never per-component, never by duplicating the Hebrew into
`en.json` (D-18). The gap stays visible in `en.json` on purpose, so the family's eventual answer is one
edit rather than a hunt.

**The contract.** `getMessages()` from `@/i18n/messages` is the **only** way to read a message.
next-intl's own message-reading APIs are banned by an ESLint error (D-20, D-23).

**Why a ban and not a convention.** This was the third cycle on one spot:

1. The customer's build typed the translator as `any`. No check could see a wrong key.
2. We installed next-intl's `AppConfig` augmentation to make keys compile-checked — and it was **proved
   inert**. One array-valued key anywhere collapses next-intl's key typing for the whole catalogue to
   `string`, and this catalogue has many. A misspelled key compiled. The customer's defect had returned
   through a different door: their type was declared and never applied, ours was applied and did
   nothing. (D-19; the competing explanation for *why* it was inert, and how it was settled by
   measurement, is ledger §W3 contradiction #2.)
3. A typed, schema-validated accessor was shipped — and the delegate that wrote it **named the remaining
   hole itself**: a caller could still reach an unchecked key. Within the hour another delegate hit that
   hole for real, in the first of thirteen section files, before the wave even closed.

So the answer is not a fourth type. It is **removing the capability**: the wrong call is made
unwritable. The ban is keyed on *import name*, not file path — so there is no allowlist to maintain and
nowhere to move a file to escape it (D-23). The banned set includes one name that collides exactly with
the sanctioned one, which an editor auto-import would otherwise have walked straight into.

**The shape of the guarantee.** `Messages` is inferred from a zod schema — never hand-written. Both
catalogues validate against that schema at load, lazily, per locale (D-22). A mismatch is an observable
failure with an exact dotted path, not a silent `string`. This is strictly stronger than key typing,
which never checked that the data matched its declared shape at all.

**⛔ Do not**: hand-write a type that describes the catalogue; re-import a banned reader "just here";
de-array the JSON to restore key typing (rejected in D-19 — the catalogue must stay legible to the
family member who may want to correct a sentence himself); or duplicate a Hebrew string into `en.json`
to make a parity check green.

---

## 2. The locale routing contract

**One `<html>`.** `lang` and `dir` live on `<html>`, emitted by `app/[locale]/layout.tsx` and nowhere
else (D-5). The root layout emits no markup at all. The customer's build never updated `<html>` — that
is one of the four measured i18n defects this rebuild removes, and it is why an `/en` screenshot is
*expected* to differ from their reference.

**`/` redirects to `/he` unconditionally.** Locale detection is disabled (D-24). This is a memorial page
shared by link; a URL that opens in a different language depending on the recipient's browser is a worse
thing to share than one that always opens in Hebrew with a visible switcher. The cost is recorded rather
than implied: the language switcher is the only discovery path to English. Reversing it is one line.

**`middleware.ts` is the sole owner of that redirect**, and also of two guards that are easy to break:

- **The metadata-route exclusion.** Next's file-convention metadata routes (`opengraph-image`, `icon`,
  `apple-icon`, `twitter-image` …) must not be swallowed into a locale. The matcher excludes the whole
  documented *class*, derived from the installed Next source — not the one route that broke (D-42).
- **The method guard.** Page routes answer `{GET, HEAD, OPTIONS}`; every other method gets 405 with an
  `Allow` header. This is an **allowlist, not a denylist**, because the defect was never the three verbs
  that were reported — it was every method not otherwise handled (D-49).

⚠️ **Both guards carry a trap written into the file's own header. Read them before editing
`middleware.ts`.** The metadata-route failure had been *predicted in writing, in the file it broke*, by
a comment that named the wave, the change and the failure mode — and was ignored anyway. That is why
there is now a **guard test** instead of a third, better comment (D-44). Both halves of that test derive
their inputs at test time — Next's convention list from `node_modules`, the matcher from `middleware.ts`
— because a test carrying a retyped copy of either would drift exactly as the matcher did, and pass.
The other trap: the first Server Action anyone adds POSTs to a page URL, and the method guard will
405 it.

**404s.** The project owns exactly one 404 page. Its copy and markup live in one file; the other files
in that path are routing shims that write no copy (D-25, D-27). Before this, `/api/*` and `/robots.txt`
were served Next's own built-in English 404 — a second 404 page, authored by the framework, that this
project could neither edit nor translate. `lang`/`dir` on a 404's *served bytes* remains deferred with a
named closer and a measured impact (D-26); do not report it as closed, and re-check the dynamic 404 path
before claiming otherwise (ledger §W7, "Two findings no delegate claimed").

---

## 3. Sections are pure, props-driven server components

The composition point calls `getMessages(locale)` **once** and passes each section a typed slice derived
from the zod-inferred type — never a hand-written prop type (D-28). A hand-written prop type is
precisely how the customer's own `Translations` type rotted into irrelevance.

The rules that follow from it:

- **One named export per section. No default export** (D-31). Default exports rename silently at the
  import site, so thirteen sections and one composition file would give every name two spellings.
- **No section reads `locale`** unless it genuinely branches on it. Where a section does not vary by
  locale, that **invariance is asserted as a test** — same props, both locales, compared — so it goes red
  the instant someone adds a locale branch (D-30). A difference test over a component with no
  differences is decoration.
- **`alt` policy**: informative images get a non-empty `alt` from a message key; decorative and
  background images get `alt="" aria-hidden` (D-29). A blanket "every image gets a non-empty alt" rule
  forces either invented copy or a meaningless string on every backdrop — a delegate refused it and was
  right.
- **No CSS `background-image`** (D-32). Decorative images use `next/image` with `fill`. A CSS background
  bypasses the entire asset pipeline — no format negotiation, no responsive sizes, no lazy-loading — on
  exactly the heaviest images on the page.
- **No memorial fact is interpolated into a template string**, and no memorial fact appears in a
  component file. The section files contain **zero Hebrew codepoints**, comments included, and that is
  enforced (D-13).

**The measurement that justifies the test discipline in these files**, and the single most useful thing
in this document for anyone writing a new test: a delegate deliberately broke the pairing between a
bereaved family's quotation and its attribution, so that a quote rendered beside the wrong name. **The
test "every text, icon and name is rendered" stayed green.** Only the assertion that each quote and *its
own* attribution appear within the same card element went red. *"Both present somewhere on the page" is
not a test of attribution.* Full detail: ledger §W4.

---

## 4. Lead delivery — the reason this rebuild exists

**Both predecessor sites told a visitor their enquiry had been sent when it had not.** The mechanism was
a `catch`-only fallback: `fetch` rejects on network failure but *resolves* on a 4xx or 5xx, so a
rejected submission took the success path. A bereaved family's customer was shown a thank-you for a lead
that never arrived (D-4).

**This one cannot.** It is closed at both layers, and was verified by a delegate that wrote none of it:

- **Server** — there is exactly one 2xx producer, reachable only after the send resolves, and the send
  itself throws unless the provider's response is genuinely ok. The unconfigured case is
  **unrepresentable in the type system**: the resolution is a discriminated union whose
  `configured: false` arm has no mailer field, so "send anyway" is a compile error, not a runtime
  branch. Unconfigured returns **503 and says so**.
- **Client** — the success state is assigned at exactly one site, inside a check on the response being
  ok. On a failure the visitor is shown the real fallback contact route, not a thank-you.

The endpoint's full behaviour — what is rejected, with which status, and whether the mailer was called —
is a status table in the ledger at §W5. It covers invalid input, unconfigured provider, provider
rejection, oversize bodies, CR/LF mail-header injection in the two fields that reach mail headers, and
wrong HTTP methods. Adversarial verification found **zero successes and zero server errors** across its
entire hostile surface (§W7-C, attack 7).

**⛔ Never** add a second 2xx return path to that route. **⛔ Never** widen the success condition to
"no exception thrown". Both are the original defect, rewritten.

One structural constraint worth knowing before you try to improve the tests: a Next App Router
`route.ts` may export **only** HTTP methods and route config — any other value export is a build-time
type error. So the test seam sits one layer lower than an exported interface. The named closer, if that
ever becomes a constraint, is in D-36.

---

## 5. The asset pipeline

Source photographs are optimised **at build time by a script in `scripts/`**, not by hand, into `.webp`
in `public/images/`, with a regenerable manifest at `public/images/MANIFEST.md`. Counts, byte figures
and per-file quality measurements are in the ledger at §W6.

The rules that are load-bearing:

- **No crop, no resize, no upscale, no rename.** The delegate that ran the pipeline looked at the
  outputs and reported, unprompted, that the photographer's credit watermark on the portrait is legible
  and intact — **and that cropping would have removed it.** That is the concrete reason the no-crop rule
  earned its place.
- **One stored format.** `next.config.js` already negotiates AVIF from the request's `Accept` header off
  the single `.webp`, so a second stored encoding would be dead weight nothing selects. AVIF was
  *measured* rather than assumed, and it loses on most of these files (§W6).
- **Two files grew as WebP and were kept anyway**, rather than silently switched to `.jpg`, because
  thirteen sections compile against the `.webp` path. The cost was reported, not absorbed (§W6).
- **Page weight is judged on what a visitor downloads before the page is usable**, not on the sum of
  files on disk. That distinction is the whole of D-40/D-41, and the on-disk figure is the wrong metric
  — transferred bytes turned out to be *lower* than on-disk, because Next re-encodes at request time.
  ⚠️ D-41 records that the result is comfortable on the first-paint reading and **marginally over on the
  full-scroll reading**, states both, and says explicitly that the choice of metric is Mati's, not a
  delegate's. Read it before quoting a single number.

If page weight ever needs to come down, the lever is section-level (`sizes` props, which images load
eagerly) — **not** further compression. Halving these photographs again is not a trade an agent makes on
a memorial site.

---

## 6. Platform: styling, security, analytics

**Tailwind colours.** Every colour utility must be defined in `tailwind.config.ts`. **Tailwind silently
emits nothing for an undefined colour** — no error, no warning, no failing test. `gold` is now defined
once, from the one CSS variable that holds the hue; there is no second gold value anywhere (D-46).
⚠️ **D-47(c) is the live edge of this and it has teeth:** the colour definitions carry no alpha channel,
so an opacity variant such as `bg-<colour>/50` will compile to nothing and fail exactly the way
`bg-gold` did — **and that is true of every colour in the config, not just gold.** Section 7 below
explains why this matters more than it sounds.

**Security headers** ship on every route from a single rule, chosen over per-route tuning so that a
route added tomorrow is covered the moment it exists (D-51). `X-Powered-By` is disabled. Enforcement was
proven by capturing the browser's actual refusal, not inferred from the header being present — *a CSP
that has never blocked anything is a string, not a policy.*

**`script-src` is deliberately not set, and the gap is recorded open rather than papered over** (D-52).
A `script-src` worth having needs a per-request nonce, which can only be minted in the middleware. The
nonce-free alternative stops zero XSS and buys only a scanner badge; and a `connect-src 'self'` would
have **silently killed analytics on the day someone first sets the GA variable** — delayed, invisible
breakage inflicted on a future operator. Every unset directive is named in that file's own honest limit.

**`TRACE` returning 500 is deferred to the proxy/CDN layer** and is **not fixable from this repo** — the
exception fires inside Next's own request construction, before one character of our middleware runs, and
Next's matcher has no method predicate (D-50). It is an operational note for deployment.

**Analytics** is a server component that renders `null` when its variable is unset, which is the current
state. It makes no request and emits no script until configured.

---

## 7. Standing rules for whoever works here next

1. **Prove the check can fail.** Every zero-result sweep red-proves its own *tooling* on a mutant, not
   just its target — four separate instruments were caught misreporting in one night, every one of them
   caught by comparing against a value already known to be true (D-45, D-48). A verifier reporting a
   green from a broken instrument is indistinguishable from one reporting a real green.
2. **A test that reads source as text cannot prove a module resolves.** One in this repo passed for an
   hour over a file that did not exist (D-38). If you assert that something is imported, import it.
3. **Greps are comment-blind.** Gates moved up a level to the compiler and the linter for this reason;
   a gate whose obvious repair is "loosen the gate" is worse than no gate (D-13).
4. **A unit test cannot tell you a CSS class is undefined.** See section 8.
5. **When the same spot fails a third time, stop patching it and remove the capability.** That is how
   the message-reader ban, the method allowlist and the metadata-route class exclusion each came about.
6. **Denominator before verdict.** State what was examined, not only what was found. A verifier once
   reported 24 referenced image basenames where there were 25; the missing one was the background of the
   lead form — the site's only business function — and had the wrong number been handed to the asset
   wave, that asset would never have been produced (ledger §W4).
7. **Never invent a memorial fact.** Not a name, not a date, not a unit, not a translation, not a
   sentence to fill an empty string. Where a fact is missing it is recorded in §OPEN and left visibly
   missing. This held across roughly fifty delegates and it is the one rule with no exception.

---

## 8. The near-miss that should change how you verify

**Every automated gate was green while the booking button was invisible.**

The submit button used a `bg-gold` utility. `gold` was never defined in `tailwind.config.ts`, and
Tailwind emits nothing at all for an undefined colour — so the rule simply did not exist. Measured
computed style in the browser: a fully transparent background with black text, on a black surface.
`border-gold` was equally non-existent, including on the WhatsApp fallback link — **the one control a
visitor is offered after a failed send.** A later sweep found the same undefined name across more call
sites than were first reported, and turned up a third dead control nobody had named: every form field's
focus ring was dead, so keyboard users had no focus feedback at all.

More than forty delegates, six waves, five green gates and the entire passing test suite did not catch
it.
**Unit tests assert classnames, and a classname cannot tell you the class is undefined.** It was found
by reading computed style in a real browser, and by nothing else.

Two things follow, and they are the reason this section is last rather than buried in a decision row:

- **A browser pass is not optional on this project.** It is the only instrument that has ever caught
  this class of defect here.
- **The class is still reachable.** D-47(c) leaves every opacity variant of every colour able to fail in
  exactly this way, invisibly, with every check green. Closing it is a project-wide convention change
  and a deliberate decision — not a one-token fix.

Measured values, before and after, are in the ledger at §W7 and D-46.
