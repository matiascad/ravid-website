// ─────────────────────────────────────────────────────────────────────────────
// W9-E AUTORESPONSE — lib/leads/autoresponse.ts
//
// The defect (red team, P2 duty of care): someone writes to a bereaved family
// asking them to come and speak, and hears NOTHING back from the machine. The
// browser shows `formSuccess` for as long as the tab stays open and then the
// enquirer has no receipt at all — no record that the form worked, no answer to
// "did it go through?", and no way to reach a human without finding the site
// again. This module renders that receipt, in the ENQUIRER's locale.
//
// WHAT THIS FILE IS NOT ALLOWED TO DO, AND CANNOT
//   Every word it emits is the customer's own, read out of the catalogue. There
//   is no greeting, no sign-off, no subject line, no apology and no promise
//   written here — not one string literal in this file reaches a reader. The
//   only literals below are `'\n'` and `''`. If the catalogue cannot say it,
//   this renderer does not say it; the design answer to "the words don't exist"
//   is `null` — SEND NOTHING — never prose invented by a machine on a memorial
//   site. Both blocks it composes are blocks the PRODUCT ALREADY COMPOSES, in
//   this order, on the page the enquirer just left:
//     `components/sections/LeadForm.tsx:403-404`  formSuccess / formSuccessDesc
//     `components/sections/LeadForm.tsx:577-587`  formDirect  / PHONE_DISPLAY
//   So this is a re-serialisation of an existing screen into text, not a new
//   piece of writing. (See HONEST LIMIT 1 for what that costs.)
//
// INVARIANT     Every character of the returned `subject` and `body` comes from
//               exactly two sanctioned sources and from nowhere else: the
//               message catalogue, read through `getMessages()` from
//               '@/i18n/messages' — the project's ONLY message accessor, zod-
//               validated at the boundary (ledger D-19/D-20) — and the contact
//               facts exported by '@/config/site'. The locale is
//               `record.payload.locale` and there is no other locale in reach:
//               a `LeadRecord` has no second locale field to disagree with it
//               (`lib/leads/types.ts`), so a Hebrew enquirer cannot be answered
//               in English by any argument this function accepts. The function
//               is PURE: it takes a record, returns text or `null`, performs no
//               I/O, opens no socket, sends no mail and touches no clock.
//
// IMPOSSIBLE    (a) A FABRICATED SENTENCE IN A RECEIPT. Not "forbidden by
//                   review" — unrepresentable here: the file contains no
//                   human-readable string literal, so there is no expression in
//                   it that could put an un-authored word into an enquirer's
//                   inbox. The HEBREW half of that is mechanically gated —
//                   `autoresponse.test.ts` greps this file for the Hebrew block
//                   (ledger D-13) and goes red on a single codepoint; an
//                   invented ENGLISH sentence would still compile, and what
//                   catches it is the output tests, which assert the returned
//                   strings character for character.
//               (b) A RECEIPT WITH NOTHING TO SEND IT TO. `email` is optional
//                   on `leadSchema` and arrives as `''`; the no-address case
//                   returns `null` BEFORE any text is composed, so "render a
//                   receipt for a lead that has no address" is not a state this
//                   function can be in.
//               (c) A KEY NAME, AN `undefined`, OR AN EMPTY SEGMENT IN THE
//                   OUTPUT. Nothing is interpolated by name at runtime: the
//                   catalogue is a `z.infer`'d object with every key typed
//                   `string` and PROVED present by `getMessages`'s parse, so
//                   there is no lookup here that can miss and yield the string
//                   'undefined' or a raw 'formSuccessDesc'.
//               (d) AN UNTRANSLATED LOCALE. `getMessages` is total over
//                   `Locale` by TYPE (`Record<Locale, unknown>`), so adding
//                   'fr' to LOCALES does not silently ship a Hebrew receipt to
//                   a French enquirer — it fails to compile in
//                   `i18n/messages.ts` until fr.json exists and passes the
//                   schema.
//               (e) A SEND FROM THIS MODULE. There is no transport imported and
//                   no async in the signature; a caller that wants to send must
//                   do it somewhere else, where it can be seen.
//
// CLASS         Closed by DERIVATION for the PROVENANCE of autoresponse copy,
//               across every locale in `LOCALES` present and future: the words
//               are the catalogue's, the catalogue is validated once, and a new
//               locale is a compile error until its catalogue exists. Also
//               closed for the NO-ADDRESS case — one guard, one return, every
//               caller. NOT a closure over whether the receipt is GOOD WRITING
//               for the job; that is a copy decision belonging to the family,
//               and it is limit 1.
//
// HONEST LIMIT  1. THE WORDS WERE WRITTEN FOR A SCREEN, NOT FOR AN INBOX. The
//               catalogue has no salutation, no sign-off, no sender identity and
//               no subject line, so this receipt has none: it opens with
//               `formSuccessDesc` and stops. That is honest — it is the site's
//               own voice, unedited — but it is not the letter a person would
//               write. Closing THAT gap needs four new strings from the family
//               in both locales and is a §OPEN item, not a licence for this file
//               to improvise (see the report's §OPEN 1).
//               2. THE ENQUIRER IS NOT NAMED. `record.payload.name` is
//               deliberately NOT interpolated: the catalogue has no sentence
//               with a slot for it, so inserting it would require inventing the
//               prose around it. A nameless receipt is a smaller failure than a
//               machine-written greeting on a memorial site.
//               3. NO REFERENCE THE ENQUIRER CAN QUOTE. `record.id` is a real
//               ULID and is NOT in the body, because every label that could
//               introduce it ("your reference:") would be an invented string.
//               So a follow-up call cannot cite a number. Named, not hidden.
//               4. THIS FILE PROVES THE TEXT, NEVER THE DELIVERY. It returns a
//               subject and a body. Whether either reaches anyone depends on a
//               transport this module knows nothing about, and a `null` return
//               is indistinguishable, from the outside, from a send that failed
//               — the difference lives in the caller's log, not here.
//               5. PLAIN TEXT ONLY, AND NO BIDI MARKS. The Hebrew body carries
//               no U+200F/U+202B: a mail client that mis-orders an RTL line
//               beside the Latin phone number will mis-order it. Adding
//               directional controls is a rendering decision with no evidence
//               behind it from this seat.
//               6. `PHONE_DISPLAY` IS A NUMBER, NOT A LINK. The page wraps it in
//               `whatsappLink()`; a plain-text body cannot, and a `wa.me` URL
//               under a label that says "contact directly" would be this file
//               choosing a channel the text does not name. The number is the
//               fact; the channel is the reader's.
// ─────────────────────────────────────────────────────────────────────────────

import { PHONE_DISPLAY } from '@/config/site';
import { getMessages } from '@/i18n/messages';
import type { LeadRecord } from '@/lib/leads/types';

/**
 * The rendered receipt. Structurally identical to the shape the caller in
 * `app/api/lead/route.ts` is written against — `{ subject, body }` — stated
 * once, here, so the caller can import the type instead of restating it.
 */
export type Autoresponse = {
  subject: string;
  body: string;
};

/**
 * The only two literals in this file, and neither is a word.
 *
 * `LINE` separates a label from the fact beneath it exactly as the page's
 * block-level markup does; `PARAGRAPH` separates the two blocks. Layout, not
 * copy: no punctuation is added — `formDirect` already ends in its own colon in
 * both catalogues, and nothing here appends one.
 */
const LINE = '\n';
const PARAGRAPH = '\n\n';

/**
 * Render the receipt owed to whoever just wrote to this family, in THEIR
 * locale, or return `null` when there is no honest receipt to send.
 *
 * `null` means SEND NOTHING, and it is a correct outcome rather than a failure:
 * the enquiry itself is already stored (`persist-then-notify`, see
 * `lib/leads/types.ts`), so a caller that treats `null` as "skip the
 * autoresponse and carry on" loses nothing. Today there is exactly one `null`
 * state — no email address — and it is the state in which a receipt has
 * nowhere to go.
 *
 * Note what is absent from the parameter list: no locale override, no template,
 * no transport, no `now`. There is nothing to pass that could make this
 * function answer in the wrong language or say something the catalogue does not
 * already say.
 */
export function renderAutoresponse(record: LeadRecord): Autoresponse | null {
  // `leadSchema` trims and defaults `email` to `''`; both absent and blank mean
  // the same thing here — nobody to write to.
  if (record.payload.email.trim().length === 0) {
    return null;
  }

  // THE locale of the enquiry, from the one place it is stated.
  const m = getMessages(record.payload.locale);

  return {
    // The site's own headline for this exact event, in the enquirer's language.
    subject: m.formSuccess,
    body: [
      // "what happens next" — the line the page shows them at the moment they
      // press submit, now in a form that survives closing the tab.
      m.formSuccessDesc,
      // the direct-contact block, label then fact, as the form renders it.
      [m.formDirect, PHONE_DISPLAY].join(LINE),
    ].join(PARAGRAPH),
  };
}
