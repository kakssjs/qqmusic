import { originalTracks, type Track } from '../../data/music/catalog.ts';
// No official credentials or licensed third-party files are bundled. Their adapters
// accept only an explicitly authorized URL. Editorial QQ links are never audio.
export const providerCapabilities={officialAudio:false,licensedDemo:false,original:true};
export function synthesize(t:Track,rate=16000) {
  const c=t.composition;if(!c)throw new Error('No original composition');
  const data=new Float32Array(rate*t.duration);
  for(let i=0;i<data.length;i++){
    const sec=i/rate,seg=sec%12,env=Math.min(1,seg/2)*Math.min(1,(12-seg)/2);
    let sample=0;
    for(const f of c.notes)sample+=.028*env*(Math.sin(2*Math.PI*f*sec)+(.08+c.voice*.045)*Math.sin(2*Math.PI*f*2*sec));
    const phase=sec%c.tempo,note=c.melody[Math.floor(sec/c.tempo)%c.melody.length];
    const decay=c.voice===2?3.8:c.voice===1?2.1:1.6;
    sample+=.075*Math.min(1,phase/.025)*Math.exp(-phase*decay)*(Math.sin(2*Math.PI*note*sec)+c.voice*.045*Math.sin(2*Math.PI*note*3*sec));
    if(c.pulse){const beat=sec%.5;sample+=.026*c.pulse*Math.exp(-beat*24)*Math.sin(2*Math.PI*(60-22*beat)*sec);const hat=sec%.25;sample+=.008*c.pulse*Math.exp(-hat*55)*(Math.sin(i*1.971)+Math.sin(i*.717));}
    data[i]=sample*Math.min(1,sec/2)*Math.min(1,(t.duration-sec)/4);
  }
  return data;
}
export async function audioBuffer(ctx:AudioContext,t:Track) {
  const url=t.source==='qq-music'?t.previewUrl:t.audioUrl;
  if(url)try {const r=await fetch(url,{signal:AbortSignal.timeout(8000)});if(r.ok)return {buffer:await ctx.decodeAudioData(await r.arrayBuffer()),fallback:false};}catch{/* Original synthesis remains available if the local file is unreachable. */}
  if(t.source==='user-upload')throw new Error('这首歌暂时无法加载，请稍后重试。');
  const original=t.composition?t:originalTracks.find(x=>x.coreMood===t.coreMood)||originalTracks[0];
  const samples=synthesize(original),buffer=ctx.createBuffer(1,samples.length,16000);buffer.getChannelData(0).set(samples);
  return {buffer,fallback:!t.composition};
}
