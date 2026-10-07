"use client";
import {
  ArrowUpRight,
  CalendarDays,
  Headphones,
  Heart,
  MessageCircle,
  Moon,
  Sparkles,
} from "lucide-react";
import { moods, type LiveMelo, type MeloRecord } from "./useLiveMelo";

function momentDetails(record: MeloRecord) {
  if (record.type === "checkin") {
    const mood = moods.find(([id]) => id === record.payload.mood)?.[1];
    return {
      label: "心情留痕",
      title: mood ? `把${mood}留在此刻` : "留下一段心情",
      icon: <Heart size={15} aria-hidden="true" />,
    };
  }
  if (record.type === "listening") {
    return {
      label: "一起听歌",
      title: record.payload.track
        ? `听见《${record.payload.track}》`
        : "听见一段旋律",
      icon: <Headphones size={15} aria-hidden="true" />,
    };
  }
  if (record.type === "favorite") {
    return {
      label: "收藏旋律",
      title: record.payload.track
        ? `收藏了《${record.payload.track}》`
        : "收藏了一段旋律",
      icon: <Heart size={15} aria-hidden="true" />,
    };
  }
  if (record.type === "story") {
    return {
      label: "故事更新",
      title: "音乐故事又写下新的一页",
      icon: <Sparkles size={15} aria-hidden="true" />,
    };
  }
  return {
    label: "聊了一会儿",
    title: "和 Melo 分享了一段心情",
    icon: <MessageCircle size={15} aria-hidden="true" />,
  };
}

function formatMomentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "最近";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const day = sameDay(date, today)
    ? "今天"
    : sameDay(date, yesterday)
      ? "昨天"
      : date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
  return `${day} · ${date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}

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
  const recentMoments = melo.records
    .filter(
      (record) =>
        record.type === "checkin" ||
        record.type === "listening" ||
        record.type === "favorite" ||
        record.type === "story" ||
        (record.type === "message" && record.payload.role === "user"),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .filter((record, index, records) => {
      if (record.type !== "listening") return true;
      const date = new Date(record.createdAt);
      const day = Number.isNaN(date.getTime())
        ? record.createdAt
        : date.toLocaleDateString("zh-CN");
      return (
        records.findIndex((candidate) => {
          if (candidate.type !== "listening") return false;
          const candidateDate = new Date(candidate.createdAt);
          const candidateDay = Number.isNaN(candidateDate.getTime())
            ? candidate.createdAt
            : candidateDate.toLocaleDateString("zh-CN");
          return (
            candidate.payload.track === record.payload.track &&
            candidateDay === day
          );
        }) === index
      );
    })
    .slice(0, 4);

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

      <div className="journey-board reveal">
        <div className="journey-keywords">
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
          <span className="journey-keyword-orbit" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>

        <aside className="journey-route" aria-label="最近的音乐足迹">
          <div className="journey-route-heading">
            <div>
              <span>RECENT MOMENTS</span>
              <h3>最近的足迹</h3>
            </div>
            <span className="journey-route-count">
              <CalendarDays size={14} aria-hidden="true" />
              {recentMoments.length
                ? `最近 ${recentMoments.length} 个`
                : "刚刚开始"}
            </span>
          </div>
          {recentMoments.length ? (
            <ol className="journey-timeline">
              {recentMoments.map((record) => {
                const detail = momentDetails(record);
                return (
                  <li key={record.id}>
                    <span className="journey-timeline-icon">{detail.icon}</span>
                    <div className="journey-timeline-copy">
                      <span>{detail.label}</span>
                      <strong>{detail.title}</strong>
                    </div>
                    <time dateTime={record.createdAt}>
                      {formatMomentDate(record.createdAt)}
                    </time>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="journey-route-empty">
              <span className="journey-empty-wave" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
              <p>下一段旅程，等你按下播放键。</p>
              <span>听一首歌，或留下一刻心情，足迹就会出现在这里。</span>
            </div>
          )}
          <div className="journey-route-foot">
            <span />
            只展示你真实留下的记录
          </div>
        </aside>
      </div>

      <div className="journey-numbers reveal">
        <div className="journey-stat">
          <span className="journey-stat-icon">
            <Headphones size={17} aria-hidden="true" />
          </span>
          <span className="journey-stat-label">LISTENING TIME</span>
          <strong>
            {listened >= 3600
              ? (listened / 3600).toFixed(1)
              : Math.floor(listened / 60)}
            <small>{listened >= 3600 ? "hours" : "minutes"}</small>
          </strong>
          <span className="journey-stat-caption">我们一起听过音乐的时间</span>
        </div>
        <div className="journey-stat">
          <span className="journey-stat-icon">
            <Moon size={17} aria-hidden="true" />
          </span>
          <span className="journey-stat-label">AFTER DARK</span>
          <strong>
            {nights}
            <small>nights</small>
          </strong>
          <span className="journey-stat-caption">一起听歌的深夜</span>
        </div>
        <div className="journey-stat">
          <span className="journey-stat-icon">
            <Heart size={17} aria-hidden="true" />
          </span>
          <span className="journey-stat-label">LITTLE MOMENTS</span>
          <strong>
            {moments.length}
            <small>moments</small>
          </strong>
          <span className="journey-stat-caption">你愿意分享的心情瞬间</span>
        </div>
      </div>

      <div className="your-music-story reveal">
        <div className="journey-story-copy">
          <span className="journey-story-kicker">
            <Sparkles size={14} aria-hidden="true" />
            Written by Melo · Inspired by you
          </span>
          <h3>
            {story?.story
              ? "一段由真实瞬间写下的故事"
              : "把一路听来的，写成你的故事"}
          </h3>
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
        <div className="journey-story-art" aria-hidden="true">
          <span className="journey-story-disc">
            <i />
            <i />
            <i />
          </span>
          <span className="journey-story-spark journey-story-spark-one" />
          <span className="journey-story-spark journey-story-spark-two" />
          <span className="journey-story-note">
            SIDE A<br />
            YOUR STORY
          </span>
        </div>
      </div>
    </section>
  );
}
