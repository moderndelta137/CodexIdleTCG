# Codex Idle TCG

Codex Idle TCG is a cyber-styled idle-action deckbuilder built with React, Vite, Tailwind, and `lucide-react`. The current build is a playable single-file prototype focused on real-time combat pressure, fast manual card throughput, spectacle-heavy UI/VFX, and a new stage-based meta progression shell.

The long-term direction is not a rules-dense traditional TCG. The game is meant to stay an idle-action deckbuilder first, then gradually break its own rules through stage unlocks, automation, broader content, and stronger engine-building.

## Current Build

The project currently includes:

- Real-time 1v1 combat with enemy attack timers
- Data-driven cards and enemies loaded from CSV in [`public/data`](D:/Projects/CodexIdleTCG/public/data)
- Persistent progression via localStorage
- Stage-based meta progression with hidden future content
- Simple dungeon select flow with auto-start when only one dungeon is available
- Skill tree progression and deck editing
- Codex + duplicate-based card upgrades
- Banner-based pack opening with unlock-gated tabs and pull counts
- Animated combat VFX, reward presentation, draw/play effects, and enemy death effects
- 16:9 framed game viewport with black letterboxing on desktop

Recent implemented work includes:

- Fixed draw-card ghost/hologram alignment and split normal draw vs draw-card-effect presentation
- Added stronger enemy death effects and iterated them into a heavier overload-pop style
- Added support and multi-hit banners plus new related cards
- Added stage/dungeon scaffolding and hidden future-stage feature gating
- Reworked Stage 1 pacing so feature unlocks happen in dedicated unlock rooms across a `3-10` route
- Replaced already-unlocked feature rooms with normal encounter rooms on later runs
- Optimized long-session VFX load by capping canvas particles and localizing global overlays to the game frame
- Centered the skill tree on its central node when opened
- Fixed codex upgrade effect alignment to the preview card

## Project Direction

- Genre: idle-action deckbuilder
- Run structure: mostly linear dungeons for now, more dungeon types later
- Progression goal: break TCG-like rules piece by piece over time
- Content priority: more breadth and variety first, deeper systems second
- Power curve: fast, satisfying growth with lots of long-term content

The full design summary lives in [`GDD.md`](D:/Projects/CodexIdleTCG/GDD.md).

## Important Technical Constraint

This project intentionally keeps gameplay sub-components and render helpers inside the main `App()` function in [`src/App.jsx`](D:/Projects/CodexIdleTCG/src/App.jsx).

Do not refactor gameplay UI pieces into separate top-level React components unless there is a very strong reason. Shared combat state and prior rendering issues are why this structure is being preserved.

## Current Progression Snapshot

The save/progression model is now versioned and old saves are intentionally treated as fresh.

Current live progression:

- Stage 1: `Spire Protocol`
- Visible dungeon at fresh start: `Null Corridor`
- Stage 1 route length: `3-10` equivalent, implemented as 30 rooms
- Stage 1 in-run unlock rooms:
  - `1-3` Skills
  - `1-6` Shop
  - `1-9` Codex
  - `2-4` Upgrades
  - `2-8` Recovery Protocol banner
  - `3-3` Flurry Engine banner
  - `3-7` Pull x5
- Stage clear reward: unlocks `Stage 2`

Current Stage 2 placeholder:

- Dungeon: `Prism Archive`
- Pull x10 unlock room at `2-7` / room 17 overall
- Stage clear reward: unlocks `Stage 3`

Important rule:

- Future-stage features and skills remain hidden until their stage/feature is unlocked.
- If an unlock feature has already been claimed, that room is replaced with a normal encounter in future runs.

## Run Locally

Install dependencies:

```powershell
npm.cmd install
```

Run the dev server:

```powershell
npm.cmd run dev
```

Build for production:

```powershell
npm.cmd run build
```

Preview the production build locally:

```powershell
npm.cmd run preview
```

## Verification

Lint:

```powershell
node node_modules\eslint\bin\eslint.js src\App.jsx vite.config.js
```

Build check:

```powershell
node node_modules\vite\bin\vite.js build --configLoader native --outDir .build-check --emptyOutDir false
```

## Deployment Notes

[`vite.config.js`](D:/Projects/CodexIdleTCG/vite.config.js) already switches the base path for GitHub Pages when `GITHUB_ACTIONS` is set:

- local/dev base: `/`
- GitHub Pages base: `/CodexIdleTCG/`

If deployment work continues in a new thread, that thread should verify the GitHub Actions workflow under [`.github`](D:/Projects/CodexIdleTCG/.github) and confirm the published site still resolves CSV data correctly through `import.meta.env.BASE_URL`.

## Current Known Follow-Ups

There is no single blocking UI bug at the moment. The most likely next work areas are:

- Continue Stage 2 planning and move already-implemented late-game skills/features to the correct future stages
- Define additional banner/dungeon unlocks such as mill/discard and later archetypes
- Keep profiling long-session performance if DOM-based overlays still accumulate noticeable cost on mobile
- Flesh out dungeon metadata and future stage content instead of the current placeholder routes

## Docs

- Design document: [`GDD.md`](D:/Projects/CodexIdleTCG/GDD.md)
- Project context snapshot: [`context.JSON`](D:/Projects/CodexIdleTCG/context.JSON)
- Thread handoff and current status: [`HANDOFF.md`](D:/Projects/CodexIdleTCG/HANDOFF.md)
- Design backlog: [`upgrade-ideas-backlog.md`](D:/Projects/CodexIdleTCG/upgrade-ideas-backlog.md)
