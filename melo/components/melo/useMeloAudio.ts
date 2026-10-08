"use client";
import { useEffect, useRef, useState } from "react";
import { playableTracks as tracks } from '../../data/music/catalog';
import { audioBuffer } from '../../lib/music/provider';
export { playableTracks as tracks } from '../../data/music/catalog';
export function useMeloAudio() {
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [listened, setListened] = useState(0);
  const [listeningByTrack,setListeningByTrack]=useState<Record<string,number>>({});
  const lastTick = useRef(0);
  const [volume, setVolume] = useState(0.65);
  const [error, setError] = useState("");
  const [levels, setLevels] = useState(Array(32).fill(4));
  const context = useRef<AudioContext | null>(null);
  const source = useRef<AudioBufferSourceNode | null>(null);
  const gain = useRef<GainNode | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const offset = useRef(0);
  const started = useRef(0);
  const buffers = useRef(new Map<number, AudioBuffer>());
  const active = useRef(false);
  const wantsPlayback = useRef(false);
  const index = useRef(0);
  const generation = useRef(0);
  const duration = tracks[track].duration;
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [queue, setQueueState] = useState<string[]>(tracks.map(t=>t.id));
  const queueRef = useRef(queue);
  const volumeRef = useRef(volume);
  volumeRef.current=volume;
  function setQueue(ids:string[]) {
    const valid=[...new Set(ids.filter(id=>tracks.some(t=>t.id===id)))];
    if(valid.length){queueRef.current=valid;setQueueState(valid);}
  }
  function step(delta:number) {
    const q=queueRef.current,at=q.indexOf(tracks[index.current].id);
    select(Math.max(0,tracks.findIndex(t=>t.id===q[(Math.max(0,at)+delta+q.length)%q.length])));
  }

  function stop() {
    generation.current += 1;
    setLoading(false);
    if (source.current) {
      source.current.onended = null;
      source.current.stop();
      source.current.disconnect();
      source.current = null;
    }
    active.current = false;
    setPlaying(false);
  }
  async function play(which = index.current, position = offset.current) {
    wantsPlayback.current = true;
    const ticket = ++generation.current;
    if(!tracks[which])return;
    try {
      if (!context.current) {
        context.current = new AudioContext();
        gain.current = context.current.createGain();
        analyser.current = context.current.createAnalyser();
        analyser.current.fftSize = 128;
        gain.current.connect(analyser.current);
        analyser.current.connect(context.current.destination);
      }
      const ctx = context.current;
      await ctx.resume();
      if (ticket !== generation.current) return;
      stop();
      index.current = which;
      setTrack(which);
      setLoading(true);
      const loadTicket=generation.current;
      let b = buffers.current.get(which);
      if (!b) {
        const result=await audioBuffer(ctx,tracks[which]);
        if(loadTicket!==generation.current)return;
        b=result.buffer;buffers.current.set(which,b);
        if(buffers.current.size>4){const oldest=buffers.current.keys().next().value;if(oldest!==undefined&&oldest!==which)buffers.current.delete(oldest);}
      }
      setLoading(false);
      gain.current!.gain.value = volumeRef.current;
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.connect(gain.current!);
      source.current = s;
      offset.current = Math.max(0, Math.min(b.duration - .1, position));
      started.current = ctx.currentTime;
      s.start(0, offset.current);
      active.current = true;
      lastTick.current = ctx.currentTime;
      setPlaying(true);
      setHasStarted(true);
      setError("");
      s.onended = () => {
        active.current = false;
        source.current = null;
        offset.current = 0;
        setProgress(0);
        setPlaying(false);
        const q=queueRef.current,at=q.indexOf(tracks[index.current].id);
        if(q.length>1&&at>=0&&at<q.length-1)void play(Math.max(0,tracks.findIndex(t=>t.id===q[at+1])),0);
        else wantsPlayback.current=false;
      };
    } catch {
      setError("声音暂时无法启动，请再次点击播放。");
      setPlaying(false);
      setLoading(false);
    }
  }
  function toggle() {
    if (wantsPlayback.current) {
      wantsPlayback.current=false;
      offset.current = Math.min(
        duration,
        offset.current + (active.current&&context.current ? context.current.currentTime - started.current : 0),
      );
      stop();
      setProgress(offset.current);
    } else void play();
  }
  function select(which: number) {
    if(!tracks[which])return;
    const wasPlaying = wantsPlayback.current;
    stop();
    index.current = which;
    setTrack(which);
    offset.current = 0;
    setProgress(0);
    if (wasPlaying) void play(which, 0);
  }
  function seek(position: number) {
    const wasPlaying = wantsPlayback.current;
    stop();
    offset.current = Math.max(0,Math.min(duration-.1,position));
    setProgress(position);
    if (wasPlaying) void play(index.current, position);
  }
  useEffect(() => {
    if (gain.current) gain.current.gain.value = volume;
  }, [volume]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (active.current && context.current) {
        const now = context.current.currentTime;
        const delta=Math.max(0,now-lastTick.current),id=tracks[index.current].id;
        setListened((v) => v + delta);
        setListeningByTrack(v=>({...v,[id]:(v[id]||0)+delta}));
        lastTick.current = now;
        setProgress(
          Math.min(
            duration,
            offset.current + context.current.currentTime - started.current,
          ),
        );
        const bins = new Uint8Array(64);
        analyser.current?.getByteFrequencyData(bins);
        setLevels(
          Array.from({ length: 32 }, (_, i) => Math.max(4, bins[i] * 0.33)),
        );
      }
    }, 120);
    return () => {
      clearInterval(timer);
      if (source.current) {
        source.current.onended = null;
        source.current.stop();
      }
      void context.current?.close();
    };
  }, []);
  return {
    play,
    loading,hasStarted,queue,setQueue,
    listened,listeningByTrack,
    track,
    song: tracks[track],
    playing,
    progress,
    duration,
    volume,
    setVolume,
    levels,
    error,
    toggle,
    select,
    seek,
    next: () => step(1),
    previous: () => step(-1),
  };
}

