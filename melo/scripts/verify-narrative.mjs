import assert from "node:assert/strict";
import * as routes from "../lib/music/mood-journey.ts";
assert.equal(
  typeof routes.adjustMoodJourney,
  "function",
  "route adjustment must preserve heard nodes",
);
const { monthlyJournal } = await import("../lib/music/monthly-journal.ts");
const { characterMode } = await import("../lib/character-mode.ts");
const signal = { mood: "tired", energy: 18, hour: 23 };
const route = routes.makeMoodJourney(signal, "energy");
const heard = [route.steps[0].track, route.steps[1].track];
const adjusted = routes.adjustMoodJourney(route, signal, heard);
assert.deepEqual(adjusted.steps.slice(0, 2), route.steps.slice(0, 2));
assert.notDeepEqual(
  adjusted.steps.slice(2).map((s) => s.track),
  route.steps.slice(2).map((s) => s.track),
);
assert.equal(new Set(adjusted.steps.map((s) => s.track)).size, 4);
assert(routes.validJourney(adjusted));
assert.equal(adjusted.outcome, undefined);
const skipped = routes.adjustMoodJourney(route, signal, [route.steps[2].track]);
assert.deepEqual(skipped.steps[2], route.steps[2]);
assert.equal(routes.validJourney({ ...route, heardTracks: "bad" }), false);
assert.equal(routes.validJourney({ ...route, listenedSeconds: -2 }), false);
const event = (id, date, type = "checkin", payload = {}) => ({
  id,
  createdAt: date,
  type,
  payload,
});
const journal = monthlyJournal(
  [
    event("old", "2026-09-30T18:00:00+08:00"),
    event("a", "2026-10-08T08:00:00+08:00", "checkin", {
      momentId: "one",
      text: "比赛之后",
    }),
    event("b", "2026-10-08T09:00:00+08:00", "checkin", {
      momentId: "one",
      text: "比赛之后",
    }),
    event("listen", "2026-10-07T23:00:00+08:00", "listening", {
      seconds: 45,
      track: "calm",
    }),
    event("bad", "2026-10-07T23:05:00+08:00", "listening", { seconds: -80 }),
    event("future", "2026-10-20T09:00:00+08:00"),
  ],
  new Date("2026-10-08T12:00:00+08:00"),
);
assert.equal(journal.moments.length, 1);
assert.equal(journal.seconds, 45);
assert.equal(journal.nights, 1);
assert.equal(monthlyJournal([], new Date()).moments.length, 0);
assert.equal(characterMode({ busy: "chat", playing: true }), "thinking");
assert.equal(characterMode({ speaking: true, playing: true }), "speaking");
assert.equal(
  characterMode({ celebrating: true, busy: "emotion" }),
  "celebrate",
);
assert.equal(characterMode({ interacting: true }), "listening");
assert.equal(characterMode({ playing: true }), "music");
assert.equal(characterMode({}), "idle");
console.log(
  "PASS route heard-prefix/uniqueness/change, current month/dedup/future/negative durations, six character mode priorities",
);
