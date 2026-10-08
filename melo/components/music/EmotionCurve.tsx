"use client";
import { findTrack } from "../../data/music/catalog";
import { moodNames } from "../../data/experience";
import type { LiveMelo } from "../melo/live/useLiveMelo";
import { CharacterPresence } from "../melo/CharacterPresence";
import type { CSSProperties } from "react";
export function EmotionCurve({ melo }: { melo: LiveMelo }) {
  const route = melo.moodJourney;
  if (!route) return null;
  const at = route.steps.findIndex((s) => s.track === melo.audio.song.id);
  const points = route.steps.map((s, i) => ({
    x: 12 + (i * 76) / (route.steps.length - 1),
    y: 64 - s.energy * 0.46,
  }));
  const path = points
    .map((p, i) =>
      i
        ? `C ${p.x - 12} ${points[i - 1].y} ${p.x - 12} ${p.y} ${p.x} ${p.y}`
        : `M ${p.x} ${p.y}`,
    )
    .join(" ");
  return (
    <div className="emotion-journey-canvas">
      <div className="curve-state current">
        <span>CURRENT STATE</span>
        <strong>{moodNames[route.from] || "此刻"}</strong>
        <small>ENERGY {route.steps[0].energy}</small>
      </div>
      <div className="curve-state target">
        <span>TARGET STATE</span>
        <strong>{route.targetLabel}</strong>
        <small>ENERGY {route.steps.at(-1)?.energy}</small>
      </div>
      <div
        className="emotion-route"
        aria-label={`${route.steps.length}首音乐的情绪旅程`}
      >
        <svg
          className="emotion-curve"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={path} vectorEffect="non-scaling-stroke" />
          <path
            className="curve-guide"
            d="M 0 84 L 100 84"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {route.steps.map((step, i) => {
          const track = findTrack(step.track);
          if (!track) return null;
          const active = at === i && melo.audio.playing;
          const heard = melo.journeyHeardTracks.includes(step.track);
          return (
            <button
              className={`route-node ${active ? "active" : ""} ${heard ? "heard" : ""}`}
              key={step.track}
              data-track-id={track.id}
              aria-current={active ? "step" : undefined}
              aria-label={`播放旅程第${i + 1}首 ${track.title}`}
              onClick={() => melo.playJourney(i)}
              style={
                {
                  "--node-x": `${points[i].x}%`,
                  "--node-y": `${points[i].y}%`,
                } as CSSProperties
              }
            >
              <span className="route-step">
                STEP {String(i + 1).padStart(2, "0")} <i>{step.stage}</i>
              </span>
              <span className="route-cover">
                <img src={track.cover} alt="" width={180} height={180} />
                <b aria-hidden="true">{active ? "Ⅱ" : "▶"}</b>
              </span>
              <h3>{track.title}</h3>
              <p>{step.line}</p>
              <small>
                {active ? "正在陪你听" : heard ? "听过的声音" : "等待你走近"}
              </small>
            </button>
          );
        })}
        <div
          className="curve-companion"
          style={
            {
              "--spirit-x": `${points[Math.max(0, at)]?.x}%`,
              "--spirit-y": `${points[Math.max(0, at)]?.y}%`,
            } as CSSProperties
          }
        >
          <CharacterPresence melo={melo} compact />
        </div>
      </div>
      <p className="curve-scale">
        <span>FROM HERE</span>
        <span>A LITTLE CLOSER</span>
      </p>
    </div>
  );
}
