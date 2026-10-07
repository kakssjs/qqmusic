"use client";
import { type Expression } from "../../data/expressions";
import { PaintedExpression } from "./PaintedExpression";

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
        <div
          key={expression}
          className="painted-face-placement"
          data-blink={!reduced && blink}
          aria-hidden="true"
        >
          <PaintedExpression
            expression={expression}
            blink={!reduced && blink}
            reduced={reduced}
          />
        </div>
      )}
    </div>
  );
}
