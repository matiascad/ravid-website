// ─────────────────────────────────────────────────────────────────────────────
// W13-A PRIVACY NOTICE — components/sections/__tests__/PrivacyNotice.test.tsx
//
// WHAT THIS SUITE PROVES, and in which direction. The notice DOES NOT EXIST
// TODAY: no catalogue answers its three keys, and the component is therefore a
// built path with nothing in it. So half of this file proves an ABSENCE — that
// the path costs the served page exactly zero bytes — and the other half proves
// that when Ravid answers, a reader RECEIVES THE TEXT and a screen reader is
// TOLD IT, associated with the form rather than merely sitting near it.
//
// LAW 8 THROUGHOUT — assert the computed effect, never an identifier. Earned by
// this repo the hard way: every gate was green while the booking button was
// invisible, because `bg-gold` was undefined and Tailwind emits nothing for a
// class it does not know. So:
//   · NOT "the component returns null" — `container.innerHTML === ''`.
//   · NOT "a message key exists" — the literal characters a reader receives.
//   · NOT `getByTestId` — `getByRole('region', { name })`, the accessibility
//     tree's own answer, and `toHaveAccessibleDescription`, which makes the
//     browser's description algorithm resolve the id list for us. An
//     `aria-describedby` that names an element that is not there computes to an
//     empty description and fails HERE, where asserting the attribute string
//     would have passed.
//
// THE BYTE GATE IS A DERIVATION, NOT A SNAPSHOT. The night-wide rule is that
// with every blocked value unset the served page must be byte-identical to
// before. A frozen hash of the whole form would prove that once and then go red
// for every legitimate future edit by anyone — a landmine, not a gate. The
// COMPLETE set of differences this delegate's change can make to the idle page
// is exactly two: the nodes the notice contributes, and the value of the form's
// `aria-describedby`. Tests 2 and 3 pin both. Zero nodes plus an unchanged
// attribute IS byte identity, and it stays true under future edits that are not
// this delegate's.
//   (The frozen hash was still measured, once, out of band: the idle render was
//   4981 characters, sha256 93977daad62b4c4468c400b2f08532d2773d6c677fa7f9dc4be
//   45417b701b8cb, identical in both locales, before and after the change. It is
//   recorded in the report rather than asserted here, for the reason above.)
//
// NO HEBREW BYTE MAY APPEAR IN THIS FILE, and test 8 proves it by scanning the
// file's own bytes against the numeric bounds of the Hebrew block. Every Hebrew
// character used as a fixture is produced by `String.fromCodePoint` from
// hexadecimal numbers. There is no backslash escape for a character anywhere in
// this file, comments included: three delegates were bitten in one night by an
// editor silently turning one into a real Hebrew letter (ledger D-82, D-94).
// ─────────────────────────────────────────────────────────────────────────────

import { render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { LeadForm } from '@/components/sections/LeadForm';
import {
  PrivacyNotice,
  resolvePrivacyNotice,
  type PrivacyNoticeText,
} from '@/components/sections/PrivacyNotice';
import { LOCALES } from '@/config/site';
import type { Messages } from '@/i18n/messages';

/* ── Fixture: the form's seventeen real keys, ASCII sentinels ─────────────── */

type FormMessages = Pick<
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

const M: FormMessages = {
  formTitle: 'TITLE-SENTINEL',
  formSubtitle: 'SUBTITLE-SENTINEL',
  formName: 'NAME-LABEL-SENTINEL',
  formPhone: 'PHONE-LABEL-SENTINEL',
  formEmail: 'EMAIL-LABEL-SENTINEL',
  formOrg: 'ORG-LABEL-SENTINEL',
  formMessage: 'MESSAGE-LABEL-SENTINEL',
  formNamePh: 'NAME-PLACEHOLDER-SENTINEL',
  formPhonePh: 'PHONE-PLACEHOLDER-SENTINEL',
  formEmailPh: 'EMAIL-PLACEHOLDER-SENTINEL',
  formOrgPh: 'ORG-PLACEHOLDER-SENTINEL',
  formMsgPh: 'MESSAGE-PLACEHOLDER-SENTINEL',
  formSubmit: 'SUBMIT-SENTINEL',
  formSuccess: 'SUCCESS-SENTINEL',
  formSuccessDesc: 'SUCCESS-DESC-SENTINEL',
  formDirect: 'DIRECT-SENTINEL',
  required: 'REQUIRED-MARK-SENTINEL',
};

/**
 * A HYPOTHETICAL answer, so the path can be proved before Ravid gives a real
 * one. These are sentinels, not text: they are deliberately not sentences, so
 * nothing here can ever be mistaken for a privacy statement and copied into a
 * catalogue. No claim about data is made by any of the three.
 */
const SEEDED: PrivacyNoticeText = {
  privacyTitle: 'PRIVACY-TITLE-SENTINEL',
  privacyData: 'PRIVACY-DATA-SENTINEL',
  privacyRetention: 'PRIVACY-RETENTION-SENTINEL',
};

/**
 * The literal the form has always carried in `aria-describedby`. Restated here
 * as its own spelling rather than imported: `LeadForm` does not export it, and a
 * test that read the component's own constant would agree with it whatever it
 * said. This and the component are two independent spellings that must agree.
 */
const STATUS_ID = 'lead-form-status';

/**
 * Four letters from the Hebrew block, built from NUMBERS so this file's bytes
 * stay pure ASCII. The numbers are hexadecimal code points: 0x05e9, 0x05dc,
 * 0x05d5, 0x05dd. Almost every real visitor to this site types in this script,
 * so a notice that cannot carry it is not proved.
 */
const HEBREW_SAMPLE = String.fromCodePoint(0x05e9, 0x05dc, 0x05d5, 0x05dd);

const SEEDED_HEBREW: PrivacyNoticeText = {
  privacyTitle: `${HEBREW_SAMPLE}-TITLE`,
  privacyData: `${HEBREW_SAMPLE}-DATA`,
  privacyRetention: `${HEBREW_SAMPLE}-RETENTION`,
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/**
 * The `<form>` element itself. Looked up structurally ON PURPOSE: a `<form>`
 * with no accessible name has no `form` role in the accessibility tree, so
 * `getByRole('form')` would find nothing here and asserting otherwise would be
 * asserting a fact that is not true. Law 8 governs the ASSERTIONS made about
 * this element - accessible description, accessible name, role - not how the
 * element under test is reached.
 */
function theForm(container: HTMLElement): HTMLElement {
  const form = container.querySelector('form');
  if (form === null) throw new Error('LeadForm rendered no <form> element');
  return form;
}

/** The honeypot input, reached by the `name` the route's guard reads. */
function honeypotInput(container: HTMLElement): HTMLElement {
  const field = container.querySelector('input[name="hp_ref"]');
  if (field === null || !(field instanceof HTMLElement)) {
    throw new Error('LeadForm rendered no honeypot input, so the route guard traps nothing');
  }
  return field;
}

/* ── 1. THE ABSENT STATE, AND EVERY PARTIAL ONE ───────────────────────────── */

/**
 * The atomicity derivation. A privacy notice missing its retention line does not
 * read to a visitor as incomplete — it reads as COMPLETE, which makes the
 * omission an implied claim that there is nothing further to say. So there must
 * be no input at all that renders part of a notice.
 *
 * All eight subsets of the three facts are enumerated below, plus the three
 * whitespace-only answers, and every one of them except the full answer must
 * produce the empty string.
 */
const PARTIAL_ANSWERS: ReadonlyArray<readonly [string, Partial<PrivacyNoticeText>]> = [
  ['nothing answered - TODAY', {}],
  ['title only', { privacyTitle: SEEDED.privacyTitle }],
  ['data only', { privacyData: SEEDED.privacyData }],
  ['retention only', { privacyRetention: SEEDED.privacyRetention }],
  ['title and data, no retention', { privacyTitle: SEEDED.privacyTitle, privacyData: SEEDED.privacyData }],
  [
    'title and retention, no data',
    { privacyTitle: SEEDED.privacyTitle, privacyRetention: SEEDED.privacyRetention },
  ],
  [
    'data and retention, no title',
    { privacyData: SEEDED.privacyData, privacyRetention: SEEDED.privacyRetention },
  ],
  ['all three present but blank', { privacyTitle: '', privacyData: '', privacyRetention: '' }],
  [
    'all three present but whitespace',
    { privacyTitle: '   ', privacyData: '\t', privacyRetention: '\n ' },
  ],
];

test('1. unanswered or half-answered, the notice renders NOTHING - not one node', () => {
  for (const [label, answer] of PARTIAL_ANSWERS) {
    const { container, unmount } = render(<PrivacyNotice m={answer} />);

    // Law 8: not "the component returned null" - the DOM it produced, measured.
    expect(container.innerHTML, `${label}: the notice rendered something`).toBe('');
    expect(container.childNodes.length, `${label}: the notice left a node behind`).toBe(0);

    // And the resolver agrees, for the same input, so the two cannot drift.
    expect(resolvePrivacyNotice(answer), `${label}: resolver disagreed`).toBeNull();

    unmount();
  }
});

/* ── 2. TODAY'S SERVED PAGE, IN BOTH LOCALES ──────────────────────────────── */

test('2. with the keys unset the served form gains nothing, in every locale', () => {
  for (const locale of LOCALES) {
    const { container, unmount } = render(<LeadForm m={M} locale={locale} />);

    // (a) NO REGION. Asked of the accessibility tree, not of a selector: if the
    //     notice existed but were unreachable this would still be null, and if
    //     it existed and were reachable this would find it.
    expect(
      screen.queryByRole('region', { name: SEEDED.privacyTitle }),
      `${locale}: a privacy region exists that has no text to put in it`,
    ).toBeNull();

    // (b) THE ATTRIBUTE IS EXACTLY WHAT IT WAS. One id, the live region's, with
    //     no separator and nothing appended. This is one of exactly two bytes
    //     this delegate's change could have moved on the idle page.
    expect(theForm(container).getAttribute('aria-describedby')).toBe(STATUS_ID);

    // (c) AND THE OTHER ONE: the notice contributed no markup anywhere in the
    //     rendered section. Its id appears nowhere in the served bytes.
    expect(container.innerHTML).not.toContain('lead-form-privacy');

    unmount();
  }
});

/* ── 3. THE ANSWERED STATE — WHAT A READER ACTUALLY RECEIVES ──────────────── */

test('3. answered, a reader receives all three sentences, in every locale', () => {
  for (const locale of LOCALES) {
    const { unmount } = render(<LeadForm m={{ ...M, ...SEEDED }} locale={locale} />);

    // The accessibility tree's own answer to "is there a named region here".
    const notice = screen.getByRole('region', { name: SEEDED.privacyTitle });

    // The TEXT, not the key. All three facts reach the reader, inside the one
    // region, in the order they were answered.
    const scope = within(notice);
    expect(scope.getByText(SEEDED.privacyData)).toBeInTheDocument();
    expect(scope.getByText(SEEDED.privacyRetention)).toBeInTheDocument();
    expect(notice.textContent, `${locale}: a fact went missing from the notice`).toBe(
      `${SEEDED.privacyTitle}${SEEDED.privacyData}${SEEDED.privacyRetention}`,
    );

    unmount();
  }
});

test('4. answered, the notice is ASSOCIATED WITH THE FORM, not merely near it', () => {
  const { container } = render(<LeadForm m={{ ...M, ...SEEDED }} locale="he" />);
  const form = theForm(container);

  // THE COMPUTED EFFECT, not the attribute string. `toHaveAccessibleDescription`
  // runs the description algorithm: it resolves every id in `aria-describedby`
  // and concatenates the text those elements actually contain. An id pointing at
  // an element that does not exist contributes nothing and this fails - which is
  // precisely the failure an `aria-describedby` string comparison cannot see.
  //
  // A screen-reader user entering this form therefore hears all three facts.
  expect(form).toHaveAccessibleDescription(new RegExp(SEEDED.privacyTitle));
  expect(form).toHaveAccessibleDescription(new RegExp(SEEDED.privacyData));
  expect(form).toHaveAccessibleDescription(new RegExp(SEEDED.privacyRetention));

  // The live region is still named first, so adding the notice APPENDED to what
  // the form already announced rather than replacing it.
  expect(form.getAttribute('aria-describedby')).toBe(`${STATUS_ID} lead-form-privacy`);
});

test('5. answered in the Hebrew block, the exact characters reach the reader', () => {
  for (const locale of LOCALES) {
    const { unmount } = render(<LeadForm m={{ ...M, ...SEEDED_HEBREW }} locale={locale} />);

    const notice = screen.getByRole('region', { name: SEEDED_HEBREW.privacyTitle });
    expect(notice.textContent).toContain(HEBREW_SAMPLE);
    expect(within(notice).getByText(SEEDED_HEBREW.privacyRetention)).toBeInTheDocument();

    unmount();
  }
});

/* ── 6. THE W9 / W4 INVARIANTS THE NEW NODE COULD HAVE DISTURBED ──────────── */

/**
 * The nineteen tests in LeadForm.test.tsx re-run unchanged and are the real
 * re-confirmation; duplicating them here would be a second copy of the same
 * assertions. What is asserted below is only what this delegate's change could
 * plausibly have broken and those tests do not cover: the same invariants WITH
 * THE NOTICE PRESENT, a state no existing test can reach.
 */
test('6. answered, the form still has FIVE labelled controls and one hidden trap', () => {
  const { container } = render(<LeadForm m={{ ...M, ...SEEDED }} locale="he" />);

  // FIVE. The notice is a region with two paragraphs and a heading; none of them
  // is a form control, and it did not become a sixth field.
  const textboxes = screen.getAllByRole('textbox');
  expect(textboxes).toHaveLength(5);

  for (const label of [M.formName, M.formPhone, M.formEmail, M.formOrg, M.formMessage]) {
    expect(screen.getByLabelText(label, { exact: false })).toBeInTheDocument();
  }

  // THE HONEYPOT IS UNTOUCHED AND STILL OUT OF THE ACCESSIBILITY TREE. Its
  // wrapper hides it with an INLINE style on purpose - jsdom loads no stylesheet,
  // so a utility class would be unprovable here.
  const honeypot = honeypotInput(container);
  const wrapper = honeypot.parentElement;
  if (wrapper === null) throw new Error('the honeypot input has no wrapper to hide it');

  // The INLINE hide, computed by jsdom - the one form of hiding jsdom can see.
  expect(window.getComputedStyle(wrapper).display).toBe('none');
  expect(honeypot).toHaveAttribute('aria-hidden', 'true');
  expect(honeypot).toHaveAttribute('tabindex', '-1');
  expect(honeypot).not.toHaveAccessibleName();
  expect(textboxes).not.toContain(honeypot);
  expect(wrapper.textContent).toBe('');
});

test('7. answered, the notice is not announced as an outcome - the live region is still empty', () => {
  render(<LeadForm m={{ ...M, ...SEEDED }} locale="he" />);

  // The form has not been submitted, so nothing has happened, so the polite live
  // region must still say nothing. A notice that landed inside the live region
  // would be read out as though it were the RESULT OF AN ACTION the visitor has
  // not taken - which is the exact lie this component was written to prevent.
  const status = screen.getByTestId('form-status');
  expect(status).toBeEmptyDOMElement();
  expect(status.textContent).toBe('');
});

/* ── 8. THIS FILE'S OWN BYTES ─────────────────────────────────────────────── */

test('8. this file contains no character from the Hebrew block', () => {
  // The block's numeric bounds, written as hexadecimal numbers. Nothing in this
  // file spells a character with a backslash escape - not in code and not in a
  // comment - because an editor that helpfully resolves one would put a real
  // Hebrew letter in a file whose whole job is to have none.
  const HEBREW_BLOCK_FIRST = 0x0590;
  const HEBREW_BLOCK_LAST = 0x05ff;

  const source = readFileSync(fileURLToPath(import.meta.url), 'utf8');

  const offenders: number[] = [];
  for (let index = 0; index < source.length; index += 1) {
    const code = source.codePointAt(index);
    if (code === undefined) continue;
    if (code >= HEBREW_BLOCK_FIRST && code <= HEBREW_BLOCK_LAST) offenders.push(index);
  }

  expect(offenders, `Hebrew characters found at offsets ${offenders.join(', ')}`).toEqual([]);

  // The scan is proved to WORK, not merely to pass: the same bounds applied to a
  // string that does contain Hebrew must find it.
  const control = HEBREW_SAMPLE.codePointAt(0);
  if (control === undefined) throw new Error('the Hebrew sample produced no code point');
  expect(control >= HEBREW_BLOCK_FIRST && control <= HEBREW_BLOCK_LAST).toBe(true);
});
