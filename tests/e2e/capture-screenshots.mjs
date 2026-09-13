// ⚠ THIS IS A REPORTER, NOT A GATE — see the header of visual-verify.mjs.
//   It captures the four screenshots and exits 0 whatever they look like.
//   `npm run e2e` does not run it.
//
//   Run it by hand, after starting a server:  node tests/e2e/capture-screenshots.mjs
import { chromium } from '@playwright/test';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { E2E_BASE_URL } from './e2e.env.mjs';

// Was hardcoded to `http://localhost:3477`, a port nothing in this repo serves.
const BASE = process.env.BASE_URL || E2E_BASE_URL;
// Was an absolute path to one developer's home directory, which makes the
// script unrunnable anywhere else. Derived from this file's own location now.
const SHOTS =
  path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'), 'artifacts', 'screenshots') +
  path.sep;
const b=await chromium.launch();
for(const loc of ['he','en']) for(const vp of [{n:'mobile',width:390,height:844},{n:'desktop',width:1440,height:900}]){
  const c=await b.newContext({viewport:{width:vp.width,height:vp.height}});
  const p=await c.newPage();
  await p.goto(`${BASE}/${loc}`,{waitUntil:'load'});
  await p.evaluate(()=>{document.querySelectorAll('img').forEach(i=>{i.loading='eager';i.setAttribute('loading','eager');});});
  await p.evaluate(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}window.scrollTo(0,0);});
  await p.evaluate(()=>Promise.all([...document.querySelectorAll('img')].map(i=>i.decode().catch(()=>{}))));
  await p.waitForTimeout(2500);
  const f=`${SHOTS}${loc}-${vp.n}-${vp.width}x${vp.height}.png`;
  await p.screenshot({path:f,fullPage:true});
  const undec=await p.evaluate(()=>[...document.querySelectorAll('img')].filter(i=>!i.complete||i.naturalWidth===0).length);
  console.log(loc,vp.n,statSync(f).size,'bytes  undecoded='+undec);
  await c.close();
}
await b.close();
