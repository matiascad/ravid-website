// ─────────────────────────────────────────────────────────────────────────────
// W5-C ANALYTICS — lib/analytics.ts  — THE TYPED BOUNDARY
//
// INVARIANT     The GA4 measurement id enters this project through exactly ONE
//               door: `measurementId()`. That door reads one environment
//               variable, trims it, and returns it ONLY if it matches the GA4
//               shape `G-` + uppercase alphanumerics. Nothing else in the repo
//               reads `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID`, and no other
//               function builds the gtag URL or the gtag init snippet — so the
//               id, the tag URL and the inline script are three views of ONE
//               validated value.
//
// IMPOSSIBLE    (a) SCRIPT INJECTION THROUGH A CONFIG VALUE. The id is
//                   interpolated into a JavaScript string literal inside an
//                   inline <script>. A value containing a quote, a backslash, a
//                   newline or `</script>` would break out of it. That cannot be
//                   CONSTRUCTED here: `gtagSrc` and `gtagInitSnippet` do not
//                   accept `string` — they accept `MeasurementId`, a branded
//                   type whose ONLY constructor is the validated branch of
//                   `measurementId()`. `gtagInitSnippet('G-X"; evil()')` is a
//                   COMPILE ERROR, not a runtime escape. The guarantee is
//                   type-level, not prose.
//               (b) A SECOND, DRIFTING COPY OF THE ENV VAR NAME. The name is
//                   exported once as `MEASUREMENT_ID_ENV_VAR` for diagnostics
//                   and tests; the read below spells it out statically because
//                   it MUST (see the note on that line), and those are the only
//                   two occurrences in the repo.
//               (c) A SECRET IN THIS FILE. It holds an env var NAME and a public
//                   Google host. It contains no id, no key and no address.
//               (d) A SPECULATIVE EVENT API. There is none — see HONEST LIMIT 1.
//
// CLASS         Closed by derivation for "the measurement id reaches the browser
//               unvalidated": every path to the wire goes through the brand, and
//               the brand has one constructor. It is only THIS INSTANCE for the
//               wider class "every third-party config value is validated" — this
//               file validates THIS one; it installs no rule about the next one.
//
// HONEST LIMIT  1. THERE IS NO `trackEvent()` HERE, DELIBERATELY. The brief
//                  offered one "if the site genuinely needs it". Measured: the
//                  only plausible caller is components/sections/LeadForm.tsx (a
//                  submit/conversion event), and that file is outside this
//                  delegate's write-set, so an event helper added tonight would
//                  have ZERO call sites — which is precisely the defect this
//                  wave exists to remove, wearing a new costume. When a caller
//                  exists, the helper lands with it.
//               2. A MISTYPED ID FAILS QUIETLY. `GT-XXXX` (a Google Tag
//                  container), `UA-XXXX` (dead Universal Analytics), or an id
//                  with a stray space fails the pattern and `measurementId()`
//                  returns undefined — indistinguishable, from the outside, from
//                  "analytics not configured". Chosen on purpose: the
//                  alternative is throwing inside the root layout, i.e. taking
//                  the whole memorial site down over an analytics typo. The cost
//                  is that a typo shows up as silence, not as an error.
//               3. THIS FILE CANNOT PROVE ANALYTICS WORKS. It proves a
//                  well-formed id produces a well-formed URL and snippet.
//                  Whether Google accepts the id, whether the property exists,
//                  and whether any hit is ever recorded are facts about a
//                  Google account this project has no access to and no test can
//                  reach. Nothing here is verified over the network.
//               4. THE PATTERN IS A SHAPE CHECK, NOT A REGISTRY CHECK. It cannot
//                  tell a real measurement id from a well-formed invented one.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The NAME of the environment variable carrying the GA4 measurement id.
 * A name, never a value — this module reads `process.env` and exports nothing
 * out of it except an already-validated id.
 *
 * `NEXT_PUBLIC_`-prefixed, matching `SITE_URL_ENV_VAR` in `@/lib/seo`. The id is
 * public by nature — it is rendered into the page's own script URL, so it is
 * visible to anyone who opens devtools, and it is not a secret. The prefix says
 * that out loud at the NAME level, and it keeps the value defined identically on
 * the server and in the browser. See HONEST LIMIT 5 in components/Analytics.tsx
 * for the one way in which the prefix is not load-bearing TODAY.
 */
export const MEASUREMENT_ID_ENV_VAR = 'NEXT_PUBLIC_GA_MEASUREMENT_ID' as const;

/**
 * GA4 measurement ids are `G-` followed by uppercase alphanumerics. The bound is
 * deliberately loose on length (Google has never promised one) and strict on the
 * ALPHABET, because the alphabet is what makes the id safe to interpolate into a
 * JavaScript string literal: no quote, no backslash, no angle bracket, no
 * newline can pass.
 */
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,32}$/;

declare const measurementIdBrand: unique symbol;

/**
 * A string that HAS BEEN CHECKED against MEASUREMENT_ID_PATTERN. It is a plain
 * string at runtime; the brand exists only so the compiler can tell a validated
 * id from any other string. It cannot be produced by a cast made elsewhere
 * without naming this type, which is a reviewable act rather than an accident.
 */
export type MeasurementId = string & { readonly [measurementIdBrand]: 'ga4' };

/**
 * THE measurement id, or `undefined` when analytics is not configured.
 *
 * Read at CALL time rather than at module load — the same choice, for the same
 * reason, as `siteOrigin()` in `@/lib/seo`: the branch stays observable, so a
 * test can exercise both halves and a platform that injects env after import
 * still gets the value.
 *
 * The env var is spelled out STATICALLY on the line below and cannot be replaced
 * by `process.env[MEASUREMENT_ID_ENV_VAR]`. Next inlines `process.env.NEXT_PUBLIC_*`
 * into the client bundle by TEXTUAL substitution of the member expression; a
 * computed lookup is not substituted and would read `undefined` in the browser.
 * The constant above therefore names the variable for humans and tests, while
 * this line is the form the bundler can see. That is the one place in this file
 * where one fact has two spellings, and it is a compiler constraint, not a
 * choice.
 */
export function measurementId(): MeasurementId | undefined {
  const raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof raw !== 'string') {
    return undefined;
  }
  const trimmed = raw.trim();
  // An env var set to "" by a deploy UI is an accident, not a configuration.
  if (!MEASUREMENT_ID_PATTERN.test(trimmed)) {
    return undefined;
  }
  return trimmed as MeasurementId;
}

/** The ONLY way to build the gtag.js URL. No component may concatenate it. */
export function gtagSrc(id: MeasurementId): string {
  return `https://www.googletagmanager.com/gtag/js?id=${id}`;
}

/**
 * The ONLY way to build the gtag bootstrap. Page views and nothing else.
 *
 * PRIVACY, stated rather than assumed — this is a memorial site:
 *   · No custom event, no user id, no user properties, no cross-domain linker
 *     and no second vendor are configured here. The default `page_view` that
 *     `gtag('config', …)` sends is the entire data collection this file causes.
 *   · `anonymize_ip` is NOT set, and its absence is deliberate, not an oversight.
 *     In GA4 (unlike Universal Analytics) IP anonymisation is applied by Google
 *     on ingestion and the parameter is ignored; setting it would be a comment
 *     dressed up as code, and would imply a control this file does not have.
 *   · Google Consent Mode defaults are NOT set — see HONEST LIMIT 6 in
 *     components/Analytics.tsx. That is an open question, not a closed one.
 */
export function gtagInitSnippet(id: MeasurementId): string {
  return [
    'window.dataLayer = window.dataLayer || [];',
    'function gtag(){dataLayer.push(arguments);}',
    "gtag('js', new Date());",
    `gtag('config', '${id}');`,
  ].join('\n');
}
