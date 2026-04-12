# Codex Idle TCG - Updated Game Design Document

## 1. Overview

### Project Name
Codex Idle TCG

### Genre
Idle deckbuilder / real-time card battler / meta-progression collection game

### High Concept
Codex Idle TCG is a real-time idle deckbuilder where the player fights through an extended sequence of enemies and events while manually playing cards under timer pressure. The game combines fast hand management, simple card reads, automated combat pressure, and long-term progression through skills, collection growth, deck editing, and pack opening.

The core fantasy is a dramatic escalation arc:

- Early game: survive, find mana, and learn the pressure of enemy timers.
- Midgame: stabilize draw, improve consistency, and assemble reliable engines.
- Late game: break the original rules with persistent upgrades, chain kills together, and overwhelm scaling enemies with absurd throughput.

### Current Product Direction
The current build is a stylized single-screen prototype focused on validating:

- real-time combat pressure
- manual card throughput
- persistent meta progression
- skill-tree driven rule breaking
- collectible card acquisition and upgrades
- strong cyber-holographic presentation

The intended long-term direction is to stay firmly in the idle-action deckbuilder space rather than become a dense traditional TCG simulator. Mechanical depth should come from pacing, engine-building, progression, and content variety more than from highly granular card text complexity.

## 2. Design Pillars

- Real-time pressure: enemy attack timers continue while the player manages hand, mana, and sequencing.
- Manual throughput: card play, draw, and discard actions are fast and tactile.
- Constraint breaking: progression should gradually remove core limitations rather than only add flat stats.
- Offense first: defense exists to buy time, but the most satisfying builds are proactive and explosive.
- Incremental satisfaction: every run should produce some permanent gain.
- Spectacle matters: combat, loot, warnings, map progression, and pack opening should all feel visibly rewarding.

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

## 4. Target Session Structure

- A run should feel short enough to retry often and long enough to create momentum.
- The original target was roughly 5 to 10 minutes per run.
- Early failures should still produce enough rewards to feel worthwhile.
- Bosses act as pacing spikes and progression milestones.

In the current build, a run advances through a 1000-node map with recurring boss and event nodes, making the structure suitable for both short partial runs and much longer survival pushes.

## 5. Core Gameplay Loop

### Hub Loop
From the main menu, the player can:

- start a run
- edit the active deck
- unlock permanent skills
- inspect and upgrade cards in the codex
- convert fragments into packs
- open packs to expand the collection

### Combat Loop
During a run, the player:

- faces one enemy at a time
- watches an enemy attack timer fill in real time
- draws, discards, and plays cards from hand
- manages HP, shield, and mana
- kills enemies for GP, fragments, and occasional packs
- advances automatically to the next node on the run map

### Meta Loop
After or between runs, the player:

- spends GP on the skill tree
- upgrades owned cards using duplicates
- opens data packs for more cards
- refines the active deck to support stronger engines

## 6. Current Build Scope

The current implementation already includes:

- real-time 1v1 combat
- persistent save data in localStorage
- deck construction
- card collection and duplicate-based upgrades
- skill tree with unlock dependencies
- gacha-style pack opening
- map progression with encounters, bosses, treasure, rest, and feature unlock nodes
- reward fountains, combat VFX, warning overlays, and animated pack reveals

The current implementation does not yet include:

- multi-color mana rules as a true resource system
- boss reward choice screens
- in-run deck editing rewards
- relic-style run modifiers
- top-deck visibility systems
- multi-card play-per-click systems
- explicit run reward drafting

These remain valid future extensions from the original design direction.

## 7. Combat Design

### Combat Structure

- Battles are 1v1.
- Enemies attack based on a timer, not turns.
- When an enemy dies, the run advances to the next map node.
- If the next node is another combat node, the next enemy appears immediately.
- If the next node is an event node, combat pauses until the event is resolved.

### Pressure Model

- Enemy intent is represented as a visible attack timer.
- The timer creates constant urgency even when the player is drawing or sequencing cards.
- This supports the game's identity as an idle-pressure deckbuilder rather than a turn-based tactics game.

### Player Stats In Run

- HP: current survivability for the run
- Max HP: can increase through events
- Shield: temporary mitigation
- Mana: used to play cards
- Kills: used for scaling and progression

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
- `heal` as a sub-role implemented through `util` cards with `isHeal`

### Current Card Roles

- Mana cards: generate mana, sometimes with bonus effects
- Attack cards: deal direct damage, including heavy hits and multi-hit patterns
- Defense cards: grant shield
- Utility cards: draw cards or heal

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
- optional properties such as `manaBonus`, `multiHit`, and `isHeal`

### Current Color Model
The current design language includes:

- `W` Neutral
- `G` Nature
- `B` Water
- `R` Fire
- `D` Void
- `Y` Lightning

In the current playable build, color is primarily thematic and presentational. The older design's stricter color-cost identity and multi-color resource system are not yet fully implemented.

Long-term direction:

- color should eventually become a real gameplay system
- early and current versions can keep color lightweight for readability and speed
- later updates should add color identity in a way that expands buildcraft without undermining the idle-action flow

### Current Card Pool Themes

- Mana generation and burst mana
- direct attack and heavy attack
- multihit attacks
- draw and cycling
- shield generation
- healing

### Input Model In Current Build

- Click a card in hand to play it
- Click the discard pile area to toggle discard mode
- Click a card while discard mode is active to discard it
- Draw actions are currently button/pile driven through the combat HUD logic rather than the full original drag/swipe interaction described in the old design

### Design Intent
The original design treats deck cycling as a skill expression. The current build supports that intent, though some of the more advanced interaction ideas are simplified in implementation.

## 9. Resources

### Health

- The player has finite HP for the run.
- Taking damage is driven by enemy timer attacks.
- Healing exists in the current card set and through rest events.

Healing should remain present but reduced from its current prominence. It should function more as a stabilizer and occasional recovery valve than as a dominant strategy.

### Mana

- Mana is stored in a visible pool.
- Mana is spent to play cards.
- Mana cards are part of the deck and recycle through draw/discard like any other card.
- Meta upgrades can increase starting mana, mana regeneration, mana retention between kills, mana refunds, and passive mana automation.

### Mana Persistence

- The old design intended mana to reset fully between monsters, with upgrades later enabling carryover.
- The current implementation already follows that spirit:
  - mana is effectively reset between kills, then modified by `manaRetain` and `startMana`
  - late-game upgrades can retain 50% or 100% of leftover mana

## 10. Run Map And Node Progression

### Current Map Structure

- The run map is generated as an array of 1000 nodes.
- Bosses appear every 5th combat milestone.
- Treasure nodes appear at 5% chance.
- Rest nodes appear at 5% chance.
- Skills unlock is forced at node index 2 if not already unlocked.
- Shop unlock is forced at node index 4 if not already unlocked.
- All other nodes are standard encounters.

Current direction:

- runs should remain mostly linear for now
- over time, the game can expand into multiple dungeon tracks or run types rather than branching heavily inside a single run
- the focus is breadth of distinct content paths, not immediate structural complexity

### Current Node Types

- Encounter
- Boss
- Treasure
- Rest
- Unlock Skills
- Unlock Shop

### Event Flow

- Event node appears in the arena as a holographic object
- Combat is paused
- Player clicks the event object to claim rewards
- Popup appears with rewards and flavor text
- Confirming the popup advances to the next node

### Current Event Rewards

- Rest: heal to full and increase max HP
- Treasure: GP, fragments, or packs
- Unlock nodes: permanently enable the corresponding hub features

## 11. Rewards And Economy

### Current Reward Currencies

- GP: primary permanent progression currency
- Fragments: secondary currency converted into packs
- Packs: used to obtain cards

### Current Reward Sources

- Normal enemies award GP and fragments
- Bosses award larger GP and fragment payouts
- Bosses and rare kills can also award packs
- Treasure events can grant GP, fragments, or packs

### Fragments To Packs

- 10 fragments can be synthesized into 1 pack

### Pack Opening

- 1 pack opens into 5 cards
- multi-pack opening is supported
- rarity is represented through cost tiers and reveal presentation

## 12. Meta Progression

### 12.1 Skill Tree

The skill tree is the heart of the permanent progression system. It mostly sells rule changes, engine enablers, and throughput upgrades rather than only bland stat bumps.

#### Branches

- Core
- Sys
- Flow
- Dmg
- Util
- Cross

#### Example Current Skills

- increase max hand size
- increase opening hand
- start combat with mana
- improve base damage
- draw multiple cards per action
- always open with a mana card
- first strike bonus versus full-HP enemies
- heavy-card damage bonus
- automatic card draw
- draw on attack
- mana surge on mana cards
- boss damage bonus
- auto-play mana cards
- mana retention between kills
- overkill damage carryover
- free low-cost cards
- passive mana generation
- endless overkill chain
- mana refund on play
- shield amplification
- healing amplification
- mana cards deal damage
- heavy attacks grant shield
- utility cards become free
- perfect mana retention
- extra hits for multi-hit cards

#### Skill Tree Philosophy

- early nodes improve consistency
- mid nodes support engine formation
- late nodes break resource and pacing rules
- the endgame should feel intentionally excessive

Automation philosophy:

- automation should be earned gradually and feel transformative when unlocked
- the game should break typical TCG rules piece by piece over long-term progression
- full or near-full automation should require substantial investment
- each major progression milestone should feel powerful and game-changing

### 12.2 Collection And Deckbuilding

- The player owns cards in multiple copies.
- The active deck is built from owned cards.
- Minimum deck size to start a run is 10 cards.
- Maximum active deck size in the current build is 40 cards.
- The starter collection includes a small set of mana, attack, defense, and utility cards.

### 12.3 Card Upgrades

- Duplicates are consumed to permanently level up a card
- Card levels currently scale the card's base value
- Upgrade cost tiers are currently `5`, `10`, and `20`
- Maximum current card level is 4

This aligns with the original duplicate-driven collection model.

## 13. Difficulty And Scaling

### Intended Scaling Philosophy

- Early monsters teach pressure and survival
- Midgame tests throughput and consistency
- Late game creates stat walls meant to be broken by upgraded engines

### Current Scaling Implementation

- Enemy HP scales upward with kill count
- Enemy damage scales upward with kill count
- Enemy timer can shorten with progression, creating more pressure
- Boss and normal enemies scale differently

### Overflow / Chain Identity

The old design emphasized overflow damage as a late-game fantasy. The current build already supports this direction through:

- `overkill`
- `overkillChain`
- heavy damage modifiers
- mana retention and automation that accelerate chaining

## 14. UI / UX Direction

### Visual Identity

- cyber-holographic arena
- black, cyan, red, gold, and neon-accented UI
- heavy use of glow, warning overlays, and animated loot presentation
- card rarity represented through foil and reveal effects
- Lucide icons used as the entire visual language

### Current Screen Set

- Main menu / hub
- Combat
- Skills
- Deck editor
- Codex
- Shop and packs
- Game over / run summary

### Combat UI Zones

- Top: scrolling run map and status framing
- Center: enemy or event hologram
- Bottom: hand, deck/discard interactions, player resource panel

### Current Presentation Features

- enemy intent bubble
- attack warning overlays
- level / sector banners
- loot fountain rewards
- animated combat effect layers
- event popups
- animated skill tree map
- animated pack reveals

## 15. Audio

Audio is not meaningfully implemented yet. The options menu currently shows volume as work-in-progress.

## 16. Technical And Production Constraints

These are critical current implementation constraints:

- The app is built in React + Vite with TailwindCSS and `lucide-react`.
- The project intentionally keeps all gameplay sub-components and render functions inside one monolithic `App()` function to preserve shared state scope and avoid re-render issues observed during development.
- Persistent meta data is stored in localStorage.
- Runtime content is loaded from CSV where possible.
- External image URLs should not be used.
- Visual iconography should rely on `lucide-react`.

## 17. Current Content Snapshot

### Current Starter Meta

- Starting deck contains basic mana, strike, shield, and cycle cards
- Skills and shop are initially locked
- Collection begins with multiple starter copies rather than a broad pool

### Current Data-Driven Content

- 28 card definitions in the current CSV
- 5 normal enemies
- 5 bosses

## 18. Future Expansion Priorities

The main long-term production priority is content breadth. The game should grow primarily by adding more cards, enemies, bosses, dungeon variants, archetypes, and progression routes while preserving the fast power-climb feel of the current core loop.

The strongest future expansion candidates are:

- true multi-color mana and deck identity
- multiple dungeon or run themes built on the current mostly linear structure
- boss reward choices after milestone kills
- in-run card draft or removal rewards
- relic-style modifiers for a single run
- top-deck visibility and deck-order knowledge
- card duplication or multi-play systems
- more dramatic rule-breaking upgrades
- richer archetypes for each color family
- more event types and branching reward moments

Priority order:

- first: broader content and variety
- second: deeper systemic layers that support that content
- third: optional structural complexity such as richer run modifiers and branching decisions

## 19. Design Summary

Codex Idle TCG is a real-time idle deckbuilder about turning pressure into momentum. The player begins with a small, clunky deck and gradually builds a faster, stronger, more automated engine through permanent skill unlocks, collection growth, duplicate upgrades, and deck refinement. The game should remain an idle-action deckbuilder first, with future depth coming from a large amount of content and variety rather than from becoming a rules-dense traditional TCG. The current build already establishes the core identity: timer-based combat, manual card sequencing, linear run progression, long-form power escalation, and a strong spectacle-driven cyber presentation. Future development should emphasize broader content, later color-system depth, reduced healing dependence, and major progression milestones that feel powerful enough to redefine how the game is played.

## 20. Current Implementation Notes

This section is intended as a living bridge between the design direction and the current playable build.

### Current Focus

The recent development focus has been combat readability, impact, and presentation polish rather than adding new macro systems. The game already contains enough core structure to validate the loop, so current iteration is centered on:

- making attacks feel punchier
- improving resource feedback
- making defensive and healing actions easier to read
- making card flow between deck, hand, and play area feel more tactile

### Recent Combat And HUD Polish

The current implementation now includes:

- stronger melee slash VFX with varied slash direction
- faster, punchier ranged projectile effects
- hit stop that scales with stronger attacks
- mana gain effects that gather into the MP counter
- delayed HP damage and healing bar transitions
- a large curved hex barrier wall for shield cards
- a block overlay directly on the player HP bar
- deck-linked draw-card effects with ghost-card flight and arrival pulse

These additions reinforce the game's intended identity as a spectacle-driven idle-action deckbuilder where even routine card plays should feel satisfying.

### Current Draw Effect Status

The deck-to-hand draw effect is partly complete and already much stronger than the earlier version.

Working pieces:

- deck-origin pulse and draw initiation feedback
- visible ghost card traveling toward the hand
- hand-slot landing pulse at the correct destination
- interaction protection so animated ghost cards do not block hand input

Open issue:

- the initial cyan hologram frame rendered around the moving draw ghost is still visually misaligned during flight

This is currently the main outstanding presentation bug.

### Near-Term Recommendation

Before expanding into more systems, the next iteration should finish stabilizing the draw-card presentation. Once that effect is fully aligned and reliable, the project can continue polishing:

- draw and discard readability
- additional card-category-specific VFX
- event presentation and reward feedback
- more cards, enemies, bosses, and dungeon content

### Production Reminder

The project still prioritizes content breadth over deeper systemic complexity. New development should continue respecting the main direction:

- keep the game in the idle-action deckbuilder space
- preserve the mostly linear run structure for now
- add more content variety first
- reserve major systemic expansion for later milestones where it can feel truly game-changing
