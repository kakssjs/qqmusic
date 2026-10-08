import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/kakssjs/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.MELO_TEST_URL||'https://melo-qqmusic.vercel.app/';
const mode=process.env.MELO_TEST_MODE||'demo';
const output='D:/chatgpt/qqmusic/final-acceptance';fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={url:base,mode,at:new Date().toISOString(),passed:false,viewports:[],errors:[],network:[]};
try {
 for(const width of [1440,390,430,768]) {
  const ctx=await browser.newContext({viewport:{width,height:width>1000?960:900},acceptDownloads:true,reducedMotion:'reduce'});
  const page=await ctx.newPage(); page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  page.on('response',r=>{if(r.url().includes('/api/')||r.status()>=400)report.network.push({url:r.url(),status:r.status()});});
  const target=new URL(base);if(mode==='demo')target.searchParams.set('demo','1');if(process.env.MELO_PREVIEW_BYPASS)target.searchParams.set('_vercel_share',process.env.MELO_PREVIEW_BYPASS);
  await page.goto(target.href,{waitUntil:'networkidle'});
  assert.equal(await page.locator('.memory-node').count(),0,'new visitor has no invented memories');
  await page.getByRole('link',{name:'开始和 Melo 聊聊',exact:true}).click();
  await page.getByRole('button',{name:'今天有点累',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-flow-ready="true"]'),{timeout:65000});
  assert(await page.locator('.live-message.assistant').count()>0);
  assert(await page.locator('.emotion-insight').innerText());
  assert.equal(await page.locator('.record-cover h3').innerText(),'月光停靠');
  assert(await page.locator('.memory-node').count()>0);
  await page.getByRole('button',{name:'安静一会',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-flow-ready="true"]'),{timeout:65000});
  await page.getByRole('link',{name:'听听这首歌',exact:true}).click();
  await page.getByRole('button',{name:'播放音乐',exact:true}).click();await page.waitForTimeout(1400);
  assert(await page.getByRole('button',{name:'暂停音乐',exact:true}).count());
  assert.equal(await page.locator('.melo-character').getAttribute('data-expression'),'listen');
  await page.getByLabel('音乐播放进度').fill('35');await page.waitForTimeout(300);assert(+await page.getByLabel('音乐播放进度').inputValue()>34);
  await page.getByLabel('音量',{exact:true}).fill('0.31');
  await page.getByRole('button',{name:'下一首',exact:true}).click();await page.getByRole('button',{name:'上一首',exact:true}).click();
  await page.getByRole('button',{name:'收藏当前音乐'}).click();await page.waitForFunction(()=>document.querySelector('[aria-label="收藏当前音乐"]')?.getAttribute('aria-pressed')==='true');
  await page.getByRole('button',{name:'收藏当前音乐'}).click();await page.waitForFunction(()=>document.querySelector('[aria-label="收藏当前音乐"]')?.getAttribute('aria-pressed')==='false');
  await page.getByRole('button',{name:'收藏当前音乐'}).click();await page.waitForFunction(()=>document.querySelector('[aria-label="收藏当前音乐"]')?.getAttribute('aria-pressed')==='true');
  await page.getByRole('button',{name:'暂停音乐',exact:true}).click();await page.waitForTimeout(800);
  await page.getByRole('link',{name:'查看这次记忆',exact:true}).click();
  await page.locator('.memory-node summary').first().click();assert((await page.locator('.memory-details').first().innerText()).includes('Melo 当时的回应'));
  await page.getByRole('button',{name:'再听一次这段心情'}).first().click();await page.waitForTimeout(600);assert(await page.getByRole('button',{name:'暂停音乐',exact:true}).count());
  await page.getByRole('button',{name:'暂停音乐',exact:true}).click();
  assert((await page.locator('.music-personality').innerText()).includes('音乐人格'));
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'下载音乐签'}).click();const file=await download;await file.saveAs(`${output}/music-sign-${mode}-${width}.png`);
  const copyBtn=page.getByRole('button',{name:'复制音乐签文案'});assert(await copyBtn.isEnabled());await copyBtn.click();await page.waitForTimeout(250);assert((await page.locator('.daily-sign').innerText()).includes('复制')||await page.locator('textarea').count()>0);
  await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(1200);assert(await page.locator('.memory-node').count()>0,'snapshot persists after reload');
  assert.equal(await page.getByRole('button',{name:'收藏当前音乐'}).getAttribute('aria-pressed'),'true','latest favorite persists');
  const layout=await page.evaluate(async()=>{await document.fonts.ready;return {width:innerWidth,doc:document.documentElement.scrollWidth,font:document.fonts.check('16px Inter'),localApis:performance.getEntriesByType('resource').filter(r=>r.name.includes('/api/')&&r.name.includes('localhost')).length};});
  assert(layout.doc<=width);assert(layout.font);assert.equal(layout.localApis,0);
  await page.locator('#chat').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/chat-${mode}-${width}.png`});
  await page.locator('#music').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/music-${mode}-${width}.png`});
  await page.locator('#journey').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/journey-${mode}-${width}.png`});
  report.viewports.push({width,completeFlow:true,persisted:true,audio:true,layout});await ctx.close();
  if(mode==='real'&&width===390)break;
 }
 assert.deepEqual(report.errors,[]);assert(!report.network.some(r=>r.status>=400));report.passed=true;
}catch(e){report.failure=e.message;throw e;}finally{fs.writeFileSync(`${output}/final-demo-${mode}-verification.json`,JSON.stringify(report,null,2));fs.writeFileSync('final-demo-verification.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));}


