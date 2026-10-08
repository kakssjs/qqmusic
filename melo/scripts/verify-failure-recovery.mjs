import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/kakssjs/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.MELO_TEST_URL||'http://127.0.0.1:5173/qqmusic/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({reducedMotion:'reduce'});let retry=false;const records=[];
// Deliberate fault injection supplements, and never substitutes for, live Preview tests.
await page.route('**/melo-backend.json',r=>r.fulfill({json:{apiBase:'https://fault-test.melo.local'}}));
await page.route('https://fault-test.melo.local/**',async r=>{const req=r.request(),path=new URL(req.url()).pathname;
 const headers={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,DELETE,OPTIONS','access-control-allow-headers':'Content-Type,X-Melo-Session'};
 const respond=(status,json)=>r.fulfill({status,headers,json});if(req.method()==='OPTIONS')return respond(204,{});
 if(path==='/api/session'){if(req.method()==='POST'){const b=req.postDataJSON(),event={...b,createdAt:new Date().toISOString()};records.unshift(event);return respond(201,{event});}return respond(200,{token:'a'.repeat(64),events:records,aiConnected:true});}
 if(path==='/api/chat')return retry?respond(200,{reply:'听到了，我们慢慢来。'}):respond(503,{error:'测试网络暂时中断'});
 return respond(200,{mood:'tired',reason:'让旋律慢下来。',values:[70,50,80]});
});
try{await page.goto(base);await page.getByRole('link',{name:'开始和 Melo 聊聊',exact:true}).click();await page.getByRole('button',{name:'今天有点累',exact:true}).click();await page.getByText('测试网络暂时中断',{exact:true}).waitFor();assert((await page.locator('textarea').first().inputValue()).includes('累'));assert.equal(await page.locator('.live-message.assistant').count(),0);retry=true;await page.getByRole('button',{name:'重新尝试',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-flow-ready="true"]'));assert.equal(await page.locator('.memory-node').count(),1);await page.goto(base+'?demo=1');await page.waitForTimeout(800);assert.equal(await page.locator('.memory-node').count(),0);await page.goto(base);await page.waitForTimeout(800);assert.equal(await page.locator('.memory-node').count(),1);fs.writeFileSync('failure-recovery-verification.json',JSON.stringify({passed:true,faultInjection:true,draftPreserved:true,noFakeReply:true,retry:true,demoIsolation:true},null,2));console.log('PASS: draft preserved, no fake reply, retry recovery, separate demo history');}finally{await browser.close();}

