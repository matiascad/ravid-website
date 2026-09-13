// ─────────────────────────────────────────────────────────────────────────────
// W5-A LEAD ENDPOINT — app/api/lead/route.ts
//
// The server half of the only path from a visitor to a booking. The client half
// (components/sections/LeadForm.tsx) treats ONLY `response.ok === true` as
// success and shows a prefilled WhatsApp fallback on everything else. This file
// is the other side of that contract, and it exists because both sites being
// replaced told the user a lead was delivered when it was not:
//
//   DEFECT 1 (_legacy/components/TuvalMemorialLanding.tsx:30-45) — an alert()
//   claiming receipt, zero network calls. There was no endpoint at all.
//   DEFECT 2 (ravid_website1/src/components/FormSection.tsx:19-37) — posts to a
//   third party and never inspects the response, so a 4xx/5xx renders success.
//   That defect is reproduced at THIS layer by any handler that returns 200
//   without having read what the mail provider said. See `createResendMailer`.
//
// INVARIANT     There is exactly ONE expression in this file that produces a 2xx
//               — the single `accepted()` call in `handleLead` — and it is
//               reachable only on the line AFTER `await resolution.mailer.send(
//               lead)` has resolved, inside a `try` whose `catch` returns 502.
//               So "the client is told the lead was sent" and "the provider
//               accepted the lead" are the same fact, stated once. Every other
//               terminal path returns 4xx (the client could not be understood) or
//               5xx (we could not deliver), and each carries a machine-readable
//               `error` code. The provider is reached only through the
//               `LeadMailer` interface; the route never names Resend.
//
// IMPOSSIBLE    The lie both existing sites tell can no longer be CONSTRUCTED
//               here. Specifically out of reach:
//                 · a 200 for an unparsed body — `send` is called only with the
//                   OUTPUT of `leadSchema.safeParse`, so no unvalidated value
//                   exists in scope at the call site;
//                 · a 200 when the provider is unconfigured — the discriminated
//                   `MailerResolution` has no `mailer` field to call on the
//                   `configured: false` branch, so "send anyway" is a type error,
//                   not a judgement call (tonight, with no key in the
//                   environment, this endpoint returns 503 and says so);
//                 · a 200 when the provider REJECTED the mail — the adapter
//                   inspects `response.ok` and throws on false, which is Defect 2
//                   closed at the layer where it lives;
//                 · a thrown request — a body that is absent, truncated, or not
//                   JSON is a 400, because the only `JSON.parse` in the file is
//                   inside a `try`;
//                 · an unbounded read — the raw body is length-checked BEFORE it
//                   is parsed.
//
// CLASS         Closed by derivation for DELIVERY HONESTY on this route: the 2xx
//               is produced at one site, gated by one awaited `send`, and the
//               provider sits behind one interface, so a future second provider
//               (SendGrid, SMTP, a queue) is a new `LeadMailer` plus one line in
//               `resolveMailer` and cannot introduce a new success path. NOT a
//               closure over DELIVERABILITY — see the limit.
//
// HONEST LIMIT  A 200 here means the PROVIDER ACCEPTED the message, never that a
//               human read it. Spam filing, a wrong `LEAD_TO_EMAIL`, an
//               unverified sending domain and a provider that accepts and later
//               drops are all invisible from inside this process, and no status
//               code can see them. Four further limits, deliberately:
//               (1) NO ABUSE GUARD. There is no rate limit, CAPTCHA, honeypot or
//               origin check. The two guards present — a 16 KiB raw-body cap and
//               the per-field caps in lib/validation.ts — bound the cost of ONE
//               request and stop nothing about their NUMBER: a script can post
//               ten thousand valid leads and this route will mail every one. A
//               real guard needs shared state (the in-memory counter that is the
//               obvious reflex is false comfort on serverless: each instance
//               counts alone) or a client token, and the client contract is
//               frozen with no honeypot field. Out of scope, named rather than
//               left unmentioned, and owed to the seat.
//               (2) NO CSRF/CONTENT-TYPE CHECK. Any origin may post JSON here; a
//               cross-site form post is rejected only incidentally, by failing to
//               be JSON. The blast radius is a mail to the site owner, never a
//               state change on a user's behalf.
//               (3) NO RETRY, NO QUEUE, NO PERSISTENCE. A lead the provider
//               rejects is a 502 and is then GONE from the server's point of
//               view; recovery is entirely the client's WhatsApp fallback. There
//               is no database, so a lead lost to a provider outage is lost.
//               (4) NO DELIVERY LOG beyond `console.error`. Whatever the host
//               retains of stderr is the whole audit trail; this file creates no
//               record that a given lead arrived.
//               Also: this handler is NOT proved by `npm run build` here (that
//               gate belongs to another delegate), and the three environment
//               variable names it reads are a runtime contract that no test in
//               this repo can prove a deployment satisfies.
// ─────────────────────────────────────────────────────────────────────────────

import { LEAD_TO_EMAIL_ENV_VAR } from '@/config/site';
import { formatIssues, leadSchema, type Lead, type LeadIssue } from '@/lib/validation';

/** This route reads `process.env` and sends mail per request; never prerender it. */
export const dynamic = 'force-dynamic';

/* ── The delivery boundary ────────────────────────────────────────────────── */

/**
 * The ONLY way this route can deliver a lead. One method, one argument, no
 * provider vocabulary: swapping Resend for SMTP or a queue is a new
 * implementation of this interface and touches nothing above it.
 *
 * `send` RESOLVES only when the provider has accepted the message, and THROWS
 * on every other outcome — including an HTTP error response, which is the exact
 * case the customer's site ignores.
 */
interface LeadMailer {
  send(lead: Lead): Promise<void>;
}

/**
 * Configured, or not — and when not, WHICH environment variables are missing.
 * A discriminated union rather than `LeadMailer | null` so that the unconfigured
 * branch has no `mailer` to call: "send anyway" is unrepresentable.
 */
type MailerResolution =
  | { readonly configured: true; readonly mailer: LeadMailer }
  | { readonly configured: false; readonly missing: readonly string[] };

/* ── Environment contract: NAMES only, never values ───────────────────────── */

/** The provider credential. Read from the environment at request time. */
const API_KEY_ENV_VAR = 'RESEND_API_KEY';

/**
 * The recipient. The NAME comes from `@/config/site`, which already declares it
 * (`LEAD_TO_EMAIL_ENV_VAR`) — one fact, one place, no second spelling here.
 */
const TO_ENV_VAR = LEAD_TO_EMAIL_ENV_VAR;

/**
 * The verified sending identity the provider requires. Not yet declared in
 * `@/config/site` (that file is outside this delegate's write-set); adding it
 * there is one line and is owed to the seat, at which point this constant
 * becomes an import like `TO_ENV_VAR` above.
 */
const FROM_ENV_VAR = 'LEAD_FROM_EMAIL';

const PROVIDER_ENDPOINT = 'https://api.resend.com/emails';

/* ── Transport limits ─────────────────────────────────────────────────────── */

/**
 * The raw body cap, applied BEFORE `JSON.parse`. The per-field caps in
 * lib/validation.ts cannot help here: they run after parsing, and parsing is
 * itself the cost a 10 MB body is trying to impose. 16 KiB is four times the
 * largest lead the field caps admit.
 */
const MAX_BODY_CHARS = 16 * 1024;

/* ── The provider adapter ─────────────────────────────────────────────────── */

/** Plain text, because a lead is data to read, not a document to render. */
function renderLead(lead: Lead): string {
  return [
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email === '' ? '(not supplied)' : lead.email}`,
    `Organization: ${lead.organization === '' ? '(not supplied)' : lead.organization}`,
    `Site language: ${lead.locale}`,
    '',
    'Message:',
    lead.message === '' ? '(none)' : lead.message,
  ].join('\n');
}

/**
 * One implementation of `LeadMailer`.
 *
 * THE LINE THAT SEPARATES THIS FILE FROM DEFECT 2 is the `response.ok !== true`
 * check below. `fetch` resolves happily on 401, 422 and 500; a provider adapter
 * that omits this check reports every rejection as a delivered lead, which is
 * the customer's bug moved one layer down.
 *
 * Header injection is not defended against HERE: `lead.name` reaches the Subject
 * and `lead.email` reaches Reply-To, and both arrive already screened for CR/LF
 * by lib/validation.ts. That screen is load-bearing for this function.
 */
function createResendMailer(apiKey: string, to: string, from: string): LeadMailer {
  return {
    async send(lead: Lead): Promise<void> {
      const subject =
        lead.organization === ''
          ? `Speaking enquiry from ${lead.name}`
          : `Speaking enquiry from ${lead.name} (${lead.organization})`;

      const payload: Record<string, unknown> = {
        from,
        to: [to],
        subject,
        text: renderLead(lead),
      };

      // Only a real address may become a Reply-To; an empty one would make every
      // reply bounce, which is a lost lead wearing a delivered lead's clothes.
      if (lead.email !== '') {
        payload.reply_to = lead.email;
      }

      const response = await fetch(PROVIDER_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok !== true) {
        throw new Error(`lead_provider_rejected_${response.status}`);
      }
    },
  };
}

/**
 * Read the environment and either build the mailer or report exactly what is
 * missing. A variable present but blank counts as missing: `LEAD_TO_EMAIL=""`
 * is a misconfiguration, not a recipient.
 */
function resolveMailer(env: NodeJS.ProcessEnv): MailerResolution {
  const apiKey = (env[API_KEY_ENV_VAR] ?? '').trim();
  const to = (env[TO_ENV_VAR] ?? '').trim();
  const from = (env[FROM_ENV_VAR] ?? '').trim();

  const missing: string[] = [];
  if (apiKey === '') missing.push(API_KEY_ENV_VAR);
  if (to === '') missing.push(TO_ENV_VAR);
  if (from === '') missing.push(FROM_ENV_VAR);

  if (missing.length > 0) {
    return { configured: false, missing };
  }
  return { configured: true, mailer: createResendMailer(apiKey, to, from) };
}

/* ── Responses ────────────────────────────────────────────────────────────── */

/** The one 2xx producer in this file. */
function accepted(): Response {
  return Response.json({ ok: true }, { status: 200 });
}

/**
 * Every failure. The body is machine-readable and says nothing about the
 * environment: which variable is unset is an operator fact, logged to stderr,
 * not something a public endpoint volunteers.
 */
function failure(status: number, error: string, issues?: readonly LeadIssue[]): Response {
  return Response.json(
    issues === undefined ? { ok: false, error } : { ok: false, error, issues },
    { status },
  );
}

const ALLOWED_METHODS = 'POST';

function methodNotAllowed(): Response {
  return Response.json(
    { ok: false, error: 'method_not_allowed' },
    { status: 405, headers: { Allow: ALLOWED_METHODS } },
  );
}

/* ── The handler ──────────────────────────────────────────────────────────── */

/**
 * Parse, validate, deliver — in that order, with no path that skips a step.
 * Split from `POST` so the resolution is an argument rather than an ambient
 * fact; `POST` supplies the real one.
 */
async function handleLead(request: Request, resolution: MailerResolution): Promise<Response> {
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    // A truncated or aborted upload. The client never saw an ok, so its fallback
    // is already showing; this is only about not throwing out of the handler.
    return failure(400, 'unreadable_body');
  }

  if (raw.length > MAX_BODY_CHARS) {
    return failure(413, 'body_too_large');
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return failure(400, 'malformed_json');
  }

  const parsed = leadSchema.safeParse(body);
  if (parsed.success === false) {
    return failure(422, 'invalid_lead', formatIssues(parsed.error));
  }

  // Checked AFTER validation so that a malformed request is still told it is
  // malformed on a misconfigured server — a 503 for a request that was never
  // valid would send the author hunting the wrong fault.
  if (resolution.configured === false) {
    console.error(
      `[lead] delivery unavailable: unset environment variables: ${resolution.missing.join(', ')}`,
    );
    return failure(503, 'delivery_unavailable');
  }

  try {
    await resolution.mailer.send(parsed.data);
  } catch (cause) {
    console.error('[lead] provider refused the lead', cause);
    return failure(502, 'delivery_failed');
  }

  // Reachable only from the line above having RESOLVED.
  return accepted();
}

export async function POST(request: Request): Promise<Response> {
  return handleLead(request, resolveMailer(process.env));
}

export function GET(): Response {
  return methodNotAllowed();
}

export function PUT(): Response {
  return methodNotAllowed();
}

export function PATCH(): Response {
  return methodNotAllowed();
}

export function DELETE(): Response {
  return methodNotAllowed();
}

export function HEAD(): Response {
  return methodNotAllowed();
}

export function OPTIONS(): Response {
  return methodNotAllowed();
}
