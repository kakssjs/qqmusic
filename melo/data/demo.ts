import {
  inferMood,
  contextHints,
  uniqueMoments,
  type MeloRecord,
} from "./experience";
const key = "melo-demo-v2";
export function demoEnabled() {
  return (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("demo") === "1"
  );
}
export function localRecords() {
  try {
    return JSON.parse(
      localStorage.getItem(
        demoEnabled()
          ? key
          : "melo-receipts-v2:" +
              (localStorage.getItem("melo-cloud-session-v1") || "browser"),
      ) || "[]",
    ) as MeloRecord[];
  } catch {
    return [];
  }
}
export function keepLocal(records: MeloRecord[]) {
  localStorage.setItem(
    demoEnabled()
      ? key
      : "melo-receipts-v2:" +
          (localStorage.getItem("melo-cloud-session-v1") || "browser"),
    JSON.stringify(records.slice(0, 500)),
  );
}
export function demoRequest(url: string, options: RequestInit = {}) {
  const records = localRecords(),
    method = options.method || "GET";
  const input = JSON.parse(String(options.body || "{}"));
  const save = (
    type: string,
    payload: MeloRecord["payload"],
    id = crypto.randomUUID(),
  ) => {
    const e = { id, type, payload, createdAt: new Date().toISOString() };
    records.unshift(e);
    keepLocal(records);
    return e;
  };
  if (url === "/api/session") {
    if (method === "DELETE") {
      keepLocal([]);
      return Response.json({ ok: true });
    }
    if (method === "POST")
      return Response.json({
        event: save(input.type, input.payload, input.id),
      });
    return Response.json({ events: records, aiConnected: true });
  }
  const text = String(input.message || input.text || "");
  const mood = inferMood(text);
  if (url === "/api/emotion")
    return Response.json({
      mood,
      label: (
        {
          tired: "疲惫",
          sad: "低落",
          bright: "开心",
          focus: "专注",
          calm: "平静",
        } as Record<string, string>
      )[mood],
      reason:
        mood === "tired"
          ? "今天已经用了很多力气。先选慢一点、柔和一点的旋律，给紧绷留一个缓冲。"
          : "让现在的感受先有一个位置，再用一段旋律陪你。",
      values: mood === "tired" ? [72, 58, 86] : [30, 35, 62],
      ...contextHints(text),
    });
  if (url === "/api/chat") {
    const past = records.find((e) => e.type === "checkin");
    const reply =
      /记得|上次/.test(text) && past
        ? `记得你说过「${past.payload.text}」。那次我们听了这段旋律。今天也想从安静一点开始吗？`
        : /能量/.test(text)
          ? "好，我们给今天一点轻盈的上行旋律。慢慢找回状态，不必一下子振作。"
          : /安静/.test(text)
            ? "好，先把声音放柔一点。你不用急着解释，我们一起听完这一段。"
            : "听起来你今天把很多力气都用在这件事上了。你现在更想安静一下，还是重新找点状态？";
    save("message", { role: "user", content: text }, input.id);
    save("message", { role: "assistant", content: reply }, input.id + "-reply");
    return Response.json({ reply });
  }
  if (url === "/api/story") {
    const moments = uniqueMoments(records).filter((e) => e.type === "checkin");
    return Response.json({
      event: save("story", {
        keywords: [
          ...new Set(
            moments.flatMap(
              (e) =>
                (e.payload.text || "").match(/比赛|休息|安静|累|学习|音乐/g) ||
                [],
            ),
          ),
        ].slice(0, 3),
        story: `你留下了 ${moments.length} 段心情。从愿意开口，到选择一段旋律，这些实际发生的瞬间，正慢慢连成你的音乐故事。`,
        memory: moments[0]?.payload.text || "还在了解你。",
      }),
    });
  }
  return Response.json({ error: "演示接口不存在。" }, { status: 404 });
}
