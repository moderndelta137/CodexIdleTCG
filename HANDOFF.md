# Codex Idle TCG Handoff

## Project Snapshot

Codex Idle TCG is a real-time idle-action deckbuilder with persistent meta progression, banner-based card acquisition, deck editing, duplicate upgrades, and timer-driven combat. The current build is already playable and visually stylized. The latest major change is a stage-and-dungeon progression shell that hides future content until unlocked.

## Core Direction

- Stay an idle-action deckbuilder
- Keep runs mostly linear for now
- Use stages as the meta-progression wrapper for unlocking whole categories of content
- Let progression break TCG-style rules piece by piece
- Favor broad content expansion before deeper system complexity

## Important Codebase Constraint

Gameplay UI and helper render logic are intentionally kept inside the monolithic [`src/App.jsx`](D:/Projects/CodexIdleTCG/src/App.jsx).

Keep these inside `App()` unless there is a compelling reason not to. This is an explicit project constraint captured in both the design docs and context.

## Current Systems Already Working

- Real-time combat with timer-based enemy attacks
- CSV-driven cards and enemies
- Stage-gated hidden progression
- Dungeon selection flow
- Skill tree progression
- Deck editor
- Codex and duplicate-based card upgrades
- Banner-based pack opening with gated tabs and pull sizes
- GitHub Pages-compatible asset loading through `getAssetPath()` and `import.meta.env.BASE_URL`

## Current Progression State

### Save Model

- Save is versioned via `saveVersion`
- Older saves are intentionally reset to fresh progression state
- Progression fields now include:
  - `stage`
  - `unlockedStages`
  - `unlockedFeatures`
  - `completedDungeons`

### Stage 1

- Stage name: `Spire Protocol`
- Fresh run dungeon: `Null Corridor`
- Dungeon shape is `3-10`, implemented as 30 sequential rooms
- Floor-room display is now `X-Y`
  - `X` = floor
  - `Y` = room on that floor

Current Stage 1 unlock room positions:

- `1-3` Skills
- `1-6` Shop
- `1-9` Codex
- `2-4` Upgrades
- `2-8` Recovery Protocol banner
- `3-3` Flurry Engine banner
- `3-7` Pull x5

Clear reward:

- Unlocks `Stage 2`

Important behavior:

- If a feature is already unlocked, its unlock room is replaced by a normal encounter on future runs.

### Stage 2 Placeholder

- Dungeon: `Prism Archive`
- Current placeholder unlock room:
  - `2-7` / overall room 17: Pull x10
- Clear reward:
  - unlocks `Stage 3`

### Stage 3 Placeholder

- Dungeon: `Summon Vault`
- Exists as a placeholder route only

## Current Content / Shop State

### Banners

Current banner tabs:

- `Forge Node` synthesis tab
- `Core Archive` standard banner
- `Recovery Protocol` support banner
- `Flurry Engine` multi-hit banner

Feature gating:

- `Core Archive` is baseline
- `Recovery Protocol` appears after its unlock room
- `Flurry Engine` appears after its unlock room
- Pull sizes:
  - `x1` baseline
  - `x5` gated by Stage 1 unlock room
  - `x10` gated by Stage 2 unlock room

### Newer Card Additions

Recently added cards include:

- `u5` Battle Rhythm
- `u6` Chain Protocol
- `a12` Spark Barrage
- `a13` Razor Storm
- `a14` Needle Burst

These support the support/multi-hit banner identities and the `atkBuff` utility mechanic.

## Recent Visual / UX Progress

### Combat / FX

- Draw ghost-card effect split into:
  - normal draw = ghost card only
  - draw-card effects = ghost card + hologram overlays
- Enemy death effect iterated into a stronger overload-pop style
- Hologram frame alignment issues from earlier draw effect work were fixed

### Progression / UI

- Main menu now uses a simple aligned main action button
- Dungeon selection moved into its own screen
- Main run button auto-starts the only available dungeon if just one is unlocked
- Desktop framing now targets a 16:9 viewport with black letterboxing
- Skill tree opening pan now centers on the central node instead of approximate canvas center
- Codex upgrade effect alignment now matches the preview card bounds

## Recent Performance Work

Main long-session optimizations already implemented:

- `CombatVfxCanvas` prunes seen effect ids instead of letting them grow forever
- Combat particle canvas now hard-caps live particle count
- Global VFX overlay is now localized to the game frame instead of repainting the full browser viewport
- Expired `deathEffect` cleanup remains in place
- Earlier pointless render work such as a null-mapping pass over active effects was removed

If performance work continues, the next likely hotspot is:

- DOM-based global overlays for draw/death/card-play effects during very long sessions on mobile

## Current Files Most Relevant

- Main game implementation: [`src/App.jsx`](D:/Projects/CodexIdleTCG/src/App.jsx)
- Global shell styling: [`src/index.css`](D:/Projects/CodexIdleTCG/src/index.css)
- Design doc: [`GDD.md`](D:/Projects/CodexIdleTCG/GDD.md)
- Project context: [`context.JSON`](D:/Projects/CodexIdleTCG/context.JSON)
- Card data: [`public/data/cards.csv`](D:/Projects/CodexIdleTCG/public/data/cards.csv)
- Enemy data: [`public/data/enemies.csv`](D:/Projects/CodexIdleTCG/public/data/enemies.csv)
- Vite base-path config: [`vite.config.js`](D:/Projects/CodexIdleTCG/vite.config.js)

## Suggested Next Tasks

The most sensible continuation points are:

1. Define the remaining stage roadmap in data instead of placeholders, especially Stage 2 feature placement.
2. Add the next planned banner/archetype packs such as mill/discard.
3. Reassign currently implemented late-game skills/features to their final intended stages where needed.
4. Continue profiling mobile long-session performance if the DOM overlay layer still shows drift.

## Run / Verify

Run locally:

```powershell
npm.cmd run dev
```

Build:

```powershell
npm.cmd run build
```

Lint target file:

```powershell
node node_modules\eslint\bin\eslint.js src\App.jsx vite.config.js
```

Build check without touching deploy output:

```powershell
node node_modules\vite\bin\vite.js build --configLoader native --outDir .build-check --emptyOutDir false
```
