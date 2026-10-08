"use client";
import { CharacterPresence } from "../CharacterPresence";
import { ArrowUpRight } from "lucide-react";
import { moods, type LiveMelo } from "./useLiveMelo";
import { JourneyGoals } from "../../music/MoodJourney";
export function EmotionAnalysis({ melo }: { melo: LiveMelo }) {
  return (
    <section id="emotion" className="world-section feel-section">
      <div className="world-section-meta reveal">
        <span>02 / Feel</span>
        <span>每一种心情，都有自己的频率</span>
      </div>
      <div className="feel-layout">
        <div className="feel-copy reveal">
          <h2 className="world-title">
            有些情绪，
            <br />
            不需要你说得<span>很清楚。</span>
          </h2>
          <p className="world-description">
            你不用解释太多，Melo 会慢慢听懂。
            <br />
            从今天的一个小瞬间，找到适合此刻的旋律。
          </p>
          <div className="feeling-input">
            <label htmlFor="live-emotion">此刻，你感觉怎么样？</label>
            <textarea
              id="live-emotion"
              maxLength={1000}
              value={melo.note}
              onChange={(e) => melo.setNote(e.target.value)}
              placeholder="今天有点累，也有一点不甘心……"
            />
          </div>
          <div className="world-actions">
            <button
              className="world-button"
              aria-label="让 Melo 听懂"
              disabled={!!melo.busy || !melo.ready || !melo.note.trim()}
              onClick={() => void melo.analyze()}
            >
              {melo.busy === "emotion" ? "正在听你说…" : "让 Melo 听懂"}
              <ArrowUpRight size={17} />
            </button>
            <button
              className="world-text-button"
              aria-label="记住这一刻"
              disabled={!!melo.busy || !melo.ready}
              onClick={() => void melo.saveMoment()}
            >
              记住这一刻 ↗
            </button>
          </div>
          <div
            className="live-mood-choices"
            role="group"
            aria-label="选择你的情绪"
          >
            {moods.map(([id, label]) => (
              <button
                key={id}
                onClick={() => melo.chooseMood(id)}
                aria-pressed={melo.mood === id}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="world-fineprint">
            也可以自己选择。你的感受，由你定义。
          </p>
          <div className="emotion-insight" aria-live="polite">
            <span className="world-label">此刻的你</span>
            <h3>
              {melo.scores
                ? moods.find(([id]) => id === melo.mood)?.[1]
                : "先听你说，再慢慢理解"}
            </h3>
            {melo.currentMoment && (
              <p>
                {melo.currentMoment.payload.secondary} ·{" "}
                {melo.currentMoment.payload.scene}
              </p>
            )}
            <p>
              {melo.reason ||
                "分享一句现在的感受，Melo 会把理解和音乐连在一起。"}
            </p>
            {melo.scores && (
              <>
                <p className="world-fineprint">
                  这些结果是音乐推荐信号，不是心理健康诊断。
                </p>
                <p className="journey-goal-prompt">
                  听完一段音乐，你希望更接近哪一种状态？
                </p>
                <JourneyGoals melo={melo} />
                <a className="world-text-button" href="#music">
                  先听此刻的推荐 ↗
                </a>
              </>
            )}
          </div>
        </div>
        <div
          className={
            "feeling-space reveal " +
            (melo.busy === "emotion" ? "analyzing" : "")
          }
        >
          <div className="emotion-canvas" aria-label="当前音乐状态">
            <svg viewBox="0 0 500 430" aria-hidden="true">
              <ellipse cx="250" cy="215" rx="208" ry="144" />
              <ellipse cx="250" cy="215" rx="170" ry="188" />
              <path d="M0 225 Q70 180 140 220 T230 215 L248 178 L270 250 L291 195 Q350 240 500 210" />
            </svg>
            <div className="canvas-state">
              <span>CURRENT STATE</span>
              <strong>
                {moods.find(([id]) => id === melo.mood)?.[1] || "此刻"}
              </strong>
              <small>
                {melo.scores
                  ? "AI 分析后，你仍可自己调整"
                  : "由你自己选择的感受"}
              </small>
            </div>
            <span className="canvas-signal signal-energy">
              ENERGY <b>{Math.round(melo.signal.energy ?? 35)}</b>
              <small>当前音乐信号</small>
            </span>
            <span className="canvas-signal signal-warmth">
              WARMTH{" "}
              <b>{melo.audio.song.scenes.includes("healing") ? 80 : 45}</b>
              <small>陪伴歌曲的温暖感</small>
            </span>
            <span className="canvas-signal signal-space">
              SPACE <b>{100 - melo.audio.song.energy}</b>
              <small>陪伴歌曲的留白</small>
            </span>
            <CharacterPresence melo={melo} compact className="feel-character" />
          </div>
          <p className="emotional-state">
            {melo.reason || "每一种心情，都值得被认真听见。"}
          </p>
          <p className="world-fineprint">
            仅用于匹配音乐氛围，随时可以自己调整。
          </p>
        </div>
      </div>
    </section>
  );
}
