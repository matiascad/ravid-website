// ─────────────────────────────────────────────────────────────────────────────
// W10-C LEAD FUNNEL COUNTERS — lib/leads/log.ts
//
// THE NUMBER THE FAMILY CAN CHECK WITHOUT A GOOGLE ACCOUNT. There is no GA4
// property behind this site and there may never be one, so today nothing anywhere
// can answer the only two questions that matter about a booking form built for a
// bereaved brother: DID AN ENQUIRY ARRIVE, AND DID ANYBODY FIND OUT ABOUT IT.
// This module answers exactly those two, and it answers them with integers that
// outlive the request that produced them.
//
// It is NOT analytics. It has no session, no visitor, no page, no referrer, no
// identifier of any kind — it cannot have one, because it stores nothing but a
// count per (outcome, language) pair. A funnel that cannot name a person is the
// only funnel worth putting on a memorial site.
//
// ── WHAT IS ACTUALLY STORED ──────────────────────────────────────────────────
// One integer per key, in the SAME managed key-value store the leads themselves
// go to (`KV_REST_API_URL` / `KV_REST_API_TOKEN` — the names, never the values),
// over the SAME REST protocol `./sinks/kv.ts` already proves, through the SAME
// injected transport (`./sinks/http.ts`). No new dependency, no second store, no
// second protocol, no second timeout.
//
//   INCR lead_funnel:<outcome>:<locale>          one command, once per request
//   MGET lead_funnel:...                         one command, to read them all
//
// The prefix is `lead_funnel:` and NOT `lead:funnel:` on purpose: an operator
// recovering enquiries runs `SCAN 0 MATCH lead:*`, and a counter key that turned
// up in that list would be a non-lead in a list of leads.
//
// ── THE ONE FACT, IN ONE PLACE ───────────────────────────────────────────────
// Nothing here stores a total. `attempts`, `stored`, `notified` and the rest are
// all DERIVED, at read time, from the raw per-outcome tallies by `OUTCOME_MEANING`
// — the single table that says what each outcome means. A total cannot drift from
// its parts because a total is never written. Adding an outcome is one row in
// that table and every derived number follows; there is no second place to update
// and therefore no second place to forget.
//
// ── WHY `failed` IS NOT A COUNTER HERE ───────────────────────────────────────
// The brief asked for `attempts · stored · notified · failed`. Three of those are
// below. `failed` is REFUSED, deliberately, because it would name two completely
// different disasters with one word:
//
//   storedButNobodyTold — the enquiry IS SAFE in the store and the notification
//                         did not go out. Nothing is lost. A human must open the
//                         store and call the person back.
//   neverStored         — THE ENQUIRY DOES NOT EXIST. Nobody can call anybody
//                         back, because there is nothing to call back from. This
//                         is the disaster the whole persist-then-notify rebuild
//                         exists to make visible.
//
// A single `failed` of 7 cannot tell a family whether seven people are waiting
// for a call or seven people are gone. So the two are counted apart, named apart,
// and derived apart, and no expression in this file adds them together.
//
// ── WHAT COUNTS AS AN ATTEMPT — the judgement calls, and their defence ───────
// `attempts` is "HOW MANY PEOPLE TRIED TO BOOK A LECTURE". It is a claim about
// human interest, so anything that is not a person trying to book is kept out of
// it — visible in its own tally, but out of the number a family would read as
// interest:
//   · A HONEYPOT HIT IS NOT AN ATTEMPT. It is a bot. Counting bots would tell
//     this family their brother's lectures are in demand when they are not, and
//     that is a cruel way to be wrong. It is still tallied as `discardedBot`,
//     because `route.ts` HONEST LIMIT 4 says an autofill heuristic can trap a
//     REAL PERSON, and a trap that catches humans must at minimum be countable.
//   · A RATE-LIMITED (429) OR OVERSIZE (413) REQUEST IS NOT AN ATTEMPT. Neither
//     reached validation; neither demonstrated an enquiry. A flood of 4,000 would
//     otherwise read as 4,000 interested schools. Tallied as
//     `refusedBeforeReading` so an operator can still see a flood.
//   · AN UNPARSEABLE BODY (400) IS NOT AN ATTEMPT. It is not a submission.
//   · A DUPLICATE REPLAY IS NOT A SECOND ATTEMPT. It is ONE enquiry that the
//     visitor sent twice, and the first send already counted. Tallied as
//     `duplicates`, which is a useful number about the FORM (double-clicks), not
//     about interest.
//   · AN INVALID SUBMISSION (422) IS AN ATTEMPT. A person filled the form in and
//     the form refused them. That is the most actionable number on this page
//     after `stored`, and it is split by language, because a Hebrew-only failure
//     rate is a bug in the form and not a fact about Hebrew speakers.
// The invariant that falls out: attempts = stored + neverStored + refusedByForm.
//
// INVARIANT     COUNTING CANNOT COST THE FAMILY AN ENQUIRY. `recordLeadOutcome`
//               has no failure mode it can hand back: it returns
//               `Promise<void>`, its whole body is inside one `try`, and the
//               `catch` writes a log line and returns. A store that is down, a
//               token that is wrong, a DNS failure, a transport that throws
//               synchronously, an outcome key that does not exist — every one of
//               them ends as a `console.error` and a resolved promise. It holds
//               no Response, imports nothing that can build one, and returns no
//               value any caller could branch on. Its widest possible effect on a
//               booking enquiry is the time it spends waiting.
//
// IMPOSSIBLE    · A FABRICATED COUNT cannot be constructed: the only write is
//                 `INCR` by exactly 1, there is no `SET` and no `INCRBY` in this
//                 file, so no expression here can seed, backfill, estimate or
//                 restate a counter. A number this module reports was produced by
//                 a request that actually happened.
//               · A ZERO THAT MEANS "NOT MEASURED" cannot be constructed either,
//                 and that is the subtler lie. When the store is unconfigured,
//                 `readLeadFunnel` returns `{ measured: false, missing }` — a
//                 shape with NO totals in it at all — rather than a set of
//                 zeroes. There is no `totals` field on that arm to read, so
//                 "nobody enquired" and "nobody was counting" cannot be confused
//                 by a caller that type-checks.
//               · A TOTAL DISAGREEING WITH ITS PARTS cannot be constructed: no
//                 total is stored, every one is a fold over the tallies.
//               · PERSONAL DATA IN THE STORE cannot be constructed: the key is
//                 built from an outcome drawn from a closed union and a locale
//                 narrowed to one of three literals, and the value is the store's
//                 own integer. No name, phone, email, address or free text is in
//                 scope in the writing function — `recordLeadOutcome` is not
//                 given a `LeadRecord` and cannot ask for one.
//
// CLASS         Closed by derivation for the RELATIONSHIP between the tallies and
//               the totals, and for the never-throws guarantee. NOT closed over
//               the store's wire protocol: `["INCR",k]` / `["MGET",...]` and a
//               `{"result":...}` envelope are THIS provider's REST API, exactly
//               as in `./sinks/kv.ts`, and a different provider is a different
//               file. NOT closed over whether the counted outcomes are the RIGHT
//               ones — that is the judgement above, argued rather than proved.
//
// HONEST LIMIT  IN PLAIN WORDS, FOR SOMEBODY WHO DOES NOT WRITE SOFTWARE:
//
//               1. THESE NUMBERS ONLY EXIST IF THE WEBSITE HAS A DATABASE
//                  ATTACHED. The same database that keeps the enquiries keeps the
//                  counts. If nobody has attached one, this does not show you a
//                  zero — it tells you, in so many words, that nothing is being
//                  counted. IF YOU ARE READING A ZERO, IT IS A REAL ZERO: nobody
//                  enquired. If you are reading "not measured", the site is not
//                  counting and you should ask for the database to be attached.
//               2. COUNTING STARTS THE DAY THE DATABASE IS ATTACHED. Enquiries
//                  from before that were never counted and cannot be counted
//                  afterwards. Nothing here will ever guess at them. If the
//                  database is ever emptied or replaced, the counts start again
//                  from zero along with everything else in it.
//               3. THE COUNTS CAN BE SLIGHTLY LOW, NEVER HIGH. If the database
//                  refuses one write, that one request is not counted and the
//                  enquiry is unaffected — an uncounted enquiry is still a stored
//                  enquiry, and a stored enquiry is the thing that matters. This
//                  file will never count something twice.
//               4. THE COUNTS ARE NOT A LIST OF PEOPLE. They cannot tell you who
//                  enquired, when, or from where — only how many, and in which
//                  language. To reach an actual person you open the enquiry store
//                  itself. Nothing here identifies anybody, by design.
//               5. THERE IS NO SCREEN THAT SHOWS THESE NUMBERS YET. `readLeadFunnel`
//                  is the way to read them and something has to call it — a page,
//                  a script, an operator at a console. No such screen exists in
//                  this repository, and building one is owed to the seat. A number
//                  nobody can see is not yet a number the family has.
//               6. A slow database makes the form slower, never broken. The write
//                  below shares `LEAD_HTTP_TIMEOUT_MS` (8 s) with the enquiry
//                  store, so in the worst case a visitor waits that long extra on
//                  a rejected form before being told what to fix. Their enquiry is
//                  never at risk; only their patience is. That cap is one fact in
//                  one place (`./sinks/http.ts`) and is not restated here.
//               7. NOT PROVED AGAINST A REAL STORE. Every test below drives a
//                  fake transport. That `INCR` and `MGET` behave over this
//                  provider's REST API as this file assumes is a deployment fact
//                  no unit test in this repository can establish — the same limit
//                  `./sinks/kv.ts` states for its own `SET`.
// ─────────────────────────────────────────────────────────────────────────────

import type { LeadSinkFailure } from './port';
import {
  classifyHttpStatus,
  createFetchTransport,
  type LeadHttpTransport,
} from './sinks/http';

/* ── Configuration: NAMES, never values ───────────────────────────────────── */

const KV_URL_ENV_VAR = 'KV_REST_API_URL';
const KV_TOKEN_ENV_VAR = 'KV_REST_API_TOKEN';

/** The key prefix. Deliberately NOT `lead:` — see the header. */
const KEY_PREFIX = 'lead_funnel:';

/* ── The outcomes: one row each, and nothing said twice ───────────────────── */

/**
 * What a single request to the lead endpoint turned out to be. Every terminal
 * path of `app/api/lead/route.ts` maps to exactly one of these, and the mapping
 * is made at the call site where the route already knows the answer — never
 * re-derived from a status code, which cannot tell a stored 201 from a honeypot
 * 201 or a fresh enquiry from a replay.
 *
 * The VALUES are the stored key fragments. They appear here and nowhere else.
 */
export const LEAD_OUTCOME = {
  /** Stored, and the owner's notification went out. The healthy path. */
  storedNotified: 'stored_notified',
  /** Stored, and NOBODY WAS TOLD. The enquiry is safe; somebody must go look. */
  storedUnnotified: 'stored_unnotified',
  /** NEVER STORED: the deployment has no store configured. Enquiry gone. */
  lostUnconfigured: 'lost_unconfigured',
  /** NEVER STORED: the store was reachable-but-failing. Enquiry gone. */
  lostTransient: 'lost_transient',
  /** NEVER STORED: the store refused the record. Enquiry gone. */
  lostPermanent: 'lost_permanent',
  /** A person filled the form in and the form refused them (422). */
  refusedByForm: 'refused_by_form',
  /** The same enquiry, sent twice. One enquiry. */
  duplicate: 'duplicate',
  /** The honeypot caught it. Not a person — see the header. */
  discardedBot: 'discarded_bot',
  /** Too big to read (413). Never reached validation. */
  refusedOversize: 'refused_oversize',
  /** Over the per-address rate limit (429). Never reached validation. */
  refusedRateLimited: 'refused_rate_limited',
  /** Not readable or not JSON (400). Not a submission. */
  refusedUnparseable: 'refused_unparseable',
} as const;

export type LeadOutcome = (typeof LEAD_OUTCOME)[keyof typeof LEAD_OUTCOME];

/**
 * THE ONE TABLE. What each outcome MEANS, so that every total below is a fold
 * over this and no total has to be maintained anywhere.
 *
 * `attempt` — does this represent a person who tried to book?
 * `stored`  — does the enquiry exist in the store afterwards?
 * `told`    — was the owner actually notified about it?
 */
type OutcomeMeaning = {
  readonly attempt: boolean;
  readonly stored: boolean;
  readonly told: boolean;
};

const OUTCOME_MEANING: Readonly<Record<LeadOutcome, OutcomeMeaning>> = {
  [LEAD_OUTCOME.storedNotified]: { attempt: true, stored: true, told: true },
  [LEAD_OUTCOME.storedUnnotified]: { attempt: true, stored: true, told: false },
  [LEAD_OUTCOME.lostUnconfigured]: { attempt: true, stored: false, told: false },
  [LEAD_OUTCOME.lostTransient]: { attempt: true, stored: false, told: false },
  [LEAD_OUTCOME.lostPermanent]: { attempt: true, stored: false, told: false },
  [LEAD_OUTCOME.refusedByForm]: { attempt: true, stored: false, told: false },
  [LEAD_OUTCOME.duplicate]: { attempt: false, stored: false, told: false },
  [LEAD_OUTCOME.discardedBot]: { attempt: false, stored: false, told: false },
  [LEAD_OUTCOME.refusedOversize]: { attempt: false, stored: false, told: false },
  [LEAD_OUTCOME.refusedRateLimited]: { attempt: false, stored: false, told: false },
  [LEAD_OUTCOME.refusedUnparseable]: { attempt: false, stored: false, told: false },
};

/** Every outcome, once, in a fixed order — the order `MGET` is asked in. */
const ALL_OUTCOMES: readonly LeadOutcome[] = Object.values(LEAD_OUTCOME);

/**
 * The three store-failure kinds, as the three DIFFERENT never-stored outcomes.
 * The route switches on the same `kind` to choose a status; it must not switch on
 * it a second time to choose a counter, so the mapping lives here.
 */
export function outcomeForStoreFailure(kind: LeadSinkFailure['kind']): LeadOutcome {
  switch (kind) {
    case 'not_configured':
      return LEAD_OUTCOME.lostUnconfigured;
    case 'transient':
      return LEAD_OUTCOME.lostTransient;
    case 'permanent':
      return LEAD_OUTCOME.lostPermanent;
  }
}

/* ── Language ─────────────────────────────────────────────────────────────── */

/**
 * The two languages this site is published in, plus the honest third state for a
 * request that never got far enough to have one.
 */
export const LEAD_LOCALES: readonly LeadCountLocale[] = ['he', 'en', 'unknown'];

export type LeadCountLocale = 'he' | 'en' | 'unknown';

/**
 * The language of a request that never got far enough to have one. A NAMED
 * value, so no call site anywhere spells a counter fragment as a bare string.
 */
export const LOCALE_UNKNOWN: LeadCountLocale = 'unknown';

/**
 * The language of a submission, as CLAIMED by it.
 *
 * Takes either the locale value itself (from a validated payload) or the object
 * it might be on (from a body that failed validation, where there is no payload
 * to read). Anything that is not exactly `he` or `en` is `unknown` — never
 * guessed at, never defaulted to the site's primary language, because a guessed
 * language split is a statistic nobody typed.
 */
export function countLocale(source: unknown): LeadCountLocale {
  if (source === 'he' || source === 'en') return source;
  if (typeof source === 'object' && source !== null && !Array.isArray(source)) {
    const claimed = (source as Record<string, unknown>).locale;
    if (claimed === 'he' || claimed === 'en') return claimed;
  }
  return 'unknown';
}

/* ── The store: one INCR out, one MGET back ───────────────────────────────── */

function key(outcome: LeadOutcome, locale: LeadCountLocale): string {
  return `${KEY_PREFIX}${outcome}:${locale}`;
}

/** Every key, in a fixed order, paired with what it counts. */
function everyKey(): readonly { readonly outcome: LeadOutcome; readonly locale: LeadCountLocale }[] {
  return ALL_OUTCOMES.flatMap((outcome) => LEAD_LOCALES.map((locale) => ({ outcome, locale })));
}

type StoreConfig = { readonly url: string; readonly token: string };

/**
 * The store, or the NAMES of what is missing. Same rule as every other file that
 * reads this environment: present-but-blank counts as missing.
 */
function resolveStore(env: NodeJS.ProcessEnv): StoreConfig | { readonly missing: readonly string[] } {
  const url = (env[KV_URL_ENV_VAR] ?? '').trim();
  const token = (env[KV_TOKEN_ENV_VAR] ?? '').trim();
  const missing = [
    ...(url === '' ? [KV_URL_ENV_VAR] : []),
    ...(token === '' ? [KV_TOKEN_ENV_VAR] : []),
  ];
  return missing.length > 0 ? { missing } : { url, token };
}

/** One REST command. The command is in the BODY, never the path — as in `kv.ts`. */
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
    throw new Error(`lead_funnel_store_http_${response.status}`);
  }

  const parsed: unknown = JSON.parse(response.body);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('lead_funnel_store_body_not_an_object');
  }
  const envelope: { readonly result?: unknown; readonly error?: unknown } = parsed;
  if (typeof envelope.error === 'string') {
    throw new Error('lead_funnel_store_refused_the_command');
  }
  return envelope.result;
}

/* ── Writing ──────────────────────────────────────────────────────────────── */

/**
 * COUNT ONE REQUEST. The only write in this module, and the only one the route
 * ever makes.
 *
 * NEVER THROWS, NEVER REJECTS, RETURNS NOTHING A CALLER CAN BRANCH ON. See the
 * INVARIANT in the header: a store outage, a bad token, a transport that throws
 * synchronously and a transport that rejects all end the same way — one line on
 * stderr and a resolved promise. A bereaved family's booking enquiry does not
 * depend on a statistic being recorded.
 *
 * When no store is configured this does nothing at all. It does not fall back to
 * counting in memory: a serverless instance's memory is destroyed on every cold
 * start and is not shared between instances, so an in-memory total would be a
 * number that quietly resets to near-zero — and a number a grieving family is
 * told to trust, that silently under-reports, is worse than no number. Not
 * counting is honest; counting badly is not.
 */
export async function recordLeadOutcome(
  outcome: LeadOutcome,
  locale: LeadCountLocale,
  env: NodeJS.ProcessEnv = process.env,
  transport: LeadHttpTransport = createFetchTransport(),
): Promise<void> {
  try {
    const store = resolveStore(env);
    if ('missing' in store) return;
    await command(store, transport, ['INCR', key(outcome, locale)]);
  } catch (cause) {
    // Deliberately swallowed, deliberately logged. The enquiry is what matters.
    console.error('[lead] the funnel counter could not record an outcome', cause);
  }
}

/* ── Reading ──────────────────────────────────────────────────────────────── */

/**
 * The derived view. Every field is a fold over the tallies — none is stored.
 *
 * `storedButNobodyTold` and `neverStored` are deliberately two fields and are
 * never summed anywhere in this file. See the header.
 */
export type LeadFunnelTotals = {
  /** People who tried to book. Bots, floods and replays are NOT in here. */
  readonly attempts: number;
  /** Enquiries that exist in the store. */
  readonly stored: number;
  /** Stored AND the owner's notification went out. */
  readonly notified: number;
  /** Stored, and NOBODY WAS TOLD. The enquiry is safe. Somebody must go look. */
  readonly storedButNobodyTold: number;
  /** THE ENQUIRY DOES NOT EXIST. Nobody can call these people back. */
  readonly neverStored: number;
  /** A person filled the form in and the form refused them. */
  readonly refusedByForm: number;
  /** The same enquiry sent twice. A fact about double-clicks, not interest. */
  readonly duplicates: number;
  /** Honeypot hits. Not people — but see `route.ts` HONEST LIMIT 4. */
  readonly discardedBots: number;
  /** Too big, too fast, or not JSON. Never reached validation. */
  readonly refusedBeforeReading: number;
};

export type LeadFunnelReading =
  | {
      /** NOT COUNTING. There are no totals on this arm, on purpose. */
      readonly measured: false;
      /** The environment variable NAMES that are unset. Never their values. */
      readonly missing: readonly string[];
    }
  | {
      readonly measured: true;
      readonly totals: LeadFunnelTotals;
      /** The same numbers split by language. `unknown` is its own bucket. */
      readonly byLocale: Readonly<Record<LeadCountLocale, LeadFunnelTotals>>;
      /** The raw per-outcome, per-language tallies the totals were folded from. */
      readonly tallies: Readonly<Record<string, number>>;
    };

type Tally = { readonly outcome: LeadOutcome; readonly locale: LeadCountLocale; readonly count: number };

/** A stored counter value, as an integer, or 0 when the key was never written. */
function toCount(value: unknown): number {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed) && parsed >= 0) return parsed;
  }
  // `null` for a key that was never incremented, and anything unrecognised. A
  // key nobody ever wrote to is genuinely zero; it is not an estimate.
  return 0;
}

/** THE FOLD. Every total in `LeadFunnelTotals` is computed here and only here. */
function totalsOf(tallies: readonly Tally[]): LeadFunnelTotals {
  const sum = (predicate: (tally: Tally) => boolean): number =>
    tallies.reduce((running, tally) => (predicate(tally) ? running + tally.count : running), 0);
  const is = (outcome: LeadOutcome) => (tally: Tally): boolean => tally.outcome === outcome;
  const meaning = (tally: Tally): OutcomeMeaning => OUTCOME_MEANING[tally.outcome];

  return {
    attempts: sum((tally) => meaning(tally).attempt),
    stored: sum((tally) => meaning(tally).stored),
    notified: sum((tally) => meaning(tally).told),
    storedButNobodyTold: sum(is(LEAD_OUTCOME.storedUnnotified)),
    neverStored: sum((tally) => meaning(tally).attempt && !meaning(tally).stored && tally.outcome !== LEAD_OUTCOME.refusedByForm),
    refusedByForm: sum(is(LEAD_OUTCOME.refusedByForm)),
    duplicates: sum(is(LEAD_OUTCOME.duplicate)),
    discardedBots: sum(is(LEAD_OUTCOME.discardedBot)),
    refusedBeforeReading: sum(
      (tally) =>
        tally.outcome === LEAD_OUTCOME.refusedOversize ||
        tally.outcome === LEAD_OUTCOME.refusedRateLimited ||
        tally.outcome === LEAD_OUTCOME.refusedUnparseable,
    ),
  };
}

/**
 * READ THE FUNNEL. One `MGET` for every counter, then one fold.
 *
 * Returns `{ measured: false }` — a shape with no totals in it — when the store
 * is unconfigured or unreachable, rather than a set of zeroes. "Nobody enquired"
 * and "nobody was counting" are different facts and this type refuses to spell
 * them the same way.
 */
export async function readLeadFunnel(
  env: NodeJS.ProcessEnv = process.env,
  transport: LeadHttpTransport = createFetchTransport(),
): Promise<LeadFunnelReading> {
  const store = resolveStore(env);
  if ('missing' in store) return { measured: false, missing: store.missing };

  const wanted = everyKey();
  let result: unknown;
  try {
    result = await command(
      store,
      transport,
      ['MGET', ...wanted.map(({ outcome, locale }) => key(outcome, locale))],
    );
  } catch (cause) {
    console.error('[lead] the funnel counter could not be read', cause);
    // The store answered badly. Reporting zeroes here would be inventing a
    // statistic, so this reports that nothing was read.
    return { measured: false, missing: [] };
  }

  if (!Array.isArray(result) || result.length !== wanted.length) {
    console.error('[lead] the funnel counter store answered with an unexpected shape');
    return { measured: false, missing: [] };
  }

  const tallies: Tally[] = wanted.map(({ outcome, locale }, index) => ({
    outcome,
    locale,
    count: toCount(result[index]),
  }));

  const byLocale = {
    he: totalsOf(tallies.filter((tally) => tally.locale === 'he')),
    en: totalsOf(tallies.filter((tally) => tally.locale === 'en')),
    unknown: totalsOf(tallies.filter((tally) => tally.locale === 'unknown')),
  };

  const raw: Record<string, number> = {};
  for (const tally of tallies) raw[key(tally.outcome, tally.locale)] = tally.count;

  return { measured: true, totals: totalsOf(tallies), byLocale, tallies: raw };
}
