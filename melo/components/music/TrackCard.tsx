"use client";
import { Play, ArrowUpRight } from 'lucide-react';
import type { Track } from '../../data/music/catalog';
import type { LiveMelo } from '../melo/live/useLiveMelo';
export function TrackCard({track:t,melo,reason}:{track:Track;melo:LiveMelo;reason?:string}) {
  const official=t.source==='qq-music';
  return <article className="award-track" data-track-id={t.id} data-source={t.source}>
    <div className="award-cover"><img src={t.cover} alt={`${t.title} · Melo 氛围封面`} loading="lazy" width="640" height="640"/>
    {official?<a href={t.officialUrl} target="_blank" rel="noopener noreferrer" aria-label={`在 QQ 音乐中打开 ${t.title}`}><ArrowUpRight size={22}/></a>:<button onClick={()=>melo.playQueue([t.id,...melo.recommendations.filter(x=>x.id!==t.id).map(x=>x.id)])} aria-label={`播放 ${t.title}`}><Play size={20} fill="currentColor"/></button>}</div>
    <small>{official?'QQ MUSIC · 官方搜索':'MELO ORIGINAL · 1:30'}</small><h3>{t.title}</h3><p className="track-artist">{t.artist}</p><p className="track-reason">{reason||t.reason}</p>
    {official&&<a className="official-link" href={t.officialUrl} target="_blank" rel="noopener noreferrer">在 QQ 音乐中打开 ↗</a>}
  </article>;
}
