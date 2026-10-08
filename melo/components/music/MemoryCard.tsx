"use client";
import { useState } from "react";
import { findTrack } from "../../data/music/catalog";
import { recordTrack } from "../../lib/music/recommendation";
import { moodNames, type MeloRecord } from "../../data/experience";
export function MemoryCard({ event: e }: { event: MeloRecord }) {
  const [message, setMessage] = useState("");
  const t = findTrack(recordTrack(e)),
    date = new Date(e.payload.momentAt || e.createdAt).toLocaleDateString(
      "zh-CN",
    );
  const route = e.payload.journey;
  const text = `MELO MEMORY\n${date}\n${e.payload.text || e.payload.content}\n${route ? `${moodNames[route.from] || "此刻"} → ${route.targetLabel} · ${route.steps.length} TRACKS` : moodNames[e.payload.mood || "calm"]} · ${t?.title || "晚风"}\n${e.payload.reason || "留给自己的一个音乐瞬间。"}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("已复制记忆文案");
    } catch {
      setMessage("请选中下面文案复制");
    }
  }
  async function save() {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const c = canvas.getContext("2d")!;
      const g = c.createLinearGradient(0, 0, 1080, 1350);
      g.addColorStop(0, t?.color || "#637e8d");
      g.addColorStop(1, "#112b29");
      c.fillStyle = g;
      c.fillRect(0, 0, 1080, 1350);
      c.fillStyle = "#c8ff32";
      c.font = "26px Inter,sans-serif";
      c.fillText("MELO / MEMORY", 80, 105);
      c.fillStyle = "#eef7ed";
      c.font = "52px Inter,Microsoft YaHei,sans-serif";
      c.fillText(date, 80, 215);
      if (t) {
        const img = new Image();
        img.src = t.cover;
        await img.decode();
        c.drawImage(img, 560, 270, 440, 440);
      }
      c.font = "40px Microsoft YaHei,sans-serif";
      const words = Array.from(
        e.payload.text || e.payload.content || "这个瞬间，我选择听听自己。",
      );
      for (let i = 0; i < Math.min(120, words.length); i += 20)
        c.fillText(
          words.slice(i, i + 20).join(""),
          80,
          810 + Math.floor(i / 20) * 58,
        );
      c.font = "28px Microsoft YaHei,sans-serif";
      c.fillText(
        `${moodNames[e.payload.mood || "calm"]} · ♫ ${t?.title || "晚风"}`,
        80,
        1220,
      );
      const blob = await new Promise<Blob | null>((r) =>
        canvas.toBlob(r, "image/png"),
      );
      if (!blob) throw Error();
      const u = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = u;
      a.download = `Melo-Memory-${e.id.replace(/[^\w-]/g, "").slice(0, 30)}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(u), 5000);
      setMessage("记忆封面已生成");
    } catch {
      setMessage("图片暂时无法生成，可以复制记忆文案。");
    }
  }
  return (
    <div className="memory-card-actions">
      <button onClick={() => void copy()}>复制记忆</button>
      <button onClick={() => void save()}>保存记忆封面</button>
      {message && <small role="status">{message}</small>}
      {message.includes("选中") && (
        <textarea aria-label="记忆文案" readOnly value={text} />
      )}
    </div>
  );
}
