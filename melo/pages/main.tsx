import React,{useEffect,useState} from 'react';
import { createRoot } from 'react-dom/client';
import MeloExperience from '../components/melo/live/MeloExperience';
import '../app/globals.css';
import './pages.css';
import {backendAddress} from './local-api';
function Notice(){const [cloud,setCloud]=useState(false);useEffect(()=>{backendAddress().then(base=>setCloud(!!base)).catch(()=>{});},[]);return <aside className="pages-notice">{cloud?'Melo · 阿里云音乐记忆':'Melo 网页版 · 记忆保存在此浏览器'} {!cloud&&<a href="https://melo-emotional-music.guo79107.chatgpt.site/#chat" target="_blank" rel="noopener noreferrer">AI 完整在线版 ↗</a>}</aside>;}
createRoot(document.getElementById('root')!).render(<><MeloExperience /><Notice /></>);
