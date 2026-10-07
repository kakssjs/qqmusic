"use client";
import { useCallback, useState } from 'react';
import { ArrowUpRight, Play, Pause, Headphones } from 'lucide-react';
import type { LiveMelo } from './live/useLiveMelo';
import { MeloScene } from './MeloScene';
import { ExpressionPicker } from './ExpressionPicker';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { CloudBackground } from './CloudBackground';
export function MeloHero({ melo, reduced = false }: { melo: LiveMelo; reduced?: boolean }) {
  const systemReduced = useReducedMotion();
  const noMotion = reduced || systemReduced;
  const [picker, setPicker] = useState(false);
  const close = useCallback(() => { setPicker(false); document.getElementById('mood-trigger')?.focus({ preventScroll: true }); }, []);
  return <section id="home" className="character-hero cloud-hero" data-reduced={noMotion}>
    <CloudBackground reduced={noMotion}/>
    <div className="character-hero-layout">
      <div className="character-copy">
        <p className="character-kicker">MEET YOUR MUSIC COMPANION</p>
        <h1 className="cloud-title">Melo</h1>
        <p className="cloud-subtitle">AI音乐陪伴伙伴</p>
        <h2 className="cloud-statement">让音乐听懂你的情绪。</h2>
        <p className="character-description">有时候，你需要的不是一首歌，<br/>而是一位懂你的朋友。</p>
        <div className="character-actions"><a href="#chat" className="character-primary" onClick={() => melo.setExpression('calm')}>开始和 Melo 聊聊 <ArrowUpRight size={19}/></a><button id="mood-trigger" className="character-secondary" aria-expanded={picker} aria-controls={picker?'expression-picker':undefined} onClick={() => setPicker(!picker)}>看看 Melo 的心情 ✦</button></div>
        <div className="character-player"><button aria-label={melo.audio.playing?'暂停陪伴音乐':'播放陪伴音乐'} onClick={() => melo.audio.toggle()}>{melo.audio.playing?<Pause size={17}/>:<Play size={17}/>}</button><div><span>{melo.audio.playing?'正在陪你听':'给今天，一点旋律'}</span><strong>{melo.audio.song.name} <small>原创氛围音乐</small></strong></div><Headphones size={19}/></div>
        {melo.audio.error && <p role="alert">{melo.audio.error}</p>}
      </div>
      <div className="character-stage"><MeloScene expression={melo.expression} setExpression={melo.setExpression} reduced={noMotion}/>{picker && <ExpressionPicker expression={melo.expression} setExpression={melo.setExpression} close={close} reduced={noMotion}/>}</div>
    </div>
  </section>;
}
