"use client";
import { motion } from 'framer-motion';
import { useId } from 'react';
import type { Expression } from '../../data/expressions';
type Props = { expression: Expression; blink?: boolean; gaze?: { x: number; y: number }; reduced?: boolean };
// Normalized 200 × 150 face coordinates; same features power the character and thumbnails.
export function MeloFace({ expression, blink = false, gaze = { x: 0, y: 0 }, reduced = false }: Props) {
  const uid = useId().replace(/:/g, '');
  const closed = expression === 'listen' || blink;
  const soft = expression === 'calm' || expression === 'care';
  const surprise = expression === 'surprise';
  const eyes = surprise ? 23 : soft ? 15 : 20;
  const transition = { duration: reduced ? 0.16 : 0.45, ease: 'easeInOut' as const };
  const mouth = surprise ? 'M91 112 Q100 100 109 112 Q113 136 100 137 Q87 136 91 112 Z' : expression === 'happy' || expression === 'wink' || expression === 'love' ? 'M80 113 Q100 122 120 111 Q113 139 100 136 Q87 137 80 113 Z' : 'M88 117 Q100 125 112 117 Q100 129 88 117 Z';
  return <svg viewBox="0 0 200 150" className="melo-face" aria-hidden="true">
    <defs><linearGradient id={`${uid}iris`} x2="0" y2="1"><stop stopColor="#143c2b"/><stop offset=".65" stopColor="#6eb739"/><stop offset="1" stopColor="#d6f399"/></linearGradient></defs>
    {[56,144].map((x, i) => {
      const shut = closed || (expression === 'wink' && i === 1);
      const brow = expression === 'care' ? (i ? 'M126 36 Q143 31 158 44' : 'M40 44 Q57 31 74 36') : surprise ? (i ? 'M125 25 Q142 15 160 25' : 'M39 25 Q57 15 75 25') : (i ? 'M125 38 Q142 29 159 38' : 'M41 38 Q57 29 75 38');
      return <g key={x}>
        <motion.path animate={{ d: brow }} transition={transition} stroke="#73836b" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <motion.g animate={{ opacity: shut ? 0 : 1, scaleY: shut ? 0.06 : 1 }} transition={transition} style={{ transformOrigin: `${x}px 70px` }}>
          <motion.ellipse cx={x} cy="72" rx="23" animate={{ ry: eyes + 3 }} transition={transition} fill="#fffdf6"/>
          <motion.g animate={{ x: gaze.x * 2, y: gaze.y * 1.5 }} transition={{ duration: .25 }}>
            <motion.ellipse cx={x} cy="73" rx="15.5" animate={{ ry: eyes }} transition={transition} fill={`url(#${uid}iris)`}/>
            <ellipse cx={x} cy="71" rx="7" ry="12" fill="#13291c"/>
            <ellipse cx={x - 5} cy="63" rx="5.5" ry="6.5" fill="white"/><circle cx={x+7} cy="78" r="2.7" fill="#eaffe6"/>
          </motion.g>
          <motion.path animate={{ d: soft ? `M${x-24} 67 Q${x} 50 ${x+24} 66` : `M${x-24} 65 Q${x} ${surprise?39:43} ${x+24} 63` }} transition={transition} stroke="#253529" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <path d={`M${x-20} 60 l-6 -6 M${x+20} 60 l5 -5`} stroke="#253529" strokeWidth="3" strokeLinecap="round"/>
        </motion.g>
        <motion.path d={`M${x-21} 70 Q${x} 88 ${x+21} 69`} animate={{ opacity: shut ? 1 : 0 }} transition={transition} stroke="#253529" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
      </g>;
    })}
    <motion.g animate={{ opacity: expression === 'love' ? .65 : .22 }} transition={transition} fill="#e6a193"><ellipse cx="34" cy="101" rx="19" ry="8"/><ellipse cx="166" cy="101" rx="19" ry="8"/></motion.g>
    <motion.path animate={{ d: mouth, fill: soft || closed ? '#b57366' : '#83443e' }} transition={transition}/>
    <motion.path d="M91 126 Q101 121 110 127 Q101 136 91 126" fill="#f4b2a7" animate={{ opacity: soft || closed || surprise ? 0 : 1 }} transition={transition}/>
  </svg>;
}
