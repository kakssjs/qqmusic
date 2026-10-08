"use client";
import type { LiveMelo } from "./live/useLiveMelo";
import { MeloIdentityArt } from "./MeloIdentityArt";
import { MusicCompanion } from "./MusicCompanion";
export function CharacterPresence({
  melo,
  className = "",
  compact = false,
}: {
  melo: LiveMelo;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`character-presence ${compact ? "is-compact" : ""} ${className}`}
      data-mode={melo.mode}
      data-expression={melo.expression}
      data-reduced={melo.reduced}
      data-error={!!melo.error}
    >
      <MeloIdentityArt
        expression={melo.expression}
        reduced={melo.reduced}
        busy={melo.mode === "thinking"}
        alt="Melo 陪你一起听"
      />
      <MusicCompanion
        working={melo.mode === "thinking"}
        playing={melo.audio.playing}
        reduced={melo.reduced}
        greet={() => melo.setExpression("wink")}
      />
      <span className="presence-caption">
        {melo.mode === "thinking"
          ? "正在认真想你说的话"
          : melo.mode === "music"
            ? "这一首，我陪你听"
            : melo.mode === "celebrate"
              ? "把这一刻，好好留下"
              : "我在这里，慢慢来。"}
      </span>
    </div>
  );
}
