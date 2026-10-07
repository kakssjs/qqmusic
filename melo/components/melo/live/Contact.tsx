export function Contact() {
  return (
    <>
      <section id="ending" className="world-section ending-section">
        <div className="ending-aura" aria-hidden="true" />
        <div className="ending-portrait reveal">
          <img
            src="/mascot/melo-reference-cutout.png"
            alt="Melo 向你伸出手，邀请你一起听下一首歌"
            loading="lazy"
          />
        </div>
        <div className="ending-copy reveal">
          <p className="world-label">Always a little closer.</p>
          <h2 className="world-title">
            下一首歌，
            <br />
            <span>我们一起听。</span>
          </h2>
          <a href="#chat" className="world-button">
            和 Melo 聊聊 <span>↗</span>
          </a>
          <p>
            Melo
            <br />
            <span>Your AI Music Companion</span>
          </p>
        </div>
      </section>
      <footer className="world-footer">
        <a href="#home" className="wordmark">
          melo ✳
        </a>
        <span>让音乐听懂你的情绪。</span>
        <small>© 2026 Melo</small>
        <a href="#home">回到最初 ↑</a>
      </footer>
    </>
  );
}
