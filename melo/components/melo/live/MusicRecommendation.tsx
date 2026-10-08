"use client";
import { QQMusicIcon } from "../QQMusicIcon";
import {
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import type { LiveMelo } from "./useLiveMelo";
import { PaintedExpression } from "../PaintedExpression";
import { moodNames } from "../../../data/experience";
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
        <span>04 / Listen</span>
        <span>留一段时间，给音乐</span>
      </div>
      <div className="listen-heading reveal">
        <p className="world-label">Tonight’s Song</p>
        <h2 className="world-title">
          今晚，Melo 想先送你<span>这一首。</span>
        </h2>
      </div>
      {melo.moodJourney && (
        <div className="journey-record-bridge reveal">
          <span>
            MOOD JOURNEY · STEP{" "}
            {String(
              Math.max(
                0,
                melo.moodJourney.steps.findIndex((s) => s.track === a.song.id),
              ) + 1,
            ).padStart(2, "0")}{" "}
            / 04
          </span>
          <p>
            {moodNames[melo.moodJourney.from] || "此刻"} →{" "}
            {melo.moodJourney.targetLabel}
          </p>
          <small>
            {melo.moodJourney.steps.find((s) => s.track === a.song.id)?.line ||
              "这一段声音，接着你的音乐旅程。"}
          </small>
          <button
            onClick={() =>
              melo.playJourney(
                Math.max(
                  0,
                  melo.moodJourney!.steps.findIndex(
                    (s) => s.track === a.song.id,
                  ),
                ),
              )
            }
          >
            继续这条音乐旅程 ↗
          </button>
        </div>
      )}
      <div className={"record-space reveal " + (a.playing ? "playing" : "")}>
        <div className="record-halo" aria-hidden="true" />
        <div className="vinyl-record" aria-hidden="true">
          <i />
          <span>melo {<QQMusicIcon />}</span>
        </div>
        <div className="record-cover">
          <img
            src={a.song.cover}
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
      <div className="song-understanding">
        <PaintedExpression
          expression={melo.expression}
          thumbnail
          reduced={melo.reduced}
        />
        <div>
          <span className="world-label">WHY THIS SONG</span>
          <p>{melo.reason || a.song.reason}</p>
          <div className="matching-lines">
            {[
              [
                "情绪",
                a.song.moods.includes(melo.mood)
                  ? "与你的状态同向"
                  : "换一种感觉",
              ],
              ["能量", `音乐能量 ${a.song.energy}%`],
              ["场景", melo.currentMoment?.payload.scene || "留一点时间给自己"],
            ].map(([label, value]) => (
              <span key={label}>
                <b>{label}</b>
                <i />
                <small>{value}</small>
              </span>
            ))}
          </div>
        </div>
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
            max={a.duration - 0.1}
            step={0.1}
            value={a.progress}
            onChange={(e) => a.seek(+e.target.value)}
          />
          <time>1:30</time>
        </div>
        <div className="real-player-controls">
          <button aria-label="上一首" onClick={() => melo.skip(-1)}>
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
          <button aria-label="下一首" onClick={() => melo.skip(1)}>
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
      <p className="music-lyric" aria-live="off">
        {
          [
            "把今天没说完的话，留给耳机里的夜晚。",
            "不必急着抵达，让这段旋律先陪你。",
            "每一次停下来，都是靠近自己的开始。",
          ][Math.floor(a.progress / 30) % 3]
        }
      </p>
      <div className="music-directions">
        <span>如果不想听这一首</span>
        {(
          [
            ["quiet", "安静一点"],
            ["warm", "更治愈一点"],
            ["energy", "给我一点能量"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} onClick={() => melo.changeDirection(id)}>
            {label} ↗
          </button>
        ))}
      </div>
      {melo.currentMoment && (
        <a href="#memory" className="world-button">
          查看这次记忆
        </a>
      )}
    </section>
  );
}
