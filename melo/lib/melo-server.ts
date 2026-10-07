import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../app/chatgpt-auth";
export type MeloEvent = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
};
export async function identity() {
  const user = await getChatGPTUser();
  if (!user) throw new Error("AUTH_REQUIRED");
  return user;
}
export function database() {
  if (!env.DB) throw new Error("STORE_UNAVAILABLE");
  return env.DB;
}
export async function events(userId: string) {
  const rows = await database()
    .prepare(
      "SELECT id,type,payload,created_at FROM melo_events WHERE user_id = ? AND type != 'listening' ORDER BY created_at DESC LIMIT 200",
    )
    .bind(userId)
    .all<{ id: string; type: string; payload: string; created_at: string }>();
  const results = rows.results.map(
    (r) =>
      ({
        id: r.id,
        type: r.type,
        payload: JSON.parse(r.payload),
        createdAt: r.created_at,
      }) as MeloEvent,
  );
  const totals = await database()
    .prepare(
      "SELECT COALESCE(SUM(CAST(json_extract(payload,'$.seconds') AS INTEGER)),0) AS seconds, MIN(created_at) AS first_at FROM melo_events WHERE user_id = ? AND type = 'listening'",
    )
    .bind(userId)
    .first<{ seconds: number; first_at: string | null }>();
  if (totals?.seconds && totals.first_at)
    results.push({
      id: `${userId}:listening-total`,
      type: "listening",
      payload: { seconds: totals.seconds },
      createdAt: totals.first_at,
    });
  return results;
}
export async function saveEvent(
  userId: string,
  type: string,
  payload: Record<string, unknown>,
  id = crypto.randomUUID(),
) {
  const createdAt = new Date().toISOString();
  await database()
    .prepare(
      "INSERT OR IGNORE INTO melo_events (id,user_id,type,payload,created_at) VALUES (?,?,?,?,?)",
    )
    .bind(`${userId}:${id}`, userId, type, JSON.stringify(payload), createdAt)
    .run();
  return { id: `${userId}:${id}`, type, payload, createdAt };
}
export function aiConfig() {
  const settings = env as Cloudflare.Env & {
    AGNES_API_KEY?: string;
    AI_MODEL?: string;
    AI_BASE_URL?: string;
  };
  return {
    key: settings.AGNES_API_KEY,
    model: settings.AI_MODEL || "agnes-3.0-flash",
    base: (settings.AI_BASE_URL || "https://apihub.agnes-ai.com/v1").replace(
      /\/$/,
      "",
    ),
  };
}
export function routeError(error: unknown) {
  if (error instanceof Error && error.message === "AUTH_REQUIRED")
    return Response.json(
      {
        error: "请先登录，再保存你的音乐旅程。",
        signIn: "/signin-with-chatgpt?return_to=%2Fapp",
      },
      { status: 401 },
    );
  return Response.json(
    { error: "暂时无法连接记录服务。你的输入仍保留在页面，请稍后重试。" },
    { status: 503 },
  );
}
