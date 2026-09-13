// W7-B pass 2: lead form in a real browser, keyboard reach of the switcher,
// and an asymmetry-based mirroring probe. Read-only; configures no provider.
//
// ⚠ THIS IS A REPORTER, NOT A GATE — see the header of visual-verify.mjs.
//   It prints JSON and exits 0 whatever it finds. `npm run e2e` does not run
//   it. Its RTL-mirroring and form measurements are worth keeping; its
//   silence about failure is why it cannot be the gate.
//
//   Run it by hand, after starting a server:  node tests/e2e/form-and-rtl.mjs
import { chromium } from '@playwright/test';
import { E2E_BASE_URL } from './e2e.env.mjs';

// Was hardcoded to `http://localhost:3477`, a port nothing in this repo serves.
const BASE = process.env.BASE_URL || E2E_BASE_URL;
const out = {};
const browser = await chromium.launch();

// ---------- A. asymmetric mirroring probe ----------
const asym = async (locale) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${locale}`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    const res = [];
    const els = [...document.querySelectorAll('body *')];
    for (const el of els) {
      const p = el.parentElement;
      if (!p) continue;
      const r = el.getBoundingClientRect();
      const pr = p.getBoundingClientRect();
      if (r.width < 20 || r.height < 8 || pr.width < 40) continue;
      const left = r.left - pr.left;
      const right = pr.right - r.right;
      if (Math.abs(left - right) < 12) continue; // symmetric -> uninformative
      res.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 55),
        txt: (el.textContent || '').trim().slice(0, 22),
        left: Math.round(left),
        right: Math.round(right),
        w: Math.round(r.width),
        dir: getComputedStyle(el).direction,
      });
      if (res.length > 400) break;
    }
    return res;
  });
  await ctx.close();
  return data;
};
const aHe = await asym('he');
const aEn = await asym('en');
out.asymCounts = { he: aHe.length, en: aEn.length };
// pair by class+shape; report a handful
const key = (d) => `${d.tag}|${d.cls}|${d.w}`;
const mapEn = new Map(aEn.map((d) => [key(d), d]));
out.mirrorPairs = [];
for (const h of aHe) {
  const e = mapEn.get(key(h));
  if (!e) continue;
  out.mirrorPairs.push({
    tag: h.tag,
    cls: h.cls.slice(0, 45),
    en_left: e.left,
    en_right: e.right,
    he_left: h.left,
    he_right: h.right,
    mirrored: Math.abs(h.left - e.right) <= 3 && Math.abs(h.right - e.left) <= 3,
    he_dir: h.dir,
    en_dir: e.dir,
  });
  if (out.mirrorPairs.length >= 14) break;
}

// ---------- B. switcher keyboard reachability ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.body.focus());
  const seen = [];
  let found = null;
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a) return null;
      return {
        tag: a.tagName.toLowerCase(),
        href: a.getAttribute('href'),
        name: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 40),
        lang: a.getAttribute('lang'),
        visibleFocusOutline: getComputedStyle(a).outlineStyle,
      };
    });
    if (!info) break;
    seen.push(`${info.tag}:${info.href || info.name}`);
    if (info.href === '/he' || info.href === '/en') {
      found = { tabStop: i + 1, ...info };
      break;
    }
  }
  out.switcherKeyboard = { found, tabOrderPrefix: seen };
  await ctx.close();
}

// ---------- C. lead form: empty then filled ----------
const formRun = async (locale) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const api = [];
  page.on('response', async (r) => {
    if (r.url().includes('/api/lead')) {
      let body = '';
      try {
        body = (await r.text()).slice(0, 300);
      } catch {}
      api.push({ status: r.status(), body });
    }
  });
  await page.goto(`${BASE}/${locale}`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  const submit = page.locator('form button[type=submit]').first();
  await submit.scrollIntoViewIfNeeded();

  // --- empty submit
  await submit.click();
  await page.waitForTimeout(900);
  const empty = await page.evaluate(() => {
    const st = document.querySelector('[data-testid="form-status"]');
    const inv = document.querySelector('[data-testid="form-invalid"]');
    return {
      statusRole: st?.getAttribute('role'),
      ariaLive: st?.getAttribute('aria-live'),
      statusText: (st?.textContent || '').trim().slice(0, 200),
      invalidPresent: !!inv,
      invalidText: (inv?.textContent || '').trim().slice(0, 200),
      ariaInvalidCount: document.querySelectorAll('[aria-invalid="true"]').length,
      focused: document.activeElement?.getAttribute('id') || document.activeElement?.tagName,
      successPresent: !!document.querySelector('[data-testid="form-success"]'),
      fallbackPresent: !!document.querySelector('[data-testid="form-fallback"]'),
    };
  });

  // --- filled submit (API has no provider -> 503 by design)
  await page.fill('#lead-name', 'QA Visual Verify');
  await page.fill('#lead-phone', '0500000000');
  await page.fill('#lead-email', 'qa@example.invalid');
  await submit.click();
  await page.waitForTimeout(3000);
  const filled = await page.evaluate(() => {
    const st = document.querySelector('[data-testid="form-status"]');
    const fb = document.querySelector('[data-testid="form-fallback"]');
    const wa = document.querySelector('[data-testid="form-fallback-whatsapp"]');
    return {
      statusText: (st?.textContent || '').trim().slice(0, 300),
      successPresent: !!document.querySelector('[data-testid="form-success"]'),
      fallbackPresent: !!fb,
      whatsappPresent: !!wa,
      whatsappHrefHost: wa ? new URL(wa.getAttribute('href'), location.href).host : null,
      whatsappHrefLen: wa ? wa.getAttribute('href').length : 0,
      submitDisabled: document.querySelector('form button[type=submit]')?.disabled,
    };
  });
  await ctx.close();
  return { api, empty, filled };
};
out.formEn = await formRun('en');
out.formHe = await formRun('he');

await browser.close();
console.log(JSON.stringify(out, null, 1));
