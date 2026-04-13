# Codex Idle TCG - Updated Game Design Document

## 1. Overview

### Project Name
Codex Idle TCG

### Genre
Idle deckbuilder / real-time card battler / meta-progression collection game

### High Concept
Codex Idle TCG is a real-time idle deckbuilder where the player fights through linear dungeon rooms while manually playing cards under timer pressure. The game combines fast hand management, simple card reads, automated combat pressure, long-term progression through stages and skills, collection growth, deck editing, and banner-based card acquisition.

The core fantasy is an escalation arc:

- Early game: survive, find mana, and manage timer pressure
- Midgame: stabilize draw, improve consistency, and build a reliable engine
- Late game: break the original rules with persistent upgrades, automation, and more explosive throughput

### Current Product Direction

The current build is a stylized single-file prototype focused on validating:

- real-time combat pressure
- manual card throughput
- persistent meta progression
- stage-based hidden unlocks
- collectible card acquisition and upgrades
- strong cyber-holographic presentation

The intended long-term direction is to stay firmly in the idle-action deckbuilder space rather than become a dense traditional TCG simulator. Mechanical depth should come from pacing, engine-building, progression, and content variety more than from granular rules text.

## 2. Design Pillars

- Real-time pressure: enemy attack timers continue while the player manages hand, mana, and sequencing.
- Manual throughput: card play, draw, and discard actions are fast and tactile.
- Constraint breaking: progression should gradually remove core limitations rather than only add flat stats.
- Offense first: defense exists to buy time, but satisfying builds should still feel proactive and explosive.
- Incremental satisfaction: every run should produce some permanent gain.
- Spectacle matters: combat, rewards, warnings, map progression, and banner pulls should all feel visibly rewarding.

## 3. Player Fantasy And Progression Arc

The intended long-term power curve is:

1. Find mana
2. Survive long enough to play meaningful hands
3. Improve draw consistency
4. Build mana and card-flow engines
5. Reduce costs and automate routine actions
6. Preserve resources between fights
7. Spill damage across enemies and chain kills

End-state fantasy:
The player has effectively dismantled the game's original restrictions and turned a fragile starter deck into a hyper-efficient engine.

## 4. Current Session Structure

- Runs are now shifting from an endless random map to stage-defined linear dungeons.
- The current live Stage 1 route is `3-10`, meaning 3 floors with 10 rooms per floor.
- Floor-room notation is `X-Y`:
  - `X` = floor
  - `Y` = room within that floor
- Every 10 rooms advances the floor by 1.

## 5. Core Gameplay Loop

### Hub Loop
From the main menu, the player can:

- enter the currently available dungeon directly
- open dungeon select if multiple dungeons are unlocked
- edit the active deck
- unlock permanent skills once the skills feature has been unlocked in-run
- inspect and upgrade cards in the codex once codex/upgrades are unlocked in-run
- open the shop and banners once the shop is unlocked in-run
- synthesize fragments into packs

### Combat Loop
During a run, the player:

- faces one enemy at a time
- watches an enemy attack timer fill in real time
- draws, discards, and plays cards from hand
- manages HP, shield, mana, and temporary power buffs
- kills enemies for GP, fragments, and occasional packs
- advances automatically to the next room

### Meta Loop
After or between runs, the player:

- spends GP on the skill tree
- upgrades owned cards using duplicates
- opens data packs for more cards
- refines the active deck to support stronger engines
- unlocks future stages and new hidden systems through dungeon clears and in-run unlock rooms

## 6. Current Build Scope

The current implementation already includes:

- real-time 1v1 combat
- persistent save data in localStorage
- versioned save migration
- deck construction
- card collection and duplicate-based upgrades
- skill tree with unlock dependencies and stage visibility gating
- banner-based pack opening
- stage and dungeon scaffolding
- reward fountains, combat VFX, warning overlays, animated pack reveals, and animated card flow

The current implementation does not yet include:

- true multi-color mana as a full resource system
- Stage 2+ mechanics beyond early placeholders
- mill/discard banner content
- top-deck visibility systems
- fusion / extra deck systems
- character selection / sticker systems

## 7. Combat Design

### Combat Structure

- Battles are 1v1.
- Enemies attack based on a timer, not turns.
- When an enemy dies, the run advances to the next room.
- If the next room is another combat room, the next enemy appears immediately.
- If the next room is an event/unlock room, combat pauses until the room is resolved.

### Pressure Model

- Enemy intent is represented as a visible attack timer.
- The timer creates constant urgency even when the player is drawing or sequencing cards.
- This supports the game's identity as an idle-pressure deckbuilder rather than a turn-based tactics game.

### Player Stats In Run

- HP
- Max HP
- Shield
- Mana
- Kills
- Temporary `power` buff for attack scaling within a combat

Important live rule:

- `power` resets after each combat and does not carry to the next enemy.

### Enemy Stats

- HP / Max HP
- Attack timer / max timer
- Damage
- Boss flag

### Current Enemy Content

Current enemy roster is data-driven through CSV:

- Normal enemies: Enforcer, Sentry, Drone, Watcher, Revenant
- Bosses: Void Reaver, Doom Guard, Soul Eater, Cyber Dragon, Mana Wraith

## 8. Card System

### Card Types

The live card database uses these main types:

- `mana`
- `atk`
- `def`
- `util`
- healing as `util` cards with `isHeal`

### Current Card Roles

- Mana cards: generate mana, sometimes with bonus effects
- Attack cards: direct damage, heavy hits, or multi-hit patterns
- Defense cards: grant shield
- Utility cards: draw, heal, or grant flat attack power (`atkBuff`)

### Card Data Structure

Cards are defined by:

- `id`
- `name`
- `type`
- `cost`
- `color`
- `value`
- `desc`
- `icon`
- optional properties such as `manaBonus`, `multiHit`, `atkBuff`, and `isHeal`

### Current Additional Banner-Focused Cards

Recently added multi-hit/support cards include:

- `u5` Battle Rhythm
- `u6` Chain Protocol
- `a12` Spark Barrage
- `a13` Razor Storm
- `a14` Needle Burst

### Current Color Model

The current design language includes:

- `W` Neutral
- `G` Nature
- `B` Water
- `R` Fire
- `D` Void
- `Y` Lightning

In the current playable build, color is still mostly thematic/presentational. True multi-color mana systems remain future work.

## 9. Resources

### Health

- The player has finite HP for the run.
- Taking damage is driven by enemy timer attacks.
- Healing exists in the current card set and through rest rooms.

### Mana

- Mana is stored in a visible pool.
- Mana is spent to play cards.
- Mana cards are part of the deck and recycle through draw/discard like any other card.
- Meta upgrades can increase starting mana, mana regeneration, mana retention between kills, mana refunds, and automation.

### Progression Currencies

- GP: main permanent progression currency
- Fragments: converted into packs
- Packs: used on banner pulls

## 10. Dungeon And Room Progression

### Current Live Dungeon Structure

The older 1000-node endless random map design is no longer the live direction. The current build uses stage-defined room sequences.

Current live dungeons:

- Stage 1: `Null Corridor`
- Stage 2 placeholder: `Prism Archive`
- Stage 3 placeholder: `Summon Vault`

### Current Room Types

- Encounter
- Boss
- Treasure
- Rest
- Unlock Feature

### Unlock Room Rules

- Feature unlocks are placed as dedicated in-run rooms.
- If a feature is already unlocked, that room is replaced by a normal encounter in future runs.
- Completing a dungeon unlocks the next stage.

### Current Stage 1 Unlock Room Placement

- `1-3` Skills
- `1-6` Shop
- `1-9` Codex
- `2-4` Upgrades
- `2-8` Recovery Protocol banner
- `3-3` Flurry Engine banner
- `3-7` Pull x5

Stage 1 clear reward:

- unlocks Stage 2

### Current Stage 2 Placeholder

- `Prism Archive` has a placeholder `Pull x10` unlock at room 17 (`2-7`)
- clear reward unlocks Stage 3

## 11. Rewards And Economy

### Current Reward Sources

- Normal enemies award GP and fragments
- Bosses award larger GP and fragment payouts
- Bosses and rare kills can award packs
- Treasure rooms can grant GP, fragments, or packs

### Fragment Synthesis

- 10 fragments can be synthesized into 1 pack

### Banner Opening

- 1 pack opens into 5 cards
- multi-pack opening is supported
- banner tabs and pull sizes are progression-gated

## 12. Meta Progression

### 12.1 Skill Tree

The skill tree is the heart of permanent progression. It sells rule changes, engine enablers, and throughput upgrades rather than only flat stat bumps.

Current live behavior:

- future-stage skills are hidden until their stage is unlocked
- the skill screen opens centered on the central node

### 12.2 Collection And Deckbuilding

- The player owns cards in multiple copies.
- The active deck is built from owned cards.
- Minimum deck size to start a run is 10 cards.
- Maximum active deck size is 40 cards.

### 12.3 Card Upgrades

- Duplicates are consumed to permanently level up a card
- Card levels scale base card value
- Upgrade cost tiers are `5`, `10`, and `20`
- Maximum current card level is 4

Current UX note:

- the codex upgrade effect is aligned to the preview card bounds

### 12.4 Stages

Stage is the wrapper for meta progression.

Current live behavior:

- Player starts at Stage 1
- Locked future-stage systems remain hidden
- In-run unlock rooms reveal core systems and banner/pull features
- Dungeon clear reveals the next stage

## 13. Difficulty And Scaling

### Current Scaling Implementation

- Enemy HP scales upward with kill count
- Enemy damage scales upward with kill count
- Enemy timer can shorten with progression
- Boss and normal enemies scale differently

### Overflow / Chain Identity

The game already supports the intended overflow fantasy through:

- `overkill`
- `overkillChain`
- heavy damage modifiers
- mana retention and automation that accelerate chaining

## 14. UI / UX Direction

### Visual Identity

- cyber-holographic arena
- black, cyan, red, gold, and neon-accented UI
- strong glow, warning overlays, animated loot, and foil effects
- lucide-react icons as the core visual language

### Current Screen Set

- Main menu / hub
- Dungeon select
- Combat
- Skills
- Deck editor
- Codex
- Shop and banners
- Game over / run summary

### Current Presentation Features

- enemy intent bubble
- attack warning overlays
- floor / room banners
- loot fountain rewards
- animated combat effect layers
- event popups
- animated skill tree map
- animated banner reveals
- enemy overload-pop death effects

## 15. Performance / Technical Notes

Critical current implementation constraints:

- Built in React + Vite + TailwindCSS + `lucide-react`
- Gameplay sub-components and render functions intentionally remain inside one monolithic `App()` function
- Persistent meta data is stored in localStorage
- Runtime content is loaded from CSV where possible
- Desktop shell targets a 16:9 viewport with black letterboxing

Recent live performance work:

- capped combat canvas particle count
- localized global overlay FX to the game frame instead of the full browser viewport
- kept cleanup on timed VFX arrays/effects

Most likely future perf hotspot:

- DOM-based overlay effects during very long mobile sessions

## 16. Current Content Snapshot

### Starter Meta

- Starting deck contains basic mana, strike, shield, and cycle cards
- Skills, shop, codex, and upgrades are initially hidden and unlocked in Stage 1
- Collection begins with multiple starter copies rather than a broad pool

### Data-Driven Content

- card content loaded from CSV plus recent support/multi-hit additions
- 5 normal enemies
- 5 bosses

## 17. Future Expansion Priorities

The main long-term priority remains content breadth.

Strong next expansion candidates:

- true Stage 2 mana/color systems
- more banner pools and archetypes such as mill/discard
- additional dungeons and stage-specific routes
- stronger late-stage automation and rule-breaking
- Stage 3 summon/fusion style systems
- Stage 4 character / sticker / pity systems

Priority order:

- first: broader content and variety
- second: deeper systemic layers that support that content
- third: optional structural complexity

## 18. Design Summary

Codex Idle TCG is a real-time idle deckbuilder about turning pressure into momentum. The player begins with a small, clunky deck and gradually builds a faster, stronger, more automated engine through permanent skill unlocks, collection growth, duplicate upgrades, banners, and deck refinement. The game should remain an idle-action deckbuilder first. The current build already establishes the core identity: timer-based combat, manual card sequencing, staged meta progression, floor-room dungeon pacing, and spectacle-driven cyber presentation.
