// ─────────────────────────────────────────────────────────────────────────────
// W4-11 LEAD FORM — components/sections/LeadForm.tsx
//
// This is the only path by which a bereaved brother gets booked to speak. Both
// existing implementations lose leads while telling the user the opposite:
//
//   DEFECT 1 (_legacy/components/TuvalMemorialLanding.tsx:30-45) — a <div> with a
//   <button onClick> (no <form>, so no native submit and no Enter-key submit),
//   an alert() claiming the enquiry was received, and ZERO network calls. 100%
//   silent lead loss.
//
//   DEFECT 2 (ravid_website1/src/components/FormSection.tsx:19-37) — posts to a
//   third party and never inspects the response. `fetch` rejects only on NETWORK
//   failure, so a 500 RESOLVES, `setSubmitted(true)` runs, and the success panel
//   is shown for a lead that was never delivered. Its WhatsApp fallback sits in
//   the `catch` branch and is therefore unreachable for every HTTP error.
//
// INVARIANT     There is exactly ONE expression in this file that can put the
//               user into the state where they are told the enquiry was sent —
//               the single `setStatus('sent')` — and it is reachable only from
//               `storedId !== null`: an ok response whose BODY carried a
//               readable, non-blank `id`, which is the route's own evidence
//               that a record exists (W9-C). Every other terminal path (a
//               resolved response with `ok === false`, an ok response with no
//               such id in it, a thrown/aborted/timed-out fetch, a failed
//               required-field check) lands on `'failed'` or `'invalid'`, and
//               the success copy is not rendered in either. Success copy has
//               exactly one render site, guarded by `status === 'sent'`, so
//               "told it was sent" and "observed the server's evidence that a
//               record was stored" are the same fact stated once.
//
// IMPOSSIBLE    The lie both existing sites tell can no longer be CONSTRUCTED
//               here. Specifically:
//               (a) SUCCESS FROM A RESOLVED FAILURE, OR FROM A SUCCESS-SHAPED
//                   NON-EVENT. There is no `setSubmitted` after a bare
//                   `await fetch(...)`; the only assignment of the 'sent' status
//                   sits on the `storedId !== null` arm, and `storedId` is
//                   `null` both for every response that is not ok AND for every
//                   ok response whose body carries no readable, non-blank `id`.
//                   Deleting either half does not merely change behaviour — it
//                   turns the suite red (see the RED proofs in the test header),
//                   so neither Defect 2 nor the id-less 201 can be reintroduced
//                   quietly.
//               (b) A FALLBACK UNREACHABLE FOR HTTP ERRORS. The WhatsApp
//                   fallback is rendered from the `'failed'` STATUS, not from a
//                   `catch` block, and all three failing paths — `ok === false`,
//                   an ok response with no stored-lead id in its body, and a
//                   thrown/aborted fetch — set that one status. There is no
//                   branch that can fail without offering it.
//               (c) A SUBMIT THE KEYBOARD CANNOT REACH. This is a real <form>
//                   with onSubmit and a type="submit" control, so implicit
//                   submission (Enter in a text field) and native submit both
//                   run the same handler. There is no onClick submit path.
//               (d) A DOUBLE SEND. `inFlight` is a ref, checked and set
//                   synchronously at the top of the handler, so it closes the
//                   window between a click and React flushing `'submitting'` —
//                   a window a `disabled` attribute alone does not close.
//               (e) A SILENT OUTCOME. Every terminal state renders into one
//                   aria-live region; a screen-reader user is told the same
//                   thing a sighted user sees.
//               (f) AN INLINED CONTACT FACT. No phone number, `wa.me` URL,
//                   Instagram handle or email address is typed in this file;
//                   all four come from `@/config/site`, and the deep link is
//                   built by `whatsappLink()`, which encodes.
//                   (The two `wa.me` mentions a grep finds here are this comment
//                   and the Defect 2 citation above — no executable line has one.)
//               (g) ALERT(). No call to `alert` exists in this file; the only
//                   occurrences of the word are in this header, describing
//                   Defect 1. Every outcome goes through the live region.
//               (h) AN EMPTY FALLBACK — a link that renders but carries nothing.
//                   This one is DERIVED, not merely tested. `'failed'` is
//                   reachable only after `missingRequired(values).length === 0`,
//                   and `setValues(EMPTY)` appears exactly once, inside the
//                   `storedId !== null` branch — so `values.name` and `values.phone`
//                   are non-empty at every render in which the fallback exists,
//                   and `buildPrefill` emits a labelled line for each non-empty
//                   field. Therefore the prefill ALWAYS carries at least the
//                   name and the phone: a failure cannot produce a bare
//                   `wa.me` link. The href is also computed during render from
//                   the live `values` rather than snapshotted at submit time, so
//                   a correction typed after the failure is carried, not lost.
//                   W9-D proves the computed EFFECT rather than the identifier:
//                   its tests read the rendered `href` off the anchor, decode it
//                   with the platform URL parser, and assert the visitor's
//                   literal characters — Hebrew and newlines included — come
//                   back out. Breaking the prefill turns seven of them red (see
//                   the second RED proof in the test header).
//
// W9-F HONEYPOT — THE ONE DELIBERATE CHANGE TO THE SERVED PAGE, stated plainly
//               because the night-wide gate says the idle render must otherwise
//               be byte-identical to today with every human-blocked value unset.
//               It still is. What is NEW is exactly this, and only this, as the
//               first child of the <form>:
//
//                 <div style="display:none">
//                   <input name="hp_ref" type="text" autocomplete="off"
//                          tabindex="-1" aria-hidden="true" />
//                 </div>
//
//               ...plus ONE key on the wire: the POST body gains `hp_ref`,
//               carrying whatever that input holds, which is `''` for every
//               human. Nothing else moved — no copy, no catalogue key, no link,
//               no class, no id, no `data-testid`, no ordering of the five real
//               controls, and no change to any status the visitor can reach.
//
//               WHY THE FIELD EXISTS. `app/api/lead` already carries a proven
//               guard: a `hp_ref` that trims to a non-blank string is answered
//               with a success-SHAPED, id-less 201 and nothing is stored. Until
//               now the form did not render the field, so the guard caught
//               nothing. Absent and empty are both untrapped, which is why the
//               route could land first and why this addition cannot break a
//               visitor who was previously fine.
//
// CLASS         Closed by DERIVATION for this component's outcome reporting: the
//               status union is the complete set of states, the success panel has
//               one render site, and the union is exhaustive, so a new outcome
//               cannot be added without naming it in the union and deciding what
//               the user is told. It is only an INSTANCE for the repo-wide class
//               "no component claims a delivery it did not observe" — twelve
//               sibling sections were written concurrently and nothing here
//               constrains them, and no lint rule bans a bare `await fetch`. That
//               derivation would be an ESLint rule over `components/`, which is
//               outside this delegate's write-set. Owed to the seat.
//
// HONEST LIMIT  Ten, stated plainly.
//   1. THE ENDPOINT DOES NOT EXIST YET. `/api/lead` is W5's file and was not
//      present when this was written. This component proves it CALLS that path
//      with that body and reads the response correctly; it proves nothing about
//      delivery. A green suite here is fully compatible with W5 never shipping —
//      in which case every real submit lands on `'failed'` and every user is
//      correctly offered WhatsApp instead of being lied to. That is the point.
//   2. THERE IS NO ERROR COPY AND NO PENDING COPY IN THE CATALOGUE. The 69 keys
//      contain `formSuccess`/`formSuccessDesc` but no `formError` and no
//      `formSending`. Inventing either would be inventing customer copy (and
//      Hebrew, which this file may not contain), so: a FAILURE is announced by
//      rendering the direct-contact fallback — `formDirect` plus a prefilled
//      WhatsApp link — into the live region, which is true and useful but does
//      not say "sending failed" in words; an INVALID submit is announced by
//      naming the offending field LABELS in the live region, marking them
//      `aria-invalid` and moving focus to the first one; and the PENDING state is
//      carried by `aria-busy` plus a disabled control, not by text. Adding
//      `formSending` and `formError` to both catalogues is the single highest-
//      value follow-up and is the first action owed to the seat. RE-MEASURED by
//      W9-D, not assumed: a repo-wide grep for `formSending`/`formError` returns
//      only the three lines of this comment block — the keys are ABSENT from
//      `i18n/messages.ts`, `messages/he.json` and `messages/en.json` alike. The
//      one-edit sites are the `formSuccess`/`formSuccessDesc`/`formDirect` group
//      in the messages schema in `i18n/messages.ts` plus the matching key
//      in both catalogues. Until then the failure UX renders `formDirect` and
//      nothing else in words, which is true but does not say "sending failed".
//   3. `noValidate` IS DELIBERATE, and it is a trade. The browser's own
//      constraint bubbles are unstyled, unlocalised by our catalogue, and cannot
//      be routed into our live region; suppressing them guarantees that every
//      submit attempt reaches this handler and is announced in the user's
//      language. The `required` and `aria-required` attributes remain on both
//      required inputs, so assistive technology still announces them as required
//      — what is given up is the native bubble, not the semantics.
//   4. THE TIMEOUT IS FEATURE-DETECTED AND UNTESTED. `AbortSignal.timeout` is
//      absent in some jsdom builds, so it is used only when present. Its abort
//      lands in the same `catch` as a network rejection, and THAT path is tested;
//      the timer itself is not exercised by any test in this repo.
//   5. NO PIXEL OR LAYOUT CLAIM. jsdom computes no layout and loads no image, so
//      the background asset, the scrim, focus rings and contrast are unverified
//      here. `/images/form-bg-tank.webp` is the W6 contract and did not exist on
//      disk when this was written; if it is missing at runtime the section still
//      renders and the form still works.
//   6. NO VALIDATION OF CONTENT, ONLY OF PRESENCE. A phone field containing a
//      single space fails the check (values are trimmed); one containing `abc`
//      passes. Deciding what a valid Israeli phone number looks like is a
//      product question nobody has answered, and guessing it would reject real
//      leads. The server is the right place for that judgement.
//   7. FAILURES ARE ANNOUNCED POLITELY. One region, one role: `role="status"` /
//      `aria-live="polite"`. An assertive region for errors would mean two
//      regions or a role that changes under the user, both of which are worse.
//      A polite announcement can be delayed behind other speech.
//   8. THE HONEYPOT CAN, IN PRINCIPLE, DISCARD A REAL ENQUIRY — AND UNTIL
//      W14-FIX1 IT COULD ALSO TELL THAT VISITOR IT WAS SENT. IT CAN NO LONGER.
//      This is the cost of the trap and it is the worst failure this file can
//      have, so it is stated first among its own details rather than buried.
//      `/api/lead` reads `hp_ref` and, if it trims to anything at all, answers a
//      success-shaped 201 having STORED NOTHING — and deliberately WITHOUT an
//      `id`, because a fabricated id in a 2xx would be evidence of a storage
//      that did not happen (W9-C). THE CLIENT NOW HONOURS THAT: an ok response
//      reaches 'sent' only when its body carries a readable, non-blank `id`, so
//      a trapped enquiry lands on 'failed' like any other failure — the visitor
//      keeps everything they typed, in the form and in the prefilled WhatsApp
//      link, and is never told a lead exists that does not. A trapped real
//      visitor loses a round trip; they do not lose the enquiry, and they are
//      not lied to. What else is done about it, still, because not being lied to
//      is worse than not being trapped:
//        · the field is `display:none` through an INLINE style, and browser
//          autofill in Chrome, Safari and Firefox skips controls it computes as
//          not displayed. This is the single largest reduction in the risk, and
//          it is why the hiding is NOT a utility class — see HONEYPOT_STYLE;
//        · `autoComplete="off"` asks the browser not to fill it, and the name
//          `hp_ref` matches no autofill heuristic (those key on `email`, `tel`,
//          `name`, `organization`, `address` — `hp_ref` looks like nothing);
//        · `tabIndex={-1}` keeps it out of the keyboard order, so a visitor
//          tabbing through the form cannot land in it and type;
//        · it is UNCONTROLLED and read off the DOM only at submit time, so no
//          line in this component is able to write a value into it.
//      RESIDUAL, AND NOT MEASURED ANYWHERE IN THIS REPO: a password manager, a
//      form-filling extension or an assistive tool that ignores both
//      `display:none` and `autocomplete="off"` would still trip it, and no test
//      here can observe a real browser extension. What that now costs the
//      visitor is a needless failure message and a second route to the same
//      brother, NOT a lost lead presented as a sent one. The route logs every
//      trapped submission to stderr, so an operator can at least SEE the fault
//      instead of it being silent. That is mitigation, not proof, and the
//      residual risk is accepted deliberately rather than claimed away.
//   9. THE ID IS CHECKED FOR PRESENCE, NEVER FOR SHAPE — a deliberate refusal.
//      `storedLeadId` accepts any string with one non-blank character and
//      rejects everything else (absent, `''`, `'   '`, a number, `null`, a body
//      that is not a JSON object, a body that does not parse). It does NOT
//      require a 26-character Crockford ULID, and it does NOT import
//      `parseLeadId`/`LEAD_ID_LENGTH` from `@/lib/leads/types`. Two reasons,
//      both about not making this file wrong later:
//        · `parseLeadId` returns a BRANDED `LeadId`, whose entire meaning (see
//          that file's INVARIANT) is "this identifies a record in our store".
//          Minting that brand on the client out of an untrusted network body
//          would launder a string a stranger controls into the one type the repo
//          uses to mean the opposite. The brand's value is repo-wide; spending
//          it here to save a regex would be the expensive trade;
//        · the id's ALPHABET is a storage implementation detail this component
//          has no stake in — it never parses, sorts, displays or re-sends the
//          id. If the route ever moved from ULID to uuid, a shape check here
//          would turn every honest success into a failure, and NO test in this
//          repo would see it: the client suite mocks the boundary and the route
//          suite never renders this component. The published contract is
//          "a 2xx carrying an id is a stored record, the id-less 2xx is the
//          decoy", and presence is exactly what this file checks.
//      THE COST, STATED: a 2xx carrying a well-formed LIE — `{"ok":true,
//      "id":"x"}` from a proxy or a future bug — still renders success. This
//      component can tell EVIDENCE from NO EVIDENCE; it cannot tell true
//      evidence from forged evidence, and nothing on a client ever can.
//  10. ⚠️ CLOSED — kept as history because it is quoted in the W14-FIX1 report.
//      It said the failure reason for an id-less 2xx was `http_other`, which
//      lost the one distinction an operator most needs, because
//      `FORM_FAIL_REASONS` was a closed union of eight with no member for "our
//      own route answered ok and stored nothing", and `@/lib/analytics/events`
//      was outside W14-FIX1's write-set so no member was invented. That was
//      TRUE when written and is FALSE NOW: W14-FIX5 added `ok_without_id` to
//      `FORM_FAIL_REASONS` and pointed `OK_WITHOUT_ID_REASON` below at it, so a
//      honeypot that has begun eating real enquiries no longer reaches GA4 under
//      the same name as a 502 at a proxy. What REMAINS true is limit 9's cost: a
//      2xx carrying a forged id still renders success, and no client can tell
//      true evidence from forged evidence.
//
// CONTRACTS HONOURED: props-driven (no getMessages call here — this is a client
// component and the catalogue load stays on the server); zero hardcoded copy and
// zero Hebrew codepoints, comments included; logical CSS only (no ml/mr/pl/pr/
// left/right/text-left/text-right); next/image only, never a CSS background; one
// named export, no default; no `any`, no non-null assertion, no `as` cast.
//
// W10-B ANALYTICS · Five `emit()` calls sit in `handleSubmit` and three on the
// contact anchors. NONE of them changes when or whether a fetch happens, a
// status is set or a field is cleared: every one is placed AFTER the state
// change it reports. `emit()` swallows, so a throwing tracker cannot reach the
// submit path - asserted, not assumed, in `__tests__/analytics-wiring.test.tsx`.
// The funnel is closed: one attempt (after the double-submit guard, before
// validation) always closes as exactly one `form_success` or one `form_fail`.
// HONEST LIMIT (analytics) The reason for a network failure is ONE name for
// four causes - offline, DNS, CORS and the `AbortSignal.timeout` abort all land
// in the same `catch` with nothing this component inspects to separate them.
// No lead field reaches any event: `failReason` is handed a number.
//
// W13-A/W16-A PRIVACY NOTICE · THE PATH WAS BUILT EMPTY AND IS NOW ANSWERED.
// `<PrivacyNotice m={m} />` sits after the fields and the form's
// `aria-describedby` names it — but only when the catalogue answers EVERY key in
// `PRIVACY_KEYS`, which both catalogues now do (W16-A). So the notice renders and
// `formDescribedBy` is `${STATUS_ID} ${PRIVACY_NOTICE_ID}`. THIS FILE WAS NOT
// EDITED TO MAKE THAT HAPPEN — not one line of code: the mount, the presence
// rule and the `Partial<PrivacyNoticeText>` props type were already here, so the
// change was three edits in three OTHER files (schema + two catalogues). That was
// the whole point of shipping the path before the text.
// HONEST LIMIT (privacy) The notice states what THIS CODE does with an enquiry.
// It is not a legal privacy policy, it names no retention period because nothing
// here enforces one, and it stops at the edge of the code: what a mail provider
// or a configured webhook keeps is not observable from this repository. The full
// argument, and what W13-A refused and why, is in PrivacyNotice.tsx.
//
// W14-FIX1 · AN OK STATUS IS NOT A STORED LEAD. THE ONE BEHAVIOUR CHANGE, stated
// plainly. Before: success was decided on `response.ok === true` alone, so the
// route's id-less honeypot 201 — which stores nothing, and which any autofill,
// password manager, translation tool or accessibility extension that writes into
// `hp_ref` can trigger for a REAL visitor — rendered the success panel and
// cleared what they had typed. The enquiry was gone and they were told the
// opposite: Defect 2 wearing a 2xx. After: `storedLeadId(response)` must return
// a non-blank string id or the submit takes the EXISTING failure path, which
// clears nothing. The route is unchanged and was already right; this is the
// client finally consuming the invariant W9-C paid for. The idle render, the
// posted body, the five controls, the hidden `hp_ref` and every failure UX are
// untouched — the only response that behaves differently is a 2xx without an id,
// which nothing in the repo produces except the trap.
// KNOWN RED, OUTSIDE THIS FIX'S WRITE-SET AND NOT REPAIRED HERE: three tests in
// `components/sections/__tests__/analytics-wiring.test.tsx` and
// `components/sections/__tests__/analytics-unset.test.tsx` mock a 200 whose body
// is `'{}'` and assert the success panel. They encode the defect above, and each
// needs its mocked body changed to the route's real one — `{"ok":true,"id":
// "<26 chars>"}`. Measured green before this change and red after; see the
// W14-FIX1 report for the three line numbers and the exact replacement.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import Image from 'next/image';
import { useRef, useState, type CSSProperties, type FormEvent } from 'react';

import {
  PrivacyNotice,
  PRIVACY_NOTICE_ID,
  resolvePrivacyNotice,
  type PrivacyNoticeText,
} from '@/components/sections/PrivacyNotice';
import { emit } from '@/components/sections/TrackedLink';
import {
  formFail,
  formSubmitAttempt,
  formSuccess,
  instagramClick,
  whatsappClick,
  type FormFailReason,
} from '@/lib/analytics/events';
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  SECTION_IDS,
  whatsappLink,
  type Locale,
} from '@/config/site';
import type { Messages } from '@/i18n/messages';

/* ── Props ────────────────────────────────────────────────────────────────── */

type LeadFormMessages = Pick<
  Messages,
  | 'formTitle'
  | 'formSubtitle'
  | 'formName'
  | 'formPhone'
  | 'formEmail'
  | 'formOrg'
  | 'formMessage'
  | 'formNamePh'
  | 'formPhonePh'
  | 'formEmailPh'
  | 'formOrgPh'
  | 'formMsgPh'
  | 'formSubmit'
  | 'formSuccess'
  | 'formSuccessDesc'
  | 'formDirect'
  | 'required'
> &
  /**
   * W13-A. The privacy notice's three keys, OPTIONAL because they do not exist
   * in `Messages` yet — see components/sections/PrivacyNotice.tsx. `Partial`, not
   * `Pick`, is the whole trick: `app/[locale]/page.tsx` already hands this
   * component the entire `getMessages(locale)` object, so the day the catalogue
   * and its schema gain these keys they arrive here with NO edit to this file
   * and NO edit to the page. W16-A: the keys landed, and this file did not move —
   * `Partial` still admits the unanswered state on purpose, because a form that
   * cannot represent it cannot be proved to stay silent in it.
   */
  Partial<PrivacyNoticeText>;

type LeadFormProps = {
  m: LeadFormMessages;
  locale: Locale;
};

/* ── The state machine ────────────────────────────────────────────────────── */

/**
 * The COMPLETE set of states this form can be in. What the user is told in each:
 *
 *   idle        nothing announced; form editable; submit enabled.
 *   submitting  no words (no catalogue key exists — HONEST LIMIT 2); the form is
 *               `aria-busy` and the submit control is disabled.
 *   invalid     the labels of the empty required fields are announced; those
 *               inputs are `aria-invalid`; focus moves to the first. NO request
 *               was made and none is claimed.
 *   failed      the direct-contact fallback is announced, with a WhatsApp deep
 *               link prefilled from what the user typed. Reached from a resolved
 *               response with `ok === false`, from an OK RESPONSE THAT CARRIED
 *               NO STORED-LEAD ID (the honeypot decoy, and any 2xx whose body
 *               cannot be read), AND from a thrown/aborted fetch — one state, so
 *               no failure mode can miss the fallback, and none of them clears
 *               what the visitor typed.
 *   sent        and ONLY here: `formSuccess` + `formSuccessDesc`. Reachable from
 *               exactly one assignment, on the `storedId !== null` arm.
 */
type Status = 'idle' | 'submitting' | 'invalid' | 'failed' | 'sent';

type Values = {
  name: string;
  phone: string;
  email: string;
  organization: string;
  message: string;
};

const EMPTY: Values = {
  name: '',
  phone: '',
  email: '',
  organization: '',
  message: '',
};

/** The two fields a lead is useless without. */
type RequiredField = 'name' | 'phone';

/* ── Local constants ──────────────────────────────────────────────────────── */

/**
 * Our own endpoint (W5). Not a `@/config/site` fact: it is this component's
 * contract with our own route handler, not a customer answer awaiting an edit.
 */
const LEAD_ENDPOINT = '/api/lead';

/** A hung request must not strand the user in `submitting`. See HONEST LIMIT 4. */
const REQUEST_TIMEOUT_MS = 15000;

/** The W6 asset contract. Decorative: `fill` + empty alt + aria-hidden wrapper. */
const BACKGROUND_SRC = '/images/form-bg-tank.webp';

/**
 * THE HONEYPOT FIELD NAME — this component's half of the cross-delegate contract
 * published by `app/api/lead/route.ts`, whose guard reads this exact key off the
 * raw body BEFORE validation and discards any submission whose value trims to
 * something. Stated ONCE here and referenced twice below — the input's `name` and
 * the key on the wire — so the two can never drift into a trap that catches
 * nothing. The route restates the literal independently, as does the suite; three
 * independent spellings that must agree is the point, and a rename here turns the
 * form's Law-8 test red rather than quietly disarming the guard.
 */
const HONEYPOT_NAME = 'hp_ref';

/**
 * AN INLINE STYLE, NOT A UTILITY CLASS, AND THE CHOICE IS LOAD-BEARING.
 *
 * A Tailwind class that resolves to nothing EMITS nothing — the `bg-gold` shape,
 * where every gate stayed green while the button was invisible. Here that failure
 * runs the other way and is worse: an `sr-only` that ever stopped resolving would
 * put a bare, unlabelled text box named `hp_ref` at the top of a bereaved
 * family's booking form, and no test in this repo would see it, because jsdom
 * loads no stylesheet. An inline style has no stylesheet to fail to load, and
 * jsdom resolves it — so `display: none` here is a MEASURED fact in the suite
 * (`toBeVisible()` is false, `getComputedStyle().display` is `'none'`) rather
 * than an unverifiable claim about a class name.
 *
 * `display: none` over the classic off-screen `position:absolute; inset-inline-
 * start:-9999px`: off-screen positioning cannot be verified in jsdom at all (no
 * layout is computed), and — the deciding reason — browser autofill skips a
 * control it computes as not displayed but will happily fill one that is merely
 * parked off-screen. See HONEST LIMIT 8: trapping a real visitor is the expensive
 * failure here, catching one fewer bot is the cheap one, and this is which side
 * of that trade the file takes. The cost, stated: a bot sophisticated enough to
 * read computed styles skips this field. Most are not.
 */
const HONEYPOT_STYLE: CSSProperties = { display: 'none' };

/* ── W16-C · THE NO-JS SUBMIT, REMOVED ────────────────────────────────────── */

/**
 * MEASURED DEFECT, on the built server, Playwright with `javaScriptEnabled:
 * false`, before this constant existed. The form carried `onSubmit` and NOTHING
 * ELSE — no `action`, no `method` — so a browser with scripting off did the only
 * thing HTML says to do: a GET to the page's own URL with every named control in
 * the query string. The resulting URL was, verbatim:
 *
 *   /he?hp_ref=&name=No+Js+Visitor&phone=0507654321
 *      &email=nojs%40example.com&organization=&message=secret+message+text
 *
 * A name, a phone number, an email address and a private message, written into a
 * URL — which is the one place personal data must never go: it lands in the
 * browser's history and autocomplete, in the server's access log, in any proxy's
 * log, and in the `Referer` header of every subsequent request from that page.
 * Nothing is submitted and nobody is contacted, so the visitor pays that price
 * for an enquiry that was never sent.
 *
 * TWO INDEPENDENT MECHANISMS CLOSE IT, and neither is copy:
 *
 * 1. `method="post"` on the <form>. With no `action`, a native submit becomes a
 *    POST to the page's own URL, and `middleware.ts` allowlists {GET, HEAD,
 *    OPTIONS} on every localisable path, so it is refused with 405. A GET-shaped
 *    submit is no longer EXPRESSIBLE by this element, whatever happens to (2) or
 *    to the CSS build — a form's fields cannot enter a URL when the form's method
 *    is not one that puts them there. This costs the scripted path exactly
 *    nothing: `handleSubmit` calls `preventDefault()` on its first line, so the
 *    method is never consulted when scripting is on.
 *
 * 2. The stylesheet below, delivered inside <noscript> — the one element whose
 *    content a browser applies WHEN AND ONLY WHEN scripting is off. It hides the
 *    controls that cannot work without scripting. What a no-JS visitor is left
 *    with is NOT a dead end and is NOT new text: `data-testid="form-direct"`,
 *    thirty lines below the </form>, is a plain <a href> to WhatsApp and the
 *    phone number, already rendered on every load, already headed by
 *    `m.formDirect`. It needs no script, it was already reachable, and hiding the
 *    form simply moves it to the top of what remains. NOT ONE WORD IS AUTHORED
 *    HERE: this file adds a CSS rule, and the replacement route was already in
 *    the catalogue and already on the page.
 *
 * The subtitle is hidden with the form because it says to fill in details; left
 * standing over a hidden form it would be the only dishonest sentence on the
 * page. Hiding is all that happens to it — its words are untouched.
 *
 * WHY `dangerouslySetInnerHTML` AND NOT JSX CHILDREN: a browser with scripting
 * ENABLED parses <noscript> content as raw text, while React's server renderer
 * emits it as markup — the two disagree, and hydrating JSX children of a
 * <noscript> is the mismatch that follows. Handing React an opaque string keeps
 * both sides identical. The string is a module constant with no interpolation of
 * anything a visitor typed; there is no value here for anyone to inject into.
 */
const NOJS_HIDDEN_CLASS = 'lead-form-needs-js';

const NOJS_STYLESHEET = `<style>.${NOJS_HIDDEN_CLASS}{display:none!important}</style>`;

const TITLE_ID = 'lead-form-title';
const STATUS_ID = 'lead-form-status';

const FIELD_IDS = {
  name: 'lead-name',
  phone: 'lead-phone',
  email: 'lead-email',
  organization: 'lead-organization',
  message: 'lead-message',
} as const;

/** One definition of the control skin, so five inputs cannot drift apart. */
const CONTROL_CLASS =
  'w-full rounded-lg border border-white/20 bg-black/40 px-3.5 py-3 text-[0.95rem] text-white outline-none transition-colors duration-200 placeholder:text-gray-400 focus:border-gold';

/* ── Pure helpers ─────────────────────────────────────────────────────────── */

/**
 * The empty required fields, in render order. An empty array means the submit
 * may proceed. Trimmed: a field holding only spaces is not a phone number.
 */
function missingRequired(values: Values): readonly RequiredField[] {
  const missing: RequiredField[] = [];
  if (values.name.trim().length === 0) missing.push('name');
  if (values.phone.trim().length === 0) missing.push('phone');
  return missing;
}

/**
 * The WhatsApp prefill, composed ENTIRELY of catalogue labels and what the user
 * typed. No sentence is invented here — that would be inventing customer copy in
 * a language this file may not contain — so the message reads as a labelled
 * summary of the form in whichever locale the visitor is using. Empty optional
 * fields are omitted rather than sent as blank labels.
 */
function buildPrefill(m: LeadFormMessages, values: Values): string {
  const lines: string[] = [m.formTitle];
  const fields: ReadonlyArray<readonly [string, string]> = [
    [m.formName, values.name],
    [m.formPhone, values.phone],
    [m.formEmail, values.email],
    [m.formOrg, values.organization],
    [m.formMessage, values.message],
  ];
  for (const [label, value] of fields) {
    const trimmed = value.trim();
    if (trimmed.length > 0) lines.push(`${label}: ${trimmed}`);
  }
  return lines.join('\n');
}

/**
 * THE KEY THE ROUTE PUTS ITS EVIDENCE IN. Restated here rather than imported,
 * for the same reason `HONEYPOT_NAME` is: it is one half of a cross-process
 * contract carried on the wire (`Response.json({ ok: true, id }, 201)` in
 * `app/api/lead/route.ts`), and a client that read the server's own constant
 * would agree with it no matter what it said. The suite spells it a third time.
 */
const LEAD_ID_KEY = 'id';

/**
 * The stored-lead id this response carries, or `null` when it carries none.
 *
 * `null` IS THE WHOLE POINT. `app/api/lead` answers a trapped submission with a
 * success-shaped, success-STATUSED 201 that deliberately omits `id`, having
 * stored nothing — it refuses to mint a decoy precisely so that an id in a 2xx
 * means a record exists. This function is the client half of that invariant: it
 * returns a string only when the body is a JSON object carrying `id` as a string
 * with at least one non-blank character, and `null` for every other shape,
 * including a body that does not parse at all. Nothing below throws: a 2xx with
 * an unreadable body is a failure, not an exception, so it lands on the failure
 * STATUS rather than in the `catch` that reports `network`.
 *
 * PRESENCE, NOT SHAPE, AND NOT `parseLeadId` — see HONEST LIMIT 9 for the two
 * reasons and for what that costs.
 */
async function storedLeadId(response: { json: () => Promise<unknown> }): Promise<string | null> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return null;
  }
  if (typeof body !== 'object' || body === null || !(LEAD_ID_KEY in body)) return null;
  const id: unknown = body[LEAD_ID_KEY];
  if (typeof id !== 'string' || id.trim().length === 0) return null;
  return id;
}

/**
 * THE REASON REPORTED WHEN A 2xx CARRIED NO ID — no longer a stand-in.
 *
 * `FORM_FAIL_REASONS` now carries `ok_without_id`, a member that says exactly
 * what this branch observed: our own route answered ok and stored nothing. It
 * was `http_other` — the catalogue's totality member for a status it does not
 * name — for as long as `@/lib/analytics/events` sat outside the fixing
 * delegate's write-set; W14-FIX5 added the member and pointed this constant at
 * it, and the distinction now survives to the boundary. See HONEST LIMIT 10.
 */
const OK_WITHOUT_ID_REASON: FormFailReason = 'ok_without_id';

/**
 * WHY A NON-OK RESPONSE FAILED, named from the ONE thing the component actually
 * has: `response.status`.
 *
 * Total over `number` by construction — the `default` is not laziness, it is the
 * only honest answer for a status this site does not produce (a 502 from a proxy
 * in front of the route). Every member it can return is in `FORM_FAIL_REASONS`,
 * so this function cannot name a reason the catalogue has not sanctioned, and it
 * cannot read a lead field: it is handed a number and nothing else.
 */
function failReason(status: number): FormFailReason {
  switch (status) {
    case 413:
      return 'http_413';
    case 422:
      return 'http_422';
    case 429:
      return 'http_429';
    case 500:
      return 'http_500';
    case 503:
      return 'http_503';
    default:
      return 'http_other';
  }
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function LeadForm({ m, locale }: LeadFormProps) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [missing, setMissing] = useState<readonly RequiredField[]>([]);

  /**
   * The double-submit guard. A ref, not state, on purpose: it is read and
   * written synchronously inside the handler, so it closes the window between a
   * second click and React flushing `'submitting'` to the disabled attribute.
   */
  const inFlight = useRef(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  /**
   * The honeypot, read off the DOM rather than held in state — UNCONTROLLED on
   * purpose, and this is not a shortcut.
   *
   * A controlled input only learns of a write that React saw as an event, and it
   * REVERTS anything else on the next render. A crude bot that assigns
   * `input.value = 'x'` without dispatching an `input` event would therefore have
   * its own fill erased by the very re-render that follows, and the trap would
   * catch nothing. Reading `.value` at submit time catches both that bot and the
   * one that types properly. It also means this component holds no state it could
   * accidentally write into the field — see HONEST LIMIT 8.
   */
  const honeypotRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (inFlight.current === true) return;

    // THE FUNNEL OPENS HERE, and here is deliberate. After the double-submit
    // guard, so a second click on an in-flight form reports NOTHING and the
    // "exactly one fetch" invariant has an exactly-one-attempt twin; BEFORE
    // validation, because a visitor who pressed submit with an empty phone has
    // submitted the form. Every attempt therefore closes as exactly one
    // `form_success` or one `form_fail` — including the client-side one below.
    emit(formSubmitAttempt());

    const missingNow = missingRequired(values);
    if (missingNow.length > 0) {
      // No request is made, and none is claimed.
      setMissing(missingNow);
      setStatus('invalid');
      emit(formFail('client_invalid'));
      if (missingNow.includes('name')) nameRef.current?.focus();
      else phoneRef.current?.focus();
      return;
    }

    inFlight.current = true;
    setMissing([]);
    setStatus('submitting');

    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          organization: values.organization.trim(),
          message: values.message.trim(),
          locale,
          // The honeypot, exactly as the DOM holds it. NOT trimmed and NOT
          // defaulted to a literal: the route decides what counts as trapped,
          // and trimming here would hand it a blank for a field a bot had
          // filled with spaces. `?? ''` covers only the unreachable case of the
          // ref never attaching, and it fails OPEN — an unfilled honeypot lets
          // a real enquiry through, which is the safe direction for this site.
          [HONEYPOT_NAME]: honeypotRef.current?.value ?? '',
        }),
        signal: timeoutSignal(),
      });

      // ── THE TWO CHECKS THAT SEPARATE THIS FILE FROM DEFECT 2 ──────────────
      // 1. A RESOLVED FETCH IS NOT A DELIVERED LEAD. `fetch` settles happily on
      //    404, 422 and 500, which is the shape the customer's site got wrong.
      // 2. AN OK STATUS IS NOT ONE EITHER. `app/api/lead`'s honeypot guard
      //    answers a success-shaped, id-less 201 and stores NOTHING; it refuses
      //    to mint a decoy id so that an id in a 2xx MEANS a stored record. The
      //    evidence is therefore in the BODY, not on the status line, and the
      //    body is what may reach 'sent'. Anything a browser extension, password
      //    manager or translation tool writes into `hp_ref` arrives here as an
      //    id-less 201 and is treated as the failure it is.
      const ok = response.ok === true;
      const storedId = ok ? await storedLeadId(response) : null;

      if (storedId === null) {
        // ONE failure site for both halves. `setValues(EMPTY)` is NOT here and
        // is nowhere on this arm: the visitor keeps every character they typed,
        // in the form and in the prefilled WhatsApp link the failure renders.
        setStatus('failed');
        emit(formFail(ok ? OK_WITHOUT_ID_REASON : failReason(response.status)));
      } else {
        setValues(EMPTY);
        setStatus('sent');
        emit(formSuccess());
      }
    } catch {
      // Network down, DNS failure, CORS, abort, timeout. Same destination as an
      // HTTP error: the fallback is reachable from every failure, not just this
      // branch. That is exactly the shape the customer's site got wrong.
      setStatus('failed');
      // ONE reason for ONE branch. Offline, DNS, CORS and the abort from
      // `AbortSignal.timeout` all arrive here with nothing this component
      // inspects to tell them apart, so the catalogue does not pretend to.
      emit(formFail('network'));
    } finally {
      inFlight.current = false;
    }
  }

  const busy = status === 'submitting';

  /**
   * W13-A. THE FORM'S DESCRIPTION, DERIVED — never two strings kept in step.
   *
   * The live region has always described this form. When (and only when) the
   * catalogue answers all three privacy keys, the notice's id joins it, so a
   * screen-reader user hears what is collected and how long it is kept on entering
   * the form. The presence test is `resolvePrivacyNotice` — the SAME call the
   * notice itself makes — so the id named here and the element on the page cannot
   * disagree. With the keys unset this is `STATUS_ID` and nothing else, which is
   * exactly the attribute the page served before this line existed.
   */
  const formDescribedBy =
    resolvePrivacyNotice(m) === null ? STATUS_ID : `${STATUS_ID} ${PRIVACY_NOTICE_ID}`;

  return (
    <section
      id={SECTION_IDS.form}
      aria-labelledby={TITLE_ID}
      className="relative overflow-hidden px-6 py-[70px]"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <Image src={BACKGROUND_SRC} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-[700px]">
        <h2 id={TITLE_ID} className="mb-2 text-center text-2xl font-black text-white md:text-3xl">
          {m.formTitle}
        </h2>

        {/*
          THE ONE LIVE REGION. Always mounted — a region inserted at the moment it
          gains content is frequently not announced — and its content is derived
          from `status`, so no outcome can be shown without being announced.
        */}
        <div
          id={STATUS_ID}
          data-testid="form-status"
          role="status"
          aria-live="polite"
          aria-busy={busy}
        >
          {status === 'sent' ? (
            <div data-testid="form-success" className="py-12 text-center">
              <h3 className="mb-2 text-xl font-bold text-white">{m.formSuccess}</h3>
              <p className="text-gray-300">{m.formSuccessDesc}</p>
            </div>
          ) : null}

          {status === 'invalid' ? (
            <ul data-testid="form-invalid" className="mb-4 mt-2 text-center text-sm text-gold">
              {missing.map((field) => (
                <li key={field}>
                  {field === 'name' ? m.formName : m.formPhone} {m.required}
                </li>
              ))}
            </ul>
          ) : null}

          {status === 'failed' ? (
            <div data-testid="form-fallback" className="mb-5 mt-3 text-center">
              <p className="mb-3 text-sm text-gray-300">{m.formDirect}</p>
              <a
                data-testid="form-fallback-whatsapp"
                href={whatsappLink(buildPrefill(m, values))}
                onClick={() => {
                  emit(whatsappClick());
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gold bg-black/40 px-4 py-2.5 text-sm font-semibold text-gold transition-colors duration-200 hover:bg-black/60"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
          ) : null}
        </div>

        {status === 'sent' ? null : (
          <>
            {/*
              W16-C. The one element on this page whose content a browser applies
              only when scripting is OFF. See NOJS_STYLESHEET: it hides the
              controls that cannot work without a script, leaving the standing
              WhatsApp-and-phone block below as what a no-JS visitor sees. No
              copy is added here — this element contains a CSS rule and nothing
              else.
            */}
            <noscript dangerouslySetInnerHTML={{ __html: NOJS_STYLESHEET }} />

            <p className={`mb-7 text-center text-gray-300 ${NOJS_HIDDEN_CLASS}`}>
              {m.formSubtitle}
            </p>

            {/*
              A real form: native submit and Enter-key submit run this handler.
              `method="post"` is W16-C and is load-bearing even though scripting
              never reads it: with no `action`, it makes a scriptless submit a
              POST to this page — which `middleware.ts` refuses with 405 — rather
              than the GET that wrote name, phone, email and message into the URL.
              See NOJS_STYLESHEET for the measured URL and for the second, visible
              half of that fix.
            */}
            <form
              method="post"
              onSubmit={handleSubmit}
              noValidate
              aria-busy={busy}
              aria-describedby={formDescribedBy}
              className={`space-y-4 ${NOJS_HIDDEN_CLASS}`}
            >
              {/*
                THE HONEYPOT. Not a field, not for the visitor, and deliberately
                without a label or any user-facing text: `app/api/lead` discards
                any submission that arrives with `hp_ref` non-blank. Invisible to
                eyes (inline `display:none` — see HONEYPOT_STYLE), absent from
                the accessibility tree (`display:none` already removes it;
                `aria-hidden` states the intent and satisfies the published
                contract), and out of the keyboard order (`tabIndex={-1}`, which
                is also what keeps `aria-hidden` legal here — an aria-hidden
                subtree may contain no focusable node). It renders first so a bot
                that fills fields in document order meets it first.
              */}
              <div style={HONEYPOT_STYLE}>
                <input
                  ref={honeypotRef}
                  name={HONEYPOT_NAME}
                  type="text"
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>

              <div>
                <label
                  htmlFor={FIELD_IDS.name}
                  className="mb-1.5 block text-sm font-semibold text-white"
                >
                  {m.formName}{' '}
                  {/* Visual marker only: `required`/`aria-required` carry the
                      semantics, so the accessible name stays the plain label. */}
                  <span aria-hidden="true" className="text-gold">
                    {m.required}
                  </span>
                </label>
                <input
                  id={FIELD_IDS.name}
                  ref={nameRef}
                  name="name"
                  type="text"
                  required
                  aria-required="true"
                  aria-invalid={missing.includes('name')}
                  placeholder={m.formNamePh}
                  value={values.name}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className={CONTROL_CLASS}
                />
              </div>

              <div>
                <label
                  htmlFor={FIELD_IDS.phone}
                  className="mb-1.5 block text-sm font-semibold text-white"
                >
                  {m.formPhone}{' '}
                  <span aria-hidden="true" className="text-gold">
                    {m.required}
                  </span>
                </label>
                <input
                  id={FIELD_IDS.phone}
                  ref={phoneRef}
                  name="phone"
                  type="tel"
                  required
                  aria-required="true"
                  aria-invalid={missing.includes('phone')}
                  placeholder={m.formPhonePh}
                  value={values.phone}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className={CONTROL_CLASS}
                />
              </div>

              <div>
                <label
                  htmlFor={FIELD_IDS.email}
                  className="mb-1.5 block text-sm font-semibold text-white"
                >
                  {m.formEmail}
                </label>
                <input
                  id={FIELD_IDS.email}
                  name="email"
                  type="email"
                  placeholder={m.formEmailPh}
                  value={values.email}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className={CONTROL_CLASS}
                />
              </div>

              <div>
                <label
                  htmlFor={FIELD_IDS.organization}
                  className="mb-1.5 block text-sm font-semibold text-white"
                >
                  {m.formOrg}
                </label>
                <input
                  id={FIELD_IDS.organization}
                  name="organization"
                  type="text"
                  placeholder={m.formOrgPh}
                  value={values.organization}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, organization: event.target.value }))
                  }
                  className={CONTROL_CLASS}
                />
              </div>

              <div>
                <label
                  htmlFor={FIELD_IDS.message}
                  className="mb-1.5 block text-sm font-semibold text-white"
                >
                  {m.formMessage}
                </label>
                <textarea
                  id={FIELD_IDS.message}
                  name="message"
                  placeholder={m.formMsgPh}
                  value={values.message}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, message: event.target.value }))
                  }
                  className={`${CONTROL_CLASS} h-28 resize-y`}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                aria-disabled={busy}
                className="mt-1 w-full rounded-lg bg-gold py-4 text-base font-bold text-black transition-colors duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {m.formSubmit}
              </button>
            </form>

            {/*
              W13-A THE PRIVACY NOTICE. Rendered unconditionally and DELIBERATELY:
              the component itself decides, from the catalogue, whether there is
              anything to say, so this call site carries no second copy of that
              rule. W16-A answered every key, so this now renders the notice; with
              any one key blank it renders NOTHING — not an empty box, not a
              heading, not one byte. It sits after the
              fields and before the direct-contact block because that is where a
              visitor is when they have typed their details and have not yet
              submitted them, and it is announced from the form's
              `aria-describedby` rather than relying on reading order.
            */}
            <PrivacyNotice m={m} />

            {/*
              The standing direct-contact block. Hidden while `failed`, because
              the fallback above says the same thing with the user's own details
              prefilled — one fact, one place, never two WhatsApp links at once.
            */}
            {status === 'failed' ? null : (
              <div data-testid="form-direct" className="mt-7 text-center">
                <p className="mb-3 text-sm text-gray-300">{m.formDirect}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    data-testid="form-direct-whatsapp"
                    href={whatsappLink()}
                    onClick={() => {
                      emit(whatsappClick());
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/40 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:border-white"
                  >
                    {PHONE_DISPLAY}
                  </a>
                  <a
                    data-testid="form-direct-instagram"
                    href={INSTAGRAM_URL}
                    onClick={() => {
                      emit(instagramClick());
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/40 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:border-white"
                  >
                    {INSTAGRAM_HANDLE}
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/**
 * `AbortSignal.timeout` is absent in some jsdom builds, so it is feature-detected
 * rather than assumed. Returning `undefined` means "no timeout" — a strictly
 * weaker guarantee, never a broken render. See HONEST LIMIT 4.
 */
function timeoutSignal(): AbortSignal | undefined {
  if (typeof AbortSignal === 'undefined') return undefined;
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  return undefined;
}
