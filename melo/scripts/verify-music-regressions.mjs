import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {personality} from '../data/experience.ts';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/kakssjs/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=new URL(process.env.MELO_TEST_URL||'http://127.0.0.1:5173/qqmusic/');url.searchParams.set('demo','1');if(process.env.MELO_PREVIEW_BYPASS)url.searchParams.set('_vercel_share',process.env.MELO_PREVIEW_BYPASS);
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const report={passed:false,at:new Date().toISOString(),checks:{}};
try{
 await page.goto(url.href,{waitUntil:'networkidle'});await page.waitForTimeout(800);
 await page.getByRole('button',{name:'看看 Melo 的心情 ✦',exact:true}).click();
 const buttons=page.locator('.expression-picker .expression-option');
 for(let i=0;i<7;i++){await buttons.nth(i).click();const face=await page.locator('.melo-character').getAttribute('data-expression');assert(['happy','wink','surprise','listen','calm','love','care'].includes(face));const a=await page.locator('.canonical-character-art').first().boundingBox();report.checks[face]={width:a.width,height:a.height};}
 const sizes=Object.values(report.checks).map(x=>JSON.stringify(x));assert.equal(new Set(sizes).size,1);await page.keyboard.press('Escape');
 await page.locator('#mix').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'换一个 Mix',exact:true}).click();const mix=await page.locator('.mix-list h3').allTextContents();
 await page.route('**/music/audio/*.wav',async r=>{await new Promise(resolve=>setTimeout(resolve,500));await r.continue();});
 await page.getByRole('button',{name:'播放全部 ↗',exact:true}).click();await page.getByRole('button',{name:'全局播放器下一首',exact:true}).click();await page.getByRole('button',{name:'全局播放器下一首',exact:true}).click();
 await page.getByRole('button',{name:'全局播放器暂停',exact:true}).waitFor({timeout:15000});
 const track=await page.locator('.global-song strong').innerText();assert.equal(track,mix[2]);report.checks.rapidSkip=true;
 await page.getByRole('button',{name:'展开正在播放',exact:true}).click();await page.getByLabel('正在播放进度').fill('20');await page.getByLabel('正在播放进度').fill('40');await page.keyboard.press('Escape');await page.getByRole('button',{name:'全局播放器暂停',exact:true}).waitFor();report.checks.rapidSeek=true;
 await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(900);await page.locator('#mix').scrollIntoViewIfNeeded();assert.deepEqual(await page.locator('.mix-list h3').allTextContents(),mix);
 await page.getByRole('button',{name:'播放音乐',exact:true}).click();await page.getByRole('button',{name:'全局播放器暂停',exact:true}).waitFor();assert.equal(await page.locator('.global-song strong').innerText(),track);report.checks.freshUserQueueMixRestore=true;
 await page.getByRole('button',{name:'展开 Melo 伙伴',exact:true}).click();await page.getByRole('button',{name:'收起，安静陪着',exact:true}).click();
 await page.waitForTimeout(31500);assert(await page.getByText('这一首，接住你了吗？',{exact:true}).count());report.checks.actualThirtySecondFeedback=true;
 await page.getByRole('button',{name:'收起，安静陪着',exact:true}).click();await page.getByRole('button',{name:'全局播放器暂停',exact:true}).click();
 await page.unroute('**/music/audio/*.wav');await page.route('**/music/audio/*.wav',r=>r.abort());await page.getByRole('button',{name:'全局播放器下一首',exact:true}).click();await page.getByRole('button',{name:'全局播放器播放',exact:true}).click();await page.getByRole('button',{name:'全局播放器暂停',exact:true}).waitFor({timeout:15000});report.checks.originalSynthesisFallback=true;
 for(const n of [0,1,3,5]){const records=Array.from({length:n},(_,i)=>({id:'p'+i,type:'checkin',createdAt:new Date().toISOString(),payload:{momentId:'p'+i,mood:'focus',track:'focus'}}));if(n===5)records.push({id:'l',type:'listening',createdAt:new Date().toISOString(),payload:{track:'focus',seconds:20}});const p=personality(records);assert.equal(p.title.includes('还在形成'),n<5);}report.checks.progressivePersonality=true;
 assert.equal(errors.length,0);report.passed=true;
}finally{await browser.close();fs.writeFileSync('D:/chatgpt/qqmusic/award-v4-validation/music-regressions.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));}

