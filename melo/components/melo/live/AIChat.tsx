"use client";
import { QQMusicIcon } from "../QQMusicIcon";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowUp, Play, Pause, SkipForward } from "lucide-react";
import { playableTracks } from "../../../data/music/catalog";
import type { LiveMelo } from "./useLiveMelo";
import { CharacterPresence } from "../CharacterPresence";
import { VoiceChat } from "./VoiceChat";
import type { CharacterMode } from "../../../lib/character-mode";
export function AIChat({ melo }: { melo: LiveMelo }) {
  const [voiceMode, setVoiceMode] = useState<CharacterMode | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const messages = melo.records
    .filter((e) => e.type === "message")
    .slice()
    .reverse();
  useEffect(() => {
    if (viewport.current)
      viewport.current.scrollTop = viewport.current.scrollHeight;
  }, [messages.length, melo.busy]);
  return (
    <section
      id="chat"
      className="world-section together-section"
      data-flow-ready={melo.flowReady && !melo.busy}
    >
      <div className="world-section-meta reveal">
        <span>01 / Talk</span>
        <span>不用一直很勇敢</span>
      </div>
      <div className="together-layout">
        <div className="together-portrait reveal">
          <div className="portrait-aura" />
          <CharacterPresence
            melo={voiceMode ? { ...melo, mode: voiceMode } : melo}
            className="talk-character"
          />
          <div className="portrait-caption">
            <span className="world-live-dot" />
            Melo is here for you
          </div>
          <h2 className="world-title">
            今晚，
            <br />
            先陪你<span>听首歌。</span>
          </h2>
          <p>
            开心也好，失落也好。
            <br />
            你愿意说的，Melo 都想听。
          </p>
        </div>
        <div className="live-chat companion-conversation reveal">
          <div className="conversation-heading">
            <div>
              <span className="world-live-dot" />
              <strong>Melo</strong>
              {melo.connectionState === "offline" ? (
                <button
                  type="button"
                  className="connection-retry chat-connection-retry"
                  onClick={() => void melo.load()}
                  aria-label="AI 服务连接失败，点击重试"
                  aria-live="polite"
                >
                  连接失败 · 重试
                </button>
              ) : (
                <small role="status" aria-live="polite">
                  {melo.connectionState === "checking"
                    ? "正在连接…"
                    : melo.connectionState === "unconfigured"
                      ? "AI 服务尚未配置"
                      : melo.modelState === "ready"
                        ? "最近回复成功"
                        : melo.modelState === "error"
                          ? "模型调用失败"
                          : "已配置 · 待验证"}
                </small>
              )}
            </div>
            <span>Just between us</span>
          </div>
          <div
            className="live-chat-messages"
            ref={viewport}
            aria-live="polite"
            data-lenis-prevent
          >
            {messages.length ? (
              messages.map((e) => {
                const song = e.payload.role === "assistant" ? playableTracks.find(t => t.id === (e.payload.track || e.payload.trackId)) : undefined;
                const current = song?.id === melo.audio.song.id;
                return (
                <div key={e.id} className={"live-message " + e.payload.role}>
                  <span>{e.payload.role === "assistant" ? "Melo" : "你"}</span>
                  <div>
                    <div className="reply-paragraphs">
                      {e.payload.content?.split(/\n\s*\n/).map((part, i) => (
                        <p key={i} style={{ animationDelay: `${i * 160}ms` }}>
                          {part}
                        </p>
                      ))}
                    </div>
                    {song && (
                      <div className="chat-song-card" aria-label={`Melo 为你选择的歌曲：${song.title}`}>
                        <img src={song.cover} alt="" width={56} height={56} />
                        <div className="chat-song-info">
                          <strong>{song.title}</strong>
                          <span>{song.artist}</span>
                          <small>{current && melo.audio.loading ? "正在加载…" : current && melo.audio.playing ? "正在播放" : current && melo.audio.progress > 0 ? "已暂停" : "在这里听，无需离开聊天"}</small>
                        </div>
                        <button type="button" className="chat-song-play" aria-label={`${current && melo.audio.playing ? "暂停" : "播放"} ${song.title}`} disabled={current && melo.audio.loading}
                          onClick={() => current && melo.audio.playing ? melo.pauseChatMusic() : void melo.playChatTrack(song.id)}>
                          {current && melo.audio.playing ? <Pause size={17} /> : <Play size={17} />}
                          <span>{current && melo.audio.playing ? "暂停" : "播放"}</span>
                        </button>
                        <button type="button" className="chat-song-next" aria-label={`换掉 ${song.title}，让 Melo 重新选歌`} disabled={!!melo.busy || !melo.ready}
                          onClick={() => void melo.send("换一首")}><SkipForward size={16} /><span>换一首</span></button>
                      </div>
                    )}
                    <small>
                      {new Date(e.createdAt).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                </div>
              );})
            ) : (
              <div className="conversation-opening">
                <h3>Melo 想先了解一下现在的你。</h3>
                <div className="onboarding-choices">
                  {[
                    ["😌", "想放松一下", "我想放松一下，慢慢从紧绷中退出。"],
                    ["🥱", "今天有点累", "今天有点累，想让节奏慢下来。"],
                    ["✨", "心情很好", "今天心情很好，想听一点轻盈的旋律。"],
                    [
                      "🌙",
                      "只是想找首适合现在的歌",
                      "想给现在找一首歌，你先陪我聊聊吧。",
                    ],
                  ].map(([icon, label, text]) => (
                    <button
                      key={label}
                      aria-label={label}
                      disabled={!melo.ready || !!melo.busy}
                      onClick={() => void melo.send(text)}
                    >
                      <span aria-hidden="true">{icon}</span>
                      {label}
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                </div>
                <p className="world-fineprint">或者，直接告诉 Melo。</p>
              </div>
            )}
            {(melo.busy === "chat" || melo.busy === "emotion") && (
              <p className="thinking" role="status">
                <span>{<QQMusicIcon />}</span>{" "}
                {melo.busy === "chat"
                  ? "我在听。你不用急着整理好所有话。"
                  : "我在把这段心情，和适合你的旋律连起来。"}
              </p>
            )}
          </div>
          {messages.length > 0 && (
            <div className="chat-next-steps">
              <span>听完这段音乐，你希望更接近…</span>
              <button
                disabled={!!melo.busy}
                onClick={() => {
                  melo.startJourney("quiet");
                  document.getElementById("mood-journey")?.scrollIntoView({
                    behavior: melo.reduced ? "auto" : "smooth",
                  });
                }}
              >
                安静下来
              </button>
              <button
                disabled={!!melo.busy}
                onClick={() => {
                  melo.startJourney("energy");
                  document.getElementById("mood-journey")?.scrollIntoView({
                    behavior: melo.reduced ? "auto" : "smooth",
                  });
                }}
              >
                找回一点能量
              </button>
            </div>
          )}
          {melo.chatPlaybackStatus && <p className="chat-playback-status" role="status">{melo.chatPlaybackStatus}</p>}
          <VoiceChat melo={melo} onMode={setVoiceMode} />
          <label className="chat-text-label" htmlFor="melo-chat-input">
            文字聊聊 <span>· 在下方输入</span>
          </label>
          <form
            className="live-chat-compose"
            onSubmit={(e) => {
              e.preventDefault();
              void melo.send();
            }}
          >
            <textarea
              id="melo-chat-input"
              aria-label="给 Melo 的消息"
              placeholder="说说心情，或输入「播放稻香」「放首适合现在的歌」…"
              maxLength={1500}
              value={melo.chatDraft}
              onChange={(e) => melo.setChatDraft(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  void melo.send();
                }
              }}
            />
            <button
              aria-label="发送给 Melo"
              disabled={!!melo.busy || !melo.ready || !melo.chatDraft.trim()}
            >
              <ArrowUp size={21} />
              <span>发送</span>
            </button>
          </form>
          <p className="live-chat-note">
            {melo.demo
              ? "演示回复为预设脚本，记录独立保存在本机。"
              : melo.connectionState === "unconfigured"
                ? "AI 服务尚未配置；你仍可体验情绪选择与音乐。"
                : melo.connectionState === "offline"
                  ? "AI 服务暂时连接不上；可点击上方重试，或继续听音乐。"
                  : melo.modelState === "ready"
                    ? melo.storageMode === "cloud"
                      ? "最近一次成功回复已保存在云端。"
                      : "最近一次回复保留在本机，云端恢复后可以同步。"
                    : melo.modelState === "error"
                      ? "服务已配置，但最近一次模型调用失败；请查看提示信息。"
                      : "服务端已配置；首次成功回复后会显示模型状态。"}
            {melo.connected && <span>Shift + Enter 换行</span>}
          </p>
        </div>
      </div>
    </section>
  );
}
