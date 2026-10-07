import {
  aiConfig,
  database,
  events,
  identity,
  routeError,
  saveEvent,
} from "../../../lib/melo-server";
export async function POST(request: Request) {
  try {
    const user = await identity();
    const body = (await request.json()) as { message?: string; id?: string };
    if (
      typeof body.message !== "string" ||
      !body.message.trim() ||
      body.message.length > 1500 ||
      typeof body.id !== "string" ||
      !/^[-\w]{1,80}$/.test(body.id)
    )
      return Response.json(
        { error: "请输入1至1500字的消息。" },
        { status: 400 },
      );
    const config = aiConfig();
    if (!config.key)
      return Response.json(
        {
          error:
            "AI伙伴尚未接通模型服务。你可以先记录心情、聆听音乐；接通后这里会提供真实 AI 对话。",
          code: "AI_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    const history = await events(user.userId);
    const previous = history.find(
      (e) => e.id === `${user.userId}:${body.id}-reply`,
    );
    if (previous)
      return Response.json({
        reply: previous.payload.content,
        event: previous,
      });
    const memory = history
      .filter((e) => e.type === "checkin")
      .slice(0, 8)
      .map((e) => `${e.createdAt}: ${e.payload.text}（${e.payload.mood}）`)
      .join("\n");
    const messages = history
      .filter((e) => e.type === "message")
      .slice(0, 12)
      .reverse()
      .map((e) => ({ role: e.payload.role, content: e.payload.content }));
    const response = await fetch(`${config.base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.key}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: `你是Melo，温柔、真诚的音乐陪伴伙伴。用简短自然的中文回应用户，不诊断心理疾病，不捏造用户历史。只有以下记录是真实记忆，可谨慎引用。可建议聆听方向，别假称控制了音乐。可播放的原创音乐：晚风（平静）、月光停靠（疲惫）、雨后（低落）、向光而行（开心）、深蓝航线（专注）。长期记忆：${history.find((e) => e.type === "story")?.payload.memory || "暂无总结"}。真实心情记录：\n${memory || "暂无"}`,
          },
          ...messages,
          { role: "user", content: body.message.trim() },
        ],
        max_tokens: 700,
        temperature: 0.75,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok)
      return Response.json(
        { error: "模型服务暂时无法回应。请稍后重试；这条消息尚未保存。" },
        { status: 502 },
      );
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content;
    if (!reply)
      return Response.json(
        { error: "模型没有返回有效内容，请重试。" },
        { status: 502 },
      );
    const time = new Date().toISOString();
    await database().batch([
      database()
        .prepare(
          "INSERT OR IGNORE INTO melo_events (id,user_id,type,payload,created_at) VALUES (?,?,?,?,?)",
        )
        .bind(
          `${user.userId}:${body.id}`,
          user.userId,
          "message",
          JSON.stringify({ role: "user", content: body.message.trim() }),
          time,
        ),
      database()
        .prepare(
          "INSERT OR IGNORE INTO melo_events (id,user_id,type,payload,created_at) VALUES (?,?,?,?,?)",
        )
        .bind(
          `${user.userId}:${body.id}-reply`,
          user.userId,
          "message",
          JSON.stringify({ role: "assistant", content: reply }),
          new Date(Date.now() + 1).toISOString(),
        ),
    ]);
    return Response.json({ reply });
  } catch (e) {
    if (
      e instanceof Error &&
      (e.name === "TimeoutError" || e.name === "AbortError")
    )
      return Response.json(
        { error: "Melo 的回应超时了，请重试。你的输入仍然保留。" },
        { status: 504 },
      );
    return routeError(e);
  }
}
