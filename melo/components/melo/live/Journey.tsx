"use client";
import { useState } from "react";
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
import { tracks } from "../useMeloAudio";
import { PersonalityPanel } from "./CompanionExtras";
import { uniqueMoments } from "../../../data/experience";

type JourneyFilter = "all" | "listening" | "checkin" | "conversation" | "story";

const journeyFilters: { id: JourneyFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "listening", label: "聆听" },
  { id: "checkin", label: "心情" },
  { id: "conversation", label: "对话" },
  { id: "story", label: "故事" },
];

function trackTitle(id?: string) {
  if (!id) return "";
  return tracks.find((track) => track.id === id)?.name || id;
}

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
        ? `听见《${trackTitle(record.payload.track)}》`
        : "听见一段旋律",
      icon: <Headphones size={15} aria-hidden="true" />,
    };
  }
  if (record.type === "favorite") {
    return {
      label: record.payload.liked === false ? "取消收藏" : "收藏旋律",
      title: record.payload.track
        ? `${record.payload.liked === false ? "取消收藏" : "收藏了"}《${trackTitle(record.payload.track)}》`
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
  const [activeFilter, setActiveFilter] = useState<JourneyFilter>("all");
  const story = melo.records.find((e) => e.type === "story")?.payload;
  const listening = melo.records.filter((e) => e.type === "listening");
  const listened = listening.reduce(
    (sum, e) => sum + (e.payload.seconds || 0),
    0,
  );
  const moments = uniqueMoments(melo.records).filter(
    (e) => e.type === "checkin",
  );
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
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" })
    .format(now)
    .toUpperCase();
  const allMonthMoments = moments
    .filter((event) => {
      const date = new Date(event.payload.momentAt || event.createdAt);
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    })
    .sort(
      (a, b) =>
        new Date(b.payload.momentAt || b.createdAt).getTime() -
        new Date(a.payload.momentAt || a.createdAt).getTime(),
    );
  const monthMomentCount = allMonthMoments.length;
  const monthMoments = allMonthMoments.slice(0, 3);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthListeningSeconds = listening
    .filter((event) => new Date(event.createdAt) >= monthStart)
    .reduce((sum, event) => sum + (event.payload.seconds || 0), 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 1);
  const weekMap = new Map<string, number>();
  const weekTracks = new Set<string>();
  for (const event of listening) {
    const date = new Date(event.createdAt);
    if (Number.isNaN(date.getTime()) || date < weekStart || date >= weekEnd)
      continue;
    const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    weekMap.set(
      dayKey,
      (weekMap.get(dayKey) || 0) + Math.max(0, event.payload.seconds || 0),
    );
    if (event.payload.track) weekTracks.add(event.payload.track);
  }
  const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const seconds = weekMap.get(key) || 0;
    return { date, label: weekdayLabels[date.getDay()], seconds };
  });
  const weekSeconds = week.reduce((sum, day) => sum + day.seconds, 0);
  const weekActiveDays = week.filter((day) => day.seconds > 0).length;
  const maxDaySeconds = Math.max(0, ...week.map((day) => day.seconds));
  const weekDuration =
    weekSeconds >= 3600
      ? { value: (weekSeconds / 3600).toFixed(1), unit: "hours" }
      : { value: Math.floor(weekSeconds / 60), unit: "minutes" };
  const allMoments = uniqueMoments(melo.records)
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
    });
  const filterMatches = (record: MeloRecord, filter: JourneyFilter) => {
    if (filter === "all") return true;
    if (filter === "listening")
      return record.type === "listening" || record.type === "favorite";
    if (filter === "checkin") return record.type === "checkin";
    if (filter === "conversation") return record.type === "message";
    return record.type === "story";
  };
  const filteredMoments = allMoments
    .filter((record) => filterMatches(record, activeFilter))
    .slice(0, 5);
  const filterCounts = (filter: JourneyFilter) =>
    filter === "all"
      ? allMoments.length
      : allMoments.filter((record) => filterMatches(record, filter)).length;

  return (
    <section id="journey" className="world-section journey-section">
      <div className="world-section-meta reveal">
        <span>08 / JOURNEY</span>
        <span>每一段旋律，都算数</span>
      </div>
      <header className="monthly-journal-intro reveal">
        <div>
          <p className="world-label">
            MONTHLY MUSIC JOURNAL · YOUR {monthName}
          </p>
          <h2>
            <span>{String(now.getMonth() + 1).padStart(2, "0")}</span>
            {monthName}
          </h2>
          <p className="monthly-journal-line">
            {monthMomentCount
              ? `这个月，你留下了 ${monthMomentCount} 段心情记忆。${monthListeningSeconds ? `音乐陪你停留了 ${Math.floor(monthListeningSeconds / 60)} 分钟。` : "每一段愿意分享的心情，都有自己的位置。"}`
              : "这个月的音乐故事，正在等你留下一刻真实的心情。"}
          </p>
          <small>
            只呈现你真实留下的记录 · {Math.floor(monthListeningSeconds / 60)}{" "}
            MINUTES OF SOUND
          </small>
        </div>
        <span className="monthly-journal-orbit" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </header>
      <div className="monthly-moments reveal">
        <div className="monthly-moments-heading">
          <span>THREE MOMENTS</span>
          <small>这个月被留下来的音乐瞬间</small>
        </div>
        {monthMomentCount ? (
          <ol>
            {monthMoments.map((event, i) => {
              const date = new Date(event.payload.momentAt || event.createdAt);
              return (
                <li key={event.id}>
                  <span>0{i + 1}</span>
                  <time dateTime={event.createdAt}>
                    {date.toLocaleDateString("zh-CN", {
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </time>
                  <p>
                    “
                    {event.payload.text ||
                      event.payload.content ||
                      "一段留给自己的音乐时刻"}
                    ”
                  </p>
                  <small>
                    {event.payload.journey
                      ? `${event.payload.journey.from} → ${event.payload.journey.targetLabel}`
                      : moods.find(([id]) => id === event.payload.mood)?.[1] ||
                        "一个真实瞬间"}
                  </small>
                  <a href="#memory">回到这段记忆 ↗</a>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="monthly-moments-empty">
            和 Melo 聊聊，或完成一条音乐旅程，这里会留下真实发生的片段。
          </p>
        )}
      </div>
      <PersonalityPanel melo={melo} />
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
              {allMoments.length ? `${allMoments.length} 条足迹` : "刚刚开始"}
            </span>
          </div>
          <div
            className="journey-filters"
            role="group"
            aria-label="筛选音乐足迹"
          >
            {journeyFilters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter.id}
                className={activeFilter === filter.id ? "is-active" : ""}
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                type="button"
              >
                {filter.label}
                <small>{filterCounts(filter.id)}</small>
              </button>
            ))}
          </div>
          {filteredMoments.length ? (
            <ol className="journey-timeline">
              {filteredMoments.map((record) => {
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
              <p>
                {allMoments.length
                  ? "这一类足迹还没有出现。"
                  : "下一段旅程，等你按下播放键。"}
              </p>
              <span>
                {allMoments.length
                  ? "切换分类，继续看看其他音乐记忆。"
                  : "听一首歌，或留下一刻心情，足迹就会出现在这里。"}
              </span>
            </div>
          )}
          <div className="journey-route-foot">
            <span />
            只展示你真实留下的记录
          </div>
        </aside>
      </div>

      <div className="journey-rhythm reveal">
        <div className="journey-rhythm-header">
          <div>
            <span>YOUR WEEK IN SOUND</span>
            <h3>这一周的聆听节奏</h3>
          </div>
          <span className="journey-rhythm-period">
            LAST 7 DAYS <i />
            真实记录
          </span>
        </div>
        <div className="journey-rhythm-content">
          <div
            aria-label={`过去七天聆听时长：${week.map((day) => `${day.label} ${Math.floor(day.seconds / 60)} 分钟`).join("，")}`}
            className={`journey-rhythm-chart ${weekSeconds ? "has-data" : "is-empty"}`}
            role="img"
          >
            <div className="journey-rhythm-guides" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="journey-rhythm-bars">
              {week.map((day) => {
                const minutes = Math.floor(day.seconds / 60);
                const height = maxDaySeconds
                  ? Math.max(9, Math.round((day.seconds / maxDaySeconds) * 100))
                  : 5;
                const isoDate = [
                  day.date.getFullYear(),
                  String(day.date.getMonth() + 1).padStart(2, "0"),
                  String(day.date.getDate()).padStart(2, "0"),
                ].join("-");
                return (
                  <div className="journey-rhythm-day" key={isoDate}>
                    <span className="journey-rhythm-value">
                      {day.seconds
                        ? minutes >= 60
                          ? `${(minutes / 60).toFixed(1)}h`
                          : `${minutes}m`
                        : ""}
                    </span>
                    <div className="journey-rhythm-bar">
                      <i style={{ height: `${height}%` }} />
                    </div>
                    <time dateTime={isoDate}>{day.label}</time>
                  </div>
                );
              })}
            </div>
            {!weekSeconds && (
              <p className="journey-rhythm-empty-note">
                开始播放后，这里会慢慢显现你的聆听节奏。
              </p>
            )}
            <div className="journey-rhythm-axis" aria-hidden="true">
              <span>LISTENING MINUTES</span>
              <span>LAST 7 DAYS</span>
            </div>
          </div>
          <div className="journey-rhythm-summary">
            <span className="journey-rhythm-summary-kicker">
              A LITTLE TIME, JUST FOR YOU
            </span>
            <strong>
              {weekDuration.value}
              <small>{weekDuration.unit}</small>
            </strong>
            <p>
              {weekActiveDays
                ? `这周有 ${weekActiveDays} 天，旋律陪你停留了一会儿。`
                : "给自己留一点时间，下一段旋律会从这里开始。"}
            </p>
            <div className="journey-rhythm-mini-stats">
              <span>
                <b>{weekActiveDays}</b> 个聆听日
              </span>
              <span>
                <b>{weekTracks.size}</b> 首不同的歌
              </span>
            </div>
          </div>
        </div>
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
