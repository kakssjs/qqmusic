"use client";
import { useEffect, useRef, useState } from "react";
import { tracks, useMeloAudio } from "../useMeloAudio";
import { useExpression } from '../../../hooks/useExpression';
import { expressionForMessage } from '../../../data/expressions';
export type MeloRecord = {
  id: string;
  type: string;
  payload: {
    mood?: string;
    text?: string;
    role?: string;
    content?: string;
    track?: string;
    seconds?: number;
    keywords?: string[];
    story?: string;
    memory?: string;
  };
  createdAt: string;
};
export const moods = [
  ["calm", "平静"],
  ["tired", "疲惫"],
  ["sad", "低落"],
  ["bright", "开心"],
  ["focus", "专注"],
];
export function useLiveMelo() {
  const { expression, setExpression } = useExpression('wink');
  const [now, setNow] = useState<Date | null>(null);
  const [records, setRecords] = useState<MeloRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");
  const [mood, setMood] = useState("calm");
  const [reason, setReason] = useState("");
  const [scores, setScores] = useState<number[] | null>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [note, setNote] = useState("");
  const [reduced, setReduced] = useState(false);
  const audio = useMeloAudio();
  const wasPlaying = useRef(false);
  useEffect(() => {
    if (audio.playing) setExpression('listen');
    else if (wasPlaying.current) setExpression('calm');
    wasPlaying.current = audio.playing;
  }, [audio.playing, setExpression]);
  const counted = useRef(0);
  const savingTime = useRef(false);
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(""), 5000);
    return () => clearTimeout(timer);
  }, [status]);
  async function load() {
    try {
      const r = await fetch("/api/session");
      const data = (await r.json()) as {
        events: MeloRecord[];
        aiConnected: boolean;
        error?: string;
      };
      if (!r.ok) throw new Error(data.error);
      setRecords(data.events);
      setReady(true);
      setConnected(data.aiConnected);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    setNow(new Date());
    void load();
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  async function write(
    type: string,
    payload: Record<string, unknown>,
    id = crypto.randomUUID(),
  ) {
    const r = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, payload, id }),
    });
    const data = (await r.json()) as { event: MeloRecord; error?: string };
    if (!r.ok) throw new Error(data.error);
    setRecords((list) => [
      data.event,
      ...list.filter((e) => e.id !== data.event.id),
    ]);
    return data.event;
  }
  function chooseMood(id: string) {
    setExpression(id === 'bright' ? 'happy' : id === 'tired' || id === 'sad' ? 'care' : 'calm');
    setMood(id);
    setReason("");
    audio.select(
      Math.max(
        0,
        tracks.findIndex((t) => t.id === id),
      ),
    );
  }
  async function analyze() {
    if (!note.trim() || busy) return;
    setBusy("emotion");
    setError("");
    try {
      const r = await fetch("/api/emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note }),
      });
      const data = (await r.json()) as {
        mood: string;
        reason: string;
        values: number[];
        error?: string;
      };
      if (!r.ok) throw new Error(data.error);
      chooseMood(data.mood);
      setReason(data.reason);
      setScores(data.values);
      setStatus("Melo 已匹配音乐氛围，你仍然可以自己选择心情。");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function saveMoment() {
    if (busy) return;
    setBusy("save");
    setError("");
    try {
      await write("checkin", {
        mood,
        text:
          note.trim() ||
          `此刻，我感觉${moods.find((m) => m[0] === mood)?.[1]}。`,
      });
      setNote("");
      setStatus("已把这个瞬间留在 Melo Memory。");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function send() {
    if (!chatDraft.trim() || busy) return;
    setExpression(expressionForMessage(chatDraft));
    setBusy("chat");
    setError("");
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatDraft, id: crypto.randomUUID() }),
      });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(data.error);
      setChatDraft("");
      await load();
      setExpression('calm');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  const liked = records.some(
    (e) => e.type === "favorite" && e.payload.track === audio.song.id,
  );
  async function favorite() {
    if (busy) return;
    setBusy("favorite");
    try {
      if (liked) {
        setStatus("这首音乐已经在你的收藏中。");
        return;
      }
      await write("favorite", { track: audio.song.id });
      setExpression('love');
      setStatus("已收藏，Melo 会记得你喜欢这段旋律。");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function story() {
    if (busy) return;
    setBusy("story");
    setError("");
    try {
      const r = await fetch("/api/story", { method: "POST" });
      const data = (await r.json()) as { event: MeloRecord; error?: string };
      if (!r.ok) throw new Error(data.error);
      setRecords((list) => [data.event, ...list]);
      setStatus("你的音乐故事已生成并保存。");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function clear() {
    setBusy("clear");
    try {
      const r = await fetch("/api/session", { method: "DELETE" });
      if (!r.ok) throw new Error("暂时无法清空记录，请重试。");
      setRecords([]);
      setStatus("你的记录已清空。");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  useEffect(() => {
    const amount = Math.floor(audio.listened) - counted.current;
    if (
      !ready ||
      savingTime.current ||
      amount < 1 ||
      (audio.playing && amount < 15)
    )
      return;
    savingTime.current = true;
    const seconds = Math.min(60, amount);
    void write("listening", { seconds, track: audio.song.id })
      .then(() => {
        counted.current += seconds;
      })
      .catch(() => {
        setError("聆听时长暂时未保存，正在保留本次进度。");
      })
      .finally(() => {
        savingTime.current = false;
      });
  }, [audio.listened, audio.playing, ready]);
  return {
    expression,
    setExpression,
    now,
    records,
    ready,
    connected,
    error,
    setError,
    status,
    busy,
    mood,
    reason,
    scores,
    chatDraft,
    setChatDraft,
    note,
    setNote,
    reduced,
    chooseMood,
    analyze,
    saveMoment,
    send,
    favorite,
    liked,
    story,
    clear,
    audio,
    load,
  };
}
export type LiveMelo = ReturnType<typeof useLiveMelo>;
