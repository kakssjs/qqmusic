"use client";
import type { Expression } from '../../data/expressions';
import { expressions } from '../../data/expressions';
import { MeloCharacter } from './MeloCharacter';
import { MusicWave } from './MusicWave';
import { MusicCompanion } from './MusicCompanion';
export function MeloScene({ expression, setExpression, reduced, busy = false }: { expression: Expression; setExpression: (e: Expression) => void; reduced: boolean; busy?: boolean }) {
  return <div className="melo-scene" data-reduced={reduced} data-expression={expression}>
    <div className="scene-halo"/><div className="scene-orbit orbit-one"/><div className="scene-orbit orbit-two"/>
    <span className="scene-type" aria-hidden="true">MELO</span>
    <div className="scene-caption"><i/> MUSIC IS MY LOVE LANGUAGE <span>{String(expressions.findIndex(e=>e.id===expression)+1).padStart(2,'0')} / 07</span></div>
    <div className="scene-note note-one" aria-hidden="true">♫</div><div className="scene-note note-two" aria-hidden="true">♪</div>
    <MeloCharacter expression={expression} setExpression={setExpression} reduced={reduced} busy={busy}/>
    <svg className="cloud-music-ribbons" viewBox="0 0 700 700" aria-hidden="true"><defs><filter id="ribbon-glow"><feGaussianBlur stdDeviation="3"/></filter></defs><g fill="none" stroke="#d2fff0" strokeWidth="2"><path d="M40 540 C230 620 650 375 560 310 C490 270 315 352 370 420 C420 475 610 470 625 365"/><path d="M50 550 C200 610 605 392 570 345 C520 298 300 373 380 437" opacity=".5"/></g><path d="M40 540 C230 620 650 375 560 310 C490 270 315 352 370 420" fill="none" stroke="#a6ffe2" strokeWidth="8" opacity=".4" filter="url(#ribbon-glow)"/></svg>
    <div className="scene-platform"><span/><span/></div>
    <MusicCompanion working={busy} playing={expression==='listen'} reduced={reduced} greet={()=>setExpression('wink')}/>
    <div className="melo-speech" aria-live="polite"><span>MELO / 音音</span><p>{expressions.find(e=>e.id===expression)?.line}</p></div>
    <div className="scene-status"><MusicWave active={expression==='listen'} reduced={reduced}/><span>{expressions.find(e=>e.id===expression)?.label} · {expression.toUpperCase()}</span></div>
    {expression==='love' && <div className="scene-love" aria-hidden="true">♡ <span>♡</span> ♡</div>}
    {expression==='surprise' && <div className="scene-surprise" aria-hidden="true">✦ <span>♫</span> ✧</div>}
  </div>;
}
