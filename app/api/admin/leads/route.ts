// ─────────────────────────────────────────────────────────────────────────────
// W16-B THE READ-BACK ENDPOINT — app/api/admin/leads/route.ts
//
// THE MOST DANGEROUS ROUTE ON THIS SITE, AND THE REASON IT EXISTS ANYWAY.
//
// Before this file, `lib/leads/log.ts` HONEST LIMIT 5 was the truth of the whole
// funnel: "THERE IS NO SCREEN THAT SHOWS THESE NUMBERS YET ... A number nobody
// can see is not yet a number the family has." An enquiry from a school could sit
// in the store with its notification e-mail failed — safe, recoverable, a person
// waiting for a reply — and nothing in this repository could discover it. This
// route is the discovery.
//
// It also lists, on a memorial site, the arrival of messages from bereaved
// families. So every decision below is made twice: once for the operator who
// needs the answer, and once for what a leaked response would cost the people in
// the store.
//
// ── THE GATE. Read this before changing anything. ────────────────────────────
// ONE environment variable NAME, `LEAD_ADMIN_TOKEN`, and NOTHING ELSE opens this
// route. There is no default, no fallback, no development bypass, no
// `NODE_ENV === 'development'` branch, and no second accepted credential. Grep
// this file: the only place `process.env` is read is `configuredToken()`, and the
// only value it is compared against is what that function returned.
//
// WHEN THE VARIABLE IS UNSET OR BLANK THE ROUTE IS NOT THERE. It answers `404`
// with `{"error":"not_found"}` — the same answer a URL that does not exist gets.
// It does NOT answer 401, and that is deliberate: a 401 means "present a
// credential and you may pass", which would be a lie when no credential in the
// world can pass. Worse, it would tell a prober that a token exists and is worth
// hunting. An unconfigured deployment does not have a locked door; it has no
// door.
//
// ── WHAT THE DENIAL BODIES ARE, EXACTLY ──────────────────────────────────────
// Two byte strings, both constants in this file, both with nothing in them:
//
//   401 -> {"error":"unauthorized"}      wrong token, missing token, empty token
//   404 -> {"error":"not_found"}         LEAD_ADMIN_TOKEN unset or blank
//
// No count. No id. No field name. No environment variable name. No `WWW-
// Authenticate` realm. Nothing that says whether the store is attached, whether
// any enquiry exists, or whether the token was close. The 401 for "wrong token"
// and the 401 for "no token at all" are the SAME bytes, so a prober cannot learn
// that a supplied token was even the right shape.
//
// ── METADATA ONLY, AND WHY THAT MAKES THE LINK SAFE TO CARRY ─────────────────
// The body carries enquiry references, dates, languages and delivery states. It
// carries NO name, NO phone number, NO e-mail address, NO organisation and NO
// message text. That is enforced upstream by `lib/leads/recover.ts`, whose
// `StoredLeadSummary` type has no field such a value could be assigned to, so
// this file cannot leak one even by accident.
//
// That decision is what makes the ACCESS decision below defensible, and the two
// must be changed together or not at all.
//
// ── ACCESS: A HEADER *AND* A QUERY PARAMETER. The uncomfortable one. ─────────
// The token is accepted from `Authorization: Bearer <token>`, from
// `X-Lead-Admin-Token: <token>`, and from `?token=<token>`.
//
// The query parameter is a real cost and it is not hidden: a URL ends up in
// browser history, in a bookmark, in a `Referer` on any outbound link, and
// possibly in a proxy or platform access log. Every security guide says do not
// do it, and in most systems they are right.
//
// It is accepted here because of who has to read this. The reader is Ravid's
// family. They are not going to set an HTTP header. A page that only `curl` can
// open is a page that only an engineer can open, and the entire defect this wave
// closes is A NUMBER NOBODY CAN REACH — replacing it with a differently
// unreachable number would be the same failure wearing better clothes.
//
// The cost is paid down rather than denied: the response contains no personal
// data at all, so the worst case of a leaked link is that a stranger learns how
// many enquiries arrived and when. Unpleasant; survivable. The worst case of the
// alternative — an operator who gives up and pastes the store's OWN credentials
// into something, or a family who never learns somebody is waiting — is worse.
// `Cache-Control: no-store` and `Referrer-Policy: no-referrer` are set on every
// response below to remove the two leaks this file can actually remove.
//
// ── HTML OR JSON ─────────────────────────────────────────────────────────────
// A browser that asks for HTML gets a page of SENTENCES; everything else gets
// JSON. The page is plain inline-styled HTML with no class names, no Tailwind and
// no component import, because a class name is a promise that something else
// defines it — this project has already shipped an invisible button off exactly
// that assumption (`bg-gold`, undefined, emitting nothing, with every gate
// green). Inline `style` attributes cannot be undefined by a config file.
//
// INVARIANT     THIS ROUTE CANNOT ANSWER 200 WITHOUT A CORRECT CONFIGURED
//               TOKEN. There is exactly one `return` in this file that carries a
//               body built from lead data, it is at the end of one straight-line
//               function, and every path to it passes through `authorise()`,
//               which returns a `Response` — not a boolean — on every refusal.
//               A refusal is therefore returned, not evaluated: forgetting to
//               branch on it is a type error, because the value IS the answer.
//
// IMPOSSIBLE    · A DEFAULT TOKEN cannot be CONSTRUCTED: `configuredToken()`
//                 returns `string | null` and has no `??` and no literal
//                 fallback; the null flows to a 404 and there is no other
//                 producer of a token in the file.
//               · A DENIAL THAT LEAKS cannot be constructed: both denial bodies
//                 are module-level `const` strings with no interpolation in
//                 them. There is no expression anywhere in this file that puts a
//                 count, an id, a field name or an environment variable name
//                 into a non-200 body.
//               · PERSONAL DATA IN A 200 cannot be constructed either — see
//                 above; the type it would have to live in has no such field.
//               · A CACHED ANSWER cannot be constructed: `dynamic` is
//                 `force-dynamic` and every response sets `Cache-Control:
//                 no-store`, including the denials.
//
// CLASS         Closed by derivation for "no correct token, no data", for the
//               denial bodies, and for the absence of personal data. NOT closed
//               over the SECRECY of the token itself — a token in a URL is a
//               token in a log, and no code in this file can reach a log it does
//               not own. NOT closed over authorisation beyond a shared secret:
//               there are no users, no roles and no audit trail here.
//
// HONEST LIMIT  1. A SHARED SECRET IS NOT AN IDENTITY. Anybody holding the
//                  string is "the operator". There is no record of who looked,
//                  and revoking access means changing the variable for everyone.
//               2. THE TOKEN IN A URL IS A REAL RISK, argued above, not denied.
//                  If this site ever lists anything personal, the query
//                  parameter must be deleted in the same change.
//               3. NOTHING HERE RATE-LIMITS. `app/api/lead/route.ts` limits its
//                  own path; this route does not, so a token can be guessed at
//                  as fast as the platform allows. The mitigation is the token's
//                  length, which this file cannot enforce — it can only refuse
//                  to invent one.
//               4. THE PAGE IS ENGLISH ONLY. The site is Hebrew-first and these
//                  sentences are not translated. Hebrew belongs in `messages/`,
//                  which is out of this delegate's write-set; the strings are
//                  generated in `lib/leads/recover.ts` and moving them is a
//                  later, single change. Named, not hidden.
//               5. IT IS A READ, NOT A REPAIR. It tells a human somebody is
//                  waiting. Somebody still has to make the call. There is no
//                  retry and no queue behind this route.
//               6. THE CONSTANT-TIME COMPARISON IS OVER SHA-256 DIGESTS, not
//                  over the raw strings — see `tokenMatches()`. That is done to
//                  keep the comparison length-independent without adding a
//                  dependency. It is honest about what it buys: an attacker
//                  cannot time-slice the token, but the hashing itself is not
//                  claimed to be side-channel free.
//               7. NOT PROVED AGAINST A REAL STORE, for the same reason
//                  `lib/leads/recover.ts` says so: every test drives a fake
//                  transport.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash, timingSafeEqual } from 'node:crypto';

import {
  reconcileLeads,
  type LeadAlarm,
  type LeadReconciliation,
} from '@/lib/leads/recover';

/** `node:crypto` and `process.env` both need the Node runtime, not the Edge one. */
export const runtime = 'nodejs';

/** Never cached, never statically rendered. A stale answer here is a wrong one. */
export const dynamic = 'force-dynamic';

/* ── Configuration: the NAME, never the value ─────────────────────────────── */

/**
 * THE ONLY VARIABLE THAT OPENS THIS ROUTE. There is no second one and no
 * default. Unset or blank means the route does not exist.
 */
const ADMIN_TOKEN_ENV_VAR = 'LEAD_ADMIN_TOKEN';

/** Where a caller may put the token. Documented in the header; argued there. */
const BEARER_PREFIX = 'Bearer ';
const TOKEN_HEADER = 'x-lead-admin-token';
const TOKEN_QUERY_PARAM = 'token';

/* ── The denial bodies. Constants. Nothing is interpolated into them. ─────── */

/** Wrong token, missing token, empty token. All three. The same bytes. */
const UNAUTHORIZED_BODY = '{"error":"unauthorized"}';

/** `LEAD_ADMIN_TOKEN` unset or blank: there is no door here. */
const NOT_FOUND_BODY = '{"error":"not_found"}';

/** On every response, denials included. Removes the two leaks this file owns. */
const SAFE_HEADERS: Readonly<Record<string, string>> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
};

function jsonResponse(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: { ...SAFE_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function htmlResponse(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: { ...SAFE_HEADERS, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/* ── The gate ─────────────────────────────────────────────────────────────── */

/**
 * The configured token, or `null` when this deployment did not configure one.
 *
 * Blank-after-trim counts as unset — the same rule `lib/leads/sinks/kv.ts` and
 * `app/api/lead/route.ts` apply, because a variable set to a space is a variable
 * somebody meant to set and did not. THE RETURN VALUE IS NEVER LOGGED.
 */
function configuredToken(): string | null {
  const value = (process.env[ADMIN_TOKEN_ENV_VAR] ?? '').trim();
  return value === '' ? null : value;
}

/**
 * The token the caller presented, or `''` when they presented none. Header first,
 * query parameter last, so a caller who can set a header never needs the URL.
 */
function presentedToken(request: Request): string {
  const authorization = request.headers.get('authorization') ?? '';
  if (authorization.startsWith(BEARER_PREFIX)) {
    return authorization.slice(BEARER_PREFIX.length).trim();
  }

  const header = request.headers.get(TOKEN_HEADER);
  if (header !== null && header.trim() !== '') return header.trim();

  try {
    return (new URL(request.url).searchParams.get(TOKEN_QUERY_PARAM) ?? '').trim();
  } catch {
    return '';
  }
}

/**
 * CONSTANT-TIME COMPARISON — and precisely what that claim covers.
 *
 * `timingSafeEqual` is constant time but THROWS when the two buffers differ in
 * length, which would turn the token's length into an observable. Both sides are
 * therefore hashed to a fixed 32 bytes first and the digests are compared. The
 * comparison of the digests is constant time and length-independent.
 *
 * What is NOT claimed: that `createHash` itself is side-channel free, or that
 * the surrounding request handling has no timing signal. Claiming more than the
 * primitive gives is the failure mode this project calls Law 8.
 *
 * No new dependency: `node:crypto` ships with the runtime.
 */
function tokenMatches(presented: string, configured: string): boolean {
  const left = createHash('sha256').update(presented, 'utf8').digest();
  const right = createHash('sha256').update(configured, 'utf8').digest();
  return timingSafeEqual(left, right);
}

/**
 * The refusal, or `null` to continue. A `Response`, not a boolean: the value IS
 * the answer, so a caller cannot forget to act on it.
 *
 * Order matters and is load-bearing. The "is this route configured at all"
 * question is answered BEFORE the token is looked at, so an unconfigured
 * deployment answers 404 identically whether or not a token was presented.
 */
function authorise(request: Request, wantsHtml: boolean): Response | null {
  const configured = configuredToken();
  if (configured === null) {
    return wantsHtml
      ? htmlResponse(404, '<!doctype html><title>Not Found</title><p>Not Found')
      : jsonResponse(404, NOT_FOUND_BODY);
  }

  const presented = presentedToken(request);
  if (presented === '' || !tokenMatches(presented, configured)) {
    return wantsHtml
      ? htmlResponse(401, '<!doctype html><title>Unauthorized</title><p>Unauthorized')
      : jsonResponse(401, UNAUTHORIZED_BODY);
  }

  return null;
}

/* ── Rendering ────────────────────────────────────────────────────────────── */

/**
 * Does this caller want a page, or data? ONE RULE, deliberately: the `Accept`
 * header names `text/html` explicitly. Nothing else.
 *
 * A browser address bar sends `text/html,...`; `curl` and `fetch()` send a
 * wildcard `Accept` with no `text/html` in it, so a script gets JSON without
 * having to ask for it and without a flag. A quality-
 * value negotiation would be more correct and less predictable, and an operator
 * cannot debug a rule they cannot restate in one sentence.
 */
function prefersHtml(request: Request): boolean {
  return (request.headers.get('accept') ?? '').includes('text/html');
}

/** Minimal HTML escaping. Every interpolation below goes through it. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const SEVERITY_COLOUR: Readonly<Record<string, string>> = {
  lost: '#b00020',
  waiting: '#a85400',
  not_measured: '#5a4a00',
  disagreement: '#3a4a5a',
};

function renderAlarm(alarm: LeadAlarm): string {
  const colour = SEVERITY_COLOUR[alarm.severity] ?? '#333333';
  const ids =
    alarm.ids === undefined || alarm.ids.length === 0
      ? ''
      : `<p style="margin:8px 0 0;font:13px/1.6 ui-monospace,Menlo,Consolas,monospace;word-break:break-all">${escapeHtml(
          alarm.ids.join(' '),
        )}</p>`;
  return `<li style="margin:0 0 14px;padding:14px 16px;border-left:5px solid ${colour};background:#fbfbfb"><p style="margin:0;font:16px/1.6 Georgia,serif;color:${colour}">${escapeHtml(
    alarm.sentence,
  )}</p>${ids}</li>`;
}

/**
 * The page. Sentences first, table second — because the reader is a family and
 * the question is "does anybody need a call back?", not "what are the counts?".
 */
function renderPage(view: LeadReconciliation): string {
  const alarms =
    view.alarms.length === 0
      ? '<p style="margin:0;padding:14px 16px;border-left:5px solid #2e6b3e;background:#fbfbfb;font:16px/1.6 Georgia,serif">Nothing needs your attention.</p>'
      : `<ul style="list-style:none;margin:0;padding:0">${view.alarms.map(renderAlarm).join('')}</ul>`;

  const rows = view.store.measured
    ? view.store.leads
        .map(
          (lead) =>
            `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font:13px ui-monospace,Menlo,Consolas,monospace">${escapeHtml(
              lead.id,
            )}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${escapeHtml(
              lead.receivedAt,
            )}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${escapeHtml(
              lead.locale,
            )}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${escapeHtml(
              lead.delivery.status,
            )}</td></tr>`,
        )
        .join('')
    : '<tr><td colspan="4" style="padding:10px">The enquiry store was not read. This is not an empty list.</td></tr>';

  return [
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta name="robots" content="noindex,nofollow"><title>Enquiries</title>',
    '<main style="max-width:820px;margin:0 auto;padding:28px 18px;font:16px/1.6 Georgia,serif;color:#1a1a1a;background:#ffffff">',
    '<h1 style="font:600 22px/1.4 Georgia,serif;margin:0 0 6px">Enquiries</h1>',
    '<p style="margin:0 0 22px;font:14px/1.6 Georgia,serif;color:#555">This page shows whether anybody is waiting for a reply. It deliberately shows no names, phone numbers, e-mail addresses or messages.</p>',
    alarms,
    '<h2 style="font:600 17px/1.4 Georgia,serif;margin:26px 0 8px">Every enquiry in the store</h2>',
    '<div style="overflow-x:auto"><table style="border-collapse:collapse;width:100%;font:14px/1.6 Georgia,serif">',
    '<thead><tr><th style="text-align:left;padding:6px 10px;border-bottom:2px solid #333">Reference</th><th style="text-align:left;padding:6px 10px;border-bottom:2px solid #333">Arrived</th><th style="text-align:left;padding:6px 10px;border-bottom:2px solid #333">Language</th><th style="text-align:left;padding:6px 10px;border-bottom:2px solid #333">Anybody told?</th></tr></thead>',
    `<tbody>${rows}</tbody></table></div>`,
    '</main>',
  ].join('');
}

/* ── The handler ──────────────────────────────────────────────────────────── */

/**
 * LIST STORED ENQUIRIES WITH THEIR DELIVERY STATE, AND RECONCILE THEM AGAINST
 * THE COUNTERS.
 *
 * Straight line: decide the shape, authorise, read, render. There is no early
 * data access, no caching layer and no branch that reaches `reconcileLeads`
 * before `authorise` has returned `null`.
 */
export async function GET(request: Request): Promise<Response> {
  const wantsHtml = prefersHtml(request);

  const refusal = authorise(request, wantsHtml);
  if (refusal !== null) return refusal;

  const view = await reconcileLeads();

  if (wantsHtml) return htmlResponse(200, renderPage(view));
  return jsonResponse(200, JSON.stringify(view));
}

/**
 * HEAD goes through exactly the same gate. Next would otherwise synthesise one
 * from `GET`, which is fine — this exists so the gate is stated for it too, and
 * so a HEAD cannot become a way to probe for a 200 without a token.
 */
export async function HEAD(request: Request): Promise<Response> {
  const response = await GET(request);
  return new Response(null, { status: response.status, headers: response.headers });
}
