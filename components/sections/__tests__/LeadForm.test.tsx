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
//               HISTORICAL: the branch quoted below is how LeadForm.tsx read at
//               the time. W14-FIX1 has since TIGHTENED it — `response.ok === true`
//               is now necessary but no longer sufficient (see the fourth RED
//               proof) — so this diff no longer applies verbatim. It is kept as
//               the record of the break/restore cycle that was actually run.
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
//               ── THE SECOND RED PROOF (W9-D, tests 9 and 12), verbatim ─────
//               The first proof above breaks the `ok` CHECK. This one breaks the
//               PREFILL — the thing the visitor's enquiry actually rides on —
//               because a fallback link that renders but carries nothing is a
//               funnel that still loses the lead while every "is the link there"
// assertion stays green. Edit applied to the fallback anchor's href
//               (LeadForm.tsx:399 as the file stood then; LeadForm.tsx:423 after
//               this delegate's comment-only header addition):
//                   -  href={whatsappLink(buildPrefill(m, values))}
//                   +  href={whatsappLink('')}
//
//               `npx vitest run components/sections/__tests__/LeadForm.test.tsx`:
//
//                 ❯ components/sections/__tests__/LeadForm.test.tsx (16 tests | 7 failed)
//                   × 8. the fallback href is built by whatsappLink(), prefilled …
//                   × 9. LAW 8 - the visitor's typed enquiry survives in the
//                     DECODED href: 503 (today: delivery_unavailable, env vars unset)
//                   × 9. … 500 (the server threw)
//                   × 9. … 422 (a 4xx: the server refused the body)
//                   × 9. … a rejected fetch (network down)
//                   × 9. … an abort (the destination a timeout lands in)
//                   × 12. the fallback href is DERIVED from the live values, so it
//                     cannot go stale
//
//                 Error: the fallback href carries no prefill for the visitor:
//                 https://wa.me/972503112243
//                  ❯ decodedPrefill components/sections/__tests__/LeadForm.test.tsx:513:11 (:567 in the file as it now stands)
//
//                  Test Files  1 failed (1)
//                       Tests  7 failed | 9 passed (16)
//
//               NINE tests stayed green, which is what makes the seven
//               informative rather than a broken harness. Restored from a
//               pre-edit copy and proved byte-identical:
//                 sha256 before edit   d5d7046a73f94ae5e432527734f789c5045f1627d783d2c0c297f2c0af6a78d3
//                 sha256 while broken  c903dd07c41f33b34ac80089f3f0fa7022e39c368840de17cbdf00add500911e
//                 sha256 after restore d5d7046a73f94ae5e432527734f789c5045f1627d783d2c0c297f2c0af6a78d3
//               ───────────────────────────────────────────────────────────────
//
//               ── THE THIRD RED PROOF (W9-F, tests 4 and 14), verbatim ───────
//               The first proof breaks the `ok` CHECK; the second breaks the
//               PREFILL. This one breaks the thing the honeypot actually rides
//               on: SERIALISATION. The field can render perfectly — hidden,
//               unlabelled, out of the tab order, every "the input is there"
//               assertion green — and still leave the route's guard completely
//               inert, because the route reads a JSON body and not the DOM.
//               Edit applied to LeadForm.tsx, deleting ONLY the posted key and
//               leaving the rendered input untouched:
//                   -      locale,
//                   -      [HONEYPOT_NAME]: honeypotRef.current?.value ?? '',
//                   +      locale,
//
//               `npx vitest run components/sections/__tests__/LeadForm.test.tsx`:
//
//                 FAIL  components/sections/__tests__/LeadForm.test.tsx > 4.
//                 res.ok true: the success message is shown exactly once, and the
//                 request is well formed
//                 AssertionError: expected { name: 'Dana Cohen', ... } to deeply
//                 equal { name: 'Dana Cohen', ... }
//                   {
//                     "email": "dana@example.org",
//                 -   "hp_ref": "",
//                     "locale": "he",
//
//                 FAIL  components/sections/__tests__/LeadForm.test.tsx > 14.
//                 LAW 8 - the honeypot reaches the NETWORK present and empty, and
//                 the real guard reads it as human
//                 AssertionError: LeadForm posted no hp_ref key, so the route
//                 guard is still inert and traps nothing.: expected false to be
//                 true // Object.is equality
//
//                 - Expected
//                 + Received
//                 - true
//                 + false
//
//                 Test Files  1 failed (1)
//                      Tests  3 failed | 16 passed (19)
//
//               The third failure in that run was test 15, and it was MY bug, not
//               the component's: it asserted that `.focus()` could not reach a
//               `display:none` control, which jsdom permits (see HONEST LIMIT 9).
//               It was corrected to assert the TAB ORDER — a thing jsdom can
//               actually see — and the run above is quoted as measured, including
//               that failure, rather than re-run after the fix to look tidier.
//               Restored from a pre-edit copy and proved byte-identical:
//                 sha256 before edit   4474bd4d0635ad0a87e524f904b4ff30b00d21b648583bb8a6621b543e69b071
//                 sha256 while broken  a9e80f97f412c3a501ace362cf2c4de535486c67634c4abdd72bec30a5fd5077
//                 sha256 after restore 4474bd4d0635ad0a87e524f904b4ff30b00d21b648583bb8a6621b543e69b071
//               ───────────────────────────────────────────────────────────────
//
//               ── THE FOURTH RED PROOF (W14-FIX1, tests 16 and 18), verbatim ─
//               The first proof breaks the `ok` CHECK; the second the PREFILL;
//               the third the SERIALISATION. This one breaks the half of the `ok`
//               check that the first proof could not see: an ok STATUS is not a
//               stored lead either. `app/api/lead`'s honeypot guard answers
//               `201 {"ok":true}` with NO id, having stored nothing — so any
//               autofill, password manager, translation tool or accessibility
//               extension that writes into the hidden `hp_ref` put a REAL visitor
//               on a success panel with their typed text cleared. Edit applied to
//               LeadForm.tsx, restoring the decision to the status line alone and
//               leaving every other line — the helper included — untouched:
//                   -      const storedId = ok ? await storedLeadId(response) : null;
//                   +      const storedId = ok ? 'x' : null;
//                   +      void storedLeadId;
//
//               `npx vitest run components/sections/__tests__/LeadForm.test.tsx`:
//
//                 ❯ components/sections/__tests__/LeadForm.test.tsx (32 tests | 11 failed)
//                   × 16. LAW 8 - an id-less 201 renders the FAILURE UX, and the
//                     visitor keeps every character they typed
//                   × 18. the decision, asserted on screen: no id key at all - the
//                     honeypot decoy, verbatim
//                   × 18. … an EMPTY id
//                   × 18. … an id of nothing but spaces
//                   × 18. … a NUMBER where the id should be
//                   × 18. … a null id
//                   × 18. … an id nested somewhere else in the body
//                   × 18. … a body that is an ARRAY, not an object
//                   × 18. … a body that is a bare string
//                   × 18. … a body that does not parse at all
//                   × 18. … a 2xx with no readable body at all
//
//                 AssertionError: LeadForm told the visitor the enquiry was sent
//                 after a 201 that carried NO id. The route stores nothing on that
//                 path and refuses to mint a decoy id precisely so this cannot
//                 happen.: expected <div …(2)>…(2)</div> to be null
//
//                 - Expected:
//                 null
//
//                 + Received:
//                 <div
//                   class="py-12 text-center"
//                   data-testid="form-success"
//                 >
//                   <h3 class="mb-2 text-xl font-bold text-white">
//                     SUCCESS-SENTINEL
//                   </h3>
//
//               TWENTY-ONE tests stayed green — including test 17, the honest
//               success path, and the last row of test 18 — which is what makes
//               the eleven informative rather than a broken harness. Restored from
//               a pre-edit copy and proved byte-identical:
//                 sha256 before edit   a1f0702eab6b95cad021c30e64560560d605932c0b891ebfd63140bebbf7ad38
//                 sha256 while broken  a21c228b140872534543b8f38d44c6dd2ab074eb9339cbd77d27de3b9b029235
//                 sha256 after restore a1f0702eab6b95cad021c30e64560560d605932c0b891ebfd63140bebbf7ad38
//               AFTER that cycle LeadForm.tsx received two COMMENT-ONLY
//               corrections — IMPOSSIBLE (b) and (h) still described the old
//               `ok === true` branch — so its current hash is
//               1ac444e985017761a1463dfa15cdc999fa419e190da5e7aef576adef558313f8
//               and not a1f0702e. No executable line changed between the two.
//               ───────────────────────────────────────────────────────────────
//
// W14-FIX1     THE FOUR ARRANGEMENTS THAT CHANGED, declared rather than slipped
//               in, and NO assertion touched. The component now reads the body of
//               an ok response, so four mocks that returned `{ ok: true, status }`
//               and nothing else were returning a response the real route never
//               sends. They now return what `created()` actually sends —
//               `{ ok: true, id }` — through `storedResponse()`: tests 4, 7, 10
//               and 14. That is a FAITHFULNESS fix to the fake, and it makes
//               those four STRONGER, not weaker: each now requires the server's
//               evidence of storage before it will accept a success panel. Every
//               `{ ok: false }` arrangement is untouched, every expectation in
//               those four tests is character-for-character what it was, and test
//               4's exhaustive seven-key `toEqual` over the POST body is
//               unchanged — the wire format did not move in this wave.
//
// W9-F         THE ONE EXISTING ASSERTION THAT CHANGED, named rather than
//               slipped in. Test 4's body check is an EXHAUSTIVE `toEqual` over
//               the posted JSON, so the moment LeadForm began sending `hp_ref`
//               that test went red — not because anything regressed, but because
//               the wire format gained a key by design. The expectation gained
//               `hp_ref: ''` and nothing else: it is still `toEqual`, still fails
//               on an extra key, a missing key or a wrong value, and now pins
//               seven keys where it pinned six. It was NOT relaxed to
//               `toMatchObject`, `expect.objectContaining`, or a subset check —
//               any of which would have made the test survive by ceasing to
//               describe the request. No other existing assertion was touched,
//               and no assertion anywhere in this file was removed or weakened.
//
// HONEST LIMIT  Eleven, stated plainly.
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
//   6. "NOT A LITERAL" IS PROVED ONLY UP TO EQUALITY — NARROWED, NOT CLOSED.
//      Test 8 asserts the fallback href equals `whatsappLink(prefill)`, so both
//      sides route through the same function and would agree even if it dropped
//      its argument. Tests 9-13 close THAT half: they decode the href off the DOM
//      with the platform URL parser and assert the visitor's literal characters
//      are recoverable, which no self-agreeing name can fake. What remains open
//      is only the reverse: a hand-built string that happened to encode
//      identically would still pass. The W7 repo-wide grep gate is what makes
//      inlining impossible, not any assertion in this file.
//   7. VISIBILITY IS ONLY PARTLY MEASURED. Test 9 asserts `toBeVisible()` on the
//      fallback anchor, which in jsdom catches the `hidden` attribute, inline
//      `display:none`/`visibility:hidden` and a hidden ancestor. It does NOT
//      catch class-driven hiding: no Tailwind stylesheet is loaded here, so a
//      utility class that computed to `display:none` — the `bg-gold` failure
//      shape — would go undetected. State: NOT-MEASURED for CSS-class hiding,
//      and it is the browser pass (W14-B) that owns it.
//   8. THE HEBREW SAMPLE IS FOUR LETTERS, NOT THE CATALOGUE. Test 13 builds its
//      Hebrew from `String.fromCodePoint` so this file stays pure ASCII. That
//      proves UTF-8 percent-encoding round-trips for the Hebrew block; it does
//      not prove anything about the real `messages/he.json` copy, which limit 1
//      already excludes, nor about RTL rendering, which limit 3 excludes.
//   9. THE HONEYPOT'S REAL-BROWSER BEHAVIOUR IS NOT MEASURED HERE, AND IT IS THE
//      half that carries the risk. Test 15 proves the field is `display:none` as
//      JSDOM COMPUTES IT, carries `tabindex="-1"`, `aria-hidden="true"` and
//      `autocomplete="off"`, is absent from every accessible query, and renders
//      no character of text. What NO test in this repo can observe:
//        · whether Chrome/Safari/Firefox autofill, or a password manager, or a
//          form-filling extension, actually leaves it alone. If one ever writes
//          into it, a REAL enquiry is discarded and the visitor is shown success
//          — see LeadForm.tsx HONEST LIMIT 8. `display:none` plus
//          `autocomplete="off"` plus a meaningless name is the standard
//          mitigation and it is not a proof;
//        · anything about PROGRAMMATIC focus. jsdom makes a `display:none`
//          element `document.activeElement` when `.focus()` is called on it,
//          where a real engine refuses. That is why test 15 asserts the TAB
//          ORDER — where the first Tab press actually lands — instead. Measured,
//          and it corrected an earlier version of that test;
//        · what a real screen reader announces. `display:none` removes the node
//          from the accessibility tree in every engine, and `aria-hidden` states
//          the intent, but this is jsdom's tree, not JAWS's or VoiceOver's.
//      OWNER: the browser pass, W14-B. It is the only place these can be seen.
//  10. NOTHING HERE PROVES THE TRAP CATCHES A BOT. This suite proves the field is
//      rendered, hidden, unreachable, and SERIALISED — that the guard in
//      `app/api/lead/route.ts` now receives the key it has always read. Whether
//      any real crawler fills it is a fact about traffic, not about code, and no
//      unit test can supply it. What the pair of suites does close is the inert
//      case: before this change the route's guard could not fire at all.
//  11. TWO SIBLING SUITES STILL ASSERT THE DEFECT THIS WAVE REMOVED, AND THEY ARE
//      OUTSIDE W14-FIX1'S WRITE-SET, SO THEY ARE NAMED HERE RATHER THAN FIXED.
//      `analytics-wiring.test.tsx` (the successful-submit funnel test, and the
//      throwing-tracker test that expects `form-success`) and
//      `analytics-unset.test.tsx` (the whole-funnel-reports-nothing test) each
//      mock `new Response('{}', { status: 200 })` — an id-less 2xx — and then
//      assert the success panel. That is precisely the response the route sends
//      when it has stored NOTHING, so those three assertions encode the lie. Each
//      needs its mocked body changed to the route's real one, which is most
//      simply written as
//      `new Response(JSON.stringify({ ok: true, id: STORED }), { status: 200 })`;
//      MEASURED green before this change and red after. Nothing was edited in
//      either file, and no assertion in THIS file was weakened to accommodate
//      them.
// ─────────────────────────────────────────────────────────────────────────────

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LeadForm } from '@/components/sections/LeadForm';
import { SECTION_IDS, WHATSAPP_BASE_URL, whatsappLink } from '@/config/site';
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

/**
 * THE HONEYPOT KEY, restated here as a LITERAL and deliberately not imported.
 *
 * Same reasoning as EXPECTED_PREFILL below: this is one half of a cross-delegate
 * contract, and a test that read the component's own constant would agree with it
 * no matter what it said. `app/api/lead/route.ts` spells this literal for itself,
 * `app/api/lead/__tests__/route.test.ts` spells it again, and this is the fourth
 * independent spelling. All four must agree or the trap catches nothing, and a
 * rename on either side turns tests 14 and 15 red instead of silently disarming
 * the guard while every "the input is there" assertion stays green.
 */
const HONEYPOT_FIELD = 'hp_ref';

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
 * Our own minimal response shape. Deliberately NOT the DOM `Response` type: a
 * real `Response` is not guaranteed to exist as a global in every jsdom build,
 * and constructing one would require a cast.
 *
 * W14-FIX1 added `json`, because the component no longer decides on the status
 * line alone — it reads the body for the route's stored-lead id. `json` is
 * OPTIONAL and that is load-bearing rather than lax: the component calls it only
 * on an ok response, so every `{ ok: false }` arrangement below is untouched by
 * this change, and an ok arrangement that omits `json` models a 2xx whose body
 * cannot be read at all. Test 18 uses exactly that, on purpose.
 */
type FakeResponse = { ok: boolean; status: number; json?: () => Promise<unknown> };

/**
 * A WELL-FORMED STORED-LEAD ID, spelled here as a literal and NOT imported from
 * `@/lib/leads/types`. Same reasoning as HONEYPOT_FIELD above: this is one half
 * of a contract carried on the wire, and a test that minted its id with the
 * server's own `newLeadId()` would agree with the server no matter what either
 * said. 26 Crockford Base32 characters, which is what `app/api/lead` puts in a
 * 201 — though note that the component deliberately does NOT require that shape
 * (LeadForm HONEST LIMIT 9), and test 18 pins that decision too.
 */
const STORED_ID = '01J0000000ABCDEFGHJKMNPQRS';

/**
 * THE ROUTE'S REAL SUCCESS RESPONSE: `Response.json({ ok: true, id }, 201)`.
 * Restated from `app/api/lead/route.ts`, not imported.
 */
function storedResponse(status = 201): FakeResponse {
  return { ok: true, status, json: async () => ({ ok: true, id: STORED_ID }) };
}

/** An ok response carrying an arbitrary body — the shapes test 18 walks. */
function okWithBody(body: unknown): FakeResponse {
  return { ok: true, status: 201, json: async () => body };
}
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
  // W14-FIX1. The arrangement gained a BODY: this is now the route's real 201,
  // `{ ok: true, id }`, because an ok STATUS alone is no longer success (see the
  // fourth RED proof). The assertions below are untouched.
  fetchMock.mockResolvedValue(storedResponse(200));
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
    // W9-F. This assertion is EXHAUSTIVE and stays exhaustive: `toEqual` still
    // fails on an extra key, a missing key or a wrong value, so the wire format
    // remains pinned to exactly these seven. The honeypot was ADDED to the
    // expectation, not excused from it — this line is the reason the suite is
    // still allowed to call the request "well formed" now that it carries one
    // more key. See the W9-F block in this file's header.
    [HONEYPOT_FIELD]: '',
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

  settle(storedResponse(200));
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

/* ── W9-D FAILURE UX ───────────────────────────────────────────────────────── */

/*
  WHY TESTS 9-13 EXIST ALONGSIDE TESTS 5, 6 AND 8.

  Test 8 above asserts `href === whatsappLink(EXPECTED_PREFILL)`. That reads the
  DOM, but BOTH sides of the equality are produced by the same `whatsappLink()`.
  If that function ever stopped carrying its argument, both sides would collapse
  to the same wrong value and the assertion would stay green while the visitor's
  typed enquiry silently vanished from the link. That is the `bg-gold` failure
  shape at the config layer: a NAME agreeing with itself instead of a computed
  effect being checked.

  Tests 9-13 close it. They take the `href` OFF THE RENDERED ANCHOR, hand it to
  the platform URL parser, and assert the visitor's literal typed characters are
  recoverable from the decoded `text` parameter. Nothing below mocks
  `whatsappLink`, inspects a mock's call arguments, or calls the component's own
  `buildPrefill`. A component that rendered no anchor, or an empty `href`, or a
  bare base URL, fails inside `fallbackHref`/`decodedPrefill` before any
  assertion is reached.
*/

/**
 * The rendered fallback anchor's `href`, read from the DOM. Throws rather than
 * returning an empty string, so "no link was rendered" and "the link was empty"
 * are both loud failures instead of a silently passing substring check.
 */
function fallbackHref(): string {
  const link = screen.getByTestId('form-fallback-whatsapp');
  const href = link.getAttribute('href');
  if (href === null || href.length === 0) {
    throw new Error('the failure fallback rendered no href for the visitor to tap');
  }
  return href;
}

/**
 * The DECODED prefill. `URL`/`URLSearchParams` are the platform's own decoder —
 * this file does not re-implement percent-decoding, and `encodeURIComponent`
 * emits `%20` for a space, so there is no `+`-versus-space ambiguity to resolve.
 */
function decodedPrefill(href: string): string {
  const text = new URL(href).searchParams.get('text');
  if (text === null) {
    throw new Error(`the fallback href carries no prefill for the visitor: ${href}`);
  }
  return text;
}

/** An abort/timeout-shaped rejection. See the note in test 9 about what this proves. */
function abortError(): Error {
  const error = new Error('The operation was aborted');
  error.name = 'AbortError';
  return error;
}

type FailureShape = {
  /** Part of the test name, so a red run says which shape broke. */
  readonly label: string;
  /** Arranges the mocked boundary. Never touches the component. */
  readonly arrange: () => void;
};

/**
 * Every way the enquiry can fail to reach Ravid. The 503 is TODAY'S PRODUCTION
 * STATE: three env vars are unset on the host, so the route answers
 * `delivery_unavailable` for every real visitor. The others are the shapes that
 * broke the customer's previous site.
 */
const FAILURE_SHAPES: readonly FailureShape[] = [
  {
    label: '503 (today: delivery_unavailable, env vars unset)',
    arrange: () => {
      fetchMock.mockResolvedValue({ ok: false, status: 503 });
    },
  },
  {
    label: '500 (the server threw)',
    arrange: () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500 });
    },
  },
  {
    label: '422 (a 4xx: the server refused the body)',
    arrange: () => {
      fetchMock.mockResolvedValue({ ok: false, status: 422 });
    },
  },
  {
    label: 'a rejected fetch (network down)',
    arrange: () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    },
  },
  {
    label: 'an abort (the destination a timeout lands in)',
    arrange: () => {
      fetchMock.mockRejectedValue(abortError());
    },
  },
];

for (const shape of FAILURE_SHAPES) {
  test(`9. LAW 8 - the visitor's typed enquiry survives in the DECODED href: ${shape.label}`, async () => {
    const user = userEvent.setup();
    shape.arrange();
    renderForm();

    await fillAll(user);
    await user.click(submitButton());

    await waitFor(() => {
      expect(screen.getByTestId('form-fallback')).toBeInTheDocument();
    });

    // Nothing was claimed. `fetch` never observed an ok response, so the user is
    // not told the enquiry was sent, in ANY of these five shapes.
    expect(screen.queryByTestId('form-success')).toBeNull();
    expect(screen.queryByText(M.formSuccess)).toBeNull();

    // ── The Law 8 assertion. Read off the DOM, decoded by the platform. ──────
    const href = fallbackHref();
    const prefill = decodedPrefill(href);

    // What Ravid needs in order to answer without asking again.
    expect(prefill).toContain(TYPED.name);
    expect(prefill).toContain(TYPED.phone);
    expect(prefill).toContain(TYPED.message);
    expect(prefill).toContain(TYPED.email);
    expect(prefill).toContain(TYPED.organization);

    // The labels come from the catalogue the component was handed, so the
    // message is a labelled summary in the visitor's own language and no
    // sentence was invented for it.
    expect(prefill).toContain(M.formName);
    expect(prefill).toContain(M.formPhone);

    // The prefill is multi-line, and the newlines made the round trip: a
    // percent-encoding that lost `%0A` would hand Ravid one run-on line.
    expect(prefill.split('\n').length).toBeGreaterThan(1);

    // The link goes where `config/site.ts` says, not where a literal in this
    // file says. No `wa.me` string is typed anywhere in this test file.
    expect(new URL(href).origin).toBe(new URL(WHATSAPP_BASE_URL).origin);
    expect(new URL(href).pathname).toBe(new URL(WHATSAPP_BASE_URL).pathname);
    expect(href.startsWith(WHATSAPP_BASE_URL)).toBe(true);

    // Reachable, not merely present. See HONEST LIMIT 7 for what jsdom can and
    // cannot tell us here.
    const link = screen.getByTestId('form-fallback-whatsapp');
    expect(link).toBeVisible();
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAccessibleName();

    // The form is still standing, still holding the visitor's answers, still
    // retryable — the fallback is an ADDITION to the funnel, not an exit from it.
    expect(submitButton()).toBeEnabled();
    expect(screen.getByLabelText(M.formName, { exact: false })).toHaveValue(TYPED.name);
  });
}

test('10. success: the prefilled fallback does not leak into the ok path', async () => {
  const user = userEvent.setup();
  fetchMock.mockResolvedValue(storedResponse(200));
  renderForm();

  await fillAll(user);
  await user.click(submitButton());

  await waitFor(() => {
    expect(screen.getByTestId('form-success')).toBeInTheDocument();
  });

  // Not one prefilled anchor anywhere in the tree — not the fallback block, and
  // not a stray second copy. A visitor who succeeded is never shown a recovery.
  expect(screen.queryAllByTestId('form-fallback-whatsapp')).toHaveLength(0);
  expect(screen.queryByTestId('form-fallback')).toBeNull();

  // The whole pre-submit region (form + standing direct block) is gone too, so
  // there is no unprefilled WhatsApp link competing with the success panel.
  expect(screen.queryAllByTestId('form-direct-whatsapp')).toHaveLength(0);
});

test('11. idle: the served page is unchanged - no prefilled link exists before a submit', () => {
  renderForm();

  // THE BLOCKED-VALUE GATE. With every human-blocked value unset (today's
  // state), the idle render must be exactly what it was: the standing direct
  // block with a BARE WhatsApp link, and no failure fallback of any kind.
  expect(screen.queryByTestId('form-fallback')).toBeNull();
  expect(screen.queryAllByTestId('form-fallback-whatsapp')).toHaveLength(0);
  expect(screen.queryByTestId('form-invalid')).toBeNull();
  expect(screen.queryByTestId('form-success')).toBeNull();

  // The live region is mounted (so it can announce later) but says nothing yet.
  const status = screen.getByTestId('form-status');
  expect(status).toBeEmptyDOMElement();
  expect(status).toHaveAttribute('aria-busy', 'false');

  // The standing link is the BARE base: no `?text=` is attached before the
  // visitor has typed anything, and it is built from the config constant.
  const standing = screen.getByTestId('form-direct-whatsapp');
  const href = standing.getAttribute('href');
  if (href === null) throw new Error('the standing direct-contact link rendered no href');
  expect(href).toBe(WHATSAPP_BASE_URL);
  expect(href).toBe(whatsappLink());
  expect(new URL(href).searchParams.get('text')).toBeNull();
});

test('12. the fallback href is DERIVED from the live values, so it cannot go stale', async () => {
  const user = userEvent.setup();
  fetchMock.mockResolvedValue({ ok: false, status: 503 });
  renderForm();

  await fillAll(user);
  await user.click(submitButton());

  await waitFor(() => {
    expect(screen.getByTestId('form-fallback')).toBeInTheDocument();
  });

  expect(decodedPrefill(fallbackHref())).toContain(TYPED.name);

  // The visitor corrects a typo AFTER the failure. A snapshot taken at submit
  // time would send Ravid the old value; a derived href sends the new one.
  const CORRECTED = 'Dana Corrected-Cohen';
  const nameInput = screen.getByLabelText(M.formName, { exact: false });
  await user.clear(nameInput);
  await user.type(nameInput, CORRECTED);

  const prefill = decodedPrefill(fallbackHref());
  expect(prefill).toContain(CORRECTED);
  expect(prefill).toContain(TYPED.phone);
});

/**
 * A Hebrew word, built from CODE POINTS rather than typed. This file may not
 * contain a Hebrew codepoint (the W7 gate greps for them and the rule is
 * deliberately strict), but the encoding still has to be proved for the language
 * almost every real visitor will type in. `String.fromCodePoint` keeps the file
 * bytes pure ASCII while producing the exact characters a visitor would enter.
 *
 * U+05E9 U+05DC U+05D5 U+05DD — four letters from the Hebrew block.
 */
const HEBREW_SAMPLE = String.fromCodePoint(0x05e9, 0x05dc, 0x05d5, 0x05dd);

test('13. the prefill round-trips non-ASCII (Hebrew block) and newlines intact', async () => {
  const user = userEvent.setup();
  fetchMock.mockResolvedValue({ ok: false, status: 503 });
  renderForm();

  // Two Hebrew-bearing fields plus a multi-line message: the three things
  // `encodeURIComponent` has to get right for a real enquiry to survive.
  const multiline = `${HEBREW_SAMPLE} line one\nline two`;
  await user.type(screen.getByLabelText(M.formName, { exact: false }), HEBREW_SAMPLE);
  await user.type(screen.getByLabelText(M.formPhone, { exact: false }), TYPED.phone);
  await user.type(screen.getByLabelText(M.formMessage, { exact: false }), multiline);
  await user.click(submitButton());

  await waitFor(() => {
    expect(screen.getByTestId('form-fallback')).toBeInTheDocument();
  });

  const href = fallbackHref();

  // The href on the wire is pure ASCII percent-encoding — a raw Hebrew byte in
  // an attribute would be a differently-broken link on some clients.
  expect(/^[\x00-\x7F]*$/.test(href)).toBe(true);
  expect(href).toContain('%D7%A9');

  // ...and it decodes back to exactly what the visitor typed, newline included.
  const prefill = decodedPrefill(href);
  expect(prefill).toContain(HEBREW_SAMPLE);
  expect(prefill).toContain(multiline);
  expect(prefill).toContain(TYPED.phone);

  // Empty optional fields are omitted, not sent as bare dangling labels.
  expect(prefill).not.toContain(`${M.formEmail}:`);
  expect(prefill).not.toContain(`${M.formOrg}:`);
});

/* ── W9-F THE HONEYPOT ─────────────────────────────────────────────────────── */

/*
  WHY TESTS 14 AND 15 ARE SHAPED THE WAY THEY ARE.

  The tempting test is `expect(container.querySelector('input[name="hp_ref"]'))
  .not.toBeNull()`. It is worth nothing. The route does not read the DOM; it reads
  a JSON body, and an input that renders but is never serialised leaves the guard
  exactly as inert as it was before this field existed — while that assertion
  stays green forever. A NAME IS NOT A THING. So test 14 reads the body the mocked
  boundary actually received and asks the question the route asks.

  The second trap is the `bg-gold` shape. If the field were hidden by a utility
  class, jsdom — which loads no stylesheet — could not tell a working `sr-only`
  from one that resolves to nothing, and the failure would be an unlabelled
  `hp_ref` box sitting at the top of the booking form with a green suite. The
  component therefore hides it with an INLINE style, which jsdom does resolve, so
  test 15 MEASURES the hiding instead of asserting a class name.
*/

/**
 * One key of the JSON body the mocked boundary ACTUALLY received, as a pair that
 * distinguishes ABSENT from PRESENT-BUT-EMPTY.
 *
 * The route treats those two the same — both are untrapped — but this suite must
 * be able to tell them apart, or deleting the key from the POST body would leave
 * test 14 green while the guard went permanently inert. That distinction is the
 * entire content of the third RED proof in this file's header.
 */
function sentField(key: string): { readonly present: boolean; readonly value: unknown } {
  const call = fetchMock.mock.calls[0];
  if (call === undefined) throw new Error('expected exactly one fetch call');
  const [, init] = call;
  const parsed: unknown = JSON.parse(init?.body ?? '{}');
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('the POST body the component sent was not a JSON object');
  }
  for (const [name, value] of Object.entries(parsed)) {
    if (name === key) return { present: true, value };
  }
  return { present: false, value: undefined };
}

/**
 * The route's trap rule, RESTATED from `app/api/lead/route.ts` rather than
 * imported: `typeof value === 'string' && value.trim() !== ''`. Restating it is
 * the point — this asserts that what LeadForm puts on the wire is a value the
 * real guard reads as HUMAN, not merely that some string was sent.
 */
function routeWouldTrap(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '';
}

/** The honeypot input, read off the rendered DOM. Throws rather than returning null. */
function honeypotInput(container: HTMLElement): HTMLElement {
  const field = container.querySelector(`input[name="${HONEYPOT_FIELD}"]`);
  if (field === null || !(field instanceof HTMLElement)) {
    throw new Error(
      'LeadForm rendered no honeypot input, so the route guard catches nothing (it is SAFE, and inert)',
    );
  }
  return field;
}

test('14. LAW 8 - the honeypot reaches the NETWORK present and empty, and the real guard reads it as human', async () => {
  const user = userEvent.setup();
  fetchMock.mockResolvedValue(storedResponse());
  renderForm();

  await fillAll(user);
  await user.click(submitButton());

  await waitFor(() => {
    expect(screen.getByTestId('form-success')).toBeInTheDocument();
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);

  // Not "an input named hp_ref exists". This is the body the boundary received.
  const sent = sentField(HONEYPOT_FIELD);

  // PRESENT: the guard is no longer inert. An ABSENT key is untrapped too, so a
  // form that omits it is safe and catches nothing — which was the state before.
  expect(
    sent.present,
    'LeadForm posted no hp_ref key, so the route guard is still inert and traps nothing.',
  ).toBe(true);

  // EMPTY: and therefore read as a HUMAN by the rule the route actually applies.
  expect(sent.value).toBe('');
  expect(typeof sent.value).toBe('string');
  expect(
    routeWouldTrap(sent.value),
    'LeadForm sent a honeypot value the route would discard - a real enquiry would be thrown away while the visitor was shown success.',
  ).toBe(false);

  // Asserted together on purpose: the visitor was shown the success panel, and
  // the value that travelled with that submit is one the route stores rather
  // than silently drops. Those two facts failing apart is HONEST LIMIT 8.
  expect(screen.getByTestId('form-success')).toBeInTheDocument();
});

test('15. the honeypot is invisible to eyes, to the keyboard and to the accessibility tree', async () => {
  const user = userEvent.setup();
  const { container } = renderForm();
  const field = honeypotInput(container);

  const wrapper = field.parentElement;
  if (wrapper === null) throw new Error('the honeypot input has no wrapper to hide it');

  // ── HIDDEN, MEASURED. Not `expect(field).toHaveClass('sr-only')`, which would
  // be a name agreeing with itself: jsdom loads no stylesheet, so a class that
  // resolved to nothing would pass. An INLINE style is one jsdom computes. ─────
  expect(window.getComputedStyle(wrapper).display).toBe('none');
  expect(field).not.toBeVisible();

  // ── NOT REACHABLE BY KEYBOARD, asserted as the TAB ORDER rather than as a
  // call to `.focus()`. MEASURED, and it corrected this test: jsdom will happily
  // make a `display:none` element `document.activeElement` when `.focus()` is
  // called on it, and `tabindex="-1"` means "out of the tab sequence, still
  // programmatically focusable" by spec — so `.focus()` succeeding proves
  // nothing either way, and asserting on it was measuring the wrong thing.
  //
  // What matters to the visitor is where the FIRST Tab press goes. The honeypot
  // renders first inside the <form>, so if it were in the tab order it would be
  // the first thing a keyboard user landed in — and anything they typed there
  // would discard their enquiry while showing them success (HONEST LIMIT 8).
  expect(field).toHaveAttribute('tabindex', '-1');
  await user.tab();
  const firstStop = document.activeElement;
  expect(firstStop).not.toBe(field);
  expect(firstStop).toBe(screen.getByLabelText(M.formName, { exact: false }));

  // ── NOT IN THE ACCESSIBILITY TREE. The attribute the contract names, and then
  // the effect: no accessible query reaches it, and the five REAL controls are
  // still exactly five and still all named. ──────────────────────────────────
  expect(field).toHaveAttribute('aria-hidden', 'true');
  const textboxes = screen.getAllByRole('textbox');
  expect(textboxes).toHaveLength(5);
  expect(textboxes).not.toContain(field);
  for (const box of textboxes) expect(box).toHaveAccessibleName();

  // ── NO USER-FACING TEXT OF ANY KIND. No label was added, no copy, no
  // catalogue key: the hidden subtree renders not one character. ─────────────
  expect(wrapper.textContent).toBe('');
  expect(field).not.toHaveAccessibleName();

  // ── AUTOFILL SUPPRESSION, as the cross-delegate contract requires. What this
  // cannot prove is what a real browser or password manager DOES with it — that
  // is HONEST LIMIT 9 and the browser pass (W14-B) owns it. ──────────────────
  expect(field).toHaveAttribute('autocomplete', 'off');
  expect(field).toHaveAttribute('type', 'text');

  // Idle is still idle: adding the trap announced nothing and claimed nothing.
  expect(screen.getByTestId('form-status')).toBeEmptyDOMElement();
});

/* ── W14-FIX1 · AN OK STATUS IS NOT A STORED LEAD ──────────────────────────── */

/*
  WHY TESTS 16-18 EXIST ALONGSIDE TESTS 4, 5 AND 14.

  Test 5 proves a NON-ok response cannot reach 'sent'. It leaves the other half
  wide open, and that half is the live one: `app/api/lead`'s honeypot guard
  answers `201 {"ok":true}` — ok, success-shaped, and deliberately WITHOUT an id
  — having stored NOTHING. Any browser autofill, password manager, translation
  tool or accessibility extension that writes into the hidden `hp_ref` puts a
  REAL visitor on that path. Deciding on `response.ok` alone therefore rendered
  the success panel and cleared the form for an enquiry that does not exist:
  Defect 2 wearing a 2xx, and every assertion in this file stayed green.

  These three tests are the computed EFFECT, never the identifier. Nothing below
  asserts "the component checks for an id", inspects `storedLeadId`, counts a
  branch or reads a mock's call arguments. They arrange the exact body the route
  sends, and then read the SCREEN: which panel is mounted, what the five controls
  still hold, and what the WhatsApp href decodes to. A component that checked the
  id and then showed success anyway fails them.
*/

/** The honeypot decoy's body, verbatim from `trapped()` in app/api/lead/route.ts. */
const TRAPPED_BODY: unknown = { ok: true };

test('16. LAW 8 - an id-less 201 renders the FAILURE UX, and the visitor keeps every character they typed', async () => {
  const user = userEvent.setup();
  fetchMock.mockResolvedValue(okWithBody(TRAPPED_BODY));
  renderForm();

  await fillAll(user);
  await user.click(submitButton());

  // Settle on the OUTCOME, not on a particular one: the live region gains
  // content in both the 'sent' and the 'failed' state, so this waits either way
  // and the assertions below are what decide the verdict.
  await waitFor(() => {
    expect(screen.getByTestId('form-status')).not.toBeEmptyDOMElement();
  });

  // ── WHAT IS ON SCREEN, half one: the success panel is NOT. ────────────────
  expect(
    screen.queryByTestId('form-success'),
    'LeadForm told the visitor the enquiry was sent after a 201 that carried NO id. The route stores nothing on that path and refuses to mint a decoy id precisely so this cannot happen.',
  ).toBeNull();
  expect(screen.queryByText(M.formSuccess)).toBeNull();
  expect(screen.queryByText(M.formSuccessDesc)).toBeNull();

  // ── WHAT IS ON SCREEN, half two: the SAME failure UX the other five shapes
  // reach — announced in the same one live region, not a sixth thing. ────────
  const status = screen.getByTestId('form-status');
  const fallback = screen.getByTestId('form-fallback');
  expect(fallback).toBeInTheDocument();
  expect(fallback.parentElement).toBe(status);
  expect(status).toHaveTextContent(M.formDirect);

  // ── THE TYPED TEXT SURVIVES, in the form. `setValues(EMPTY)` must not have
  // run: all five controls still hold what the visitor entered, and the form is
  // still submittable, so nothing they wrote was taken from them. ────────────
  expect(screen.getByLabelText(M.formName, { exact: false })).toHaveValue(TYPED.name);
  expect(screen.getByLabelText(M.formPhone, { exact: false })).toHaveValue(TYPED.phone);
  expect(screen.getByLabelText(M.formEmail, { exact: false })).toHaveValue(TYPED.email);
  expect(screen.getByLabelText(M.formOrg, { exact: false })).toHaveValue(TYPED.organization);
  expect(screen.getByLabelText(M.formMessage, { exact: false })).toHaveValue(TYPED.message);
  expect(submitButton()).toBeEnabled();

  // ── ...and in the link that now carries it to the same brother, read OFF THE
  // DOM and decoded by the platform, exactly as tests 9-13 do. ───────────────
  const prefill = decodedPrefill(fallbackHref());
  expect(prefill).toContain(TYPED.name);
  expect(prefill).toContain(TYPED.phone);
  expect(prefill).toContain(TYPED.email);
  expect(prefill).toContain(TYPED.organization);
  expect(prefill).toContain(TYPED.message);
  expect(prefill).toContain(M.formName);
  expect(prefill.split('\n').length).toBeGreaterThan(1);

  const link = screen.getByTestId('form-fallback-whatsapp');
  expect(link).toBeVisible();
  expect(link).toHaveAccessibleName();
  expect(link.getAttribute('href')?.startsWith(WHATSAPP_BASE_URL)).toBe(true);

  // One request was made, and it is not retried behind the visitor's back.
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('17. a 201 carrying a well-formed id: the honest success path still renders, exactly once', async () => {
  const user = userEvent.setup();
  fetchMock.mockResolvedValue(storedResponse());
  renderForm();

  await fillAll(user);
  await user.click(submitButton());

  await waitFor(() => {
    expect(screen.getByTestId('form-success')).toBeInTheDocument();
  });

  // Exactly once — the tightened check did not cost the path it was meant to
  // keep, and it did not render success twice on the way through.
  expect(screen.getAllByTestId('form-success')).toHaveLength(1);
  expect(screen.getAllByText(M.formSuccess)).toHaveLength(1);
  expect(screen.getByText(M.formSuccessDesc)).toBeInTheDocument();

  // Nothing failed, so no recovery is offered and the form is gone.
  expect(screen.queryByTestId('form-fallback')).toBeNull();
  expect(screen.queryAllByTestId('form-fallback-whatsapp')).toHaveLength(0);
  expect(screen.queryAllByTestId('form-direct-whatsapp')).toHaveLength(0);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

/**
 * THE DECISION, WRITTEN DOWN: which 2xx bodies are evidence that a record was
 * stored, and which are not. `storedLead: true` means the success panel must
 * render; `false` means the failure UX must, with the visitor's text intact.
 *
 * The last row is the one that is a JUDGEMENT rather than a deduction. An id of
 * `'x'` is present and non-blank but is not a 26-character Crockford ULID, and
 * this suite pins it as SUCCESS — because the component checks the route's
 * published contract ("an id in a 2xx means a stored record") and deliberately
 * not the id's alphabet, which is a storage detail it has no stake in and could
 * not follow through a format change without silently failing every honest
 * success. See LeadForm HONEST LIMIT 9 for the two reasons and for what it
 * costs. A delegate that decides the other way must change THIS ROW, in the
 * open, rather than quietly tightening a regex.
 */
type BodyShape = {
  readonly label: string;
  readonly response: FakeResponse;
  readonly storedLead: boolean;
};

const BODY_SHAPES: readonly BodyShape[] = [
  {
    label: 'no id key at all - the honeypot decoy, verbatim',
    response: okWithBody({ ok: true }),
    storedLead: false,
  },
  {
    label: 'an EMPTY id',
    response: okWithBody({ ok: true, id: '' }),
    storedLead: false,
  },
  {
    label: 'an id of nothing but spaces',
    response: okWithBody({ ok: true, id: '   ' }),
    storedLead: false,
  },
  {
    label: 'a NUMBER where the id should be',
    response: okWithBody({ ok: true, id: 42 }),
    storedLead: false,
  },
  {
    label: 'a null id',
    response: okWithBody({ ok: true, id: null }),
    storedLead: false,
  },
  {
    label: 'an id nested somewhere else in the body',
    response: okWithBody({ ok: true, lead: { id: STORED_ID } }),
    storedLead: false,
  },
  {
    label: 'a body that is an ARRAY, not an object',
    response: okWithBody([{ id: STORED_ID }]),
    storedLead: false,
  },
  {
    label: 'a body that is a bare string',
    response: okWithBody('ok'),
    storedLead: false,
  },
  {
    label: 'a body that does not parse at all',
    response: {
      ok: true,
      status: 201,
      json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
    },
    storedLead: false,
  },
  {
    label: 'a 2xx with no readable body at all',
    response: { ok: true, status: 201 },
    storedLead: false,
  },
  {
    label: 'a MALFORMED-BUT-PRESENT id, not a ULID - DECIDED: this IS success',
    response: okWithBody({ ok: true, id: 'x' }),
    storedLead: true,
  },
];

for (const shape of BODY_SHAPES) {
  test(`18. the decision, asserted on screen: ${shape.label}`, async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(shape.response);
    renderForm();

    await fillAll(user);
    await user.click(submitButton());

    await waitFor(() => {
      expect(screen.getByTestId('form-status')).not.toBeEmptyDOMElement();
    });

    if (shape.storedLead) {
      expect(screen.getByTestId('form-success')).toBeInTheDocument();
      expect(screen.getAllByTestId('form-success')).toHaveLength(1);
      expect(screen.queryByTestId('form-fallback')).toBeNull();
      return;
    }

    expect(
      screen.queryByTestId('form-success'),
      'LeadForm told the visitor the enquiry was sent for a 2xx that carried no usable stored-lead id.',
    ).toBeNull();
    expect(screen.getByTestId('form-fallback')).toBeInTheDocument();

    // The failure UX is worth nothing if it arrives empty: the visitor's text is
    // still in the form AND still in the link.
    expect(screen.getByLabelText(M.formName, { exact: false })).toHaveValue(TYPED.name);
    expect(screen.getByLabelText(M.formMessage, { exact: false })).toHaveValue(TYPED.message);
    expect(decodedPrefill(fallbackHref())).toContain(TYPED.name);
    expect(submitButton()).toBeEnabled();
  });
}
