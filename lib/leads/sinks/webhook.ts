// ─────────────────────────────────────────────────────────────────────────────
// W9-B APPEND-ONLY WEBHOOK LEAD SINK — lib/leads/sinks/webhook.ts
//
// The sink an operator can read without a console, a client library or an
// account with anybody: ONE POST of ONE flat JSON object to ONE URL they supply.
// A Google Apps Script `doPost` bound to a spreadsheet, a Make/n8n/Zapier catch
// hook — all four accept exactly this shape, and the result is a row per
// enquiry in a sheet the family can open on a phone. That is the difference
// between "the lead is gone" and "the lead is line 41".
//
// NO DEPENDENCY IS ADDED. This is `fetch` and `JSON.stringify`, through
// `./http`.
//
// CONFIGURATION — ONE NAME, NEVER A VALUE:
//   LEAD_WEBHOOK_URL   the https endpoint to POST to
// Unset -> this sink does not exist (`resolveWebhookSink` returns `null`) and the
// resolver looks elsewhere. Set to something that is not an https URL -> a sink
// that fails `not_configured` naming it, because a typo'd endpoint must not look
// like a deployment that never wanted a webhook.
//
// ── THE PAYLOAD CONTRACT — build the spreadsheet against this ───────────────
// One POST. `Content-Type: application/json`. The body is a FLAT object of
// exactly TEN string fields, always all ten, always in this order:
//
//   {
//     "id":           "01K5ZQ0000000000000000000",   ULID, sortable = arrival order
//     "receivedAt":   "2026-09-13T04:05:06.000Z",    ISO-8601 UTC
//     "source":       "web_form",                    the enquiry channel
//     "locale":       "he",                          'he' | 'en' - the site language used
//     "name":         "...",                         required, as the visitor typed it
//     "phone":        "...",                         required
//     "email":        "...",                         "" when not given
//     "organization": "...",                         "" when not given
//     "message":      "...",                         "" when not given; may contain newlines
//     "deliveryState":"pending",                     'pending'|'delivered'|'failed'
//   }
//
// Every value is a STRING; an omitted optional field arrives as `""`, never as
// `null` and never missing, so a sheet's columns never shift. `id` and
// `receivedAt` are first because they are the two columns an operator sorts and
// searches by, and `id` is the value that correlates this row with the same lead
// in the key-value store and in the notification email.
//
// STABILITY RULE: this key set is a contract with a human's spreadsheet. A field
// is only ever APPENDED at the end (the operator adds a column and old rows keep
// their meaning). A rename, a reorder or a type change is a BREAKING change to
// someone's sheet and needs the operator told, not a quiet deploy.
//   APPENDED ONCE SO FAR: `deliveryState`, the tenth column, reasoned below.
//   The nine before it did not move and did not change meaning, so an existing
//   sheet keeps working untouched; the operator adds ONE header cell at the
//   right-hand end to see the new value. TELL THEM — that is the rule above.
//
// NOTHING ELSE IS SENT. No secret, no token, no header the operator did not
// configure, no IP address, no user agent, no field the visitor did not provide.
//
// ── WHY `deliveryState` IS NOW A COLUMN — the reasoning that replaces D-60's ─
// This field was ORIGINALLY OMITTED ON PURPOSE, and the stated reason was: "at
// the moment of the write it is always `pending` (persist-then-notify), so a
// column carrying it would be a column that says the same word on every row and
// never updates — a fact this sink cannot observe, presented as one it can."
//
// THAT REASONING WAS TRUE OF ONE WRITE AND FALSE OF THE PIPELINE. It was never
// one write. `app/api/lead/route.ts` persists, notifies, and then re-`store()`s
// the SAME record carrying its settled `deliveryState`. A keyed sink (`./kv`)
// upserts, so the second call updates the record in place. This sink has no key
// — it APPENDS — so the second call was a second row, and it was measured on the
// wire as BYTE-IDENTICAL to the first. A webhook-only deployment therefore got
// two indistinguishable rows per lead AND no record of whether anyone had been
// told, which is precisely the question the second write exists to answer.
//
// So the column is NOT a value this sink cannot observe. It is observed twice,
// and it CHANGES between them. The row count is unchanged by adding it; what
// changed is that the second row now says something. `pending` then `delivered`
// or `failed`, same `id`, is an update the operator can read and sort by: filter
// the sheet to `deliveryState = failed` and you have the leads nobody was
// emailed about — the list of people who still need a phone call.
//
// STILL NOT SENT: the failure `detail`. See `LeadWebhookPayload` below.
//
// INVARIANT     One `store()` call is at most ONE POST to the configured URL,
//               with a body that is the ten-key object above built from
//               `record` — and `{ stored: true }` is returned for exactly one
//               observable event: that POST resolving with a 2xx status. The
//               echoed id is `record.id`, the same string that is in the `id`
//               field of the body just sent. Every field is read from `record`
//               and none is inferred from how many times `store()` has been
//               called: this sink holds no memory of a lead between calls, so
//               two POSTs for one enquiry are two honest renderings of two
//               different record states, not a first and a duplicate.
//
// IMPOSSIBLE    A payload that drifts from the documented shape cannot be built
//               ACCIDENTALLY: the body is assembled by one function, from the
//               typed `LeadRecord`, with every field named explicitly — so a
//               field added to `Lead` upstream does NOT silently appear in an
//               operator's sheet, and a field removed upstream is a compile
//               error here rather than a column of `undefined`. (This is the
//               deliberate opposite of `./kv`, which stores the record whole.)
//               Also out of reach by construction:
//                 · sending over plaintext http — the scheme is checked before
//                   any sink exists, so there is no code path that POSTs
//                   personal data to an `http:` URL;
//                 · an id this file invented — `newLeadId` is not imported;
//                 · a secret on the wire or in a log — this file reads exactly
//                   one variable, that variable IS the endpoint, and it is never
//                   put in a `detail`, a log line or an error message. This file
//                   contains no `console` call at all.
//
// CLASS         THIS INSTANCE for the ten-key shape — it is a contract with one
//               operator's spreadsheet, and a different consumer wants different
//               columns. The DERIVATION is everything around it: env NAME owned
//               by the module, transport injected, three failure kinds, success
//               echoing `record.id` — identical to `./kv` and enforced by
//               `LeadSink`, so a third sink cannot introduce a fourth convention.
//
// HONEST LIMIT  A 2xx FROM A WEBHOOK IS NOT PROOF OF A ROW. Unlike the key-value
//               store, an operator endpoint has no agreed success envelope: a
//               Google Apps Script that throws inside `doPost` can still answer
//               200, and this sink will report the lead stored. That is the
//               weakest claim any sink here makes, it is why this sink is meant
//               to run ALONGSIDE the key-value store rather than instead of it,
//               and it cannot be closed from this side — it needs the operator's
//               script to answer a documented body, which is their code, not
//               this repository's. Six further limits, deliberately:
//               (1) NO AUTHENTICATION. The URL is the capability: anyone who
//               learns it can append rows. That is how Apps Script, Make, n8n and
//               Zapier hooks work, and a shared-secret header would be a second
//               secret to configure and a second thing that could be logged. If
//               the endpoint ever needs one, it is a second env NAME and an extra
//               header — one small change in this file.
//               (2) NO RETRY and no queue: one POST, one verdict. `transient`
//               says a retry could work; nobody here retries (`port.ts` limit 1).
//               (3) REDIRECTS ARE FOLLOWED by the platform `fetch`, which is what
//               makes Apps Script work at all (it answers 302 to
//               `script.googleusercontent.com`). The status this sink classifies
//               is therefore the FINAL one, and a hijacked redirect chain is not
//               something it can detect.
//               (4) NO ORDERING GUARANTEE. Two enquiries a millisecond apart may
//               append in either order; `receivedAt` and the ULID `id` are the
//               truth of arrival order, not the row number.
//               (5) TWO ROWS PER LEAD, AND THIS SINK CANNOT MAKE IT ONE. The
//               route writes the record twice — once on arrival, once with the
//               notification settled — and an append-only endpoint has no key to
//               update, so the sheet gets a `pending` row and then a
//               `delivered`/`failed` row with the SAME `id`. The second
//               supersedes the first; the pair is an update, not two enquiries.
//               THE HONEST PART: an operator who sorts by `id` sees the pair
//               together and a filter on `deliveryState` reads cleanly, but
//               anyone who just scrolls sees every name twice, and this file
//               cannot fix that. Collapsing the pair means the route not asking
//               a keyless sink for a delivery state at all, which needs
//               `LeadSink` to be able to SAY it cannot record one — a change to
//               `../../port.ts`, deliberately not made here. Until then the
//               tenth column is what makes the second row worth its space.
//               (6) `https:` is enforced, `localhost` is not exempted. An
//               operator running a local n8n over plaintext cannot use this sink
//               as written. The reversal is one comparison in `isUsableEndpoint`,
//               and it was refused on purpose: this body is personal data.
// ─────────────────────────────────────────────────────────────────────────────

import type { LeadSink, LeadStoreResult } from '../port';
import type { LeadRecord } from '../types';

import {
  classifyHttpStatus,
  createFetchTransport,
  type LeadHttpResponse,
  type LeadHttpTransport,
} from './http';
import { createUnconfiguredLeadSink } from './unconfigured';

/* ── Configuration: a NAME, never a value ─────────────────────────────────── */

const WEBHOOK_URL_ENV_VAR = 'LEAD_WEBHOOK_URL';

/** Everything this adapter reads from the environment. Names only. */
export const WEBHOOK_ENV_VARS: readonly string[] = [WEBHOOK_URL_ENV_VAR];

/** Operator-facing label for logs. Nothing branches on it (`port.ts` limit 5). */
export const WEBHOOK_SINK_NAME = 'webhook';

/* ── The payload ──────────────────────────────────────────────────────────── */

/**
 * The wire shape, stated as a type so the documented contract and the sent bytes
 * are the same fact. Nine required strings; see the header for what a sheet
 * should do with each.
 */
export type LeadWebhookPayload = {
  readonly id: string;
  readonly receivedAt: string;
  readonly source: string;
  readonly locale: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly organization: string;
  readonly message: string;
  /**
   * `'pending' | 'delivered' | 'failed'` — the WORD, never the reason. The
   * `detail` on a failed `LeadDeliveryState` is operator log text that may name
   * an environment variable, and `app/api/lead/route.ts` deliberately refuses to
   * put that in a public response; a spreadsheet an anonymous URL can append to
   * is not a safer place for it. So: the status only.
   */
  readonly deliveryState: string;
};

/**
 * Flatten a record into the operator's row. Field by field on purpose: a new
 * field upstream cannot leak into someone's spreadsheet without an edit here.
 *
 * The locale is `record.payload.locale` — the record has no second locale field,
 * and that is the one place it is stated (`types.ts` INVARIANT).
 */
export function toWebhookPayload(record: LeadRecord): LeadWebhookPayload {
  return {
    id: record.id,
    receivedAt: record.receivedAt,
    source: record.source,
    locale: record.payload.locale,
    name: record.payload.name,
    phone: record.payload.phone,
    email: record.payload.email,
    organization: record.payload.organization,
    message: record.payload.message,
    deliveryState: record.deliveryState.status,
  };
}

/* ── The adapter ──────────────────────────────────────────────────────────── */

/**
 * Is this string an endpoint personal data may be POSTed to? Parseable, and
 * `https:`. See HONEST LIMIT 5 for what that deliberately excludes.
 */
function isUsableEndpoint(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  return parsed.protocol === 'https:';
}

function createWebhookLeadSink(url: string, transport: LeadHttpTransport): LeadSink {
  return {
    name: WEBHOOK_SINK_NAME,

    async store(record: LeadRecord): Promise<LeadStoreResult> {
      const request = {
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toWebhookPayload(record)),
      } as const;

      let response: LeadHttpResponse;
      try {
        response = await transport(request);
      } catch (cause) {
        return {
          stored: false,
          failure: {
            kind: 'transient',
            detail: `${WEBHOOK_SINK_NAME}: request to the webhook failed`,
            cause,
          },
        };
      }

      const classification = classifyHttpStatus(response.status);
      if (classification !== 'ok') {
        // The endpoint is NEVER named here: a failure detail reaches an operator
        // log, and the URL is deployment configuration.
        return {
          stored: false,
          failure: {
            kind: classification,
            detail: `${WEBHOOK_SINK_NAME}: endpoint answered HTTP ${response.status}`,
          },
        };
      }

      // A 2xx is all the evidence this protocol offers. See the HONEST LIMIT.
      return { stored: true, id: record.id };
    },
  };
}

/**
 * Resolve the webhook sink from the environment.
 *
 *   · unset            -> `null`: no webhook wanted; the resolver looks elsewhere.
 *   · set, not https   -> a sink that fails `not_configured` NAMING the variable.
 *   · set, https       -> the adapter.
 */
export function resolveWebhookSink(
  env: NodeJS.ProcessEnv,
  transport: LeadHttpTransport = createFetchTransport(),
): LeadSink | null {
  const url = (env[WEBHOOK_URL_ENV_VAR] ?? '').trim();

  if (url === '') {
    return null;
  }

  if (isUsableEndpoint(url) === false) {
    return createUnconfiguredLeadSink(
      WEBHOOK_SINK_NAME,
      [WEBHOOK_URL_ENV_VAR],
      `${WEBHOOK_SINK_NAME}: ${WEBHOOK_URL_ENV_VAR} is set but is not an https URL`,
    );
  }

  return createWebhookLeadSink(url, transport);
}
