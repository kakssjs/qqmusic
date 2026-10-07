"use client";
import {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { tracks } from "../useMeloAudio";
import type { LiveMelo } from "./useLiveMelo";
const clock = (n: number) =>
  Math.floor(n / 60) + ":" + String(Math.floor(n % 60)).padStart(2, "0");
export function MusicRecommendation({ melo }: { melo: LiveMelo }) {
  const a = melo.audio;
  return (
    <section
      id="music"
      className={
        "world-section listen-section " + (a.playing ? "is-playing" : "")
      }
    >
      <div className="world-section-meta reveal">
        <span>03 / Listen</span>
        <span>留一段时间，给音乐</span>
      </div>
      <div className="listen-heading reveal">
        <p className="world-label">Tonight’s Song</p>
        <h2 className="world-title">
          今晚，Melo 想送你<span>这首歌。</span>
        </h2>
      </div>
      <div className={"record-space reveal " + (a.playing ? "playing" : "")}>
        <div className="record-halo" aria-hidden="true" />
        <div className="vinyl-record" aria-hidden="true">
          <i />
          <span>melo ✳</span>
        </div>
        <div className="record-cover">
          <img
            src="/cloud-ice-scene.png"
            alt={a.song.name + "：蓝灰云海与薄荷色光线"}
            loading="lazy"
          />
          <div>
            <span>Melo / original sound</span>
            <h3>{a.song.name}</h3>
            <small>{a.song.subtitle}</small>
          </div>
          <b>0{a.track + 1}</b>
        </div>
        <span className="record-side-note">
          A little sound. A little company.
        </span>
      </div>
      <div className="song-dedication reveal">
        <p>
          {melo.reason ||
            (a.song.id === "calm"
              ? "今天已经足够辛苦了，剩下的时间交给音乐。"
              : a.song.reason)}
        </p>
        <button
          aria-label="收藏当前音乐"
          aria-pressed={melo.liked}
          disabled={!!melo.busy || !melo.ready}
          onClick={() => void melo.favorite()}
        >
          <Heart size={20} fill={melo.liked ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="music-installation-player minimal-player reveal">
        <div className="real-wave" aria-hidden="true">
          {a.levels.map((v, i) => (
            <i key={i} style={{ height: (melo.reduced ? 10 : v) + "px" }} />
          ))}
        </div>
        <div className="player-progress">
          <time>{clock(a.progress)}</time>
          <input
            type="range"
            aria-label="音乐播放进度"
            min={0}
            max={89.9}
            step={0.1}
            value={a.progress}
            onChange={(e) => a.seek(+e.target.value)}
          />
          <time>1:30</time>
        </div>
        <div className="real-player-controls">
          <button aria-label="上一首" onClick={a.previous}>
            <SkipBack size={19} />
          </button>
          <button
            className="real-play"
            aria-label={a.playing ? "暂停音乐" : "播放音乐"}
            onClick={a.toggle}
          >
            {a.playing ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" />
            )}
          </button>
          <button aria-label="下一首" onClick={a.next}>
            <SkipForward size={19} />
          </button>
          <div className="real-volume">
            <Volume2 size={15} />
            <input
              aria-label="音量"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={a.volume}
              onChange={(e) => a.setVolume(+e.target.value)}
            />
          </div>
        </div>
        <p className="world-fineprint">Melo 原创氛围音乐 · 90 秒的小小陪伴</p>
        {a.error && <p role="alert">{a.error}</p>}
      </div>
      <div
        className="frequency-options music-track-list reveal"
        aria-label="选择音乐"
      >
        {tracks.map((t, i) => (
          <button
            key={t.id}
            className={a.track === i ? "selected" : ""}
            aria-pressed={a.track === i}
            onClick={() => melo.chooseMood(t.id)}
          >
            <span>0{i + 1}</span>
            <strong>{t.name}</strong>
            <small>{t.subtitle}</small>
            {a.track === i && (
              <span className="track-pulse" aria-hidden="true">
                ≋
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
