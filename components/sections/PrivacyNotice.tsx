// ─────────────────────────────────────────────────────────────────────────────
// W16-A PRIVACY NOTICE — components/sections/PrivacyNotice.tsx
// (W13-A built this path and shipped it EMPTY. It now carries text. Read
//  "THE REFUSAL, AND WHAT OVERRULED IT" below before changing a word of it.)
//
// WHAT THIS FILE IS: the notice beside the lead form. It holds NO sentence of
// its own — every readable character arrives through `m` from the message
// catalogue, except the contact ADDRESS, which arrives from `PUBLIC_EMAIL` in
// config/site.ts because that address is a fact with one home and this file is
// not it.
//
// INVARIANT     The notice is ATOMIC over `PRIVACY_KEYS`. It renders if and only
//               if EVERY key in that list is present and non-blank, and renders
//               NOTHING otherwise — not a heading with an empty body, not a
//               collection statement without a retention line, not a retention
//               line without the route to deletion. `PRIVACY_KEYS` is the ONE
//               list; the props type, the resolver and the test's subset
//               enumeration are all derived from it, so a key added there is
//               required everywhere at once or nothing compiles.
//               `resolvePrivacyNotice` is the ONE place that decides presence,
//               and both this render and the form's `aria-describedby` are
//               derived from that one call, so the announced description and the
//               rendered element cannot disagree.
//
// IMPOSSIBLE    (a) A HALF NOTICE. A catalogue answering "what is kept" but not
//                   "how to ask for deletion" produces NO notice, not a notice
//                   missing its last line. The keys are checked as a set and any
//                   one absent, empty or whitespace-only returns `null` — there
//                   is no branch that renders four of five. This matters more
//                   than it looks: a partial privacy notice reads to a visitor as
//                   a COMPLETE one, so a missing line is not an omission, it is
//                   an implied claim that there is nothing further to say.
//               (b) A NOTICE A SCREEN READER CANNOT REACH. No `hidden`, no
//                   `sr-only`, no `aria-hidden`, no `display:none` in this file.
//                   The element is a `<section>` with `aria-labelledby` pointing
//                   at its own heading, so it is a landmark with an accessible
//                   name, and `PRIVACY_NOTICE_ID` is exported precisely so the
//                   `<form>` can name it in `aria-describedby`. Present to
//                   everyone or absent for everyone.
//               (c) COPY BORN IN A COMPONENT. There is no string literal here a
//                   visitor can read — including the kinds a grep for quotes
//                   misses: no `aria-label`, no `alt`, no `title`, no
//                   `placeholder`, no visually-hidden heading. (Ledger D-88: all
//                   five are user-visible copy.)
//               (d) A SECOND SPELLING OF THE ADDRESS, OR OF `mailto:`. The
//                   address is `PUBLIC_EMAIL`; the href is `mailtoLink()`, which
//                   config/site.ts declares to be the only way to build one. A
//                   notice that told a bereaved family to write to an address the
//                   footer no longer uses cannot be constructed from here.
//               (e) A SECOND HOME FOR THE NOTICE'S ID. `PRIVACY_NOTICE_ID` is
//                   spelled once and exported; `LeadForm` imports it.
//
// ── THE REFUSAL, AND WHAT OVERRULED IT ───────────────────────────────────────
//
// W13-A (ledger D-126/D-127) built this path and DELIBERATELY shipped it with no
// copy, concluding that a notice cannot be honest because "the moment it is
// framed as a NOTICE the reader takes it as COMPLETE. That framing is itself the
// legal claim." Its three grounds were:
//   1. the five field labels are not a collection notice — restating them implies
//      an exhaustive list that is not one;
//   2. "it is not shared" is derivable from nothing;
//   3. a retention period is a fact only Ravid knows, and inventing one is a
//      promise made to a bereaved stranger about their own data.
// All three were correct and NONE of them is repealed by shipping this text.
// What changed is that the owner ordered a notice, and a reader told NOTHING is
// not thereby safer — so the text below was DERIVED from the code rather than
// composed, and each ground was answered on its own terms:
//   1. answered by EXHAUSTING the record instead of restating labels. `privacy
//      Data` lists what `createLeadRecord` actually stores — the five fields, the
//      page locale, the generated id and `receivedAt` — plus the one thing the
//      route touches that is NOT stored (the caller address, held in memory for
//      a 60-second rate-limit window). It is a complete statement, so being read
//      as complete is no longer a falsehood.
//   2. NOT ANSWERED, AND THEREFORE NOT SAID. No sentence here claims the enquiry
//      is not shared. `privacyPurpose` states only the destinations the code
//      itself produces: the configured lead sink, one notification through an
//      external mail service, and — if an address was given — one confirmation
//      back to the sender. What a mail provider retains, and whether an enquiry
//      is forwarded onward by a human, remain outside this repo and outside this
//      notice. See HONEST LIMIT 2.
//   3. NO PERIOD IS STATED, BECAUSE THE SYSTEM ENFORCES NONE. The KV sink writes
//      `["SET", "lead:<id>", <json>]` with NO TTL argument and the webhook sink
//      POSTs a record with no expiry; nothing in this repo deletes a lead, ever.
//      So `privacyRetention` states THAT — no expiry, no automatic deletion —
//      which is a fact about this code, and `privacyContact` gives the route by
//      which a person may ASK. It promises no interval and no outcome, because
//      neither is enforced by anything here. A number would have been a lie; its
//      absence is the true answer, written so the notice does not need one.
//
// CLASS         Closed by DERIVATION for atomicity and for the key set: the
//               resolver is total over `Partial<PrivacyNoticeText>`, iterates
//               `PRIVACY_KEYS` and has exactly one non-null return, so no input
//               — no half-filled catalogue, no empty string, no whitespace-only
//               answer — yields a partial render, for any future key list.
//               INSTANCE for CONTENT: nothing here can check a privacy claim
//               against what is actually done with a lead, and no lint rule stops
//               a sibling component hardcoding a sentence.
//
// HONEST LIMIT  Seven, stated plainly. 1, 2 and 3 are the ones a reader of the
//               notice is entitled to know.
//   1. THIS IS A STATEMENT OF WHAT THE CODE DOES, NOT A LEGAL PRIVACY POLICY.
//      It names no controller, no lawful basis, no processor list, no rights
//      enumeration and no supervisory authority. It is accurate about the
//      mechanism and silent about the law, and a site that needs the second has
//      not got it here.
//   2. THE NOTICE STOPS AT THE EDGE OF THE CODE. Once the notification leaves
//      through the mail provider, or the record reaches a configured webhook,
//      what those systems keep is not observable from this repository, and this
//      notice does not speak for them.
//   3. "STORED IN THE SITE'S ENQUIRY STORE" IS TRUE BUT DEPLOYMENT-DEPENDENT.
//      `resolveLeadSink` picks a KV store, a webhook, both, or an unconfigured
//      sink that stores nothing — from environment variables, at request time.
//      The notice names the destination generically for exactly that reason: a
//      specific product name would be false on some deployments of this code.
//   4. NO RENDERED-PIXEL CLAIM. jsdom computes no layout and loads no
//      stylesheet, so whether this notice is LEGIBLE — small grey text over the
//      darkened photograph behind the form — is unverified in the unit tests.
//      A privacy notice nobody can read is the same failure as one nobody can
//      reach. It is owed to a visual pass.
//   5. `aria-describedby` IS A DESCRIPTION, NOT A GATE. It means a screen-reader
//      user hears the notice on entering the form. It does not make anyone read
//      it, it is not consent, and it is not a lawful basis for anything.
//   6. WHITESPACE IS TRIMMED FOR THE PRESENCE TEST ONLY. A key answered with
//      spaces counts as unanswered, which is right. The trimmed value is NOT what
//      renders — the original string is — so a deliberate leading character in
//      Hebrew or English survives.
//   7. THE HEBREW IS THE SOURCE AND THE ENGLISH IS ITS TRANSLATION, and nothing
//      here proves they agree. Two catalogues can drift into saying different
//      things about the same data; the schema proves both are present and
//      non-empty, never that they mean the same thing.
// ─────────────────────────────────────────────────────────────────────────────

import { mailtoLink, PUBLIC_EMAIL } from '@/config/site';

/**
 * THE LIST. Every fact the notice must carry, named by its catalogue key, in the
 * order a reader receives them. Spelled ONCE: the type below is derived from it,
 * the resolver iterates it, the schema/catalogue coupling test in
 * `i18n/__tests__/privacy-catalogue.test.ts` reads it, and the atomicity test
 * enumerates its subsets. Adding a key here makes it REQUIRED in both
 * catalogues and in the zod schema, or the suite goes red and the site refuses
 * to load the catalogue.
 *
 *   privacyTitle      the notice's heading; becomes its accessible name.
 *   privacyData       WHAT is kept — the fields of the stored record.
 *   privacyPurpose    WHY, and WHERE it goes.
 *   privacyRetention  HOW LONG — what the code does and does not enforce.
 *   privacyContact    HOW TO ASK FOR DELETION. The address itself is not a
 *                     catalogue key: it is `PUBLIC_EMAIL`, appended by the
 *                     render, so it has one home for the whole site.
 */
export const PRIVACY_KEYS = [
  'privacyTitle',
  'privacyData',
  'privacyPurpose',
  'privacyRetention',
  'privacyContact',
] as const;

export type PrivacyKey = (typeof PRIVACY_KEYS)[number];

/** The facts a privacy notice on this form must state. Derived, never retyped. */
export type PrivacyNoticeText = { readonly [K in PrivacyKey]: string };

/**
 * The notice's element id, spelled ONCE. `LeadForm` imports this to name the
 * notice in the form's `aria-describedby`; nothing retypes it.
 */
export const PRIVACY_NOTICE_ID = 'lead-form-privacy';

/** The heading's own id, so the section's accessible name comes from its heading. */
const PRIVACY_HEADING_ID = 'lead-form-privacy-title';

type PrivacyNoticeProps = {
  /**
   * The message catalogue object the page already passes to `LeadForm`. Kept
   * `Partial` deliberately even though the catalogue now answers every key: a
   * component that cannot represent the unanswered state cannot be proved to
   * stay silent in it, and test 1 renders exactly that state.
   */
  m: Partial<PrivacyNoticeText>;
};

/**
 * THE ONE PLACE THAT DECIDES WHETHER A NOTICE EXISTS.
 *
 * Returns every fact together, or `null`. There is no third outcome, so a caller
 * cannot accidentally render a heading with nothing under it. Both the render
 * below and `LeadForm`'s `aria-describedby` go through this function, so "the
 * notice is described to the form" and "the notice is on the page" are the same
 * fact, computed once.
 *
 * An answer that trims to nothing is not an answer — see HONEST LIMIT 6.
 */
export function resolvePrivacyNotice(m: Partial<PrivacyNoticeText>): PrivacyNoticeText | null {
  const answered: Partial<Record<PrivacyKey, string>> = {};

  for (const key of PRIVACY_KEYS) {
    const value = m[key];
    if (value === undefined || value.trim().length === 0) return null;
    answered[key] = value;
  }

  // Every key was proved present and non-blank in the loop above, which is what
  // the assertion records; there is no path here with a key missing.
  return answered as PrivacyNoticeText;
}

/**
 * Renders the notice, or NOTHING AT ALL.
 *
 * `null` is returned for an unanswered catalogue, which React renders as zero
 * nodes and therefore zero bytes. The test asserts `container.innerHTML === ''`,
 * not that this function returned null.
 */
export function PrivacyNotice({ m }: PrivacyNoticeProps) {
  const text = resolvePrivacyNotice(m);
  if (text === null) return null;

  return (
    <section
      id={PRIVACY_NOTICE_ID}
      aria-labelledby={PRIVACY_HEADING_ID}
      className="mt-6 rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-center"
    >
      <h3 id={PRIVACY_HEADING_ID} className="mb-1.5 text-sm font-semibold text-white">
        {text.privacyTitle}
      </h3>
      <p className="text-sm text-gray-300">{text.privacyData}</p>
      <p className="mt-1.5 text-sm text-gray-300">{text.privacyPurpose}</p>
      <p className="mt-1.5 text-sm text-gray-300">{text.privacyRetention}</p>
      <p className="mt-1.5 text-sm text-gray-300">
        {text.privacyContact}{' '}
        {/* The address is a fact from config/site.ts and the href is the one
            builder that file permits. `dir="ltr"` because the address is Latin
            script inside a right-to-left paragraph, and bidi would otherwise
            reorder its punctuation. */}
        <a
          dir="ltr"
          href={mailtoLink()}
          className="underline underline-offset-2 hover:text-white focus-visible:text-white"
        >
          {PUBLIC_EMAIL}
        </a>
      </p>
    </section>
  );
}
