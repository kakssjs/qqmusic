"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { pagesRequest } from "../../../pages/local-api";
import type { LiveMelo } from "./useLiveMelo";
import type { CharacterMode } from "../../../lib/character-mode";
type Phase =
  "idle" | "connecting" | "listening" | "thinking" | "speaking" | "ending";
export function VoiceChat({
  melo,
  onMode,
}: {
  melo: LiveMelo;
  onMode: (mode: CharacterMode | null) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle"),
    [error, setError] = useState(""),
    [muted, setMuted] = useState(false),
    [user, setUser] = useState(""),
    [answer, setAnswer] = useState("");
  const resources = useRef<{
    ws?: WebSocket;
    stream?: MediaStream;
    capture?: AudioContext;
    playback?: AudioContext;
    node?: AudioWorkletNode;
    input?: MediaStreamAudioSourceNode;
    gain?: GainNode;
    nodes: Set<AudioBufferSourceNode>;
    next: number;
  }>({ nodes: new Set(), next: 0 });
  const pendingEnd = useRef<{
    ws: WebSocket;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const setupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0),
    active = useRef(false),
    current = useRef(melo),
    callback = useRef(onMode),
    playbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    current.current = melo;
    callback.current = onMode;
  }, [melo, onMode]);
  function state(p: Phase) {
    setPhase(p);
    callback.current(
      p === "idle"
        ? null
        : p === "connecting" || p === "ending"
          ? "thinking"
          : p,
    );
  }
  const stopOutput = useCallback(() => {
    if (playbackTimer.current) clearTimeout(playbackTimer.current);
    const r = resources.current;
    for (const node of r.nodes) {
      try {
        node.stop();
      } catch {}
    }
    r.nodes.clear();
    r.next = 0;
  }, []);
  const cleanup = useCallback(
    (keepSocket = false) => {
      if (pendingEnd.current) {
        clearTimeout(pendingEnd.current.timer);
        pendingEnd.current.ws.close();
        pendingEnd.current = null;
      }
      if (setupTimer.current) clearTimeout(setupTimer.current);
      generation.current++;
      active.current = false;
      stopOutput();
      const r = resources.current;
      r.stream?.getTracks().forEach((t) => t.stop());
      r.node?.disconnect();
      r.input?.disconnect();
      r.gain?.disconnect();
      if (!keepSocket) {
        if (r.ws?.readyState === WebSocket.OPEN)
          r.ws.send(JSON.stringify({ type: "end" }));
        r.ws?.close();
      }
      for (const c of [r.capture, r.playback])
        if (c && c.state !== "closed") void c.close().catch(() => {});
      resources.current = { nodes: new Set(), next: 0 };
    },
    [stopOutput],
  );
  function end(refresh = true) {
    const ws = resources.current.ws;
    if (refresh && ws?.readyState === WebSocket.OPEN) {
      cleanup(true);
      const endId = generation.current;
      state("ending");
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        ws.close();
        if (pendingEnd.current?.ws === ws) pendingEnd.current = null;
        if (generation.current !== endId) return;
        state("idle");
        void current.current.load();
      };
      const timeout = setTimeout(() => {
        if (generation.current === endId)
          setError("语音已结束，记录同步稍慢，可刷新后查看。");
        finish();
      }, 3000);
      pendingEnd.current = { ws, timer: timeout };
      ws.addEventListener("message", (e) => {
        if (typeof e.data === "string") {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === "saved") finish();
            else if (msg.type === "error") {
              if (generation.current === endId) setError(msg.message);
              finish();
            }
          } catch {}
        }
      });
      ws.send(JSON.stringify({ type: "end" }));
    } else {
      cleanup();
      state("idle");
      if (refresh) void current.current.load();
    }
    setMuted(false);
  }
  useEffect(
    () => () => {
      cleanup();
      callback.current(null);
    },
    [cleanup],
  );
  async function start() {
    if (active.current) return;
    active.current = true;
    const id = ++generation.current;
    setError("");
    setUser("");
    setAnswer("");
    state("connecting");
    setupTimer.current = setTimeout(() => {
      if (id === generation.current) {
        setError("语音连接超时，请重新开始。");
        end(false);
      }
    }, 30000);
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode)
        throw new Error(
          "当前浏览器不支持实时语音，请使用新版 Chrome 或 Edge。",
        );
      if (current.current.audio.playing) current.current.audio.toggle();
      const playback = new AudioContext({ sampleRate: 24000 });
      resources.current.playback = playback;
      await playback.resume();
      if (id !== generation.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (id !== generation.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      resources.current.stream = stream;
      const response = await pagesRequest("/api/voice-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const config = (await response.json()) as {
        error?: string;
        url?: string;
        ticket?: string;
      };
      if (!response.ok) throw new Error(config.error || "语音连接暂时不可用。");
      if (id !== generation.current) return;
      if (
        typeof config.url !== "string" ||
        typeof config.ticket !== "string" ||
        !/^[a-f0-9]{64}$/.test(config.ticket)
      )
        throw new Error("语音连接配置无效。");
      const url = new URL(config.url);
      if (
        url.protocol !== "wss:" &&
        !(
          url.protocol === "ws:" &&
          ["127.0.0.1", "localhost"].includes(url.hostname) &&
          ["127.0.0.1", "localhost"].includes(location.hostname)
        )
      )
        throw new Error("语音连接需要安全的地址。");
      url.searchParams.set("ticket", config.ticket);
      const capture = new AudioContext();
      resources.current.capture = capture;
      await capture.audioWorklet.addModule("/qqmusic/voice-capture.js");
      await capture.resume();
      if (id !== generation.current) return;
      const ws = new WebSocket(url),
        r = resources.current;
      r.ws = ws;
      ws.binaryType = "arraybuffer";
      const input = capture.createMediaStreamSource(stream),
        node = new AudioWorkletNode(capture, "melo-voice-capture"),
        gain = capture.createGain();
      gain.gain.value = 0;
      r.node = node;
      r.input = input;
      r.gain = gain;
      node.port.onmessage = (e) => {
        if (
          active.current &&
          ws.readyState === WebSocket.OPEN &&
          stream.getAudioTracks()[0]?.enabled
        ) {
          if (ws.bufferedAmount > 64000) {
            setError("网络较慢，请重新连接。");
            end();
            return;
          }
          ws.send(e.data);
        }
      };
      ws.onmessage = (e) => {
        if (id !== generation.current) return;
        if (e.data instanceof ArrayBuffer) {
          const view = new DataView(e.data);
          if (view.byteLength % 2) return;
          const buffer = playback.createBuffer(1, view.byteLength / 2, 24000),
            data = buffer.getChannelData(0);
          for (let i = 0; i < data.length; i++)
            data[i] = view.getInt16(i * 2, true) / 32768;
          const source = playback.createBufferSource();
          source.buffer = buffer;
          source.connect(playback.destination);
          const when = Math.max(playback.currentTime + 0.02, r.next);
          r.next = when + buffer.duration;
          r.nodes.add(source);
          source.onended = () => r.nodes.delete(source);
          source.start(when);
          state("speaking");
          return;
        }
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "ready") {
            if (setupTimer.current) clearTimeout(setupTimer.current);
            input.connect(node);
            node.connect(gain);
            gain.connect(capture.destination);
            state("listening");
          } else if (msg.type === "interrupt") {
            stopOutput();
            setAnswer("");
            state("listening");
          } else if (msg.type === "transcript") {
            if (msg.role === "user") {
              setUser(msg.text);
              if (msg.final) state("thinking");
            } else {
              setAnswer(msg.text);
              state("speaking");
            }
          } else if (msg.type === "turn-end") {
            if (playbackTimer.current) clearTimeout(playbackTimer.current);
            playbackTimer.current = setTimeout(
              () => {
                if (id === generation.current) state("listening");
              },
              Math.max(0, (r.next - playback.currentTime) * 1000),
            );
          } else if (msg.type === "error" || msg.type === "ended") {
            setError(msg.message);
            end();
          }
        } catch {
          setError("语音数据异常，请重新开始。");
          end();
        }
      };
      ws.onerror = () => {
        if (id === generation.current) {
          setError("实时语音连接失败，请检查网络或服务配置。");
          end();
        }
      };
      ws.onclose = () => {
        if (id === generation.current) end();
      };
    } catch (e) {
      if (id !== generation.current) return;
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "麦克风没有获准使用，你仍然可以文字聊天。"
          : e instanceof Error
            ? e.message
            : "语音暂时不可用。",
      );
      end(false);
    }
  }
  const labels = {
    ending: "正在保存语音记录…",
    idle: "语音聊聊",
    connecting: "正在连接…",
    listening: "我在听，慢慢说。",
    thinking: "让我想一想…",
    speaking: "Melo 正在回应",
  };
  return (
    <div className="voice-chat" data-phase={phase}>
      {phase === "idle" ? (
        <>
          <button
            type="button"
            className="voice-entry"
            disabled={melo.demo || !!melo.busy}
            onClick={() => void start()}
          >
            <Mic size={18} />
            语音聊聊 ↗
          </button>
          <small>
            {melo.demo
              ? "演示模式不启用麦克风，请退出演示后使用。"
              : "点击后开启麦克风，与 Melo 实时交流。"}
          </small>
        </>
      ) : (
        <div className="voice-session">
          <div className="voice-state" role="status">
            <i />
            {labels[phase]}
          </div>
          <div className="voice-captions" aria-live="polite">
            {user && (
              <p>
                <small>你</small>
                {user}
              </p>
            )}
            {answer && (
              <p>
                <small>Melo</small>
                {answer}
              </p>
            )}
          </div>
          <div className="voice-actions">
            <button
              type="button"
              disabled={phase === "connecting" || phase === "ending"}
              aria-pressed={muted}
              onClick={() => {
                const next = !muted;
                setMuted(next);
                resources.current.stream
                  ?.getAudioTracks()
                  .forEach((t) => (t.enabled = !next));
              }}
            >
              {muted ? <MicOff size={18} /> : <Mic size={18} />}{" "}
              {muted ? "恢复麦克风" : "静音"}
            </button>
            <button
              type="button"
              disabled={phase === "ending"}
              onClick={() => end()}
            >
              <PhoneOff size={18} />
              结束语音
            </button>
          </div>
          <small>
            语音由豆包提供；结束后释放麦克风，文字记录保存在你的 Melo 会话。
          </small>
        </div>
      )}
      {error && (
        <p role="alert" className="voice-error">
          {error}
        </p>
      )}
    </div>
  );
}
