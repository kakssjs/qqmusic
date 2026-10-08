import { catalog, playableTracks, findTrack, type Playlist, type Track } from '../../data/music/catalog.ts';
import { defaultEnergy } from '../../data/music/moods.ts';
import type { MeloRecord } from '../../data/experience.ts';
export type Preferences = {likedTracks:string[];recentTracks:string[];likedStyles:string[];preferredEnergy:number|null;preferredScenes:string[]};
export type MusicSignal = {mood:string;energy?:number;scenes?:string[];styles?:string[];hour?:number;direction?:'quiet'|'warm'|'energy';preferences?:Preferences};
export const recordTrack=(r:MeloRecord)=>r.payload.catalogTrackId||r.payload.track||r.payload.mood||'calm';
export function preferencesFromRecords(records:MeloRecord[]):Preferences {
  const sorted=[...records].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
  const likes=new Map<string,boolean>();
  for(const e of sorted.filter(e=>e.type==='favorite'&&!e.payload.mix)) {const id=recordTrack(e);if(!likes.has(id))likes.set(id,e.payload.liked!==false);}
  const likedTracks=[...likes].filter(([,v])=>v).map(([id])=>id), liked=likedTracks.map(findTrack).filter(Boolean) as Track[];
  const recentTracks=[...new Set(sorted.filter(e=>e.type==='listening'&&e.payload.track).map(recordTrack))].slice(0,12);
  return {likedTracks,recentTracks,likedStyles:[...new Set(liked.flatMap(t=>t.styles))],preferredEnergy:liked.length?Math.round(liked.reduce((a,t)=>a+t.energy,0)/liked.length):null,preferredScenes:[...new Set(liked.flatMap(t=>t.scenes))]};
}
export function parseIntent(text:string,aiMood='calm',values?:number[]) {
  const mood=/专注|作业|学习|工作/.test(text)?'focus':/开心|好心情|有节奏|运动/.test(text)?'bright':/累|疲惫/.test(text)?'tired':/失落|失败|难过/.test(text)?'sad':aiMood;
  const scenes=[/雨/.test(text)?'rain':'',/公交|通勤|地铁/.test(text)?'commute':'',/作业|学习/.test(text)?'study':'',/夜|不想睡|凌晨/.test(text)?'night':'',/一个人|孤独/.test(text)?'lonely':'',/焦虑|紧张/.test(text)?'anxious':'',/治愈|温暖/.test(text)?'healing':'',/运动|跑步/.test(text)?'energy':'',/工作/.test(text)?'work':''].filter(Boolean);
  const styles=[/钢琴/.test(text)?'piano':'',/电子/.test(text)?'electronic':'',/吉他|民谣/.test(text)?'acoustic':'',/节拍|节奏/.test(text)?'beat':''].filter(Boolean);
  const energy=/安静|慢一点/.test(text)?20:/力量|能量|运动/.test(text)?85:values?Math.max(15,Math.min(90,100-values[0])):defaultEnergy[mood];
  return {mood,scenes,styles,energy};
}
export function recommend(s:MusicSignal,count=6,pool:Track[]=playableTracks):Track[] {
  const energy=s.direction==='quiet'?18:s.direction==='warm'?42:s.direction==='energy'?88:s.energy??defaultEnergy[s.mood]??35;
  const scenes=s.scenes||[],hour=s.hour??new Date().getHours();
  const night=hour>=21||hour<6;
  const score=(t:Track)=> {
    let v=(t.moods.includes(s.mood)?24:0)-Math.abs(t.energy-energy)*.85;
    v+=scenes.filter(x=>t.scenes.includes(x)).length*22+(night&&t.scenes.includes('night')?6:0);
    v+=(s.styles||[]).filter(x=>t.styles.includes(x)).length*20;
    if(s.direction==='warm'&&t.scenes.includes('healing'))v+=26;
    if(s.direction==='energy'&&t.styles.includes('beat'))v+=14;
    v+=(s.preferences?.likedTracks.includes(t.id)?7:0)+(s.preferences?.likedStyles.some(x=>t.styles.includes(x))?4:0);
    if(s.preferences?.recentTracks.slice(0,2).includes(t.id))v-=10;
    return v;
  };
  return [...pool].sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id)).slice(0,count);
}
const stages=['先慢下来','接住今天','稍微透口气','换一点颜色','找回一点状态','留给明天'];
export function buildMix(s:MusicSignal,variation=0):Playlist {
  const energies=[18,30,42,62,78,26],used=new Set<string>();
  const ids=energies.map((energy,i)=>{
    const list=recommend({...s,energy,direction:undefined},12).filter(t=>!used.has(t.id));
    const t=list[(variation+i%2)%Math.min(3,list.length)];used.add(t.id);return t.id;
  });
  return {id:`mix-${s.mood}-${variation}-${ids.join('-')}`,title:'Melo Mix',subtitle:(s.hour??new Date().getHours())>=21?'今晚，把一天慢慢收回来':'六首歌，慢慢走回自己的节奏',tracks:ids,generatedAt:new Date().toISOString(),reason:'依据当前音乐状态、时间与实际收藏，按六段能量安排；透明的标签规则推荐。'};
}
export const mixStages=stages;
export function whyTrack(t:Track,s:MusicSignal) {
  return [t.reason, s.scenes?.some(x=>t.scenes.includes(x))?'匹配你这次表达中的场景。':`音乐能量 ${t.energy}% · ${t.styles.join(' / ')}`,s.preferences?.likedStyles.some(x=>t.styles.includes(x))?'你收藏过相似声音，给熟悉感留一点位置。':'第一次相遇，先从这段声音开始。'];
}
export function differentTracks(p:Preferences,pool:Track[]=catalog) {const familiar=p.likedStyles.length?p.likedStyles:p.recentTracks.flatMap(id=>findTrack(id)?.styles||[]);return [...pool].sort((a,b)=>a.styles.filter(x=>familiar.includes(x)).length-b.styles.filter(x=>familiar.includes(x)).length||b.energy-a.energy).slice(0,6);}
