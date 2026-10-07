"use client";
import { useState } from "react";
import { Trash2, Play, ArrowUpRight } from "lucide-react";
import { moods, type LiveMelo } from "./useLiveMelo";
export function MemorySpace({ melo }: { melo: LiveMelo }) {
  const [confirm, setConfirm] = useState(false);
  const items = melo.records
    .filter(
      (e) =>
        e.type === "checkin" ||
        (e.type === "message" && e.payload.role === "user"),
    )
    .slice(0, 12)
    .reverse();
  return (
    <section id="memory" className="world-section remember-section">
      <div className="world-section-meta reveal">
        <span>04 / Memory</span>
        <span>被记住，本身就是一种陪伴</span>
      </div>
      <div className="memory-layout">
        <div className="memory-intro reveal">
          <p className="world-label">Melo Memory</p>
          <h2 className="world-title">
            你说过的话，
            <br />
            Melo<span>还记得。</span>
          </h2>
          <p className="world-description">
            那些不经意说出口的小事，
            <br />
            都可以成为下一次陪伴的起点。
          </p>
          <div className="memory-sound-lines" aria-hidden="true">
            {Array.from({ length: 19 }, (_, i) => (
              <i
                key={i}
                style={{ height: 10 + Math.sin(i * 0.6) ** 2 * 28 + "px" }}
              />
            ))}
          </div>
          <small className="world-fineprint">
            记忆来自你真实留下的对话与心情。
          </small>
        </div>
        <div className="memory-timeline space-memories">
          {items.length ? (
            items.map((e, i) => (
              <article
                key={e.id}
                className="memory-node reveal"
                style={{ animationDelay: `${Math.min(i, 5) * 80}ms` }}
              >
                <time dateTime={e.createdAt}>
                  {new Date(e.createdAt).toLocaleDateString("zh-CN", {
                    month: "short",
                    day: "2-digit",
                  })}
                </time>
                <span className="memory-dot" aria-hidden="true" />
                <div>
                  <span className="memory-node-label">
                    {moods.find((m) => m[0] === e.payload.mood)?.[1] ||
                      "你说过"}
                  </span>
                  <h3>“{e.payload.text || e.payload.content}”</h3>
                  <button
                    className="world-text-button"
                    onClick={() => {
                      melo.chooseMood(e.payload.mood || "calm");
                      document
                        .querySelector<HTMLAnchorElement>(".music-revisit-link")
                        ?.click();
                    }}
                  >
                    <Play size={12} />
                    再听一次这个瞬间
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="memory-empty reveal">
              <span className="memory-dot" />
              <small>Now / 第一段回忆</small>
              <h3>
                从你愿意分享的
                <br />
                这一刻开始。
              </h3>
              <a href="#emotion" className="world-text-button">
                留下第一段心情 <ArrowUpRight size={16} />
              </a>
            </div>
          )}
          {items.length > 0 && (
            <div className="memory-now reveal">
              <span className="memory-dot" />
              <small>Now / Melo</small>
              <p>
                不急着给故事一个结尾。
                <br />
                下一段，我们一起听。
              </p>
            </div>
          )}
        </div>
      </div>
      <a
        href="#music"
        className="music-revisit-link sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        回到音乐
      </a>
      <div className="memory-ownership">
        <p>这些记忆，始终属于你。</p>
        {confirm ? (
          <div role="group" aria-label="确认清空记录">
            <span>全部心情、对话、收藏与聆听记录将被删除，无法恢复。</span>
            <button
              disabled={!!melo.busy}
              onClick={() => void melo.clear().then(() => setConfirm(false))}
            >
              确认清空
            </button>
            <button onClick={() => setConfirm(false)}>取消</button>
          </div>
        ) : (
          <button
            disabled={!melo.records.length || !!melo.busy}
            onClick={() => setConfirm(true)}
          >
            <Trash2 size={13} />
            清空我的记录
          </button>
        )}
      </div>
    </section>
  );
}
