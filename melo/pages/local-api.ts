// GitHub Pages has no server runtime. Keep local records real and never fake AI.
const key = "melo-github-pages-v1";
const sessionKey = "melo-cloud-session-v1";
let configuration: Promise<string> | undefined;
let connecting: Promise<string> | undefined;
export function backendAddress() {
  if (location.hostname.endsWith(".vercel.app"))
    return Promise.resolve(location.origin);
  configuration ??= fetch("/qqmusic/melo-backend.json", { cache: "no-store" })
    .then(async (r) => {
      if (!r.ok) return "";
      const { apiBase } = (await r.json()) as { apiBase?: string };
      if (!apiBase) return "";
      const url = new URL(apiBase);
      if (url.protocol !== "https:")
        throw new Error("后端需要有效的 HTTPS 地址。");
      return url.origin;
    })
    .catch((error) => {
      configuration = undefined;
      throw error;
    });
  return configuration;
}
async function session(base: string) {
  const current = localStorage.getItem(sessionKey);
  if (current) return current;
  connecting ??= fetch(base + "/api/session", {
    signal: AbortSignal.timeout(12000),
  })
    .then(async (r) => {
      if (!r.ok) throw new Error("无法连接云端会话。");
      const data = (await r.json()) as { token?: string };
      if (typeof data.token !== "string" || !/^[a-f0-9]{64}$/.test(data.token))
        throw new Error("云端会话格式无效。");
      localStorage.setItem(sessionKey, data.token);
      return data.token;
    })
    .finally(() => {
      connecting = undefined;
    });
  return connecting;
}
type Event = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
};
function read(): Event[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("浏览器中的记忆格式无效。");
  return data;
}
export async function pagesRequest(url: string, options: RequestInit = {}) {
  try {
    const base = await backendAddress();
    if (base) {
      const token = await session(base);
      const headers = new Headers(options.headers);
      headers.set("X-Melo-Session", token);
      const response = await fetch(base + url, { ...options, headers });
      if (response.status === 401) {
        localStorage.removeItem(sessionKey);
        const fresh = await session(base);
        headers.set("X-Melo-Session", fresh);
        return fetch(base + url, { ...options, headers });
      }
      return response;
    }
    if (url !== "/api/session")
      return Response.json(
        {
          error:
            "GitHub Pages 不提供 AI 服务。请通过页面底部「AI 完整在线版」使用聊天与 AI 分析。",
        },
        { status: 503 },
      );
    const method = options.method || "GET";
    if (method === "DELETE") {
      localStorage.removeItem(key);
      return Response.json({ ok: true });
    }
    if (method === "POST") {
      const input = JSON.parse(String(options.body));
      const event: Event = {
        id: input.id || crypto.randomUUID(),
        type: input.type,
        payload: input.payload,
        createdAt: new Date().toISOString(),
      };
      const events = [event, ...read().filter((item) => item.id !== event.id)];
      localStorage.setItem(key, JSON.stringify(events));
      return Response.json({ event });
    }
    return Response.json({ events: read(), aiConnected: false });
  } catch {
    return Response.json(
      { error: "无法连接记忆服务，请检查网络或浏览器存储权限。" },
      { status: 503 },
    );
  }
}
