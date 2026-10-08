import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/kakssjs/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
const result={url:'https://melo-qqmusic.vercel.app',at:new Date().toISOString(),responses:[],errors:[]};
try {
 const context=await browser.newContext({viewport:{width:1440,height:960}}); const page=await context.newPage();
 page.on('pageerror',e=>result.errors.push(e.message));
 page.on('response',r=>{if(r.url().includes('/api/')||r.status()>=400)result.responses.push({url:r.url(),status:r.status()});});
 await page.goto(result.url,{waitUntil:'networkidle'}); await page.waitForTimeout(2000);
 result.emptyMemory=await page.locator('.memory-node').count();result.initialStatus=await page.locator('.conversation-heading').innerText();
 await page.getByRole('link',{name:'开始和 Melo 聊聊',exact:true}).click();
 result.onboarding=await page.getByRole('button',{name:'今天有点累',exact:true}).count();
 await page.getByLabel('给 Melo 的消息').fill('今天比赛没有做好，有点累。我想安静一会。');
 result.sendEnabled=await page.getByRole('button',{name:'发送给 Melo'}).isEnabled();
 if(result.sendEnabled){await page.getByRole('button',{name:'发送给 Melo'}).click();await page.waitForTimeout(28000);}
 result.chat=await page.locator('.live-chat-messages').innerText();result.expression=await page.locator('.melo-character').getAttribute('data-expression');result.song=await page.locator('.record-cover h3').innerText();
 result.emotionReason=await page.locator('.emotion-reason').count();result.memoryAfterChat=await page.locator('.memory-node').count();
 result.fonts=await page.evaluate(async()=>{await document.fonts.ready;return [...document.fonts].map(f=>({family:f.family,status:f.status}));});
 result.storageKeys=await page.evaluate(()=>Object.keys(localStorage));
 fs.mkdirSync('D:/chatgpt/qqmusic/final-acceptance',{recursive:true});fs.writeFileSync('D:/chatgpt/qqmusic/final-acceptance/baseline.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
