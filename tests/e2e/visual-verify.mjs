// W7-B VISUAL VERIFY -- read-only audit of the running production build.
// Captures the four screenshots and measures RTL/LTR, a11y, console and network.
// It REPORTS. It repairs nothing and writes nothing outside artifacts/screenshots.
//
// ⚠ THIS IS A REPORTER, NOT A GATE. It prints JSON and exits 0 whatever it
//   finds. It has no assertions and cannot fail a build. `npm run e2e` does
//   NOT run this file, and must not be made to: a script that always exits 0
//   is exactly the always-green no-op that let an invisible booking button
//   ship. The gate is `cta-visibility.spec.ts`, which asserts. This file
//   stays because its MEASUREMENTS are genuinely useful to a human reading a
//   run — it is a microscope, not a smoke alarm.
//
//   Run it by hand, after starting a server:  node tests/e2e/visual-verify.mjs
import { chromium } from '@playwright/test';
import { mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { E2E_BASE_URL } from './e2e.env.mjs';

// Was hardcoded to `http://localhost:3477`, a port nothing in this repo ever
// serves. The address now comes from the one place that defines it.
const BASE = process.env.BASE_URL || E2E_BASE_URL;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SHOTS = path.join(ROOT, 'artifacts', 'screenshots');
mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];
const LOCALES = ['he', 'en'];

const HEB = /[֐-׿]/;

const audit = () => {
  const de = document.documentElement;
  const heb = /[֐-׿]/;
  const imgs = [...document.querySelectorAll('img')];
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
    level: Number(h.tagName[1]),
    text: (h.textContent || '').trim().slice(0, 60),
  }));
  const skips = [];
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      skips.push(`${headings[i - 1].level}->${headings[i].level} at "${headings[i].text}"`);
    }
  }
  const controls = [...document.querySelectorAll('input,textarea,select')];
  const controlInfo = controls.map((c) => {
    const lab = c.id ? document.querySelector(`label[for="${CSS.escape(c.id)}"]`) : null;
    return {
      tag: c.tagName.toLowerCase(),
      type: c.getAttribute('type'),
      id: c.id || null,
      name: c.getAttribute('name'),
      hasLabelFor: !!lab,
      labelText: lab ? (lab.textContent || '').trim().slice(0, 40) : null,
      ariaLabel: c.getAttribute('aria-label'),
      ariaLabelledby: c.getAttribute('aria-labelledby'),
      required: c.hasAttribute('required'),
    };
  });
  // language switcher: any anchor whose href targets the other locale root
  const switchers = [...document.querySelectorAll('a[href^="/he"],a[href^="/en"],button')]
    .filter((el) => {
      const h = el.getAttribute('href') || '';
      return /^\/(he|en)(\/|$|\?)/.test(h) && !el.closest('nav[aria-label="breadcrumb"]');
    })
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      href: el.getAttribute('href'),
      tabindex: el.getAttribute('tabindex'),
      text: (el.textContent || '').trim().slice(0, 40),
      ariaLabel: el.getAttribute('aria-label'),
      lang: el.getAttribute('lang'),
      hidden: el.getAttribute('aria-hidden'),
      inFooter: !!el.closest('footer'),
      inHeader: !!el.closest('header'),
    }));
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const probes = [];
  const pushProbe = (key, el) => {
    if (!el) return;
    const cs = getComputedStyle(el);
    probes.push({
      key,
      ...box(el),
      textAlign: cs.textAlign,
      direction: cs.direction,
      text: (el.textContent || '').trim().slice(0, 40),
    });
  };
  pushProbe('h1', document.querySelector('h1'));
  [...document.querySelectorAll('h2')].slice(0, 3).forEach((h, i) => pushProbe(`h2[${i}]`, h));
  pushProbe('form-name-label', document.querySelector('form label'));
  pushProbe('form-name-input', document.querySelector('form input'));
  pushProbe('footer-first-link', document.querySelector('footer a'));
  pushProbe('header-first-link', document.querySelector('header a'));

  return {
    lang: de.getAttribute('lang'),
    dir: de.getAttribute('dir'),
    bodyDir: document.body.getAttribute('dir'),
    computedDir: getComputedStyle(de).direction,
    scrollWidth: de.scrollWidth,
    clientWidth: de.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    innerWidth: window.innerWidth,
    scrollHeight: de.scrollHeight,
    sectionCount: document.querySelectorAll('section').length,
    imgTotal: imgs.length,
    imgNoAltAttr: imgs.filter((i) => !i.hasAttribute('alt')).length,
    imgEmptyAlt: imgs.filter((i) => i.getAttribute('alt') === '').length,
    imgNonEmptyAlt: imgs.filter((i) => (i.getAttribute('alt') || '') !== '').length,
    imgNoAltList: imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.getAttribute('src')?.slice(0, 90)),
    hebrewAltImgs: imgs
      .filter((i) => heb.test(i.getAttribute('alt') || ''))
      .map((i) => ({
        src: (i.getAttribute('src') || '').slice(0, 90),
        altLen: (i.getAttribute('alt') || '').length,
        langAttr: i.getAttribute('lang'),
        dirAttr: i.getAttribute('dir'),
        parentLang: i.parentElement ? i.parentElement.getAttribute('lang') : null,
      })),
    brokenImgs: imgs
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => (i.getAttribute('src') || '').slice(0, 120)),
    headingLevels: headings.map((h) => h.level).join(','),
    headingSkips: skips,
    headingCount: headings.length,
    controlInfo,
    switchers,
    probes,
    overflowingElements: [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > de.clientWidth + 2 || r.left < -2);
      })
      .slice(0, 12)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 70),
        ...box(el),
      })),
  };
};

const results = { browser: 'chromium', base: BASE, runs: [] };

const browser = await chromium.launch();
for (const locale of LOCALES) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    const badResponses = [];
    const page = await ctx.newPage();
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') {
        consoleErrors.push(`[${m.type()}] ${m.text()}`.slice(0, 300));
      }
    });
    page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));
    page.on('requestfailed', (r) =>
      failedRequests.push(`${r.method()} ${r.url().slice(0, 120)} :: ${r.failure()?.errorText}`)
    );
    page.on('response', (r) => {
      if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url().slice(0, 140)}`);
    });

    const resp = await page.goto(`${BASE}/${locale}`, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(2500);
    // force lazy images to decode by scrolling the full page
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);

    const file = path.join(SHOTS, `${locale}-${vp.name}-${vp.width}x${vp.height}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const data = await page.evaluate(audit);
    results.runs.push({
      locale,
      viewport: vp,
      httpStatus: resp?.status(),
      file,
      bytes: statSync(file).size,
      consoleErrors,
      pageErrors,
      failedRequests,
      badResponses,
      ...data,
    });
    await ctx.close();
  }
}

// redirect check
const ctx = await browser.newContext();
const p = await ctx.newPage();
const r0 = await p.goto(`${BASE}/`, { waitUntil: 'load' });
results.rootRedirect = { finalUrl: p.url(), status: r0?.status(), chain: r0?.request().redirectedFrom()?.url() || null };
await ctx.close();
await browser.close();

console.log(JSON.stringify(results, null, 1));
