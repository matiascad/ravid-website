// ─────────────────────────────────────────────────────────────────────────────
// W13-A PRIVACY NOTICE — components/sections/PrivacyNotice.tsx
//
// WHAT THIS FILE IS, STATED BEFORE ANYTHING ELSE: it is a FULLY BUILT AND FULLY
// WIRED PATH FOR A NOTICE THAT DOES NOT EXIST YET, AND TODAY IT RENDERS NOTHING.
// It contains no privacy statement, no retention period and no sentence of any
// kind. It cannot: a privacy notice and a retention period are STATEMENTS OF
// FACT ABOUT WHAT RAVID DOES WITH A STRANGER'S DETAILS, and this repository does
// not contain those facts. See THE REFUSAL below.
//
// INVARIANT     The notice is ATOMIC. It renders if and only if ALL THREE of its
//               facts are present and non-empty, and it renders NOTHING
//               otherwise — not a heading with an empty body, not a collection
//               statement without a retention period, not a partial notice of
//               any shape. `resolvePrivacyNotice` is the ONE place that decides
//               presence, and both the render and the form's `aria-describedby`
//               are derived from that one call, so the announced description and
//               the rendered element cannot disagree.
//
// IMPOSSIBLE    (a) A HALF NOTICE. A catalogue that answers "what is collected"
//                   but not "how long it is kept" produces NO notice, not a
//                   notice missing its retention line. The three fields are
//                   destructured together and any one absent or empty returns
//                   `null` — there is no branch that renders two of three.
//                   This matters more than it looks: a partial privacy notice
//                   reads to a visitor as a COMPLETE one, so a missing retention
//                   line is not an omission, it is an implied claim that there
//                   is nothing further to say. That claim cannot be constructed
//                   here.
//               (b) A NOTICE A SCREEN READER CANNOT REACH. There is no
//                   `hidden`, no `sr-only`, no `aria-hidden` and no
//                   `display:none` in this file. The element is a `<section>`
//                   with `aria-labelledby` pointing at its own heading, so it
//                   is a landmark with an accessible name in the accessibility
//                   tree, and `PRIVACY_NOTICE_ID` is exported precisely so the
//                   `<form>` can name it in `aria-describedby`. The notice is
//                   either fully present to everyone or absent for everyone.
//               (c) COPY BORN IN A COMPONENT. Every user-visible character here
//                   arrives through `m`, which is the message catalogue object
//                   the page already passes to `LeadForm`. There is no string
//                   literal in this file that a visitor can read, and that
//                   includes the kinds a grep for quotes misses: no `aria-label`,
//                   no `alt`, no `title`, no `placeholder`, no visually-hidden
//                   heading. (Ledger D-88: all five are user-visible copy.)
//               (d) A SECOND HOME FOR THE NOTICE'S ID. `PRIVACY_NOTICE_ID` is
//                   spelled once and exported; `LeadForm` imports it rather than
//                   retyping it, so the `aria-describedby` target and the
//                   element that exists cannot drift apart.
//
// ── THE REFUSAL, IN FULL ─────────────────────────────────────────────────────
//
// This delegate was asked for three things: a privacy notice, a retention
// statement, and the removal of a `mailto:` de-obfuscation. It was told to
// compose the text from catalogue keys that ALREADY EXIST, authoring nothing.
//
// MEASURED: the form's entire catalogue surface is seventeen keys — `formTitle`,
// `formSubtitle`, the five labels, the five placeholders, `formSubmit`,
// `formSuccess`, `formSuccessDesc`, `formDirect` and `required`. Not one of them
// says anything about data. There is no `privacy` key, no `retention` key and
// no sentence anywhere in either catalogue that describes what happens to a
// submission.
//
// SO THE COMPOSITION WAS ATTEMPTED AND ABANDONED, for reasons worth recording:
//
//   1. THE LABELS ARE NOT A COLLECTION NOTICE. It is tempting to build "we
//      collect NAME, PHONE, EMAIL, ORGANISATION, MESSAGE" out of the five label
//      keys, because those five words are true and already on screen. It would
//      still be FALSE AS A NOTICE, and measurably so: `app/api/lead/route.ts`
//      stores a record that also carries a generated lead id, a `receivedAt`
//      timestamp and a delivery state, and the form additionally posts `locale`
//      and the honeypot `hp_ref`. A notice listing five of those things reads as
//      an exhaustive list and is not one. Restating the labels does not inform a
//      reader who can already see them; it only adds the false implication that
//      the list is complete.
//   2. "IT IS NOT SHARED" IS NOT DERIVABLE FROM ANYTHING. No key says it and no
//      line of code proves it. The route attempts one notification to the
//      address named by the `LEAD_TO_EMAIL` environment variable — through a
//      third-party mail provider — and writes to a sink resolved at runtime.
//      What that provider retains, and whether Ravid forwards an enquiry to a
//      school or a unit, are facts about Ravid's conduct, not about this code.
//   3. A RETENTION PERIOD IS A FACT ONLY RAVID KNOWS. There is no expiry in the
//      sink, no TTL in the route and no answer in the catalogue. Writing "we
//      keep your details for twelve months" would be an invention, and it is the
//      worst available kind: not a wrong date on a memorial page, but a PROMISE
//      MADE TO A BEREAVED STRANGER ABOUT THEIR OWN DATA, in the one place on
//      this site where they are asked to hand it over.
//
// So no text was written. What was built instead is the whole path: the shape of
// the answer, the atomicity rule, the accessibility association, the tests, and
// a render that is provably worth ZERO BYTES until the facts arrive. When Ravid
// answers, three strings enter the catalogue and this notice appears, correct
// and announced, with no further code change.
//
// CLASS         Closed by DERIVATION for this notice's atomicity and for its
//               absence: `resolvePrivacyNotice` is total over `Partial<
//               PrivacyNoticeText>` and has exactly one non-null return, so
//               there is no input — no half-filled catalogue, no empty string,
//               no whitespace-only answer that trims to nothing — that yields a
//               partial render. It is only an INSTANCE for the wider class "no
//               component states a fact the repo cannot prove": nothing here
//               constrains any sibling section, and no lint rule bans a hardcoded
//               sentence. That derivation would be an ESLint restriction over
//               `components/`, which is outside this delegate's write-set.
//
// HONEST LIMIT  Six, stated plainly.
//   1. THIS FILE PROVES SHAPE AND REACHABILITY, NEVER TRUTH. If Ravid answers
//      the three keys with a sentence that is wrong, this component renders it
//      faithfully and announces it correctly. Nothing here — and nothing
//      anywhere in this repo — can check a privacy claim against what actually
//      happens to a lead. That check is a human one and it is owed.
//   2. IT RENDERS NOTHING TODAY, AND THAT IS THE POINT, BUT IT IS ALSO A REAL
//      GAP. A visitor who fills in this form today is told NOTHING about what
//      becomes of their name, phone and message. That is the honest state, not
//      a good one. Until the catalogue answers, the site collects personal data
//      from bereaved families with no statement attached. Saying so here is the
//      only thing this file can do about it. See the ledger §OPEN item.
//   3. THE ANSWER IS THREE EDITS, NOT ONE, AND THE OTHER TWO ARE OUTSIDE THIS
//      DELEGATE'S WRITE-SET. `i18n/messages.ts` parses both catalogues with
//      `z.strictObject`, so a key added to `messages/he.json` that the schema
//      does not name is an `unrecognized_keys` error at module load — the site
//      would fail to serve. The three keys must therefore be added to the schema
//      AND to both catalogues, in that order. What this file buys is that NO
//      COMPONENT AND NO PAGE CHANGES: `app/[locale]/page.tsx` already passes the
//      whole `getMessages(locale)` result as `m`, so the keys flow through the
//      moment they exist. It is not one edit and this file does not claim to be
//      one; it is three edits in two files, none of them in a component.
//   4. NO RENDERED-PIXEL CLAIM. jsdom computes no layout and loads no
//      stylesheet, so whether this notice is LEGIBLE — grey small text over the
//      darkened photograph behind the form — is unverified here. It is a
//      contrast question and it is owed to a visual pass, and it matters: a
//      privacy notice nobody can read is the same failure as one nobody can
//      reach, which is why (b) above is tested and this is not.
//   5. `aria-describedby` IS A DESCRIPTION, NOT A GATE. Associating the notice
//      with the form means a screen-reader user hears it when focus enters the
//      form. It does not make anyone read it, it is not consent, and it is not
//      a lawful basis for anything. This file makes the notice REACHABLE; it
//      cannot make it EFFECTIVE.
//   6. WHITESPACE IS TRIMMED FOR THE PRESENCE TEST ONLY. A key answered with
//      spaces counts as unanswered, which is right. But the trimmed value is
//      NOT what renders — the original string is, so a deliberate leading
//      character in Hebrew or English survives. The two are different on
//      purpose.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The three facts a privacy notice on this form must state, and the exact names
 * of the catalogue keys that will carry them. Held together in one type because
 * they are answered together or not at all — see IMPOSSIBLE (a).
 *
 *   privacyTitle      the notice's heading; becomes its accessible name.
 *   privacyData       what is collected and where it goes.
 *   privacyRetention  how long an enquiry is kept.
 *
 * NONE OF THE THREE EXISTS IN THE CATALOGUE TODAY. This type is the shape of an
 * answer, not a claim that one has been given.
 */
export type PrivacyNoticeText = {
  readonly privacyTitle: string;
  readonly privacyData: string;
  readonly privacyRetention: string;
};

/**
 * The notice's element id, spelled ONCE. `LeadForm` imports this to name the
 * notice in the form's `aria-describedby`; nothing retypes it. See IMPOSSIBLE (d).
 */
export const PRIVACY_NOTICE_ID = 'lead-form-privacy';

/** The heading's own id, so the section's accessible name comes from its heading. */
const PRIVACY_HEADING_ID = 'lead-form-privacy-title';

type PrivacyNoticeProps = {
  /**
   * The message catalogue object the page already passes to `LeadForm`. Typed as
   * `Partial` because these keys do not exist in `Messages` yet; when they do,
   * the same object satisfies this without any call site changing.
   */
  m: Partial<PrivacyNoticeText>;
};

/**
 * THE ONE PLACE THAT DECIDES WHETHER A NOTICE EXISTS.
 *
 * Returns the three facts together, or `null`. There is no third outcome, so a
 * caller cannot accidentally render a heading with nothing under it. Both the
 * render below and `LeadForm`'s `aria-describedby` go through this function, so
 * "the notice is described to the form" and "the notice is on the page" are the
 * same fact, computed once.
 *
 * An answer that trims to nothing is not an answer — see HONEST LIMIT 6.
 */
export function resolvePrivacyNotice(m: Partial<PrivacyNoticeText>): PrivacyNoticeText | null {
  const { privacyTitle, privacyData, privacyRetention } = m;

  if (privacyTitle === undefined || privacyTitle.trim().length === 0) return null;
  if (privacyData === undefined || privacyData.trim().length === 0) return null;
  if (privacyRetention === undefined || privacyRetention.trim().length === 0) return null;

  return { privacyTitle, privacyData, privacyRetention };
}

/**
 * Renders the notice, or NOTHING AT ALL.
 *
 * `null` is returned for the unanswered catalogue, which React renders as zero
 * nodes and therefore zero bytes — the night-wide gate holds by construction,
 * not by a class that happens to hide something. The test asserts
 * `container.innerHTML === ''`, not that this function returned null.
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
      <p className="mt-1.5 text-sm text-gray-300">{text.privacyRetention}</p>
    </section>
  );
}
