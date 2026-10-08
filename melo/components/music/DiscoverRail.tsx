"use client";
import { useRef } from "react";
import type { Track } from "../../data/music/catalog";
import type { LiveMelo } from "../melo/live/useLiveMelo";
import { StandardTrackCard } from "./TrackCard";
export function DiscoverRail({
  title,
  caption,
  tracks,
  melo,
}: {
  title: string;
  caption: string;
  tracks: Track[];
  melo: LiveMelo;
}) {
  const root = useRef<HTMLDivElement>(null);
  const move = (delta: number) =>
    root.current?.scrollBy({
      left: delta * (root.current.clientWidth * 0.75),
      behavior: melo.reduced ? "instant" : "smooth",
    });
  return (
    <div className="discover-rail">
      <header>
        <div>
          <h3>{title}</h3>
          <p>{caption}</p>
        </div>
        <div>
          <button aria-label={`${title} 上一组`} onClick={() => move(-1)}>
            ←
          </button>
          <button aria-label={`${title} 下一组`} onClick={() => move(1)}>
            →
          </button>
        </div>
      </header>
      <div
        ref={root}
        className="rail-tracks"
        tabIndex={0}
        role="region"
        aria-label={`${title} 音乐轨道`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            move(e.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {tracks.map((t) => (
          <StandardTrackCard key={t.id} track={t} melo={melo} />
        ))}
      </div>
    </div>
  );
}
