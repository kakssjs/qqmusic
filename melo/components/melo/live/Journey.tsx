"use client";
import { ArrowUpRight } from "lucide-react";
import type { LiveMelo } from "./useLiveMelo";
export function Journey({ melo }: { melo: LiveMelo }) {
  const story = melo.records.find((e) => e.type === "story")?.payload;
  const listening = melo.records.filter((e) => e.type === "listening");
  const listened = listening.reduce(
    (sum, e) => sum + (e.payload.seconds || 0),
    0,
  );
  const moments = melo.records.filter((e) => e.type === "checkin");
  const nights = new Set(
    listening
      .filter((e) => {
        const h = new Date(e.createdAt).getHours();
        return h >= 22 || h < 6;
      })
      .map((e) => {
        const d = new Date(e.createdAt);
        if (d.getHours() < 6) d.setDate(d.getDate() - 1);
        return d.toLocaleDateString("zh-CN");
      }),
  ).size;
  const words = story?.keywords?.filter(Boolean).slice(0, 3);
  return (
    <section id="journey" className="world-section journey-section">
      <div className="world-section-meta reveal">
        <span>05 / Journey</span>
        <span>每一段旋律，都算数</span>
      </div>
      <div className="journey-heading reveal">
        <p className="world-label">My Music Journey</p>
        <h2 className="world-title">
          听过的歌，<span>也是走过的路。</span>
        </h2>
      </div>
      <div className="journey-keywords reveal">
        <span>
          {words?.length
            ? "Melo 从你的故事里，读到这些词"
            : "你的关键词，会在故事里慢慢长出来"}
        </span>
        <div className={words?.length ? "" : "keywords-empty"}>
          {(words?.length ? words : ["听见", "自己"]).map((word, i) => (
            <strong className="journey-word" key={word}>
              <small>0{i + 1}</small>
              {word}
            </strong>
          ))}
        </div>
        {!words?.length && (
          <p className="world-fineprint">
            先留下一段心情，再让 Melo 为你写下真正的关键词。
          </p>
        )}
      </div>
      <div className="journey-numbers reveal">
        <div>
          <strong>
            {listened >= 3600
              ? (listened / 3600).toFixed(1)
              : Math.floor(listened / 60)}
            <small>{listened >= 3600 ? "hours" : "minutes"}</small>
          </strong>
          <span>我们一起听过音乐的时间</span>
        </div>
        <div>
          <strong>
            {nights}
            <small>nights</small>
          </strong>
          <span>一起听歌的深夜</span>
        </div>
        <div>
          <strong>
            {moments.length}
            <small>moments</small>
          </strong>
          <span>你愿意分享的心情瞬间</span>
        </div>
      </div>
      <div className="your-music-story reveal">
        <span>Written by Melo. Inspired by you.</span>
        <p>
          {story?.story ||
            "你的故事还没有写完。留下一段心情，或和 Melo 聊聊，让那些真实的瞬间连成一段属于你的音乐故事。"}
        </p>
        <button
          className="world-button"
          disabled={
            !!melo.busy ||
            !melo.ready ||
            !melo.records.some(
              (e) => e.type === "checkin" || e.type === "message",
            )
          }
          onClick={() => void melo.story()}
        >
          {melo.busy === "story"
            ? "Melo 正在写你的故事…"
            : story
              ? "更新我的音乐故事"
              : "生成我的音乐故事"}
          <ArrowUpRight size={17} />
        </button>
        <p className="world-fineprint">只记录我们真实一起度过的时间。</p>
      </div>
    </section>
  );
}
