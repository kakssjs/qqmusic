import WebSocket from 'ws';import {encodeFrame,decodeFrame} from './voice-protocol.mjs';
let audio=0,reply='',session=crypto.randomUUID(),finished=false;
const ws=new WebSocket('wss://openspeech.bytedance.com/api/v3/realtime/dialogue',{headers:{'X-Api-App-ID':process.env.DOUBAO_APP_ID,'X-Api-Access-Key':process.env.DOUBAO_ACCESS_TOKEN,'X-Api-Resource-Id':'volc.speech.dialog','X-Api-App-Key':'PlgvMymc7f3tQnJ6','X-Api-Connect-Id':crypto.randomUUID()},handshakeTimeout:15000});
const timeout=setTimeout(()=>{console.log('TIMEOUT',{audioBytes:audio,textReceived:!!reply});ws.terminate();process.exitCode=1},55000);
ws.on('open',()=>ws.send(encodeFrame(1)));
ws.on('message',data=>{try{const f=decodeFrame(data);console.log('event',f.event,'type',f.type);if(f.type===15||f.event===153){console.log(f.payload);ws.close();clearTimeout(timeout);process.exitCode=1;}
if(f.event===50)ws.send(encodeFrame(100,{asr:{extra:{}},tts:{speaker:'zh_female_vv_jupiter_bigtts',audio_config:{format:'pcm_s16le',sample_rate:24000,channel:1}},dialog:{bot_name:'Melo',system_role:'你是温柔的音乐伙伴，简短回应。',extra:{model:'1.2.1.1',input_mod:'text'}}},session));
if(f.event===150)ws.send(encodeFrame(501,{content:'你好，我今天有点累。请用一句话回应。'},session));
if(f.event===550)reply+=f.payload.content||'';
if(f.event===352)audio+=f.payload.length;
if(f.event===359){console.log('REAL PROVIDER RESULT',{audioBytes:audio,reply});finished=true;clearTimeout(timeout);ws.send(encodeFrame(102,{},session));setTimeout(()=>ws.close(),500);}
}catch(e){console.log('FAIL',e.message);ws.terminate();clearTimeout(timeout);process.exitCode=1;}});
ws.on('error',e=>{console.log(e.message);clearTimeout(timeout);process.exitCode=1});ws.on('close',()=>{if(!finished)clearTimeout(timeout)});
