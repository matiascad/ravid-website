// ── E2E TARGET ADDRESS — ONE FACT, ONE PLACE ────────────────────────────────
//
// INVARIANT    The host/port the browser gate talks to is written HERE and
//              nowhere else. `playwright.config.ts` boots its `webServer` on
//              this port and hands this baseURL to every spec; the three
//              hand-run reporters in this directory read the same value.
//
// WHY IT EXISTS
//              Before this file, `visual-verify.mjs` and `form-and-rtl.mjs`
//              each hardcoded a DEFAULT of `http://localhost:3477` — a port
//              nothing in this repo ever serves. Running them without an
//              explicit BASE_URL produced a connection error, so the "e2e"
//              scripts were only ever usable by someone who remembered to
//              start a server by hand AND pass the right port. That is not a
//              gate; it is a private convention. The address is now one
//              value that the config actually serves.
//
// PORT CHOICE  3512 is deliberately NOT 3000 (dev default), NOT 3861 and NOT
//              3947 — two stale `next-server` processes are LISTENING on
//              those two ports with builds from earlier in this run. The gate
//              must never silently measure someone else's stale bundle, which
//              is exactly how "the button is fine on my machine" happens.
//
// OVERRIDE     Set E2E_PORT to move the whole gate (server + baseURL) to a
//              free port; set E2E_BASE_URL to point the gate at a server this
//              repo did NOT start (a staging deploy, a production build you
//              are serving yourself). Setting E2E_BASE_URL does NOT stop the
//              config from starting its own server — see playwright.config.ts,
//              which skips `webServer` whenever E2E_BASE_URL is set.
//
// HONEST LIMIT This file fixes the ADDRESS only. It cannot know whether the
//              thing answering on that address is the build you meant to test.

/** Port the gate's own `next dev` server binds, and that specs address. */
export const E2E_PORT = Number(process.env.E2E_PORT || 3512);

/** Loopback by name, so the gate never depends on external DNS or a LAN IP. */
export const E2E_HOST = '127.0.0.1';

/**
 * The origin every spec and reporter measures. Explicit E2E_BASE_URL wins, so
 * the same specs can be aimed at a production server without editing a file.
 */
export const E2E_BASE_URL =
  process.env.E2E_BASE_URL || `http://${E2E_HOST}:${E2E_PORT}`;

/** True when the operator supplied their own server, so we must not start one. */
export const E2E_EXTERNAL_TARGET = Boolean(process.env.E2E_BASE_URL);
