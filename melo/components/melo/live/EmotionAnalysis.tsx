"use client";
import { QQMusicIcon } from "../QQMusicIcon";
import { ArrowUpRight } from "lucide-react";
import { moods, type LiveMelo } from "./useLiveMelo";
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
            <h3>{melo.scores ? moods.find(([id])=>id===melo.mood)?.[1] : '先听你说，再慢慢理解'}</h3>
            {melo.currentMoment && <p>{melo.currentMoment.payload.secondary} · {melo.currentMoment.payload.scene}</p>}
            <p>{melo.reason || '分享一句现在的感受，Melo 会把理解和音乐连在一起。'}</p>
            {melo.scores && <><p className="world-fineprint">这些结果是音乐推荐信号，不是心理健康诊断。</p><a className="world-text-button" href="#music">所以，Melo 为你选了一组声音 ↗</a></>}
          </div>
        </div>
        <div
          className={
            "feeling-space reveal " +
            (melo.busy === "emotion" ? "analyzing" : "")
          }
        >
          <div className="feeling-rings" aria-hidden="true">
            <i />
            <i />
            <i />
            <div className="feeling-core">{<QQMusicIcon />}</div>
            <svg viewBox="0 0 460 460">
              <path d="M18 230 Q80 205 108 230 T165 230 L187 230 L198 187 L210 278 L223 158 L236 290 L248 204 L260 230 Q299 258 325 230 T442 230" />
            </svg>
          </div>
          <div className="live-scores floating-scores" aria-live="polite">
            {["疲惫", "压力", "需要放松"].map((label, i) => (
              <div className={"floating-score score-" + i} key={label}>
                <strong>
                  {melo.scores ? melo.scores[i] : "—"}
                  <small>{melo.scores ? "%" : ""}</small>
                </strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="music-signal"><span>YOUR MUSIC SIGNAL</span>{[['Energy',melo.signal.energy||35],['Warmth',melo.audio.song.scenes.includes('healing')?80:45],['Tempo',melo.audio.song.energy],['Space',100-melo.audio.song.energy]].map(([label,value])=><div key={label}><small>{label}</small><i style={{width:`${value}%`}}/></div>)}</div>
          <span className="frequency-caption">Your emotional frequency</span>
          <p className="emotional-state">
            {melo.reason || "还没有分析。等你愿意，Melo 会认真听。"}
          </p>
          <p className="world-fineprint">
            仅用于匹配音乐氛围，随时可以自己调整。
          </p>
        </div>
      </div>
    </section>
  );
}
