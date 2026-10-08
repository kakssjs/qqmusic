import assert from 'node:assert/strict';
import {encodeFrame,decodeFrame,VoiceTickets} from './voice-protocol.mjs';
const f=encodeFrame(100,{hello:'你好'},'session');assert.equal(f[0],17);assert.equal(f[1],20);assert.equal(decodeFrame(f).event,100);assert.equal(decodeFrame(f).payload.hello,'你好');
const pcm=Buffer.from([0,1,2,3]);assert.deepEqual(decodeFrame(encodeFrame(200,pcm,'s',2)).payload,pcm);
assert.throws(()=>decodeFrame(Buffer.from([17,20])));
const tickets=new VoiceTickets(10);const t=tickets.issue('u',100);assert.equal(tickets.take(t,105),'u');assert.equal(tickets.take(t,106),null);const expired=tickets.issue('u',100);assert.equal(tickets.take(expired,111),null);
console.log('PASS binary protocol, malformed frame, one-use ticket, expiry');
