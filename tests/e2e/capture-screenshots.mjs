import { chromium } from '@playwright/test';
import { statSync } from 'node:fs';
const BASE='http://localhost:3477';
const SHOTS='/home/mati/project/ravid_website/artifacts/screenshots/';
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
