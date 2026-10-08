"use client";
import { useEffect, useRef, useState } from "react";
import { tracks, useMeloAudio } from "../useMeloAudio";
import { useExpression } from "../../../hooks/useExpression";
import {
  expressionForMessage,
  expressionForMood,
  type Expression,
} from "../../../data/expressions";
import {
  mergeRecords,
  isFavorite,
  contextHints,
  type MeloRecord,
} from "../../../data/experience";
import {
  demoEnabled,
  demoRequest,
  localRecords,
  keepLocal,
} from "../../../data/demo";
export type { MeloRecord } from "../../../data/experience";
export type AIConnectionState =
  "checking" | "configured" | "unconfigured" | "offline";
export type AIModelState = "unverified" | "ready" | "error";
export const moods = [
  ["calm", "平静"],
  ["tired", "疲惫"],
  ["sad", "低落"],
  ["bright", "开心"],
  ["focus", "专注"],
];
export function useLiveMelo() {
  const { expression, setExpression } = useExpression("wink");
  const [records, setRecords] = useState<MeloRecord[]>([]),
    [ready, setReady] = useState(false),
    [connected, setConnected] = useState(false);
  const [connectionState, setConnectionState] =
      useState<AIConnectionState>("checking"),
    [modelState, setModelState] = useState<AIModelState>("unverified");
  const [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(""),
    [mood, setMood] = useState("calm"),
    [reason, setReason] = useState("");
  const [scores, setScores] = useState<number[] | null>(null),
    [chatDraft, setChatDraft] = useState(""),
    [note, setNote] = useState(""),
    [reduced, setReduced] = useState(false),
    [demo, setDemo] = useState(false);
  const [flowReady, setFlowReady] = useState(false),
    [currentMoment, setCurrentMoment] = useState<MeloRecord | null>(null),
    [storageMode, setStorageMode] = useState("cloud");
  const audio = useMeloAudio(),
    wasPlaying = useRef(false),
    before = useRef<Expression>("wink"),
    expressionRef = useRef(expression),
    busyRef = useRef(false),
    recordsRef = useRef(records),
    retryRef = useRef<(() => void) | null>(null),
    counted = useRef(0),
    saving = useRef(false),
    chatId = useRef<{ text: string; id: string } | null>(null);
  useEffect(() => {
    recordsRef.current = records;
  }, [records]);
  useEffect(() => {
    expressionRef.current = expression;
  }, [expression]);
  useEffect(() => {
    if (audio.playing && !wasPlaying.current) {
      before.current = expressionRef.current;
      setExpression("listen");
    } else if (
      !audio.playing &&
      wasPlaying.current &&
      expressionRef.current === "listen"
    )
      setExpression(before.current);
    wasPlaying.current = audio.playing;
  }, [audio.playing, setExpression]);
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 5000);
    return () => clearTimeout(t);
  }, [status]);
  async function request(url: string, options: RequestInit = {}) {
    if (demoEnabled()) {
      await new Promise((r) => setTimeout(r, 350));
      return demoRequest(url, options);
    }
    return fetch(url, { ...options, signal: AbortSignal.timeout(32000) });
  }
  async function json(url: string, body?: Record<string, unknown>) {
    const r = await request(
      url,
      body
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : {},
    );
    const d = (await r.json()) as {
      error?: string;
      events: MeloRecord[];
      aiConnected: boolean;
      event: MeloRecord;
      mood: string;
      reply: string;
      reason: string;
      values: number[];
    };
    if (!r.ok) throw new Error(d.error || "Melo 刚刚走神了，再试一次好吗？");
    return d;
  }
  function updateRecords(items: MeloRecord[]) {
    recordsRef.current = items;
    setRecords(items);
  }
  function restore(moment: MeloRecord) {
    const p = moment.payload;
    setCurrentMoment(moment);
    setMood(p.mood || "calm");
    setReason(p.reason || "");
    setScores(p.values || null);
    audio.select(
      Math.max(
        0,
        tracks.findIndex((t) => t.id === (p.track || p.mood)),
      ),
    );
    setFlowReady(!!p.reply);
  }
  async function load() {
    setConnectionState("checking");
    setError("");
    try {
      const d = await json("/api/session");
      const merged = mergeRecords(d.events || [], localRecords());
      updateRecords(merged);
      setReady(true);
      setConnected(!!d.aiConnected);
      setConnectionState(d.aiConnected ? "configured" : "unconfigured");
      setStorageMode(demoEnabled() ? "demo" : "cloud");
      setModelState(
        merged.some(
          (e) => e.type === "message" && e.payload.role === "assistant",
        )
          ? "ready"
          : "unverified",
      );
      const last = merged.find((e) => e.type === "checkin" && e.payload.track);
      if (last) restore(last);
    } catch {
      const saved = localRecords();
      updateRecords(saved);
      const last = saved.find((e) => e.type === "checkin" && e.payload.track);
      if (last) restore(last);
      setReady(true);
      setConnected(false);
      setConnectionState("offline");
      setStorageMode("local");
      setError("Melo 暂时连不上云端。输入会保留，音乐和本机记忆仍可使用。");
      retryRef.current = () => void load();
    }
  }
  useEffect(() => {
    const t = setTimeout(() => {
      setDemo(demoEnabled());
      void load();
    }, 0);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => {
      clearTimeout(t);
      media.removeEventListener("change", update);
    };
  }, []);
  async function write(
    type: string,
    payload: MeloRecord["payload"],
    id = crypto.randomUUID(),
  ) {
    let event: MeloRecord;
    try {
      const d = await json("/api/session", { type, payload, id });
      event = d.event;
      setStorageMode(demoEnabled() ? "demo" : "cloud");
    } catch {
      event = {
        id,
        type,
        payload: { ...payload, pending: true },
        createdAt: new Date().toISOString(),
      };
      setStorageMode("local");
      setStatus("已暂存于本机。云端恢复后可以重试同步。");
    }
    keepLocal([event, ...localRecords().filter((e) => e.id !== event.id)]);
    updateRecords([
      event,
      ...recordsRef.current.filter((e) => e.id !== event.id),
    ]);
    return event;
  }
  function chooseMood(id: string) {
    setMood(id);
    setExpression(expressionForMood(id));
    setReason(tracks.find((t) => t.id === id)?.reason || "");
    audio.select(
      Math.max(
        0,
        tracks.findIndex((t) => t.id === id),
      ),
    );
  }
  async function understand(
    text: string,
    reply = "",
    id = crypto.randomUUID(),
  ) {
    const d = await json("/api/emotion", { text: text.slice(0, 1000) });
    if (
      !moods.some(([m]) => m === d.mood) ||
      !Array.isArray(d.values) ||
      d.values.length !== 3
    )
      throw new Error("这次理解没有完成，可以再试一次。");
    setMood(d.mood);
    setScores(d.values);
    setReason(d.reason);
    audio.select(
      Math.max(
        0,
        tracks.findIndex((t) => t.id === d.mood),
      ),
    );
    setExpression(expressionForMessage(text, reply));
    const event = await write(
      "checkin",
      {
        momentId: id,
        mood: d.mood,
        text: text.slice(0, 1000),
        track: d.mood,
        liked: isFavorite(recordsRef.current, d.mood),
        reply,
        reason: d.reason,
        values: d.values,
        ...contextHints(text),
        source: demoEnabled() ? "demo" : "ai",
      },
      id,
    );
    setCurrentMoment(event);
    setFlowReady(true);
    return event;
  }
  async function analyze() {
    if (!note.trim() || busyRef.current) return;
    await analyzeText(note.trim(), "");
  }
  async function analyzeText(
    text: string,
    reply: string,
    id = crypto.randomUUID(),
  ) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("emotion");
    setError("");
    setExpression("listen");
    retryRef.current = () => void analyzeText(text, reply, id);
    try {
      await understand(text, reply, id);
      setStatus("这段心情和音乐，已一起留下。");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  }
  async function send(input?: string) {
    const message = (input || chatDraft).trim();
    if (!message || busyRef.current) return;
    busyRef.current = true;
    setBusy("chat");
    setFlowReady(false);
    setError("");
    setChatDraft(message);
    setNote(message.slice(0, 1000));
    setExpression("listen");
    const id =
      chatId.current?.text === message
        ? chatId.current.id
        : crypto.randomUUID();
    chatId.current = { text: message, id };
    retryRef.current = () => void send(message);
    try {
      const d = await json("/api/chat", { message, id });
      if (typeof d.reply !== "string" || !d.reply.trim())
        throw new Error("Melo 没有听清，再说一次好吗？");
      setModelState("ready");
      setConnected(true);
      setConnectionState("configured");
      const now = new Date().toISOString();
      updateRecords([
        {
          id: id + "-reply",
          type: "message",
          payload: { role: "assistant", content: d.reply },
          createdAt: new Date(Date.now() + 1).toISOString(),
        },
        {
          id,
          type: "message",
          payload: { role: "user", content: message },
          createdAt: now,
        },
        ...recordsRef.current.filter(
          (e) => e.id !== id && e.id !== id + "-reply",
        ),
      ]);
      setChatDraft("");
      setExpression(expressionForMessage(message, d.reply));
      setBusy("emotion");
      try {
        await understand(message, d.reply, id + "-moment");
        chatId.current = null;
        retryRef.current = null;
        setStatus("Melo 已把你说的话，连同这首歌一起记住。");
      } catch {
        setError(
          "对话已收到，情绪理解暂时没完成。可以重试理解，或自己选择音乐。",
        );
        retryRef.current = () =>
          void analyzeText(message, d.reply, id + "-moment");
        setExpression(expressionForMessage(message, d.reply));
      }
    } catch (e) {
      setModelState("error");
      setExpression("care");
      setError(
        (e as Error).name === "TimeoutError"
          ? "Melo 的回应慢了一点，输入仍保留。再试一次好吗？"
          : (e as Error).message,
      );
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  }
  async function saveMoment() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("save");
    try {
      const e = await write("checkin", {
        mood,
        text:
          note.trim() ||
          `此刻，我感觉${moods.find((m) => m[0] === mood)?.[1]}。`,
        track: audio.song.id,
        reply: currentMoment?.payload.reply,
        reason,
        values: scores || undefined,
        ...contextHints(note),
      });
      setCurrentMoment(e);
      setExpression("love");
      setStatus("这颗记忆已经亮起。");
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  }
  const liked = isFavorite(records, audio.song.id);
  async function favorite() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("favorite");
    try {
      await write("favorite", { track: audio.song.id, liked: !liked });
      if (currentMoment?.payload.track === audio.song.id) {
        const e = await write("checkin", {
          ...currentMoment.payload,
          momentId: currentMoment.payload.momentId || currentMoment.id,
          liked: !liked,
        });
        setCurrentMoment(e);
      }
      setExpression(liked ? "calm" : "love");
      setStatus(liked ? "已取消收藏。" : "已收藏这段旋律。");
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  }
  async function story() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("story");
    setError("");
    setExpression("listen");
    retryRef.current = () => void story();
    try {
      const d = await json("/api/story", {});
      keepLocal([d.event, ...localRecords()]);
      updateRecords([
        d.event,
        ...recordsRef.current.filter((e) => e.id !== d.event.id),
      ]);
      setExpression("surprise");
      setStatus("你的音乐故事已生成。");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  }
  async function clear() {
    setBusy("clear");
    try {
      const r = await request("/api/session", { method: "DELETE" });
      if (!r.ok) throw new Error("云端记录暂时无法清空，请重试。");
      keepLocal([]);
      updateRecords([]);
      setCurrentMoment(null);
      setFlowReady(false);
      setStatus("你的记录已清空。");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  }
  function replay(event: MeloRecord) {
    setCurrentMoment(event);
    setScores(event.payload.values || null);
    const id = event.payload.track || event.payload.mood || "calm",
      i = Math.max(
        0,
        tracks.findIndex((t) => t.id === id),
      );
    setMood(event.payload.mood || id);
    setReason(event.payload.reason || tracks[i].reason);
    audio.select(i);
    void audio.play(i, 0);
    setStatus("一起再听一次这段心情。");
  }
  function direction(id: string) {
    const nextReason = tracks.find((t) => t.id === id)?.reason || "";
    audio.select(
      Math.max(
        0,
        tracks.findIndex((t) => t.id === id),
      ),
    );
    setReason(nextReason);
    setExpression("surprise");
    if (currentMoment) {
      const next = {
        ...currentMoment,
        payload: {
          ...currentMoment.payload,
          momentId: currentMoment.payload.momentId || currentMoment.id,
          track: id,
          reason: nextReason,
        },
      };
      setCurrentMoment(next);
      void write("checkin", next.payload).then((e) =>
        setCurrentMoment((c) => (c?.payload.track === id ? e : c)),
      );
    }
  }
  async function syncPending() {
    try {
      for (const r of localRecords().filter((e) => e.payload.pending)) {
        const p = { ...r.payload };
        delete p.pending;
        const d = await json("/api/session", {
          type: r.type,
          payload: p,
          id: r.id,
        });
        keepLocal([d.event, ...localRecords().filter((e) => e.id !== r.id)]);
      }
      await load();
    } catch {
      setError("云端还没有恢复，本机记录仍然保留。");
    }
  }
  useEffect(() => {
    const amount = Math.floor(audio.listened) - counted.current;
    if (
      !ready ||
      saving.current ||
      amount < 1 ||
      (audio.playing && amount < 10)
    )
      return;
    saving.current = true;
    const seconds = Math.min(60, amount);
    void write("listening", { seconds, track: audio.song.id })
      .then(() => {
        counted.current += seconds;
      })
      .finally(() => {
        saving.current = false;
      });
  }, [audio.listened, audio.playing, audio.song.id, ready]);
  return {
    expression,
    setExpression,
    records,
    ready,
    connected,
    connectionState,
    modelState,
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
    demo,
    flowReady,
    currentMoment,
    storageMode,
    replay,
    direction,
    retry: () => retryRef.current?.(),
    syncPending,
  };
}
export type LiveMelo = ReturnType<typeof useLiveMelo>;
