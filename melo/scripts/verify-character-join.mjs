import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('C:/Users/kakssjs/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
try {
 for(const [width,height] of [[1440,960],[1024,768],[768,1024],[390,844],[1920,1080]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  const join=await page.locator('.canonical-character-art').evaluate(e=>({loaded:e.complete&&e.naturalWidth>0,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));
  assert(join.loaded,`${width}x${height}: reference artwork loaded`);
  assert(Math.abs(join.width/join.height-2/3)<.01,'Reference proportions must remain uniform');
  assert.equal(await page.locator('.character-head,.character-body').count(),0,'Use one connected reference artwork, no separate head/body positions');
  await page.screenshot({path:`D:/chatgpt/qqmusic/melo-joined-${width}.png`});
  await page.close();
 }
 console.log('PASS: connected head and body at five viewport sizes');
}finally{await browser.close();}
