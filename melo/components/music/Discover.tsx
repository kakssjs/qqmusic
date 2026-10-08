"use client";
import { useState } from 'react';
import { catalog,findTrack,playableTracks } from '../../data/music/catalog';
import { recommend,differentTracks } from '../../lib/music/recommendation';
import type { LiveMelo } from '../melo/live/useLiveMelo';
import { DiscoverRail } from './DiscoverRail';
export function Discover({melo}:{melo:LiveMelo}) {
  const [query,setQuery]=useState('');
  const rails=[
    {title:'For This Moment',caption:'此刻的状态，值得不止一个答案。',tracks:recommend(melo.signal,6,catalog)},
    {title:'Late Night',caption:'给夜晚留一点声音，给明天留一点空间。',tracks:recommend({mood:'tired',energy:24,scenes:['night'],hour:23},6,catalog)},
    {title:'Because You Loved…',caption:melo.preferences.likedTracks.length?'从你真正收藏的声音，继续向外走。':'还没有收藏。先试听这些声音，喜欢以后这里会跟着你变化。',tracks:recommend({mood:'calm',preferences:melo.preferences},6,catalog)},
    {title:'Try Something Different',caption:melo.preferences.recentTracks.length?'暂时走出最近听过的声音。':'第一次见面，先把不同的声音放在你面前。',tracks:differentTracks(melo.preferences)},
    {title:'Melo Mix',caption:'由慢到亮，再回到柔软。今天的六首陪伴。',tracks:melo.mix.tracks.map(id=>findTrack(id)!)},
  ];
  return <section className="world-section discover-section"><div className="world-section-meta"><span>DISCOVER WITH MELO</span><span>不必知道歌名，也可以找到音乐</span></div><div className="discover-heading"><h2 className="world-title">让 Melo，<br/>带你<span>发现音乐。</span></h2><button className="world-text-button" onClick={melo.surprise}>✦ 惊喜我一下</button></div><form className="music-search" onSubmit={e=>{e.preventDefault();void melo.searchMusic(query);}}><label htmlFor="music-search">让 Melo 帮你找歌</label><div><input id="music-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="想听适合雨天坐公交的……" maxLength={1000}/><button disabled={!query.trim()||melo.searching}>{melo.searching?'正在找声音…':'找一组音乐 ↗'}</button></div><small>{playableTracks.length} 段原创可完整播放；真实歌曲前往 QQ 音乐官方搜索。封面为 Melo 氛围创作。</small></form>{melo.searchStatus&&<p role="status" className="search-status">{melo.searchStatus}</p>}{melo.searchResults.length>0&&<DiscoverRail title="Melo 找到了这些声音" caption={`关于「${query}」的六个答案`} tracks={melo.searchResults} melo={melo}/>}{rails.map(r=><DiscoverRail key={r.title} {...r} melo={melo}/>)}</section>;
}
