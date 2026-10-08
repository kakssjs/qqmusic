"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { PaintedExpression } from "../melo/PaintedExpression";
import { MusicCompanion } from "../melo/MusicCompanion";
import type { LiveMelo } from "../melo/live/useLiveMelo";
export function CompanionDock({
  melo,
  visible,
}: {
  melo: LiveMelo;
  visible: boolean;
}) {
  const [open, setOpen] = useState(false),
    [dismissed, setDismissed] = useState(false),
    [prompt, setPrompt] = useState(false),
    [feedback, setFeedback] = useState(false),
    [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const v = window.visualViewport;
    const update = () =>
      setKeyboard(!!v && v.height < window.innerHeight * 0.72);
    v?.addEventListener("resize", update);
    return () => v?.removeEventListener("resize", update);
  }, []);
  if (!visible || dismissed || keyboard || melo.nowPlaying) return null;
  const level = melo.reduced ? 0 : Math.max(...melo.audio.levels) / 85;
  const hint = melo.error
    ? "刚刚走神了一下，音乐还在这里。"
    : melo.mode === "thinking"
      ? "把你的心情，慢慢变成声音。"
      : melo.mode === "listening"
        ? "我在听，不用急着说完。"
        : melo.audio.playing
          ? `一起听《${melo.audio.song.title}》。`
          : "下一首歌，我们一起听。";
  return (
    <aside
      className={`companion-dock ${open || prompt ? "expanded" : ""} ${melo.audio.hasStarted ? "above-player" : ""}`}
      data-mode={melo.mode}
      data-expression={melo.expression}
      data-reduced={melo.reduced}
      style={{ "--audio-level": level } as CSSProperties}
      aria-label="Melo 常驻伙伴"
    >
      <button
        className="dock-toggle"
        aria-label={open ? "收起 Melo 伙伴" : "展开 Melo 伙伴"}
        aria-expanded={open || prompt}
        onClick={() => {
          setOpen(!open);
          setPrompt(false);
        }}
      >
        <PaintedExpression
          expression={melo.expression}
          thumbnail
          reduced={melo.reduced}
        />
        <span className="dock-status" aria-label={hint}>
          <i />
        </span>
      </button>
      {(open || prompt) && (
        <div className="dock-body">
          <button
            className="dock-dismiss"
            aria-label="关闭 Melo 伙伴"
            onClick={() => setDismissed(true)}
          >
            ×
          </button>
          <MusicCompanion
            reduced={melo.reduced}
            working={melo.mode === "thinking" || melo.audio.loading}
            playing={melo.audio.playing}
            greet={() => melo.setExpression("wink")}
          />
          <p>{prompt ? "这一首，接住你了吗？" : hint}</p>
          {prompt ? (
            <div className="dock-actions">
              <button
                disabled={!!melo.busy}
                onClick={() => {
                  if (!melo.liked) void melo.favorite();
                  setPrompt(false);
                  setOpen(true);
                }}
              >
                ♡ 很喜欢
              </button>
              <button onClick={() => setFeedback(true)}>差一点感觉</button>
              <button
                onClick={() => {
                  melo.changeDirection("warm");
                  setPrompt(false);
                }}
              >
                换一种
              </button>
            </div>
          ) : (
            <div className="dock-actions">
              <a href="#chat">和我聊聊 ↗</a>
              <button onClick={() => setFeedback(!feedback)}>换一种音乐</button>
              <a href="#emotion">看看今天的心情</a>
              <button onClick={() => melo.setNowPlaying(true)}>
                回到正在播放
              </button>
            </div>
          )}
          {feedback && (
            <div className="dock-directions">
              {(
                [
                  ["quiet", "更安静"],
                  ["warm", "更温暖"],
                  ["energy", "更有力量"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    melo.changeDirection(id);
                    setFeedback(false);
                    setPrompt(false);
                    setOpen(true);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <button
            className="dock-collapse"
            onClick={() => {
              setOpen(false);
              setPrompt(false);
            }}
          >
            收起，安静陪着
          </button>
        </div>
      )}
    </aside>
  );
}
