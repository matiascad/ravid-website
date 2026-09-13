// ─────────────────────────────────────────────────────────────────────────────
// W16-B READ-BACK & LOSS ALARM — lib/leads/recover.ts
//
// THE NUMBER NOBODY COULD REACH. Before this file the repository could WRITE a
// lead (`./sinks/kv.ts`), could WRITE a counter (`./log.ts`), and could read the
// counters back (`readLeadFunnel`) — but NOTHING IN THE REPOSITORY EVER READ A
// STORED LEAD BACK, and nothing anywhere called `readLeadFunnel`. Measured, not
// assumed: a repo-wide grep over 105 TypeScript files found exactly one producer
// of `lead:<id>` records (`./sinks/kv.ts`) and zero consumers, and exactly one
// definition of `readLeadFunnel` with callers only inside its own test file.
// `./log.ts` HONEST LIMIT 5 says so in its own words: "THERE IS NO SCREEN THAT
// SHOWS THESE NUMBERS YET ... A number nobody can see is not yet a number the
// family has."
//
// So a lead could sit in the store with `deliveryState: 'failed'` — safe,
// recoverable, and a person waiting for a call back — and no expression in this
// codebase could discover it. THAT is the defect this file closes. It adds no
// storage, no counter, no second truth: it READS the two that already exist and
// puts them next to each other, where a disagreement between them is visible.
//
// ── WHY THIS IS A READER AND NOT A COUNTER ───────────────────────────────────
// `./log.ts` already derives `storedButNobodyTold` and `neverStored` and already
// refuses to add them together. Building a second tally here would be a rival
// fact. Everything below is either a SCAN of keys that `./sinks/kv.ts` wrote, or
// a fold over readings that already exist. Nothing here writes anything: there
// is no `SET`, no `INCR`, no `DEL` in this file, and the port (`./port.ts`) is
// untouched — `LeadSink` is the WRITE boundary and a read path does not need it
// to widen.
//
// ── METADATA ONLY. THE DECISION, AND WHAT IT COSTS ───────────────────────────
// A listing on a memorial site is the most dangerous endpoint in it. The people
// in this store are bereaved families, schools and army units writing to a dead
// soldier's brother. So `StoredLeadSummary` carries the enquiry's IDENTITY and
// its DELIVERY STATE and NOTHING ELSE: no name, no phone number, no email
// address, no organisation, no message text. Not truncated — absent. There is no
// expression in this file that reads `payload.name`, `payload.phone`,
// `payload.email`, `payload.organization` or `payload.message`, and the summary
// type has no field one could be put in.
//
// The trade, stated honestly: an operator reading this CANNOT call anybody back
// from it. They learn THAT somebody is waiting and WHICH id to go and fetch; the
// fetch itself is a second, deliberate act against the store's own credentials.
// That is one extra step for the operator. The alternative buys that step at the
// price that a single leaked response — a token in a bookmark, a screenshot, a
// proxy log — publishes grieving people's phone numbers and the words they wrote
// about Tuval. The step is cheap. The leak is not recoverable. Metadata only.
//
// `detail` is dropped from a failed delivery for the same reason at a smaller
// scale: `./types.ts` documents it as operator text, and `app/api/lead/route.ts`
// puts UNSET ENVIRONMENT VARIABLE NAMES in it. A listing that echoed it would
// undo that route's deliberate refusal to tell a client what is misconfigured.
//
// INVARIANT     READING CANNOT CHANGE WHAT IS STORED. The only commands this
//               module can emit are `SCAN` and `MGET`; both are spelled as
//               literals inside this file, there is no parameter, option or code
//               path by which a caller could make it send another verb, and the
//               store's credentials are used for nothing else. A bug in this file
//               can report wrongly; it cannot delete an enquiry.
//
// IMPOSSIBLE    · PERSONAL DATA IN A LISTING RESPONSE cannot be CONSTRUCTED.
//                 `StoredLeadSummary` has five fields and none of them can hold a
//                 name, a phone number, an email address or a message: assigning
//                 one is a compile error, not a review item. The parser reads
//                 exactly `id`, `receivedAt`, `source`, `payload.locale` and
//                 `deliveryState` off the stored record and lets the rest fall on
//                 the floor.
//               · A ZERO THAT MEANS "NOT MEASURED" cannot be constructed, the
//                 same way `./log.ts` refuses it: an unconfigured or unreachable
//                 store returns `{ measured: false }` — an arm with NO `leads`
//                 field and NO count on it at all — so "no enquiries are waiting"
//                 and "nobody looked" cannot be spelled the same way by a caller
//                 that type-checks. The distinction `readLeadFunnel` established
//                 is preserved here rather than re-invented.
//               · A SILENTLY PARTIAL LISTING cannot be constructed: a scan that
//                 hits the page cap sets `truncated: true` on the reading, and a
//                 stored value that will not parse is counted in `unreadable`
//                 rather than skipped. A record that exists and could not be read
//                 is neither present-and-fine nor absent, and this type says so.
//               · A DELIVERY STATE INVENTED FROM A CORRUPT RECORD cannot be
//                 constructed: an unrecognised `deliveryState` becomes the
//                 explicit `{ status: 'unknown' }` arm. It never defaults to
//                 `'pending'`, because "nobody has been told yet" and "we cannot
//                 tell whether anybody was told" are different facts.
//
// CLASS         Closed by derivation for WHAT A LISTING CAN CONTAIN (the field
//               set) and for the measured/not-measured distinction. NOT closed
//               over the store's wire protocol — `["SCAN",...]`, `["MGET",...]`
//               and a `{"result":...}` envelope are THIS provider's REST API,
//               exactly as in `./sinks/kv.ts` and `./log.ts`; a different
//               provider is a different file. NOT closed over whether the ALARMS
//               below are the right alarms: that is judgement, argued in the
//               comments at each one, not proved.
//
// HONEST LIMIT  IN PLAIN WORDS, FOR SOMEBODY WHO DOES NOT WRITE SOFTWARE:
//
//               1. THIS ONLY WORKS IF THE WEBSITE HAS A DATABASE ATTACHED. If
//                  nobody has attached one, this does not show you an empty list
//                  — it tells you, in words, that there is nothing to look in.
//                  An empty list means nobody enquired. "Not measured" means
//                  nobody was looking. They are never shown the same way.
//               2. IT CANNOT TELL YOU WHO ENQUIRED. On purpose. You get the
//                  enquiry's reference and the date, and whether anyone was told
//                  about it. To reach the actual person somebody opens the
//                  database itself. See the block above for why.
//               3. THE TWO NUMBERS CAN DISAGREE FOR INNOCENT REASONS. The counts
//                  started the day the database was attached; the enquiries in
//                  the database may be older or may have been cleared out. A
//                  disagreement is reported as a disagreement — a thing to ask
//                  about — never as an accusation that something is broken.
//               4. IT CANNOT SEE AN ENQUIRY THAT WAS NEVER STORED. Nothing can.
//                  If the database was down when somebody wrote in, that person
//                  is gone and no list can find them. The COUNTER knows how many
//                  there were (`neverStored`), which is why both are read here
//                  and shown together, and it is the most serious line on the
//                  page when it is not zero.
//               5. IT DOES NOT FIX ANYTHING. It tells a human that a person is
//                  waiting for a call. Somebody still has to make the call.
//                  There is no retry and no queue in this file, deliberately:
//                  re-sending mail on a schedule is a different piece of work
//                  with different failure modes, and pretending to do it here
//                  would be worse than saying it is not done.
//               6. NOT PROVED AGAINST A REAL STORE. Every test drives a fake
//                  transport. That `SCAN` and `MGET` behave over this provider's
//                  REST API as this file assumes is a deployment fact no unit
//                  test in this repository can establish — the same limit
//                  `./sinks/kv.ts` states for its own `SET`.
//               7. A VERY LARGE STORE IS READ IN PAGES AND THE PAGING IS CAPPED
//                  (100 pages). Past roughly 100,000 enquiries the list is
//                  truncated and SAYS it is truncated. It is not a database
//                  query engine and was never meant to be one.
// ─────────────────────────────────────────────────────────────────────────────

import {
  countLocale,
  readLeadFunnel,
  type LeadCountLocale,
  type LeadFunnelReading,
} from './log';
import {
  classifyHttpStatus,
  createFetchTransport,
  type LeadHttpTransport,
} from './sinks/http';
import {
  KV_LEAD_KEY_PREFIX,
  KV_TOKEN_ENV_VAR_NAME,
  KV_URL_ENV_VAR_NAME,
} from './sinks/kv';
import { parseLeadId, type LeadFailureKind, type LeadSource } from './types';

/* ── Paging limits ────────────────────────────────────────────────────────── */

/** How many keys to ask the store for per `SCAN`. A hint, not a guarantee. */
const SCAN_PAGE_SIZE = 1_000;

/** The cap. See HONEST LIMIT 7 — past this the reading says `truncated`. */
const SCAN_MAX_PAGES = 100;

/** How many keys go into one `MGET`. Keeps a single request body sane. */
const MGET_BATCH_SIZE = 256;

/* ── What a listing may contain ───────────────────────────────────────────── */

/**
 * The delivery state of ONE stored enquiry, as it is safe to show.
 *
 * Mirrors `LeadDeliveryState` in `./types` with ONE deliberate difference and one
 * deliberate addition:
 *   · `detail` is DROPPED from the failed arm. It is operator text that
 *     `app/api/lead/route.ts` fills with unset environment variable names.
 *   · `unknown` is ADDED, for a stored record whose delivery state does not
 *     parse. It is not `pending`. See IMPOSSIBLE.
 */
export type StoredLeadDelivery =
  /** Stored; nobody has been told yet. */
  | { readonly status: 'pending' }
  /** Somebody was told, at this instant (ISO-8601 UTC). */
  | { readonly status: 'delivered'; readonly deliveredAt: string }
  /** NOBODY WAS TOLD. The enquiry is safe. A human must call this person. */
  | { readonly status: 'failed'; readonly failedAt: string; readonly kind: LeadFailureKind }
  /** The record is there and its delivery state could not be read. */
  | { readonly status: 'unknown' };

/**
 * ONE stored enquiry, as a listing may describe it.
 *
 * FIVE FIELDS, AND NO SIXTH. There is no field here that could hold a name, a
 * phone number, an email address, an organisation or a message, which is why a
 * response from this module cannot leak one. See the header.
 */
export type StoredLeadSummary = {
  /** The reference. What you quote to somebody who can open the store. */
  readonly id: string;
  /** ISO-8601 UTC, as stored. Not re-validated here — `./types` limit 1. */
  readonly receivedAt: string;
  /** The channel the enquiry came in through. */
  readonly source: LeadSource | 'unknown';
  /** The language the enquiry was written in. Never guessed — `./log.ts`. */
  readonly locale: LeadCountLocale;
  /** Has anybody been told about this person yet? */
  readonly delivery: StoredLeadDelivery;
};

/** Why a reading has no leads on it. Two different facts, never collapsed. */
export type StoredLeadsUnread =
  /** No store is attached to this deployment. Nothing was ever written. */
  | { readonly reason: 'unconfigured'; readonly missing: readonly string[] }
  /** A store IS attached and did not answer usefully. Somebody must look. */
  | { readonly reason: 'unreachable' };

/**
 * The result of looking in the store.
 *
 * `measured: false` carries NO `leads` field, so an unattached store cannot be
 * read as "no enquiries are waiting". Same refusal as `LeadFunnelReading`.
 */
export type StoredLeadsReading =
  | ({ readonly measured: false } & StoredLeadsUnread)
  | {
      readonly measured: true;
      /** Newest first. */
      readonly leads: readonly StoredLeadSummary[];
      /** Records that are in the store and would not parse. Not skipped. */
      readonly unreadable: number;
      /** True when the page cap stopped the scan. See HONEST LIMIT 7. */
      readonly truncated: boolean;
    };

/* ── The store: SCAN out, MGET back. No other verb exists in this file ────── */

type StoreConfig = { readonly url: string; readonly token: string };

/**
 * The store, or the NAMES of what is missing. Present-but-blank counts as
 * missing — the same rule every other file that reads this environment applies.
 * The names come from `./sinks/kv.ts`; they are not restated here.
 */
function resolveStore(
  env: NodeJS.ProcessEnv,
): StoreConfig | { readonly missing: readonly string[] } {
  const url = (env[KV_URL_ENV_VAR_NAME] ?? '').trim();
  const token = (env[KV_TOKEN_ENV_VAR_NAME] ?? '').trim();
  const missing = [
    ...(url === '' ? [KV_URL_ENV_VAR_NAME] : []),
    ...(token === '' ? [KV_TOKEN_ENV_VAR_NAME] : []),
  ];
  return missing.length > 0 ? { missing } : { url, token };
}

/**
 * One REST command. The command is in the BODY, never the path — as in
 * `./sinks/kv.ts` and `./log.ts`, through the same injected transport.
 */
async function command(
  store: StoreConfig,
  transport: LeadHttpTransport,
  parts: readonly string[],
): Promise<unknown> {
  const response = await transport({
    url: store.url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${store.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parts),
  });

  if (classifyHttpStatus(response.status) !== 'ok') {
    throw new Error(`lead_store_http_${response.status}`);
  }

  const parsed: unknown = JSON.parse(response.body);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('lead_store_body_not_an_object');
  }
  const envelope: { readonly result?: unknown; readonly error?: unknown } = parsed;
  if (typeof envelope.error === 'string') {
    throw new Error('lead_store_refused_the_command');
  }
  return envelope.result;
}

/** Every `lead:*` key, and whether the page cap cut the walk short. */
async function scanLeadKeys(
  store: StoreConfig,
  transport: LeadHttpTransport,
): Promise<{ readonly keys: readonly string[]; readonly truncated: boolean }> {
  const keys: string[] = [];
  let cursor = '0';

  for (let page = 0; page < SCAN_MAX_PAGES; page += 1) {
    const result = await command(store, transport, [
      'SCAN',
      cursor,
      'MATCH',
      `${KV_LEAD_KEY_PREFIX}*`,
      'COUNT',
      String(SCAN_PAGE_SIZE),
    ]);

    if (!Array.isArray(result) || result.length < 2) {
      throw new Error('lead_store_scan_unexpected_shape');
    }
    const [nextCursor, batch] = result as [unknown, unknown];
    if (!Array.isArray(batch)) {
      throw new Error('lead_store_scan_unexpected_shape');
    }
    for (const candidate of batch) {
      if (typeof candidate === 'string') keys.push(candidate);
    }

    cursor = String(nextCursor);
    // `'0'` is this protocol's "the walk is finished".
    if (cursor === '0') return { keys, truncated: false };
  }

  return { keys, truncated: true };
}

/** The stored values for a batch of keys, in the order asked. */
async function mgetValues(
  store: StoreConfig,
  transport: LeadHttpTransport,
  keys: readonly string[],
): Promise<readonly unknown[]> {
  const values: unknown[] = [];
  for (let start = 0; start < keys.length; start += MGET_BATCH_SIZE) {
    const batch = keys.slice(start, start + MGET_BATCH_SIZE);
    const result = await command(store, transport, ['MGET', ...batch]);
    if (!Array.isArray(result) || result.length !== batch.length) {
      throw new Error('lead_store_mget_unexpected_shape');
    }
    values.push(...result);
  }
  return values;
}

/* ── Parsing one stored record, taking FIVE fields and no more ────────────── */

function readString(source: Record<string, unknown>, field: string): string | null {
  const value = source[field];
  return typeof value === 'string' && value !== '' ? value : null;
}

/** The delivery state, or the honest `unknown`. Never defaults to `pending`. */
function readDelivery(value: unknown): StoredLeadDelivery {
  if (typeof value !== 'object' || value === null) return { status: 'unknown' };
  const state = value as Record<string, unknown>;

  if (state.status === 'pending') return { status: 'pending' };

  if (state.status === 'delivered') {
    const deliveredAt = readString(state, 'deliveredAt');
    return deliveredAt === null ? { status: 'unknown' } : { status: 'delivered', deliveredAt };
  }

  if (state.status === 'failed') {
    const failedAt = readString(state, 'failedAt');
    const kind = state.kind;
    const known = kind === 'not_configured' || kind === 'transient' || kind === 'permanent';
    // NOTE what is NOT read here: `detail`. See the header.
    return failedAt === null || !known
      ? { status: 'unknown' }
      : { status: 'failed', failedAt, kind };
  }

  return { status: 'unknown' };
}

/**
 * One stored value into one summary, or `null` when it cannot be read at all.
 *
 * The IDENTITY comes from the KEY, not from the record's own `id` field: the key
 * is what an operator types into the store's console to fetch this enquiry, so
 * the key is the reference worth quoting. A key whose suffix is not a well-formed
 * id is not a lead record and is refused rather than listed.
 */
function summarise(key: string, raw: unknown): StoredLeadSummary | null {
  const id = parseLeadId(key.slice(KV_LEAD_KEY_PREFIX.length));
  if (id === null) return null;
  if (typeof raw !== 'string') return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const record = parsed as Record<string, unknown>;

  const payload = record.payload;
  const locale = countLocale(
    typeof payload === 'object' && payload !== null ? payload : undefined,
  );

  return {
    id,
    receivedAt: readString(record, 'receivedAt') ?? '',
    source: record.source === 'web_form' ? 'web_form' : 'unknown',
    locale,
    delivery: readDelivery(record.deliveryState),
  };
}

/* ── Reading ──────────────────────────────────────────────────────────────── */

/**
 * LIST WHAT IS ACTUALLY IN THE STORE, newest first.
 *
 * Returns `{ measured: false }` — an arm with no list on it — when the store is
 * unattached or will not answer, rather than an empty list. "Nobody enquired" and
 * "nobody looked" are different facts.
 */
export async function readStoredLeads(
  env: NodeJS.ProcessEnv = process.env,
  transport: LeadHttpTransport = createFetchTransport(),
): Promise<StoredLeadsReading> {
  const store = resolveStore(env);
  if ('missing' in store) {
    return { measured: false, reason: 'unconfigured', missing: store.missing };
  }

  try {
    const scanned = await scanLeadKeys(store, transport);
    if (scanned.keys.length === 0) {
      return { measured: true, leads: [], unreadable: 0, truncated: scanned.truncated };
    }

    const values = await mgetValues(store, transport, scanned.keys);

    const leads: StoredLeadSummary[] = [];
    let unreadable = 0;
    scanned.keys.forEach((key, index) => {
      const summary = summarise(key, values[index]);
      if (summary === null) unreadable += 1;
      else leads.push(summary);
    });

    // A ULID sorts by arrival, so a descending sort of the ids is newest-first
    // without a second index — `./types.ts` says exactly that, to millisecond
    // precision (its limit 3: no monotonic ordering inside one millisecond).
    leads.sort((left, right) => (left.id < right.id ? 1 : left.id > right.id ? -1 : 0));

    return { measured: true, leads, unreadable, truncated: scanned.truncated };
  } catch (cause) {
    console.error('[lead] the stored enquiries could not be read', cause);
    return { measured: false, reason: 'unreachable' };
  }
}

/* ── Reconciliation: the two readings, side by side, mismatch first ───────── */

/**
 * How bad. Ordered worst-first, which is the order alarms are sorted in and the
 * order a reader should read them.
 *
 *   `lost`        — people are gone. Nobody can call them back.
 *   `waiting`     — people are safe in the store and nobody has been told.
 *   `not_measured`— one of the two views could not be read. Law 5: this is NOT
 *                   the same as "nothing wrong", and it is never shown as zero.
 *   `disagreement`— the two views do not match. Ask, do not accuse.
 */
export type LeadAlarmSeverity = 'lost' | 'waiting' | 'not_measured' | 'disagreement';

const SEVERITY_ORDER: Readonly<Record<LeadAlarmSeverity, number>> = {
  lost: 0,
  waiting: 1,
  not_measured: 2,
  disagreement: 3,
};

/** One thing wrong, in a sentence a human can act on. */
export type LeadAlarm = {
  readonly severity: LeadAlarmSeverity;
  /** A stable machine handle. Nothing in this file branches on it (Law 8). */
  readonly code: string;
  /** THE DELIVERABLE: what is wrong, in words, not in a number. */
  readonly sentence: string;
  /** The enquiry references a human should go and fetch. Ids only. */
  readonly ids?: readonly string[];
};

/** The two views, the alarms derived from them, and one sentence at the top. */
export type LeadReconciliation = {
  /** What the store actually holds. */
  readonly store: StoredLeadsReading;
  /** What the counters say happened. `./log.ts`, unchanged. */
  readonly counters: LeadFunnelReading;
  /** Worst first. EMPTY MEANS NOTHING IS WRONG AND BOTH VIEWS WERE READ. */
  readonly alarms: readonly LeadAlarm[];
  /** The one line. Never a bare integer — see the seat's brief. */
  readonly headline: string;
};

/** Everything that needs a human, as sentences. The only judgement in this file. */
function alarmsFor(
  store: StoredLeadsReading,
  counters: LeadFunnelReading,
): readonly LeadAlarm[] {
  const alarms: LeadAlarm[] = [];

  // ── WORST: enquiries that were never stored. Nobody can reach these people.
  // Only the COUNTER knows this number; no listing can, because there is
  // nothing in the store to list. This is why both views are read.
  if (counters.measured && counters.totals.neverStored > 0) {
    alarms.push({
      severity: 'lost',
      code: 'enquiries_lost',
      sentence:
        `${counters.totals.neverStored} enquir${counters.totals.neverStored === 1 ? 'y was' : 'ies were'} ` +
        'LOST before being saved. There is no record of who they were and nobody can call them back. ' +
        'The website could not reach its database at the time. Ask for this to be looked at today.',
    });
  }

  // ── People who ARE safe and whom nobody has been told about. This is the
  // recoverable disaster, and it is recoverable only if somebody reads it.
  if (store.measured) {
    const waiting = store.leads.filter(
      (lead) => lead.delivery.status === 'failed' || lead.delivery.status === 'pending',
    );
    if (waiting.length > 0) {
      alarms.push({
        severity: 'waiting',
        code: 'stored_but_nobody_told',
        sentence:
          `${waiting.length} enquir${waiting.length === 1 ? 'y is' : 'ies are'} saved and safe, ` +
          'but the notification e-mail never went out, so nobody was told they arrived. ' +
          'These people are waiting for a reply. Their details are in the database under the references below.',
        ids: waiting.map((lead) => lead.id),
      });
    }

    if (store.unreadable > 0) {
      alarms.push({
        severity: 'not_measured',
        code: 'records_unreadable',
        sentence:
          `${store.unreadable} thing${store.unreadable === 1 ? '' : 's'} in the database could not be read ` +
          'and might be an enquiry. They are not counted as fine and not counted as lost.',
      });
    }

    if (store.truncated) {
      alarms.push({
        severity: 'not_measured',
        code: 'listing_truncated',
        sentence:
          'There are more enquiries than this list can walk through in one go, so this list is incomplete. ' +
          'What is shown is real; what is missing is unknown.',
      });
    }
  } else {
    alarms.push({
      severity: 'not_measured',
      code: 'store_not_measured',
      sentence:
        store.reason === 'unconfigured'
          ? 'The website has no database attached, so enquiries are NOT being saved at all. ' +
            'This is not an empty list — it is nobody looking. Ask for the database to be connected.'
          : 'The database is attached but did not answer. Nothing here should be read as "no enquiries". ' +
            'Ask for this to be looked at.',
    });
  }

  if (!counters.measured) {
    alarms.push({
      severity: 'not_measured',
      code: 'counters_not_measured',
      sentence:
        'The counters could not be read, so it is not known how many enquiries were lost before being saved. ' +
        'That number is NOT zero — it is unknown.',
    });
  }

  // ── The two views disagreeing. Reported as a question, never as a fault:
  // HONEST LIMIT 3 lists the innocent reasons, and a memorial site's operator
  // should not be handed a false accusation dressed as an error.
  if (store.measured && counters.measured && !store.truncated) {
    const held = store.leads.length + store.unreadable;
    if (held !== counters.totals.stored) {
      alarms.push({
        severity: 'disagreement',
        code: 'views_disagree',
        sentence:
          `The counter says ${counters.totals.stored} enquir${counters.totals.stored === 1 ? 'y was' : 'ies were'} saved, ` +
          `but the database holds ${held}. That is not necessarily a fault — counting started the day the database ` +
          'was attached, and older enquiries may pre-date it or have been cleared out. It is a thing to ask about.',
      });
    }
  }

  return [...alarms].sort(
    (left, right) => SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity],
  );
}

/** The one line at the top. Words, because the reader is a family, not an SRE. */
function headlineFor(
  store: StoredLeadsReading,
  alarms: readonly LeadAlarm[],
): string {
  const worst = alarms[0];
  if (worst !== undefined) return worst.sentence;
  if (store.measured && store.leads.length === 0) {
    return 'Nothing needs your attention. No enquiries have come in yet, and everything that could be checked was checked.';
  }
  return 'Nothing needs your attention. Every enquiry that came in was saved, and somebody was told about every one of them.';
}

/**
 * READ BOTH VIEWS AND PUT THEM NEXT TO EACH OTHER.
 *
 * The whole point of this function is the pair. The counters know about people
 * who were never stored, which no listing can see; the listing knows which
 * stored people are still waiting for a call, which no counter can name. Neither
 * alone can answer "is anybody waiting on us right now?".
 *
 * Both readings are taken even when the first one fails, so a broken store does
 * not hide the counters and a broken counter does not hide the store.
 */
export async function reconcileLeads(
  env: NodeJS.ProcessEnv = process.env,
  transport: LeadHttpTransport = createFetchTransport(),
): Promise<LeadReconciliation> {
  const [store, counters] = await Promise.all([
    readStoredLeads(env, transport),
    readLeadFunnel(env, transport),
  ]);

  const alarms = alarmsFor(store, counters);
  return { store, counters, alarms, headline: headlineFor(store, alarms) };
}
