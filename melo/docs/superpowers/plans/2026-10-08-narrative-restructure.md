# Melo Narrative Restructure Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans task-by-task in this session.

**Goal:** Make a coherent Melo-led music journey, ready for local user review.

**Architecture:** Preserve existing player, AI contracts and record persistence. Extract tested journey adjustment, character mode and monthly journal derivation; compose scenes around these shared values and replace the legacy style cascade with tokens and owned scene styles.

**Tech Stack:** React, TypeScript, Vite static adapter, existing GSAP/Lenis, CSS, Node assertions.

**Spec:** ../specs/2026-10-08-melo-narrative-restructure-design.md

## Global Constraints

- Seven expressions; six independent character modes.
- Three to five playable unique journey tracks, default four; 25 seconds of actual journey listening before feedback.
- Honest AI/rule source labels, actual stored records and Demo isolation.
- Test 1440 desktop and 390 mobile; reduced motion works.
- User's latest instruction: local commits and preview only; do not push, merge or publish before review.

## Review Focus

- Adjust route without losing heard prefix or selecting duplicate tracks.
- Monthly records must exclude future/cross-month data and deduplicate moments.
- Save failures must preserve retryable journey; feedback cannot bypass listening threshold.
- Light scenes, controls and mobile curve labels remain readable without overlap.
- Global player, Drawer, Dock and keyboard do not cover each other.

### Task 1: Tested state boundaries

Files: lib/music/mood-journey.ts, lib/music/monthly-journal.ts, lib/character-mode.ts, scripts/verify-narrative.mjs, components/melo/live/useLiveMelo.ts.

Interfaces: adjustMoodJourney(route, signal, heardIds) returns a new unique route preserving the heard prefix; monthlyJournal(records, now) returns current-month moments, actual seconds, nights and summary; characterMode(input) returns the six-mode union.

- [ ] Add assertions for heard-prefix preservation, no duplicates, month/future boundaries, moment deduplication, mode priorities.
- [ ] Run node scripts/verify-narrative.mjs and observe missing-behavior failure.
- [ ] Implement helpers and integrate route adjustment, save errors and typed character modes.
- [ ] Run new assertions and existing music/journey checks; commit tested logic.

### Task 2: Narrative scenes and role

Files: MoodJourney.tsx, EmotionCurve.tsx, CharacterPresence.tsx, AIChat.tsx, EmotionAnalysis.tsx, MusicRecommendation.tsx, Journey.tsx, Contact.tsx, MeloExperience.tsx, CompanionDock.tsx, MemorySpace.tsx, TrackCard.tsx, Discover.tsx.

Interfaces: EmotionCurve receives LiveMelo and uses actual route/player values; CharacterPresence receives expression/mode/reduced state. Journal consumes Task 1 monthlyJournal without generating fictional records.

- [ ] Replace small route cards with large desktop/mobile curve and explicit current/target state.
- [ ] Show Melo in each relevant scene; reduce chat shell, rebuild Feel canvas, emphasize one Listen song.
- [ ] Replace Journey dashboard with five editorial monthly chapters; fix route replay navigation.
- [ ] Remove auto-expanding Dock prompts, trim duplicated discovery rails, add ecology and new-journey Ending entrance.
- [ ] Run TypeScript checks and production build; commit scene changes.

### Task 3: Owned styles and responsive evidence

Files: app/globals.css, app/design-tokens.css, app/music-world.css, pages/pages.css. Remove obsolete live/rose/final/award imports after replacement.

- [ ] Establish tokens, readable light/dark palettes, scale and spacing.
- [ ] Replace music-world stylesheet with scene/shared-control ownership, responsive curve and continuous boundary decoration.
- [ ] Validate local 1440/390 browser flows, error/demo/no-data and reduced-motion states; correct observed defects.
- [ ] Run meaningful logic tests, tsc, build and changed-file lint. Record limits and screenshots.
- [ ] Commit local changes and deliver review preview. Do not publish.

## Execution ruling

User approved the written design and explicitly said “进行修改”; execute natively now. Their later “等我审核” narrows external action authorization: no push/merge/deploy. Work in the existing clean dedicated development checkout and feature branch to preserve its open PR, without creating another worktree.


## Local review ledger (2026-10-08)

- Implemented narrative scenes, shared character modes, curve route, editorial monthly journal, and consolidated scene/control/responsive styles.
- Verified TypeScript exit 0, Vite static production build exit 0, narrative assertions, journey checks, music catalog (24 tracks / 16 playable), and experience-data checks.
- CUA browser tested 1440x960 and 390x844: chat Demo response, route goals, actual Web Audio playback and 25-second gate, adjust preserving playing/heard node, feedback saving both outcomes into Demo memory, new journey clearing active route.
- Fresh reviewer found failed durable-save reporting and new-journey reset missing; fixed both. Added busy guards against stale feedback completion after reset.
- Failure evidence: non-prefix heard-node test failed before fix, passed after fix.
- Targeted lint: zero errors; image-loader and two existing effect-dependency warnings remain. New memo dependency warnings removed.
- Historical music-regressions browser script failed because its old server target was absent; its automatic-Dock expectations are obsolete for this design and no pass is claimed.
- Development hot reload produced AudioContext/React refresh errors; fresh static build was used for actual audio flow validation. No production backend or cloud-save outage injection was tested.
- Screenshots are local ignored outputs/narrative-review/ artifacts.
- No push, PR merge, docs publishing copy, or Vercel deployment performed. Await user review.
