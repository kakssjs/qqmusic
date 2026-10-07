export function MusicWave({ active, reduced = false }: { active: boolean; reduced?: boolean }) {
  return <div className={`character-wave ${active ? 'active' : ''} ${reduced ? 'still' : ''}`} aria-hidden="true">{Array.from({ length: 25 }, (_,i) => <i key={i} style={{ height: `${(8+Math.sin(i*.75)**2*22).toFixed(2)}px`, animationDelay: `${(i*.065).toFixed(3)}s` }}/>)}</div>;
}
