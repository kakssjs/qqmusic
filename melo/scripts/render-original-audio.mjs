import fs from 'node:fs';
import { playableTracks } from '../data/music/catalog.ts';
import { synthesize } from '../lib/music/provider.ts';
fs.mkdirSync('public/music/audio',{recursive:true});
for(const t of playableTracks){const data=synthesize(t),b=Buffer.alloc(44+data.length*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(16000,24);b.writeUInt32LE(32000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(data.length*2,40);for(let i=0;i<data.length;i++)b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,data[i]))*32767),44+i*2);fs.writeFileSync(`public/music/audio/${t.id}.wav`,b);}
console.log(`Rendered ${playableTracks.length} distinct original 90-second WAV files. No third-party audio.`);
