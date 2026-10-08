export type MeloRecord = {
  id: string;
  type: string;
  payload: {
    momentId?: string;
    mood?: string;
    text?: string;
    role?: string;
    content?: string;
    track?: string;
    seconds?: number;
    keywords?: string[];
    story?: string;
    memory?: string;
    reply?: string;
    reason?: string;
    values?: number[];
    secondary?: string;
    scene?: string;
    liked?: boolean;
    pending?: boolean;
    source?: string;
  };
  createdAt: string;
};
export function uniqueMoments(records: MeloRecord[]) {
  const seen = new Set<string>();
  return [...records]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .filter((e) => {
      if (e.type !== "checkin") return true;
      const id = e.payload.momentId || e.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}
export const moodNames: Record<string, string> = {
  calm: "平静",
  tired: "疲惫",
  sad: "低落",
  bright: "开心",
  focus: "专注",
};
export function inferMood(text: string) {
  if (/累|疲|紧绷|休息/.test(text)) return "tired";
  if (/难过|失败|糟|烦|低落/.test(text)) return "sad";
  if (/开心|很好|成功|能量|高兴/.test(text)) return "bright";
  if (/专注|工作|学习/.test(text)) return "focus";
  return "calm";
}
export function contextHints(text: string) {
  const secondary = /满足|完成|结束/.test(text)
    ? "完成后的缓冲"
    : /比赛|失败|没做好|糟/.test(text)
      ? "重新整理"
      : /能量|开心/.test(text)
        ? "想找回能量"
        : "想给自己一点空间";
  const clues = [
    /比赛/.test(text)
      ? "比赛之后"
      : /任务|工作|学习/.test(text)
        ? "任务之后"
        : "",
    /夜|晚/.test(text) ? "夜晚" : "",
    /独处|一个人/.test(text) ? "独处" : "",
    /安静/.test(text) ? "想安静一会" : "",
  ].filter(Boolean);
  return { secondary, scene: clues.join(" · ") || "场景待了解" };
}
export function isFavorite(records: MeloRecord[], track: string) {
  return (
    [...records]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .find((e) => e.type === "favorite" && e.payload.track === track)?.payload
      .liked !== false &&
    records.some((e) => e.type === "favorite" && e.payload.track === track)
  );
}
export function mergeRecords(cloud: MeloRecord[], local: MeloRecord[]) {
  const map = new Map<string, MeloRecord>();
  for (const r of [...local, ...cloud]) map.set(r.id, r);
  let list = [...map.values()];
  const receipts = list.filter(
    (r) => r.type === "listening" && !r.id.endsWith("listening-total"),
  );
  const sum = receipts.reduce((v, r) => v + (r.payload.seconds || 0), 0);
  list = list
    .map((r) =>
      r.id.endsWith("listening-total")
        ? {
            ...r,
            payload: {
              ...r.payload,
              seconds: Math.max(0, (r.payload.seconds || 0) - sum),
            },
          }
        : r,
    )
    .filter((r) => !r.id.endsWith("listening-total") || r.payload.seconds);
  return list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
export function personality(records: MeloRecord[]) {
  records = uniqueMoments(records);
  const moments = records.filter((e) => e.type === "checkin"),
    listens = records.filter((e) => e.type === "listening" && e.payload.track);
  const counts = new Map<string, number>();
  for (const e of moments) {
    const m = e.payload.mood || "calm";
    counts.set(m, (counts.get(m) || 0) + 1);
  }
  const dominant = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
  const night = listens.filter((e) => {
    const h = new Date(e.createdAt).getHours();
    return h >= 22 || h < 6;
  }).length;
  const enough = !!moments.length && !!listens.length;
  const title = !enough
    ? "你的音乐人格还在形成"
    : night > listens.length / 2
      ? "深夜漫游者"
      : dominant === "bright"
        ? "向光的节奏收集者"
        : dominant === "focus"
          ? "安静的专注者"
          : "慢慢整理自己的人";
  const caption = !enough
    ? "完成一次聊天，再听一首歌，就会出现第一份结果。"
    : `从 ${moments.length} 次心情和 ${listens.length} 段聆听来看，你正在用音乐${night > listens.length / 2 ? "为夜晚留一个安静的出口" : "给自己一段重新整理的时间"}。这是初步观察，会随记录变化。`;
  const weekStart = Date.now() - 7 * 86400000,
    week = records.filter((e) => Date.parse(e.createdAt) >= weekStart);
  const favorites = records.filter(
    (e) =>
      e.type === "favorite" &&
      e.payload.liked !== false &&
      isFavorite(records, e.payload.track || ""),
  );
  const keywords = [
    ...new Set(
      moments.flatMap(
        (e) =>
          (e.payload.text || "").match(
            /比赛|工作|学习|朋友|休息|音乐|安静|完成|练习/g,
          ) || [],
      ),
    ),
  ].slice(0, 4);
  return {
    title,
    caption,
    enough,
    dominant: moodNames[dominant] || "等你分享",
    time: !listens.length
      ? "还没有聆听记录"
      : night > listens.length / 2
        ? "深夜"
        : "白天 / 傍晚",
    energy: favorites.some((e) => e.payload.track === "bright")
      ? "明亮、有能量"
      : favorites.length
        ? "柔和、留白"
        : "还没有收藏",
    keywords,
    weekMoments: week.filter((e) => e.type === "checkin"),
    weekListens: week.filter((e) => e.type === "listening" && e.payload.track),
    favorites,
  };
}
