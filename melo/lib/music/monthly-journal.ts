import { uniqueMoments, type MeloRecord } from "../../data/experience.ts";
export function monthlyJournal(records: MeloRecord[], now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const current = uniqueMoments(records).filter((e) => {
    const date = Date.parse(e.payload.momentAt || e.createdAt);
    return Number.isFinite(date) && date >= start && date <= now.getTime();
  });
  const moments = current.filter((e) => e.type === "checkin");
  const listens = current.filter(
    (e) => e.type === "listening" && (e.payload.seconds || 0) > 0,
  );
  const seconds = listens.reduce(
    (sum, e) => sum + Math.max(0, e.payload.seconds || 0),
    0,
  );
  const nightListens = listens.filter((e) => {
    const h = new Date(e.createdAt).getHours();
    return h >= 22 || h < 6;
  });
  const nights = new Set(
    nightListens.map((e) => {
      const d = new Date(e.createdAt);
      if (d.getHours() < 6) d.setDate(d.getDate() - 1);
      return d.toDateString();
    }),
  ).size;
  const summary =
    !moments.length && !listens.length
      ? "这个月的故事，等你用第一首歌写下。"
      : nightListens.length > listens.length / 2
        ? "这个月，你更多时候在夜晚，用音乐把一天慢慢收回来。"
        : "这个月，你为自己留了一些时间，也留下了值得记住的声音。";
  return {
    month: now.getMonth() + 1,
    name: new Intl.DateTimeFormat("en-US", { month: "long" })
      .format(now)
      .toUpperCase(),
    moments,
    seconds,
    nights,
    summary,
  };
}
