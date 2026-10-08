export type CoreMood = 'calm' | 'tired' | 'sad' | 'bright' | 'focus';
export type Composition = { notes: number[]; melody: number[]; tempo: number; voice: number; pulse: number };
export type Track = {
  id: string; title: string; name: string; artist: string; cover: string;
  source: 'melo-original' | 'licensed-demo' | 'qq-music'; audioUrl?: string; previewUrl?: string; officialUrl?: string;
  duration: number; moods: string[]; energy: number; scenes: string[]; styles: string[];
  reason: string; copyrightType: 'original' | 'licensed' | 'official-link';
  subtitle: string; color: string; tempo: number; coreMood: CoreMood; composition?: Composition;
};
export type Playlist = { id: string; title: string; subtitle: string; tracks: string[]; generatedAt: string; reason: string };
const colors = ['#637e8d','#91b7ad','#c4d4ce','#b7ba92'];
// Melo-created cloud, water, moonlight and mint artwork; not artist album covers.
function cover(_title: string, i: number) {
  const scenes=[2,1,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  return `/qqmusic/music/covers/scene-${String(scenes[i%16]).padStart(2,'0')}.webp`;
}
const originals: [string,string,CoreMood,number,string[],string[],string,number[],number[],number,number,number][] = [
 ['calm','晚风','calm',24,['night','healing'],['ambient','piano'],'平静和弦与缓慢旋律，给夜晚留一点空白。',[130.81,196,261.63],[523.25,587.33,659.25,587.33,523.25,440],3,0,0],
 ['tired','月光停靠','tired',16,['night','healing'],['ambient','piano'],'慢节奏、柔和泛音，接住用力以后的一天。',[110,164.81,220],[440,392,329.63,293.66,329.63,392],4,1,0],
 ['sad','雨后','sad',30,['rain','lonely','healing'],['piano','acoustic'],'不急着放晴的钢琴留白，给低落一个出口。',[146.83,220,293.66],[587.33,523.25,440,392,440,523.25],3.5,2,0],
 ['bright','向光而行','bright',82,['energy','commute'],['electronic','beat'],'上行旋律和轻快节拍，陪好心情继续向前。',[174.61,261.63,349.23],[523.25,659.25,783.99,880,783.99,659.25],1.7,3,1],
 ['focus','深蓝航线','focus',44,['study','work'],['minimal','ambient'],'稳定重复的低频音型，适合把注意力交给一件事。',[98,146.83,196],[392,392,440,392,293.66,392],2.5,0,.3],
 ['mint','薄荷呼吸','calm',22,['anxious','healing'],['ambient','acoustic'],'宽阔声场与舒缓拨弦，适合想松开一点的时刻。',[123.47,185,246.94],[493.88,369.99,329.63,246.94,329.63],3.2,2,0],
 ['bus','靠窗座位','tired',38,['commute','rain'],['lofi','beat'],'轻柔节拍和温暖电键，陪雨天的公交慢慢走。',[138.59,207.65,277.18],[415.3,554.37,622.25,554.37,415.3,311.13],2.1,1,.5],
 ['lamp','桌灯还亮着','focus',52,['study','night','work'],['minimal','electronic'],'克制的脉冲和短旋律，为作业保留稳定的节奏。',[103.83,155.56,207.65],[415.3,415.3,311.13,466.16,415.3,311.13,277.18],1.9,3,.6],
 ['letter','没有寄出的信','sad',26,['lonely','night'],['piano','ambient'],'带呼吸感的琴声，陪那些暂时没有说出口的话。',[116.54,174.61,233.08],[466.16,349.23,311.13,349.23,233.08,311.13,349.23],3.8,1,0],
 ['sun','口袋里的太阳','bright',68,['healing','commute'],['acoustic','beat'],'暖色拨弦和轻巧节拍，给今天一点重新开始的光。',[164.81,246.94,329.63],[659.25,493.88,587.33,659.25,783.99,659.25],1.8,2,.7],
 ['orbit','慢跑行星','bright',92,['energy','commute'],['electronic','beat'],'明亮合成器与稳定鼓点，陪脚步找回自己的速度。',[196,293.66,392],[783.99,659.25,587.33,783.99,880,987.77],1.1,3,1.2],
 ['shore','留给明天的海','calm',34,['night','healing','lonely'],['ambient','minimal'],'舒展的长音与潮汐感低频，为一天留一个柔软结尾。',[87.31,130.81,174.61],[349.23,392,440,523.25,440,392,349.23,261.63],4.2,0,.1],
 ['snow','雪山来信','focus',40,['study','work','night'],['minimal','piano'],'清澈琴键与低缓长音，像雪山把纷扰隔在远处。',[92.5,138.59,185],[369.99,415.3,493.88,415.3,369.99,277.18],2.8,1,.2],
 ['petal','白花浮过','calm',20,['healing','anxious'],['ambient','acoustic'],'轻盈拨弦像花瓣落在水上，留一段不用着急的时间。',[155.56,233.08,311.13],[622.25,466.16,415.3,466.16,311.13,415.3],3.6,2,0],
 ['forest','雾中散步','tired',32,['rain','commute','healing'],['lofi','ambient'],'柔软低频与稀疏鼓点，陪你走过安静的雾色森林。',[82.41,123.47,164.81],[329.63,293.66,246.94,329.63,392,329.63],2.7,0,.4],
 ['aurora','极光梦游','bright',74,['night','energy'],['electronic','beat'],'闪烁的合成器与流动节奏，让夜晚也有一点轻盈的力量。',[185,277.18,369.99],[739.99,622.25,554.37,830.61,739.99,987.77],1.5,3,.9],
];
export const playableTracks: Track[] = originals.map(([id,title,coreMood,energy,scenes,styles,reason,notes,melody,tempo,voice,pulse],i)=>({id,title,name:title,artist:'Melo Original',cover:cover(title,i),source:'melo-original',audioUrl:`/qqmusic/music/audio/${id}.wav`,duration:90,moods:[coreMood,...scenes.filter(s=>['healing','anxious','lonely'].includes(s))],energy,scenes,styles,reason,copyrightType:'original',subtitle:reason.split('，')[0],color:colors[i%4],tempo,coreMood,composition:{notes,melody,tempo,voice,pulse}}));
// Editorial metadata only. Covers are Melo-created art, not the artists' album artwork.
// Search links deliberately avoid inventing song IDs, streaming rights or version-specific durations.
const official: [string,string,CoreMood,number,string[],string[]][]=[
 ['稻香','周杰伦','bright',65,['healing','commute'],['pop','acoustic']],
 ['平凡之路','朴树','calm',48,['commute','healing'],['folk','rock']],
 ['旅行的意义','陈绮贞','calm',35,['commute','rain'],['folk','acoustic']],
 ['起风了','买辣椒也用券','sad',55,['night','healing'],['pop']],
 ['晴天','周杰伦','bright',62,['commute'],['pop','rock']],
 ['红豆','王菲','sad',28,['night','lonely'],['pop','acoustic']],
 ['小幸运','田馥甄','calm',46,['healing'],['pop']],
 ['光年之外','G.E.M. 邓紫棋','bright',76,['energy'],['pop','electronic']],
];
export const catalog: Track[]=[...playableTracks,...official.map(([title,artist,coreMood,energy,scenes,styles],i):Track=>({id:`qq-${i}`,title,name:title,artist,cover:cover(title,i+16),source:'qq-music',officialUrl:`https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(title+' '+artist)}`,duration:0,moods:[coreMood],energy,scenes,styles,reason:`编辑选曲 · ${scenes.includes('night')?'夜晚':'路上'}也可以换一种声音；到 QQ 音乐查找官方版本。`,copyrightType:'official-link',subtitle:'QQ 音乐官方搜索 · 本站不提供音频',color:colors[i%4],tempo:2,coreMood}))];
export const findTrack=(id?:string)=>catalog.find(t=>t.id===id);
