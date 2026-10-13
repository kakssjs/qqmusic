import type { Track } from '../../data/music/catalog.ts';
import { recommend, type MusicSignal } from './recommendation.ts';

export function chatMusicIntent(text: string) {
  const message = text.trim().replace(/[。！？!?，,\s]+$/g, '');
  if (/^(?:请|帮我|先)?(?:暂停|停止)(?:一下)?(?:音乐|播放|歌曲|这首歌)?$/.test(message)) return { action: 'pause' as const };
  if (/^(?:请|帮我)?(?:继续播放|继续听|恢复播放|接着放)(?:音乐|歌曲)?$/.test(message)) return { action: 'resume' as const };
  if (/^(?:请|帮我)?(?:换一首|下一首|换首歌)(?:歌|歌曲)?$/.test(message)) return { action: 'next' as const };
  if (/不要播放|别播放|别自动|先别放|不要放|别放|不想听(?:音乐|歌)(?:了|[，。\s]|$)|不听歌|不要自动播放/.test(message)) return { action: 'recommend' as const };
  const listeningRequest = message.replace(/(?:不想听|不要再听|不喜欢)[^，。！？!?]*[，。！？!?]?/g, '').replace(/想听你[^，。！？!?]*|想听(?:故事|建议|安慰)[^，。！？!?]*/g, '');
  return { action: /播放|放(?:这|那|刚才那|刚推荐的)首|放一首|放首|放点|放个|放一下|来一首|来首|想听|我要听|给我听|帮我放/.test(listeningRequest) ? 'play' as const : 'recommend' as const };
}

export function chatMusicCandidates(text: string, signal: MusicSignal, playable: Track[], library: Track[], currentId?: string, suggestedId?: string) {
  const intent = chatMusicIntent(text);
  const normalize = (value: string) => value.normalize('NFKC').replace(/\s/g, '').toLowerCase();
  const quoted = text.match(/[《「“"]([^》」”"]+)[》」”"]/u)?.[1];
  const named = intent.action === 'play'
    ? library.filter(t => quoted ? normalize(t.title) === normalize(quoted) : normalize(text).includes(normalize(t.title)))
      .sort((a, b) => b.title.length - a.title.length)
    : [];
  if (intent.action === 'play' && (quoted || named.length)) {
    const title = quoted || named[0].title;
    const match = playable.filter(t => normalize(t.title) === normalize(title));
    // Never silently substitute another song for an unavailable explicit request.
    return { tracks: match.slice(0, 24), unavailable: match.length ? undefined : title };
  }
  const suggested = intent.action === 'play' && suggestedId ? playable.find(t => t.id === suggestedId) : undefined;
  if (suggested) return { tracks: [suggested], unavailable: undefined };
  const excludedIds = [...(signal.excludedIds || []), ...(intent.action === 'next' && currentId ? [currentId] : [])];
  return { tracks: recommend({ ...signal, excludedIds }, 24, playable), unavailable: undefined };
}

export function voicePlaybackRequest(text: string, final: boolean, lastReply: string, playable: Track[]) {
  if (!final || chatMusicIntent(text).action === 'recommend') return null;
  const suggested = [...playable].sort((a,b)=>b.title.length-a.title.length).find(t => lastReply.includes(`《${t.title}》`) || lastReply.includes(t.title));
  return { message: text, suggestedTrackId: suggested?.id };
}
