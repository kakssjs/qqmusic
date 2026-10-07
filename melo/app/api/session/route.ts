import {
  aiConfig,
  database,
  events,
  identity,
  routeError,
  saveEvent,
} from "../../../lib/melo-server";
export async function GET() {
  try {
    const user = await identity();
    return Response.json({
      user: { name: user.fullName || "音乐旅人" },
      events: await events(user.userId),
      aiConnected: !!aiConfig().key,
    });
  } catch (e) {
    return routeError(e);
  }
}
export async function POST(request: Request) {
  try {
    const user = await identity();
    const body = (await request.json()) as {
      type?: string;
      payload?: Record<string, unknown>;
      id?: string;
    };
    if (
      !["checkin", "favorite", "listening"].includes(body.type || "") ||
      !body.payload ||
      JSON.stringify(body.payload).length > 5000 ||
      typeof body.id !== "string" ||
      !/^[-\w]{1,80}$/.test(body.id)
    )
      return Response.json({ error: "记录格式不正确。" }, { status: 400 });
    if (
      body.type === "checkin" &&
      (!["calm", "tired", "sad", "bright", "focus"].includes(
        String(body.payload.mood),
      ) ||
        typeof body.payload.text !== "string" ||
        body.payload.text.length > 1000)
    )
      return Response.json(
        { error: "请选择心情并填写不超过1000字的记录。" },
        { status: 400 },
      );
    if (
      body.type === "listening" &&
      (!Number.isInteger(body.payload.seconds) ||
        Number(body.payload.seconds) < 1 ||
        Number(body.payload.seconds) > 60)
    )
      return Response.json({ error: "聆听时长无效。" }, { status: 400 });
    const event = await saveEvent(
      user.userId,
      body.type!,
      body.payload,
      body.id,
    );
    return Response.json({ event }, { status: 201 });
  } catch (e) {
    return routeError(e);
  }
}
export async function DELETE() {
  try {
    const user = await identity();
    await database()
      .prepare("DELETE FROM melo_events WHERE user_id = ?")
      .bind(user.userId)
      .run();
    return Response.json({ ok: true });
  } catch (e) {
    return routeError(e);
  }
}
