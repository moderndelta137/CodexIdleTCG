# Codex Idle TCG

Codex Idle TCG is a cyber-styled idle-action deckbuilder built with React, Vite, Tailwind, and `lucide-react`. The current build is a playable single-screen prototype focused on real-time combat pressure, fast manual card throughput, persistent meta progression, and spectacle-heavy UI/VFX.

The long-term direction is not a traditional rules-dense TCG. The game is meant to stay an idle-action deckbuilder first, then gradually break its own rules through major progression milestones, automation unlocks, broader content, and stronger engine-building.

## Current Build

The project currently includes:

- Real-time 1v1 combat with enemy attack timers
- Data-driven cards and enemies loaded from CSV in [`public/data`](D:/Projects/CodexIdleTCG/public/data)
- Persistent progression via localStorage
- Skill tree progression and deck editing
- Pack opening and duplicate-based card upgrades
- Animated combat VFX, resource UI, reward presentation, and card draw/play effects

Recent implemented polish includes:

- Stronger slash and ranged attack VFX
- Hit stop scaling for stronger attacks
- Mana gain wisps converging into the MP counter
- Delayed HP loss / healing bar reactions
- Curved shield wall VFX for block cards
- HP bar block overlay with hex-pattern barrier styling
- Deck-to-hand card draw animation with deck pulse, flying ghost card, and landing pulse

## Project Direction

- Genre: idle-action deckbuilder
- Run structure: mostly linear for now, with more dungeon types later
- Progression goal: break TCG-like rules piece by piece over time
- Content priority: more breadth and variety first, deeper systems second
- Power curve: fast, satisfying growth with lots of long-term content

The full design summary lives in [`GDD.md`](D:/Projects/CodexIdleTCG/GDD.md).

## Important Technical Constraint

This project intentionally keeps gameplay sub-components and render helpers inside the main `App()` function in [`src/App.jsx`](D:/Projects/CodexIdleTCG/src/App.jsx).

Do not refactor gameplay UI pieces into separate top-level React components unless there is a very strong reason. Shared combat state and previous rendering issues are the reason this structure is being preserved.

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
node node_modules\eslint\bin\eslint.js src\App.jsx
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

## Current Known Issue

The remaining active UI bug is in the draw-card effect:

- The moving cyan hologram frame on the flying deck-to-hand ghost card is still visually misaligned during flight.
- The landing pulse in the destination hand slot appears in the correct location and size.

This is the main unresolved item the next thread should pick up.

## Docs

- Design document: [`GDD.md`](D:/Projects/CodexIdleTCG/GDD.md)
- Project context snapshot: [`context.JSON`](D:/Projects/CodexIdleTCG/context.JSON)
- Thread handoff and current status: [`HANDOFF.md`](D:/Projects/CodexIdleTCG/HANDOFF.md)
- Design backlog: [`upgrade-ideas-backlog.md`](D:/Projects/CodexIdleTCG/upgrade-ideas-backlog.md)
