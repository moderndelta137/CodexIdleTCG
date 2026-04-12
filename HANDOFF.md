# Codex Idle TCG Handoff

## Project Snapshot

Codex Idle TCG is a real-time idle-action deckbuilder with persistent meta progression, pack opening, deck editing, and combat driven by enemy attack timers instead of turns. The current build is already playable and visually stylized, with the present development focus being combat feel, UI clarity, and spectacle.

## Core Direction

- Stay an idle-action deckbuilder
- Keep runs mostly linear for now
- Add more dungeon/content breadth later
- Let progression break TCG-style rules piece by piece
- Make major upgrades feel transformative
- Favor broad content expansion before deeper systemic complexity

## Important Codebase Constraint

Gameplay UI and helper render logic are intentionally kept inside the monolithic [`src/App.jsx`](D:/Projects/CodexIdleTCG/src/App.jsx).

Keep these inside `App()` unless there is a compelling reason not to. This is an explicit project constraint captured in both the design docs and context.

## Current Systems Already Working

- Real-time combat with timer-based enemy attacks
- Data-driven card and enemy content loaded from CSV
- Skill tree progression
- Deck editor and collection/codex flow
- Pack opening and duplicate upgrades
- Map progression with combat and event nodes
- GitHub Pages-compatible asset loading through `getAssetPath()` and `import.meta.env.BASE_URL`

## Recent Visual / UX Progress

### Combat

- Slash attacks now feel stronger and support varying directions
- Ranged attacks have faster projectile motion and more forceful muzzle flash
- Hit stop scales with stronger attacks
- Card play from hand uses a ghost-card launch effect

### Resources

- Mana cards trigger counter pop and converging mana wisps
- HP damage uses delayed white-loss behavior
- Healing extends with a green buffer, then fills after a short delay
- Player healing bar glow has been strengthened

### Defense

- Block cards create a curved hex-panel barrier wall near the player HP panel
- HP bar now shows a barrier-style block overlay with a hex pattern

### Draw Effects

- Drawing cards now triggers a flashier deck-linked effect
- A ghost card flies from deck to the hand slot
- The hand slot arrival pulse is working
- Click-blocking issues from draw VFX were addressed by disabling interaction on animated ghost cards

## Active Known Issue

The current unresolved bug is:

- The initial cyan hologram frame on the flying draw ghost card is still rendered in the wrong position during motion.

Important clarification:

- The user is specifically referring to the cyan hologram-style border that appears around the moving ghost card during the deck-to-hand animation.
- The landing pulse after the card reaches the hand is already correct.

## Likely Area To Continue

The draw effect rendering is near the bottom of [`src/App.jsx`](D:/Projects/CodexIdleTCG/src/App.jsx), inside the global fixed VFX layer that renders `drawAnimations`.

The next thread should inspect:

- positioning math for the moving draw ghost
- width/height source used by the moving hologram frame
- whether the effect should derive its border from the actual rendered `Card` bounds instead of a separate overlay box
- whether transforms and fixed-position origin math are causing offset between the card and frame

## Suggested Next Task

Continue from the draw-card effect bug first:

1. Inspect the moving ghost-card hologram frame in the `drawAnimations` overlay.
2. Align the moving cyan frame with the actual ghost card during flight.
3. Verify that `Cycle` and other draw cards trigger the effect reliably.
4. Make sure no invisible overlay remains that blocks card clicks.

## Useful Files

- Main game implementation: [`src/App.jsx`](D:/Projects/CodexIdleTCG/src/App.jsx)
- Design doc: [`GDD.md`](D:/Projects/CodexIdleTCG/GDD.md)
- Project context: [`context.JSON`](D:/Projects/CodexIdleTCG/context.JSON)
- Vite base-path config: [`vite.config.js`](D:/Projects/CodexIdleTCG/vite.config.js)
- Card data: [`public/data/cards.csv`](D:/Projects/CodexIdleTCG/public/data/cards.csv)
- Enemy data: [`public/data/enemies.csv`](D:/Projects/CodexIdleTCG/public/data/enemies.csv)

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
node node_modules\eslint\bin\eslint.js src\App.jsx
```

Build check without touching deploy output:

```powershell
node node_modules\vite\bin\vite.js build --configLoader native --outDir .build-check --emptyOutDir false
```
