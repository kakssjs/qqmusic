"use client";
import type { CSSProperties } from "react";
import { findTrack } from "../../data/music/catalog";
import { journeyTargets } from "../../lib/music/mood-journey";
import { moodNames } from "../../data/experience";
import type { LiveMelo } from "../melo/live/useLiveMelo";
import { MusicCompanion } from "../melo/MusicCompanion";
export function JourneyGoals({ melo }: { melo: LiveMelo }) {
  return (
    <div className="journey-goals" role="group" aria-label="选择音乐旅程目标">
      {journeyTargets.map((t) => (
        <button
          key={t.id}
          disabled={!!melo.busy}
          aria-pressed={melo.moodJourney?.target === t.id}
          onClick={() => {
            melo.startJourney(t.id);
            document
              .getElementById("mood-journey")
              ?.scrollIntoView({ behavior: melo.reduced ? "auto" : "smooth" });
          }}
        >
          {t.label} ↗
        </button>
      ))}
    </div>
  );
}
export function MoodJourney({ melo }: { melo: LiveMelo }) {
  const route = melo.moodJourney,
    steps = route?.steps || [],
    at = steps.findIndex((s) => s.track === melo.audio.song.id),
    audioLevel =
      melo.audio.playing && !melo.reduced
        ? Math.min(1, Math.max(...melo.audio.levels) / 85)
        : 0,
    points = steps.map((s, i) => ({
      x: 100 + i * 266,
      y: 340 - s.energy * 2.2,
    }));
  const path = points
    .map((p, i) =>
      i
        ? `C ${p.x - 170} ${points[i - 1].y} ${p.x - 100} ${p.y} ${p.x} ${p.y}`
        : `M ${p.x} ${p.y}`,
    )
    .join(" ");
  return (
    <section
      id="mood-journey"
      className="world-section mood-journey-section"
      data-outcome={route?.outcome || "open"}
    >
      <div className="world-section-meta">
        <span>03 / MOOD JOURNEY</span>
        <span>从现在的你，走向想去的状态</span>
      </div>
      <div className="route-heading">
        <div>
          <p className="world-label">A LITTLE CLOSER</p>
          <h2 className="world-title">
            音乐陪你，
            <br />
            慢慢<span>走过去。</span>
          </h2>
        </div>
        <p>
          你不必立刻变好。
          <br />
          先选择一个想靠近的方向。
        </p>
      </div>
      <JourneyGoals melo={melo} />
      {route ? (
        <>
          <div className="route-caption">
            <span>FROM · {moodNames[route.from] || "此刻"}</span>
            <i>→</i>
            <span>TO · {route.targetLabel}</span>
            <small>
              {route.source === "ai-signals"
                ? "基于 AI 音乐状态"
                : "基于你的选择与关键词"}{" "}
              · 标签规则设计路径
            </small>
          </div>
          <div className="emotion-route" aria-label="四首音乐状态过渡路径">
            <svg
              className="emotion-curve"
              viewBox="0 0 1000 430"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="route-light">
                  <stop stopColor="#afc2c9" />
                  <stop offset="1" stopColor="#c8ff32" />
                </linearGradient>
              </defs>
              <path
                d={path}
                fill="none"
                stroke="url(#route-light)"
                strokeWidth="1.5"
              />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={at === i ? 8 : 4}
                  fill={at === i ? "#c8ff32" : "#afc2c9"}
                />
              ))}
            </svg>
            {steps.map((s, i) => {
              const t = findTrack(s.track)!;
              const heard = (melo.audio.listeningByTrack[s.track] || 0) > 0;
              return (
                <button
                  key={s.track}
                  className={`route-node ${at === i && melo.audio.playing ? "active" : ""} ${heard ? "heard" : ""}`}
                  data-track-id={t.id}
                  onClick={() => melo.playJourney(i)}
                  style={
                    {
                      "--node-x": `${points[i].x / 10}%`,
                      "--node-y": `${(points[i].y / 430) * 100}%`,
                    } as CSSProperties
                  }
                  aria-label={`播放旅程第 ${i + 1} 首 ${t.title}`}
                >
                  <small>
                    0{i + 1} / {s.stage}
                  </small>
                  <img
                    src={t.cover}
                    alt=""
                    width="92"
                    height="92"
                    loading="lazy"
                  />
                  <h3>{t.title}</h3>
                  <p>{s.line}</p>
                  <span>{s.energy}% ENERGY · ▶</span>
                </button>
              );
            })}
            {at >= 0 && (
              <div
                className="route-spirit"
                style={
                  {
                    left: `${points[at].x / 10}%`,
                    top: `${(points[at].y / 430) * 100}%`,
                    "--audio-pulse": `${audioLevel * 30}px`,
                  } as CSSProperties
                }
              >
                <MusicCompanion
                  reduced={melo.reduced}
                  working={melo.busy === "emotion"}
                  playing={melo.audio.playing}
                  greet={() => melo.setExpression("wink")}
                />
              </div>
            )}
          </div>
          <div className="route-actions">
            <button className="world-button" onClick={() => melo.playJourney()}>
              一起听这条路线 ↗
            </button>
            <button onClick={melo.regenerateJourney}>换一种路线</button>
            <span>{Math.floor(melo.journeySeconds)} 秒真实聆听 · 4 TRACKS</span>
          </div>
          <div className="journey-feedback" aria-live="polite">
            {route.outcome === "better" ? (
              <>
                <h3>这一段，你说“好多了”。</h3>
                <p>没有要求自己马上振作，这条路线已经留下。</p>
                <a href="#memory">看看这颗记忆 ↗</a>
              </>
            ) : route.outcome === "not-yet" ? (
              <>
                <h3>你选择了“差一点”。</h3>
                <p>这次感受已经记下；可以从新路线继续，不必勉强喜欢。</p>
                <a href="#memory">看看这颗记忆 ↗</a>
              </>
            ) : (
              <>
                <h3>现在，更接近你想要的状态了吗？</h3>
                <p>
                  {melo.journeySeconds < 25
                    ? "一起听满 25 秒，再留下自己的感受。"
                    : "由你自己确认，音乐不替你定义感受。"}
                </p>
                <button
                  disabled={melo.journeySeconds < 25 || !!melo.busy}
                  onClick={() => void melo.finishJourney()}
                >
                  好多了
                </button>
                <button
                  disabled={melo.journeySeconds < 25 || !!melo.busy}
                  onClick={() => void melo.adjustJourney()}
                >
                  差一点
                </button>
                <button onClick={melo.regenerateJourney}>换一种路线</button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="route-empty">
          <svg viewBox="0 0 900 180" aria-hidden="true">
            <path
              d="M30 135 C200 135 180 55 320 55 S520 160 630 95 S770 30 870 45"
              fill="none"
              stroke="#afc2c94a"
            />
            {[
              [30, 135],
              [320, 55],
              [630, 95],
              [870, 45],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="5" fill="#9ae6b4" />
            ))}
          </svg>
          <p>
            现在在哪里，想让音乐陪你去哪里？
            <br />
            <small>无需 AI 成功，也能从自己的感受开始。</small>
          </p>
        </div>
      )}
      <p className="world-fineprint">
        音乐状态过渡与陪伴体验，不是心理健康诊断或治疗。
      </p>
    </section>
  );
}
