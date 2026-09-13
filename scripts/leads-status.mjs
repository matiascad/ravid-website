// ─────────────────────────────────────────────────────────────────────────────
// W16-B THE OPERATOR'S HANDS — scripts/leads-status.mjs
//
// WHY THIS EXISTS WHEN THE HTTP ROUTE ALREADY DOES, and why it is a RENDERER and
// not a second reader.
//
// `app/api/admin/leads/route.ts` is the route a human opens. This script is the
// same answer for the two cases a browser cannot serve:
//
//   1. AN EXIT CODE. `0` means nobody is waiting. `1` means somebody is. That is
//      a thing `cron`, a systemd timer or a CI job can act on, so "has anybody
//      fallen through the mail?" can be a question the machine asks every
//      morning instead of a question somebody has to remember to ask. A web page
//      cannot be scheduled to notice something.
//   2. THE TOKEN IN A HEADER, NEVER IN A URL. The route accepts `?token=` because
//      a family member cannot set an HTTP header, and that cost is argued in the
//      route's own header. This script has no such constraint, so it always sends
//      `Authorization: Bearer`, and an operator who uses it never puts the secret
//      into shell history as part of a URL.
//
// WHAT IT DELIBERATELY DOES NOT DO: it does not talk to the key-value store, it
// does not count anything, it does not parse `lead:` keys and it holds no copy of
// any threshold or rule. It performs ONE `GET` and prints what came back. Every
// number and every sentence it shows was derived in exactly one place,
// `lib/leads/recover.ts`. A script that reached into the store itself would be a
// second implementation of the same fact, free to drift from the route, and the
// first time the two disagreed nobody would know which was lying.
//
// It is written against the HTTP route rather than importing the TypeScript
// directly for a blunt reason as well: this repository installs no TypeScript
// loader for Node, so `import '../lib/leads/recover.ts'` does not run, and adding
// one would be a new dependency. Going over HTTP also means the operator needs
// nothing but a URL and the token — not a checkout, not `npm install`, and not
// the same commit as production.
//
// THE TOKEN IS READ FROM THE ENVIRONMENT AND IS NEVER PRINTED, never written to a
// file, and never put in the URL. The only thing this file ever names is the
// VARIABLE.
//
// HONEST LIMIT  · It needs a reachable deployment. Against a site that is down it
//                 exits 2 and says so; it cannot read the store itself, by
//                 design (see above).
//               · Exit `1` means "a human should look", not "the site is
//                 broken". Enquiries waiting for a call back are the normal
//                 reason for it.
//               · English only, like the page. Hebrew belongs with the rest of
//                 the site's strings.
//               · It shows references and dates. It shows no names, phone
//                 numbers, e-mail addresses or messages, because the route does
//                 not send them.
// ─────────────────────────────────────────────────────────────────────────────

/** THE NAME. Never the value. */
const TOKEN_ENV_VAR = 'LEAD_ADMIN_TOKEN';

/** Where to ask, when it is not given as the first argument. */
const BASE_URL_ENV_VAR = 'LEAD_ADMIN_URL';

const PATH = '/api/admin/leads';

/** `0` nothing waiting · `1` somebody is waiting · `2` could not ask. */
const EXIT_OK = 0;
const EXIT_ATTENTION = 1;
const EXIT_CANNOT_ASK = 2;

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(EXIT_CANNOT_ASK);
}

function endpoint() {
  const given = process.argv[2] ?? process.env[BASE_URL_ENV_VAR] ?? '';
  const base = given.trim();
  if (base === '') {
    fail(
      `Usage: node scripts/leads-status.mjs <site-url>\n` +
        `   or: set ${BASE_URL_ENV_VAR} and run it with no arguments.\n` +
        `The access token is read from ${TOKEN_ENV_VAR}. Never pass it as an argument.`,
    );
  }
  try {
    return new URL(PATH, base.endsWith('/') ? base : `${base}/`).toString();
  } catch {
    return fail(`That does not look like a site address: ${base}`);
  }
}

function token() {
  const value = (process.env[TOKEN_ENV_VAR] ?? '').trim();
  if (value === '') {
    fail(
      `${TOKEN_ENV_VAR} is not set, so there is nothing to identify you with.\n` +
        `Set it in this shell and run again. Do not put it on the command line.`,
    );
  }
  return value;
}

function line(text = '') {
  process.stdout.write(`${text}\n`);
}

async function main() {
  const url = endpoint();

  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        // The header, always. Never the query string. See the top of this file.
        Authorization: `Bearer ${token()}`,
        Accept: 'application/json',
      },
    });
  } catch (cause) {
    return fail(`Could not reach ${url}\n${cause instanceof Error ? cause.message : String(cause)}`);
  }

  if (response.status === 404) {
    return fail(
      `The site answered 404. Either that is not the right address, or this deployment has no\n` +
        `${TOKEN_ENV_VAR} configured, in which case the page does not exist at all.`,
    );
  }
  if (response.status === 401) {
    return fail(`The site refused the token (401). Check ${TOKEN_ENV_VAR}.`);
  }
  if (!response.ok) {
    return fail(`The site answered HTTP ${response.status}.`);
  }

  let view;
  try {
    view = await response.json();
  } catch {
    return fail('The site answered something that is not JSON. Is that address the right one?');
  }

  const alarms = Array.isArray(view?.alarms) ? view.alarms : [];

  line();
  line(String(view?.headline ?? 'The site answered, but said nothing.'));
  line();

  for (const alarm of alarms) {
    line(`  [${String(alarm?.severity ?? '?').toUpperCase()}] ${String(alarm?.sentence ?? '')}`);
    if (Array.isArray(alarm?.ids) && alarm.ids.length > 0) {
      for (const id of alarm.ids) line(`          ${String(id)}`);
    }
    line();
  }

  if (view?.store?.measured === true) {
    const leads = Array.isArray(view.store.leads) ? view.store.leads : [];
    line(`  Enquiries in the store: ${leads.length}`);
    for (const lead of leads) {
      line(
        `    ${String(lead?.id ?? '?')}  ${String(lead?.receivedAt ?? '?')}  ` +
          `${String(lead?.locale ?? '?')}  told: ${String(lead?.delivery?.status ?? '?')}`,
      );
    }
  } else {
    // Law 5: this is NOT an empty list, and it must never print as one.
    line('  The enquiry store was NOT read. This is not "no enquiries" — it is "nobody looked".');
  }
  line();

  process.exit(alarms.length === 0 ? EXIT_OK : EXIT_ATTENTION);
}

await main();
