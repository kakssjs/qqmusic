import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createMeloServer} from './server.mjs';
test('real persistence, isolation, validation, CORS, AI errors and successful model contracts',async()=>{
  const directory=mkdtempSync(path.join(os.tmpdir(),'melo-test-'));
  const model=http.createServer(async(req,res)=>{let raw='';for await(const b of req)raw+=b;const b=JSON.parse(raw);const prompt=b.messages[0].content;const content=prompt.includes('fatigue')?JSON.stringify({mood:'calm',label:'平静',reason:'适合晚风',fatigue:30,stress:20,relaxation:70}):prompt.includes('keywords')?JSON.stringify({keywords:['晚风','平静','记录'],story:'来自记录的故事',memory:'喜欢晚风'}):'你好，音乐旅人。';res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{message:{content}}]}));});
  await new Promise(r=>model.listen(0,'127.0.0.1',r));
  let server=createMeloServer({directory,aiKey:'test-key',aiBase:`http://127.0.0.1:${model.address().port}`});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let base=`http://127.0.0.1:${server.address().port}`;
  const api=(url,method='GET',body,token)=>fetch(base+url,{method,headers:{'Content-Type':'application/json',...(token?{'X-Melo-Session':token}:{})},...(body?{body:JSON.stringify(body)}:{})});
  try{
    const a=await(await api('/api/session')).json(),b=await(await api('/api/session')).json();assert.match(a.token,/^[a-f0-9]{64}$/);
    assert.equal((await api('/api/session','POST',{id:'x',type:'checkin',payload:{mood:'calm',text:'晚风'}})).status,401);
    assert.equal((await api('/api/session','POST',{id:'x',type:'checkin',payload:{mood:'bad',text:'晚风'}},a.token)).status,400);
    const payload={id:'moment',type:'checkin',payload:{mood:'calm',text:'喜欢晚风'}};
    assert.equal((await api('/api/session','POST',payload,a.token)).status,201);await api('/api/session','POST',payload,a.token);
    assert.equal((await(await api('/api/session','GET',null,a.token)).json()).events.length,1);
    assert.equal((await(await api('/api/session','GET',null,b.token)).json()).events.length,0);
    assert.equal((await fetch(base+'/api/session',{headers:{Origin:'https://evil.example'}})).status,403);
    const preflight=await fetch(base+'/api/session',{method:'OPTIONS',headers:{Origin:'https://melo-qqmusic.vercel.app'}});assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'https://melo-qqmusic.vercel.app');
    const chat={id:'chat',message:'你好'};assert.equal((await(await api('/api/chat','POST',chat,a.token)).json()).reply,'你好，音乐旅人。');await api('/api/chat','POST',chat,a.token);
    assert.equal((await(await api('/api/session','GET',null,a.token)).json()).events.filter(e=>e.type==='message').length,2);
    assert.deepEqual((await(await api('/api/emotion','POST',{text:'今天平静'},a.token)).json()).values,[30,20,70]);
    assert.equal((await(await api('/api/story','POST',{},a.token)).json()).event.type,'story');
    await new Promise(r=>server.close(r));server=createMeloServer({directory,aiKey:''});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;
    assert.equal((await(await api('/api/session','GET',null,a.token)).json()).events.length,4);
    assert.equal((await api('/api/chat','POST',{id:'next',message:'你好'},a.token)).status,503);
    await api('/api/session','DELETE',null,a.token);assert.equal((await(await api('/api/session','GET',null,a.token)).json()).events.length,0);
  }finally{await new Promise(r=>server.close(r));await new Promise(r=>model.close(r));rmSync(directory,{recursive:true,force:true});}
});
