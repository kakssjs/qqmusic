"use client";
import { journeyTargets } from "../../lib/music/mood-journey";
import type { LiveMelo } from "../melo/live/useLiveMelo";
import { EmotionCurve } from "./EmotionCurve";
import { CharacterPresence } from "../melo/CharacterPresence";
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
  const route = melo.moodJourney;
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
          <p className="world-label">LET THE MUSIC TAKE YOU THERE</p>
          <h2 className="world-title">
            不用马上振作。
            <br />
            我们<span>慢慢走过去。</span>
          </h2>
        </div>
        <p>
          听完音乐之后，
          <br />
          你希望更接近哪一种状态？
        </p>
      </div>
      <JourneyGoals melo={melo} />
      {route ? (
        <>
          <p className="route-source">
            {melo.demo
              ? "当前状态来自预设演示"
              : route.source === "ai-signals"
                ? "当前状态来自 AI 分析"
                : "当前状态来自你的选择与表达"}{" "}
            · 由音乐标签安排渐进路线
          </p>
          <EmotionCurve melo={melo} />
          <div className="route-actions">
            <button className="world-button" onClick={() => melo.playJourney()}>
              一起听这条路线 ↗
            </button>
            <button
              className="world-text-button"
              onClick={melo.regenerateJourney}
            >
              换一种路线 ↗
            </button>
            <span>
              {Math.floor(melo.journeySeconds)} 秒真实聆听 ·{" "}
              {route.steps.length} TRACKS
            </span>
          </div>
          <div className="journey-feedback" aria-live="polite">
            {route.outcome === "better" ? (
              <>
                <p className="world-label">A MOMENT TO KEEP</p>
                <h3>你说“好多了”。我记住了。</h3>
                <p>这段音乐和你亲自确认的感受，已经成为一颗记忆。</p>
                <a href="#memory" className="world-text-button">
                  看看这颗记忆 ↗
                </a>
              </>
            ) : (
              <>
                <h3>现在，更接近你想去的状态了吗？</h3>
                <p>
                  {melo.journeySeconds < 25
                    ? "一起听满 25 秒，再留下自己的感受。"
                    : "没有标准答案，只有你此刻的感受。"}
                </p>
                <div className="feedback-actions">
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
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="route-empty">
          <CharacterPresence melo={melo} />
          <div>
            <svg viewBox="0 0 700 180" aria-hidden="true">
              <path d="M0 150 C100 150 130 90 240 105 S400 40 510 55 S600 10 700 10" />
              {[
                [0, 150],
                [240, 105],
                [510, 55],
                [700, 10],
              ].map(([x, y]) => (
                <circle key={x} cx={x} cy={y} r="5" />
              ))}
            </svg>
            <h3>此刻的你，不用一步到位。</h3>
            <p>
              选一个想靠近的方向，
              <br />
              Melo 用四首真实的声音，陪你走一小段。
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
