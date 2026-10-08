"use client";
import { Play, Pause, LoaderCircle, ArrowUpRight } from "lucide-react";
import { trackAudioLabel, trackDuration, type Track } from "../../data/music/catalog";
import type { LiveMelo } from "../melo/live/useLiveMelo";
export function TrackCard({
  track: t,
  melo,
  reason,
  size = "standard",
}: {
  track: Track;
  melo: LiveMelo;
  reason?: string;
  size?: "hero" | "standard" | "compact";
}) {
  const current = melo.audio.song.id === t.id;
  const loading = current && melo.audio.loading;
  const playing = current && melo.audio.playing;
  const official = t.source === "qq-music";
  return (
    <article
      className="award-track"
      data-size={size}
      data-track-id={t.id}
      data-source={t.source}
    >
      <div className="award-cover">
        <img
          src={t.cover}
          alt={`${t.title} · Melo 氛围封面`}
          loading="lazy"
          width="640"
          height="640"
        />
        {official ? (
          <a
            href={t.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`在 QQ 音乐中打开 ${t.title}`}
          >
            <ArrowUpRight size={22} />
          </a>
        ) : (
          <button
            disabled={loading}
            onClick={() => playing ? melo.audio.toggle() :
              melo.playQueue([
                t.id,
                ...melo.recommendations
                  .filter((x) => x.id !== t.id)
                  .map((x) => x.id),
              ])
            }
            aria-label={`${loading ? "正在加载" : playing ? "暂停" : "播放"} ${t.title}`}
          >
            {loading ? <LoaderCircle size={20} /> : playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
        )}
      </div>
      <small>{official ? trackAudioLabel(t) : `${trackAudioLabel(t)} · ${trackDuration(t)}`}</small>
      {loading && <p role="status">正在加载歌曲，首次播放需要一点时间…</p>}
      {current && melo.audio.error && <p role="alert">{melo.audio.error}</p>}
      <h3>{t.title}</h3>
      <p className="track-artist">{t.artist}</p>
      <p className="track-reason">{reason || t.reason}</p>
      {official && (
        <a
          className="official-link"
          href={t.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          在 QQ 音乐中打开 ↗
        </a>
      )}
    </article>
  );
}

export const HeroTrackCard = (
  props: Omit<Parameters<typeof TrackCard>[0], "size">,
) => <TrackCard {...props} size="hero" />;
export const StandardTrackCard = (
  props: Omit<Parameters<typeof TrackCard>[0], "size">,
) => <TrackCard {...props} size="standard" />;
export const CompactTrackRow = (
  props: Omit<Parameters<typeof TrackCard>[0], "size">,
) => <TrackCard {...props} size="compact" />;
