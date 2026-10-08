"use client";
import { PaintedExpression } from "../PaintedExpression";
import { useState } from "react";
import { Trash2, Play, ArrowUpRight } from "lucide-react";
import { moods, type LiveMelo } from "./useLiveMelo";
import { findTrack } from "../../../data/music/catalog";
import { recordTrack } from "../../../lib/music/recommendation";
import { MemoryCard } from "../../music/MemoryCard";
import { isFavorite, uniqueMoments } from "../../../data/experience";
export function MemorySpace({ melo }: { melo: LiveMelo }) {
  const [confirm, setConfirm] = useState(false);
  const items = uniqueMoments(melo.records)
    .filter(
      (e) =>
        e.type === "checkin" ||
        (e.type === "message" &&
          e.payload.role === "user" &&
          !melo.records.some(
            (r) => r.type === "checkin" && r.payload.text === e.payload.content,
          )),
    )
    .slice(0, 12)
    .reverse();
  return (
    <section id="memory" className="world-section remember-section">
      <div className="world-section-meta reveal">
        <span>07 / Memory</span>
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
            items.map((e, i) => {
              const memoryText = e.payload.text || e.payload.content;
              return (
                <article
                  key={e.id}
                  className="memory-node reveal"
                  style={{ animationDelay: `${Math.min(i, 5) * 80}ms` }}
                >
                  <time dateTime={e.createdAt}>
                    {new Date(
                      e.payload.momentAt || e.createdAt,
                    ).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </time>
                  <span className="memory-dot" aria-hidden="true">
                    <PaintedExpression
                      expression="love"
                      thumbnail
                      reduced={melo.reduced}
                    />
                  </span>
                  <div>
                    <span className="memory-node-label">
                      {moods.find((m) => m[0] === e.payload.mood)?.[1] ||
                        "你说过"}
                    </span>
                    <h3>
                      {memoryText
                        ? `“${memoryText}”`
                        : e.payload.journey?.outcome === "not-yet"
                          ? "这一段音乐旅程，还差一点。"
                          : "一段音乐陪伴瞬间。"}
                    </h3>
                    <p className="memory-track">
                      陪伴歌曲：《{findTrack(recordTrack(e))?.title || "晚风"}》
                    </p>
                    {e.payload.journey && (
                      <div className="memory-journey-note">
                        <span>
                          {moods.find(
                            ([id]) => id === e.payload.journey?.from,
                          )?.[1] || "此刻"}{" "}
                          → {e.payload.journey.targetLabel}
                        </span>
                        <small>
                          {e.payload.journey.steps.length} 首真实播放路径 ·{" "}
                          {e.payload.journey.outcome === "better"
                            ? "你确认“好多了”"
                            : e.payload.journey.outcome === "not-yet"
                              ? "你选择“差一点”"
                              : "旅程记录"}
                        </small>
                        <button
                          onClick={() => {
                            melo.replay(e);
                            document
                              .getElementById("mood-journey")
                              ?.scrollIntoView({
                                behavior: melo.reduced ? "auto" : "smooth",
                              });
                          }}
                        >
                          <Play size={12} /> 重听这条音乐旅程
                        </button>
                      </div>
                    )}
                    <details>
                      <summary>查看这个瞬间</summary>
                      <div className="memory-details">
                        <dl>
                          <dt>当时说过的话</dt>
                          <dd>
                            {memoryText ||
                              (e.payload.journey?.outcome === "not-yet"
                                ? "这一段音乐旅程，还没有让我更接近目标。"
                                : "这条记录来自一次真实的音乐陪伴。")}
                          </dd>
                          <dt>Melo 当时的回应</dt>
                          <dd>
                            {e.payload.reply ||
                              "这一刻，你选择用音乐陪自己一会。"}
                          </dd>
                          <dt>当时情绪</dt>
                          <dd>
                            {moods.find((m) => m[0] === e.payload.mood)?.[1] ||
                              "尚未分析"}{" "}
                            · {e.payload.secondary || "你愿意分享的瞬间"}
                          </dd>
                          <dt>那一天的歌</dt>
                          <dd>{findTrack(recordTrack(e))?.title || "晚风"}</dd>
                          <dt>当时收藏状态</dt>
                          <dd>{e.payload.liked ? "已收藏" : "未收藏"}</dd>
                          <dt>现在收藏状态</dt>
                          <dd>
                            {isFavorite(
                              melo.records,
                              e.payload.track || e.payload.mood || "calm",
                            )
                              ? "现在仍在收藏中"
                              : "现在没有收藏"}
                          </dd>
                        </dl>
                        <small>
                          {e.payload.pending
                            ? "本机暂存 · 等待同步"
                            : "已经留下"}{" "}
                          ·{" "}
                          {e.payload.source === "demo"
                            ? "预设演示记录"
                            : "你的真实记录"}
                        </small>
                      </div>
                    </details>
                    <MemoryCard event={e} />
                    <button
                      className="world-text-button"
                      onClick={() => {
                        melo.replay(e);
                        document
                          .getElementById(
                            e.payload.journey ? "mood-journey" : "music",
                          )
                          ?.scrollIntoView({
                            behavior: melo.reduced ? "auto" : "smooth",
                          });
                      }}
                    >
                      <Play size={12} />
                      {e.payload.journey
                        ? "重新播放这条旅程"
                        : "再听一次这段心情"}
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="memory-empty reveal">
              <span className="memory-dot" />
              <small>Now / 第一段回忆</small>
              <h3>第一颗记忆还没有亮起。</h3>
              <a href="#chat" className="world-text-button">
                和 Melo 留下第一个瞬间 <ArrowUpRight size={16} />
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
        {melo.records.some((e) => e.payload.pending) && (
          <button onClick={() => void melo.syncPending()}>
            重试同步本机记录
          </button>
        )}
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
