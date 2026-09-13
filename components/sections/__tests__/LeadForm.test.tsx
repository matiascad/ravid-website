// ─────────────────────────────────────────────────────────────────────────────
// W4-11 LEAD FORM TEST — components/sections/__tests__/LeadForm.test.tsx
//
// INVARIANT     `fetch` is mocked at the BOUNDARY and nowhere else: no part of
//               LeadForm's own logic is stubbed, so every assertion here is about
//               what the real component does when the network behaves a given
//               way. Zero real requests leave this process — the mock replaces
//               the global for the duration of each test and is unstubbed after
//               it, and `/api/lead` does not exist yet in any case.
//
// IMPOSSIBLE    Both measured defects can no longer pass this suite.
//               DEFECT 2 — "a resolved response is a delivered lead" — is test 5:
//               `fetch` RESOLVES with `ok: false, status: 500` and the success
//               panel must be ABSENT while the WhatsApp fallback must be PRESENT.
//               The customer's site fails that test as written. The RED proof
//               below shows the assertion going red when the `response.ok === true`
//               check is removed, so the check cannot be deleted quietly.
//               DEFECT 1 — "tell the user it was sent, send nothing" — is tests 3
//               and 4 together: nothing is announced as sent without an observed
//               ok response, and a submit that never reaches the network is
//               announced as a failure, not as a success.
//
//               ── THE RED PROOF (test 5), measured and verbatim ──────────────
//               Edit applied to LeadForm.tsx — Defect 2 reintroduced exactly, by
//               accepting any resolved response:
//                   -      if (response.ok === true) {
//                   -        setValues(EMPTY);
//                   -        setStatus('sent');
//                   -      } else {
//                   -        setStatus('failed');
//                   -      }
//                   +      void response;
//                   +      setValues(EMPTY);
//                   +      setStatus('sent');
//
//               `npx vitest run components/sections/__tests__/LeadForm.test.tsx`:
//
//                 FAIL  components/sections/__tests__/LeadForm.test.tsx > 5. RED
//                 PROOF - fetch RESOLVES with ok:false (500): NO success, fallback
//                 offered
//                 AssertionError: LeadForm told the user the enquiry was sent
//                 after a resolved HTTP 500. This is Defect 2.: expected
//                 <div …(2)>…(2)</div> to be null
//
//                 - Expected:
//                 null
//
//                 + Received:
//                 <div
//                   class="py-12 text-center"
//                   data-testid="form-success"
//                 >
//
//                  Test Files  1 failed (1)
//                       Tests  2 failed | 6 passed (8)
//
//               TWO tests went red, not one: test 8 (the prefilled WhatsApp
//               fallback) fails for the same reason, because a form that claims
//               success never offers the fallback. Six tests stayed green, which
//               is what makes these two informative rather than a broken harness.
//
//               Restored from a pre-edit copy and proved byte-identical:
//                 sha256 before edit   828a7571065bef78e12227fa7d79e731edf83cb4d92ae65816248435fae55de1
//                 sha256 after restore 828a7571065bef78e12227fa7d79e731edf83cb4d92ae65816248435fae55de1
//               That pair is the break/restore cycle itself. LeadForm.tsx has
//               since received two COMMENT-ONLY corrections (a self-contradictory
//               sentence and a stale line reference in its own header); no
//               executable line changed, and the suite was re-run green after
//               them. Its current hash is therefore not 828a7571 — do not expect
//               it to be.
//               ───────────────────────────────────────────────────────────────
//
// CLASS         INSTANCE, honestly. This closes LeadForm.tsx, not the class "no
//               component in this repo treats a resolved fetch as success".
//               Twelve sibling sections were written concurrently and nothing
//               here constrains them; the derivation for that class is an ESLint
//               rule over `components/`, which is outside this write-set.
//
// HONEST LIMIT  Six, stated plainly.
//   1. FIXTURES, NOT THE REAL CATALOGUE. Every message is an ASCII sentinel. This
//      proves the component renders whatever it is handed, in the right slots. It
//      does NOT prove `messages/he.json` still contains those keys — the zod
//      schema in `@/i18n/messages` owns that, and pinning customer copy here
//      would make the customer's own edit a red suite. It also means this file
//      contains no Hebrew, which is required of it.
//   2. NO SERVER CLAIM. `/api/lead` is W5's and did not exist when this was
//      written. These tests prove the REQUEST is shaped correctly and the
//      RESPONSE is read correctly. They prove nothing about delivery, and a green
//      run here is fully compatible with the endpoint being absent.
//   3. NO PIXELS, NO LAYOUT, NO RTL. jsdom computes no layout and loads no image.
//      The background asset, the scrim, focus rings, contrast and right-to-left
//      appearance are all unverified here; `dir` is set by the layout, which is
//      not in this tree.
//   4. THE TIMEOUT PATH IS NOT EXERCISED. `AbortSignal.timeout` is feature-
//      detected in the component and the mock ignores the signal. What IS tested
//      is the destination an abort lands in — the same `catch` as test 6.
//   5. LABEL MATCHING IS SUBSTRING (`exact: false`). The visual required marker
//      lives inside the `<label>` as an `aria-hidden` span, and dom-testing-
//      library matches a label by its text content rather than by the computed
//      accessible name. The sentinels are unique, so the match is still fully
//      discriminating, but this does not assert the exact accessible NAME an AT
//      would announce — that is an axe/e2e concern.
//   6. "NOT A LITERAL" IS PROVED ONLY UP TO EQUALITY. Test 8 asserts the fallback
//      href equals `whatsappLink(prefill)`. A hand-built string that happened to
//      encode identically would still pass; what makes inlining impossible is the
//      W7 repo-wide grep gate, not this assertion.
// ─────────────────────────────────────────────────────────────────────────────

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LeadForm } from '@/components/sections/LeadForm';
import { SECTION_IDS, whatsappLink } from '@/config/site';
import type { Messages } from '@/i18n/messages';

/* ── Fixture: ASCII sentinels, one per key ────────────────────────────────── */

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

const M: LeadFormMessages = {
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

const TYPED = {
  name: 'Dana Cohen',
  phone: '050-000-0000',
  email: 'dana@example.org',
  organization: 'Example School',
  message: 'Memorial day assembly',
} as const;

/**
 * The expected WhatsApp prefill, RESTATED here independently of the component's
 * `buildPrefill`. If the component changes how it composes the message, this
 * disagrees and test 8 goes red — which is the point of not sharing a helper.
 */
const EXPECTED_PREFILL = [
  M.formTitle,
  `${M.formName}: ${TYPED.name}`,
  `${M.formPhone}: ${TYPED.phone}`,
  `${M.formEmail}: ${TYPED.email}`,
  `${M.formOrg}: ${TYPED.organization}`,
  `${M.formMessage}: ${TYPED.message}`,
].join('\n');

/* ── The mocked boundary ──────────────────────────────────────────────────── */

/**
 * Our own minimal response shape. Deliberately NOT the DOM `Response` type: the
 * component only ever reads `.ok`, a real `Response` is not guaranteed to exist
 * as a global in every jsdom build, and constructing one would require a cast.
 */
type FakeResponse = { ok: boolean; status: number };
type FetchInit = { method?: string; body?: string; headers?: Record<string, string> };

const fetchMock = vi.fn<(input: string, init?: FetchInit) => Promise<FakeResponse>>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function renderForm() {
  return render(<LeadForm m={M} locale="he" />);
}

/** Fill every field with the TYPED values above. */
async function fillAll(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(M.formName, { exact: false }), TYPED.name);
  await user.type(screen.getByLabelText(M.formPhone, { exact: false }), TYPED.phone);
  await user.type(screen.getByLabelText(M.formEmail, { exact: false }), TYPED.email);
  await user.type(screen.getByLabelText(M.formOrg, { exact: false }), TYPED.organization);
  await user.type(screen.getByLabelText(M.formMessage, { exact: false }), TYPED.message);
}

function submitButton(): HTMLElement {
  return screen.getByRole('button', { name: M.formSubmit });
}

/** The single `<form>` element, without a non-null assertion. */
function formElement(container: HTMLElement): HTMLFormElement {
  const form = container.querySelector('form');
  if (form === null) throw new Error('LeadForm rendered no <form> element (this is Defect 1)');
  return form;
}

/* ── Tests ────────────────────────────────────────────────────────────────── */

test('1. renders every label, placeholder and the submit control from `m`', () => {
  renderForm();

  // Labels — each resolves to its associated control, which proves the
  // `<label htmlFor>` wiring, not merely that the text is on screen.
  expect(screen.getByLabelText(M.formName, { exact: false })).toHaveAttribute('name', 'name');
  expect(screen.getByLabelText(M.formPhone, { exact: false })).toHaveAttribute('name', 'phone');
  expect(screen.getByLabelText(M.formEmail, { exact: false })).toHaveAttribute('name', 'email');
  expect(screen.getByLabelText(M.formOrg, { exact: false })).toHaveAttribute(
    'name',
    'organization',
  );
  expect(screen.getByLabelText(M.formMessage, { exact: false })).toHaveAttribute('name', 'message');

  // Placeholders.
  for (const placeholder of [
    M.formNamePh,
    M.formPhonePh,
    M.formEmailPh,
    M.formOrgPh,
    M.formMsgPh,
  ]) {
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  }

  // Headline copy and the submit control.
  expect(screen.getByRole('heading', { name: M.formTitle })).toBeInTheDocument();
  expect(screen.getByText(M.formSubtitle)).toBeInTheDocument();
  expect(submitButton()).toBeInTheDocument();

  // Required fields are marked as such for assistive technology.
  expect(screen.getByLabelText(M.formName, { exact: false })).toHaveAttribute(
    'aria-required',
    'true',
  );
  expect(screen.getByLabelText(M.formPhone, { exact: false })).toHaveAttribute(
    'aria-required',
    'true',
  );

  // Nothing has been claimed before anything was submitted.
  expect(screen.queryByTestId('form-success')).toBeNull();
  expect(screen.queryByTestId('form-fallback')).toBeNull();
});

test('2. carries id="form" from SECTION_IDS, and a real <form> element', () => {
  const { container } = renderForm();

  const section = container.querySelector('section');
  expect(section).not.toBeNull();
  expect(section?.getAttribute('id')).toBe(SECTION_IDS.form);

  // Pins the live anchor contract (ledger D-11): every CTA on the site targets
  // this exact string, so a rename of SECTION_IDS.form must be a deliberate act.
  expect(SECTION_IDS.form).toBe('form');
  expect(container.querySelector('#form')).not.toBeNull();

  // Defect 1 was a <div> with a <button onClick>: no native submit, no Enter key.
  expect(formElement(container)).toBeInstanceOf(HTMLFormElement);
  expect(submitButton()).toHaveAttribute('type', 'submit');
});

test('3. empty required fields: NO network call, and the failure is announced', async () => {
  const user = userEvent.setup();
  renderForm();

  await user.click(submitButton());

  // The lead was never attempted, so nothing may be claimed about it.
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.queryByTestId('form-success')).toBeNull();

  // ...and the user is told, in the live region, which fields are missing.
  const status = screen.getByTestId('form-status');
  expect(status).toHaveAttribute('aria-live', 'polite');
  const invalid = screen.getByTestId('form-invalid');
  expect(invalid).toHaveTextContent(M.formName);
  expect(invalid).toHaveTextContent(M.formPhone);
  expect(invalid.parentElement).toBe(status);

  // The offending inputs are flagged and focus has moved to the first of them.
  const nameInput = screen.getByLabelText(M.formName, { exact: false });
  expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText(M.formPhone, { exact: false })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  expect(document.activeElement).toBe(nameInput);
});

test('4. res.ok true: the success message is shown exactly once, and the request is well formed', async () => {
  const user = userEvent.setup();
  fetchMock.mockResolvedValue({ ok: true, status: 200 });
  renderForm();

  await fillAll(user);
  await user.click(submitButton());

  await waitFor(() => {
    expect(screen.getByTestId('form-success')).toBeInTheDocument();
  });

  // Exactly once — not two panels, not a panel plus a stray line of copy.
  expect(screen.getAllByTestId('form-success')).toHaveLength(1);
  expect(screen.getAllByText(M.formSuccess)).toHaveLength(1);
  expect(screen.getByText(M.formSuccessDesc)).toBeInTheDocument();

  // No fallback is offered when nothing failed.
  expect(screen.queryByTestId('form-fallback')).toBeNull();

  // One call, to OUR endpoint, carrying the five fields plus the locale.
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const call = fetchMock.mock.calls[0];
  if (call === undefined) throw new Error('expected one fetch call');
  const [url, init] = call;
  expect(url).toBe('/api/lead');
  expect(init?.method).toBe('POST');
  const body: unknown = JSON.parse(init?.body ?? '{}');
  expect(body).toEqual({
    name: TYPED.name,
    phone: TYPED.phone,
    email: TYPED.email,
    organization: TYPED.organization,
    message: TYPED.message,
    locale: 'he',
  });
});

test('5. RED PROOF - fetch RESOLVES with ok:false (500): NO success, fallback offered', async () => {
  const user = userEvent.setup();
  // `fetch` does NOT reject here. It resolves, exactly as it does for every 4xx
  // and 5xx. This is the precise condition under which the customer's current
  // site shows "sent successfully" for a lead that was never delivered.
  fetchMock.mockResolvedValue({ ok: false, status: 500 });
  renderForm();

  await fillAll(user);
  await user.click(submitButton());

  // Wait for the OUTCOME, not for a particular outcome: the live region gains
  // content in both the 'sent' and the 'failed' state, so this settles either
  // way and the assertions below are what decide the verdict.
  await waitFor(() => {
    expect(screen.getByTestId('form-status')).not.toBeEmptyDOMElement();
  });

  expect(
    screen.queryByTestId('form-success'),
    'LeadForm told the user the enquiry was sent after a resolved HTTP 500. This is Defect 2.',
  ).toBeNull();
  expect(screen.queryByText(M.formSuccess)).toBeNull();
  expect(screen.queryByText(M.formSuccessDesc)).toBeNull();
  expect(screen.getByTestId('form-fallback')).toBeInTheDocument();

  // The fallback is inside the announced region, so a screen-reader user is told
  // as much as a sighted one.
  const status = screen.getByTestId('form-status');
  expect(screen.getByTestId('form-fallback').parentElement).toBe(status);
  expect(status).toHaveTextContent(M.formDirect);

  // The form is still there to retry, and the user's answers are still in it.
  expect(screen.getByLabelText(M.formName, { exact: false })).toHaveValue(TYPED.name);
  expect(submitButton()).toBeEnabled();
});

test('6. fetch REJECTS (network down): same guarantee - no success, fallback offered', async () => {
  const user = userEvent.setup();
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
  renderForm();

  await fillAll(user);
  await user.click(submitButton());

  await waitFor(() => {
    expect(screen.getByTestId('form-fallback')).toBeInTheDocument();
  });

  expect(screen.queryByTestId('form-success')).toBeNull();
  expect(screen.queryByText(M.formSuccess)).toBeNull();
  expect(submitButton()).toBeEnabled();
});

test('7. double-submit guard: two rapid submits produce exactly one fetch call', async () => {
  const user = userEvent.setup();

  let settle: (value: FakeResponse) => void = () => undefined;
  fetchMock.mockImplementation(
    () =>
      new Promise<FakeResponse>((resolve) => {
        settle = resolve;
      }),
  );

  const { container } = renderForm();
  await fillAll(user);

  const form = formElement(container);

  // Dispatched in the SAME tick, before React can flush `disabled` to the DOM.
  // A guard that relied only on the disabled attribute would let the second one
  // through; the synchronous ref in the handler is what makes this one call.
  fireEvent.submit(form);
  fireEvent.submit(form);

  expect(fetchMock).toHaveBeenCalledTimes(1);

  // While in flight the control is disabled and the form is marked busy.
  await waitFor(() => {
    expect(submitButton()).toBeDisabled();
  });
  expect(form).toHaveAttribute('aria-busy', 'true');
  expect(screen.queryByTestId('form-success')).toBeNull();

  settle({ ok: true, status: 200 });
  await waitFor(() => {
    expect(screen.getByTestId('form-success')).toBeInTheDocument();
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('8. the fallback href is built by whatsappLink(), prefilled from the form values', async () => {
  const user = userEvent.setup();
  fetchMock.mockResolvedValue({ ok: false, status: 503 });
  renderForm();

  await fillAll(user);
  await user.click(submitButton());

  const link = await screen.findByTestId('form-fallback-whatsapp');

  // EXPECTED_PREFILL is restated in this file, independently of the component.
  expect(link).toHaveAttribute('href', whatsappLink(EXPECTED_PREFILL));

  // It is a prefilled link, not the bare one: the two must differ.
  expect(link.getAttribute('href')).not.toBe(whatsappLink());
  expect(link.getAttribute('href')?.startsWith(whatsappLink())).toBe(true);
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});
