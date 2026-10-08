import { findTrack } from "../../data/music/catalog.ts";
import { recommend, type MusicSignal } from "./recommendation.ts";
export const journeyTargets = [
  { id: "quiet", label: "安静下来", mood: "calm", energy: 18 },
  { id: "relax", label: "放松一点", mood: "calm", energy: 30 },
  { id: "focus", label: "重新专注", mood: "focus", energy: 50 },
  { id: "energy", label: "找回能量", mood: "bright", energy: 82 },
  { id: "keep", label: "保持现在的好心情", mood: "bright", energy: 68 },
] as const;
export type JourneyTarget = (typeof journeyTargets)[number]["id"];
export type MoodJourneyRoute = {
  id: string;
  from: string;
  target: JourneyTarget;
  targetLabel: string;
  targetMood: string;
  createdAt: string;
  source: "ai-signals" | "user-rules";
  variation: number;
  steps: { track: string; energy: number; stage: string; line: string }[];
  outcome?: "better" | "not-yet";
  completedAt?: string;
};
export function makeMoodJourney(
  signal: MusicSignal,
  target: JourneyTarget,
  variation = 0,
): MoodJourneyRoute {
  const goal = journeyTargets.find((t) => t.id === target) || journeyTargets[0],
    start = signal.energy ?? 30,
    end = target === "keep" ? Math.max(50, start) : goal.energy,
    used = new Set<string>();
  const lines = [
    "先让此刻慢一点。",
    "不用马上改变，先给自己一点空间。",
    "如果愿意，试着靠近一点新的节奏。",
    "准备好了，就把这段声音留给接下来的你。",
  ];
  const steps = Array.from({ length: 4 }, (_, i) => {
    const energy = Math.round(start + ((end - start) * i) / 3);
    const pool = recommend(
      {
        ...signal,
        mood: i > 1 ? goal.mood : signal.mood,
        energy,
        direction: undefined,
      },
      16,
    ).filter((t) => !used.has(t.id));
    const t = pool[(variation + (i % 2)) % Math.min(3, pool.length)];
    used.add(t.id);
    return {
      track: t.id,
      energy,
      stage: ["SETTLE", "RESET", "MOVE", "ARRIVE"][i],
      line: lines[i],
    };
  });
  return {
    id: `route-${Date.now()}-${variation}`,
    from: signal.mood,
    target,
    targetLabel: goal.label,
    targetMood: goal.mood,
    createdAt: new Date().toISOString(),
    source: "user-rules",
    variation,
    steps,
  };
}
export function validJourney(value: unknown): value is MoodJourneyRoute {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as Partial<MoodJourneyRoute>;
  if (
    typeof r.id !== "string" ||
    !r.id ||
    typeof r.from !== "string" ||
    typeof r.targetLabel !== "string" ||
    !r.targetLabel ||
    typeof r.targetMood !== "string" ||
    typeof r.createdAt !== "string" ||
    !Number.isFinite(Date.parse(r.createdAt)) ||
    (r.source !== "ai-signals" && r.source !== "user-rules") ||
    !Number.isInteger(r.variation) ||
    (r.variation as number) < 0 ||
    !journeyTargets.some((t) => t.id === r.target) ||
    !Array.isArray(r.steps) ||
    r.steps.length < 3 ||
    r.steps.length > 5
  ) {
    return false;
  }
  const validSteps = r.steps.every(
    (step) =>
      !!step &&
      typeof step === "object" &&
      typeof step.track === "string" &&
      typeof step.stage === "string" &&
      !!step.stage &&
      typeof step.line === "string" &&
      !!step.line &&
      Number.isFinite(step.energy) &&
      step.energy >= 0 &&
      step.energy <= 100 &&
      !!findTrack(step.track)?.audioUrl,
  );
  if (
    !validSteps ||
    new Set(r.steps.map((step) => step.track)).size !== r.steps.length
  ) {
    return false;
  }
  if (r.outcome !== undefined) {
    if (
      (r.outcome !== "better" && r.outcome !== "not-yet") ||
      typeof r.completedAt !== "string" ||
      !Number.isFinite(Date.parse(r.completedAt))
    ) {
      return false;
    }
  }
  return true;
}
export function journeyListenSeconds(
  route: MoodJourneyRoute,
  values: Record<string, number>,
  baseline: Record<string, number>,
) {
  return route.steps.reduce(
    (sum, s) =>
      sum + Math.max(0, (values[s.track] || 0) - (baseline[s.track] || 0)),
    0,
  );
}
