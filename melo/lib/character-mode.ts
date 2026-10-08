export type CharacterMode =
  "idle" | "listening" | "thinking" | "speaking" | "music" | "celebrate";
export function characterMode(input: {
  busy?: string;
  celebrating?: boolean;
  speaking?: boolean;
  playing?: boolean;
  interacting?: boolean;
}): CharacterMode {
  if (input.celebrating) return "celebrate";
  if (["chat", "emotion", "story"].includes(input.busy || ""))
    return "thinking";
  if (input.speaking) return "speaking";
  if (input.playing) return "music";
  if (input.interacting) return "listening";
  return "idle";
}
