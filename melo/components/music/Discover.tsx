"use client";
import { useState } from "react";
import { uploadedTracks, downloadedTracks, playableTracks, catalog } from "../../data/music/catalog";
import { differentTracks, recommend } from "../../lib/music/recommendation";
import type { LiveMelo } from "../melo/live/useLiveMelo";
import { DiscoverRail } from "./DiscoverRail";
import { StandardTrackCard, HeroTrackCard, CompactTrackRow } from "./TrackCard";

export function Discover({ melo }: { melo: LiveMelo }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const library = [...downloadedTracks, ...catalog.filter(track => track.source === "qq-music")];
  const featured = recommend(melo.signal, 1, playableTracks)[0];
  const spotlights = [
    {
      title: "LATE NIGHT",
      label: "给夜晚留一点空间",
      track: recommend(
        { mood: "tired", energy: 24, scenes: ["night"], hour: 23 },
        1,
        playableTracks,
      )[0],
    },
    {
      title: "FOCUS",
      label: "把注意力收回来",
      track: recommend(
        { mood: "focus", energy: 48, scenes: ["focus"] },
        1,
        playableTracks,
      )[0],
    },
    {
      title: "ENERGY",
      label: "向亮处再走一步",
      track: recommend(
        { mood: "bright", energy: 78, scenes: ["day"] },
        1,
        playableTracks,
      )[0],
    },
  ];
  const rails = [
    {
      title: "Because You Loved…",
      caption: melo.preferences.likedTracks.length
        ? "从你真正收藏的声音，继续向外走。"
        : "还没有收藏。先试听这些声音，喜欢以后这里会跟着你变化。",
      tracks: recommend(
        { mood: "calm", preferences: melo.preferences },
        6,
        playableTracks,
      ),
    },
    {
      title: "Try Something Different",
      caption: melo.preferences.recentTracks.length
        ? "暂时走出最近听过的声音。"
        : "第一次见面，先把不同的声音放在你面前。",
      tracks: differentTracks(melo.preferences, playableTracks),
    },
  ];

  return (
    <section className="world-section discover-section">
      <div className="world-section-meta">
        <span>06 / DISCOVER WITH MELO</span>
        <span>不必知道歌名，也可以找到音乐</span>
      </div>
      <div className="discover-heading">
        <h2 className="world-title">
          让 Melo，
          <br />
          带你<span>发现音乐。</span>
        </h2>
        <button className="world-text-button" onClick={melo.surprise}>
          ✦ 惊喜我一下
        </button>
      </div>

      <div className="discover-feature">
        <div className="discover-feature-copy">
          <small>FEATURED · SLOW CITY</small>
          <h3>{melo.currentMoment?.payload.scene || "雨夜公交"}</h3>
          <p>
            {melo.currentMoment
              ? "从你刚刚留下的心情出发，看看这首声音是否合适。"
              : "有时候下雨不是坏天气，只是城市把节奏放慢了。"}
          </p>
          <a href="#music">去听今晚的推荐 ↗</a>
        </div>
        {featured && (
          <HeroTrackCard
            track={featured}
            melo={melo}
            reason={featured.reason}
          />
        )}
      </div>

      <div className="discover-spotlights" aria-label="三种音乐专题">
        {spotlights.map(({ title, label, track }) => (
          <div className="discover-spotlight" key={title}>
            <small>{title}</small>
            <h3>{label}</h3>
            {track && <CompactTrackRow track={track} melo={melo} />}
          </div>
        ))}
      </div>

      <form
        className="music-search"
        onSubmit={(e) => {
          e.preventDefault();
          void melo.searchMusic(query);
        }}
      >
        <label htmlFor="music-search">让 Melo 帮你找歌</label>
        <div>
          <input
            id="music-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索歌名、歌手，或说说你想听的感觉……"
            maxLength={1000}
          />
          <button disabled={!query.trim() || melo.searching}>
            {melo.searching ? "正在找声音…" : "找一组音乐 ↗"}
          </button>
        </div>
      </form>
      {melo.searchStatus && (
        <p role="status" className="search-status">
          {melo.searchStatus}
        </p>
      )}
      {melo.searchResults.length > 0 && (
        <DiscoverRail
          title="Melo 找到了这些声音"
          caption="找到喜欢的声音，就从这一首开始。"
          tracks={melo.searchResults}
          melo={melo}
        />
      )}
      <DiscoverRail title="你带来的歌" caption="熟悉的声音，留在你的小小音乐空间。" tracks={uploadedTracks} melo={melo} />
      <div className="integrated-library">
        <header><h3>更多声音</h3><p>熟悉的旋律，也有还没遇见的歌。</p></header>
        <div className="integrated-library-grid">
          {library.slice(0, visibleCount).map(track=><StandardTrackCard key={track.id} track={track} melo={melo}/>)}
        </div>
        {visibleCount < library.length && <button className="world-text-button" onClick={()=>setVisibleCount(n=>n+12)}>再看看更多歌曲 ↓</button>}
      </div>
      {rails.map((rail) => (
        <DiscoverRail key={rail.title} {...rail} melo={melo} />
      ))}
    </section>
  );
}
