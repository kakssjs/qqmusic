import {randomBytes} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const word=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(n);return b;};
export function encodeFrame(event,payload={},session='',type=1){
 const raw=Buffer.isBuffer(payload),data=raw?payload:Buffer.from(JSON.stringify(payload));
 return Buffer.concat([Buffer.from([0x11,(type<<4)|4,raw?0:0x10,0]),word(event),...(event>=100?[word(Buffer.byteLength(session)),Buffer.from(session)]:[]),word(data.length),data]);
}
export function decodeFrame(input){
 const b=Buffer.from(input);if(b.length<8)throw new Error('Truncated voice frame');
 let p=(b[0]&15)*4;const type=b[1]>>4,flags=b[1]&15,serialization=b[2]>>4,compression=b[2]&15;
 const read=()=>{if(p+4>b.length)throw new Error('Truncated voice frame');const n=b.readUInt32BE(p);p+=4;return n;};
 const bytes=n=>{if(n>1024*1024||p+n>b.length)throw new Error('Invalid voice frame length');const x=b.subarray(p,p+n);p+=n;return x;};
 let code,event=0,session='';if(type===15)code=read();if(flags&3)read();if(flags&4)event=read();
 if(event>=100||(event>=50&&event<=52))session=bytes(read()).toString();
 let payload=bytes(read());if(compression===1)payload=gunzipSync(payload,{maxOutputLength:1024*1024});
 if(serialization===1)payload=JSON.parse(payload.toString());return {event,type,code,session,payload};
}
export class VoiceTickets{
 constructor(ttl=30000){this.ttl=ttl;this.items=new Map();}
 issue(user,now=Date.now()){for(const [id,v]of this.items)if(v.expiry<now)this.items.delete(id);if(this.items.size>1000)throw new Error('Voice busy');const id=randomBytes(32).toString('hex');this.items.set(id,{user,expiry:now+this.ttl});return id;}
 take(id,now=Date.now()){const t=this.items.get(id);this.items.delete(id);return t&&t.expiry>=now?t.user:null;}
}
