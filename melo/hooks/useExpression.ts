"use client";
import { useSyncExternalStore } from 'react';
import { expressions, type Expression } from '../data/expressions';
let current:Expression='wink';
const listeners=new Set<()=>void>();
function subscribe(fn:()=>void){listeners.add(fn);return ()=>{listeners.delete(fn);};}
function setExpression(next:Expression){if(!expressions.some(e=>e.id===next)||current===next)return;current=next;listeners.forEach(fn=>fn());}
export function useExpression(initial: Expression = 'wink') {
  const expression=useSyncExternalStore(subscribe,()=>current,()=>initial);
  return { expression, setExpression };
}
