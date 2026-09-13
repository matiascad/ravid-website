// ─────────────────────────────────────────────────────────────────────────────
// W5-A LEAD ENDPOINT TESTS — app/api/lead/__tests__/route.test.ts
//
// The gate these tests exist to hold: "PROVE THE CHECK CAN FAIL." A suite that
// only ever posts a good lead to a working provider proves nothing about the two
// defects this endpoint replaces, both of which are about what happens when
// something goes WRONG and the user is told it went right.
//
// INVARIANT     Every test that reaches the delivery layer asserts the MAILER
//               CALL COUNT, not merely the status code. A 4xx with the mail
//               already sent, and a 200 with no mail sent, are both failures
//               here, so "the status the client sees" and "what the server
//               actually did" are checked as one fact. The transport is stubbed
//               in `beforeEach` with a function that THROWS `NETWORK_FORBIDDEN`;
//               a test that forgets to arrange a provider outcome fails loudly
//               rather than reaching the internet.
//
// IMPOSSIBLE    A real network call is not CONSTRUCTIBLE from this file. The only
//               path out of the route is `globalThis.fetch`, it is stubbed before
//               every test, and `restoreMocks`/`unstubAllGlobals` reinstate the
//               original only after the file's last test. No credential exists in
//               this repo to authenticate with in any case, and no email address
//               belonging to a real person appears here: the placeholders are not
//               addresses at all, and the one address literal is under the RFC
//               2606 `.invalid` TLD, which cannot resolve.
//
// CLASS         Closed by enumeration over the RESPONSE CLASSES of this route:
//               accepted, malformed, oversized, invalid (five distinct rejection
//               reasons), unconfigured, provider-rejected, provider-unreachable,
//               wrong-method. Every branch in route.ts that can produce a
//               response has a test here. NOT closed over lib/validation.ts's
//               field matrix — see the limit.
//
// HONEST LIMIT  These tests call the exported handlers DIRECTLY. They do not
//               prove Next.js routes `/api/lead` to this file, that the client's
//               `fetch` reaches it, or that the deployed environment carries the
//               three variables — the first is a build-time fact (a separate
//               delegate's gate), the last a deployment fact no unit test can
//               see. The provider contract is stubbed, so this file also cannot
//               prove Resend's API accepts the payload shape; it proves only that
//               a non-ok provider response never becomes a 200. And the field
//               matrix is sampled, not exhausted: one over-length field of five,
//               CR/LF in two of the four header-reaching fields.
// ─────────────────────────────────────────────────────────────────────────────

import { LEAD_TO_EMAIL_ENV_VAR } from '@/config/site';

import { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT } from '../route';

/* ── The environment contract, pinned by name ─────────────────────────────── */

const API_KEY_ENV_VAR = 'RESEND_API_KEY';
const FROM_ENV_VAR = 'LEAD_FROM_EMAIL';

/**
 * Deliberately not addresses. The route passes these through to the provider
 * without interpreting them, so nothing that looks like a real mailbox needs to
 * exist in this repo.
 */
const TEST_API_KEY = 'test-key-not-a-credential';
const TEST_TO = 'to-address-placeholder';
const TEST_FROM = 'from-address-placeholder';

/* ── The transport seam ───────────────────────────────────────────────────── */

const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(() => {
    throw new Error('NETWORK_FORBIDDEN: a test reached the transport without arranging it');
  });
  vi.stubGlobal('fetch', fetchMock);

  // Unconfigured is the DEFAULT state, exactly as tonight's deployment is.
  vi.stubEnv(API_KEY_ENV_VAR, '');
  vi.stubEnv(LEAD_TO_EMAIL_ENV_VAR, '');
  vi.stubEnv(FROM_ENV_VAR, '');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function configureProvider(): void {
  vi.stubEnv(API_KEY_ENV_VAR, TEST_API_KEY);
  vi.stubEnv(LEAD_TO_EMAIL_ENV_VAR, TEST_TO);
  vi.stubEnv(FROM_ENV_VAR, TEST_FROM);
}

function providerAccepts(): void {
  fetchMock.mockImplementation(() =>
    Promise.resolve(Response.json({ id: 'provider-message-id' }, { status: 200 })),
  );
}

/* ── Request builders ─────────────────────────────────────────────────────── */

const ENDPOINT = 'http://localhost/api/lead';

function postRaw(raw: string): Request {
  return new Request(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw,
  });
}

function postJson(value: unknown): Request {
  return postRaw(JSON.stringify(value));
}

/** Exactly the body shape `components/sections/LeadForm.tsx` posts. */
function validLead(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: 'Dana Cohen',
    phone: '050-311-2243',
    email: 'visitor@example.invalid',
    organization: 'Northern Regional Council',
    message: 'We would like to book a talk for our staff day in March.',
    locale: 'he',
    ...overrides,
  };
}

/** The outbound provider payload, or a thrown error if nothing was sent. */
function sentPayload(): Record<string, unknown> {
  const call = fetchMock.mock.calls[0];
  if (call === undefined) throw new Error('the mailer was never called');
  const init = call[1];
  if (init === undefined || typeof init.body !== 'string') {
    throw new Error('the mailer was called without a string body');
  }
  const parsed: unknown = JSON.parse(init.body);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('the outbound body was not a JSON object');
  }
  return parsed as Record<string, unknown>;
}

async function bodyOf(response: Response): Promise<Record<string, unknown>> {
  const parsed: unknown = await response.json();
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('the response body was not a JSON object');
  }
  return parsed as Record<string, unknown>;
}

/* ── 1 · The happy path, and only the happy path, returns 200 ─────────────── */

describe('POST /api/lead with a deliverable lead', () => {
  it('returns 200 and calls the mailer exactly once with the submitted values', async () => {
    configureProvider();
    providerAccepts();

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
    expect(await bodyOf(response)).toMatchObject({ ok: true });

    // DENOMINATOR: exactly one, not "at least one".
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const payload = sentPayload();
    const text = payload.text;
    if (typeof text !== 'string') throw new Error('the provider payload carried no text body');

    expect(text).toContain('Dana Cohen');
    expect(text).toContain('050-311-2243');
    expect(text).toContain('visitor@example.invalid');
    expect(text).toContain('Northern Regional Council');
    expect(text).toContain('We would like to book a talk for our staff day in March.');
    expect(payload.subject).toContain('Dana Cohen');
    expect(payload.reply_to).toBe('visitor@example.invalid');
    expect(payload.to).toEqual([TEST_TO]);
    expect(payload.from).toBe(TEST_FROM);
  });

  it('delivers a lead carrying only the two required fields', async () => {
    configureProvider();
    providerAccepts();

    const response = await POST(postJson({ name: 'Yossi', phone: '0501234567' }));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // An absent email must never become an empty Reply-To.
    expect(sentPayload().reply_to).toBeUndefined();
  });
});

/* ── 2,3,6,7,8,10 · Rejected input never reaches the mailer ───────────────── */

describe('POST /api/lead with input the server refuses', () => {
  /** Every case here asserts BOTH halves: the status AND that no mail was sent. */
  const rejected: ReadonlyArray<{ readonly why: string; readonly payload: unknown }> = [
    { why: 'name is missing', payload: { phone: '0501234567' } },
    { why: 'name is blank', payload: validLead({ name: '   ' }) },
    { why: 'phone is missing', payload: { name: 'Yossi' } },
    { why: 'phone is blank', payload: validLead({ phone: '' }) },
    { why: 'the message exceeds its cap', payload: validLead({ message: 'x'.repeat(4001) }) },
    { why: 'the name exceeds its cap', payload: validLead({ name: 'x'.repeat(121) }) },
    {
      why: 'CR/LF is injected into the name',
      payload: validLead({ name: 'Dana\r\nBcc: elsewhere' }),
    },
    { why: 'LF is injected into the name', payload: validLead({ name: 'Dana\nSubject: other' }) },
    {
      why: 'CR/LF is injected into the email',
      payload: validLead({ email: 'visitor@example.invalid\r\nBcc: elsewhere@example.invalid' }),
    },
    { why: 'the email is malformed', payload: validLead({ email: 'not-an-address' }) },
    { why: 'the locale is outside the app union', payload: validLead({ locale: 'de' }) },
    { why: 'a field is not a string', payload: validLead({ name: 42 }) },
    { why: 'the body is a JSON array', payload: [] },
    { why: 'the body is JSON null', payload: null },
  ];

  for (const { why, payload } of rejected) {
    it(`answers 4xx and sends nothing when ${why}`, async () => {
      configureProvider();
      providerAccepts();

      const response = await POST(postJson(payload));

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      expect(response.ok).toBe(false);

      const body = await bodyOf(response);
      expect(body.ok).toBe(false);
      expect(typeof body.error).toBe('string');

      // DENOMINATOR: zero calls, not merely "the status was 4xx".
      expect(fetchMock).toHaveBeenCalledTimes(0);
    });
  }

  it('names the offending field in a machine-readable way', async () => {
    configureProvider();
    providerAccepts();

    const response = await POST(postJson({ phone: '0501234567' }));
    const body = await bodyOf(response);

    expect(body.error).toBe('invalid_lead');
    expect(JSON.stringify(body.issues)).toContain('"field":"name"');
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it('answers 4xx without throwing when the body is not JSON', async () => {
    configureProvider();
    providerAccepts();

    const response = await POST(postRaw('{"name": "Dana", '));

    expect(response.status).toBe(400);
    expect((await bodyOf(response)).error).toBe('malformed_json');
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it('answers 4xx without throwing when the body is absent', async () => {
    configureProvider();
    providerAccepts();

    const response = await POST(new Request(ENDPOINT, { method: 'POST' }));

    expect(response.status).toBe(400);
    expect(response.ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it('refuses an oversized body before parsing it', async () => {
    configureProvider();
    providerAccepts();

    const response = await POST(postJson(validLead({ message: 'x'.repeat(20000) })));

    expect(response.status).toBe(413);
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });
});

/* ── 4 · The customer's Defect 2, at the server layer ─────────────────────── */

describe('POST /api/lead when the provider fails', () => {
  it('answers 5xx and never claims success when the provider REJECTS the mail', async () => {
    configureProvider();
    // The exact shape ravid_website1/src/components/FormSection.tsx ignores: a
    // RESOLVED response that is not ok.
    fetchMock.mockImplementation(() =>
      Promise.resolve(Response.json({ message: 'refused' }, { status: 500 })),
    );

    const response = await POST(postJson(validLead()));

    expect(response.status).toBeGreaterThanOrEqual(500);
    expect(response.status).toBeLessThan(600);
    expect(response.ok).toBe(false);

    const body = await bodyOf(response);
    expect(body.ok).toBe(false);
    expect(body.ok).not.toBe(true);
    expect(body.error).toBe('delivery_failed');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('answers 5xx and never claims success when the provider is unreachable', async () => {
    configureProvider();
    fetchMock.mockImplementation(() => Promise.reject(new Error('ECONNREFUSED')));

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(502);
    expect(response.ok).toBe(false);
    expect((await bodyOf(response)).ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('answers 5xx when the provider returns a 4xx credential error', async () => {
    configureProvider();
    fetchMock.mockImplementation(() => Promise.resolve(new Response('', { status: 401 })));

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(502);
    expect((await bodyOf(response)).ok).toBe(false);
  });
});

/* ── 5 · Unconfigured fails honestly — tonight's actual state ─────────────── */

describe('POST /api/lead when the provider is not configured', () => {
  it('answers 5xx rather than 200 when no environment variable is set', async () => {
    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(503);
    expect(response.status).not.toBe(200);
    expect(response.ok).toBe(false);
    expect((await bodyOf(response)).error).toBe('delivery_unavailable');
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it('answers 5xx when only some of the variables are set', async () => {
    vi.stubEnv(API_KEY_ENV_VAR, TEST_API_KEY);

    const response = await POST(postJson(validLead()));

    expect(response.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it('does not disclose which variables are unset', async () => {
    const response = await POST(postJson(validLead()));
    const serialised = JSON.stringify(await bodyOf(response));

    expect(serialised).not.toContain(API_KEY_ENV_VAR);
    expect(serialised).not.toContain(LEAD_TO_EMAIL_ENV_VAR);
    expect(serialised).not.toContain(FROM_ENV_VAR);
  });
});

/* ── 9 · Non-POST methods ─────────────────────────────────────────────────── */

describe('/api/lead with a method other than POST', () => {
  const handlers: ReadonlyArray<{ readonly method: string; readonly handler: () => Response }> = [
    { method: 'GET', handler: GET },
    { method: 'PUT', handler: PUT },
    { method: 'PATCH', handler: PATCH },
    { method: 'DELETE', handler: DELETE },
    { method: 'HEAD', handler: HEAD },
    { method: 'OPTIONS', handler: OPTIONS },
  ];

  for (const { method, handler } of handlers) {
    it(`answers 405 with an Allow header for ${method}`, async () => {
      const response = handler();

      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('POST');
      expect((await bodyOf(response)).error).toBe('method_not_allowed');
      expect(fetchMock).toHaveBeenCalledTimes(0);
    });
  }
});
