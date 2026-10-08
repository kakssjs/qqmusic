# Melo Final Acceptance Implementation Plan

Goal: first-time anonymous visitor completes chat → emotional understanding → reasoned song → real audio → favorite → persistent memory → early music personality within three minutes.
Architecture: preserve Hero/assets/7 expressions/Lenis; enrich the existing shared hook. Persist snapshot fields through existing cloud checkin records; keep dated listening receipts on this browser and reconcile cloud totals. Explicit demo storage is separate from real records. Vercel same-origin proxy forwards to the existing Aliyun backend without exposing credentials, enabling Preview visitors.
Tech: existing React/Vite/Web Audio, Node Vercel function, existing SQLite backend.
Spec: user attachment 1846b638-4d3c-4f09-87a9-e28c7c9469a9.

## Audit A–F
- A: real anonymous cloud session, AI chat/history, emotion endpoint, 5 synthesized tracks, seek/volume, cloud writes, 7 expressions, story, Lenis, reduced motion, mobile menu.
- B: favorite cannot undo; memory replay selects but doesn't play; per-week rhythm depends on aggregated data.
- C: music directions hidden as mood track list; emotional flow independent of chat; no snapshot of reply/song.
- D: historical JSON tested Sites identity/old anchors; live production AI 200 confirmed in fresh context; Preview not authorized by backend origin whitelist.
- E: onboarding, connected flow, snapshot details/replay, daily downloadable sign, grounded personality/weekly summary, explicit demo, timeout/retry.
- F: static sample dialogue, cross-origin font families, fixed storage notice, prose without next-step action.

## Tasks (execute inline; user's full brief authorizes implementation and release)
- [ ] 1 RED fresh visitor audit and final E2E expecting onboarding, demo/normal linked data, audio, undo favorite, replay and reload persistence.
- [ ] 2 Shared records/client: bounded requests/session recovery, cloud/local receipts, demo isolation, snapshot & recommendation state; test separation/failure semantics.
- [ ] 3 Existing hook: send+emotion+snapshot; context/quick direction; genuine audio gestures; un/favorite latest event; restore snapshot; dated listening.
- [ ] 4 UI: chat-first short onboarding; Feeling detail and reasons; alternatives/original lyrics; Memory detail/replay; grounded personality/week/sign; at most two proactive prompts.
- [ ] 5 Unify self-hosted fonts, add same-origin Vercel backend proxy; preserve video and Hero geometry.
- [ ] 6 Build, typecheck, existing interaction regression and final E2E at 390/430/768/1440, error/retry/offline, download, fonts/assets.
- [ ] 7 Push feature branch; deploy Preview, fresh visitor real AI and explicit Demo flows with no route mocks; inspect console/network. Publish only after passed checks; repeat full production E2E; GitHub sync.

Review focus: cloud unavailable retains draft; demo cannot overwrite normal history; no fabricated numerical probabilities; snapshots survive reload with exact track/reply; favorites undo persists; aggregate listening not double-counted; original audio buffering can't race on rapid skips.

Baseline 2026-10-08: production anonymous chat/session 200, care expression, no onboarding, song remains calm despite tired message; original font families inconsistent. Evidence D:/chatgpt/qqmusic/final-acceptance/baseline.json.
