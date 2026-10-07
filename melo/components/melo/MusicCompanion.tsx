"use client";
import {useEffect,useState} from 'react';
export function MusicCompanion({playing,reduced,greet}:{playing:boolean;reduced:boolean;greet:()=>void}){
 const [excited,setExcited]=useState(false);
 useEffect(()=>{if(!excited)return;const timer=setTimeout(()=>setExcited(false),1600);return()=>clearTimeout(timer);},[excited]);
 return <button className={`music-companion ${playing?'is-listening':''} ${excited?'is-excited':''}`} data-reduced={reduced} aria-label="和音乐精灵打个招呼" onClick={()=>{setExcited(true);greet();}}>
  <div className="bot-leaf"/><div className="bot-face"><i/><span>⌣</span><i/></div><div className="bot-foot"/><span className="bot-spark">✦</span>
 </button>;
}
