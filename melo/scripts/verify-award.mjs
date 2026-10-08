import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {catalog,playableTracks} from '../data/music/catalog.ts';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/kakssjs/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.MELO_TEST_URL||'http://127.0.0.1:5173/qqmusic/',mode=process.env.MELO_TEST_MODE||'demo';
const output='D:/chatgpt/qqmusic/award-v4-validation';fs.mkdirSync(output,{recursive:true});
const report={at:new Date().toISOString(),url:base,mode,passed:false,viewports:[],errors:[],networkFailures:[],recoveredFailures:[],checks:{catalog:catalog.length,playableOriginals:playableTracks.length},limits:['Browser emulation, not physical phone background/keyboard validation','QQ entries use official search links; no authorized official audio API configured']};
const browser=await chromium.launch({headless:true});
async function completed(page){
 await page.waitForFunction(()=>!!document.querySelector('[data-flow-ready="true"]')||!!document.querySelector('.live-toast.error'),{},{timeout:65000});
 if(await page.locator('.live-toast.error').count()){report.recoveredFailures.push(await page.locator('.live-toast.error p').innerText());await page.getByRole('button',{name:'重新尝试',exact:true}).click();}
 await page.waitForFunction(()=>!!document.querySelector('[data-flow-ready="true"]'),{},{timeout:65000});
}
try{
 for(const width of (mode==='real'?[1440,390]:[1440,390,430])){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true}),page=await ctx.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)report.networkFailures.push({path:new URL(r.url()).pathname,status:r.status()});});
  const target=new URL(base);if(mode==='demo')target.searchParams.set('demo','1');if(process.env.MELO_PREVIEW_BYPASS)target.searchParams.set('_vercel_share',process.env.MELO_PREVIEW_BYPASS);
  await page.goto(target.href,{waitUntil:'networkidle'});await page.waitForTimeout(900);
  assert.equal(await page.locator('.memory-node').count(),0);assert.equal(await page.locator('#discover').getAttribute('data-mounted'),'false');
  assert.equal(await page.locator('.cloud-title').innerText(),'Melo');assert(await page.locator('.canonical-character-art').first().evaluate(el=>el.complete&&el.naturalWidth>0));
  assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').filter(x=>x.name.endsWith('.wav')).length),0,'audio is on demand');
  const hero=await page.locator('.character-hero').screenshot({path:`${output}/hero-${mode}-${width}.png`});assert(hero.length>1000);
  await page.getByRole('button',{name:'看看 Melo 的心情 ✦',exact:true}).click();
  assert.equal(await page.locator('.expression-picker [data-expression]').count()>=7,true);
  await page.keyboard.press('Escape');
  await page.getByRole('link',{name:'开始和 Melo 聊聊',exact:true}).click();await page.getByLabel('给 Melo 的消息').fill('今天比赛没有发挥好，有点累，但是还不想睡。');await page.getByRole('button',{name:'发送给 Melo',exact:true}).click();await completed(page);
  assert(await page.locator('.live-message.assistant').count());assert((await page.locator('.emotion-insight').innerText()).includes('音乐推荐信号'));assert.equal(await page.locator('.award-alternatives .award-track').count(),4);assert.equal(await page.locator('.mix-list li').count(),6);
  await page.locator('#music').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'播放音乐',exact:true}).click();await page.waitForFunction(()=>!!document.querySelector('[aria-label="暂停音乐"]'),{},{timeout:15000});
  assert.equal(await page.locator('.global-player').count(),1);assert.equal(await page.locator('.melo-character').getAttribute('data-expression'),'listen');
  await page.getByLabel('音乐播放进度',{exact:true}).fill('30');await page.waitForTimeout(300);assert(+await page.getByLabel('音乐播放进度',{exact:true}).inputValue()>=30);await page.getByLabel('音量',{exact:true}).fill('0.27');assert.equal(await page.getByLabel('音量',{exact:true}).inputValue(),'0.27');
  const original=await page.locator('.global-song strong').innerText();await page.getByRole('button',{name:'全局播放器下一首',exact:true}).click();await page.waitForTimeout(900);assert.notEqual(await page.locator('.global-song strong').innerText(),original);await page.getByRole('button',{name:'全局播放器上一首',exact:true}).click();await page.waitForTimeout(900);assert.equal(await page.locator('.global-song strong').innerText(),original);
  await page.getByRole('button',{name:'全局收藏音乐',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[aria-label="全局收藏音乐"]')?.getAttribute('aria-pressed')==='true');
  await page.getByRole('button',{name:'展开正在播放',exact:true}).click();await page.getByRole('dialog').waitFor();assert(await page.getByRole('dialog').getByText('NOW PLAYING',{exact:true}).count());await page.getByLabel('正在播放进度').fill('42');assert(+await page.getByLabel('正在播放进度').inputValue()>=42);await page.keyboard.press('Escape');
  await page.locator('#mix').scrollIntoViewIfNeeded();const mixBefore=await page.locator('.mix-list h3').allTextContents();await page.getByRole('button',{name:'收藏 Mix',exact:true}).click();await page.getByRole('button',{name:'已收藏 Mix',exact:true}).waitFor();await page.getByRole('button',{name:'换一个 Mix',exact:true}).click();assert.notDeepEqual(await page.locator('.mix-list h3').allTextContents(),mixBefore);await page.getByRole('button',{name:'播放全部 ↗',exact:true}).click();await page.waitForTimeout(900);
  const mixTrack=await page.locator('.global-song strong').innerText();await page.getByRole('button',{name:'全局播放器下一首',exact:true}).click();await page.waitForTimeout(800);assert.notEqual(await page.locator('.global-song strong').innerText(),mixTrack);
  await page.locator('#discover').scrollIntoViewIfNeeded();await page.locator('.discover-rail').first().waitFor();assert.equal(await page.locator('.discover-rail').count(),5);assert(await page.locator('.official-link').count()>0);
  await page.getByLabel('让 Melo 帮你找歌').fill('想听适合雨天坐公交的');await page.getByRole('button',{name:'找一组音乐 ↗',exact:true}).click();await page.getByText('Melo 找到了这些声音',{exact:true}).waitFor({timeout:40000});assert((await page.locator('.search-status').innerText()).includes('规则'));
  const rail=page.getByRole('region',{name:'For This Moment 音乐轨道'});await rail.focus();await page.keyboard.press('ArrowRight');assert(await rail.evaluate(el=>el.scrollLeft)>0);
  // Play through actual distinct UI selections. Never inject component state.
  let played=[];if(mode==='demo'&&width===1440){const ids=await page.locator('.award-track[data-source="melo-original"]').evaluateAll(els=>[...new Set(els.map(e=>e.dataset.trackId))]);for(const id of ids.slice(0,8)){const item=page.locator(`.award-track[data-track-id="${id}"]`).first();await item.getByRole('button').click();await page.waitForFunction(()=>!!document.querySelector('[aria-label="全局播放器暂停"]'),{},{timeout:15000});played.push(id);}assert(played.length>=8);report.checks.distinctUIPlayed=played;}
  await page.locator('#memory').scrollIntoViewIfNeeded();assert(await page.locator('.memory-node').count()>0);await page.getByRole('button',{name:'再听一次这段心情',exact:true}).first().click();await page.waitForTimeout(700);assert(await page.locator('.global-player').count());
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'保存记忆封面',exact:true}).first().click();await (await download).saveAs(`${output}/memory-${mode}-${width}.png`);
  await page.locator('#daily').scrollIntoViewIfNeeded();const today=page.waitForEvent('download');await page.getByRole('button',{name:'下载音乐签',exact:true}).click();await (await today).saveAs(`${output}/today-${mode}-${width}.png`);
  await page.locator('#journey').scrollIntoViewIfNeeded();assert((await page.locator('.music-personality').innerText()).includes('音乐人格'));assert((await page.locator('.music-personality').innerText()).includes('三次'));
  await page.locator('#my-melo').scrollIntoViewIfNeeded();await page.locator('.my-melo-grid').waitFor();assert((await page.locator('.my-melo-grid').innerText()).includes(original));assert((await page.locator('.my-melo-grid').innerText()).includes('六首原创声音'));
  await page.getByRole('button',{name:'展开 Melo 伙伴',exact:true}).click();assert((await page.locator('.dock-body').innerText()).includes('回到正在播放'));assert.equal(await page.locator('.companion-dock').getAttribute('data-expression'),await page.locator('.melo-character').getAttribute('data-expression'));await page.getByRole('button',{name:'关闭 Melo 伙伴',exact:true}).click();assert.equal(await page.locator('.companion-dock').count(),0);
  await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(1100);assert(await page.locator('.memory-node').count()>0);await page.locator('#my-melo').scrollIntoViewIfNeeded();await page.locator('.my-melo-grid').waitFor();assert((await page.locator('.my-melo-grid').innerText()).includes(original));assert((await page.locator('.my-melo-grid').innerText()).includes('六首原创声音'));
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.motion),'reduced');assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=width);
  for(const section of ['music','mix','discover','memory']){await page.locator('#'+section).scrollIntoViewIfNeeded();await page.waitForTimeout(150);await page.screenshot({path:`${output}/${section}-${mode}-${width}.png`});}
  report.viewports.push({width,freshVisitor:true,realAI:mode==='real',chatEmotion:true,recommendations:4,mix:6,globalPlayer:true,memoryRestore:true,refresh:true,myMelo:true,sharing:true,keyboardRail:true,reducedMotion:true,noOverflow:true});await ctx.close();
 }
 const fingerprints=playableTracks.map(t=>{const b=fs.readFileSync(`public/music/audio/${t.id}.wav`);assert.equal(b.toString('ascii',0,4),'RIFF');assert(b.length>2000000);return createHash('sha256').update(b).digest('hex');});assert.equal(new Set(fingerprints).size,playableTracks.length);report.checks.originalFileFingerprints=fingerprints;
 assert.equal(report.errors.length,0);assert.equal(report.networkFailures.length,0);report.passed=true;
}catch(e){report.failure=e.message;throw e;}finally{fs.writeFileSync(`${output}/award-${mode}-${base.includes('127.0.0.1')?'local':'online'}.json`,JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({...report,checks:{...report.checks,originalFileFingerprints:undefined}},null,2));}

