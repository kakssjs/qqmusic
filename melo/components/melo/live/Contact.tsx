"use client";
import { QQMusicIcon } from "../QQMusicIcon";
import { CharacterPresence } from "../CharacterPresence";
import type { LiveMelo } from "./useLiveMelo";
export function Contact({ melo }: { melo: LiveMelo }) {
  return (
    <>
      <section
        className="world-section music-ecosystem"
        aria-label="Melo 与音乐生态"
      >
        <p className="world-label">MELO × MUSIC</p>
        <h2>
          音乐已经在那里。
          <br />
          Melo 带你找到<span>此刻的入口。</span>
        </h2>
        <div>
          <span>AI 理解</span>
          <i>+</i>
          <span>音乐路径</span>
          <i>+</i>
          <span>长期记忆</span>
        </div>
        <p>
          从此刻的感受出发，让音乐在这里陪你。
          <br />
          Melo 陪你找到声音，也记住声音背后的你。
        </p>
      </section>
      <section id="ending" className="world-section ending-section">
        <div className="ending-aura" aria-hidden="true" />
        <CharacterPresence
          melo={{ ...melo, expression: melo.audio.playing ? "listen" : "calm" }}
          className="ending-portrait"
        />
        <div className="ending-copy">
          <p className="world-label">ALWAYS A LITTLE CLOSER</p>
          <h2 className="world-title">
            下一首歌，
            <br />
            <span>我们一起听。</span>
          </h2>
          <div className="world-actions">
            <a href="#chat" className="world-button">
              Talk to Melo ↗
            </a>
            <a
              href="#mood-journey"
              className="world-text-button"
              onClick={melo.newJourney}
            >
              Start a new Journey ↗
            </a>
          </div>
          <p>Melo · Your AI Music Companion</p>
        </div>
      </section>
      <footer className="world-footer">
        <a href="#home" className="wordmark">
          melo <QQMusicIcon />
        </a>
        <span>让音乐听懂你的情绪。</span>
        <small>© 2026 Melo</small>
        <a href="#home">回到最初 ↑</a>
      </footer>
    </>
  );
}
