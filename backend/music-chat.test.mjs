import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createMeloServer } from './server.mjs';

test('chat receives current playable candidates and preserves the chosen song on retry', async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'melo-music-'));
  let prompt = '';
  let selectedId = 'upload-summer';
  let malformedOnce = false;
  const model = http.createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk;
    prompt = JSON.parse(raw).messages[0].content;
    if (malformedOnce) { malformedOnce=false; res.end(JSON.stringify({choices:[{message:{content:'今天可以听夏天。'}}]})); return; }
    res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ reply: '今天很开心，试试《夏天》。', trackId: selectedId }) } }] }));
  });
  await new Promise(r => model.listen(0, '127.0.0.1', r));
  const server = createMeloServer({ directory, aiKey: 'test', aiBase: `http://127.0.0.1:${model.address().port}` });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const { token } = await (await fetch(base + '/api/session')).json();
    const request = () => fetch(base + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Melo-Session': token }, body: JSON.stringify({ id: 'happy', message: '今天开心，想听人声', musicContext: { mood: 'bright', reason: '轻快的声音', candidates: [{ id: 'upload-summer', title: '夏天', artist: '李玖哲', reason: '轻快流行歌曲' }] } }) });
    const first = await (await request()).json();
    assert.equal(first.trackId, 'upload-summer');
    assert.match(prompt, /夏天/);
    assert.doesNotMatch(prompt, /可听原创音乐：晚风/);
    assert.equal((await (await request()).json()).trackId, first.trackId);
    selectedId = 'not-in-catalog';
    const rejected = await fetch(base + '/api/chat', { method:'POST', headers:{'Content-Type':'application/json','X-Melo-Session':token}, body:JSON.stringify({id:'bad-selection',message:'换一首歌',musicContext:{candidates:[{id:'upload-summer',title:'夏天',artist:'李玖哲'}]}}) });
    assert.equal(rejected.status, 502);
    const events = await (await fetch(base + '/api/session', {headers:{'X-Melo-Session':token}})).json();
    assert(!events.events.some(e=>e.id==='bad-selection-reply'));
    selectedId='upload-summer'; malformedOnce=true;
    const repaired = await fetch(base + '/api/chat', { method:'POST', headers:{'Content-Type':'application/json','X-Melo-Session':token}, body:JSON.stringify({id:'format-repair',message:'想听一首人声',musicContext:{candidates:[{id:'upload-summer',title:'夏天',artist:'李玖哲'}]}}) });
    assert.equal(repaired.status, 200);
    assert.equal((await repaired.json()).trackId, 'upload-summer');
  } finally {
    await new Promise(r => server.close(r)); await new Promise(r => model.close(r));
    rmSync(directory, { recursive: true, force: true });
  }
});
