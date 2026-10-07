import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const {chromium}=createRequire(import.meta.url)('C:/Users/kakssjs/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
assert.equal(createHash('sha256').update(fs.readFileSync('public/hero-clouds.mp4')).digest('hex'),'f088d32ec4b9924d6d7d5cabe88a45f5884ddd4adb1a9c0229fe96fc6426b180','Original cloud video must be preserved');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1672,height:941}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.locator('.cloud-video').waitFor({timeout:6000});
 await page.locator('.ice-scene-plate').waitFor();
 assert.equal(await page.locator('.character-features svg').count(),0,'Do not replace the reference face with flat vector features');
 await page.locator('.canonical-character-art').waitFor();
 await page.locator('.character-reflection').waitFor();
 await page.waitForFunction(()=>document.querySelector('.cloud-video').currentTime>.2);
 const video=await page.locator('.cloud-video').evaluate(el=>({paused:el.paused,muted:el.muted,loop:el.loop,inline:el.playsInline,filter:getComputedStyle(el).filter,opacity:getComputedStyle(el).opacity,mask:getComputedStyle(el).maskImage}));
 assert(!video.paused&&video.muted&&video.loop&&video.inline);
 assert(video.filter.includes('melo-cloud-color'));
 assert.equal(video.opacity,'1','Original moving clouds must be clearly visible');
 assert(!video.mask.includes('90deg'),'Do not hide the right-hand moving clouds');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.getByRole('button',{name:'看看 Melo 的心情 ✦'}).click();
 const canonicalBox=await page.locator('.canonical-character-art').boundingBox();
 for(const label of ['开心','俏皮','惊喜','沉浸','温柔','比心','关心']){
  await page.getByRole('button',{name:`选择${label}表情`}).click();
  assert.deepEqual(await page.locator('.canonical-character-art').boundingBox(),canonicalBox,'Every expression must preserve the same head and face outline');
  assert.equal(await page.locator('.painted-expression clipPath path').count(),0,'Never replace cheeks or chin');
 }
 await page.keyboard.press('Escape');
 await page.emulateMedia({reducedMotion:'no-preference'});
 assert.equal(await page.getByRole('heading',{name:'Melo',exact:true}).count(),1);
 await page.screenshot({path:'D:/chatgpt/qqmusic/melo-cloud-reference-desktop.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(300);
 assert(await page.locator('.cloud-video').evaluate(el=>el.paused));
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
 await page.screenshot({path:'D:/chatgpt/qqmusic/melo-cloud-reference-mobile.png'});
 assert.deepEqual(errors,[]);
 fs.writeFileSync('cloud-hero-verification.json',JSON.stringify({originalVideoPreserved:true,video,reducedMotion:true,mobile:true,errors},null,2));
 console.log('PASS: original video hash, playback, blue color filter, reference layout, reduced motion, mobile');
}finally{await browser.close();}
