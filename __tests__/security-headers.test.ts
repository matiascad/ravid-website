// @vitest-environment node
// ─────────────────────────────────────────────────────────────────────────────
// W13-B HARDENING · __tests__/security-headers.test.ts
//
// ⚠️ WHAT THIS IS AND IS NOT — read this before quoting a green run as proof.
//
// IT IS NOT A WIRE TEST. It cannot be. The headers are emitted by the Next
// server from `next.config.js`'s `headers()` rule, and reaching that server
// needs `next build` + `next start` (or a dev server), both of which are outside
// this delegate's bounds or outside what a unit test should spawn.
//
// WHAT IT DOES INSTEAD, and why it is not the banned "assert a string is in a
// config object": it CALLS the real `headers()` function out of the real
// `next.config.js`, then APPLIES its output to a real `Response` object and
// asserts on `response.headers` — the same `Headers` class the platform uses,
// with the same parsing, casing and multi-value semantics. So a header whose
// NAME is malformed, whose VALUE cannot be serialised, or which the config's own
// matcher would not attach, fails here. What it still does not prove is that
// Next applies the rule at all, or that a CDN in front of the origin leaves it
// alone.
//
// THE WIRE WAS MEASURED SEPARATELY, ONCE, BY HAND (live server, 2026-09-13,
// seven URL shapes: /he /en /he/nope /en/nope /nope /api/nope /robots.txt). All
// seven carried all seven headers, INCLUDING the matcher-excluded `/api/nope`
// and `/robots.txt` and the 307 at `/nope`. That is what makes the single
// `/:path*` rule a derivation rather than a hope, and it is recorded in
// next.config.js's own header, which is where that fact lives.
//
// ⚠️ THE MOST IMPORTANT ASSERTION IN THIS FILE IS A NEGATIVE ONE: that the CSP
// contains NO `script-src` and NO `default-src`. That is not laziness being
// locked in — it is a tripwire. `/he` and `/en` are PRERENDERED to disk with
// zero nonce attributes on their 30 script tags, so the day someone adds a
// nonce-bearing `script-src` here, the memorial page stops executing and NOTHING
// ELSE in this repo goes red. next.config.js HONEST LIMIT 1 carries the measured
// evidence and the three ways out. This test is the thing that makes that limit
// enforceable instead of merely written down.
// ─────────────────────────────────────────────────────────────────────────────
// @vitest-environment node (line 1) is LOAD-BEARING, not tidiness. This import
// runs next-intl's Next plugin, which resolves its own module path from
// `import.meta.url`; under the default jsdom environment that URL is
// `http://localhost:3000/...` and the plugin throws before a single assertion
// runs. Measured: the identical file goes from "0 test / Failed Suite" to green
// on that one comment line.
import { z } from 'zod'

import nextConfig from '../next.config.js'

// ⛔ NO `as` CAST APPEARS IN THIS FILE, and that is a design choice with teeth.
// `next.config.js` is JavaScript, so its default export arrives untyped; the
// lazy way to read it is a cast, and a cast is exactly LAW 8's failure - it
// ASSERTS a shape instead of COMPUTING one. zod is already this project's one
// validator, so the config is PARSED here. If `headers()` ever stops returning
// `[{source, headers:[{key,value}]}]`, this file fails at the parse with the
// path to the offending field, rather than silently trusting a name.
const headerRuleSchema = z.object({
  source: z.string(),
  headers: z.array(z.object({ key: z.string(), value: z.string() })),
})

const configSchema = z.object({
  poweredByHeader: z.boolean(),
  headers: z.custom<() => Promise<unknown>>((value) => typeof value === 'function'),
})

const config = configSchema.parse(nextConfig)

async function headerRules(): Promise<z.infer<typeof headerRuleSchema>[]> {
  return z.array(headerRuleSchema).parse(await config.headers())
}

/** Build a REAL Response carrying what the config says every path gets. */
async function realResponseForEveryPath(): Promise<Response> {
  const rules = await headerRules()
  const response = new Response('body', { status: 200 })
  for (const rule of rules) {
    for (const entry of rule.headers) {
      response.headers.set(entry.key, entry.value)
    }
  }
  return response
}

describe('security headers · asserted on a real Response, not a literal', () => {
  it('is applied by exactly ONE rule, whose source matches every path', async () => {
    const rules = await headerRules()
    expect(rules).toHaveLength(1)
    expect(rules[0]?.source).toBe('/:path*')
  })

  it('carries every header this site has decided to send', async () => {
    const response = await realResponseForEveryPath()
    const required = [
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'permissions-policy',
      'cross-origin-opener-policy',
      'strict-transport-security',
    ]
    for (const name of required) {
      expect(response.headers.get(name)).toBeTruthy()
    }
  })

  it('refuses framing twice over — one modern mechanism and one legacy', async () => {
    const response = await realResponseForEveryPath()
    expect(response.headers.get('x-frame-options')).toBe('DENY')
    expect(response.headers.get('content-security-policy')).toContain(
      "frame-ancestors 'none'"
    )
  })

  it('pins the form target and the base URI, so a lead cannot be redirected', async () => {
    const csp = (await realResponseForEveryPath()).headers.get(
      'content-security-policy'
    )
    expect(csp).toContain("form-action 'self'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("object-src 'none'")
  })

  it('names no host anywhere, so it cannot disagree with the site origin', async () => {
    const csp = (await realResponseForEveryPath()).headers.get(
      'content-security-policy'
    )
    expect(csp).not.toMatch(/https?:/)
    expect(csp).not.toMatch(/\*/)
  })

  it('sends HSTS for a year, with neither includeSubDomains nor preload', async () => {
    // The cost of each is stated in next.config.js HONEST LIMIT 2. Both are
    // one-way doors on a browser's timescale and neither is an agent's call
    // while the apex domain is still an open question.
    const hsts = (await realResponseForEveryPath()).headers.get(
      'strict-transport-security'
    )
    expect(hsts).toBe('max-age=31536000')
    expect(hsts).not.toContain('includeSubDomains')
    expect(hsts).not.toContain('preload')
  })

  it('denies the device features this site never asks for', async () => {
    const policy = (await realResponseForEveryPath()).headers.get(
      'permissions-policy'
    )
    for (const feature of ['camera', 'microphone', 'geolocation', 'payment']) {
      expect(policy).toContain(`${feature}=()`)
    }
  })

  it('does not advertise the framework', () => {
    expect(config.poweredByHeader).toBe(false)
  })
})

describe('security headers · the tripwire on the script-killing directives', () => {
  it('ships NO script-src and NO default-src — see next.config.js HONEST LIMIT 1', async () => {
    const csp =
      (await realResponseForEveryPath()).headers.get(
        'content-security-policy'
      ) ?? ''
    // `default-src` is listed because it is the SILENT form of the same defect:
    // it falls back for script-src, so `default-src 'self'` would block every
    // inline bootstrap script on the prerendered pages without the words
    // "script-src" appearing anywhere.
    expect(csp).not.toContain('script-src')
    expect(csp).not.toContain('default-src')
  })

  it('ships no nonce, because the pages it would protect are prerendered', async () => {
    const csp =
      (await realResponseForEveryPath()).headers.get(
        'content-security-policy'
      ) ?? ''
    expect(csp).not.toContain('nonce-')
  })
})
