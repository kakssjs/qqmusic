import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import MeloExperience from "../components/melo/live/MeloExperience";
import { backendAddress } from "./local-api";
import { demoEnabled } from '../data/demo';
import "../app/globals.css";
import "./pages.css";

type StorageNotice = "checking" | "cloud" | "browser" | "unavailable";

function Notice() {
  const [mode, setMode] = useState<StorageNotice>("checking");

  useEffect(() => {
    let active = true;
    void backendAddress()
      .then((base) => {
        if (active) setMode(base ? "cloud" : "browser");
      })
      .catch(() => {
        if (active) setMode("unavailable");
      });


  return () => {
      active = false;
    };
  }, []);

  if(demoEnabled())return <aside className="pages-notice">Melo · 预设演示 · 记录独立保存在此浏览器</aside>;
  return (
    <aside className="pages-notice" role="status" aria-live="polite">
      {demoEnabled() && 'Melo · 演示记录只保存在此浏览器 · '}
      {mode === "checking" && "Melo · 正在确认记忆存储方式"}
      {mode === "cloud" && "Melo · 云端记忆已配置"}
      {mode === "browser" && "Melo 网页版 · 记忆保存在此浏览器"}
      {mode === "unavailable" && "Melo · 暂时无法确认记忆存储方式"}
      {mode === "browser" && (
        <a
          href="https://melo-emotional-music.guo79107.chatgpt.site/#chat"
          target="_blank"
          rel="noopener noreferrer"
        >
          AI 完整在线版 ↗
        </a>
      )}
      {mode === "unavailable" && (
        <button type="button" onClick={() => window.location.reload()}>
          重试
        </button>
      )}
    </aside>
  );
}

createRoot(document.getElementById("root")!).render(
  <>
    <MeloExperience />
    <Notice />
  </>,
);
