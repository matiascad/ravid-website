// ─────────────────────────────────────────────────────────────────────────────
// W16-B PROOF — app/api/admin/leads/__tests__/route.test.ts
//
// WHAT THIS FILE REFUSES TO DO, because the project has been burned by it:
// it does not assert that a route "checks the token", and it does not assert that
// a counter function "was called". Both are assertions about NAMES. `tsc`, ESLint,
// 261 tests and five gates were all green on this repository while the booking
// button was invisible, because everything asserted was an identifier.
//
// So every test below drives the REAL exported handler and asserts the REAL
// status number and the REAL body bytes that came back out of it — `toBe` on a
// string, not `toContain`, not `toMatchObject`, so an added field is a failure
// rather than a pass.
//
// AND NOTHING IS MOCKED. There is no `vi.mock` in this file. The lead route's own
// `resolveLeadSink` runs, the real `lib/leads/sinks/kv.ts` adapter runs, the real
// `asTotalLeadSink` wraps it, the real funnel counter writes, and the real
// `lib/leads/recover.ts` reads back — all of it through ONE fake `fetch` standing
// in for the network, behind which sits ONE `Map` standing in for the key-value
// store. The only thing replaced is the wire.
//
// HONEST LIMIT  The store behind the fake `fetch` is a `Map` that implements the
//               four commands this system sends (`SET`, `INCR`, `SCAN`, `MGET`).
//               That a real provider answers those the same way is a deployment
//               fact no unit test here can establish — the limit `kv.ts`,
//               `log.ts` and `recover.ts` each state for themselves.
// ─────────────────────────────────────────────────────────────────────────────

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '../route';
import { POST } from '@/app/api/lead/route';

/* ── The environment, pinned by NAME. No value below is a credential. ─────── */

const ADMIN_TOKEN_ENV_VAR = 'LEAD_ADMIN_TOKEN';
const KV_URL_ENV_VAR = 'KV_REST_API_URL';
const KV_TOKEN_ENV_VAR = 'KV_REST_API_TOKEN';
const MAILER_ENV_VARS = ['RESEND_API_KEY', 'LEAD_TO_EMAIL', 'LEAD_FROM_EMAIL'];

const STORE_URL = 'https://store.example.invalid/rest';
const STORE_TOKEN = 'store-token-placeholder-not-a-credential';
const ADMIN_TOKEN = 'admin-token-placeholder-not-a-credential';

const ADMIN_ENDPOINT = 'http://localhost/api/admin/leads';
const LEAD_ENDPOINT = 'http://localhost/api/lead';

/* ── One Map, standing in for the key-value store ─────────────────────────── */

let held: Map<string, string>;

function respond(status: number, body: unknown): { status: number; ok: boolean; text(): Promise<string> } {
  return {
    status,
    ok: status >= 200 && status <= 299,
    text: (): Promise<string> => Promise.resolve(JSON.stringify(body)),
  };
}

/** The four commands this whole system actually sends. Nothing else. */
function runCommand(parts: readonly unknown[]): unknown {
  const [verb, ...rest] = parts;

  if (verb === 'SET') {
    held.set(String(rest[0]), String(rest[1]));
    return 'OK';
  }
  if (verb === 'INCR') {
    const name = String(rest[0]);
    const next = Number(held.get(name) ?? '0') + 1;
    held.set(name, String(next));
    return next;
  }
  if (verb === 'MGET') {
    return rest.map((name) => held.get(String(name)) ?? null);
  }
  if (verb === 'SCAN') {
    const matchIndex = rest.findIndex((part) => String(part).toUpperCase() === 'MATCH');
    const pattern = matchIndex === -1 ? '*' : String(rest[matchIndex + 1]);
    const prefix = pattern.endsWith('*') ? pattern.slice(0, -1) : pattern;
    const keys = [...held.keys()].filter((name) => name.startsWith(prefix));
    // One page, then done. `'0'` is this protocol's end-of-walk cursor.
    return ['0', keys];
  }
  throw new Error(`the fake store was sent a command it does not implement: ${String(verb)}`);
}

function fakeFetch(url: string, init: { body: string }): Promise<{ status: number; ok: boolean; text(): Promise<string> }> {
  if (url !== STORE_URL) {
    throw new Error(`NETWORK_FORBIDDEN: a test reached ${url}`);
  }
  const parsed: unknown = JSON.parse(init.body);
  if (!Array.isArray(parsed)) throw new Error('the fake store was sent a body that is not a command');
  return Promise.resolve(respond(200, { result: runCommand(parsed) }));
}

beforeEach(() => {
  held = new Map<string, string>();
  vi.stubGlobal('fetch', fakeFetch);
  vi.stubEnv(KV_URL_ENV_VAR, STORE_URL);
  vi.stubEnv(KV_TOKEN_ENV_VAR, STORE_TOKEN);
  vi.stubEnv(ADMIN_TOKEN_ENV_VAR, ADMIN_TOKEN);
  // THE MAILER IS DEAD in every test in this file. Nothing can be notified.
  for (const name of MAILER_ENV_VARS) vi.stubEnv(name, '');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

/* ── Request builders ─────────────────────────────────────────────────────── */

let requestCounter = 0;

/** A GET at the admin route with whatever credential the test wants to try. */
function adminRequest(headers: Record<string, string> = {}, query = ''): Request {
  return new Request(`${ADMIN_ENDPOINT}${query}`, { method: 'GET', headers });
}

function withToken(value: string): Request {
  return adminRequest({ Authorization: `Bearer ${value}` });
}

/** A real, valid booking enquiry, posted at the real lead route. */
function postLead(overrides: Record<string, unknown> = {}): Request {
  requestCounter += 1;
  return new Request(LEAD_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': `client-${requestCounter}`,
      'Idempotency-Key': `key-${requestCounter}`,
    },
    body: JSON.stringify({
      name: 'Dana Cohen',
      phone: '050-311-2243',
      email: 'visitor@example.invalid',
      organization: 'Northern Regional Council',
      message: 'We would like to book a talk for our staff day in March.',
      locale: 'he',
      ...overrides,
    }),
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   THE NEGATIVE. Four refusals, each proved by the bytes that came back.
   ───────────────────────────────────────────────────────────────────────── */

describe('the gate — no correct token, no data', () => {
  it('refuses a WRONG token with 401 and a body that says nothing', async () => {
    const response = await GET(withToken('not-the-configured-token'));
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('{"error":"unauthorized"}');
  });

  it('refuses a MISSING token with 401 and the SAME bytes', async () => {
    const response = await GET(adminRequest());
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('{"error":"unauthorized"}');
  });

  it('refuses an EMPTY token with 401 and the SAME bytes', async () => {
    const response = await GET(withToken(''));
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('{"error":"unauthorized"}');
  });

  it('refuses an empty token in the QUERY STRING too', async () => {
    const response = await GET(adminRequest({}, '?token='));
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('{"error":"unauthorized"}');
  });

  it('is NOT THERE AT ALL when LEAD_ADMIN_TOKEN is unset — 404, not 401', async () => {
    vi.stubEnv(ADMIN_TOKEN_ENV_VAR, '');
    const response = await GET(withToken(ADMIN_TOKEN));
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('{"error":"not_found"}');
  });

  it('is NOT THERE when LEAD_ADMIN_TOKEN is only whitespace', async () => {
    vi.stubEnv(ADMIN_TOKEN_ENV_VAR, '   ');
    const response = await GET(withToken('   '));
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('{"error":"not_found"}');
  });

  it('the 401 body leaks NOTHING — proved against a store that HAS enquiries', async () => {
    // Arrange a real stored lead first, so there is something to leak.
    await POST(postLead());
    expect([...held.keys()].some((key) => key.startsWith('lead:'))).toBe(true);

    const response = await GET(withToken('wrong'));
    const body = await response.text();

    expect(body).toBe('{"error":"unauthorized"}');
    // Nothing about the data, the shape, or the deployment.
    for (const forbidden of [
      'lead',
      'stored',
      'count',
      'Dana',
      'visitor@example.invalid',
      '050',
      'KV_REST_API',
      'LEAD_ADMIN_TOKEN',
      'deliveryState',
      'measured',
    ]) {
      expect(body.includes(forbidden)).toBe(false);
    }
    // And no header offers a hint either.
    expect(response.headers.get('www-authenticate')).toBe(null);
  });

  it('a refusal is never cached', async () => {
    const response = await GET(adminRequest());
    expect(response.headers.get('cache-control')).toBe('no-store, no-cache, must-revalidate');
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
   THE DELIVERABLE. Kill the mailer, store a real lead, watch the mismatch
   surface. Every step below is the real production code path.
   ───────────────────────────────────────────────────────────────────────── */

describe('the alarm — a stored lead nobody was told about', () => {
  it('surfaces the mismatch in the real response body', async () => {
    // ── ACT 1: a real enquiry, through the real route, with the mailer dead.
    const posted = await POST(postLead());
    expect(posted.status).toBe(201);

    // The enquiry IS in the store. Not a name — the actual key.
    const storedKeys = [...held.keys()].filter((key) => key.startsWith('lead:'));
    expect(storedKeys).toHaveLength(1);

    // ── ACT 2: read it back through the real admin route.
    const response = await GET(withToken(ADMIN_TOKEN));
    expect(response.status).toBe(200);

    const body = await response.text();
    const view = JSON.parse(body);

    // ── THE VALUE, READ BACK. Not "a reader was called".
    expect(view.store.measured).toBe(true);
    expect(view.store.leads).toHaveLength(1);
    expect(`lead:${view.store.leads[0].id}`).toBe(storedKeys[0]);
    expect(view.store.leads[0].delivery.status).toBe('failed');
    expect(view.store.leads[0].delivery.kind).toBe('not_configured');
    expect(view.store.leads[0].locale).toBe('he');

    // ── THE MISMATCH, SURFACED. The counters agree that nobody was told.
    expect(view.counters.measured).toBe(true);
    expect(view.counters.totals.stored).toBe(1);
    expect(view.counters.totals.notified).toBe(0);
    expect(view.counters.totals.storedButNobodyTold).toBe(1);

    // ── AND IT IS VISIBLE, not buried. The headline is the alarm.
    expect(view.alarms).toHaveLength(1);
    expect(view.alarms[0].severity).toBe('waiting');
    expect(view.alarms[0].code).toBe('stored_but_nobody_told');
    expect(view.alarms[0].ids).toEqual([view.store.leads[0].id]);
    expect(view.headline).toBe(view.alarms[0].sentence);
    expect(view.headline).toBe(
      '1 enquiry is saved and safe, but the notification e-mail never went out, so nobody was told they arrived. ' +
        'These people are waiting for a reply. Their details are in the database under the references below.',
    );
  });

  it('the 200 body carries NO personal data — the whole payload is absent', async () => {
    await POST(postLead());
    const body = await (await GET(withToken(ADMIN_TOKEN))).text();

    // The record in the store definitely has these in it...
    expect(held.get([...held.keys()].find((key) => key.startsWith('lead:')) ?? '')).toContain('Dana Cohen');
    // ...and the response definitely does not.
    for (const personal of [
      'Dana Cohen',
      '050-311-2243',
      'visitor@example.invalid',
      'Northern Regional Council',
      'staff day in March',
      'payload',
    ]) {
      // The needle is in the assertion, so a failure names WHICH one leaked.
      expect({ leaked: personal, present: body.includes(personal) }).toEqual({
        leaked: personal,
        present: false,
      });
    }

    // `detail` cannot be checked as a substring — the alarm sentence legitimately
    // contains the word "details". So it is checked STRUCTURALLY, which is the
    // stronger assertion anyway: these are the only keys the arm may carry, and
    // `detail` (which `app/api/lead/route.ts` fills with unset variable NAMES)
    // is not among them.
    const view = JSON.parse(body);
    expect(Object.keys(view.store.leads[0].delivery).sort()).toEqual(['failedAt', 'kind', 'status']);
    expect(Object.keys(view.store.leads[0]).sort()).toEqual([
      'delivery',
      'id',
      'locale',
      'receivedAt',
      'source',
    ]);
  });

  it('counts up as more people are left waiting', async () => {
    await POST(postLead());
    await POST(postLead({ email: 'second@example.invalid' }));
    await POST(postLead({ email: 'third@example.invalid', locale: 'en' }));

    const view = JSON.parse(await (await GET(withToken(ADMIN_TOKEN))).text());

    expect(view.store.leads).toHaveLength(3);
    expect(view.counters.totals.storedButNobodyTold).toBe(3);
    expect(view.alarms[0].ids).toHaveLength(3);
    expect(view.headline.startsWith('3 enquiries are saved and safe')).toBe(true);
  });

  it('says nothing is wrong ONLY when nothing is wrong', async () => {
    const view = JSON.parse(await (await GET(withToken(ADMIN_TOKEN))).text());
    expect(view.alarms).toEqual([]);
    expect(view.headline).toBe(
      'Nothing needs your attention. No enquiries have come in yet, and everything that could be checked was checked.',
    );
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
   The page a human opens.
   ───────────────────────────────────────────────────────────────────────── */

describe('the page', () => {
  it('serves HTML to a browser and the alarm sentence is IN the bytes', async () => {
    await POST(postLead());

    const response = await GET(
      new Request(ADMIN_ENDPOINT, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');

    const html = await response.text();
    expect(html.includes('is saved and safe, but the notification e-mail never went out')).toBe(true);
    expect(html.includes('Dana Cohen')).toBe(false);
    // Law 8: no class name here can be undefined by a config file somewhere else.
    expect(html.includes('class=')).toBe(false);
  });

  it('refuses a browser with no token in HTML, and the HTML says nothing either', async () => {
    const response = await GET(new Request(ADMIN_ENDPOINT, { method: 'GET', headers: { Accept: 'text/html' } }));
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('<!doctype html><title>Unauthorized</title><p>Unauthorized');
  });

  it('accepts the token from the query string, which is what a family can actually use', async () => {
    await POST(postLead());
    const response = await GET(adminRequest({}, `?token=${ADMIN_TOKEN}`));
    expect(response.status).toBe(200);
    expect(JSON.parse(await response.text()).store.leads).toHaveLength(1);
  });

  it('accepts the token from X-Lead-Admin-Token', async () => {
    const response = await GET(adminRequest({ 'X-Lead-Admin-Token': ADMIN_TOKEN }));
    expect(response.status).toBe(200);
  });
});
