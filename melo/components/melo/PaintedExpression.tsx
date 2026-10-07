"use client";
import {useId} from 'react';
import {expressions,type Expression} from '../../data/expressions';
export function PaintedExpression({expression,blink=false,reduced=false,thumbnail=false}:{expression:Expression;blink?:boolean;reduced?:boolean;thumbnail?:boolean}){
 const clip=useId().replace(/:/g,'')+'-face';
 const index=expressions.find(e=>e.id===expression)?.spriteIndex ?? 0;
 const tile=443.5;
 const x=(index%4)*tile,y=Math.floor(index/4)*tile;
 const eyeIndex=blink?7:index;
 const eyeX=(eyeIndex%4)*tile,eyeY=Math.floor(eyeIndex/4)*tile;
 return <svg className={thumbnail?'painted-thumbnail':'painted-expression'} data-expression={expression} data-reduced={reduced} viewBox="0 0 443.5 443.5" aria-hidden="true">
  <defs>
   <clipPath id={clip}><rect width="443.5" height="443.5"/></clipPath>
   <clipPath id={`${clip}-eyes`}><ellipse cx="208" cy="311" rx="34" ry="25" transform="rotate(-23 208 311)"/><ellipse cx="295" cy="268" rx="35" ry="25" transform="rotate(-23 295 268)"/></clipPath>
   <clipPath id={`${clip}-mouth`}><ellipse cx="273" cy="343" rx="25" ry="23" transform="rotate(-23 273 343)"/></clipPath>
  </defs>
  {thumbnail?<g clipPath={`url(#${clip})`}>
   <image href="/mascot/painted-heads.webp" width="1774" height="887" x={-x} y={-y}/>
  </g>:<>
   <g clipPath={`url(#${clip}-eyes)`}><image href="/mascot/painted-heads.webp" width="1774" height="887" x={-eyeX} y={-eyeY}/></g>
   <g clipPath={`url(#${clip}-mouth)`}><image href="/mascot/painted-heads.webp" width="1774" height="887" x={-x} y={-y}/></g>
  </>}
 </svg>;
}
