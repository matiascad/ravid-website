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
//               inside `if (response.ok === true)`, i.e. only from a response
//               this component has read. Every other terminal path (a resolved
//               response with `ok === false`, a thrown/aborted/timed-out fetch,
//               a failed required-field check) lands on `'failed'` or
//               `'invalid'`, and the success copy is not rendered in either.
//               Success copy has exactly one render site, guarded by
//               `status === 'sent'`, so "told it was sent" and "observed an ok
//               response" are the same fact stated once.
//
// IMPOSSIBLE    The lie both existing sites tell can no longer be CONSTRUCTED
//               here. Specifically:
//               (a) SUCCESS FROM A RESOLVED FAILURE. There is no `setSubmitted`
//                   after a bare `await fetch(...)`; the only assignment of the
//                   'sent' status is inside the `response.ok === true` branch.
//                   Deleting that check does not merely change behaviour — it
//                   turns the suite red (see the RED proof in the test header),
//                   so Defect 2 cannot be reintroduced quietly.
//               (b) A FALLBACK UNREACHABLE FOR HTTP ERRORS. The WhatsApp
//                   fallback is rendered from the `'failed'` STATUS, not from a
//                   `catch` block, and both the `ok === false` path and the
//                   thrown path set that one status. There is no branch that can
//                   fail without offering it.
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
// HONEST LIMIT  Seven, stated plainly.
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
//      value follow-up and is the first action owed to the seat.
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
//
// CONTRACTS HONOURED: props-driven (no getMessages call here — this is a client
// component and the catalogue load stays on the server); zero hardcoded copy and
// zero Hebrew codepoints, comments included; logical CSS only (no ml/mr/pl/pr/
// left/right/text-left/text-right); next/image only, never a CSS background; one
// named export, no default; no `any`, no non-null assertion, no `as` cast.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import Image from 'next/image';
import { useRef, useState, type FormEvent } from 'react';

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
>;

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
 *               response with `ok === false` AND from a thrown/aborted fetch —
 *               the same state, so no failure mode can miss the fallback.
 *   sent        and ONLY here: `formSuccess` + `formSuccessDesc`. Reachable from
 *               exactly one assignment, inside `if (response.ok === true)`.
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (inFlight.current === true) return;

    const missingNow = missingRequired(values);
    if (missingNow.length > 0) {
      // No request is made, and none is claimed.
      setMissing(missingNow);
      setStatus('invalid');
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
        }),
        signal: timeoutSignal(),
      });

      // ── THE ONE CHECK THAT SEPARATES THIS FILE FROM DEFECT 2 ──────────────
      // A resolved fetch is NOT a delivered lead. `fetch` settles happily on
      // 404, 422 and 500. Only an ok response may reach 'sent'.
      if (response.ok === true) {
        setValues(EMPTY);
        setStatus('sent');
      } else {
        setStatus('failed');
      }
    } catch {
      // Network down, DNS failure, CORS, abort, timeout. Same destination as an
      // HTTP error: the fallback is reachable from every failure, not just this
      // branch. That is exactly the shape the customer's site got wrong.
      setStatus('failed');
    } finally {
      inFlight.current = false;
    }
  }

  const busy = status === 'submitting';

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
            <p className="mb-7 text-center text-gray-300">{m.formSubtitle}</p>

            {/* A real form: native submit and Enter-key submit run this handler. */}
            <form
              onSubmit={handleSubmit}
              noValidate
              aria-busy={busy}
              aria-describedby={STATUS_ID}
              className="space-y-4"
            >
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
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/40 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:border-white"
                  >
                    {PHONE_DISPLAY}
                  </a>
                  <a
                    data-testid="form-direct-instagram"
                    href={INSTAGRAM_URL}
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
