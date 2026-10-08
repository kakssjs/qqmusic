"use client";
import { useState } from "react";
import { personality, moodNames } from "../../../data/experience";
import { PaintedExpression } from "../PaintedExpression";
import type { LiveMelo } from "./useLiveMelo";
export function PersonalityPanel({ melo }: { melo: LiveMelo }) {
  const p = personality(melo.records);
  return (
    <div className="music-personality">
      <span className="world-label">YOUR MUSIC PERSONALITY · 你的音乐人格</span>
      <h3>{p.title}</h3>
      <p>{p.caption}</p>
      <dl>
        <div>
          <dt>常出现的情绪</dt>
          <dd>{p.dominant}</dd>
        </div>
        <div>
          <dt>偏爱的音乐能量</dt>
          <dd>{p.energy}</dd>
        </div>
        <div>
          <dt>听歌时间</dt>
          <dd>{p.time}</dd>
        </div>
        <div>
          <dt>你的生活关键词</dt>
          <dd>{p.keywords.join(" · ") || "等你留下更多瞬间"}</dd>
        </div>
      </dl>
      <small>基于实际记录的初步观察，不是固定的人格标签。</small>
    </div>
  );
}
export function CompanionExtras({ melo }: { melo: LiveMelo }) {
  const p = personality(melo.records),
    [copied, setCopied] = useState(""),
    [generated, setGenerated] = useState(false);
  const date = new Date().toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    }),
    line =
      melo.mood === "bright"
        ? "把这一点光，留给下一段旋律。"
        : "今天不用证明什么，先让耳朵休息一下。";
  const text = `TODAY WITH MELO\n${date} · ${moodNames[melo.mood]}\n今日音乐：《${melo.audio.song.name}》\n${line}${melo.demo ? "\n预设演示模式" : ""}`;
  async function download() {
    const c = document.createElement("canvas");
    c.width = 1080;
    c.height = 1350;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const g = ctx.createLinearGradient(0, 0, 1080, 1350);
    g.addColorStop(0, "#486275");
    g.addColorStop(1, "#07110d");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1350);
    ctx.strokeStyle = "#c8ff3240";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(900, 320, 160 + i * 50, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#c8ff32";
    ctx.font = "24px Inter, sans-serif";
    ctx.fillText("TODAY WITH MELO", 80, 100);
    ctx.fillStyle = "#f2f7f4";
    ctx.font = "72px Inter, Microsoft YaHei, sans-serif";
    ctx.fillText(date, 80, 220);
    ctx.font = "bold 60px Microsoft YaHei, sans-serif";
    ctx.fillText(
      melo.mood === "bright" ? "让好心情，再亮一点。" : "慢一点，也没关系。",
      80,
      710,
    );
    ctx.font = "32px Microsoft YaHei, sans-serif";
    ctx.fillText(`今日状态 · ${moodNames[melo.mood]}`, 80, 820);
    ctx.fillText(`今日音乐 · ${melo.audio.song.name}`, 80, 885);
    ctx.font = "26px Microsoft YaHei, sans-serif";
    ctx.fillText(line, 80, 1000);
    ctx.fillStyle = "#bfd2c6";
    ctx.fillText(
      melo.demo ? "Melo · 预设演示" : "Melo · 你的真实音乐瞬间",
      80,
      1200,
    );
    try {
      const img = new Image();
      img.src =
        document.querySelector<HTMLImageElement>(".canonical-character-art")
          ?.src || "/mascot/melo-reference-cutout.webp";
      await img.decode();
      ctx.drawImage(img, 550, 220, 420, 630);
    } catch {
      /* Text card remains downloadable if the illustration cannot load. */
    }
    const blob = await new Promise<Blob | null>((r) =>
      c.toBlob(r, "image/png"),
    );
    if (!blob) return;
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `Melo-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setGenerated(true);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("文案已复制");
    } catch {
      setCopied("浏览器没有授予复制权限，请选中下面的文案复制。");
    }
  }
  return (
    <section className="world-section companion-extras" id="daily">
      <div className="week-with-melo">
        <span className="world-label">THIS WEEK WITH MELO</span>
        <h3>本周，我们一起。</h3>
        <div className="week-words">
          <p>
            <small>你留下的状态</small>
            <strong>
              {p.weekMoments.length
                ? `${moodNames[p.weekMoments.at(-1)?.payload.mood || "calm"]} → ${moodNames[p.weekMoments[0].payload.mood || "calm"]}`
                : "还在等你的第一个瞬间"}
            </strong>
          </p>
          <p>
            <small>实际聆听片段</small>
            <strong>{p.weekListens.length} 段</strong>
          </p>
          <p>
            <small>你正在收藏的方向</small>
            <strong>{p.energy}</strong>
          </p>
        </div>
        <p>
          {p.weekMoments.length
            ? "你愿意停下来听听自己，这件事已经值得被记住。"
            : "每一次真实聊天和聆听，都会让这里长出新的内容。"}
        </p>
      </div>
      <div className="daily-sign">
        <div>
          <span className="world-label">TODAY WITH MELO</span>
          <h3>把今天，留成一张音乐签。</h3>
          <p>由你此刻的心情和歌曲生成，带走一小段属于你的旋律。</p>
          <button
            className="world-text-button"
            onClick={() => setGenerated(true)}
          >
            生成我的音乐签 ↗
          </button>
        </div>
        <article className={`music-sign ${generated ? "is-generated" : ""}`}>
          <span>
            {date} · {melo.demo ? "预设演示" : moodNames[melo.mood]}
          </span>
          <PaintedExpression
            expression={melo.expression}
            reduced={melo.reduced}
            thumbnail
          />
          <h4>
            {melo.mood === "bright"
              ? "让好心情，再亮一点。"
              : "慢一点，也没关系。"}
          </h4>
          <p>今日音乐 · 《{melo.audio.song.name}》</p>
          <p>{line}</p>
          <div>
            <button onClick={() => void download()}>下载音乐签</button>
            <button onClick={() => void copy()}>复制音乐签文案</button>
          </div>
          {copied && <p role="status">{copied}</p>}
          {copied.includes("权限") && (
            <textarea readOnly aria-label="音乐签文案" value={text} />
          )}
        </article>
      </div>

    </section>
  );
}
