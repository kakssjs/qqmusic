"use client";
import { useEffect,useRef,useState,type ReactNode } from 'react';
export function LateMount({id,children}:{id:string;children:ReactNode}){
  const [ready,setReady]=useState(false),ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setReady(true);observer.disconnect();}},{rootMargin:'1000px'});if(ref.current)observer.observe(ref.current);return ()=>observer.disconnect();},[]);
  return <div ref={ref} id={id} className="late-section" style={{minHeight:ready?undefined:600}} data-mounted={ready}>{ready?children:<p className="late-placeholder">Melo 的下一段声音，等你慢慢走近。</p>}</div>;
}
