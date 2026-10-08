class MeloVoiceCapture extends AudioWorkletProcessor {
 constructor(){super();this.samples=[];this.position=0;}
 process(inputs){const data=inputs[0]?.[0];if(!data)return true;const ratio=sampleRate/16000;
  while(this.position<data.length){this.samples.push(data[Math.floor(this.position)]);this.position+=ratio;}
  this.position-=data.length;
  while(this.samples.length>=320){const values=this.samples.splice(0,320),b=new ArrayBuffer(640),v=new DataView(b);values.forEach((x,i)=>v.setInt16(i*2,Math.round(Math.max(-1,Math.min(1,x))*(x<0?32768:32767)),true));this.port.postMessage(b,[b]);}
  return true;
 }
}
registerProcessor('melo-voice-capture',MeloVoiceCapture);
