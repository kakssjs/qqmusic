"use client";
import { useMemo, useState } from "react";
import contestTracks from "./contest-playlist.json";

const contestPlaylistUrl =
  "https://y.qq.com/n/ryqq_v2/playlist/9778975366?ADTAG=h5_share_playlist&redirecttag=mn.redirect.custom&mnst=1.08";

export function ContestMusicLibrary() {
  const [libraryQuery, setLibraryQuery] = useState("");
  const visibleTracks = useMemo(() => {
    const query = libraryQuery.trim().toLocaleLowerCase();
    if (!query) return contestTracks;
    return contestTracks.filter((track) =>
      `${track.name} ${track.artist}`.toLocaleLowerCase().includes(query),
    );
  }, [libraryQuery]);
  return (
      <div className="contest-soundtrack">
        <div className="contest-soundtrack-heading">
          <div>
            <p className="world-label">HACKATHON DEMO / QQ MUSIC</p>
            <h3>腾讯音乐高校 AI Hackathon 赛事曲库</h3>
            <p>官方参考歌单中的全部曲目，点击后由 QQ 音乐播放。</p>
          </div>
          <label className="contest-library-search">
            <span className="sr-only">搜索曲名或歌手</span>
            <input
              type="search"
              value={libraryQuery}
              onChange={(event) => setLibraryQuery(event.target.value)}
              placeholder="搜索曲名或歌手"
            />
          </label>
        </div>
        <div className="contest-library-toolbar" aria-live="polite">
          <span>{libraryQuery ? `找到 ${visibleTracks.length} 首` : `曲库共 ${contestTracks.length} 首`}</span>
          <a href={contestPlaylistUrl} target="_blank" rel="noopener noreferrer">
            打开 QQ 音乐完整歌单 <span aria-hidden="true">↗</span>
          </a>
        </div>
        <ol className="contest-track-list" aria-label="赛事参考曲库">
          {visibleTracks.map((track, i) => (
            <li key={track.id}>
              <a
                className="contest-track-row"
                href={`https://y.qq.com/n/ryqq_v2/songDetail/${track.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="contest-track-number">{String(i + 1).padStart(2, "0")}</span>
                <span className="contest-track-copy">
                  <strong>{track.name}</strong>
                  <small>{track.artist}</small>
                </span>
                <span className="contest-track-open">在 QQ 音乐播放 ↗</span>
              </a>
            </li>
          ))}
          {visibleTracks.length === 0 && (
            <li className="contest-library-empty">没有找到匹配的曲目</li>
          )}
        </ol>
        <p className="contest-soundtrack-note">
          仅用于本届比赛期间的非商业 Demo 与评审演示。
        </p>
      </div>
  );
}
