"use client";
import { findTrack } from '../../data/music/catalog';
import { recordTrack } from '../../lib/music/recommendation';
import { uniqueMoments } from '../../data/experience';
import type { LiveMelo } from '../melo/live/useLiveMelo';
export function MyMelo({melo}:{melo:LiveMelo}) {
  const moments=uniqueMoments(melo.records).filter(e=>e.type==='checkin').slice(0,3);
  return <section className="world-section my-melo"><div className="world-section-meta"><span>MY MELO</span><span>属于你的音乐小空间</span></div><div className="my-melo-grid"><article><h3>♡ 收藏的歌</h3>{melo.preferences.likedTracks.length?melo.preferences.likedTracks.map(id=>{const t=findTrack(id);return t&&<button key={id} onClick={()=>melo.playQueue([id,...melo.preferences.likedTracks.filter(x=>x!==id)])}><img src={t.cover} alt="" width="40" height="40" loading="lazy"/><span>{t.title}<small>{t.artist}</small></span><b>↗</b></button>;}):<p>听到喜欢的声音，点亮一颗心。这里会从那一首开始。</p>}</article><article><h3>收藏的 Melo Mix</h3>{melo.likedMixes.length?melo.likedMixes.map(p=><button key={p.id} onClick={()=>melo.playQueue(p.tracks)}><span>{p.subtitle}<small>{new Date(p.generatedAt).toLocaleDateString()} · 六首原创声音</small></span><b>↗</b></button>):<p>把今天的六首陪伴，一起留下。</p>}</article><article><h3>最近听过</h3>{melo.preferences.recentTracks.length?melo.preferences.recentTracks.slice(0,5).map(id=><button key={id} onClick={()=>melo.playQueue([id])}><span>{findTrack(id)?.title||id}<small>来自真实聆听记录</small></span><b>↗</b></button>):<p>开始播放十秒后，第一段实际聆听会出现在这里。</p>}</article><article><h3>重要 Memory</h3>{moments.length?moments.map(e=><button key={e.id} onClick={()=>melo.replay(e)}><span>{e.payload.text}<small>{findTrack(recordTrack(e))?.title} · 再听一次</small></span><b>✦</b></button>):<p>分享一句现在的感受，留下第一颗音乐记忆。</p>}</article></div></section>;
}
