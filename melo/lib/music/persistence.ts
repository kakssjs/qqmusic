import { findTrack, type Playlist } from '../../data/music/catalog';
import type { MeloRecord } from '../../data/experience';
export function transportPayload(payload:MeloRecord['payload']) {
  const id=payload.catalogTrackId||payload.track;
  return {...payload,...(id?{track:findTrack(id)?.coreMood||'calm',catalogTrackId:id}:{})};
}
export function normalizeRecord(e:MeloRecord):MeloRecord {
  return {...e,payload:{...e.payload,track:e.payload.catalogTrackId||e.payload.track}};
}
export function likedMixes(records:MeloRecord[]):Playlist[] {
  const seen=new Set<string>(),result:Playlist[]=[];
  for(const e of [...records].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt))){const mix=e.payload.mix;if(!mix||seen.has(mix.id))continue;seen.add(mix.id);if(e.payload.liked!==false)result.push(mix);}
  return result;
}
