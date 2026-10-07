"use client";
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { expressions, type Expression } from '../../data/expressions';
import { MeloIdentityArt } from './MeloIdentityArt';
export function MeloCharacter({ expression, setExpression, reduced = false, busy = false }: { expression: Expression; setExpression: (e: Expression) => void; reduced?: boolean; busy?: boolean }) {
  const [blink, setBlink] = useState(false);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  const root = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => { timer = setTimeout(() => { setBlink(true); timer = setTimeout(() => { setBlink(false); loop(); }, 135); }, 2600 + Math.random() * 3800); };
    loop(); return () => clearTimeout(timer);
  }, [reduced]);
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const b = root.current?.getBoundingClientRect();
        if (b) setGaze({ x: Math.max(-1, Math.min(1, (e.clientX-b.x-b.width/2)/400)), y: Math.max(-1, Math.min(1, (e.clientY-b.y-b.height/3)/400)) });
      });
    };
    const reset = () => setGaze({ x: 0, y: 0 });
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', reset); };
  }, [reduced]);
  const tilt = reduced ? 0 : expression === 'wink' ? -6 : gaze.x * 3;
  const label = expressions.find(item => item.id === expression)?.label ?? '开心';
  return <button ref={root} className={`melo-character ${hover?'is-hovered':''}`} data-expression={expression} data-reduced={reduced} data-busy={busy} data-blinking={!reduced && blink} aria-label={`Melo 当前是${label}表情；点击让她变成俏皮`} onClick={() => setExpression('wink')} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
    <div className="character-float identity-character" style={{ '--head-tilt': `${tilt*.15}deg`, '--head-x': `${reduced?0:gaze.x*1.5}px` } as CSSProperties}>
      <MeloIdentityArt expression={expression} reduced={reduced} busy={busy} blink={blink} alt="Melo 音音，薄荷双丸子头、音符耳机与白绿机能外套，歪头微笑向你伸手。" />
      <img className="character-reflection" src="/mascot/melo-reference-cutout.webp" alt="" aria-hidden="true" draggable="false"/>
      <span className={`love-gesture ${expression==='love'?'visible':''}`} aria-hidden="true">♡</span>
    </div>
  </button>;
}
