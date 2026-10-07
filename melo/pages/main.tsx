import React from 'react';
import { createRoot } from 'react-dom/client';
import MeloExperience from '../components/melo/live/MeloExperience';
import '../app/globals.css';
import './pages.css';
createRoot(document.getElementById('root')!).render(<><MeloExperience /><aside className="pages-notice">GitHub 网页版 · 记忆保存在此浏览器 <a href="https://melo-emotional-music.guo79107.chatgpt.site/#chat" target="_blank" rel="noopener noreferrer">AI 完整在线版 ↗</a></aside></>);
