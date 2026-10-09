"use client";
import { findTrack } from "../../data/music/catalog";
import { mixStages } from "../../lib/music/recommendation";
import type { LiveMelo } from "../melo/live/useLiveMelo";

export function Playlist({ melo }: { melo: LiveMelo }) {
  return (
    <section id="mix" className="world-section mix-section">
      <div className="world-section-meta">
        <span>05 / MELO MIX</span>
        <span>六段声音，一段完整的陪伴</span>
      </div>
      <div className="mix-layout">
        <div className="mix-intro">
          <p className="world-label">
            MELO MIX ·{" "}
            {new Date(melo.mix.generatedAt).toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <h2 className="world-title">
            从此刻，
            <br />
            慢慢走向<span>明天。</span>
          </h2>
          <p className="world-description">{melo.mix.subtitle}</p>
          <p className="world-fineprint">{melo.mix.reason}</p>
          <div className="mix-notes" data-mode={melo.mode} aria-hidden="true">
            ♪ ♫ ♪ ♩ ♫ ♩
          </div>
          <div className="award-actions">
            <button
              className="world-button"
              onClick={() => melo.playQueue(melo.mix.tracks)}
            >
              播放全部 ↗
            </button>
            <button onClick={() => melo.playQueue(melo.mix.tracks, true)}>
              随机播放
            </button>
            <button
              disabled={!!melo.busy}
              aria-pressed={melo.mixLiked}
              onClick={() => void melo.favoriteMix()}
            >
              {melo.mixLiked ? "已收藏 Mix" : "收藏 Mix"}
            </button>
            <button onClick={melo.regenerateMix}>换一个 Mix</button>
          </div>
          <p className="mix-edition-note">这是这一刻，为你编成的一张小唱片。</p>
        </div>
        <div className="mix-sides">
          {[
            { title: "SIDE A · 慢慢落地", start: 0, end: 3 },
            { title: "SIDE B · 重新出发", start: 3, end: 6 },
          ].map((side) => (
            <section className="mix-side" key={side.title}>
              <header>{side.title}</header>
              <ol className="mix-list">
                {melo.mix.tracks
                  .slice(side.start, side.end)
                  .map((id, offset) => {
                    const index = side.start + offset;
                    const track = findTrack(id)!;
                    return (
                      <li key={id}>
                        <button
                          aria-label={`Mix 播放 ${track.title}`}
                          onClick={() =>
                            melo.playQueue(melo.mix.tracks.slice(index))
                          }
                        >
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <img
                            src={track.cover}
                            width="64"
                            height="64"
                            alt=""
                            loading="lazy"
                          />
                          <div>
                            <small>
                              {mixStages[index]} · 音乐能量 {track.energy}%
                            </small>
                            <h3>{track.title}</h3>
                            <p>{track.artist} · {track.reason}</p>
                          </div>
                          <b>↗</b>
                        </button>
                      </li>
                    );
                  })}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
