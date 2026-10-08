"use client";
import { useEffect, useRef, useState } from "react";
export const tracks = [
  {
    id: "calm",
    name: "晚风",
    subtitle: "让今天慢慢落下",
    reason: "平静的和弦与缓慢的旋律，为你留一段安静的时间。",
    color: "#a8a5ce",
    notes: [130.81, 196, 261.63],
    melody: [523.25, 587.33, 659.25, 587.33, 523.25, 440],
    tempo: 3,
  },
  {
    id: "tired",
    name: "月光停靠",
    subtitle: "把疲惫交给夜晚",
    reason: "更慢的节奏、更柔和的音色，让紧绷的心情慢慢松开。",
    color: "#a392c4",
    notes: [110, 164.81, 220],
    melody: [440, 392, 329.63, 293.66, 329.63, 392],
    tempo: 4,
  },
  {
    id: "sad",
    name: "雨后",
    subtitle: "不必急着放晴",
    reason: "低音与轻柔的留白，陪你容纳此刻的低落。",
    color: "#8aafba",
    notes: [146.83, 220, 293.66],
    melody: [587.33, 523.25, 440, 392, 440, 523.25],
    tempo: 3.5,
  },
  {
    id: "bright",
    name: "向光而行",
    subtitle: "让好心情再亮一点",
    reason: "轻盈的上行音符，让开心的时刻有自己的旋律。",
    color: "#d3b492",
    notes: [174.61, 261.63, 349.23],
    melody: [523.25, 659.25, 783.99, 880, 783.99, 659.25],
    tempo: 1.7,
  },
  {
    id: "focus",
    name: "深蓝航线",
    subtitle: "只留下一件重要的事",
    reason: "稳定重复的音型，减少旋律变化，陪你专注当下。",
    color: "#859dce",
    notes: [98, 146.83, 196],
    melody: [392, 392, 440, 392, 293.66, 392],
    tempo: 2.5,
  },
];
export function useMeloAudio() {
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [listened, setListened] = useState(0);
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
  const index = useRef(0);
  const generation = useRef(0);
  const duration = 90;
  function stop() {
    generation.current += 1;
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
    const ticket = ++generation.current;
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
      let b = buffers.current.get(which);
      if (!b) {
        const rate = 22050;
        b = ctx.createBuffer(1, rate * duration, rate);
        const data = b.getChannelData(0),
          t = tracks[which];
        for (let i = 0; i < data.length; i++) {
          const sec = i / rate;
          let sample = 0;
          const segment = sec % 12,
            env = Math.min(1, segment / 2) * Math.min(1, (12 - segment) / 2);
          for (const f of t.notes)
            sample +=
              0.035 *
              env *
              (Math.sin(2 * Math.PI * f * sec) +
                0.16 * Math.sin(2 * Math.PI * f * 2 * sec));
          const phase = sec % t.tempo,
            note = t.melody[Math.floor(sec / t.tempo) % t.melody.length];
          sample +=
            0.075 *
            Math.min(1, phase / 0.05) *
            Math.exp(-phase * 1.9) *
            Math.sin(2 * Math.PI * note * sec);
          data[i] =
            sample * Math.min(1, sec / 3) * Math.min(1, (duration - sec) / 5);
        }
        buffers.current.set(which, b);
      }
      gain.current!.gain.value = volume;
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.connect(gain.current!);
      source.current = s;
      offset.current = Math.min(89.9, position);
      started.current = ctx.currentTime;
      s.start(0, offset.current);
      active.current = true;
      lastTick.current = ctx.currentTime;
      setPlaying(true);
      setError("");
      s.onended = () => {
        active.current = false;
        source.current = null;
        offset.current = 0;
        setProgress(0);
        setPlaying(false);
      };
    } catch {
      setError("声音暂时无法启动，请再次点击播放。");
      setPlaying(false);
    }
  }
  function toggle() {
    if (active.current) {
      offset.current = Math.min(
        duration,
        offset.current + (context.current!.currentTime - started.current),
      );
      stop();
      setProgress(offset.current);
    } else void play();
  }
  function select(which: number) {
    const wasPlaying = active.current;
    stop();
    index.current = which;
    setTrack(which);
    offset.current = 0;
    setProgress(0);
    if (wasPlaying) void play(which, 0);
  }
  function seek(position: number) {
    const wasPlaying = active.current;
    stop();
    offset.current = position;
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
        setListened((v) => v + Math.max(0, now - lastTick.current));
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
    listened,
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
    next: () => select((index.current + 1) % tracks.length),
    previous: () => select((index.current + tracks.length - 1) % tracks.length),
  };
}
