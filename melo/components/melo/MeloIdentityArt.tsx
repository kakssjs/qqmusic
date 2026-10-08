"use client";
import { type Expression } from "../../data/expressions";
import { PaintedExpression } from "./PaintedExpression";
import { useId } from "react";

export function MeloIdentityArt({
  expression,
  reduced = false,
  busy = false,
  blink = false,
  className = "",
  alt = "Melo 音音，薄荷白双丸子头、音符耳机与白绿机能穿搭。",
}: {
  expression: Expression;
  reduced?: boolean;
  busy?: boolean;
  blink?: boolean;
  className?: string;
  alt?: string;
}) {
  const showPaintedFace = expression !== "wink" || (!reduced && blink);
  const faceClip = useId().replace(/:/g, "") + "-features";

  return (
    <div
      className={`melo-identity-art ${className}`.trim()}
      data-expression={expression}
      data-busy={busy}
      data-reduced={reduced}
    >
      <img
        className="canonical-character-art"
        src="/mascot/melo-reference-cutout.webp"
        alt={alt}
        draggable="false"
      />
      {showPaintedFace && (
        <svg
          key={expression}
          className="painted-face-placement"
          viewBox="0 0 1024 1536"
          preserveAspectRatio="xMidYMid meet"
          data-blink={!reduced && blink}
          aria-hidden="true"
        >
          <defs><clipPath id={faceClip}>
            <ellipse cx="420" cy="342" rx="27" ry="20" transform="rotate(-28 420 342)" />
            <ellipse cx="505" cy="285" rx="27" ry="20" transform="rotate(-28 505 285)" />
            <ellipse cx="488" cy="353" rx="24" ry="23" transform="rotate(-23 488 353)" />
          </clipPath></defs>
          <g clipPath={`url(#${faceClip})`}>
          <g transform="matrix(1 -0.17 0 1 216 57)">
          <svg width="443.5" height="443.5" viewBox="0 0 443.5 443.5">
          <PaintedExpression
            expression={expression}
            blink={!reduced && blink}
            reduced={reduced}
          />
          </svg>
          </g>
          </g>
        </svg>
      )}
    </div>
  );
}

