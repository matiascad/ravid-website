// ─────────────────────────────────────────────────────────────────────────────
// W16-B PROOF — lib/leads/__tests__/recover.test.ts
//
// The read path on its own, driven against a fake transport that RECORDS EVERY
// COMMAND IT IS SENT. The first test in the file is the module's INVARIANT —
// reading cannot change what is stored — and it is proved by looking at the
// verbs that actually went over the wire, not by reading the source.
//
// Every assertion here is on a VALUE that came back, never on an identifier.
//
// HONEST LIMIT  A `Map` behind a fake `fetch`, like every other test in this
//               directory. That a real provider answers `SCAN` and `MGET` this
//               way is a deployment fact, stated as a limit in `../recover.ts`.
// ─────────────────────────────────────────────────────────────────────────────

import { beforeEach, describe, expect, it } from 'vitest';

import { reconcileLeads, readStoredLeads } from '../recover';
import type { LeadHttpRequest, LeadHttpResponse, LeadHttpTransport } from '../sinks/http';
// `next-env.d.ts` makes `NODE_ENV` a REQUIRED property of `ProcessEnv`, so a bare
// object literal is not one. That is already solved once, in this directory's
// sibling fixtures; it is not solved a second time here.
import { testEnv } from '../sinks/__tests__/fixtures';

const KV_URL_ENV_VAR = 'KV_REST_API_URL';
const KV_TOKEN_ENV_VAR = 'KV_REST_API_TOKEN';

const STORE_URL = 'https://store.example.invalid/rest';
const STORE_TOKEN = 'store-token-placeholder-not-a-credential';

const CONFIGURED: NodeJS.ProcessEnv = testEnv({
  [KV_URL_ENV_VAR]: STORE_URL,
  [KV_TOKEN_ENV_VAR]: STORE_TOKEN,
});

/* ── A store that remembers what it was asked ─────────────────────────────── */

let held: Map<string, string>;
let verbs: string[];
let behaviour: 'ok' | 'http_500' | 'refuses';

function transport(): LeadHttpTransport {
  return (request: LeadHttpRequest): Promise<LeadHttpResponse> => {
    if (request.url !== STORE_URL) throw new Error(`NETWORK_FORBIDDEN: ${request.url}`);
    if (behaviour === 'http_500') return Promise.resolve({ status: 500, body: '{"error":"boom"}' });
    if (behaviour === 'refuses') return Promise.resolve({ status: 200, body: '{"error":"WRONGTYPE"}' });

    const parts: unknown = JSON.parse(request.body);
    if (!Array.isArray(parts)) throw new Error('not a command');
    const [head, ...rest] = parts as string[];
    const verb = String(head);
    verbs.push(verb);

    if (verb === 'MGET') {
      return Promise.resolve({
        status: 200,
        body: JSON.stringify({ result: rest.map((name) => held.get(name) ?? null) }),
      });
    }
    if (verb === 'SCAN') {
      const matchIndex = rest.findIndex((part) => String(part).toUpperCase() === 'MATCH');
      const pattern = matchIndex === -1 ? '*' : String(rest[matchIndex + 1]);
      const prefix = pattern.endsWith('*') ? pattern.slice(0, -1) : pattern;
      const keys = [...held.keys()].filter((name) => name.startsWith(prefix));
      return Promise.resolve({ status: 200, body: JSON.stringify({ result: ['0', keys] }) });
    }
    throw new Error(`the fake store refuses the verb ${verb}`);
  };
}

/** A well-formed 26-character Crockford id. Sorts by its leading characters. */
function idAt(seq: string): string {
  return `01M2CSFZW${seq}`.padEnd(26, '0').slice(0, 26);
}

function store(
  id: string,
  deliveryState: unknown,
  extra: Record<string, unknown> = {},
): string {
  held.set(
    `lead:${id}`,
    JSON.stringify({
      id,
      receivedAt: '2026-09-13T04:05:06.000Z',
      source: 'web_form',
      payload: {
        name: 'Dana Cohen',
        phone: '050-311-2243',
        email: 'visitor@example.invalid',
        organization: 'Northern Regional Council',
        message: 'A message about a dead soldier.',
        locale: 'he',
      },
      deliveryState,
      ...extra,
    }),
  );
  return id;
}

function countersAt(outcome: string, locale: string, value: number): void {
  held.set(`lead_funnel:${outcome}:${locale}`, String(value));
}

beforeEach(() => {
  held = new Map<string, string>();
  verbs = [];
  behaviour = 'ok';
});

/* ─────────────────────────────────────────────────────────────────────────── */

describe('the invariant — reading cannot change what is stored', () => {
  it('sends only SCAN and MGET, whatever is in the store', async () => {
    store(idAt('A'), { status: 'pending' });
    store(idAt('B'), { status: 'delivered', deliveredAt: '2026-09-13T05:00:00.000Z' });

    await reconcileLeads(CONFIGURED, transport());

    expect([...new Set(verbs)].sort()).toEqual(['MGET', 'SCAN']);
    // And the store is byte-for-byte what it was.
    expect(held.size).toBe(2);
  });
});

describe('measured versus not measured — never collapsed', () => {
  it('an unattached store returns an arm with NO list on it, naming the variables', async () => {
    const reading = await readStoredLeads(testEnv(), transport());

    expect(reading.measured).toBe(false);
    expect(reading).toEqual({
      measured: false,
      reason: 'unconfigured',
      missing: [KV_URL_ENV_VAR, KV_TOKEN_ENV_VAR],
    });
    expect('leads' in reading).toBe(false);
  });

  it('a half-configured store names ONLY the variable that is missing', async () => {
    const reading = await readStoredLeads(testEnv({ [KV_URL_ENV_VAR]: STORE_URL }), transport());
    expect(reading).toEqual({ measured: false, reason: 'unconfigured', missing: [KV_TOKEN_ENV_VAR] });
  });

  it('a blank variable counts as unset, not as a value', async () => {
    const reading = await readStoredLeads(
      testEnv({ [KV_URL_ENV_VAR]: '  ', [KV_TOKEN_ENV_VAR]: STORE_TOKEN }),
      transport(),
    );
    expect(reading).toEqual({ measured: false, reason: 'unconfigured', missing: [KV_URL_ENV_VAR] });
  });

  it('an attached store that will not answer is UNREACHABLE, not empty', async () => {
    behaviour = 'http_500';
    const reading = await readStoredLeads(CONFIGURED, transport());
    expect(reading).toEqual({ measured: false, reason: 'unreachable' });
    expect('leads' in reading).toBe(false);
  });

  it('a store that refuses the command is unreachable too', async () => {
    behaviour = 'refuses';
    expect(await readStoredLeads(CONFIGURED, transport())).toEqual({
      measured: false,
      reason: 'unreachable',
    });
  });

  it('an EMPTY attached store really is empty, and says so with a list', async () => {
    expect(await readStoredLeads(CONFIGURED, transport())).toEqual({
      measured: true,
      leads: [],
      unreadable: 0,
      truncated: false,
    });
  });
});

describe('what a summary contains, and what it cannot', () => {
  it('carries five fields and no payload', async () => {
    const id = store(idAt('A'), { status: 'pending' });
    const reading = await readStoredLeads(CONFIGURED, transport());
    if (!reading.measured) throw new Error('the store reported it was not read');

    expect(reading.leads).toEqual([
      {
        id,
        receivedAt: '2026-09-13T04:05:06.000Z',
        source: 'web_form',
        locale: 'he',
        delivery: { status: 'pending' },
      },
    ]);
  });

  it('drops `detail` from a failed delivery — it names unset variables', async () => {
    store(idAt('A'), {
      status: 'failed',
      failedAt: '2026-09-13T04:05:07.000Z',
      kind: 'not_configured',
      detail: 'unset: RESEND_API_KEY, LEAD_TO_EMAIL',
    });
    const reading = await readStoredLeads(CONFIGURED, transport());
    if (!reading.measured) throw new Error('the store reported it was not read');

    expect(reading.leads[0]?.delivery).toEqual({
      status: 'failed',
      failedAt: '2026-09-13T04:05:07.000Z',
      kind: 'not_configured',
    });
    expect(JSON.stringify(reading).includes('RESEND_API_KEY')).toBe(false);
  });

  it('a corrupt delivery state is UNKNOWN and never defaults to pending', async () => {
    store(idAt('A'), { status: 'delivered' }); // no `deliveredAt`
    store(idAt('B'), { status: 'failed', failedAt: 'x' }); // no `kind`
    store(idAt('C'), 'nonsense');
    store(idAt('D'), { status: 'invented' });

    const reading = await readStoredLeads(CONFIGURED, transport());
    if (!reading.measured) throw new Error('the store reported it was not read');

    expect(reading.leads.map((lead) => lead.delivery.status)).toEqual([
      'unknown',
      'unknown',
      'unknown',
      'unknown',
    ]);
  });

  it('an unparseable record is COUNTED, not silently skipped', async () => {
    store(idAt('A'), { status: 'pending' });
    held.set(`lead:${idAt('B')}`, 'not json at all');
    held.set('lead:not-a-well-formed-id', JSON.stringify({ id: 'x' }));

    const reading = await readStoredLeads(CONFIGURED, transport());
    if (!reading.measured) throw new Error('the store reported it was not read');

    expect(reading.leads).toHaveLength(1);
    expect(reading.unreadable).toBe(2);
  });

  it('never guesses a language', async () => {
    store(idAt('A'), { status: 'pending' }, { payload: { locale: 'fr' } });
    const reading = await readStoredLeads(CONFIGURED, transport());
    if (!reading.measured) throw new Error('the store reported it was not read');
    expect(reading.leads[0]?.locale).toBe('unknown');
  });

  it('lists newest first', async () => {
    store(idAt('A'), { status: 'pending' });
    store(idAt('C'), { status: 'pending' });
    store(idAt('B'), { status: 'pending' });

    const reading = await readStoredLeads(CONFIGURED, transport());
    if (!reading.measured) throw new Error('the store reported it was not read');
    expect(reading.leads.map((lead) => lead.id)).toEqual([idAt('C'), idAt('B'), idAt('A')]);
  });

  it('ignores the funnel counter keys, which share the store', async () => {
    countersAt('stored_notified', 'he', 4);
    store(idAt('A'), { status: 'pending' });

    const reading = await readStoredLeads(CONFIGURED, transport());
    if (!reading.measured) throw new Error('the store reported it was not read');
    expect(reading.leads).toHaveLength(1);
    expect(reading.unreadable).toBe(0);
  });
});

describe('the alarms — the worst one is the headline', () => {
  it('LOST enquiries outrank waiting ones and take the headline', async () => {
    countersAt('lost_transient', 'he', 2);
    countersAt('stored_unnotified', 'he', 1);
    store(idAt('A'), { status: 'pending' });

    const view = await reconcileLeads(CONFIGURED, transport());

    expect(view.alarms.map((alarm) => alarm.code)).toEqual([
      'enquiries_lost',
      'stored_but_nobody_told',
    ]);
    expect(view.headline).toBe(
      '2 enquiries were LOST before being saved. There is no record of who they were and nobody can call them back. ' +
        'The website could not reach its database at the time. Ask for this to be looked at today.',
    );
  });

  it('a delivered lead raises nothing', async () => {
    countersAt('stored_notified', 'he', 1);
    store(idAt('A'), { status: 'delivered', deliveredAt: '2026-09-13T05:00:00.000Z' });

    const view = await reconcileLeads(CONFIGURED, transport());
    expect(view.alarms).toEqual([]);
    expect(view.headline).toBe(
      'Nothing needs your attention. Every enquiry that came in was saved, and somebody was told about every one of them.',
    );
  });

  it('an unattached store is an alarm, not a quiet empty page', async () => {
    const view = await reconcileLeads(testEnv(), transport());
    expect(view.alarms.map((alarm) => alarm.code).sort()).toEqual([
      'counters_not_measured',
      'store_not_measured',
    ]);
    expect(view.headline.includes('This is not an empty list')).toBe(true);
  });

  it('reports the two views disagreeing as a question, not a fault', async () => {
    countersAt('stored_notified', 'he', 5);
    store(idAt('A'), { status: 'delivered', deliveredAt: '2026-09-13T05:00:00.000Z' });

    const view = await reconcileLeads(CONFIGURED, transport());
    const disagreement = view.alarms.find((alarm) => alarm.code === 'views_disagree');

    expect(disagreement?.sentence).toBe(
      'The counter says 5 enquiries were saved, but the database holds 1. That is not necessarily a fault — ' +
        'counting started the day the database was attached, and older enquiries may pre-date it or have been ' +
        'cleared out. It is a thing to ask about.',
    );
  });

  it('names the references a human must go and fetch', async () => {
    const waiting = store(idAt('A'), {
      status: 'failed',
      failedAt: '2026-09-13T04:05:07.000Z',
      kind: 'transient',
      detail: 'provider refused',
    });
    store(idAt('B'), { status: 'delivered', deliveredAt: '2026-09-13T05:00:00.000Z' });
    countersAt('stored_notified', 'he', 1);
    countersAt('stored_unnotified', 'he', 1);

    const view = await reconcileLeads(CONFIGURED, transport());
    const alarm = view.alarms.find((entry) => entry.code === 'stored_but_nobody_told');

    expect(alarm?.ids).toEqual([waiting]);
    expect(alarm?.severity).toBe('waiting');
  });
});
