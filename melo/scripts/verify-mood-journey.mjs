import assert from "node:assert/strict";
import {
  makeMoodJourney,
  journeyTargets,
  journeyListenSeconds,
  validJourney,
} from "../lib/music/mood-journey.ts";
import { playableTracks } from "../data/music/catalog.ts";
import { transportPayload } from "../lib/music/persistence.ts";
const signal = { mood: "tired", energy: 18, hour: 23, scenes: ["night"] };
for (const target of journeyTargets) {
  const route = makeMoodJourney(signal, target.id, 0);
  assert.equal(route.steps.length, 4);
  assert.equal(new Set(route.steps.map((s) => s.track)).size, 4);
  assert(
    route.steps.every((s) => playableTracks.some((t) => t.id === s.track)),
  );
  assert(route.steps.every((s) => s.line));
}
const first = makeMoodJourney(signal, "energy", 0),
  second = makeMoodJourney(signal, "energy", 1);
assert.notDeepEqual(
  first.steps.map((s) => s.track),
  second.steps.map((s) => s.track),
);
assert(first.steps[3].energy > first.steps[0].energy);
assert(validJourney(first));
assert(!validJourney({ ...first, steps: [first.steps[0], first.steps[0]] }));
assert(
  !validJourney({ ...first, steps: [first.steps[0], null, first.steps[2]] }),
);
assert(
  !validJourney({ ...first, steps: [first.steps[0], {}, first.steps[2]] }),
);
assert(
  validJourney({
    ...first,
    outcome: "not-yet",
    completedAt: new Date().toISOString(),
  }),
);
assert(!validJourney({ ...first, outcome: "unknown" }));
assert.equal(
  journeyListenSeconds(
    first,
    { [first.steps[0].track]: 35 },
    { [first.steps[0].track]: 10 },
  ),
  25,
);
assert.equal(journeyListenSeconds(first, { unrelated: 99 }, {}), 0);
const completed = {
  ...first,
  outcome: "better",
  completedAt: new Date().toISOString(),
};
const persisted = transportPayload({
  momentId: completed.id,
  momentAt: completed.createdAt,
  mood: completed.from,
  text: "我今天选择让音乐陪我慢慢走。".repeat(50),
  reply: "谢谢你愿意停下来听听自己。".repeat(50),
  track: completed.steps[0].track,
  playlist: completed.steps.map((step) => step.track),
  journey: completed,
  source: "user-rules",
  reason: "你自己确认了这段旅程的感受。",
});
assert(JSON.stringify(persisted).length < 5000);
console.log(
  "PASS five goals, four distinct tracks, changing routes, invalid route rejection, real listening delta, 5 KB persistence limit",
);
