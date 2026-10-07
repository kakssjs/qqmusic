"use client";
import { useEffect, useRef } from "react";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import type { LiveMelo } from "./useLiveMelo";
export function AIChat({ melo }: { melo: LiveMelo }) {
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
    <section id="chat" className="world-section together-section">
      <div className="world-section-meta reveal">
        <span>02 / Meet Melo</span>
        <span>不用一直很勇敢</span>
      </div>
      <div className="together-layout">
        <div className="together-portrait reveal">
          <div className="portrait-aura" />
          <img
            src="/mascot/melo-reference-cutout.png"
            alt="Melo 戴着音乐耳机，向你伸出手"
            loading="lazy"
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
              <small>{melo.connected ? "正在这里，听你说" : "正在连接…"}</small>
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
              messages.map((e) => (
                <div key={e.id} className={"live-message " + e.payload.role}>
                  <span>{e.payload.role === "assistant" ? "Melo" : "你"}</span>
                  <div>
                    <p>{e.payload.content}</p>
                    <small>
                      {new Date(e.createdAt).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <div className="conversation-opening">
                <span className="conversation-whisper">
                  从这一句开始，也可以。
                </span>
                <div className="demo-conversation" aria-label="陪伴对话示例">
                  <div className="live-message user">
                    <span>你 · 示例</span>
                    <div>
                      <p>今天比赛失败了。</p>
                    </div>
                  </div>
                  <div className="live-message assistant">
                    <span>Melo · 示例</span>
                    <div>
                      <p>
                        那今晚就先别急着重新开始。
                        <br />
                        让我陪你听一首歌。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="conversation-starters">
                  {["今天有点累。", "想给今天找一首歌。"].map((text) => (
                    <button key={text} onClick={() => melo.setChatDraft(text)}>
                      {text}
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {melo.busy === "chat" && (
              <p className="thinking" role="status">
                <span>✳</span> Melo 正在认真听你说…
              </p>
            )}
          </div>
          <form
            className="live-chat-compose"
            onSubmit={(e) => {
              e.preventDefault();
              void melo.send();
            }}
          >
            <textarea
              aria-label="给 Melo 的消息"
              placeholder="把今天的心情，说给 Melo 听…"
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
            </button>
          </form>
          <p className="live-chat-note">
            只属于你的对话空间 <span>Shift + Enter 换行</span>
          </p>
        </div>
      </div>
    </section>
  );
}
