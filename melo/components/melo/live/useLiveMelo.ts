"use client";
import { useEffect, useRef, useState, useMemo } from "react";
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
import { catalog, type Playlist } from '../../../data/music/catalog';
import { recommend, parseIntent, buildMix, preferencesFromRecords, recordTrack, differentTracks } from '../../../lib/music/recommendation';
import { transportPayload, normalizeRecord, likedMixes } from '../../../lib/music/persistence';
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
    counted = useRef<Record<string,number>>({}),
    saving = useRef(false),
    chatId = useRef<{ text: string; id: string } | null>(null);
  const preferences=useMemo(()=>preferencesFromRecords(records),[records]);
  const [musicDirection,setMusicDirection]=useState<'quiet'|'warm'|'energy'|undefined>();
  const signal=useMemo(()=>({...parseIntent(currentMoment?.payload.text||note,mood,scores||undefined),mood,direction:musicDirection,preferences}),[currentMoment,note,mood,scores,musicDirection,preferences]);
  const recommendations=useMemo(()=>recommend(signal),[signal]);
  const [mix,setMix]=useState<Playlist>(()=>buildMix({mood:'calm'}));
  const mixVariation=useRef(0);
  const [nowPlaying,setNowPlaying]=useState(false);
  const [searching,setSearching]=useState(false),[searchResults,setSearchResults]=useState<typeof catalog>([]),[searchStatus,setSearchStatus]=useState('');
  const [speaking,setSpeaking]=useState(false);
  useEffect(()=>{if(!speaking)return;const t=setTimeout(()=>setSpeaking(false),4000);return ()=>clearTimeout(t);},[speaking]);
  const mode=busy==='chat'?'listening':['emotion','story'].includes(busy)?'thinking':['favorite','save'].includes(busy)?'celebrate':audio.playing?'music':speaking?'speaking':'idle';
  function regenerateMix(){const next=buildMix(signal,++mixVariation.current);setMix(next);setExpression('surprise');setStatus('六段声音，换一种走向。');}
  function playQueue(ids:string[],shuffle=false){
    const q=ids.filter(id=>tracks.some(t=>t.id===id));
    if(shuffle)for(let i=q.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[q[i],q[j]]=[q[j],q[i]];}
    if(!q.length)return;
    audio.setQueue(q);direction(q[0],q);void audio.play(tracks.findIndex(t=>t.id===q[0]),0);
  }
  function changeDirection(dir:'quiet'|'warm'|'energy'){setMusicDirection(dir);const list=recommend({...signal,direction:dir});direction(list[0].id,list.map(t=>t.id));}
  async function favoriteMix(){const liked=likedMixes(recordsRef.current).some(p=>p.id===mix.id);await write('favorite',{track:mix.tracks[0],mix,liked:!liked});setExpression(liked?'calm':'love');setStatus(liked?'已取消收藏歌单。':'这六段陪伴，一起收藏。');}
  async function searchMusic(text:string){
    if(!text.trim()||searching)return;
    setSearching(true);let moodHint=mood,values:number[]|undefined;
    try{const d=await json('/api/emotion',{text:text.slice(0,1000)});moodHint=d.mood;values=d.values;setSearchStatus(demoEnabled()?'演示情绪 + 场景关键词规则':'AI 理解状态 + 场景与风格关键词规则');}
    catch{setSearchStatus('AI 暂时走神了，本次使用本地关键词规则找歌。');}
    const intent=parseIntent(text,moodHint,values),list=recommend({...intent,preferences},6,catalog);
    setSearchResults(list);setSearching(false);setExpression('surprise');
  }
  function surprise(){const list=differentTracks(preferences,tracks);if(!list.length)return;direction(list[0].id,list.map(t=>t.id));setStatus(preferences.recentTracks.length||preferences.likedTracks.length?'这次，试一种与你最近不同的声音。':'第一次见面，先试一段明亮的陌生声音。');}
  const musicRestored=useRef(false);
  function musicKey(){return 'melo-music-v4:'+(demoEnabled()?'demo':localStorage.getItem('melo-cloud-session-v1')||'browser');}
  function restoreMusic(){try{const p=JSON.parse(localStorage.getItem(musicKey())||'null');if(p&&tracks.some(t=>t.id===p.track)){if(Array.isArray(p.queue))audio.setQueue(p.queue);audio.select(tracks.findIndex(t=>t.id===p.track));if(p.mix?.tracks?.length===6&&p.mix.tracks.every((id:string)=>tracks.some(t=>t.id===id)))setMix(p.mix);mixVariation.current=p.variation||0;}}catch{}musicRestored.current=true;}
  useEffect(()=>{if(!ready||!musicRestored.current)return;try{localStorage.setItem(musicKey(),JSON.stringify({track:audio.song.id,queue:audio.queue,mix,variation:mixVariation.current}));}catch{}},[ready,audio.song.id,audio.queue,mix]);
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
    if(p.playlist?.length)audio.setQueue(p.playlist);
    setMix(p.mix||buildMix({...parseIntent(p.text||'',p.mood,p.values),mood:p.mood||'calm'}));
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
      const merged = mergeRecords((d.events || []).map(normalizeRecord), localRecords().map(normalizeRecord));
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
    } finally {
      restoreMusic();
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
      const d = await json("/api/session", { type, payload:transportPayload(payload), id });
      event = normalizeRecord(d.event);
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
    const kept=keepLocal([event, ...localRecords().filter((e) => e.id !== event.id)]);
    if(!kept&&event.payload.pending)setStatus("浏览器存储不可用。这次记录仅在当前页面中，请恢复网络后重试同步。");
    updateRecords([
      event,
      ...recordsRef.current.filter((e) => e.id !== event.id),
    ]);
    return event;
  }
  function chooseMood(id: string) {
    setMood(id);
    setExpression(expressionForMood(id));
    setMusicDirection(undefined);
    const list=recommend({...signal,mood:id,energy:undefined,direction:undefined});
    setMix(buildMix({...signal,mood:id,energy:undefined,direction:undefined}));
    setReason(list[0].reason);
    audio.setQueue(list.map(t=>t.id));
    audio.select(
      Math.max(
        0,
        tracks.findIndex((t) => t.id === list[0].id),
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
    const nextSignal={...parseIntent(text,d.mood,d.values),mood:d.mood,preferences:preferencesFromRecords(recordsRef.current)};
    const list=recommend(nextSignal),nextMix=buildMix(nextSignal);
    setMix(nextMix);setMusicDirection(undefined);audio.setQueue(list.map(t=>t.id));
    audio.select(tracks.findIndex(t=>t.id===list[0].id));
    setExpression(expressionForMessage(text, reply));
    const event = await write(
      "checkin",
      {
        momentId: id,
        mood: d.mood,
        text: text.slice(0, 1000),
        track: list[0].id,
        momentAt:new Date().toISOString(),
        playlist:list.map(t=>t.id),
        mix:nextMix,
        liked: isFavorite(recordsRef.current, list[0].id),
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
      setSpeaking(true);
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
        momentAt:new Date().toISOString(),
        playlist:audio.queue,
        mix,
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
          momentAt: currentMoment.payload.momentAt || currentMoment.createdAt,
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
      setMix(buildMix({mood:'calm'}));
      try{localStorage.removeItem(musicKey());}catch{}
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
    const id = recordTrack(event),
      i = Math.max(
        0,
        tracks.findIndex((t) => t.id === id),
      );
    setMood(event.payload.mood || id);
    setReason(event.payload.reason || tracks[i].reason);
    if(event.payload.playlist?.length)audio.setQueue(event.payload.playlist);
    if(event.payload.mix)setMix(event.payload.mix);
    audio.select(i);
    void audio.play(i, 0);
    setStatus("一起再听一次这段心情。");
  }
  function direction(id: string,queue?:string[]) {
    if(!tracks.some(t=>t.id===id))return;
    if(queue)audio.setQueue(queue);
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
          catalogTrackId:id,
          playlist:queue||audio.queue,
          momentAt:currentMoment.payload.momentAt||currentMoment.createdAt,
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
          payload: transportPayload(p),
          id: r.id,
        });
        keepLocal([normalizeRecord(d.event), ...localRecords().filter((e) => e.id !== r.id)]);
      }
      await load();
    } catch {
      setError("云端还没有恢复，本机记录仍然保留。");
    }
  }
  useEffect(() => {
    if(!ready||saving.current)return;
    const entry=Object.entries(audio.listeningByTrack).find(([id,value])=>{
      const amount=Math.floor(value)-(counted.current[id]||0);
      return amount>=1&&(!audio.playing||id!==audio.song.id||amount>=10);
    });
    if(!entry)return;
    const [id,value]=entry,seconds=Math.min(60,Math.floor(value)-(counted.current[id]||0));
    saving.current=true;
    void write('listening',{seconds,track:id}).then(()=>{counted.current[id]=(counted.current[id]||0)+seconds;}).finally(()=>{saving.current=false;});
  }, [audio.listeningByTrack,audio.playing,audio.song.id,ready]);

  return {
    skip:(delta:number)=>{const q=audio.queue,at=q.indexOf(audio.song.id);direction(q[(Math.max(0,at)+delta+q.length)%q.length]);},
    preferences,signal,recommendations,mix,regenerateMix,playQueue,favoriteMix,
    mixLiked:likedMixes(records).some(p=>p.id===mix.id),likedMixes:likedMixes(records),
    nowPlaying,setNowPlaying,searchMusic,searching,searchResults,searchStatus,surprise,changeDirection,mode,
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
