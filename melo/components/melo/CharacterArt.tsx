"use client";
import { useId } from 'react';
export function CharacterArt({ part, className = '' }: { part: 'head' | 'body'; className?: string }) {
  const clip = useId().replace(/:/g, '') + '-art-clip';
  return <svg viewBox={part==='head'?'150 0 730 600':'140 584 750 952'} className={className} aria-hidden="true">
    <defs><clipPath id={clip}><rect x="0" y={part==='head'?0:584} width="1024" height={part==='head'?575:952}/></clipPath></defs>
    <image href="/mascot/character-cloud-v2.png" width="1024" height="1536" clipPath={`url(#${clip})`}/>
  </svg>;
}
