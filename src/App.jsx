import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import { 
  Trophy, Heart, Zap, Trash2, Shield, Sword, Coins, Play, 
  RotateCcw, BookOpen, Package, Layers, Plus, Minus, ArrowLeft, ArrowUpCircle,
  Hand, Pointer, Copy, Cpu, Tag, Hexagon, Star, Battery, Lock, Activity,
  Flame, Crosshair, Skull, FastForward, Link, Library, ChevronsUp, Cross,
  Droplets, Leaf, Gem, Snowflake, Ghost, Axe, Target, Wind, Sun, Search, Sparkles, Eye, ShieldPlus, Anvil, Dna, Magnet,
  Map as MapIcon, ChevronRight, Bug, Bot, Crown, Key, Tent
} from 'lucide-react';

// --- Icon Lookup Map for CSV Loading ---
const ICON_MAP = {
  Sparkles, Leaf, Droplets, Wind, Gem, Flame, Sword, Snowflake, Ghost, Axe,
  Skull, Target, Sun, Crosshair, Eye, Shield, ShieldPlus, Anvil, Hexagon, Zap,
  RotateCcw, FastForward, Magnet, Search, Cross, Dna, Bug, Bot, Crown, Activity, Cpu, ChevronsUp,
  Package, Heart, Key, Tent,
};

const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = values[i] || ''; });
    return obj;
  });
};

const getAssetPath = (relativePath) => `${import.meta.env.BASE_URL}${relativePath}`;

// --- Database & Constants ---

let CARD_DB = {
  // Mana
  'm1': { id: 'm1', name: 'Mana Spark', type: 'mana', cost: 0, color: 'W', value: 1, desc: '+[VAL] Mana', icon: Sparkles },
  'm2': { id: 'm2', name: 'Growth', type: 'mana', cost: 0, color: 'G', value: 2, desc: '+[VAL] Mana', icon: Leaf },
  'm3': { id: 'm3', name: 'Leyline Surge', type: 'mana', cost: 0, color: 'B', value: 3, desc: '+[VAL] Mana', icon: Droplets },
  'm4': { id: 'm4', name: 'Wild Gen', type: 'mana', cost: 0, color: 'W', value: 5, desc: '+[VAL] Mana', icon: Wind },
  'm5': { id: 'm5', name: 'Mana Geode', type: 'mana', cost: 0, color: 'W', value: 8, desc: '+[VAL] Mana', icon: Gem },
  'm6': { id: 'm6', name: 'Unstable Rift', type: 'mana', cost: 0, color: 'R', value: 15, desc: '+[VAL] Mana', icon: Flame },
  
  // Attack
  'a1': { id: 'a1', name: 'Strike', type: 'atk', cost: 1, color: 'W', value: 5, desc: '[VAL] Damage', icon: Sword },
  'a2': { id: 'a2', name: 'Fireball', type: 'atk', cost: 2, color: 'R', value: 15, desc: '[VAL] Damage', icon: Flame },
  'a3': { id: 'a3', name: 'Ice Bolt', type: 'atk', cost: 1, color: 'B', value: 8, desc: '[VAL] Damage', icon: Snowflake },
  'a4': { id: 'a4', name: 'Siphon', type: 'atk', cost: 1, color: 'B', value: 6, manaBonus: 1, desc: '[VAL] Dmg, +1 Mana', icon: Ghost },
  'a5': { id: 'a5', name: 'Overpower', type: 'atk', cost: 3, color: 'R', value: 30, desc: '[VAL] Damage', icon: Axe },
  'a6': { id: 'a6', name: 'Doom Blade', type: 'atk', cost: 5, color: 'W', value: 80, desc: '[VAL] Heavy Dmg', icon: Skull },
  'a7': { id: 'a7', name: 'Cyber Slash', type: 'atk', cost: 2, color: 'W', value: 20, desc: '[VAL] Dmg', icon: Target },
  'a8': { id: 'a8', name: 'Quick Slash', type: 'atk', cost: 0, color: 'W', value: 3, desc: '[VAL] Damage', icon: Sword },
  'a9': { id: 'a9', name: 'Meteor Strike', type: 'atk', cost: 4, color: 'R', value: 55, desc: '[VAL] Heavy Dmg', icon: Sun },
  'a10': { id: 'a10', name: 'Double Tap', type: 'atk', cost: 1, color: 'W', value: 4, multiHit: 2, desc: '[VAL] Dmg x2', icon: Crosshair },
  'a11': { id: 'a11', name: 'Void Ray', type: 'atk', cost: 7, color: 'B', value: 150, desc: '[VAL] Massive Dmg', icon: Eye },

  // Defense
  'd1': { id: 'd1', name: 'Minor Shield', type: 'def', cost: 1, color: 'W', value: 3, desc: '[VAL] Block', icon: Shield },
  'd2': { id: 'd2', name: 'Great Shield', type: 'def', cost: 2, color: 'W', value: 10, desc: '[VAL] Block', icon: ShieldPlus },
  'd3': { id: 'd3', name: 'Aegis', type: 'def', cost: 4, color: 'W', value: 30, desc: '[VAL] Block', icon: Anvil },
  'd4': { id: 'd4', name: 'Iron Skin', type: 'def', cost: 0, color: 'W', value: 4, desc: '[VAL] Block', icon: Hexagon },
  'd5': { id: 'd5', name: 'Plasma Wall', type: 'def', cost: 5, color: 'W', value: 50, desc: '[VAL] Block', icon: Zap },

  // Utility & Healing
  'u1': { id: 'u1', name: 'Cycle', type: 'util', cost: 0, color: 'W', value: 1, desc: 'Draw [VAL]', icon: RotateCcw },
  'u2': { id: 'u2', name: 'Quick Draw', type: 'util', cost: 1, color: 'W', value: 2, desc: 'Draw [VAL]', icon: FastForward },
  'u3': { id: 'u3', name: 'Pot of Greed', type: 'util', cost: 2, color: 'W', value: 3, desc: 'Draw [VAL]', icon: Magnet },
  'u4': { id: 'u4', name: 'Deep Search', type: 'util', cost: 3, color: 'B', value: 4, desc: 'Draw [VAL]', icon: Search },
  'u5': { id: 'u5', name: 'Battle Rhythm', type: 'util', cost: 1, color: 'R', value: 2, atkBuff: 2, desc: 'Gain +[VAL] Power', icon: Activity },
  'u6': { id: 'u6', name: 'Chain Protocol', type: 'util', cost: 2, color: 'R', value: 4, atkBuff: 4, desc: 'Gain +[VAL] Power', icon: Cpu },
  'h1': { id: 'h1', name: 'Mending Light', type: 'util', cost: 2, color: 'G', value: 10, isHeal: true, desc: 'Heal [VAL] HP', icon: Cross },
  'h2': { id: 'h2', name: 'Vitality', type: 'util', cost: 4, color: 'G', value: 25, isHeal: true, desc: 'Heal [VAL] HP', icon: Dna },
  'a12': { id: 'a12', name: 'Spark Barrage', type: 'atk', cost: 2, color: 'Y', value: 3, multiHit: 3, desc: '[VAL] Dmg x3', icon: ChevronsUp },
  'a13': { id: 'a13', name: 'Razor Storm', type: 'atk', cost: 3, color: 'Y', value: 4, multiHit: 4, desc: '[VAL] Dmg x4', icon: Wind },
  'a14': { id: 'a14', name: 'Needle Burst', type: 'atk', cost: 1, color: 'Y', value: 2, multiHit: 4, desc: '[VAL] Dmg x4', icon: Crosshair },
};

const ENEMY_LIST = [{name:'Enforcer',icon:Bug},{name:'Sentry',icon:Ghost},{name:'Drone',icon:Bot},{name:'Watcher',icon:Eye},{name:'Revenant',icon:Skull}];
const BOSS_LIST = [{name:'Void Reaver',icon:Target},{name:'Doom Guard',icon:Crown},{name:'Soul Eater',icon:Flame},{name:'Cyber Dragon',icon:Zap},{name:'Mana Wraith',icon:Hexagon}];

const PACK_SIZE = 5;
const BANNER_DEFS = [
  {
    id: 'standard',
    name: 'Core Archive',
    accent: 'cyan',
    icon: Package,
    description: 'Balanced core pool with fewer healing cards and fewer top-end mana spikes.',
    pool: ['m1', 'm2', 'm3', 'm4', 'a1', 'a2', 'a3', 'a4', 'a5', 'a7', 'a8', 'a9', 'a10', 'd1', 'd2', 'd3', 'd4', 'u1', 'u2', 'u3', 'u4', 'h1'],
    cardWeights: { h1: 0.45, m4: 0.7, a10: 0.8, d4: 1.1, u2: 1.1 },
    featuredCards: ['a9', 'd3', 'u4'],
  },
  {
    id: 'support',
    name: 'Recovery Protocol',
    accent: 'emerald',
    icon: Heart,
    description: 'Healing routines and stronger mana generation, padded with weaker offense and defense.',
    pool: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'a1', 'a3', 'd1', 'd2', 'u1', 'u2', 'h1', 'h2'],
    cardWeights: { m4: 1.35, m5: 1.45, m6: 0.8, h1: 1.5, h2: 1.15, a1: 0.65, a3: 0.7, d1: 0.8, d2: 0.8 },
    featuredCards: ['m6', 'h2', 'm5'],
  },
  {
    id: 'multihit',
    name: 'Flurry Engine',
    accent: 'amber',
    icon: ChevronsUp,
    description: 'Multi-hit attacks plus power buffs that scale each hit into a larger burst.',
    pool: ['m1', 'm2', 'm3', 'a1', 'a8', 'a10', 'a12', 'a13', 'a14', 'd1', 'd4', 'u1', 'u2', 'u5', 'u6'],
    cardWeights: { a10: 1.3, a12: 1.45, a13: 1.1, a14: 1.55, u5: 1.5, u6: 1.15, a1: 0.55, d1: 0.6 },
    featuredCards: ['a13', 'u6', 'a14'],
  },
];
const BANNER_MAP = Object.fromEntries(BANNER_DEFS.map((banner) => [banner.id, banner]));
const RARITY_PULL_WEIGHTS = { common: 74, rare: 21, epic: 4.25, legendary: 0.75 };
const FEATURE_LABELS = {
  skills: 'Skill Architecture',
  shop: 'Data Shop',
  codex: 'Codex',
  upgrades: 'Card Upgrades',
  banner_support: 'Recovery Protocol',
  banner_multihit: 'Flurry Engine',
  pull_5: 'Pull x5',
  pull_10: 'Pull x10',
};
const STAGE_DEFS = {
  1: {
    id: 1,
    name: 'Stage 1',
    era: 'Spire Protocol',
    summary: 'Early deckbuilding progression with simple combat economy, upgrades, and pack unlocks.',
  },
  2: {
    id: 2,
    name: 'Stage 2',
    era: 'Chromatic Grid',
    summary: 'Mana systems, higher pull counts, and more automation-oriented progression.',
  },
  3: {
    id: 3,
    name: 'Stage 3',
    era: 'Summon Lattice',
    summary: 'Extra-deck style systems, larger health scales, and enemy interference gimmicks.',
  },
  4: {
    id: 4,
    name: 'Stage 4',
    era: 'Astra Warp',
    summary: 'Character-driven meta systems, stickers, and full gacha-era progression.',
  },
};
const buildDungeonNodes = (totalRooms, specialNodes) => {
  const specialMap = new Map(specialNodes.map((node) => [node.room, node.value]));
  return Array.from({ length: totalRooms }, (_, index) => {
    const room = index + 1;
    if (specialMap.has(room)) return specialMap.get(room);
    return room % 10 === 0 ? 'boss' : room % 7 === 0 ? 'rest' : room % 5 === 0 ? 'treasure' : 'encounter';
  });
};
const DUNGEON_DEFS = [
  {
    id: 'null_corridor',
    stage: 1,
    name: 'Null Corridor',
    description: 'A short breach route that establishes the first layer of permanent systems.',
    nodes: buildDungeonNodes(30, [
      { room: 3, value: { type: 'unlock_feature', feature: 'skills', label: 'Unlock: Skills' } },
      { room: 6, value: { type: 'unlock_feature', feature: 'shop', label: 'Unlock: Shop' } },
      { room: 9, value: { type: 'unlock_feature', feature: 'codex', label: 'Unlock: Codex' } },
      { room: 14, value: { type: 'unlock_feature', feature: 'upgrades', label: 'Unlock: Upgrades' } },
      { room: 18, value: { type: 'unlock_feature', feature: 'banner_support', label: 'Unlock: Recovery Protocol' } },
      { room: 23, value: { type: 'unlock_feature', feature: 'banner_multihit', label: 'Unlock: Flurry Engine' } },
      { room: 27, value: { type: 'unlock_feature', feature: 'pull_5', label: 'Unlock: Pull x5' } },
    ]),
    unlocks: {
      stages: [2],
    },
  },
  {
    id: 'prism_archive',
    stage: 2,
    name: 'Prism Archive',
    description: 'A denser route that expands long-run throughput and larger pull bundles.',
    nodes: buildDungeonNodes(30, [
      { room: 17, value: { type: 'unlock_feature', feature: 'pull_10', label: 'Unlock: Pull x10' } },
    ]),
    unlocks: {
      stages: [3],
    },
  },
  {
    id: 'summon_vault',
    stage: 3,
    name: 'Summon Vault',
    description: 'A placeholder route for later summon-era systems and enemy gimmicks.',
    nodes: buildDungeonNodes(30, []),
    unlocks: {
      features: [],
      stages: [4],
    },
  },
];
const DUNGEON_MAP = Object.fromEntries(DUNGEON_DEFS.map((dungeon) => [dungeon.id, dungeon]));
const SKILL_STAGE_MAP = {
  hand_size: 1,
  opening_hand: 1,
  start_mana: 1,
  dmg_boost: 1,
  draw_multi: 1,
  start_mana_card: 1,
  first_strike: 1,
  heavy_strike: 1,
  boss_slayer: 1,
  shield_boost: 1,
  passive_flow: 1,
  kinetic_mana: 1,
  heavy_armor: 1,
  free_util: 1,
  overkill: 1,
  multi_strike: 1,
  auto_play_mana: 2,
  mana_retain: 2,
  mana_surge: 2,
  free_low_cost: 2,
  auto_draw: 2,
  draw_on_atk: 2,
  auto_gen: 2,
  mana_refund: 2,
  heal_boost: 2,
  mana_retain_full: 2,
  overkill_chain: 2,
  deck_master: 2,
};
const getSkillStage = (skillId) => SKILL_STAGE_MAP[skillId] || 1;

const loadGameData = async () => {
  try {
    const [cardsRes, enemiesRes] = await Promise.all([
      fetch(getAssetPath('data/cards.csv')),
      fetch(getAssetPath('data/enemies.csv'))
    ]);
    if (!cardsRes.ok) throw new Error(`Failed to load cards CSV: ${cardsRes.status}`);
    if (!enemiesRes.ok) throw new Error(`Failed to load enemies CSV: ${enemiesRes.status}`);
    const cardsText = await cardsRes.text();
    const enemiesText = await enemiesRes.text();

    const cardRows = parseCSV(cardsText);
    const db = {};
    cardRows.forEach(row => {
      const card = {
        id: row.id,
        name: row.name,
        type: row.type,
        cost: parseInt(row.cost) || 0,
        color: row.color,
        value: parseInt(row.value) || 0,
        desc: row.desc,
        icon: ICON_MAP[row.icon] || Sword,
      };
      if (row.manaBonus) card.manaBonus = parseInt(row.manaBonus);
      if (row.multiHit) card.multiHit = parseInt(row.multiHit);
      if (row.atkBuff) card.atkBuff = parseInt(row.atkBuff);
      if (row.isHeal === 'true') card.isHeal = true;
      db[card.id] = card;
    });
    if (Object.keys(db).length === 0) throw new Error('Cards CSV parsed with 0 rows');
    CARD_DB = db;

    const enemyRows = parseCSV(enemiesText);
    ENEMY_LIST.length = 0;
    BOSS_LIST.length = 0;
    enemyRows.filter(r => r.is_boss === 'false').forEach(r => ENEMY_LIST.push({ name: r.name, icon: ICON_MAP[r.icon] || Bug, hp: parseFloat(r.base_hp)||20, timer: parseFloat(r.base_timer)||4.0, dmg: parseFloat(r.base_damage)||5 }));
    enemyRows.filter(r => r.is_boss === 'true').forEach(r => BOSS_LIST.push({ name: r.name, icon: ICON_MAP[r.icon] || Crown, hp: parseFloat(r.base_hp)||100, timer: parseFloat(r.base_timer)||15.0, dmg: parseFloat(r.base_damage)||20 }));

    console.log(`Loaded ${Object.keys(CARD_DB).length} cards, ${ENEMY_LIST.length} enemies, ${BOSS_LIST.length} bosses from CSV`);
  } catch (e) {
    console.warn('CSV load failed, using inline fallback data', e);
  }
};

loadGameData();



const UPGRADE_COSTS = [5, 10, 20]; 

// --- Grand Skill Architecture ---
const SKILL_TREE_DICT = {
  hand_size:       { id: 'hand_size', name: 'Ample Grip', desc: '+1 Max Hand Size', cost: 100, icon: Hand, branch: 'core', requiresAny: [], effect: (s) => ({ ...s, maxHand: s.maxHand + 1 }) },
  opening_hand:    { id: 'opening_hand', name: 'Preparation', desc: '+1 Opening Hand', cost: 500, branch: 'sys', requiresAny: ['hand_size'], icon: BookOpen, effect: (s) => ({ ...s, openingHand: s.openingHand + 1 }) },
  start_mana:      { id: 'start_mana', name: 'Leyline Tap', desc: 'Start fights with +1 Mana', cost: 500, branch: 'flow', requiresAny: ['hand_size'], icon: Zap, effect: (s) => ({ ...s, startMana: s.startMana + 1 }) },
  dmg_boost:       { id: 'dmg_boost', name: 'Sharpened Mind', desc: '+2 Damage to all cards', cost: 500, branch: 'dmg', requiresAny: ['hand_size'], icon: Sword, effect: (s) => ({ ...s, dmgMod: s.dmgMod + 2 }) },
  draw_multi:      { id: 'draw_multi', name: 'Dual Draw', desc: 'Draw 2 cards per action', cost: 1500, branch: 'sys', requiresAny: ['opening_hand'], icon: Copy, effect: (s) => ({ ...s, drawMulti: 2 }) },
  start_mana_card: { id: 'start_mana_card', name: 'Spark Attunement', desc: 'Always draw Mana first', cost: 1500, branch: 'flow', requiresAny: ['start_mana'], icon: Star, effect: (s) => ({ ...s, startWithManaCard: true }) },
  first_strike:    { id: 'first_strike', name: 'First Strike', desc: '2x Dmg vs Full HP', cost: 1500, branch: 'dmg', requiresAny: ['dmg_boost'], icon: Flame, effect: (s) => ({ ...s, firstStrike: true }) },
  heavy_strike:    { id: 'heavy_strike', name: 'Heavy Blow', desc: '+15 Dmg for 3+ Cost cards', cost: 6000, branch: 'dmg', requiresAny: ['first_strike', 'heavy_armor'], icon: Crosshair, effect: (s) => ({ ...s, heavyDmgMod: s.heavyDmgMod + 15 }) },
  auto_draw:       { id: 'auto_draw', name: 'Cyber Draw', desc: 'Auto-Draw 1 / 3s', cost: 6000, branch: 'sys', requiresAny: ['draw_multi', 'free_util'], icon: Cpu, effect: (s) => ({ ...s, autoDrawRate: 3 }) },
  draw_on_atk:     { id: 'draw_on_atk', name: 'Battle Reflex', desc: 'Draw 1 on Attack', cost: 6000, branch: 'sys', requiresAny: ['draw_multi'], icon: Crosshair, effect: (s) => ({ ...s, drawOnAtk: true }) },
  mana_surge:      { id: 'mana_surge', name: 'Overcharge', desc: 'Mana cards give +1 extra', cost: 6000, branch: 'flow', requiresAny: ['start_mana_card', 'passive_flow'], icon: Battery, effect: (s) => ({ ...s, manaSurge: true }) },
  boss_slayer:     { id: 'boss_slayer', name: 'Boss Slayer', desc: '+50% Dmg vs Bosses', cost: 6000, branch: 'dmg', requiresAny: ['first_strike', 'kinetic_mana'], icon: Skull, effect: (s) => ({ ...s, bossSlayer: true }) },
  auto_play_mana:  { id: 'auto_play_mana', name: 'Mana AI', desc: 'Auto-play Mana cards', cost: 1500, branch: 'util', requiresAny: ['shield_boost'], icon: Play, effect: (s) => ({ ...s, autoPlayMana: true }) },
  mana_retain:     { id: 'mana_retain', name: 'Mana Flow', desc: 'Keep 50% Mana on kill', cost: 6000, branch: 'flow', requiresAny: ['start_mana_card', 'kinetic_mana'], icon: Lock, effect: (s) => ({ ...s, manaRetain: 0.5 }) },
  overkill:        { id: 'overkill', name: 'Piercing Strike', desc: 'Overkill damage spills over', cost: 12000, branch: 'dmg', requiresAny: ['heavy_strike', 'boss_slayer'], icon: FastForward, effect: (s) => ({ ...s, overkill: true }) },
  free_low_cost:   { id: 'free_low_cost', name: 'Cost Collapse', desc: '1-Cost cards become FREE', cost: 6000, branch: 'util', requiresAny: ['auto_play_mana', 'free_util'], icon: Tag, effect: (s) => ({ ...s, freeLowCost: true }) },
  auto_gen:        { id: 'auto_gen', name: 'Passive Flow', desc: 'Regen 1 Mana / 5s', cost: 12000, branch: 'cross', requiresAny: ['mana_retain', 'boss_slayer'], icon: Activity, effect: (s) => ({ ...s, regenRate: s.regenRate + 0.2 }) },
  overkill_chain:  { id: 'overkill_chain', name: 'Infinite Chain', desc: 'Overkill chains endlessly', cost: 25000, branch: 'dmg', requiresAny: ['overkill'], icon: Link, effect: (s) => ({ ...s, overkillChain: true }) },
  deck_master:     { id: 'deck_master', name: 'Limit Break', desc: '+2 Max Hand', cost: 25000, branch: 'sys', requiresAny: ['auto_draw', 'draw_on_atk'], icon: Hexagon, effect: (s) => ({ ...s, maxHand: s.maxHand + 2 }) },
  mana_refund:     { id: 'mana_refund', name: 'Echo Casting', desc: 'Cards refund 1 Mana', cost: 6000, branch: 'util', requiresAny: ['auto_play_mana', 'heavy_armor'], icon: RotateCcw, effect: (s) => ({ ...s, manaRefund: true }) },
  shield_boost:    { id: 'shield_boost', name: 'Phalanx', desc: '+5 to all Shields', cost: 500, branch: 'util', requiresAny: ['hand_size'], icon: Shield, effect: (s) => ({ ...s, shieldBoost: s.shieldBoost + 5 }) },
  heal_boost:      { id: 'heal_boost', name: 'Mending Aura', desc: 'Healing increased by 50%', cost: 12000, branch: 'util', requiresAny: ['free_low_cost', 'mana_refund'], icon: Heart, effect: (s) => ({ ...s, healBoost: true }) },
  passive_flow:    { id: 'passive_flow', name: 'Passive Flow', desc: 'Regen 1 Mana / 5s', cost: 3000, branch: 'cross', requiresAny: ['opening_hand', 'start_mana'], icon: Activity, effect: (s) => ({ ...s, regenRate: s.regenRate + 0.2 }) },
  kinetic_mana:    { id: 'kinetic_mana', name: 'Kinetic Energy', desc: 'Mana cards deal 5 Dmg', cost: 3000, branch: 'cross', requiresAny: ['start_mana', 'dmg_boost'], icon: Zap, effect: (s) => ({ ...s, kineticMana: true }) },
  heavy_armor:     { id: 'heavy_armor', name: 'Heavy Armor', desc: 'Heavy attacks give 5 Shield', cost: 3000, branch: 'cross', requiresAny: ['dmg_boost', 'shield_boost'], icon: Shield, effect: (s) => ({ ...s, heavyArmor: true }) },
  free_util:       { id: 'free_util', name: 'Fluid Mechanics', desc: 'Draw cards cost 0', cost: 3000, branch: 'cross', requiresAny: ['shield_boost', 'opening_hand'], icon: Tag, effect: (s) => ({ ...s, freeUtil: true }) },
  mana_retain_full:{ id: 'mana_retain_full', name: 'Perfect Flow', desc: 'Keep 100% Mana on kill', cost: 25000, branch: 'flow', requiresAny: ['mana_surge', 'mana_retain'], icon: Lock, effect: (s) => ({ ...s, manaRetain: 1.0 }) },
  multi_strike:    { id: 'multi_strike', name: 'Flurry', desc: 'Multi-hit cards hit +1 time', cost: 12000, branch: 'dmg', requiresAny: ['heavy_strike'], icon: Sword, effect: (s) => ({ ...s, multiStrike: true }) },
};

const NODE_POS = {
   hand_size:        { x: 50, y: 50 },

   opening_hand:     { x: 50, y: 35 },
   draw_multi:       { x: 50, y: 20 },
   auto_draw:        { x: 35, y: 10 },
   draw_on_atk:      { x: 65, y: 10 },
   deck_master:      { x: 50, y: 5 },

   start_mana:       { x: 65, y: 50 },
   start_mana_card:  { x: 80, y: 50 },
   mana_surge:       { x: 90, y: 35 },
   mana_retain:      { x: 90, y: 65 },
   mana_retain_full: { x: 95, y: 50 },

   dmg_boost:        { x: 50, y: 65 },
   first_strike:     { x: 50, y: 80 },
   heavy_strike:     { x: 35, y: 90 },
   boss_slayer:      { x: 65, y: 90 },
   multi_strike:     { x: 20, y: 95 },
   overkill:         { x: 50, y: 95 },
   overkill_chain:   { x: 80, y: 95 },

   shield_boost:     { x: 35, y: 50 },
   auto_play_mana:   { x: 20, y: 50 },
   free_low_cost:    { x: 10, y: 35 },
   mana_refund:      { x: 10, y: 65 },
   heal_boost:       { x: 5,  y: 50 },

   passive_flow:     { x: 65, y: 35 },
   kinetic_mana:     { x: 65, y: 65 },
   heavy_armor:      { x: 35, y: 65 },
   free_util:        { x: 35, y: 35 },
   auto_gen:         { x: 80, y: 80 },
};

const BRANCH_COLORS = {
    core:  { text: 'text-cyan-300', border: 'border-cyan-400', shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]', bg: 'bg-cyan-900/50' },
    sys:   { text: 'text-blue-300', border: 'border-blue-400', shadow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]', bg: 'bg-blue-900/50' },
    flow:  { text: 'text-emerald-300', border: 'border-emerald-400', shadow: 'shadow-[0_0_20px_rgba(52,211,153,0.5)]', bg: 'bg-emerald-900/50' },
    dmg:   { text: 'text-red-300', border: 'border-red-400', shadow: 'shadow-[0_0_20px_rgba(248,113,113,0.5)]', bg: 'bg-red-900/50' },
    util:  { text: 'text-purple-300', border: 'border-purple-400', shadow: 'shadow-[0_0_20px_rgba(192,132,252,0.5)]', bg: 'bg-purple-900/50' },
    cross: { text: 'text-amber-300', border: 'border-amber-400', shadow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]', bg: 'bg-amber-900/50' },
};

const CARD_BGS = {
  atk: 'from-[#c8995a] to-[#996e38]', 
  mana: 'from-[#1b8c6a] to-[#0f5942]', 
  util: 'from-[#20639b] to-[#103a5c]', 
  def: 'from-[#bc3782] to-[#7a1c50]',
  heal: 'from-[#c85a8a] to-[#993863]'
};

// ENEMY_ICONS now sourced from ENEMY_LIST (loaded from CSV)
// BOSS_ICONS now sourced from BOSS_LIST (loaded from CSV)

const WARNING_TEXTS = Array(20).fill("WARNING");
const DANGER_TEXTS = Array(20).fill("DANGER");
const MELEE_ATTACK_IDS = new Set(['a1', 'a5', 'a7', 'a8', 'a10']);

// --- Utilities ---
const shuffle = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const DEFAULT_META = {
    saveVersion: 2,
    stage: 1,
    unlockedStages: [1],
    unlockedFeatures: [],
    completedDungeons: [],
    gp: 0, fragments: 0, packs: 0,
    maxHand: 5, openingHand: 5,
    startMana: 0, regenRate: 0,
    dmgMod: 0, heavyDmgMod: 0, shieldBoost: 0, healBoost: false,
    manaRetain: 0, drawMulti: 1,
    startWithManaCard: false, overkill: false, overkillChain: false,
    freeLowCost: false, freeUtil: false,
    autoDrawRate: 0, autoPlayMana: false,
    manaSurge: false, manaRefund: false, kineticMana: false,
    firstStrike: false, bossSlayer: false, heavyArmor: false, drawOnAtk: false, multiStrike: false,
    unlockedSkills: [], collection: { 'm1': 5, 'a1': 5, 'd1': 2, 'u1': 1 },
    cardLevels: {}, activeDeck: ['m1', 'm1', 'm1', 'm1', 'a1', 'a1', 'a1', 'a1', 'd1', 'u1']
};

// --- Components ---

const Card = ({ cardId, overrideCard, onPlay, onDiscard, effectiveCost, canAfford, scale = 1, inHand = false, level = 1, overrideValue, isDiscardMode = false, isAnimNew = false, isEventNode = false, pixelWidth, pixelHeight, disableInteraction = false }) => {
  const card = overrideCard || CARD_DB[cardId];
  if (!card) return null;

  const displayCost = effectiveCost !== undefined ? effectiveCost : card.cost;
  const costColor = displayCost < card.cost ? "text-cyan-300 drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]" : "text-yellow-300";
  const displayVal = overrideValue !== undefined ? overrideValue : card.value;
  const descText = card.desc.replace('[VAL]', displayVal);

  const isRare = card.cost >= 2 && card.cost <= 3;
  const isLegendary = card.cost >= 4;

  let foilClass = "bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.1)_25%,transparent_30%)] md:group-hover:translate-x-full transition-transform duration-700";
  if (isLegendary) {
      foilClass = "bg-[linear-gradient(105deg,rgba(255,0,0,0.3),rgba(255,255,0,0.3),rgba(0,255,0,0.3),rgba(0,255,255,0.3),rgba(0,0,255,0.3),rgba(255,0,255,0.3))] bg-[length:300%_300%] animate-[foil-legendary_4s_linear_infinite] mix-blend-color-dodge opacity-80";
  } else if (isRare) {
      foilClass = "bg-[linear-gradient(105deg,transparent_25%,rgba(255,255,255,0.4)_40%,rgba(255,255,255,0.7)_50%,rgba(255,255,255,0.4)_60%,transparent_75%)] bg-[length:400%_100%] animate-[foil-rare_4s_ease-in-out_infinite] mix-blend-overlay opacity-60";
  }

  const IconComponent = card.icon || Sword;
  const getIconColor = (c) => {
      if (c.isHeal) return 'text-pink-100';
      if (c.type === 'atk') return 'text-orange-100';
      if (c.type === 'mana') return 'text-green-100';
      if (c.type === 'def') return 'text-blue-100';
      return 'text-purple-100';
  };
  
  const outerBg = CARD_BGS[card.isHeal ? 'heal' : card.type] || 'from-gray-400 to-gray-600';

  return (
    <div 
      draggable={inHand}
      onDragStart={(e) => {
          if (inHand) {
              e.dataTransfer.setData('text/plain', card.runId);
          }
      }}
      className={`relative rounded shadow-[0_5px_15px_rgba(0,0,0,0.6)] transition-all duration-300 transform font-tech
        ${inHand ? 'md:hover:-translate-y-4 hover:shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-10' : ''}
        ${(!canAfford || isEventNode) && inHand && !isDiscardMode ? 'opacity-50 grayscale hover:grayscale-0' : 'opacity-100'}
        ${isAnimNew ? 'animate-[popIn_0.3s_ease-out]' : ''}
        flex flex-col p-[3px] bg-gradient-to-br ${outerBg} select-none border border-black group ${disableInteraction ? 'pointer-events-none' : 'cursor-pointer'} overflow-hidden`}
      style={pixelWidth && pixelHeight ? { width: `${pixelWidth}px`, height: `${pixelHeight}px` } : { width: `${8 * scale}rem`, height: `${12 * scale}rem` }}
      onClick={(e) => { 
          if (disableInteraction) return;
          if (inHand && isDiscardMode && onDiscard) {
              onDiscard(card.runId);
          } else if (canAfford && onPlay && !isDiscardMode && !isEventNode) {
              const rect = e.currentTarget.getBoundingClientRect();
              onPlay(card, {
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                  width: rect.width,
                  height: rect.height,
              });
          } 
      }}
    >
      <div className={`absolute inset-0 pointer-events-none z-20 ${foilClass}`} />

      {isDiscardMode && inHand && (
          <div className="absolute inset-0 bg-red-600/60 z-30 flex items-center justify-center backdrop-blur-[1px] transition-all hover:bg-red-500/80">
              <Trash2 size={36 * scale} className="text-white drop-shadow-md animate-bounce" />
          </div>
      )}

      <div className="bg-slate-900 h-full flex flex-col p-0.5 gap-0.5 relative pointer-events-none z-10 rounded-[1px]">
         <div className="flex justify-between items-center bg-black/60 p-1 rounded-sm border border-slate-700 shadow-sm relative z-20">
            {level > 1 && (
                <div className="absolute -top-2 -left-2 bg-blue-600 border border-blue-300 rounded text-[10px] font-black px-1.5 z-30 shadow-md">
                    Lv.{level}
                </div>
            )}
            <span className={`font-black text-white shadow-black drop-shadow-md truncate tracking-tight ${level > 1 ? 'ml-4' : ''}`} style={{ fontSize: `${0.85 * scale}rem` }}>{card.name}</span>
            <div className="flex items-center justify-center bg-yellow-500/30 rounded-full border border-yellow-500/50 shadow-[0_0_5px_rgba(250,204,21,0.5)] shrink-0" style={{ width: `${1.3 * scale}rem`, height: `${1.3 * scale}rem` }}>
                <span className={`font-black ${costColor}`} style={{ fontSize: `${0.9 * scale}rem` }}>{displayCost}</span>
            </div>
         </div>
         
         <div className={`flex-grow w-full bg-slate-800 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center relative overflow-hidden`}>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]" />
             <IconComponent size={32 * scale} className={`relative z-10 ${getIconColor(card)} drop-shadow-[0_0_8px_currentColor]`} />
         </div>
         
         <div className={`h-[42%] bg-[#e8deca] border border-black/40 rounded-sm p-1.5 shadow-[inset_0_0_8px_rgba(0,0,0,0.3)] text-black flex flex-col relative shrink-0 ${disableInteraction ? 'pointer-events-none' : 'pointer-events-auto'}`}>
             <div className="font-black uppercase mb-1 border-b border-black/20 pb-0.5 flex justify-between tracking-tighter" style={{ fontSize: `${0.6 * scale}rem` }}>
                 <span>[{card.isHeal ? 'heal' : card.type}]</span>
                 <span className={level > 1 ? 'text-blue-700 font-bold' : ''}>{displayVal > 0 ? `PWR ${displayVal}` : ''}</span>
             </div>
             <div className="font-read flex-grow flex items-center justify-center text-center font-bold leading-tight" style={{ fontSize: `${0.8 * scale}rem` }}>
                 {descText}
             </div>
         </div>
      </div>
    </div>
  );
};

const CombatStatusPanel = ({ isPlayer, hp, maxHp, title, showDanger, extraContent, healPulseSignal = 0, shield = 0 }) => {
    const [displayHp, setDisplayHp] = useState(hp);
    const [damageGhostHp, setDamageGhostHp] = useState(hp);
    const [healGhostHp, setHealGhostHp] = useState(hp);
    const [isHealing, setIsHealing] = useState(false);
    const [isTakingDamage, setIsTakingDamage] = useState(false);
    const prevHpRef = useRef(hp);
    const lastHealPulseRef = useRef(healPulseSignal);

    useEffect(() => {
        const prevHp = prevHpRef.current;
        prevHpRef.current = hp;

        const timers = [];
        const clearTimers = () => timers.forEach(clearTimeout);

        if (hp < prevHp) {
            timers.push(setTimeout(() => {
                setIsHealing(false);
                setIsTakingDamage(true);
                setDisplayHp(prevHp);
                setDamageGhostHp(prevHp);
                setHealGhostHp(hp);
            }, 0));
            timers.push(setTimeout(() => setDisplayHp(hp), 120));
            timers.push(setTimeout(() => setDamageGhostHp(hp), 300));
            timers.push(setTimeout(() => setIsTakingDamage(false), 340));
        } else if (hp > prevHp) {
            timers.push(setTimeout(() => {
                setDisplayHp(prevHp);
                setDamageGhostHp(prevHp);
                setHealGhostHp(hp);
                setIsHealing(true);
                setIsTakingDamage(false);
            }, 0));
            timers.push(setTimeout(() => setDisplayHp(hp), 120));
            timers.push(setTimeout(() => setDamageGhostHp(hp), 120));
            timers.push(setTimeout(() => setHealGhostHp(hp), 420));
            timers.push(setTimeout(() => setIsHealing(false), 500));
        } else {
            timers.push(setTimeout(() => {
                setDisplayHp(hp);
                setDamageGhostHp(hp);
                setHealGhostHp(hp);
                setIsTakingDamage(false);
            }, 0));
        }

        return clearTimers;
    }, [hp]);

    useEffect(() => {
        if (!isPlayer || !healPulseSignal || healPulseSignal === lastHealPulseRef.current) return;
        lastHealPulseRef.current = healPulseSignal;

        const startTimer = setTimeout(() => {
            setIsHealing(true);
            setIsTakingDamage(false);
            setHealGhostHp((current) => Math.max(current, hp));
        }, 0);
        const endTimer = setTimeout(() => setIsHealing(false), 500);
        return () => {
            clearTimeout(startTimer);
            clearTimeout(endTimer);
        };
    }, [healPulseSignal, hp, isPlayer]);

    const clampPct = (value) => Math.max(0, Math.min(100, (value / maxHp) * 100));
    const displayPct = clampPct(displayHp);
    const damageGhostPct = clampPct(damageGhostHp);
    const healGhostPct = clampPct(healGhostHp);
    const shieldPct = clampPct(shield);
    const fillClass = isPlayer
        ? 'bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]'
        : 'bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)]';

    const showHealingBarEffect = isPlayer && isHealing;

    return (
        <div className={`w-full max-w-sm sm:max-w-md space-y-2 relative z-30 bg-black/80 p-4 rounded-lg border ${isPlayer ? 'border-cyan-900/50' : 'border-red-900/50'} backdrop-blur-md shadow-2xl transition-all duration-300`}>
            <div className="flex justify-between items-end px-1">
                <div className="flex items-center gap-2">
                    <Heart className={isPlayer ? "text-cyan-500" : "text-red-500"} size={16} />
                    <span className={`${isPlayer ? "text-cyan-400" : "text-red-400"} text-xs sm:text-sm tracking-widest font-black`}>{Math.ceil(hp)} / {maxHp} HP</span>
                </div>
                <span className={`font-black text-[10px] uppercase tracking-[0.3em] ${showDanger ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                    {title}
                </span>
            </div>
            <div className="relative w-full">
                <div className={`w-full h-3 bg-black rounded-sm border overflow-hidden relative ${showHealingBarEffect ? 'border-green-200 shadow-[0_0_42px_rgba(74,222,128,1)] animate-[heal-bar-glow_540ms_cubic-bezier(0.16,0.84,0.24,1)_forwards]' : 'border-slate-700 transition-colors duration-200'}`}>
                    <div className="absolute inset-0 bg-slate-950" />
                    {showHealingBarEffect && (
                        <div className="absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[2px] animate-[heal-bar-sheen_480ms_cubic-bezier(0.18,0.88,0.24,1)_forwards]" />
                    )}
                    <div className="absolute left-0 top-0 h-full bg-white/90 transition-[width] duration-220 ease-out" style={{ width: `${damageGhostPct}%` }} />
                    {showHealingBarEffect && healGhostPct > displayPct && (
                        <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-300/95 via-emerald-200/95 to-green-300/90 shadow-[0_0_30px_rgba(74,222,128,1)] transition-[width] duration-[420ms] ease-out" style={{ width: `${healGhostPct}%` }} />
                    )}
                    {isTakingDamage && damageGhostPct > displayPct && (
                        <div
                            className="absolute top-0 h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-200 ease-out"
                            style={{ left: `${displayPct}%`, width: `${Math.max(0, damageGhostPct - displayPct)}%` }}
                        />
                    )}
                    <div className={`absolute left-0 top-0 h-full transition-[width] duration-260 ease-out ${fillClass} ${showHealingBarEffect ? 'shadow-[0_0_56px_rgba(74,222,128,1)] brightness-[1.56] saturate-[1.28] animate-[heal-fill-flash_520ms_cubic-bezier(0.16,0.84,0.24,1)_forwards]' : ''}`} style={{ width: `${displayPct}%` }} />
                </div>
                {isPlayer && shield > 0 && (
                    <div
                        className="absolute left-0 -top-[2px] h-[calc(100%+4px)] overflow-hidden pointer-events-none transition-[width] duration-200 ease-out rounded-sm z-[3]"
                        style={{ width: `${shieldPct}%` }}
                    >
                        <div className="absolute inset-0 rounded-sm bg-gradient-to-b from-sky-100/75 via-cyan-200/45 to-blue-500/25 border border-cyan-100/75 border-r-cyan-100/100 shadow-[inset_0_0_12px_rgba(255,255,255,0.4),0_0_14px_rgba(56,189,248,0.55)]" />
                        <div
                            className="absolute inset-0 opacity-80 mix-blend-screen"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='24' viewBox='0 0 30 24'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='1.25' stroke-linejoin='round'%3E%3Cpath d='M7 2 L13.5 6 L13.5 14 L7 18 L0.5 14 L0.5 6 Z'/%3E%3Cpath d='M22.5 6 L29 10 L29 18 L22.5 22 L16 18 L16 10 Z'/%3E%3C/g%3E%3C/svg%3E")`,
                                backgroundSize: '22px 18px',
                                backgroundRepeat: 'repeat',
                                backgroundPosition: '5px 2px',
                            }}
                        />
                    </div>
                )}
            </div>
            {extraContent && (
                <div className="mt-2">
                    {extraContent}
                </div>
            )}
        </div>
    );
};

const CombatVfxCanvas = ({ activeEffects, enemyAttackEffects, hitStopUntil, enemyRef }) => {
    const MAX_CANVAS_PARTICLES = 240;
    const canvasRef = useRef(null);
    const rafRef = useRef(0);
    const resizeObserverRef = useRef(null);
    const particlesRef = useRef([]);
    const seenActiveRef = useRef(new Set());
    const seenEnemyRef = useRef(new Set());
    const lastFrameRef = useRef(0);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    }, []);

    const getMetrics = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const enemyRect = enemyRef.current?.getBoundingClientRect();
        const fallbackEnemy = { x: rect.width * 0.5, y: rect.height * 0.44 };
        const enemyCenter = enemyRect
            ? {
                x: enemyRect.left - rect.left + enemyRect.width / 2,
                y: enemyRect.top - rect.top + enemyRect.height / 2,
            }
            : fallbackEnemy;
        return {
            width: rect.width,
            height: rect.height,
            enemy: enemyCenter,
            player: { x: rect.width * 0.5, y: rect.height * 0.965 },
        };
    }, [enemyRef]);

    const pushParticle = useCallback((particle) => {
        const particles = particlesRef.current;
        if (particles.length >= MAX_CANVAS_PARTICLES) {
            particles.splice(0, Math.max(1, particles.length - MAX_CANVAS_PARTICLES + 1));
        }
        particles.push(particle);
    }, []);

    const withAlpha = useCallback((rgba, alpha) => {
        const match = rgba.match(/rgba\((\d+),(\d+),(\d+),[^)]+\)/);
        if (!match) return rgba;
        return `rgba(${match[1]},${match[2]},${match[3]},${alpha})`;
    }, []);

    const spawnImpactBurst = useCallback((origin, color, count, now, spread = 1) => {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
            pushParticle({
                kind: 'spark',
                born: now + i * 6,
                ttl: 150 + Math.random() * 70,
                x: origin.x,
                y: origin.y,
                vx: Math.cos(angle) * (560 + Math.random() * 440) * spread,
                vy: Math.sin(angle) * (420 + Math.random() * 340) * spread,
                damping: 2.8 + Math.random() * 0.8,
                length: 34 + Math.random() * 52,
                width: 2 + Math.random() * 2.8,
                color,
            });
        }
    }, [pushParticle]);

    const spawnActiveEffect = useCallback((fx) => {
        const metrics = getMetrics();
        if (!metrics) return;
        const now = performance.now();
        const profile = fx.attackProfile;

        if (fx.type === 'atk' && profile) {
            const powerScale = fx.cost >= 5 ? 1.55 : fx.cost >= 3 ? 1.28 : 1;
            if (profile.style === 'melee') {
                const slashLength = metrics.width * (fx.cost >= 3 ? 1.05 : 0.94);
                const slashDirections = [-72, -48, -24, 18, 42, 66];
                const randomDirection = slashDirections[Math.floor(Math.random() * slashDirections.length)];
                const randomJitter = (Math.random() - 0.5) * 18;
                pushParticle({
                    kind: 'slash',
                    born: now,
                    ttl: 180,
                    x: metrics.enemy.x,
                    y: metrics.enemy.y,
                    angle: (randomDirection + randomJitter) * (Math.PI / 180),
                    length: slashLength * powerScale,
                    width: (fx.cost >= 3 ? 26 : 16) * powerScale,
                    colorA: 'rgba(255,244,244,1)',
                    colorB: 'rgba(255,48,48,0.95)',
                    offset: (Math.random() - 0.5) * 20,
                });
                pushParticle({
                    kind: 'coreFlash',
                    born: now,
                    ttl: 135,
                    x: metrics.enemy.x,
                    y: metrics.enemy.y,
                    radius: (fx.cost >= 3 ? 68 : 50) * powerScale,
                    color: 'rgba(255,70,70,0.95)',
                });
                pushParticle({
                    kind: 'coreFlash',
                    born: now + 24,
                    ttl: 150,
                    x: metrics.enemy.x,
                    y: metrics.enemy.y,
                    radius: (fx.cost >= 3 ? 88 : 64) * powerScale,
                    color: 'rgba(255,24,24,0.78)',
                });
                pushParticle({
                    kind: 'ring',
                    born: now,
                    ttl: 220,
                    x: metrics.enemy.x,
                    y: metrics.enemy.y,
                    radius: (fx.cost >= 3 ? 128 : 98) * powerScale,
                    lineWidth: (fx.cost >= 3 ? 9 : 6) * powerScale,
                    color: 'rgba(255,58,58,0.9)',
                });
                spawnImpactBurst(metrics.enemy, 'rgba(255,240,240,0.95)', fx.cost >= 3 ? 34 : 24, now, fx.cost >= 3 ? 2.7 : 1.95);
                spawnImpactBurst(metrics.enemy, 'rgba(255,90,90,0.92)', fx.cost >= 3 ? 18 : 10, now + 16, fx.cost >= 3 ? 1.65 : 1.15);
            } else {
                pushParticle({
                    kind: 'projectile',
                    born: now,
                    ttl: fx.cost >= 3 ? 130 : 95,
                    x0: metrics.player.x,
                    y0: metrics.player.y - 28,
                    x1: metrics.enemy.x,
                    y1: metrics.enemy.y,
                    width: profile.projectileWidth * (fx.cost >= 3 ? 2.1 : 1.65),
                    color: profile.impactColor,
                    glow: fx.cost >= 3 ? 54 : 34,
                    headRadius: fx.cost >= 3 ? 24 : 16,
                });
                pushParticle({
                    kind: 'muzzle',
                    born: now,
                    ttl: 90,
                    x: metrics.player.x,
                    y: metrics.player.y - 28,
                    radius: fx.cost >= 3 ? 38 : 28,
                    spikeLength: fx.cost >= 3 ? 72 : 52,
                    color: withAlpha(profile.impactColor, 0.92),
                    rotation: (Math.random() - 0.5) * 0.26,
                });
                pushParticle({
                    kind: 'coreFlash',
                    born: now + (fx.cost >= 3 ? 72 : 56),
                    ttl: 130,
                    x: metrics.enemy.x,
                    y: metrics.enemy.y,
                    radius: 42 * powerScale,
                    color: profile.impactColor,
                });
                pushParticle({
                    kind: 'ring',
                    born: now + (fx.cost >= 3 ? 68 : 52),
                    ttl: 150,
                    x: metrics.enemy.x,
                    y: metrics.enemy.y,
                    radius: (fx.cost >= 3 ? 116 : 84) * powerScale,
                    lineWidth: (fx.cost >= 3 ? 8 : 5) * powerScale,
                    color: profile.impactColor,
                });
                spawnImpactBurst(metrics.enemy, 'rgba(230,250,255,0.95)', fx.cost >= 3 ? 34 : 24, now + (fx.cost >= 3 ? 68 : 52), fx.cost >= 3 ? 2.35 : 1.85);
                spawnImpactBurst(metrics.enemy, withAlpha(profile.impactColor, 0.95), fx.cost >= 3 ? 16 : 10, now + (fx.cost >= 3 ? 82 : 64), fx.cost >= 3 ? 1.45 : 1.12);
            }
            return;
        }

        if (fx.type === 'def' || fx.type === 'heal' || fx.type === 'util') {
            const color = fx.type === 'def'
                ? 'rgba(96,165,250,0.85)'
                : fx.type === 'heal'
                    ? 'rgba(74,222,128,0.9)'
                    : 'rgba(34,211,238,0.85)';
            if (fx.type === 'def') {
                pushParticle({
                    kind: 'barrier',
                    born: now,
                    ttl: 340,
                    x: metrics.player.x,
                    y: metrics.height * 0.94,
                    width: Math.min(860, metrics.width * 0.98),
                    height: Math.min(238, metrics.height * 0.34),
                    color: 'rgba(96,165,250,0.92)',
                    glow: 'rgba(125,211,252,0.9)',
                    cellSize: 34,
                });
            } else if (fx.type === 'util') {
                pushParticle({
                    kind: 'ring',
                    born: now,
                    ttl: 240,
                    x: metrics.player.x,
                    y: metrics.player.y - 10,
                    radius: 86,
                    lineWidth: 4,
                    color,
                    dashed: true,
                });
                pushParticle({
                    kind: 'coreFlash',
                    born: now,
                    ttl: 140,
                    x: metrics.player.x,
                    y: metrics.player.y - 10,
                    radius: 22,
                    color,
                });
            }
        }
    }, [getMetrics, pushParticle, spawnImpactBurst, withAlpha]);

    const spawnEnemyAttack = useCallback(() => {
        const metrics = getMetrics();
        if (!metrics) return;
        const now = performance.now();
        pushParticle({
            kind: 'enemySlash',
            born: now,
            ttl: 180,
            width: metrics.width,
            height: metrics.height,
        });
        pushParticle({
            kind: 'coreFlash',
            born: now + 30,
            ttl: 110,
            x: metrics.player.x,
            y: metrics.player.y - 42,
            radius: 30,
            color: 'rgba(255,90,90,0.92)',
        });
        spawnImpactBurst({ x: metrics.player.x, y: metrics.player.y - 40 }, 'rgba(255,120,120,0.95)', 12, now, 1.35);
    }, [getMetrics, pushParticle, spawnImpactBurst]);

    useEffect(() => {
        resizeCanvas();
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        resizeObserverRef.current = new ResizeObserver(() => resizeCanvas());
        resizeObserverRef.current.observe(canvas);
        return () => {
            resizeObserverRef.current?.disconnect();
        };
    }, [resizeCanvas]);

    useEffect(() => {
        const liveActiveIds = new Set(activeEffects.map((fx) => fx.id));
        seenActiveRef.current.forEach((id) => {
            if (!liveActiveIds.has(id)) seenActiveRef.current.delete(id);
        });
        activeEffects.forEach((fx) => {
            if (seenActiveRef.current.has(fx.id)) return;
            seenActiveRef.current.add(fx.id);
            spawnActiveEffect(fx);
        });
    }, [activeEffects, spawnActiveEffect]);

    useEffect(() => {
        const liveEnemyIds = new Set(enemyAttackEffects.map((fx) => fx.id));
        seenEnemyRef.current.forEach((id) => {
            if (!liveEnemyIds.has(id)) seenEnemyRef.current.delete(id);
        });
        enemyAttackEffects.forEach((fx) => {
            if (seenEnemyRef.current.has(fx.id)) return;
            seenEnemyRef.current.add(fx.id);
            spawnEnemyAttack(fx);
        });
    }, [enemyAttackEffects, spawnEnemyAttack]);

    useEffect(() => {
        const draw = (now) => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;

            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const freeze = Date.now() < hitStopUntil;
            const dt = lastFrameRef.current === 0 || freeze ? 0 : Math.min(40, now - lastFrameRef.current);
            lastFrameRef.current = now;
            const clipPadding = 28;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, rect.width, rect.height);
            ctx.globalCompositeOperation = 'lighter';
            ctx.save();
            ctx.beginPath();
            ctx.rect(clipPadding, clipPadding, Math.max(0, rect.width - clipPadding * 2), Math.max(0, rect.height - clipPadding * 2));
            ctx.clip();

            const liveParticles = [];
            for (const particle of particlesRef.current) {
                if (now < particle.born + particle.ttl + 20) liveParticles.push(particle);
            }
            particlesRef.current = liveParticles.length > MAX_CANVAS_PARTICLES
                ? liveParticles.slice(liveParticles.length - MAX_CANVAS_PARTICLES)
                : liveParticles;

            for (const p of particlesRef.current) {
                const age = Math.max(0, now - p.born);
                if (age <= 0) continue;
                const t = Math.min(1, age / p.ttl);

                if (p.kind === 'slash') {
                    const alpha = 1 - t;
                    const drawLength = p.length * (0.24 + t * 1.85);
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.angle);
                    ctx.translate(0, p.offset || 0);
                    const gradient = ctx.createLinearGradient(-drawLength / 2, 0, drawLength / 2, 0);
                    gradient.addColorStop(0, withAlpha(p.colorA, alpha));
                    gradient.addColorStop(1, withAlpha(p.colorB, Math.max(0, alpha * 0.75)));
                    ctx.fillStyle = gradient;
                    ctx.shadowBlur = 40;
                    ctx.shadowColor = p.colorB;
                    const width = p.width * (1 - t * 0.12);
                    ctx.beginPath();
                    ctx.roundRect(-drawLength / 2, -width / 2, drawLength, width, width);
                    ctx.fill();
                    ctx.restore();
                    continue;
                }

                if (p.kind === 'projectile') {
                    const easedT = 1 - ((1 - t) * (1 - t) * (1 - t));
                    const trailStart = Math.max(0, easedT - 0.18);
                    const x = p.x0 + (p.x1 - p.x0) * easedT;
                    const y = p.y0 + (p.y1 - p.y0) * easedT;
                    const xTrail = p.x0 + (p.x1 - p.x0) * trailStart;
                    const yTrail = p.y0 + (p.y1 - p.y0) * trailStart;
                    ctx.save();
                    const beam = ctx.createLinearGradient(xTrail, yTrail, x, y);
                    beam.addColorStop(0, withAlpha(p.color, 0));
                    beam.addColorStop(0.22, withAlpha(p.color, 0.85));
                    beam.addColorStop(1, 'rgba(255,255,255,0.95)');
                    ctx.strokeStyle = beam;
                    ctx.lineWidth = Math.max(7, p.width / 2.05);
                    ctx.shadowBlur = p.glow;
                    ctx.shadowColor = p.color;
                    ctx.beginPath();
                    ctx.moveTo(xTrail, yTrail);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    ctx.fillStyle = 'rgba(255,255,255,0.98)';
                    ctx.beginPath();
                    ctx.arc(x, y, Math.max(9, p.headRadius || p.width / 2), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = withAlpha(p.color, 0.78);
                    ctx.beginPath();
                    ctx.arc(x, y, Math.max(20, (p.headRadius || p.width) * 1.4), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    continue;
                }

                if (p.kind === 'muzzle') {
                    const alpha = Math.max(0, 1 - t);
                    const flareRadius = p.radius * (0.55 + t * 0.45);
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation || 0);
                    ctx.fillStyle = withAlpha(p.color, alpha * 0.9);
                    const inner = flareRadius * 0.38;
                    const forward = p.spikeLength * (0.72 + (1 - t) * 0.28);
                    const side = flareRadius * 1.2;
                    const spikes = [-0.52, -0.3, -0.08, 0.08, 0.3, 0.52];
                    spikes.forEach((offset, idx) => {
                        const tipY = -forward * (1 - Math.abs(offset) * 0.35) * (idx % 2 === 0 ? 1.06 : 0.9);
                        const tipX = side * offset;
                        ctx.beginPath();
                        ctx.moveTo(-inner * 0.4, inner * 0.25);
                        ctx.lineTo(tipX, tipY);
                        ctx.lineTo(inner * 0.4, inner * 0.25);
                        ctx.closePath();
                        ctx.fill();
                    });
                    const radial = ctx.createRadialGradient(0, -flareRadius * 0.18, 0, 0, -flareRadius * 0.18, flareRadius * 1.15);
                    radial.addColorStop(0, 'rgba(255,255,220,0.98)');
                    radial.addColorStop(0.35, withAlpha(p.color, alpha));
                    radial.addColorStop(1, withAlpha(p.color, 0));
                    ctx.fillStyle = radial;
                    ctx.shadowBlur = 30;
                    ctx.shadowColor = p.color;
                    ctx.beginPath();
                    ctx.ellipse(0, -flareRadius * 0.16, flareRadius * 0.85, flareRadius * 1.25, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    continue;
                }

                if (p.kind === 'ring') {
                    ctx.save();
                    ctx.strokeStyle = withAlpha(p.color, Math.max(0, 0.9 - t * 0.9));
                    ctx.lineWidth = Math.max(2, p.lineWidth * (1 - t * 0.28));
                    ctx.setLineDash(p.dashed ? [8, 10] : []);
                    ctx.shadowBlur = p.dashed ? 16 : 32;
                    ctx.shadowColor = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius * (0.45 + t * 0.95), 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                    continue;
                }

                if (p.kind === 'barrier') {
                    const reveal = Math.min(1, t / 0.18);
                    const fade = Math.max(0, 1 - Math.max(0, t - 0.22) / 0.78);
                    const width = p.width * (0.68 + reveal * 0.32);
                    const height = p.height * (0.58 + reveal * 0.42);
                    const left = -width / 2;
                    const hexRadius = Math.max(42, p.cellSize * (0.66 + reveal * 0.06));
                    const colStep = hexRadius * Math.sqrt(3);
                    const rowStep = hexRadius * 1.42;
                    const bottomCount = Math.max(7, Math.ceil(width / colStep) + 3);
                    const topCount = Math.max(5, bottomCount - 1);
                    const baseY = 0;

                    ctx.save();
                    ctx.translate(p.x, p.y - (1 - reveal) * 28);

                    const panels = [];
                    const bottomStartX = -((bottomCount - 1) * colStep) / 2;
                    for (let i = 0; i < bottomCount; i += 1) {
                        const progress = bottomCount === 1 ? 0.5 : i / (bottomCount - 1);
                        const centerBias = 1 - Math.abs(progress - 0.5) * 2;
                        const edgeFade = 0.18 + centerBias * 0.82;
                        panels.push({
                            x: bottomStartX + i * colStep,
                            y: baseY - centerBias * height * 0.1 + (1 - centerBias) * height * 0.06,
                            radius: hexRadius,
                            arc: centerBias * 0.7,
                            alpha: edgeFade,
                        });
                    }
                    const topStartX = -((topCount - 1) * colStep) / 2;
                    for (let i = 0; i < topCount; i += 1) {
                        const progress = topCount === 1 ? 0.5 : i / (topCount - 1);
                        const centerBias = 1 - Math.abs(progress - 0.5) * 2;
                        const edgeFade = 0.16 + centerBias * 0.84;
                        panels.push({
                            x: topStartX + i * colStep,
                            y: baseY - rowStep - centerBias * height * 0.12 + (1 - centerBias) * height * 0.08,
                            radius: hexRadius,
                            arc: 0.35 + centerBias,
                            alpha: edgeFade,
                        });
                    }

                    const drawHex = (cx, cy, radius) => {
                        ctx.beginPath();
                        for (let i = 0; i < 6; i += 1) {
                            const angle = (Math.PI / 3) * i + Math.PI / 6;
                            const px = cx + Math.cos(angle) * radius;
                            const py = cy + Math.sin(angle) * radius * 0.94;
                            if (i === 0) ctx.moveTo(px, py);
                            else ctx.lineTo(px, py);
                        }
                        ctx.closePath();
                    };

                    ctx.shadowBlur = 24;
                    ctx.shadowColor = withAlpha(p.glow, 0.84 * fade);

                    panels.forEach((panel, index) => {
                        drawHex(panel.x, panel.y, panel.radius);
                        const faceGradient = ctx.createLinearGradient(
                            panel.x - panel.radius,
                            panel.y - panel.radius,
                            panel.x + panel.radius,
                            panel.y + panel.radius
                        );
                        faceGradient.addColorStop(0, withAlpha('rgba(255,255,255,0.96)', (0.18 + panel.arc * 0.08) * fade * panel.alpha));
                        faceGradient.addColorStop(0.35, withAlpha('rgba(186,230,253,0.9)', (0.16 + panel.arc * 0.06) * fade * panel.alpha));
                        faceGradient.addColorStop(1, withAlpha(p.color, (0.12 + panel.arc * 0.05) * fade * panel.alpha));
                        ctx.fillStyle = faceGradient;
                        ctx.fill();

                        ctx.lineWidth = 3.2 + panel.arc * 1.3;
                        ctx.strokeStyle = withAlpha('rgba(219,234,254,1)', (0.72 + panel.arc * 0.2) * fade * panel.alpha);
                        ctx.stroke();

                        if (index < panels.length - 1) {
                            const next = panels[index + 1];
                            const seamAlpha = Math.min(panel.alpha, next.alpha);
                            ctx.beginPath();
                            ctx.moveTo(panel.x + panel.radius * 0.68, panel.y - panel.radius * 0.16);
                            ctx.lineTo(next.x - next.radius * 0.68, next.y - next.radius * 0.16);
                            ctx.strokeStyle = withAlpha(p.glow, 0.22 * fade * seamAlpha);
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    });

                    const sweep = ctx.createLinearGradient(left - width * 0.28 + t * width * 1.6, 0, left + t * width * 1.6, 0);
                    sweep.addColorStop(0, 'rgba(255,255,255,0)');
                    sweep.addColorStop(0.5, withAlpha('rgba(255,255,255,0.98)', 0.42 * fade));
                    sweep.addColorStop(1, 'rgba(255,255,255,0)');
                    ctx.strokeStyle = sweep;
                    ctx.lineWidth = hexRadius * 0.72;
                    ctx.beginPath();
                    const sweepPanels = panels
                        .slice()
                        .sort((a, b) => a.y - b.y || a.x - b.x);
                    for (let i = 0; i < sweepPanels.length; i += 1) {
                        const panel = sweepPanels[i];
                        if (i === 0) ctx.moveTo(panel.x, panel.y);
                        else ctx.lineTo(panel.x, panel.y);
                    }
                    ctx.stroke();

                    ctx.restore();
                    continue;
                }

                if (p.kind === 'coreFlash') {
                    const alpha = Math.max(0, 0.8 - t * 0.8);
                    const radius = p.radius * (0.5 + t * 1.3);
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
                    gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
                    gradient.addColorStop(0.35, withAlpha(p.color, alpha));
                    gradient.addColorStop(1, withAlpha(p.color, 0));
                    ctx.save();
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    continue;
                }

                if (p.kind === 'spark') {
                    if (!freeze) {
                        const velocityFactor = Math.max(0.16, 1 - t * (p.damping || 2.8) * 0.28);
                        p.x += (p.vx * velocityFactor * dt) / 1000;
                        p.y += (p.vy * velocityFactor * dt) / 1000;
                    }
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(Math.atan2(p.vy, p.vx));
                    ctx.strokeStyle = withAlpha(p.color, Math.max(0, 0.95 - t));
                    ctx.lineWidth = p.width * (1 - t * 0.24);
                    ctx.shadowBlur = 18;
                    ctx.shadowColor = p.color;
                    ctx.beginPath();
                    ctx.moveTo(-p.length * (1 - t * 0.22), 0);
                    ctx.lineTo(p.length * 0.34, 0);
                    ctx.stroke();
                    ctx.restore();
                    continue;
                }

                if (p.kind === 'enemySlash') {
                    const alpha = Math.max(0, 0.3 - t * 0.3);
                    ctx.save();
                    ctx.fillStyle = `rgba(255,48,48,${alpha})`;
                    ctx.fillRect(0, 0, p.width, p.height);
                    ctx.translate(p.width / 2, p.height * 0.56);
                    ctx.rotate((-18 * Math.PI) / 180);
                    const slashGradient = ctx.createLinearGradient(-p.width * 0.65, 0, p.width * 0.65, 0);
                    slashGradient.addColorStop(0, 'rgba(255,120,120,0)');
                    slashGradient.addColorStop(0.5, `rgba(255,80,80,${Math.max(0, 0.9 - t * 0.9)})`);
                    slashGradient.addColorStop(1, 'rgba(255,120,120,0)');
                    ctx.fillStyle = slashGradient;
                    ctx.shadowBlur = 42;
                    ctx.shadowColor = 'rgba(255,40,40,0.9)';
                    ctx.fillRect(-p.width * 0.75, -28, p.width * 1.5, 56);
                    ctx.restore();
                }
            }

            ctx.restore();
            ctx.globalCompositeOperation = 'source-over';
            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(rafRef.current);
    }, [hitStopUntil, withAlpha]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-[46] w-full h-full pointer-events-none" />;
};

const CombatTopMap = React.memo(({ runMap, nodeIndex }) => {
    const startIndex = Math.max(0, nodeIndex - 1);
    const endIndex = Math.min(runMap.length, nodeIndex + 8);
    const floor = Math.floor(nodeIndex / 10) + 1;
    const room = (nodeIndex % 10) + 1;
    const visibleNodes = runMap.slice(startIndex, endIndex);

    return (
        <div className="h-16 bg-black/80 border-b border-cyan-800/50 z-20 backdrop-blur-md shrink-0 w-full overflow-hidden relative shadow-[0_5px_20px_rgba(0,255,255,0.05)] flex items-center pl-2">
            <div className="flex items-center justify-center bg-slate-900 border-2 border-cyan-800 shadow-[0_0_15px_rgba(0,255,255,0.2)] px-4 py-2 shrink-0 z-30 mr-4">
                <span className="text-cyan-400 font-mono font-black text-xl tracking-widest">{floor}-{room}</span>
            </div>
            
            <div className="absolute right-0 w-12 h-full bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 z-10" />

            <div 
                className="flex items-center h-full transition-transform duration-500 ease-in-out z-10"
                style={{ transform: `translateX(calc(-${(nodeIndex - startIndex) * 80}px))` }} 
            >
                {visibleNodes.map((node) => {
                    const isCurrent = node.index === nodeIndex;
                    const isPast = node.index < nodeIndex;
                    
                    let colorClass = 'bg-slate-900 border-slate-600 text-slate-500';
                    let glowClass = '';
                    let Icon = Sword;

                    if (node.type === 'boss') { colorClass = 'bg-red-900 border-red-500 text-red-500'; Icon = Crown; }
                    else if (node.type.startsWith('unlock')) { colorClass = 'bg-amber-900 border-amber-500 text-amber-400'; Icon = Key; }
                    else if (node.type === 'treasure') { colorClass = 'bg-yellow-900 border-yellow-500 text-yellow-400'; Icon = Package; }
                    else if (node.type === 'rest') { colorClass = 'bg-green-900 border-green-500 text-green-400'; Icon = Tent; }
                    else { colorClass = 'bg-cyan-900 border-cyan-800 text-cyan-700'; }

                    if (isCurrent) {
                        glowClass = `scale-150 shadow-[0_0_15px_currentColor] border-2 bg-black z-20`;
                        if (node.type === 'encounter') colorClass = 'border-cyan-400 text-cyan-400';
                    }

                    return (
                        <div 
                            key={node.id} 
                            className={`absolute flex flex-col items-center justify-center transition-all duration-500 ${isPast ? 'opacity-30' : 'opacity-100'}`}
                            style={{ left: `${node.index * 80}px`, width: '80px', height: '100%' }}
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${colorClass} ${glowClass}`}>
                                <Icon size={10} className="currentColor" />
                            </div>
                            
                            <span className={`absolute top-10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors drop-shadow-md ${colorClass} ${isCurrent ? 'scale-110 drop-shadow-[0_0_5px_currentColor]' : ''}`}>
                                {node.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});


export default function App() {
  const [view, setView] = useState('menu');
  const [activeTab, setActiveTab] = useState('trunk'); 
  const [sortMethod, setSortMethod] = useState('cost'); 
  const gameFrameRef = useRef(null);
  const [gameFrameRect, setGameFrameRect] = useState({ left: 0, top: 0, width: 0, height: 0 });
  
  const [meta, setMeta] = useState(() => {
    const saved = localStorage.getItem('codexIdleSaveData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if ((parsed.saveVersion || 0) < DEFAULT_META.saveVersion) {
            return { ...DEFAULT_META };
        }
        return {
            ...DEFAULT_META,
            ...parsed,
            stage: Math.max(1, parsed.stage || 1),
            unlockedStages: Array.isArray(parsed.unlockedStages) && parsed.unlockedStages.length > 0 ? parsed.unlockedStages : [1],
            unlockedFeatures: Array.isArray(parsed.unlockedFeatures) ? parsed.unlockedFeatures : [],
            completedDungeons: Array.isArray(parsed.completedDungeons) ? parsed.completedDungeons : [],
        };
      } catch(e) { console.error("Failed to load save", e); }
    }
    return DEFAULT_META;
  });

  useEffect(() => {
    localStorage.setItem('codexIdleSaveData', JSON.stringify(meta));
  }, [meta]);

  const [pulledCards, setPulledCards] = useState([]);
  const [activeGachaTabId, setActiveGachaTabId] = useState('synthesis');
  const [lastOpenedBannerId, setLastOpenedBannerId] = useState('standard');
  const [previewBannerId, setPreviewBannerId] = useState(null);
  const [selectedFeaturedCardId, setSelectedFeaturedCardId] = useState(null);
  const [hoveredFeaturedCardId, setHoveredFeaturedCardId] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [lockedCardId, setLockedCardId] = useState(null); 
  const [isDiscardMode, setIsDiscardMode] = useState(false);
  
  // Interactive Map State
  const [zoom, setZoom] = useState(1);
  const [showOptions, setShowOptions] = useState(false);
  const [levelBanner, setLevelBanner] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [dragStartMap, setDragStartMap] = useState({ x: 0, y: 0 });

  useEffect(() => {
      if (view === 'skills') {
          const rafId = requestAnimationFrame(() => {
              const frameW = gameFrameRect.width || window.innerWidth;
              const frameH = gameFrameRect.height || window.innerHeight;
              const canvasSize = 1600;
              const z = frameW < 768 ? 0.6 : 0.85;
              const headerH = 70;
              const viewH = frameH - headerH;
              const centerNode = NODE_POS.hand_size;
              setZoom(z);
              setPan({
                  x: frameW / 2 - (canvasSize * (centerNode.x / 100) * z),
                  y: headerH + viewH / 2 - (canvasSize * (centerNode.y / 100) * z),
              });
          });
          return () => cancelAnimationFrame(rafId);
      }
  }, [view, gameFrameRect.width, gameFrameRect.height]);
  
  const [recentAdds, setRecentAdds] = useState([]); 
  const [unlockAnimId, setUnlockAnimId] = useState(null);
  const [upgradeAnimId, setUpgradeAnimId] = useState(null);
  const [frameNow, setFrameNow] = useState(0);
  const [hitStopUntil, setHitStopUntil] = useState(0);
  const [pendingDrawEffects, setPendingDrawEffects] = useState([]);
  const [drawAnimations, setDrawAnimations] = useState([]);
  const unlockedFeatureSet = useMemo(() => new Set(meta.unlockedFeatures || []), [meta.unlockedFeatures]);
  const hasFeature = useCallback((featureId) => unlockedFeatureSet.has(featureId), [unlockedFeatureSet]);
  const visibleSkillEntries = useMemo(
      () => Object.entries(SKILL_TREE_DICT).filter(([skillId]) => getSkillStage(skillId) <= meta.stage),
      [meta.stage]
  );
  const visibleSkillIds = useMemo(() => new Set(visibleSkillEntries.map(([skillId]) => skillId)), [visibleSkillEntries]);
  const visibleGachaTabs = useMemo(() => {
      const tabs = [{ id: 'synthesis', name: 'Forge Node', accent: 'violet', icon: Layers, kind: 'synthesis' }];
      tabs.push({ ...BANNER_MAP.standard, kind: 'banner' });
      if (hasFeature('banner_support')) tabs.push({ ...BANNER_MAP.support, kind: 'banner' });
      if (hasFeature('banner_multihit')) tabs.push({ ...BANNER_MAP.multihit, kind: 'banner' });
      return tabs;
  }, [hasFeature]);
  const unlockedDungeons = useMemo(
      () => DUNGEON_DEFS.filter((dungeon) => (meta.unlockedStages || []).includes(dungeon.stage)),
      [meta.unlockedStages]
  );

  const buildRunMap = useCallback((dungeonId, currentMeta) => {
      const dungeon = DUNGEON_MAP[dungeonId];
      if (!dungeon) return [];
      return dungeon.nodes.map((node, index) => {
          if (typeof node === 'string') {
              const type = node;
              return {
                  index,
                  id: `${dungeonId}-node-${index}`,
                  type,
                  label: type === 'boss' ? 'Boss' : type === 'rest' ? 'Rest' : type === 'treasure' ? 'Treasure' : 'Encounter',
              };
          }
          if (node.type === 'unlock_feature' && (currentMeta.unlockedFeatures || []).includes(node.feature)) {
              return {
                  index,
                  id: `${dungeonId}-node-${index}`,
                  type: 'encounter',
                  label: 'Encounter',
              };
          }
          return {
              index,
              id: `${dungeonId}-node-${index}`,
              ...node,
              label: node.label || FEATURE_LABELS[node.feature] || 'Unlock',
          };
      });
  }, []);

  const applyRunRewards = useCallback((currentMeta, currentRun, didCompleteDungeon = false) => {
      const nextMeta = {
          ...currentMeta,
          gp: currentMeta.gp + currentRun.gpEarned,
          fragments: currentMeta.fragments + currentRun.fragsEarned,
          packs: currentMeta.packs + currentRun.packsEarned,
      };
      if (!didCompleteDungeon || !currentRun.dungeonId) return nextMeta;

      const dungeon = DUNGEON_MAP[currentRun.dungeonId];
      if (!dungeon) return nextMeta;

      const nextStages = new Set(nextMeta.unlockedStages || [1]);
      (dungeon.unlocks?.stages || []).forEach((stageId) => nextStages.add(stageId));

      return {
          ...nextMeta,
          stage: Math.max(nextMeta.stage || 1, ...Array.from(nextStages)),
          unlockedStages: Array.from(nextStages).sort((a, b) => a - b),
          completedDungeons: Array.from(new Set([...(nextMeta.completedDungeons || []), dungeon.id])),
      };
  }, []);

  const [run, setRun] = useState({
    hp: 50, maxHp: 50, shield: 0, mana: 0, kills: 0, gpEarned: 0, fragsEarned: 0, packsEarned: 0,
    deck: [], hand: [], discard: [], monster: null, isPaused: false, autoDrawTimer: 0, activeEffects: [], enemyAttackEffects: [],
    floatingDrops: [], deathEffect: null, power: 0, runMap: [], nodeIndex: 0, activeEvent: null, eventPopup: null,
    dungeonId: null, status: 'idle', completionRewards: null,
    cardDamage: {}
  });
  const enemyCardRef = useRef(null);
  const deckButtonRef = useRef(null);
  const handCardRefs = useRef(new Map());
  const queuedDrawCardsRef = useRef([]);

  useLayoutEffect(() => {
      const node = gameFrameRef.current;
      if (!node) return undefined;

      const updateRect = () => {
          const rect = node.getBoundingClientRect();
          setGameFrameRect({
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
          });
      };

      updateRect();
      const observer = new ResizeObserver(() => updateRect());
      observer.observe(node);
      window.addEventListener('resize', updateRect);
      return () => {
          observer.disconnect();
          window.removeEventListener('resize', updateRect);
      };
  }, []);

  useEffect(() => {
     if (run && run.nodeIndex !== undefined) {
         const floor = Math.floor(run.nodeIndex / 10) + 1;
         const room = (run.nodeIndex % 10) + 1;
         const isBoss = run.runMap && run.runMap[run.nodeIndex]?.type === 'boss';
         const rafId = requestAnimationFrame(() => {
             setLevelBanner({ floor, room, isBoss, visible: true });
         });
         const t = setTimeout(() => {
             setLevelBanner(prev => prev ? {...prev, visible: false} : null);
         }, 2500);
         return () => {
             cancelAnimationFrame(rafId);
             clearTimeout(t);
         };
     }
  }, [run]);

  useLayoutEffect(() => {
      if (pendingDrawEffects.length === 0) return undefined;

      let cleanupTimers = [];
      const rafId = requestAnimationFrame(() => {
          const resolved = [];
          const unresolved = [];

          pendingDrawEffects.forEach((effect) => {
              const targetEl = handCardRefs.current.get(effect.runId);
              if (!targetEl) {
                  unresolved.push({
                      ...effect,
                      retries: (effect.retries || 0) + 1,
                  });
                  return;
              }

              const rect = targetEl.getBoundingClientRect();
              resolved.push({
                  ...effect,
                  target: {
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2,
                      width: rect.width,
                      height: rect.height,
                  },
              });
          });

          if (resolved.length > 0) {
              setDrawAnimations((prev) => [...prev, ...resolved]);
              resolved.forEach((effect) => {
                  const timer = setTimeout(() => {
                      setDrawAnimations((prev) => prev.filter((item) => item.id !== effect.id));
                  }, 620 + effect.staggerMs);
                  cleanupTimers.push(timer);
              });
          }

          setPendingDrawEffects(unresolved.filter((effect) => (effect.retries || 0) < 6));
      });

      return () => {
          cancelAnimationFrame(rafId);
          cleanupTimers.forEach(clearTimeout);
      };
  }, [pendingDrawEffects, run.hand]);

  const lastUpdate = useRef(0);
  const timerRef = useRef();

  // --- Logic Helpers ---

  const getCardLevel = useCallback((id) => meta.cardLevels[id] || 1, [meta.cardLevels]);

  const getCardValue = useCallback((card, level) => {
      if (level === 1) return card.value;
      let inc = 0;
      if (card.type === 'atk' || card.type === 'def' || card.isHeal) inc = 5;
      if (card.type === 'mana' || (card.type === 'util' && !card.isHeal)) inc = 1;
      return card.value + (inc * (level - 1));
  }, []);

  const getAttackFxProfile = useCallback((card, damage = 0) => {
    const isMelee = card && MELEE_ATTACK_IDS.has(card.id);
    const power = Math.max(card?.cost || 0, Math.floor(damage / 20));
    const baseAngle = ((card?.id || 'atk').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 5) * 18 - 36;
    return {
      style: isMelee ? 'melee' : 'ranged',
      colorClass: isMelee ? 'from-orange-200 via-red-300 to-white' : 'from-cyan-300 via-sky-300 to-white',
      impactColor: isMelee ? 'rgba(248,113,113,0.7)' : 'rgba(56,189,248,0.65)',
      slashAngles: [baseAngle - 22, baseAngle + 14 + Math.min(power * 2, 18)],
      projectileAngle: -78 + Math.min(power * 3, 18),
      projectileWidth: Math.min(14 + power * 4, 34),
      impactSize: Math.min(82 + power * 14, 152),
      hitStop: Math.max(28, Math.min(105, 24 + (card?.cost || 0) * 9 + Math.floor(damage / 24) * 4)),
    };
  }, []);

  const generateMonster = useCallback((count, isBoss) => {
    const list = isBoss ? BOSS_LIST : ENEMY_LIST;
    const effIdx = isBoss ? Math.floor(count/5) % Math.max(1, list.length) : count % Math.max(1, list.length);
    const baseEnemy = list[effIdx] || {name: isBoss?'BOSS':'Unknown', hp:20, timer:4, dmg:5};
    const hpScaling = 1 + (count / (isBoss ? 5 : 15));
    const hp = Math.floor(baseEnemy.hp * hpScaling);
    return {
      name: isBoss ? "BOSS: " + baseEnemy.name : baseEnemy.name + " " + (count + 1),
      hp, maxHp: hp, timer: 0, 
      maxTimer: Math.max(1.0, baseEnemy.timer - (count * 0.1)), 
      damage: baseEnemy.dmg + Math.floor(count * (isBoss ? 4.0 : 2.5)), 
      isBoss,
      iconId: effIdx
    };
  }, []);

  const getRarityTier = useCallback((card) => {
    if (!card) return 'common';
    if (card.cost >= 6) return 'legendary';
    if (card.cost >= 4) return 'epic';
    if (card.cost >= 2) return 'rare';
    return 'common';
  }, []);

  const pickWeightedCardId = useCallback((banner) => {
    if (!banner?.pool?.length) return null;
    let totalWeight = 0;
    const weightedPool = [];

    for (const cardId of banner.pool) {
      const card = CARD_DB[cardId];
      if (!card) continue;
      const rarityWeight = RARITY_PULL_WEIGHTS[getRarityTier(card)] || 1;
      const featureWeight = banner.cardWeights?.[cardId] || 1;
      const totalCardWeight = rarityWeight * featureWeight;
      weightedPool.push({ cardId, weight: totalCardWeight });
      totalWeight += totalCardWeight;
    }

    if (weightedPool.length === 0) return null;
    let roll = Math.random() * totalWeight;
    for (const entry of weightedPool) {
      roll -= entry.weight;
      if (roll <= 0) return entry.cardId;
    }
    return weightedPool[weightedPool.length - 1].cardId;
  }, [getRarityTier]);

  const getMonsterIcon = useCallback((monster) => {
    if (!monster) return monster?.isBoss ? Trophy : Sword;
    if (monster.iconId !== undefined) {
      const iconEntry = monster.isBoss ? BOSS_LIST[monster.iconId] : ENEMY_LIST[monster.iconId];
      return iconEntry?.icon || (monster.isBoss ? Trophy : Sword);
    }
    return monster.isBoss ? Trophy : Sword;
  }, []);

  const buildEnemyDeathEffect = useCallback((monster) => {
    if (!monster) return null;
    const rect = enemyCardRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const shardCount = monster.isBoss ? 64 : 46;
    return {
      id: Math.random(),
      timestamp: Date.now(),
      monster: { ...monster },
      rect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
      shards: Array.from({ length: shardCount }, (_, index) => ({
        id: `${Date.now()}-${index}`,
        left: 10 + Math.random() * Math.max(24, rect.width - 32),
        top: 14 + Math.random() * Math.max(30, rect.height - 40),
        size: 12 + Math.random() * 22,
        driftX: (() => {
          const dir = Math.random() < 0.5 ? -1 : 1;
          const base = monster.isBoss ? 180 : 135;
          return dir * (base + Math.random() * (monster.isBoss ? 130 : 95));
        })(),
        driftY: 80 + Math.random() * (monster.isBoss ? 180 : 135),
        rotate: (Math.random() - 0.5) * 260,
        delay: Math.random() * 45,
        duration: 540 + Math.random() * 340,
        opacity: 0.72 + Math.random() * 0.26,
      })),
    };
  }, []);

  const getEffectiveCost = useCallback((card) => {
    if (meta.freeLowCost && card.cost === 1) return 0;
    if (meta.freeUtil && card.type === 'util' && !card.isHeal) return 0;
    return card.cost;
  }, [meta.freeLowCost, meta.freeUtil]);

  const drawCardsWithMeta = useCallback((currentState, amount = 1) => {
      let state = { ...currentState, deck: [...currentState.deck], hand: [...currentState.hand], discard: [...currentState.discard] };
      const drawnCards = [];
      for (let i = 0; i < amount; i++) {
          if (state.hand.length >= meta.maxHand) break;
          if (state.deck.length === 0) {
              if (state.discard.length === 0) break;
              state.deck = shuffle(state.discard);
              state.discard = [];
          }
          if (state.deck.length > 0) {
              const drawnCard = state.deck.pop();
              state.hand.push(drawnCard);
              drawnCards.push(drawnCard);
          }
      }
      return { state, drawnCards };
  }, [meta.maxHand]);

  const queueDrawEffects = useCallback((queuedDraws) => {
      if (!queuedDraws || queuedDraws.length === 0) return;
      const deckRect = deckButtonRef.current?.getBoundingClientRect();
      if (!deckRect) return;

      setPendingDrawEffects((prev) => [
          ...prev,
          ...queuedDraws.map(({ card, showHolo }, index) => ({
              id: Math.random(),
              runId: card.runId,
              cardObj: card,
              showHolo: !!showHolo,
              queuedAt: Date.now(),
              origin: {
                  x: deckRect.left + deckRect.width / 2,
                  y: deckRect.top + deckRect.height * 0.42,
                  width: Math.max(88, deckRect.width * 0.96),
                  height: Math.max(128, deckRect.height * 0.96),
              },
              staggerMs: index * 55,
          })),
      ]);
  }, []);

  const setHandCardRef = useCallback((runId, node) => {
      if (node) handCardRefs.current.set(runId, node);
      else handCardRefs.current.delete(runId);
  }, []);

  useEffect(() => {
      if (queuedDrawCardsRef.current.length === 0) return;
      const queued = queuedDrawCardsRef.current;
      queuedDrawCardsRef.current = [];
      queueDrawEffects(queued);
  }, [run.hand, queueDrawEffects]);

  // --- Actions ---

  const startRun = (dungeonId) => {
    if (meta.activeDeck.length < 10) {
        alert("Deck must have at least 10 cards!");
        return;
    }
    const dungeon = DUNGEON_MAP[dungeonId];
    if (!dungeon) return;

    let deckCards = meta.activeDeck.map((id, idx) => {
        const lvl = getCardLevel(id);
        return {
            ...CARD_DB[id], runId: `${id}-${idx}-${Math.random().toString()}`, currentLevel: lvl, currentValue: getCardValue(CARD_DB[id], lvl)
        };
    });
    
    let deck = shuffle(deckCards);
    let hand = [];

    if (meta.startWithManaCard) {
        const manaIdx = deck.findIndex(c => c.type === 'mana');
        if (manaIdx !== -1) {
            hand.push(deck[manaIdx]);
            deck.splice(manaIdx, 1);
        }
    }

    const initialDraw = Math.min(meta.openingHand, meta.maxHand);
    while (hand.length < initialDraw && deck.length > 0) hand.push(deck.pop());

    const freshMap = buildRunMap(dungeonId, meta);
    const firstNode = freshMap[0];
    
    let initialMonster = null;
    let initialEvent = null;
    if (firstNode.type === 'encounter' || firstNode.type === 'boss') {
        initialMonster = generateMonster(0, firstNode.type === 'boss');
    } else {
        initialEvent = firstNode;
    }

    setRun({
      hp: 50, maxHp: 50, shield: 0, mana: meta.startMana, kills: 0, gpEarned: 0, fragsEarned: 0, packsEarned: 0,
      deck, hand, discard: [], monster: initialMonster, isPaused: false, autoDrawTimer: 0, activeEffects: [], enemyAttackEffects: [], floatingDrops: [], deathEffect: null, power: 0,
      runMap: freshMap, nodeIndex: 0, activeEvent: initialEvent, eventPopup: null,
      dungeonId, status: 'active', completionRewards: dungeon.unlocks || null,
      cardDamage: {}
    });
    setIsDiscardMode(false);
    setView('combat');
  };

  const triggerEventRewards = () => {
    setRun(prev => {
        let next = { ...prev };
        const currentEvent = next.activeEvent;
        if (!currentEvent) return next;

        const popupData = { title: currentEvent.label, text: "", loot: [], type: currentEvent.type };
        const newDrops = [];
        const now = Date.now();

        if (currentEvent.type === 'rest') {
            next.maxHp += 10;
            next.hp = next.maxHp;
            popupData.text = "You rested in a safe zone.";
            popupData.loot.push("+10 Max HP", "Fully Healed");
            newDrops.push({ id: Math.random(), type: 'heal', val: '+10 Max HP', delay: 0 });
        } else if (currentEvent.type === 'treasure') {
            const roll = Math.random();
            if (roll < 0.33) {
                next.gpEarned += 1500;
                popupData.text = "You found a stash of pure GP!";
                popupData.loot.push("+1500 GP");
                for(let i=0; i<7; i++) newDrops.push({ id: Math.random(), type: 'gp', val: null, delay: i*100 });
                newDrops.push({ id: Math.random(), type: 'gp', val: '+1500 GP', delay: 200, isLabel: true });
            } else if (roll < 0.66) {
                next.fragsEarned += 25;
                popupData.text = "You found scattered Fragments!";
                popupData.loot.push("+25 Fragments");
                for(let i=0; i<7; i++) newDrops.push({ id: Math.random(), type: 'frag', val: null, delay: i*100 });
                newDrops.push({ id: Math.random(), type: 'frag', val: '+25 Frags', delay: 200, isLabel: true });
            } else {
                next.packsEarned += 3;
                popupData.text = "You found intact Data Packs!";
                popupData.loot.push("+3 Packs");
                for(let i=0; i<5; i++) newDrops.push({ id: Math.random(), type: 'pack', val: null, delay: i*120 });
                newDrops.push({ id: Math.random(), type: 'pack', val: '+3 Packs', delay: 200, isLabel: true });
            }
        } else if (currentEvent.type === 'unlock_feature') {
            const featureLabel = FEATURE_LABELS[currentEvent.feature] || currentEvent.label || 'System';
            popupData.text = "A new subsystem has been integrated into the run.";
            popupData.loot.push(`${featureLabel} Unlocked`);
            newDrops.push({ id: Math.random(), type: 'unlock', val: featureLabel, delay: 0 });
        }

        next.floatingDrops = [...(next.floatingDrops||[]), ...newDrops.map(d => ({
            ...d, timestamp: now + d.delay, offsetX: d.isLabel ? 0 : (Math.random() - 0.5) * 400 
        }))];

        next.eventPopup = popupData;
        return next;
    });
  };

  const closeEventPopup = () => {
    setRun(prev => {
        let next = { ...prev };
        const unlockedFeatureId = next.eventPopup?.type === 'unlock_feature' ? next.activeEvent?.feature : null;

        if (unlockedFeatureId) {
            queueMicrotask(() => {
                setMeta((currentMeta) => {
                    if ((currentMeta.unlockedFeatures || []).includes(unlockedFeatureId)) return currentMeta;
                    return {
                        ...currentMeta,
                        unlockedFeatures: [...(currentMeta.unlockedFeatures || []), unlockedFeatureId],
                    };
                });
            });
        }

        next.eventPopup = null;
        next.activeEvent = null;
        next.nodeIndex += 1;
        
        const nextNode = next.runMap[next.nodeIndex];
        if (!nextNode) {
            next.monster = null;
            next.isPaused = true;
            next.status = 'victory';
            queueMicrotask(() => {
                setMeta((currentMeta) => applyRunRewards(currentMeta, next, true));
                setView('gameover');
            });
            return next;
        }
        
        if (nextNode.type === 'encounter' || nextNode.type === 'boss') {
            next.monster = generateMonster(next.kills, nextNode.type === 'boss');
            next.isPaused = false;
        } else {
            next.monster = null;
            next.activeEvent = nextNode;
            next.isPaused = true;
        }
        return next;
    });
  };

  const playCard = (card, launchOrigin = null) => {
    const cost = getEffectiveCost(card);
    if (run.mana < cost) {
      return;
    }
    if (card.type === 'atk') {
      const totalHits = card.multiHit ? card.multiHit + (meta.multiStrike ? 1 : 0) : 1;
      let perHitDamage = card.currentValue + meta.dmgMod + (run.power || 0);
      if (meta.heavyDmgMod > 0 && card.cost >= 3) perHitDamage += meta.heavyDmgMod;
      let projectedDamage = perHitDamage * totalHits;
      if (meta.firstStrike && run.monster && run.monster.hp === run.monster.maxHp) projectedDamage *= 2;
      if (meta.bossSlayer && run.monster && run.monster.isBoss) projectedDamage = Math.floor(projectedDamage * 1.5);
      setHitStopUntil(Date.now() + getAttackFxProfile(card, projectedDamage).hitStop);
    }
    setRun(prev => {
      const timestamp = Date.now();
      const totalHits = card.multiHit ? card.multiHit + (meta.multiStrike ? 1 : 0) : 1;
      const projectedBaseDamage = (card.currentValue + meta.dmgMod + (prev.power || 0)) * totalHits;
      const attackProfile = card.type === 'atk' ? getAttackFxProfile(card, projectedBaseDamage) : null;

      let nextRun = {
        ...prev, mana: prev.mana - cost, hand: prev.hand.filter(c => c.runId !== card.runId), discard: [...prev.discard, card],
        activeEffects: [...prev.activeEffects, { id: Math.random(), type: card.isHeal ? 'heal' : card.type, cost: card.cost, timestamp, cardObj: card, attackProfile, launchOrigin }]
      };

      if (meta.manaRefund && cost > 0) nextRun.mana += 1;

      if (card.type === 'atk') {
        let dmg = (card.currentValue + meta.dmgMod + (nextRun.power || 0)) * totalHits;
        if (meta.heavyDmgMod > 0 && card.cost >= 3) dmg += meta.heavyDmgMod * totalHits;
        if (meta.firstStrike && nextRun.monster && nextRun.monster.hp === nextRun.monster.maxHp) dmg *= 2;
        if (meta.bossSlayer && nextRun.monster && nextRun.monster.isBoss) dmg = Math.floor(dmg * 1.5);
        if (nextRun.monster) {
            nextRun.monster.hp -= dmg;
            nextRun.cardDamage = { ...nextRun.cardDamage };
            const trackKey = card.id || card.name;
            nextRun.cardDamage[trackKey] = (nextRun.cardDamage[trackKey] || 0) + dmg;
        }
        
        if (meta.drawOnAtk) {
            const drawResult = drawCardsWithMeta(nextRun, 1);
            nextRun = drawResult.state;
            queuedDrawCardsRef.current = [
                ...queuedDrawCardsRef.current,
                ...drawResult.drawnCards.map((drawnCard) => ({ card: drawnCard, showHolo: true })),
            ];
        }
        if (meta.heavyArmor && card.cost >= 3) nextRun.shield += 5;
      } else if (card.type === 'mana') {
        let val = card.currentValue;
        if (meta.manaSurge) val += 1;
        if (card.manaBonus) val += card.manaBonus;
        nextRun.mana += val;
        
        if (meta.kineticMana && nextRun.monster) {
            nextRun.monster.hp -= 5;
            nextRun.activeEffects.push({
              id: Math.random(),
              type: 'atk',
              cost: 1,
              timestamp,
              attackProfile: {
                ...getAttackFxProfile({ id: 'kinetic', cost: 1 }, 5),
                style: 'ranged',
                colorClass: 'from-yellow-200 via-yellow-400 to-white',
                impactColor: 'rgba(250,204,21,0.6)'
              }
            });
        }
      } else if (card.type === 'def') {
        nextRun.shield += card.currentValue + (meta.shieldBoost || 0);
      } else if (card.type === 'util') {
        if (card.isHeal) {
            const healAmt = meta.healBoost ? Math.floor(card.currentValue * 1.5) : card.currentValue;
            nextRun.hp = Math.min(nextRun.maxHp, nextRun.hp + healAmt);
        } else if (card.atkBuff) {
            nextRun.power = (nextRun.power || 0) + card.currentValue;
        } else {
            const drawResult = drawCardsWithMeta(nextRun, card.currentValue);
            nextRun = drawResult.state;
            queuedDrawCardsRef.current = [
                ...queuedDrawCardsRef.current,
                ...drawResult.drawnCards.map((drawnCard) => ({ card: drawnCard, showHolo: true })),
            ];
        }
      }

      if (card.type === 'atk' && card.manaBonus) nextRun.mana += card.manaBonus;

      let chainCount = 0;
      while (nextRun.monster && nextRun.monster.hp <= 0) {
        const overkillAmt = meta.overkill ? Math.abs(nextRun.monster.hp) : 0;
        
        const gpReward = nextRun.monster.isBoss ? 500 + (nextRun.kills * 50) : 50 + (nextRun.kills * 10);
        nextRun.gpEarned += gpReward;
        const fragReward = nextRun.monster.isBoss ? Math.floor(Math.random() * 6) + 5 : Math.floor(Math.random() * 3) + 1;
        nextRun.fragsEarned += fragReward;

        let packs = 0;
        if (nextRun.monster.isBoss || Math.random() < 0.05) {
            packs = 1;
            nextRun.packsEarned += 1;
        }

        const newDrops = [];
        const gpIconCount = Math.min(6, Math.max(3, Math.floor(gpReward / 50)));
        for(let i=0; i<gpIconCount; i++) newDrops.push({ id: Math.random(), type: 'gp', val: null, delay: i*80 });
        newDrops.push({ id: Math.random(), type: 'gp', val: `+${gpReward} GP`, delay: 100, isLabel: true });

        const fragIconCount = Math.min(5, Math.max(2, fragReward));
        for(let i=0; i<fragIconCount; i++) newDrops.push({ id: Math.random(), type: 'frag', val: null, delay: i*80 + 50 });
        newDrops.push({ id: Math.random(), type: 'frag', val: `+${fragReward} Frags`, delay: 150, isLabel: true });

        if (packs > 0) {
            for(let i=0; i<3; i++) newDrops.push({ id: Math.random(), type: 'pack', val: null, delay: i*100 + 300 });
            newDrops.push({ id: Math.random(), type: 'pack', val: `+${packs} Pack`, delay: 350, isLabel: true });
        }

        nextRun.floatingDrops = [...(nextRun.floatingDrops||[]), ...newDrops.map(d => ({
            ...d, timestamp: Date.now() + d.delay, offsetX: d.isLabel ? 0 : (Math.random() - 0.5) * 350 
        }))];
        nextRun.deathEffect = buildEnemyDeathEffect(nextRun.monster);
        setHitStopUntil(Date.now() + (nextRun.monster.isBoss ? 160 : 110));
        
        nextRun.kills += 1;
        nextRun.nodeIndex += 1;
        const nextNode = nextRun.runMap[nextRun.nodeIndex];
        
        nextRun.mana = Math.floor(nextRun.mana * meta.manaRetain) + meta.startMana;
        nextRun.shield = 0;
        nextRun.power = 0;

        if (!nextNode) {
            nextRun.monster = null;
            nextRun.activeEvent = null;
            nextRun.isPaused = true;
            nextRun.status = 'victory';
            queueMicrotask(() => {
                setMeta((currentMeta) => applyRunRewards(currentMeta, nextRun, true));
                setView('gameover');
            });
            break;
        }
        
        if (nextNode.type === 'encounter' || nextNode.type === 'boss') {
            nextRun.monster = generateMonster(nextRun.kills, nextNode.type === 'boss');
            if (overkillAmt > 0 && (meta.overkillChain || chainCount === 0)) {
                nextRun.monster.hp -= overkillAmt;
                chainCount++;
            } else {
                break;
            }
        } else {
            nextRun.monster = null;
            nextRun.activeEvent = nextNode;
            nextRun.isPaused = true;
            break;
        }
      }
      return nextRun;
    });
  };

  const drawCard = () => {
    setIsDiscardMode(false);
    setRun(prev => {
        const drawResult = drawCardsWithMeta(prev, meta.drawMulti);
        queuedDrawCardsRef.current = [
            ...queuedDrawCardsRef.current,
            ...drawResult.drawnCards.map((drawnCard) => ({ card: drawnCard, showHolo: false })),
        ];
        return drawResult.state;
    });
  };
  
  const discardCardByRunId = (runIdStr) => {
    setRun(prev => {
        const cardToDiscard = prev.hand.find(c => c.runId === runIdStr);
        if (!cardToDiscard) return prev;
        return { ...prev, hand: prev.hand.filter(c => c.runId !== runIdStr), discard: [...prev.discard, cardToDiscard] };
    });
  };

  // --- Game Loop ---
  useEffect(() => {
    if (view !== 'combat' || run.isPaused) return;

    const tick = () => {
      const now = Date.now();
      const dt = now < hitStopUntil ? 0 : (now - lastUpdate.current) / 1000;
      lastUpdate.current = now;
      setFrameNow(now);
      setRun(prev => {
        if (prev.hp <= 0) {
            setMeta(m => applyRunRewards(m, prev, false));
            setView('gameover');
            return prev;
        }

        let next = { ...prev };
        
        if (next.activeEffects.length > 0) next.activeEffects = next.activeEffects.filter(e => now - e.timestamp < 600);
        if (next.enemyAttackEffects && next.enemyAttackEffects.length > 0) next.enemyAttackEffects = next.enemyAttackEffects.filter(e => now - e.timestamp < 500);
        if (next.floatingDrops && next.floatingDrops.length > 0) next.floatingDrops = next.floatingDrops.filter(e => now - e.timestamp < 1500);
        if (next.deathEffect && now - next.deathEffect.timestamp >= 720) next.deathEffect = null;

        if (next.monster) {
            next.monster = { ...prev.monster };
            next.monster.timer += dt;

            if (next.monster.timer >= next.monster.maxTimer) {
              next.monster.timer = 0;
              const damageTaken = Math.max(0, next.monster.damage - next.shield);
              next.shield = Math.max(0, next.shield - next.monster.damage);
              next.hp -= damageTaken;

              next.enemyAttackEffects = next.enemyAttackEffects ? [...next.enemyAttackEffects] : [];
              next.enemyAttackEffects.push({ id: Math.random(), timestamp: now });
            }
        }

        next.mana += (meta.regenRate * dt);

        if (meta.autoDrawRate > 0) {
            next.autoDrawTimer += dt;
            if (next.autoDrawTimer >= meta.autoDrawRate) {
                next.autoDrawTimer = 0;
                const drawResult = drawCardsWithMeta(next, 1);
                next = drawResult.state;
                queuedDrawCardsRef.current = [
                    ...queuedDrawCardsRef.current,
                    ...drawResult.drawnCards.map((drawnCard) => ({ card: drawnCard, showHolo: false })),
                ];
            }
        }

        if (meta.autoPlayMana) {
            const manaIdx = next.hand.findIndex(c => c.type === 'mana');
            if (manaIdx > -1) {
                const card = next.hand[manaIdx];
                const cost = getEffectiveCost(card);
                if (next.mana >= cost) {
                    next.mana -= cost;
                    let val = card.currentValue;
                    if (meta.manaSurge) val += 1;
                    next.mana += val;
                    if (meta.manaRefund && cost > 0) next.mana += 1;
                    
                    next.hand = [...next.hand];
                    next.hand.splice(manaIdx, 1);
                    next.discard = [...next.discard, card];
                    
                    next.activeEffects = next.activeEffects ? [...next.activeEffects] : [];
                    next.activeEffects.push({ 
                        id: Math.random(), type: 'mana', cost: card.cost, timestamp: now,
                        cardObj: { ...card, currentLevel: card.currentLevel, currentValue: card.currentValue }
                    });

                    if (meta.kineticMana && next.monster) {
                        next.monster.hp -= 5;
                        next.activeEffects.push({ id: Math.random(), type: 'atk', cost: 1, timestamp: now });
                    }
                }
            }
        }

        return next;
      });

      timerRef.current = requestAnimationFrame(tick);
    };

    lastUpdate.current = Date.now();
    timerRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(timerRef.current);
  }, [view, run.isPaused, meta.regenRate, meta.autoDrawRate, meta.autoPlayMana, meta.maxHand, meta.kineticMana, meta.manaRefund, meta.manaSurge, drawCardsWithMeta, getEffectiveCost, hitStopUntil, applyRunRewards]);


  // --- Gacha & Upgrades ---
  const convertFragments = () => {
      if (meta.fragments >= 10) {
          const packsToGain = Math.floor(meta.fragments / 10);
          setMeta(prev => ({ ...prev, fragments: prev.fragments % 10, packs: prev.packs + packsToGain }));
      }
  };

  const openPack = useCallback((bannerId, count = 1) => {
      const banner = BANNER_MAP[bannerId] || BANNER_MAP.standard;
      if (banner.id === 'support' && !hasFeature('banner_support')) return;
      if (banner.id === 'multihit' && !hasFeature('banner_multihit')) return;
      if (count >= 10 && !hasFeature('pull_10')) return;
      if (count >= 5 && count < 10 && !hasFeature('pull_5')) return;
      const actualCount = Math.min(count, meta.packs);
      if (actualCount > 0) {
          const newCards = [];
          
          for (let p = 0; p < actualCount; p++) {
              for(let i = 0; i < PACK_SIZE; i++) {
                  const pulledId = pickWeightedCardId(banner);
                  if (pulledId && CARD_DB[pulledId]) newCards.push(CARD_DB[pulledId]);
              }
          }

          setPulledCards(newCards);
          setLastOpenedBannerId(banner.id);
          setMeta(prev => {
              const newCollection = { ...prev.collection };
              newCards.forEach(c => { newCollection[c.id] = (newCollection[c.id] || 0) + 1; });
              return { ...prev, packs: prev.packs - actualCount, collection: newCollection };
          });
      }
  }, [pickWeightedCardId, meta.packs, hasFeature]);

  const upgradeCard = (id) => {
      const lvl = getCardLevel(id);
      if (lvl >= 4) return;
      const cost = UPGRADE_COSTS[lvl - 1];
      const inDeckCount = meta.activeDeck.filter(c => c === id).length;
      const available = (meta.collection[id] || 0) - inDeckCount;
      
      if (available >= cost) {
          setMeta(prev => ({
              ...prev,
              collection: { ...prev.collection, [id]: prev.collection[id] - cost },
              cardLevels: { ...prev.cardLevels, [id]: lvl + 1 }
          }));
          setUpgradeAnimId(id);
          setTimeout(() => setUpgradeAnimId(null), 1200);
      }
  };


  // --- Global Styles & Fonts ---
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Roboto:wght@500;700&display=swap');
      .font-tech { font-family: 'Rajdhani', sans-serif; }
      .font-read { font-family: 'Roboto', sans-serif; }
      
      @keyframes combat-slash { 0% { transform: scaleX(0) rotate(-45deg); opacity: 1; } 50% { transform: scaleX(2) rotate(-45deg); opacity: 1; } 100% { transform: scaleX(2) rotate(-45deg); opacity: 0; } }
      @keyframes window-shake-small { 0%, 100% { transform: translate(0, 0); } 25% { transform: translate(-1px, -1px) rotate(-0.2deg); } 50% { transform: translate(1px, 1px) rotate(0.2deg); } 75% { transform: translate(-1px, 1px) rotate(-0.2deg); } }
      @keyframes window-shake-heavy { 0%, 100% { transform: translate(0, 0); filter: blur(0px); } 20% { transform: translate(-4px, -4px) rotate(-0.5deg); filter: blur(1px); } 40% { transform: translate(4px, 4px) rotate(0.5deg); filter: blur(1px); } 60% { transform: translate(-4px, 4px) rotate(-0.5deg); filter: blur(1px); } 80% { transform: translate(4px, -4px) rotate(0.5deg); filter: blur(1px); } }
      @keyframes combat-pulse-hex { 0% { transform: scale(0.8); opacity: 0.8; border-color: #3b82f6; } 100% { transform: scale(2); opacity: 0; border-color: transparent; } }
      @keyframes combat-mana-up { 0% { transform: translateY(20px) scale(1); opacity: 1; } 100% { transform: translateY(-100px) scale(0.5); opacity: 0; } }
      @keyframes mana-counter-pop { 0% { transform: scale(1); filter: brightness(1); } 35% { transform: scale(1.22); filter: brightness(1.45); } 100% { transform: scale(1); filter: brightness(1); } }
      @keyframes mana-charge-core { 0% { transform: translate(-50%, 0) scale(0.55); opacity: 0.8; } 45% { opacity: 1; } 100% { transform: translate(-50%, -8px) scale(1.35); opacity: 0; } }
      @keyframes mana-counter-glow { 0% { opacity: 0; transform: scale(0.8); } 30% { opacity: 0.9; } 100% { opacity: 0; transform: scale(1.45); } }
      @keyframes heal-bar-glow {
        0% { border-color: rgba(220, 252, 231, 1); box-shadow: 0 0 58px rgba(134, 239, 172, 1), 0 0 26px rgba(220, 252, 231, 0.92); }
        18% { border-color: rgba(187, 247, 208, 1); box-shadow: 0 0 46px rgba(74, 222, 128, 1), 0 0 18px rgba(220, 252, 231, 0.8); }
        100% { border-color: rgba(74, 222, 128, 0.9); box-shadow: 0 0 18px rgba(74, 222, 128, 0.28), 0 0 0 rgba(220, 252, 231, 0); }
      }
      @keyframes heal-bar-sheen {
        0% { transform: translateX(-10%) scaleX(0.82); opacity: 0; }
        12% { opacity: 0.95; }
        100% { transform: translateX(255%) scaleX(1.08); opacity: 0; }
      }
      @keyframes heal-fill-flash {
        0% { filter: brightness(2.2) saturate(1.6); box-shadow: 0 0 78px rgba(134, 239, 172, 1), 0 0 36px rgba(220, 252, 231, 0.98), inset 0 0 22px rgba(255, 255, 255, 0.82); }
        16% { filter: brightness(1.9) saturate(1.46); box-shadow: 0 0 62px rgba(74, 222, 128, 1), 0 0 28px rgba(220, 252, 231, 0.88), inset 0 0 16px rgba(255, 255, 255, 0.62); }
        100% { filter: brightness(1.18) saturate(1.1); box-shadow: 0 0 18px rgba(74, 222, 128, 0.28), inset 0 0 0 rgba(255,255,255,0); }
      }
      @keyframes mana-gather-particle {
        0% { transform: translate(var(--mana-start-x), var(--mana-start-y)) rotate(var(--mana-rot-start)) scaleX(0.35) scaleY(0.55); opacity: 0; }
        10% { opacity: 1; }
        58% { transform: translate(var(--mana-mid-x), var(--mana-mid-y)) rotate(var(--mana-rot-mid)) scaleX(1) scaleY(1); opacity: 1; }
        100% { transform: translate(0px, 0px) rotate(var(--mana-rot-end)) scaleX(0.16) scaleY(0.42); opacity: 0; }
      }
      @keyframes combat-vortex { 0% { transform: rotate(0deg) scale(0.5); opacity: 1; } 100% { transform: rotate(360deg) scale(1.5); opacity: 0; } }
      @keyframes card-launch { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 18% { transform: translate(-50%, calc(-50% - 112px)) scale(1.02); opacity: 1; } 100% { transform: translate(-50%, calc(-50% - 190px)) scale(0.8); opacity: 0; } }
      @keyframes card-disintegrate { 0% { filter: brightness(1); clip-path: inset(0 0 0 0); } 55% { filter: brightness(1.2); } 100% { filter: brightness(1.8) blur(4px); clip-path: inset(0 0 100% 0); } }
      @keyframes card-spark-rise { 0% { transform: translate(0, 0) scale(0.25); opacity: 0; } 18% { opacity: 1; } 100% { transform: translate(var(--spark-x), calc(var(--spark-y) - 62px)) scale(0.95); opacity: 0; } }
      @keyframes draw-deck-pulse {
        0% { transform: translateY(0) scale(1); box-shadow: 5px 5px 20px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.8), 0 0 0 rgba(34,211,238,0); filter: brightness(1); }
        30% { transform: translateY(-4px) scale(1.02); box-shadow: 5px 10px 26px rgba(0,0,0,0.9), inset 0 0 20px rgba(0,0,0,0.8), 0 0 26px rgba(34,211,238,0.45); filter: brightness(1.18); }
        100% { transform: translateY(0) scale(1); box-shadow: 5px 5px 20px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.8), 0 0 0 rgba(34,211,238,0); filter: brightness(1); }
      }
      @keyframes draw-card-flight {
        0% { transform: translate(-50%, -50%) translate(0px, 0px) scale(0.72) rotate(-7deg); opacity: 0; }
        12% { opacity: 1; }
        60% { transform: translate(-50%, -50%) translate(calc(var(--draw-dx) * 0.62), calc(var(--draw-dy) * 0.62 - 42px)) scale(0.9) rotate(2deg); opacity: 1; }
        100% { transform: translate(-50%, -50%) translate(var(--draw-dx), var(--draw-dy)) scale(1) rotate(0deg); opacity: 0; }
      }
      @keyframes draw-card-holo {
        0% { filter: brightness(1.5) saturate(1.4); opacity: 0.7; }
        50% { filter: brightness(1.9) saturate(1.8); opacity: 1; }
        100% { filter: brightness(1.15) saturate(1.15); opacity: 0.92; }
      }
      @keyframes draw-card-trail {
        0% { transform: translate(-50%, -50%) translate(0px, 0px) scaleY(0.4); opacity: 0; }
        16% { opacity: 0.75; }
        100% { transform: translate(-50%, -50%) translate(calc(var(--draw-dx) * 0.82), calc(var(--draw-dy) * 0.82 - 20px)) scaleY(1); opacity: 0; }
      }
      @keyframes draw-card-arrive {
        0% { transform: scale(0.82); opacity: 0; }
        35% { opacity: 0.9; }
        100% { transform: scale(1.08); opacity: 0; }
      }
      @keyframes attack-flash { 0% { opacity: 0; transform: scale(0.74); } 18% { opacity: 0.9; transform: scale(0.98); } 100% { opacity: 0; transform: scale(1.12); } }
      @keyframes projectile-shot { 0% { transform: translate(-50%, 20px) rotate(var(--shot-angle)) scaleX(0.45); opacity: 0; } 18% { opacity: 1; } 100% { transform: translate(-50%, -78px) rotate(var(--shot-angle)) scaleX(1); opacity: 0; } }
      @keyframes impact-ring { 0% { opacity: 0; transform: scale(0.72); } 18% { opacity: 0.85; } 100% { opacity: 0; transform: scale(1.18); } }
      @keyframes impact-spark { 0% { transform: rotate(var(--spark-rot)) translateX(0) scale(0.2); opacity: 0; } 18% { opacity: 1; } 100% { transform: rotate(var(--spark-rot)) translateX(var(--spark-dist)) scale(1); opacity: 0; } }
      @keyframes card-trail { 0% { opacity: 0; transform: translate(-50%, 10px) scaleY(0.3); } 25% { opacity: 0.55; } 100% { opacity: 0; transform: translate(-50%, -120px) scaleY(1); } }
      @keyframes foil-rare { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      @keyframes foil-legendary { 0% { background-position: 0% 50%; filter: hue-rotate(0deg); } 50% { background-position: 100% 50%; filter: hue-rotate(180deg); } 100% { background-position: 0% 50%; filter: hue-rotate(360deg); } }
      @keyframes enemy-slash { 0% { transform: scaleX(0) rotate(45deg); opacity: 1; } 50% { transform: scaleX(3) rotate(45deg); opacity: 1; } 100% { transform: scaleX(3) rotate(45deg); opacity: 0; } }
      @keyframes eva-scroll { from { background-position: 0px 0; } to { background-position: -113px 0; } }
      @keyframes eva-flash { 0%, 100% { opacity: 0.8; } 50% { opacity: 0.3; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(50px) scale(var(--tw-scale-x, 1)); } to { opacity: 1; transform: translateY(0) scale(var(--tw-scale-x, 1)); } }
      @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      @keyframes unlockFlare { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
      @keyframes enemy-death {
        0% { opacity: 1; transform: scale(1); filter: brightness(1) saturate(1); }
        16% { opacity: 1; transform: scale(1.1); filter: brightness(2.8) saturate(1.8); }
        34% { opacity: 1; transform: scale(0.86); filter: brightness(4) saturate(2.1) blur(1px); }
        100% { opacity: 0; transform: scale(0.15); filter: brightness(0.2) saturate(0.4) blur(10px); }
      }
      @keyframes enemy-data-scan {
        0% { opacity: 0; transform: translateY(28px) scaleY(0.5); }
        20% { opacity: 1; }
        100% { opacity: 0; transform: translateY(-42px) scaleY(1.35); }
      }
      @keyframes enemy-death-flash {
        0% { opacity: 0; transform: scale(0.6); }
        20% { opacity: 1; }
        100% { opacity: 0; transform: scale(1.7); }
      }
      @keyframes enemy-overload-core {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.25); }
        18% { opacity: 1; }
        45% { opacity: 1; transform: translate(-50%, -50%) scale(0.92); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.9); }
      }
      @keyframes enemy-overload-ring {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.45); }
        24% { opacity: 0.95; }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.75); }
      }
      @keyframes enemy-data-shard {
        0% { transform: translate(0px, 0px) rotate(0deg) scale(0.25); opacity: 0; }
        10% { opacity: var(--shard-opacity, 0.85); }
        68% { opacity: calc(var(--shard-opacity, 0.85) * 0.78); }
        100% { transform: translate(var(--shard-x, 0px), var(--shard-y, 0px)) rotate(var(--shard-rot, 0deg)) scale(0.18); opacity: 0; }
      }
      @keyframes rare-reveal { 
          0% { opacity: 0; box-shadow: 0 0 0px rgba(234,179,8,0); transform: scale(0.8); filter: brightness(1.7); } 
          30% { opacity: 1; box-shadow: 0 0 40px rgba(234,179,8,0.8), 0 0 80px rgba(234,179,8,0.4); transform: scale(1.08); }
          60% { opacity: 1; box-shadow: 0 0 20px rgba(234,179,8,0.6); transform: scale(1.0); }
          100% { opacity: 1; box-shadow: 0 0 15px rgba(234,179,8,0.3); transform: scale(1.0); filter: brightness(1); } 
      }
      @keyframes legendary-reveal { 
          0% { opacity: 0; box-shadow: 0 0 0px rgba(168,85,247,0); transform: scale(0.5) rotate(-5deg); filter: brightness(3); } 
          20% { opacity: 1; box-shadow: 0 0 60px rgba(168,85,247,1), 0 0 120px rgba(234,179,8,0.8), 0 0 200px rgba(239,68,68,0.4); transform: scale(1.15) rotate(2deg); filter: brightness(2); }
          50% { opacity: 1; box-shadow: 0 0 40px rgba(168,85,247,0.8), 0 0 80px rgba(234,179,8,0.5); transform: scale(0.98) rotate(-1deg); filter: brightness(1.2); }
          70% { opacity: 1; transform: scale(1.05) rotate(0deg); filter: brightness(1); }
          100% { opacity: 1; box-shadow: 0 0 25px rgba(168,85,247,0.4), 0 0 50px rgba(234,179,8,0.2); transform: scale(1.0) rotate(0deg); filter: brightness(1); } 
      }
      @keyframes legendary-flash { 
          0% { opacity: 0; } 
          15% { opacity: 0.8; } 
          100% { opacity: 0; } 
      }
      @keyframes legendary-ring {
          0% { transform: scale(0.3); opacity: 1; border-width: 8px; }
          100% { transform: scale(3); opacity: 0; border-width: 1px; }
      }
      @keyframes upgrade-burst {
          0% { opacity: 0; transform: scale(0.3); }
          15% { opacity: 1; transform: scale(1.1); }
          30% { opacity: 1; transform: scale(1.0); }
          80% { opacity: 0.8; transform: scale(1.0); }
          100% { opacity: 0; transform: scale(1.5); }
      }
      @keyframes upgrade-ring {
          0% { opacity: 1; transform: scale(0.8); border-width: 4px; }
          50% { opacity: 0.8; transform: scale(1.05); border-width: 2px; }
          100% { opacity: 0; transform: scale(1.8); border-width: 1px; }
      }
      @keyframes upgrade-shine {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(200%) rotate(25deg); }
      }
      @keyframes loot-fountain { 
          0% { opacity: 0; transform: translateY(0) scale(0.5) rotate(0deg); } 
          20% { opacity: 1; transform: translate(calc(var(--drop-x) * 0.5), -50px) scale(1.2) rotate(10deg); }
          80% { opacity: 1; transform: translate(var(--drop-x), -100px) scale(1.5) rotate(15deg); }
          100% { opacity: 0; transform: translate(var(--drop-x), -120px) scale(1) rotate(20deg); } 
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // --- Derived State for Menu Notifications ---
  const canUnlockSkill = useMemo(() => {
    return visibleSkillEntries.some(([, skill]) => {
        const reqsMet = skill.requiresAny.length === 0 || skill.requiresAny.some(req => meta.unlockedSkills.includes(req));
        return meta.gp >= skill.cost && reqsMet && !meta.unlockedSkills.includes(skill.id);
    });
  }, [meta.gp, meta.unlockedSkills, visibleSkillEntries]);

  const canUpgradeCard = useMemo(() => {
    return Object.keys(CARD_DB).some(id => {
        const totalOwned = meta.collection[id] || 0;
        const inDeckCount = meta.activeDeck.filter(c => c === id).length;
        const available = totalOwned - inDeckCount;
        const lvl = meta.cardLevels[id] || 1;
        const isMax = lvl >= 4;
        const cost = isMax ? 0 : UPGRADE_COSTS[lvl - 1];
        return !isMax && available >= cost;
    });
  }, [meta.collection, meta.activeDeck, meta.cardLevels]);

  const hasPacks = meta.packs > 0 || meta.fragments >= 10;
  const activeDeathEffect = run.deathEffect && frameNow - run.deathEffect.timestamp < 720 ? run.deathEffect : null;
  const deathMonsterIconType = activeDeathEffect ? getMonsterIcon(activeDeathEffect.monster) : null;
  const resolvedActiveGachaTabId = visibleGachaTabs.some((tab) => tab.id === activeGachaTabId) ? activeGachaTabId : (visibleGachaTabs[0]?.id || 'synthesis');
  const activeGachaTab = visibleGachaTabs.find((tab) => tab.id === resolvedActiveGachaTabId) || visibleGachaTabs[0];
  const activeBanner = activeGachaTab.kind === 'banner' ? (BANNER_MAP[activeGachaTab.id] || BANNER_MAP.standard) : null;
  const lastOpenedBanner = BANNER_MAP[lastOpenedBannerId] || BANNER_MAP.standard;
  const previewBanner = previewBannerId ? (BANNER_MAP[previewBannerId] || null) : null;

  // --- Views ---

  const enterDungeonFlow = () => {
    if (unlockedDungeons.length <= 1) {
      const onlyDungeon = unlockedDungeons[0];
      if (onlyDungeon) startRun(onlyDungeon.id);
      return;
    }
    setView('dungeons');
  };

  const renderMenu = () => {
    const btnBase = "w-full flex items-center justify-center gap-3 p-4 rounded font-black uppercase tracking-widest transition-all backdrop-blur-sm bg-slate-900 border text-slate-300 shadow-md";
    const currentStage = STAGE_DEFS[meta.stage] || STAGE_DEFS[1];
    
    return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-black text-white p-6 relative overflow-hidden font-tech">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      
      <div className="text-center relative z-10">
        <div className="absolute -inset-10 bg-cyan-500/10 blur-3xl rounded-full" />
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)] leading-tight">
          CODEX DUELIST
        </h1>
        <p className="text-cyan-400 tracking-[0.35em] text-[10px] md:text-xs mt-2 md:mt-4 font-bold uppercase drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
          {currentStage.name} · {currentStage.era}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-sm relative z-10">
        <button onClick={enterDungeonFlow} className={`${btnBase} border-slate-700 hover:border-cyan-400 hover:text-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] group overflow-hidden relative`}>
          <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          <Play className="group-hover:scale-125 transition-transform drop-shadow-md" fill="currentColor" />
          {unlockedDungeons.length > 1 ? 'DUNGEON SELECT' : 'ENTER LINK VRAINS'}
        </button>

        <button onClick={() => { setView('deck'); setActiveTab('trunk'); }} className={`${btnBase} border-slate-700 hover:border-purple-400 hover:text-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]`}>
          <Layers size={18} /> DECK EDIT
        </button>

        {hasFeature('skills') && (
            <button onClick={() => setView('skills')} className={`${btnBase} ${canUnlockSkill ? 'border-blue-500 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse ring-1 ring-blue-400 hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]' : 'border-slate-700 hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]'}`}>
              <ArrowUpCircle size={18} /> SKILLS
            </button>
        )}

        {hasFeature('codex') && (
            <button onClick={() => { setView('codex'); setActiveTab('trunk'); }} className={`${btnBase} ${hasFeature('upgrades') && canUpgradeCard ? 'border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse ring-1 ring-emerald-400 hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]' : 'border-slate-700 hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}>
              <Library size={18} /> CODEX
            </button>
        )}

        {hasFeature('shop') && (
            <button onClick={() => setView('gacha')} className={`${btnBase} ${hasPacks ? 'border-amber-500 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse ring-1 ring-amber-400 hover:border-amber-400 hover:text-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.8)]' : 'border-slate-700 hover:border-amber-400 hover:text-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]'}`}>
                <Package size={20} /> SHOP & PACKS
            </button>
        )}

        <button onClick={() => { if(confirm("Are you sure you want to completely erase your save data?")) { localStorage.clear(); window.location.reload(); } }} className={`${btnBase} border-red-900 hover:border-red-500 text-red-500 mt-4`}>
           <Trash2 size={16} /> RESET SAVE DATA
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 sm:gap-6 bg-black/50 w-full max-w-sm px-4 sm:px-6 py-3 rounded text-xs sm:text-sm font-black border border-slate-800 shadow-md relative z-10 flex-wrap">
        <div className="flex items-center gap-2 text-slate-300"><Coins size={16} className="text-yellow-400" /> {meta.gp}</div>
        <div className="flex items-center gap-2 text-slate-300"><Layers size={16} className="text-purple-400" /> {meta.fragments}</div>
        <div className="flex items-center gap-2 text-slate-300"><Package size={16} className="text-blue-400" /> {meta.packs}</div>
      </div>
    </div>
  )};

  const renderDungeonSelect = () => {
    const btnBase = "w-full flex items-center justify-center gap-3 p-4 rounded font-black uppercase tracking-widest transition-all backdrop-blur-sm bg-slate-900 border text-slate-300 shadow-md";
    const currentStage = STAGE_DEFS[meta.stage] || STAGE_DEFS[1];

    return (
      <div className="flex flex-col items-center justify-center h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-black text-white p-6 relative overflow-hidden font-tech">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        <div className="w-full max-w-3xl relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setView('menu')} className="flex items-center gap-2 text-cyan-400 hover:text-white uppercase font-black text-xs sm:text-sm tracking-widest">
              <ArrowLeft size={16} /> Hub
            </button>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-500 font-black">Dungeon Select</div>
              <div className="text-lg sm:text-2xl font-black text-white mt-1">{currentStage.name}</div>
            </div>
          </div>

          <div className="grid gap-4">
            {unlockedDungeons.map((dungeon) => {
              const isCompleted = (meta.completedDungeons || []).includes(dungeon.id);
              return (
                <button
                  key={dungeon.id}
                  onClick={() => startRun(dungeon.id)}
                  className="w-full text-left rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-5 hover:border-cyan-400 hover:text-white transition-all shadow-[0_0_20px_rgba(15,23,42,0.5)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Play size={16} className="text-cyan-400" fill="currentColor" />
                        <span className="text-xl font-black text-white">{dungeon.name}</span>
                        {isCompleted ? (
                          <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] uppercase tracking-[0.2em] font-black border border-emerald-500/30">
                            Cleared
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{dungeon.description}</p>
                      <div className="mt-3 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                        Route unlocks: {dungeon.nodes
                          .filter((node) => typeof node === 'object' && node.type === 'unlock_feature' && !(meta.unlockedFeatures || []).includes(node.feature))
                          .map((node) => FEATURE_LABELS[node.feature] || node.label || node.feature)
                          .join(' · ') || 'Resource income only'}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-slate-600">
                        Clear reward: {[
                          ...(dungeon.unlocks?.stages || []).map((stageId) => STAGE_DEFS[stageId] ? `${STAGE_DEFS[stageId].name}` : `Stage ${stageId}`),
                        ].join(' · ') || 'None'}
                      </div>
                    </div>
                    <ChevronRight size={22} className="text-cyan-400 shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <button onClick={() => setView('menu')} className={`${btnBase} border-slate-700 hover:border-cyan-400 hover:text-cyan-400`}>
              <ArrowLeft size={16} /> RETURN
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCombat = () => {
    if (!run.runMap || run.runMap.length === 0) return null;

    const currentMapNode = run.runMap[run.nodeIndex];
    const isCombatNode = currentMapNode && (currentMapNode.type === 'encounter' || currentMapNode.type === 'boss');
    const renderTimestamp = frameNow;
    const isHitStopActive = renderTimestamp < hitStopUntil;
    const manaFx = [];
    const hasDrawFx = pendingDrawEffects.length > 0 || drawAnimations.length > 0;

    let monsterTimerPercent = 0;
    let timeLeft = "0.0";
    let showTimer = false, showDanger = false, showCritical = false;
    let isMonsterAttacking = false;
    let MonsterIcon = Trophy;
    let playerHealPulseSignal = 0;
    let shakeLevel = 0;

    for (const effect of run.activeEffects || []) {
        if (effect.type === 'mana') manaFx.push(effect);
        if (effect.type === 'heal') playerHealPulseSignal = Math.max(playerHealPulseSignal, effect.timestamp || 0);
        if (isCombatNode && effect.type === 'atk') shakeLevel = Math.max(shakeLevel, effect.cost >= 3 ? 2 : 1);
    }

    const hasManaFx = manaFx.length > 0;

    if (isCombatNode && run.monster) {
        monsterTimerPercent = (run.monster.timer / run.monster.maxTimer) * 100;
        timeLeft = Math.max(0, run.monster.maxTimer - run.monster.timer).toFixed(1);
        showTimer = monsterTimerPercent > 50;
        showDanger = monsterTimerPercent > 80;
        showCritical = monsterTimerPercent > 90;
        isMonsterAttacking = run.enemyAttackEffects && run.enemyAttackEffects.some(e => renderTimestamp - e.timestamp < 200);
        MonsterIcon = getMonsterIcon(run.monster);
    }
    const shakeClass = shakeLevel === 2 ? 'animate-[window-shake-heavy_0.3s_ease-in-out_infinite]' : shakeLevel === 1 ? 'animate-[window-shake-small_0.15s_ease-in-out_infinite]' : '';

    return (
      <div className={`flex flex-col h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black text-white overflow-hidden relative border-x-0 sm:border-x-[6px] border-black shadow-[inset_0_0_50px_rgba(0,255,255,0.05)] font-tech ${shakeClass} ${isHitStopActive ? 'scale-[1.01] brightness-110' : ''}`}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        
        {run.eventPopup && (
            <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center font-tech p-6 text-center backdrop-blur-sm">
                 <div className="bg-slate-900 border border-cyan-500 p-8 rounded-xl shadow-[0_0_50px_rgba(0,255,255,0.2)] max-w-md w-full animate-[popIn_0.3s_ease-out]">
                     <h2 className="text-4xl text-cyan-400 font-black mb-2 uppercase tracking-widest">{run.eventPopup.title}</h2>
                     <p className="text-slate-300 mb-8 font-read text-lg">{run.eventPopup.text}</p>
                     
                     <div className="flex flex-col gap-3 mb-8">
                         {run.eventPopup.loot.map((item, idx) => (
                             <div key={idx} className="bg-black/50 border border-slate-700 p-3 rounded font-black text-xl text-yellow-400 tracking-widest shadow-inner">
                                 {item}
                             </div>
                         ))}
                     </div>

                     <button onClick={closeEventPopup} className="w-full py-4 bg-cyan-600 text-white font-black uppercase tracking-widest rounded shadow-[0_0_20px_rgba(8,145,178,0.5)] hover:bg-cyan-500 hover:scale-105 transition-all">
                         Acknowledge
                     </button>
                 </div>
            </div>
        )}

        <CombatTopMap runMap={run.runMap} nodeIndex={run.nodeIndex} />

          <button 
              onClick={() => setShowOptions(true)} 
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[90] p-2 bg-[#1a110a] border border-[#8f6a48] rounded-sm hover:bg-[#4a3222] pointer-events-auto shadow-[0_0_15px_rgba(0,0,0,0.8)]"
          >
              <Activity className="text-[#8f6a48]" size={24} /> 
          </button>

          {showOptions && (
              <div className="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center pointer-events-auto">
                 <div className="bg-[#1a110a] border-4 border-[#4a3222] shadow-[0_0_30px_rgba(255,100,50,0.2)] p-2 sm:p-8 flex flex-col gap-4 rounded-sm min-w-[200px] sm:min-w-[300px]">
                     <h2 className="text-white text-2xl sm:text-3xl font-black text-center mb-4 sm:mb-6 tracking-widest border-b-2 border-[#4a3222] pb-4">OPTIONS</h2>
                     <button className="bg-slate-800/50 border border-slate-600 text-slate-400 p-2 sm:p-4 font-bold opacity-50 cursor-not-allowed">Volume: 100% (WIP)</button>
                     <button onClick={() => { setShowOptions(false); setMeta(m => applyRunRewards(m, run, false)); setView('gameover'); }} className="bg-red-900 border border-red-500 text-white p-2 sm:p-4 font-black tracking-widest hover:bg-red-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">END RUN</button>
                     <button onClick={() => setShowOptions(false)} className="bg-cyan-900/60 border border-cyan-700 text-white p-2 sm:p-4 font-bold hover:bg-cyan-800 mt-2 sm:mt-4">RESUME</button>
                 </div>
              </div>
          )}

          {levelBanner && levelBanner.visible && (
             <div className="absolute top-[25%] left-1/2 -translate-x-1/2 pointer-events-none z-[100] w-full flex justify-center">
                 <div className={`px-16 py-6 border-y-4 shadow-2xl flex flex-col items-center animate-[loot-fountain_2s_ease-in-out_forwards] backdrop-blur-md ${levelBanner.isBoss ? 'bg-red-900/80 border-red-500 shadow-[0_0_50px_rgba(255,0,0,0.8)]' : 'bg-black/90 border-cyan-500 shadow-[0_0_50px_rgba(0,255,255,0.4)]'}`}>
                     <span className={`text-4xl sm:text-6xl font-black tracking-[0.2em] ${levelBanner.isBoss ? 'text-red-400 drop-shadow-[0_0_15px_rgba(255,0,0,1)]' : 'text-cyan-400 drop-shadow-[0_0_15px_rgba(0,255,255,1)]'}`}>
                         {levelBanner.isBoss ? 'WARNING: BOSS' : `FLOOR ${levelBanner.floor}-${levelBanner.room}`}
                     </span>
                 </div>
             </div>
          )}

        {/* --- MAIN ARENA --- */}
        <div className="flex-grow flex flex-col items-center justify-start pt-6 sm:pt-10 relative z-10 overflow-hidden transform scale-90 sm:scale-100">
           {(!run.activeEvent || isCombatNode) && (
               <CombatVfxCanvas
                   activeEffects={run.activeEffects}
                   enemyAttackEffects={run.enemyAttackEffects || []}
                   hitStopUntil={hitStopUntil}
                   enemyRef={enemyCardRef}
               />
           )}
           
           {isCombatNode && run.monster && (
               <div className="absolute w-full flex justify-center z-30 px-4">
                   <CombatStatusPanel 
                       isPlayer={false} hp={run.monster.hp} maxHp={run.monster.maxHp} 
                       title="Attack Timer" showDanger={showDanger}
                       extraContent={
                           <div className={`w-full h-1.5 bg-black rounded-sm overflow-hidden border transition-all ${showDanger ? 'border-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)]' : 'border-slate-800'}`}>
                               <div className={`h-full ${showDanger ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,1)]'}`} style={{ width: `${monsterTimerPercent}%` }} />
                           </div>
                       }
                   />
               </div>
           )}

           <div className="absolute bottom-1/4 w-96 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none transform -rotate-12" />
           
           {/* Tiered Eva Countdown */}
           {showTimer && (
               <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] sm:text-[20rem] font-black pointer-events-none z-0 transition-colors duration-300 drop-shadow-2xl ${showDanger ? 'text-red-600/30' : 'text-yellow-500/20'}`}>
                    {timeLeft}
               </div>
           )}

           {/* Danger Stripes Overlay */}
           {showDanger && (
               <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between overflow-hidden pt-24">
                   <div className="h-8 sm:h-12 w-[150%] bg-[#cc0000] border-y-4 border-black relative transform -translate-x-10 -rotate-2 origin-top-left shadow-[0_0_30px_red] mt-4 opacity-90">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,#000_40px,#000_80px)] animate-[eva-scroll_1.5s_linear_infinite]" />
                        <div className="absolute inset-0 flex items-center gap-8 px-4 overflow-hidden text-black font-black text-xl sm:text-2xl tracking-[0.5em]">
                            {WARNING_TEXTS.map((t,i) => <span key={`w1-${i}`} className="bg-[#cc0000] px-2">{t}</span>)}
                        </div>
                   </div>
                   <div className="h-8 sm:h-12 w-[150%] bg-[#cc0000] border-y-4 border-black relative transform translate-x-10 rotate-2 origin-bottom-right shadow-[0_0_30px_red] mb-4 opacity-90">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_40px,#000_40px,#000_80px)] animate-[eva-scroll_1.5s_linear_infinite]" />
                        <div className="absolute inset-0 flex items-center gap-8 px-4 overflow-hidden text-black font-black text-xl sm:text-2xl tracking-[0.5em]">
                            {DANGER_TEXTS.map((t,i) => <span key={`d1-${i}`} className="bg-[#cc0000] px-2">{t}</span>)}
                        </div>
                   </div>
               </div>
           )}

           {/* Critical Emergency Center Flash */}
           {showCritical && (
               <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center bg-red-900/30 mix-blend-color-burn animate-[eva-flash_0.2s_infinite]">
                   <div className="w-full bg-black/80 border-y-[8px] sm:border-y-[12px] border-red-600 py-4 sm:py-6 text-center transform -skew-y-3 mt-16">
                       <div className="text-5xl sm:text-7xl md:text-8xl font-black text-red-600 tracking-[0.3em] drop-shadow-[0_0_30px_red]">EMERGENCY</div>
                   </div>
               </div>
           )}

           {/* Render Card Effects Overlay */}
           {(!run.activeEvent || isCombatNode) && (
           <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center mt-12">
              {/* Floating Loot Drops */}
               {run.floatingDrops && run.floatingDrops.map(drop => {
                    let color = 'text-yellow-400';
                    const iconSz = drop.isLabel ? 16 : 24;
                    let icon = <Coins size={iconSz} />;
                    if (drop.type === 'frag') { color = 'text-purple-400'; icon = <Layers size={iconSz} />; }
                    if (drop.type === 'pack') { color = 'text-blue-400'; icon = <Package size={iconSz} />; }
                    if (drop.type === 'heal') { color = 'text-green-400'; icon = <Heart size={iconSz} />; }
                    if (drop.type === 'unlock') { color = 'text-amber-400'; icon = <Key size={iconSz} />; }

                    if (drop.isLabel) {
                        return (
                            <div key={drop.id} style={{'--drop-x': '0px'}} className={`absolute flex items-center justify-center gap-1 font-black text-xl sm:text-2xl drop-shadow-[0_0_10px_currentColor] animate-[loot-fountain_1.5s_ease-out_forwards] z-[60] pointer-events-none ${color}`}>
                                {icon} {drop.val}
                            </div>
                        );
                    }

                    return (
                        <div key={drop.id} style={{'--drop-x': `${drop.offsetX}px`}} className={`absolute flex items-center justify-center font-black drop-shadow-[0_0_10px_currentColor] animate-[loot-fountain_1.5s_ease-out_forwards] z-[60] pointer-events-none ${color}`}>
                            {icon}
                        </div>
                    );
                })}
           </div>
           )}

           {/* Middle Sprite Area */}
           <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[45]">
               {run.activeEvent && !isCombatNode ? (
                   <div className="relative group transition-transform duration-100 cursor-pointer hover:scale-110 p-8 -m-8" onClick={triggerEventRewards}>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-yellow-900/40 rounded-[100%] border border-yellow-500/30 shadow-[0_0_30px_rgba(250,204,21,0.2)]" />
                        <div className={`w-44 h-60 rounded-sm bg-gradient-to-br ${
                            run.activeEvent.type === 'treasure' ? 'from-yellow-900 to-black border-yellow-500 shadow-[0_0_50px_rgba(250,204,21,0.4)]' :
                            run.activeEvent.type === 'rest' ? 'from-green-900 to-black border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.4)]' :
                            'from-amber-900 to-black border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.4)]'
                        } border-2 flex flex-col items-center justify-center relative overflow-hidden transform transition-transform duration-500`}>
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px]" />
                            
                            {run.activeEvent.type === 'treasure' && <Package size={80} className="text-yellow-400 drop-shadow-[0_0_15px_currentColor]" />}
                            {run.activeEvent.type === 'rest' && <Tent size={80} className="text-green-400 drop-shadow-[0_0_15px_currentColor]" />}
                            {run.activeEvent.type.startsWith('unlock') && <Key size={80} className="text-amber-400 drop-shadow-[0_0_15px_currentColor]" />}
                            
                            <span className="text-sm font-black text-white text-center px-2 tracking-tight mt-4">{run.activeEvent.label}</span>
                            <div className="mt-2 bg-black/60 px-3 py-1 rounded border border-white/10 animate-pulse">
                                <span className="text-xs text-white font-bold">TAP TO CLAIM</span>
                            </div>
                        </div>
                   </div>
               ) : isCombatNode && run.monster ? (
                   <div className={`relative group transition-transform duration-100 z-10 ${isMonsterAttacking ? 'translate-y-8 scale-110' : ''}`}>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-cyan-900/40 rounded-[100%] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]" />
                      
                      <div ref={enemyCardRef} className={`w-44 h-60 rounded-sm bg-gradient-to-br ${run.monster.isBoss ? 'from-red-950 to-black border-red-500 shadow-[0_0_50px_rgba(255,0,0,0.4)]' : 'from-slate-800 to-slate-900 border-cyan-400/50 shadow-[0_0_30px_rgba(0,255,255,0.2)]'} border-2 flex flex-col items-center justify-center relative overflow-hidden transform group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-500 ${isHitStopActive ? 'scale-110 brightness-125' : ''}`}>
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                          <MonsterIcon size={80} className={`${run.monster.isBoss ? 'text-red-400' : 'text-cyan-400'} drop-shadow-[0_0_15px_currentColor]`} />
                      </div>
                      
                      {/* Enemy Intent Speech Bubble - Pinned to the right side */}
                      <div className={`absolute top-1/2 -translate-y-1/2 -right-24 sm:-right-28 bg-black/90 border-2 ${showDanger ? 'border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.6)] animate-pulse' : 'border-slate-600'} rounded-lg p-2 flex flex-col items-center justify-center z-20 transition-all`}>
                          <div className="flex flex-col items-center gap-1 text-red-400 font-black">
                              <Sword size={24} /> 
                              <span className="text-lg">{run.monster.damage}</span>
                          </div>
                          {/* Tail */}
                          <div className={`absolute top-1/2 -left-[8px] -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] ${showDanger ? 'border-r-red-500' : 'border-r-slate-600'}`} />
                      </div>
                  </div>
               ) : null}
          </div>
        </div>

        {/* --- BOTTOM HUD & HAND AREA --- */}
        <div className="h-56 sm:h-72 relative border-t-2 border-cyan-500/50 bg-black/80 backdrop-blur-xl z-30 shrink-0 mt-8">
          
          {/* Player Status Bar */}
          <div className="absolute -top-16 w-full flex justify-center z-40 px-4">
              <CombatStatusPanel 
                  isPlayer={true} 
                  hp={run.hp} 
                  maxHp={run.maxHp} 
                  title="Player Systems" 
                  healPulseSignal={playerHealPulseSignal}
                  shield={run.shield}
                  extraContent={
                      <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2">
                              {run.shield > 0 ? (
                                  <div className="flex items-center gap-1 sm:gap-2 bg-blue-900/40 px-3 py-0.5 rounded border border-blue-400 animate-pulse">
                                      <Shield className="text-blue-400" size={14} />
                                      <span className="font-mono text-sm font-black text-blue-100">{run.shield} Block</span>
                                  </div>
                              ) : null}
                              {run.power > 0 ? (
                                  <div className="flex items-center gap-1 sm:gap-2 bg-amber-900/40 px-3 py-0.5 rounded border border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.25)]">
                                      <Sword className="text-amber-300" size={14} />
                                      <span className="font-mono text-sm font-black text-amber-100">+{run.power} Power</span>
                                  </div>
                              ) : null}
                          </div>
                          <div className="flex items-center gap-2 relative">
                              <div className={`flex items-center gap-2 ${hasManaFx ? 'animate-[mana-counter-pop_0.35s_ease-out]' : ''}`}>
                                  <div className="relative flex items-center justify-center">
                                      {manaFx.map(fx => (
                                          <React.Fragment key={fx.id}>
                                              <div className="absolute left-1/2 top-1/2 w-52 h-52 -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-visible">
                                          <svg viewBox="0 0 240 240" className="absolute inset-0 overflow-visible">
                                              <defs>
                                                  <filter id={`mana-glow-${fx.id}`} x="-80%" y="-80%" width="260%" height="260%">
                                                      <feGaussianBlur stdDeviation="2.6" result="blur" />
                                                      <feMerge>
                                                          <feMergeNode in="blur" />
                                                          <feMergeNode in="SourceGraphic" />
                                                      </feMerge>
                                                  </filter>
                                              </defs>
                                              <circle cx="120" cy="120" r="10" fill="rgba(250,204,21,0.65)">
                                                  <animate attributeName="r" values="8;18" dur="0.58s" begin="0s" fill="freeze" />
                                                  <animate attributeName="opacity" values="0.85;0" dur="0.58s" begin="0s" fill="freeze" />
                                              </circle>
                                              <circle cx="120" cy="120" r="18" stroke="rgba(250,204,21,0.4)" strokeWidth="1.5" fill="none">
                                                  <animate attributeName="r" values="12;30" dur="0.58s" begin="0s" fill="freeze" />
                                                  <animate attributeName="opacity" values="0.9;0" dur="0.58s" begin="0s" fill="freeze" />
                                              </circle>
                                              {[
                                                  'M 36 118 C 40 80, 72 46, 120 74 C 146 90, 138 110, 120 120',
                                                  'M 50 60 C 78 28, 128 24, 150 58 C 162 82, 138 104, 120 120',
                                                  'M 96 34 C 138 24, 168 40, 168 74 C 166 94, 142 108, 120 120',
                                                  'M 144 34 C 186 44, 202 76, 176 100 C 156 116, 132 120, 120 120',
                                                  'M 186 62 C 198 100, 182 128, 152 132 C 134 132, 124 126, 120 120',
                                                  'M 192 116 C 174 150, 140 164, 124 144 C 116 134, 116 126, 120 120',
                                                  'M 156 164 C 126 176, 88 170, 82 142 C 84 130, 100 124, 120 120',
                                                  'M 100 182 C 60 180, 34 150, 48 124 C 62 112, 88 112, 120 120',
                                                  'M 44 158 C 16 132, 18 90, 48 76 C 78 72, 102 92, 120 120',
                                                  'M 26 106 C 28 64, 58 36, 92 48 C 116 58, 124 90, 120 120',
                                              ].map((pathD, idx) => (
                                                  <g key={`mana-spiral-${fx.id}-${idx}`} filter={`url(#mana-glow-${fx.id})`}>
                                                      {[0.14, 0.09, 0.04].map((delay, trailIdx) => (
                                                          <g key={`mana-wisp-${fx.id}-${idx}-${trailIdx}`} opacity="0">
                                                              <ellipse
                                                                  cx="0"
                                                                  cy="0"
                                                                  rx={trailIdx === 0 ? 20 : trailIdx === 1 ? 14 : 9}
                                                                  ry={trailIdx === 0 ? 1.5 : trailIdx === 1 ? 1.25 : 1}
                                                                  fill={trailIdx === 0 ? 'rgba(250,204,21,0.26)' : trailIdx === 1 ? 'rgba(250,204,21,0.48)' : 'rgba(255,255,255,0.95)'}
                                                              />
                                                              <animateMotion
                                                                  dur={`${0.58 - delay}s`}
                                                                  begin={`${delay}s`}
                                                                  fill="freeze"
                                                                  rotate="auto"
                                                                  path={pathD}
                                                              />
                                                              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.9;1" dur={`${0.58 - delay}s`} begin={`${delay}s`} fill="freeze" />
                                                          </g>
                                                      ))}
                                                  </g>
                                              ))}
                                          </svg>
                                              </div>
                                              <div className="absolute left-1/2 bottom-full -translate-x-1/2 text-green-300 font-black text-2xl drop-shadow-[0_0_10px_rgba(74,222,128,0.85)] animate-[combat-mana-up_0.45s_ease-out_forwards]">
                                                  +{fx.cardObj?.currentValue || 1}
                                              </div>
                                          </React.Fragment>
                                      ))}
                                      <Zap className="text-yellow-400 fill-yellow-400" size={16} />
                                  </div>
                                  <span className="font-mono text-xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">{Math.floor(run.mana)} MP</span>
                              </div>
                          </div>
                      </div>
                  }
              />
          </div>

          <div 
             className="absolute left-0 bottom-0 w-1/3 h-full flex flex-col items-start sm:items-center justify-end pb-4 sm:pb-8 pl-2 sm:pl-0 z-10 cursor-pointer"
             onClick={() => setIsDiscardMode(!isDiscardMode)}
          >
             <div className={`relative w-16 h-24 sm:w-28 sm:h-40 rounded-sm border-2 shadow-[inset_0_0_30px_rgba(0,0,0,1)] flex items-center justify-center transform transition-all duration-200 origin-bottom-left sm:origin-center
                ${isDiscardMode ? 'border-red-500 bg-red-900/40 scale-110 shadow-[0_0_40px_rgba(255,0,0,0.8)] animate-pulse' : 'bg-black/90 border-slate-700 hover:border-red-500'}
             `}>
                 {run.hand.length >= meta.maxHand && run.hand.every(c => getEffectiveCost(c) > run.mana) && (
                    <div className="absolute inset-0 flex items-center justify-center animate-bounce z-[60] text-white drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] pointer-events-none">
                        <Pointer size={48} className="fill-white" strokeWidth={1.5} />
                    </div>
                 )}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05)_100%)] bg-[size:10px_10px] sm:bg-[size:20px_20px]" />
                <Trash2 size={24} className={`relative z-10 transition-colors sm:w-8 sm:h-8 ${isDiscardMode ? 'text-red-400' : 'text-slate-600'}`} />
                {run.discard.length > 0 && (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center border-2 border-slate-600 rounded-sm pointer-events-none">
                        <span className="text-xl sm:text-4xl font-black text-slate-500">{run.discard.length}</span>
                    </div>
                )}
             </div>
             <span className={`text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black mt-1 sm:mt-2 transition-colors ${isDiscardMode ? 'text-red-400 animate-pulse' : 'text-cyan-600'}`}>
                 {isDiscardMode ? 'CANCEL DISCARD' : 'DISCARD MODE'}
             </span>
          </div>

          <div className={`absolute bottom-2 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-end -space-x-12 sm:-space-x-4 z-30 transform scale-75 sm:scale-100 origin-bottom transition-all duration-300 ${isDiscardMode ? 'bg-red-900/30 p-4 sm:p-8 rounded-xl shadow-[0_0_50px_rgba(255,0,0,0.3)] ring-2 ring-red-500' : ''}`}>
            {run.hand.map((card) => (
              <div key={card.runId} ref={(node) => setHandCardRef(card.runId, node)} className="relative">
                <Card 
                  cardId={card.id}
                  overrideCard={card}
                  onPlay={playCard} 
                  onDiscard={discardCardByRunId}
                  effectiveCost={getEffectiveCost(card)}
                  canAfford={run.mana >= getEffectiveCost(card)}
                  inHand={true}
                  level={card.currentLevel}
                  overrideValue={card.currentValue}
                  isDiscardMode={isDiscardMode}
                  isEventNode={!isCombatNode && !!run.activeEvent}
                />
              </div>
            ))}
            {run.hand.length === 0 && (
                <div className="w-48 sm:w-72 h-32 sm:h-40 flex items-center justify-center border-2 border-dashed border-cyan-900/50 rounded-sm bg-black/40 backdrop-blur-sm pointer-events-none">
                    <span className="text-cyan-600/50 font-black uppercase tracking-[0.3em] text-xs sm:text-sm text-center px-4">
                        Draw Phase Required
                    </span>
                </div>
            )}
          </div>

          <div className="absolute right-2 sm:right-8 bottom-4 sm:bottom-8 flex flex-col items-end sm:items-center gap-1 sm:gap-2 z-10 group">
             <button 
                ref={deckButtonRef}
                onClick={drawCard}
                className={`relative w-16 h-24 sm:w-28 sm:h-40 bg-[#1a110a] rounded-sm border-[2px] sm:border-[4px] border-[#4a3222] shadow-[5px_5px_20px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center transform hover:-translate-y-2 hover:shadow-[10px_15px_30px_rgba(0,255,255,0.2)] transition-all active:scale-95 overflow-hidden origin-bottom-right sm:origin-center ${hasDrawFx ? 'animate-[draw-deck-pulse_0.34s_ease-out]' : ''}`}
             >
                {(run.hand.length === 0 || (run.hand.length > 0 && run.hand.length < meta.maxHand && run.hand.every(c => getEffectiveCost(c) > run.mana))) && (
                   <div className="absolute inset-0 flex items-center justify-center animate-bounce z-[60] text-white drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] pointer-events-none">
                       <Pointer size={48} className="fill-white" strokeWidth={1.5} />
                   </div>
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4a3222_2px,transparent_2px)] bg-[size:5px_5px] sm:bg-[size:10px_10px] opacity-20" />
                <div className="absolute inset-1 sm:inset-2 border border-[#8f6a48] rounded-sm opacity-50 flex items-center justify-center">
                    <div className="w-8 h-8 sm:w-16 sm:h-16 rounded-full border sm:border-2 border-[#8f6a48] flex items-center justify-center opacity-40">
                        <BookOpen size={16} className="text-[#8f6a48] sm:w-6 sm:h-6" />
                    </div>
                </div>
                {run.deck.length > 0 && (
                    <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,1)] border-2 border-black z-10">
                        <span className="text-xs sm:text-sm font-black text-black">{run.deck.length}</span>
                    </div>
                )}
             </button>
             <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black text-cyan-600">Main Deck</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    const buySkill = (skill) => {
        const reqsMet = skill.requiresAny.length === 0 || skill.requiresAny.some(req => meta.unlockedSkills.includes(req));
        if (meta.gp >= skill.cost && reqsMet && !meta.unlockedSkills.includes(skill.id)) {
            setMeta(prev => {
                const next = skill.effect(prev);
                return { ...next, gp: prev.gp - skill.cost, unlockedSkills: [...prev.unlockedSkills, skill.id] };
            });
            setUnlockAnimId(skill.id);
            setTimeout(() => setUnlockAnimId(null), 500);
        }
    };

    const renderNode = (skillKey) => {
        const skill = SKILL_TREE_DICT[skillKey];
        if (!skill || !visibleSkillIds.has(skillKey)) return null;
        const isUnlocked = meta.unlockedSkills.includes(skill.id);
        const reqsMet = skill.requiresAny.length === 0 || skill.requiresAny.some(req => meta.unlockedSkills.includes(req));
        const canAfford = meta.gp >= skill.cost && reqsMet;
        const Icon = skill.icon;
        
        let colorTheme = BRANCH_COLORS[skill.branch] || BRANCH_COLORS.core;

        let stateClass = "bg-black border-slate-800 text-slate-500 opacity-70 grayscale"; 
        if (isUnlocked) stateClass = `${colorTheme.bg} ${colorTheme.border} text-white ${colorTheme.shadow} z-20 border-2`;
        else if (canAfford) stateClass = `bg-slate-900 border-slate-400 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-slate-800 cursor-pointer z-20 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] border-2 grayscale hover:grayscale-0 transition-all duration-300`;
        else if (reqsMet && !canAfford) stateClass = "bg-slate-900 border-slate-700 text-slate-400 z-20 border-2 grayscale";

        return (
            <div 
                key={skillKey} 
                onClick={() => !isUnlocked && reqsMet && buySkill(skill)} 
                className={`w-48 sm:w-56 p-3 rounded-sm transition-all flex flex-col absolute transform -translate-x-1/2 -translate-y-1/2 ${stateClass} font-tech`} 
                style={{ left: `${NODE_POS[skillKey].x}%`, top: `${NODE_POS[skillKey].y}%` }}
            >
                {unlockAnimId === skill.id && <div className="absolute inset-0 rounded-sm bg-white mix-blend-screen animate-[unlockFlare_0.5s_ease-out] z-0 pointer-events-none" />}
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <Icon size={18} className={isUnlocked ? colorTheme.text : (canAfford ? 'text-white' : 'text-slate-500')} />
                        <h3 className={`text-[10px] sm:text-xs font-black uppercase tracking-tight leading-tight ${canAfford && !isUnlocked ? 'text-white drop-shadow-[0_0_5px_currentColor]' : ''}`}>{skill.name}</h3>
                    </div>
                </div>
                <div className="flex justify-between items-end relative z-10">
                    <p className="text-[9px] sm:text-[10px] opacity-80 leading-tight font-read max-w-[110px] sm:max-w-[130px]">{skill.desc}</p>
                    {isUnlocked ? (
                        <div className="text-[10px] font-black uppercase tracking-widest text-white opacity-50">Active</div>
                    ) : (
                        <div className="flex flex-col items-end">
                            <span className={`text-[10px] sm:text-[11px] font-black ${canAfford ? colorTheme.text : 'text-slate-500'}`}>{skill.cost} GP</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const lines = [];
    visibleSkillEntries.forEach(([, skill]) => {
        (skill.requiresAny || []).forEach(req => {
            if (visibleSkillIds.has(req)) lines.push({ from: req, to: skill.id });
        });
    });

    const handleWheelMap = (e) => {
        e.preventDefault();
        setZoom(z => Math.max(0.3, Math.min(z - e.deltaY * 0.001, 2)));
    };

    const handleMouseDown = (e) => {
        setIsDraggingMap(true);
        setDragStartMap({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e) => {
        if (!isDraggingMap) return;
        setPan({ x: e.clientX - dragStartMap.x, y: e.clientY - dragStartMap.y });
    };

    const handleMouseUp = () => setIsDraggingMap(false);

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            setIsDraggingMap(true);
            setDragStartMap({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
        }
    };
    
    const handleTouchMove = (e) => {
        if (!isDraggingMap) return;
        setPan({ x: e.touches[0].clientX - dragStartMap.x, y: e.touches[0].clientY - dragStartMap.y });
    };

    return (
        <div className="flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-black text-white relative font-tech overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0" />
            
            <div className="flex justify-between items-center p-4 sm:p-6 relative z-40 shrink-0 border-b border-cyan-900/50 bg-black/50 backdrop-blur-md">
                <button onClick={() => setView('menu')} className="flex items-center gap-2 text-cyan-400 hover:text-white uppercase font-black text-xs sm:text-sm tracking-widest bg-black/50 px-3 sm:px-4 py-2 rounded border border-cyan-900 shadow-md">
                    <ArrowLeft size={16} /> Return
                </button>
                <div className="text-center hidden sm:block">
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500 uppercase">Skill Architecture</h2>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-black/60 border border-cyan-800/50 px-4 sm:px-6 py-2 sm:py-3 rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md">
                    <Coins className="text-yellow-400 drop-shadow-md" size={16} />
                    <span className="text-sm sm:text-xl font-black text-white">{meta.gp} GP</span>
                </div>
            </div>

            <div 
                className="w-full h-full relative cursor-grab active:cursor-grabbing z-10 touch-none overflow-hidden"
                onWheel={handleWheelMap}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
            >
                <div 
                    className="absolute w-[1600px] h-[1600px] origin-top-left"
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        {lines.map(({from, to}) => {
                            const n1 = NODE_POS[from];
                            const n2 = NODE_POS[to];
                            const isUnlocked = meta.unlockedSkills.includes(to);
                            const isPathActive = meta.unlockedSkills.includes(from) || isUnlocked;
                            return (
                                <line 
                                    key={`${from}-${to}`}
                                    x1={`${n1.x}%`} y1={`${n1.y}%`} 
                                    x2={`${n2.x}%`} y2={`${n2.y}%`} 
                                    stroke={isUnlocked ? '#06b6d4' : isPathActive ? '#0891b2' : '#1e293b'} 
                                    strokeWidth={isUnlocked ? 4 : 2} 
                                />
                            );
                        })}
                    </svg>
                    {visibleSkillEntries.map(([key]) => renderNode(key))}
                </div>
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-full border border-slate-700 text-slate-400 text-xs font-black tracking-widest z-40 pointer-events-none backdrop-blur-md">
                Drag to Pan • Scroll to Zoom
            </div>
        </div>
    );
  };

  const renderDeckEditor = () => {
    const inventory = Object.entries(meta.collection).map(([id, count]) => {
        const inDeck = meta.activeDeck.filter(deckId => deckId === id).length;
        return { id, available: count - inDeck, inDeck, total: count };
    });

    const sortedInventory = [...inventory].sort((a, b) => {
        const cardA = CARD_DB[a.id];
        const cardB = CARD_DB[b.id];
        if (sortMethod === 'cost') return cardA.cost - cardB.cost || cardA.name.localeCompare(cardB.name);
        if (sortMethod === 'name') return cardA.name.localeCompare(cardB.name);
        if (sortMethod === 'type') return cardA.type.localeCompare(cardB.type) || cardA.cost - cardB.cost;
        if (sortMethod === 'pwr') return cardB.value - cardA.value;
        return 0;
    });

    const addCard = (id) => {
        const cardData = inventory.find(c => c.id === id);
        if (cardData && cardData.available > 0 && meta.activeDeck.length < 40) {
            const animId = Math.random();
            setMeta(prev => ({ ...prev, activeDeck: [...prev.activeDeck, id] }));
            setRecentAdds(prev => [...prev, animId]);
            setTimeout(() => setRecentAdds(prev => prev.filter(x => x !== animId)), 300);
        }
    };

    const removeCard = (idx) => {
        setMeta(prev => {
            const newDeck = [...prev.activeDeck];
            newDeck.splice(idx, 1);
            return { ...prev, activeDeck: newDeck };
        });
    };

    const SortBtn = ({ value, label }) => (
        <button 
            onClick={() => setSortMethod(value)}
            className={`px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded transition-colors ${sortMethod === value ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-slate-950 text-white relative overflow-hidden font-tech">
            <div className="h-16 shrink-0 border-b border-cyan-800/50 bg-black flex justify-between items-center px-4 sm:px-6">
                <button onClick={() => setView('menu')} className="flex items-center gap-2 text-cyan-400 hover:text-white uppercase font-black text-xs sm:text-sm tracking-widest">
                    <ArrowLeft size={16} /> <span className="hidden sm:inline">Save & Return</span>
                </button>
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-widest text-purple-500">Deck Constructor</h2>
                <div className="text-slate-400 text-xs sm:text-sm font-black">
                    Cards: <span className={meta.activeDeck.length < 10 ? 'text-red-500' : 'text-cyan-400'}>{meta.activeDeck.length}</span>/40
                </div>
            </div>

            <div className="flex md:hidden border-b border-slate-800 bg-black shrink-0">
                <button 
                    onClick={() => setActiveTab('trunk')} 
                    className={`flex-1 py-3 font-black uppercase tracking-widest text-xs transition-colors ${activeTab === 'trunk' ? 'bg-slate-900 text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
                >
                    Trunk Database
                </button>
                <button 
                    onClick={() => setActiveTab('deck')} 
                    className={`flex-1 py-3 font-black uppercase tracking-widest text-xs transition-colors ${activeTab === 'deck' ? 'bg-slate-900 text-purple-400 border-b-2 border-purple-400' : 'text-slate-500'}`}
                >
                    Active Deck
                </button>
            </div>

            <div className="flex flex-grow overflow-hidden flex-col md:flex-row">
                <div className="hidden md:flex w-80 shrink-0 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black border-r border-slate-800 p-6 flex-col items-center">
                    {hoveredCardId ? (
                        <>
                            <div className="animate-pulse shadow-[0_0_30px_rgba(0,255,255,0.2)] rounded-lg">
                                <Card cardId={hoveredCardId} scale={1.5} level={getCardLevel(hoveredCardId)} overrideValue={getCardValue(CARD_DB[hoveredCardId], getCardLevel(hoveredCardId))} />
                            </div>
                            <div className="mt-8 w-full border-t border-cyan-900/50 pt-4">
                                <h3 className="text-xl font-black text-cyan-400 uppercase tracking-widest text-center">{CARD_DB[hoveredCardId].name}</h3>
                                <div className="flex justify-between items-center mt-2 px-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                                    <span>Type: {CARD_DB[hoveredCardId].isHeal ? 'Heal' : CARD_DB[hoveredCardId].type}</span>
                                    <span className="text-yellow-400">Cost: ★{CARD_DB[hoveredCardId].cost}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-slate-700 opacity-50">
                            <BookOpen size={48} className="mb-4" />
                            <span className="font-black uppercase tracking-[0.2em] text-xs text-center">Hover to view parameters</span>
                        </div>
                    )}
                </div>

                <div className={`flex-1 h-full border-r border-slate-800 bg-slate-900/50 flex-col ${activeTab === 'trunk' ? 'flex' : 'hidden md:flex'}`}>
                    <div className="p-2 bg-black flex justify-between items-center border-b border-slate-800">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 pl-2">Trunk (Tap to Add)</span>
                        <div className="flex gap-1 pr-2">
                            <SortBtn value="cost" label="Cost" />
                            <SortBtn value="name" label="Name" />
                            <SortBtn value="type" label="Type" />
                            <SortBtn value="pwr" label="Pwr" />
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4 flex flex-wrap gap-4 sm:gap-6 content-start justify-center">
                        {sortedInventory.map(item => item.total > 0 && (
                            <div 
                                key={item.id} 
                                className="relative group cursor-pointer w-[4.8rem] h-[7.2rem] sm:w-[5.6rem] sm:h-[8.4rem] m-1 sm:m-2" 
                                onClick={() => addCard(item.id)}
                                onMouseEnter={() => setHoveredCardId(item.id)}
                                onMouseLeave={() => setHoveredCardId(null)}
                            >
                                {item.available > 1 && <div className="absolute top-1 left-1 w-full h-full bg-[#1a110a] border border-cyan-800/50 rounded shadow-md z-0" />}
                                {item.available > 2 && <div className="absolute top-2 left-2 w-full h-full bg-[#1a110a] border border-cyan-800/50 rounded shadow-md z-0" />}
                                
                                <div className="absolute inset-0 z-10 transition-transform md:group-hover:-translate-y-2 md:group-hover:scale-105 duration-200">
                                    <Card cardId={item.id} scale={0.6} level={getCardLevel(item.id)} overrideValue={getCardValue(CARD_DB[item.id], getCardLevel(item.id))} />
                                    {item.available > 0 && (
                                        <div className="absolute inset-0 bg-cyan-500/20 opacity-0 md:group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                            <Plus size={24} className="text-white drop-shadow-md sm:w-8 sm:h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-black/90 px-1.5 sm:px-2 py-0.5 rounded-full text-xs sm:text-sm font-black text-cyan-400 border border-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.5)] z-20">
                                    x{item.available}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`flex-1 h-full bg-black flex-col ${activeTab === 'deck' ? 'flex' : 'hidden md:flex'}`}>
                    <div className="p-2 bg-slate-900 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">Active Deck (Tap to Remove)</div>
                    <div className="flex-grow overflow-y-auto p-4 flex flex-wrap gap-2 sm:gap-4 content-start justify-center">
                        {meta.activeDeck.map((id, idx) => {
                            const isNew = idx >= meta.activeDeck.length - recentAdds.length;
                            return (
                                <div 
                                    key={idx} 
                                    className="relative group cursor-pointer w-[4.8rem] h-[7.2rem] sm:w-[5.6rem] sm:h-[8.4rem]" 
                                    onClick={() => removeCard(idx)}
                                    onMouseEnter={() => setHoveredCardId(id)}
                                    onMouseLeave={() => setHoveredCardId(null)}
                                >
                                    <div className="absolute inset-0 z-10 transition-transform md:group-hover:-translate-y-2 md:group-hover:scale-105 duration-200">
                                        <Card cardId={id} scale={0.6} level={getCardLevel(id)} overrideValue={getCardValue(CARD_DB[id], getCardLevel(id))} isAnimNew={isNew} />
                                        <div className="absolute inset-0 bg-red-500/20 opacity-0 md:group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                            <Minus size={24} className="text-white drop-shadow-md sm:w-8 sm:h-8" />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderCodex = () => {
      const allCardKeys = Object.keys(CARD_DB);
      const activeDisplayId = lockedCardId || hoveredCardId;
      
      return (
        <div className="flex flex-col h-full bg-slate-950 text-white relative overflow-hidden font-tech" onClick={() => setLockedCardId(null)}>
            <div className="h-16 shrink-0 border-b border-cyan-800/50 bg-black flex justify-between items-center px-4 sm:px-6">
                <button onClick={() => setView('menu')} className="flex items-center gap-2 text-cyan-400 hover:text-white uppercase font-black text-xs sm:text-sm tracking-widest">
                    <ArrowLeft size={16} /> Hub
                </button>
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-widest text-emerald-500">Database Codex</h2>
                <div className="text-slate-400 font-black text-xs sm:text-sm">
                    Collect: <span className="text-cyan-400">{Object.keys(meta.collection).length}</span>/{allCardKeys.length}
                </div>
            </div>

            <div className="flex md:hidden border-b border-slate-800 bg-black shrink-0">
                <button 
                    onClick={() => setActiveTab('trunk')} 
                    className={`flex-1 py-3 font-black uppercase tracking-widest text-xs transition-colors ${activeTab === 'trunk' ? 'bg-slate-900 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500'}`}
                >
                    Global Database
                </button>
                <button 
                    onClick={() => setActiveTab('deck')} 
                    className={`flex-1 py-3 font-black uppercase tracking-widest text-xs transition-colors ${activeTab === 'deck' ? 'bg-slate-900 text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
                >
                    Selected View
                </button>
            </div>

            <div className="flex flex-grow overflow-hidden flex-col md:flex-row">
                <div className={`w-full md:w-80 shrink-0 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black border-r border-slate-800 p-6 flex-col items-center overflow-y-auto ${activeTab === 'deck' ? 'flex' : 'hidden md:flex'}`}>
                    {activeDisplayId ? (() => {
                        const lvl = getCardLevel(activeDisplayId);
                        const totalOwned = meta.collection[activeDisplayId] || 0;
                        const inDeckCount = meta.activeDeck.filter(c => c === activeDisplayId).length;
                        const available = totalOwned - inDeckCount;
                        
                        const isMax = lvl >= 4;
                        const cost = isMax ? 0 : UPGRADE_COSTS[lvl - 1];
                        const canUpgrade = !isMax && available >= cost;

                        return (
                        <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center w-full relative">
                            <div className="relative inline-flex rounded-lg z-10">
                                {upgradeAnimId === activeDisplayId && (
                                    <div className="absolute inset-0 pointer-events-none z-50">
                                        <div className="absolute -inset-6 bg-emerald-500/30 rounded-[1.5rem] blur-3xl animate-[upgrade-burst_1.2s_ease-out_forwards]" />
                                        <div className="absolute -inset-2 border-4 border-emerald-400 rounded-lg animate-[upgrade-ring_0.8s_ease-out_forwards]" />
                                        <div className="absolute -inset-2 border-4 border-cyan-300 rounded-lg animate-[upgrade-ring_0.8s_ease-out_forwards]" style={{animationDelay:'0.15s'}} />
                                        <div className="absolute -inset-2 rounded-lg overflow-hidden">
                                            <div className="absolute inset-0 w-[60px] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[upgrade-shine_0.6s_ease-in-out_forwards]" style={{animationDelay:'0.2s'}} />
                                        </div>
                                        {[...Array(8)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-[upgrade-burst_0.8s_ease-out_forwards]"
                                                style={{animationDelay:`${i*0.08}s`, left:`${18+Math.random()*64}%`, top:`${10+Math.random()*78}%`}}
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="animate-pulse shadow-[0_0_30px_rgba(0,255,255,0.2)] rounded-lg">
                                    <Card cardId={activeDisplayId} scale={1.5} level={lvl} overrideValue={getCardValue(CARD_DB[activeDisplayId], lvl)} />
                                </div>
                            </div>
                            <div className="mt-6 w-full border-t border-cyan-900/50 pt-4 flex flex-col items-center z-10">
                                <h3 className="text-xl font-black text-cyan-400 uppercase tracking-widest text-center">{CARD_DB[activeDisplayId].name}</h3>
                                <div className="mt-4 w-full bg-black/60 p-4 rounded border border-slate-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs uppercase text-slate-400 font-bold tracking-widest">Data Level</span>
                                        <span className="text-lg font-black text-blue-400">Lv.{lvl} {isMax && '(MAX)'}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs uppercase text-slate-400 font-bold tracking-widest">Base Pwr</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-black text-white">{getCardValue(CARD_DB[activeDisplayId], lvl)}</span>
                                            {!isMax && (
                                                <>
                                                    <ChevronsUp size={14} className="text-green-500" />
                                                    <span className="text-lg font-black text-green-500">{getCardValue(CARD_DB[activeDisplayId], lvl + 1)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-slate-800 pt-2 mt-2">
                                        <span className="text-xs uppercase text-slate-400 font-bold tracking-widest">Available Stock</span>
                                        <span className="text-lg font-black text-cyan-400">x{available} <span className="text-xs text-slate-600 font-normal">({inDeckCount} in deck)</span></span>
                                    </div>
                                </div>
                                
                                {!isMax && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); upgradeCard(activeDisplayId); }}
                                        disabled={!canUpgrade}
                                        className={`mt-4 w-full py-3 font-black uppercase tracking-widest rounded transition-all border flex items-center justify-center gap-2
                                            ${canUpgrade ? 'bg-green-900/40 text-green-400 border-green-500 hover:bg-green-600 hover:text-white hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]' : 'bg-black text-slate-600 border-slate-800 cursor-not-allowed'}
                                        `}
                                    >
                                        <ArrowUpCircle size={18} /> Upgrade ({cost} Available)
                                    </button>
                                )}
                            </div>
                        </div>
                    )})() : (
                        <div className="flex-grow flex flex-col items-center justify-center text-slate-700 opacity-50 h-full">
                            <Library size={48} className="mb-4" />
                            <span className="font-black uppercase tracking-[0.2em] text-xs text-center">Tap a card in Database</span>
                        </div>
                    )}
                </div>

                <div className={`flex-1 h-full bg-black flex-col ${activeTab === 'trunk' ? 'flex' : 'hidden md:flex'}`}>
                    <div className="p-2 bg-slate-900 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">Global Database (Tap to Lock)</div>
                    <div className="flex-grow overflow-y-auto p-4 flex flex-wrap gap-4 sm:gap-6 content-start justify-center">
                        {allCardKeys.map(id => {
                            const totalOwned = meta.collection[id] || 0;
                            const inDeckCount = meta.activeDeck.filter(c => c === id).length;
                            const available = totalOwned - inDeckCount;
                            
                            const isOwned = totalOwned > 0;
                            const lvl = getCardLevel(id);
                            const isMax = lvl >= 4;
                            const cost = isMax ? 0 : UPGRADE_COSTS[lvl - 1];
                            const canUpgrade = !isMax && available >= cost;
                            const isLocked = lockedCardId === id;
                            
                            const upgradeClass = canUpgrade ? 'ring-2 sm:ring-4 ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]' : '';
                            const lockedClass = isLocked ? 'ring-2 sm:ring-4 ring-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.6)] scale-105' : '';

                            return (
                                <div 
                                    key={id} 
                                    className={`relative group cursor-pointer w-[4.8rem] h-[7.2rem] sm:w-[5.6rem] sm:h-[8.4rem] m-1 sm:m-2 transition-all duration-300 rounded ${isOwned ? '' : 'opacity-30 grayscale'} ${upgradeClass} ${lockedClass}`} 
                                    onMouseEnter={() => setHoveredCardId(id)}
                                    onMouseLeave={() => setHoveredCardId(null)}
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setLockedCardId(id); 
                                        if(window.innerWidth < 768) setActiveTab('deck');
                                    }}
                                >
                                    <div className="absolute inset-0 z-10 transition-transform md:group-hover:-translate-y-2 md:group-hover:scale-105 duration-200">
                                        <Card cardId={id} scale={0.6} level={lvl} overrideValue={getCardValue(CARD_DB[id], lvl)} />
                                    </div>
                                    
                                    {canUpgrade && (
                                        <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 bg-green-500 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-[10px] font-black text-black z-30 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-bounce flex items-center gap-0.5 sm:gap-1 border border-green-200 pointer-events-none">
                                            <ArrowUpCircle size={10} className="sm:w-3 sm:h-3" /> UPGRADE
                                        </div>
                                    )}

                                    {available > 0 && (
                                        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-black/90 px-1.5 sm:px-2 py-0.5 rounded-full text-xs sm:text-sm font-black text-cyan-400 border border-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.5)] z-20 pointer-events-none">
                                            x{available}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
      );
  };

  const renderGacha = () => {
      if (pulledCards.length > 0) {
          const packCount = Math.ceil(pulledCards.length / PACK_SIZE);
          const packs = [];
          for (let p = 0; p < packCount; p++) {
              packs.push(pulledCards.slice(p * PACK_SIZE, p * PACK_SIZE + PACK_SIZE));
          }

          return (
              <div className="flex flex-col items-center justify-start h-full bg-black text-white p-4 sm:p-6 relative overflow-y-auto overflow-x-hidden pb-24 font-tech">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.2),transparent_70%)] pointer-events-none" />
                  
                  {/* Legendary screen flash */}
                  {pulledCards.some(c => c.cost >= 4) && (
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 via-yellow-500/20 to-transparent animate-[legendary-flash_1.5s_ease-out_forwards] pointer-events-none z-20" />
                  )}

                  <div className="z-10 text-center mb-6 sm:mb-10 mt-8 sm:mt-12">
                      <h2 className="text-3xl sm:text-5xl font-black text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] animate-pulse">
                          {packCount > 1 ? `${packCount}x Packs Extracted` : 'Pack Extracted'}
                      </h2>
                      <p className="mt-3 text-xs sm:text-sm uppercase tracking-[0.35em] text-slate-500">
                          {lastOpenedBanner.name}
                      </p>
                  </div>
                  
                  <div className="flex flex-col gap-6 sm:gap-8 z-10 w-full items-center mb-12">
                      {packs.map((pack, packIdx) => (
                          <div key={packIdx} className="w-full max-w-4xl">
                              {packCount > 1 && (
                                  <div className="text-center mb-2">
                                      <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Pack {packIdx + 1}</span>
                                      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mt-1" />
                                  </div>
                              )}
                              <div className="flex justify-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
                                  {pack.map((card, idx) => {
                                      const globalIdx = packIdx * 5 + idx;
                                      const isRare = card.cost >= 2 && card.cost <= 3;
                                      const isLegendary = card.cost >= 4;
                                      const revealClass = isLegendary 
                                          ? 'opacity-0 animate-[legendary-reveal_1s_ease-out_both]' 
                                          : isRare 
                                              ? 'opacity-0 animate-[rare-reveal_0.8s_ease-out_both]' 
                                              : 'opacity-0 animate-[slideUp_0.5s_ease-out_both]';
                                      
                                      return (
                                          <div key={globalIdx} className="relative flex flex-col items-center">
                                              {isLegendary && (
                                                  <div 
                                                      className="absolute inset-0 border-2 border-purple-400 rounded-lg animate-[legendary-ring_1s_ease-out_forwards] pointer-events-none z-20 opacity-0" 
                                                      style={{ animationDelay: `${globalIdx * 0.12}s`, animationFillMode: 'both' }} 
                                                  />
                                              )}
                                              <div 
                                                  className={`transform origin-center relative z-10 ${revealClass}`} 
                                                  style={{ animationDelay: `${globalIdx * 0.12}s` }}
                                              >
                                                  <Card cardId={card.id} scale={packCount > 1 ? 0.9 : 1.1} level={getCardLevel(card.id)} overrideValue={getCardValue(card, getCardLevel(card.id))} />
                                              </div>
                                              {(isRare || isLegendary) && (
                                                  <span className={`text-[10px] font-black uppercase tracking-widest mt-1 opacity-0 animate-[slideUp_0.3s_ease-out_both] ${isLegendary ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.6)]'}`} style={{ animationDelay: `${globalIdx * 0.12 + 0.5}s` }}>
                                                      {isLegendary ? '★ LEGENDARY' : '◆ RARE'}
                                                  </span>
                                              )}
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      ))}
                  </div>

                  <button 
                      onClick={() => setPulledCards([])}
                      className="px-8 sm:px-12 py-4 bg-cyan-900/80 text-cyan-400 font-black uppercase tracking-widest border-2 border-cyan-500 rounded hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_30px_rgba(0,255,255,0.5)] z-10 text-sm sm:text-base"
                  >
                      Add to Trunk
                  </button>
              </div>
          );
      }

      return (
          <div className="flex flex-col h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-900 via-black to-black text-white p-4 sm:p-8 relative font-tech overflow-y-auto">
              {previewBanner && (
                  <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="relative w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-sm border border-cyan-700/60 bg-slate-950 shadow-[0_0_45px_rgba(0,255,255,0.18)]">
                          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-black/60">
                              <div>
                                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-cyan-300">{previewBanner.name} Pool</h3>
                                  <p className="text-xs sm:text-sm text-slate-400 mt-1">{previewBanner.description}</p>
                              </div>
                              <button
                                  onClick={() => setPreviewBannerId(null)}
                                  className="px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-widest border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition-colors"
                              >
                                  Close
                              </button>
                          </div>
                          <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(85vh-5rem)]">
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                                  {previewBanner.pool.map((cardId) => {
                                      const card = CARD_DB[cardId];
                                      if (!card) return null;
                                      const owned = meta.collection[cardId] || 0;
                                      return (
                                          <div key={`${previewBanner.id}-${cardId}`} className="flex flex-col items-center bg-black/30 border border-slate-800 p-3 rounded-sm">
                                              <Card cardId={cardId} scale={0.72} level={getCardLevel(cardId)} overrideValue={getCardValue(card, getCardLevel(cardId))} />
                                              <div className="mt-3 text-center">
                                                  <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Owned</div>
                                                  <div className="text-lg font-black text-cyan-300">{owned}</div>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      </div>
                  </div>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 relative z-20 gap-4">
                  <button onClick={() => setView('menu')} className="w-full sm:w-auto flex items-center justify-center gap-2 text-amber-400 hover:text-white uppercase font-black text-xs sm:text-sm tracking-widest bg-black/50 px-4 py-3 rounded border border-amber-900">
                      <ArrowLeft size={16} /> Return to Hub
                  </button>
                  <div className="flex gap-4 w-full sm:w-auto justify-center">
                      <div className="flex items-center gap-2 bg-black/60 border border-purple-900/50 px-3 sm:px-4 py-2 rounded-sm shadow-md">
                          <Layers className="text-purple-400" size={16} />
                          <span className="text-base sm:text-lg font-black">{meta.fragments}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/60 border border-blue-900/50 px-3 sm:px-4 py-2 rounded-sm shadow-md">
                          <Package className="text-blue-400" size={16} />
                          <span className="text-base sm:text-lg font-black">{meta.packs}</span>
                      </div>
                  </div>
              </div>

              <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 z-10 pb-12">
                  {(() => {
                      const accentKey = activeGachaTab.kind === 'banner' ? activeBanner.accent : 'violet';
                      const AccentIcon = activeGachaTab.kind === 'banner' ? activeBanner.icon : Layers;
                      const accentClasses = accentKey === 'emerald'
                          ? {
                              border: 'border-emerald-700/60',
                              glow: 'shadow-[0_0_45px_rgba(16,185,129,0.18)]',
                              title: 'text-emerald-200',
                              icon: 'text-emerald-400',
                              chip: 'bg-emerald-500 text-black',
                              button: 'bg-emerald-100 text-black border-emerald-200 hover:bg-white hover:shadow-[0_0_22px_rgba(16,185,129,0.45)]',
                              buttonAlt: 'bg-black/55 border-emerald-700/70 text-emerald-200 hover:border-emerald-300 hover:text-white',
                              rail: 'from-emerald-500/30 via-emerald-400/10 to-transparent',
                              haze: 'bg-[radial-gradient(circle_at_72%_35%,rgba(16,185,129,0.35),transparent_36%)]',
                              panel: 'from-emerald-50 via-white to-slate-200',
                            }
                          : accentKey === 'amber'
                          ? {
                              border: 'border-amber-700/60',
                              glow: 'shadow-[0_0_45px_rgba(245,158,11,0.18)]',
                              title: 'text-amber-100',
                              icon: 'text-amber-400',
                              chip: 'bg-amber-400 text-black',
                              button: 'bg-amber-100 text-black border-amber-200 hover:bg-white hover:shadow-[0_0_22px_rgba(245,158,11,0.45)]',
                              buttonAlt: 'bg-black/55 border-amber-700/70 text-amber-200 hover:border-amber-300 hover:text-white',
                              rail: 'from-amber-500/30 via-amber-400/10 to-transparent',
                              haze: 'bg-[radial-gradient(circle_at_72%_35%,rgba(245,158,11,0.35),transparent_36%)]',
                              panel: 'from-amber-50 via-white to-slate-200',
                            }
                          : accentKey === 'violet'
                          ? {
                              border: 'border-violet-700/60',
                              glow: 'shadow-[0_0_45px_rgba(168,85,247,0.18)]',
                              title: 'text-violet-100',
                              icon: 'text-violet-400',
                              chip: 'bg-violet-400 text-black',
                              button: 'bg-violet-100 text-black border-violet-200 hover:bg-white hover:shadow-[0_0_22px_rgba(168,85,247,0.45)]',
                              buttonAlt: 'bg-black/55 border-violet-700/70 text-violet-200 hover:border-violet-300 hover:text-white',
                              rail: 'from-violet-500/30 via-violet-400/10 to-transparent',
                              haze: 'bg-[radial-gradient(circle_at_72%_35%,rgba(168,85,247,0.35),transparent_36%)]',
                              panel: 'from-violet-50 via-white to-slate-200',
                            }
                          : {
                              border: 'border-cyan-700/60',
                              glow: 'shadow-[0_0_45px_rgba(34,211,238,0.18)]',
                              title: 'text-cyan-100',
                              icon: 'text-cyan-400',
                              chip: 'bg-cyan-400 text-black',
                              button: 'bg-cyan-100 text-black border-cyan-200 hover:bg-white hover:shadow-[0_0_22px_rgba(34,211,238,0.45)]',
                              buttonAlt: 'bg-black/55 border-cyan-700/70 text-cyan-200 hover:border-cyan-300 hover:text-white',
                              rail: 'from-cyan-500/30 via-cyan-400/10 to-transparent',
                              haze: 'bg-[radial-gradient(circle_at_72%_35%,rgba(34,211,238,0.35),transparent_36%)]',
                              panel: 'from-cyan-50 via-white to-slate-200',
                            };

                      const featuredCards = activeBanner ? activeBanner.featuredCards : ['m3', 'u3', 'a7'];

                      return (
                          <div className={`relative overflow-hidden rounded-[1.75rem] border bg-slate-950/80 backdrop-blur-md h-[44rem] ${accentClasses.border} ${accentClasses.glow}`}>
                              <div className={`absolute inset-0 ${accentClasses.haze}`} />
                              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.03),transparent_35%,rgba(255,255,255,0.04)_62%,transparent_78%)]" />
                              <div className="relative flex flex-col lg:flex-row h-full">
                                  <div className="lg:w-[6.5rem] shrink-0 border-b lg:border-b-0 lg:border-r border-white/8 bg-black/35">
                                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${accentClasses.rail} hidden lg:block`} />
                                      <div className="flex lg:flex-col gap-2 p-3 sm:p-4 overflow-x-auto lg:overflow-visible">
                                          {visibleGachaTabs.map((tab) => {
                                              const isActive = tab.id === activeGachaTabId;
                                              const RailIcon = tab.icon;
                                              return (
                                                  <button
                                                      key={tab.id}
                                                      onClick={() => setActiveGachaTabId(tab.id)}
                                                      className={`relative min-w-[5.5rem] lg:min-w-0 lg:w-full h-20 lg:h-24 rounded-2xl border transition-all overflow-hidden group ${isActive ? 'border-white/70 bg-white/12 shadow-[0_0_24px_rgba(255,255,255,0.14)] scale-[1.02]' : 'border-white/10 bg-black/35 hover:border-white/30 hover:bg-white/6'}`}
                                                  >
                                                      <div className={`absolute inset-0 ${isActive ? 'bg-[linear-gradient(145deg,rgba(255,255,255,0.18),transparent_60%)]' : 'bg-[linear-gradient(145deg,rgba(255,255,255,0.06),transparent_60%)]'}`} />
                                                      <div className="relative h-full flex flex-col items-center justify-center gap-2 px-2">
                                                          <RailIcon size={22} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`} />
                                                          <span className={`text-[9px] sm:text-[10px] leading-tight font-black uppercase tracking-[0.18em] text-center ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                                              {tab.name.replace(' Pack', '')}
                                                          </span>
                                                      </div>
                                                  </button>
                                              );
                                          })}
                                      </div>
                                  </div>

                                  <div className="flex-1 grid lg:grid-cols-[20rem_minmax(0,1fr)]">
                                      <div className={`relative bg-gradient-to-b ${accentClasses.panel} text-slate-950 p-5 sm:p-7 lg:p-8 h-full`}>
                                          <div className="absolute inset-y-0 right-0 w-px bg-black/10" />
                                          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${accentClasses.chip}`}>
                                              <AccentIcon size={14} />
                                              {activeGachaTab.kind === 'banner' ? 'Featured Warp' : 'Conversion Node'}
                                          </div>
                                          <h3 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight leading-none">{
                                              activeGachaTab.kind === 'banner' ? activeBanner.name : activeGachaTab.name
                                          }</h3>
                                          <p className="mt-5 text-sm sm:text-base text-slate-600 font-read leading-relaxed">
                                              {activeGachaTab.kind === 'banner'
                                                ? activeBanner.description
                                                : 'Refine 10 Fragments into 1 Data Pack. Future upgrades can route this node into banner-specific synthesis and direct fragment purchases.'}
                                          </p>
                                          <div className="mt-5 text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                                              {activeGachaTab.kind === 'banner'
                                                ? 'Every 10 pulls guarantees a higher-rarity card.'
                                                : 'Current conversion rate: 10 Fragments -> 1 Data Pack.'}
                                          </div>

                                          <div className="mt-8 flex flex-wrap gap-3">
                                              {activeGachaTab.kind === 'banner' ? (
                                                  <button
                                                      onClick={() => setPreviewBannerId(activeBanner.id)}
                                                      className="px-5 py-3 rounded-full border border-black/10 bg-white/70 text-slate-900 text-xs sm:text-sm font-black uppercase tracking-[0.18em] hover:bg-white transition-colors"
                                                  >
                                                      View Pool
                                                  </button>
                                              ) : null}
                                          </div>
                                      </div>

                                      <div className="relative p-5 sm:p-7 lg:p-8 flex flex-col justify-between h-full min-h-0">
                                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_28%,rgba(255,255,255,0.03)_100%)]" />
                                          <div className="relative flex-1 flex items-center justify-center">
                                              <div className="absolute inset-x-[8%] bottom-[8%] h-16 rounded-[999px] bg-white/8 blur-2xl" />
                                              <div className={`absolute left-[16%] top-[14%] text-[11rem] sm:text-[14rem] font-black leading-none opacity-[0.06] ${accentClasses.title}`}>
                                                  01
                                              </div>
                                              <div className="relative z-10 flex flex-col items-center justify-center">
                                                  <div className={`absolute inset-0 blur-3xl opacity-60 ${accentKey === 'emerald' ? 'bg-emerald-400/20' : accentKey === 'amber' ? 'bg-amber-400/20' : accentKey === 'violet' ? 'bg-violet-400/20' : 'bg-cyan-400/20'}`} />
                                                  {activeGachaTab.kind === 'banner' ? (
                                                      <div className="relative flex gap-2 sm:gap-4 items-end justify-center">
                                                          {featuredCards.map((cardId, idx) => (
                                                              (() => {
                                                                  const isSelected = selectedFeaturedCardId
                                                                      ? selectedFeaturedCardId === cardId
                                                                      : idx === 1;
                                                                  const isHovered = hoveredFeaturedCardId === cardId;
                                                                  const tiltClass = isHovered
                                                                      ? idx === 0
                                                                          ? '-rotate-[8deg]'
                                                                          : idx === 2
                                                                            ? 'rotate-[8deg]'
                                                                            : '-rotate-[3deg]'
                                                                      : idx === 0
                                                                        ? '-rotate-[4deg]'
                                                                        : idx === 2
                                                                          ? 'rotate-[4deg]'
                                                                          : 'rotate-0';
                                                                  const elevateClass = isSelected
                                                                      ? 'scale-[1.08] sm:scale-[1.18] z-30 -translate-y-3 sm:-translate-y-5'
                                                                      : idx === 1
                                                                        ? 'scale-[0.92] sm:scale-[1.02] z-20'
                                                                        : idx === 0
                                                                          ? 'translate-x-3 sm:translate-x-6 scale-[0.78] sm:scale-[0.86] z-10'
                                                                          : '-translate-x-3 sm:-translate-x-6 scale-[0.78] sm:scale-[0.86] z-10';
                                                                  return (
                                                              <div
                                                                  key={`${activeGachaTab.id}-hero-${cardId}`}
                                                                  onClick={() => setSelectedFeaturedCardId((current) => current === cardId ? null : cardId)}
                                                                  onMouseEnter={() => setHoveredFeaturedCardId(cardId)}
                                                                  onMouseLeave={() => setHoveredFeaturedCardId(null)}
                                                                  className={`origin-bottom transition-transform duration-300 cursor-pointer ${elevateClass} ${tiltClass}`}
                                                              >
                                                                  <div className="transition-transform duration-300 [perspective:1200px]">
                                                                      <div className={`transition-transform duration-300 ${isHovered ? '[transform:rotateX(10deg)]' : ''}`}>
                                                                          <Card cardId={cardId} level={getCardLevel(cardId)} overrideValue={getCardValue(CARD_DB[cardId], getCardLevel(cardId))} scale={isSelected ? 1.16 : idx === 1 ? 1.05 : 0.92} />
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                                  );
                                                              })()
                                                          ))}
                                                      </div>
                                                  ) : (
                                                      <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-black/30 backdrop-blur-sm p-8 sm:p-10">
                                                          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),transparent_55%)] rounded-[2rem]" />
                                                          <div className="relative flex flex-col items-center text-center">
                                                              <Layers size={72} className="text-violet-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
                                                              <div className="mt-6 text-sm uppercase tracking-[0.35em] text-violet-200/70">Fragment Refinery</div>
                                                              <div className="mt-4 text-5xl sm:text-6xl font-black text-white">{Math.floor(meta.fragments / 10)}</div>
                                                              <div className="mt-2 text-xs sm:text-sm uppercase tracking-[0.24em] text-slate-400">Packs ready to synthesize</div>
                                                              <div className="mt-8 w-full flex items-center justify-center gap-3 text-sm sm:text-base font-black">
                                                                  <div className="px-4 py-3 rounded-full bg-violet-100 text-black min-w-[6rem]">{meta.fragments} Frags</div>
                                                                  <ChevronRight size={20} className="text-violet-200" />
                                                                  <div className="px-4 py-3 rounded-full bg-white text-black min-w-[6rem]">{Math.floor(meta.fragments / 10)} Packs</div>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  )}
                                              </div>
                                          </div>

                                          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                              <div className="text-xs sm:text-sm uppercase tracking-[0.24em] text-slate-500">
                                                  {activeGachaTab.kind === 'banner' ? `${meta.packs} pulls available` : `${meta.fragments} fragments available`}
                                              </div>
                                              <div className="flex items-center gap-3">
                                                  {activeGachaTab.kind === 'banner' ? (
                                                      <>
                                                          <button
                                                              onClick={() => openPack(activeBanner.id, 1)}
                                                              disabled={meta.packs < 1}
                                                              className={`px-5 sm:px-6 py-3 rounded-full border text-sm font-black uppercase tracking-[0.16em] transition-all ${meta.packs >= 1 ? accentClasses.button : 'bg-black/40 text-slate-600 border-slate-800 cursor-not-allowed'}`}
                                                          >
                                                              Pull x1
                                                          </button>
                                                          {hasFeature('pull_5') && (
                                                              <button
                                                                  onClick={() => openPack(activeBanner.id, 5)}
                                                                  disabled={meta.packs < 5}
                                                                  className={`px-5 sm:px-6 py-3 rounded-full border text-sm font-black uppercase tracking-[0.16em] transition-all ${meta.packs >= 5 ? accentClasses.button : 'bg-black/40 text-slate-600 border-slate-800 cursor-not-allowed'}`}
                                                              >
                                                                  Pull x5
                                                              </button>
                                                          )}
                                                          {hasFeature('pull_10') && (
                                                              <button
                                                                  onClick={() => openPack(activeBanner.id, 10)}
                                                                  disabled={meta.packs < 10}
                                                                  className={`px-5 sm:px-6 py-3 rounded-full border text-sm font-black uppercase tracking-[0.16em] transition-all ${meta.packs >= 10 ? accentClasses.button : 'bg-black/40 text-slate-600 border-slate-800 cursor-not-allowed'}`}
                                                              >
                                                                  Pull x10
                                                              </button>
                                                          )}
                                                      </>
                                                  ) : (
                                                      <button
                                                          onClick={convertFragments}
                                                          disabled={meta.fragments < 10}
                                                          className={`px-5 sm:px-6 py-3 rounded-full border text-sm font-black uppercase tracking-[0.16em] transition-all ${meta.fragments >= 10 ? accentClasses.button : 'bg-black/40 text-slate-600 border-slate-800 cursor-not-allowed'}`}
                                                      >
                                                          Synthesize Pack
                                                      </button>
                                                  )}
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      );
                  })()}
              </div>
          </div>
      );
  }

  const renderGameOver = () => {
      const dungeon = run.dungeonId ? DUNGEON_MAP[run.dungeonId] : null;
      const topCards = Object.entries(run.cardDamage || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
      const maxDmg = topCards.length > 0 ? topCards[0][1] : 1;
      const didCompleteDungeon = run.status === 'victory';
      const unlockLines = didCompleteDungeon && dungeon ? [
          ...(dungeon.unlocks?.stages || []).map((stageId) => STAGE_DEFS[stageId] ? `${STAGE_DEFS[stageId].name}` : `Stage ${stageId}`),
      ] : [];

      return (
          <div className="flex flex-col items-center justify-start h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-red-950/30 to-black text-white p-4 sm:p-8 relative overflow-y-auto font-tech">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center w-full max-w-lg mt-8">
                  {/* Title */}
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-400 via-red-500 to-red-800 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)] mb-2">
                      {didCompleteDungeon ? 'DUNGEON CLEARED' : 'RUN OVER'}
                  </h1>
                  <p className="text-red-400/60 tracking-[0.35em] text-[10px] uppercase font-bold mb-8">
                      {didCompleteDungeon ? `${dungeon?.name || 'Route'} complete` : 'Connection lost'}
                  </p>

                  {/* Progress */}
                  <div className="w-full bg-black/60 border border-slate-800 rounded-sm p-4 sm:p-6 mb-4">
                      <h3 className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-4">Progress</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                          <div><div className="text-xl sm:text-2xl font-black text-cyan-400">{dungeon ? dungeon.name : `Node ${run.nodeIndex}`}</div><div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Route</div></div>
                          <div><div className="text-2xl sm:text-3xl font-black text-red-400">{run.kills}</div><div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Kills</div></div>
                          <div><div className="text-2xl sm:text-3xl font-black text-white">{run.nodeIndex}</div><div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Nodes</div></div>
                      </div>
                  </div>

                  {unlockLines.length > 0 && (
                      <div className="w-full bg-black/60 border border-cyan-900/70 rounded-sm p-4 sm:p-6 mb-4">
                          <h3 className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-4">Clear Reward</h3>
                          <div className="flex flex-wrap gap-2">
                              {unlockLines.map((line) => (
                                  <div key={line} className="px-3 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs uppercase tracking-[0.18em] font-black">
                                      {line}
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Resources */}
                  <div className="w-full bg-black/60 border border-slate-800 rounded-sm p-4 sm:p-6 mb-4">
                      <h3 className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-4">Resources Acquired</h3>
                      <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2"><Coins size={18} className="text-yellow-400" /><span className="text-sm font-bold text-slate-300">GP</span></div>
                              <span className="text-xl font-black text-yellow-400">+{run.gpEarned}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2"><Layers size={18} className="text-purple-400" /><span className="text-sm font-bold text-slate-300">Fragments</span></div>
                              <span className="text-xl font-black text-purple-400">+{run.fragsEarned}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2"><Package size={18} className="text-blue-400" /><span className="text-sm font-bold text-slate-300">Packs</span></div>
                              <span className="text-xl font-black text-blue-400">+{run.packsEarned}</span>
                          </div>
                      </div>
                  </div>

                  {/* Top 3 Damage Cards */}
                  {topCards.length > 0 && (
                      <div className="w-full bg-black/60 border border-slate-800 rounded-sm p-4 sm:p-6 mb-6">
                          <h3 className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-4">Top Damage Cards</h3>
                          <div className="flex flex-col gap-3">
                              {topCards.map(([cardId, dmg], i) => {
                                  const card = CARD_DB[cardId];
                                  const barWidth = Math.max(10, (dmg / maxDmg) * 100);
                                  const colors = ['from-cyan-500 to-cyan-400', 'from-blue-500 to-blue-400', 'from-slate-500 to-slate-400'];
                                  return (
                                      <div key={cardId} className="flex items-center gap-3">
                                          <span className="text-lg font-black text-slate-600 w-6 text-right">#{i+1}</span>
                                          <div className="flex-grow">
                                              <div className="flex justify-between items-center mb-1">
                                                  <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[150px]">{card ? card.name : cardId}</span>
                                                  <span className="text-xs sm:text-sm font-black text-cyan-400">{dmg} DMG</span>
                                              </div>
                                              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                                  <div className={`h-full bg-gradient-to-r ${colors[i] || colors[2]} rounded-full shadow-[0_0_10px_rgba(0,255,255,0.4)] transition-all duration-1000`} style={{width:`${barWidth}%`}} />
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  )}

                  {/* Return Button */}
                  <button 
                      onClick={() => { setView('menu'); }}
                      className="w-full py-4 bg-cyan-900/60 text-cyan-400 font-black uppercase tracking-widest border-2 border-cyan-600 rounded-sm hover:bg-cyan-600 hover:text-black transition-all shadow-[0_0_30px_rgba(0,255,255,0.3)] text-sm sm:text-base mb-8"
                  >
                      Return to Hub
                  </button>
              </div>
          </div>
      );
  };

  return (
    <div className="w-screen h-[100dvh] bg-black overflow-hidden flex items-center justify-center select-none">
      <div
        className="overflow-hidden bg-black shadow-2xl relative"
        style={{
          width: 'min(100vw, calc(100dvh * 16 / 9))',
          height: 'min(100dvh, calc(100vw * 9 / 16))',
        }}
      >
        {view === 'menu' && renderMenu()}
        {view === 'dungeons' && renderDungeonSelect()}
        {view === 'combat' && renderCombat()}
        {view === 'skills' && renderSkills()}
        {view === 'deck' && renderDeckEditor()}
        {view === 'codex' && renderCodex()}
        {view === 'gacha' && renderGacha()}
        {view === 'gameover' && renderGameOver()}
        <div className="absolute inset-0 pointer-events-none z-[200] overflow-hidden">
        {activeDeathEffect && deathMonsterIconType ? (
          <div
            key={`enemy-death-${activeDeathEffect.id}`}
            className="absolute pointer-events-none"
            style={{
              left: `${activeDeathEffect.rect.left - gameFrameRect.left}px`,
              top: `${activeDeathEffect.rect.top - gameFrameRect.top}px`,
              width: `${activeDeathEffect.rect.width}px`,
              height: `${activeDeathEffect.rect.height}px`,
            }}
          >
            <div className="relative w-full h-full">
              <div className={`absolute left-1/2 top-1/2 w-32 h-32 rounded-full blur-[12px] ${activeDeathEffect.monster.isBoss ? 'bg-red-300/90' : 'bg-cyan-200/95'} animate-[enemy-overload-core_0.28s_cubic-bezier(0.16,0.84,0.24,1)_forwards]`} />
              <div className={`absolute left-1/2 top-1/2 w-44 h-44 rounded-full border-2 ${activeDeathEffect.monster.isBoss ? 'border-red-100/90 shadow-[0_0_42px_rgba(248,113,113,0.82)]' : 'border-cyan-50/95 shadow-[0_0_42px_rgba(34,211,238,0.95)]'} animate-[enemy-overload-ring_0.34s_cubic-bezier(0.12,0.82,0.22,1)_forwards]`} />
              <div className={`absolute left-1/2 top-1/2 w-64 h-64 rounded-full border ${activeDeathEffect.monster.isBoss ? 'border-red-300/65 shadow-[0_0_34px_rgba(248,113,113,0.55)]' : 'border-cyan-200/70 shadow-[0_0_34px_rgba(34,211,238,0.6)]'} animate-[enemy-overload-ring_0.46s_cubic-bezier(0.12,0.82,0.22,1)_forwards]`} style={{ animationDelay: '35ms' }} />
              <div className={`absolute left-1/2 top-1/2 w-80 h-80 rounded-full border ${activeDeathEffect.monster.isBoss ? 'border-red-400/35 shadow-[0_0_28px_rgba(248,113,113,0.35)]' : 'border-cyan-300/40 shadow-[0_0_28px_rgba(34,211,238,0.4)]'} animate-[enemy-overload-ring_0.56s_cubic-bezier(0.12,0.82,0.22,1)_forwards]`} style={{ animationDelay: '70ms' }} />
              <div className={`absolute inset-0 rounded-sm border-2 overflow-hidden animate-[enemy-death_0.34s_cubic-bezier(0.18,0.82,0.24,1)_forwards] ${activeDeathEffect.monster.isBoss ? 'bg-gradient-to-br from-red-950 via-red-950/95 to-black border-red-500 shadow-[0_0_65px_rgba(255,0,0,0.55)]' : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-cyan-400/50 shadow-[0_0_44px_rgba(0,255,255,0.32)]'}`}>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px]" />
                <div className={`absolute inset-0 ${activeDeathEffect.monster.isBoss ? 'bg-red-100/55' : 'bg-cyan-50/60'} mix-blend-screen animate-[enemy-death-flash_0.18s_ease-out_forwards]`} />
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,${activeDeathEffect.monster.isBoss ? 'rgba(248,113,113,0.65)' : 'rgba(34,211,238,0.6)'}_24%,rgba(255,255,255,0)_60%)] animate-[enemy-overload-core_0.24s_cubic-bezier(0.16,0.84,0.24,1)_forwards]`} />
                <div className="absolute inset-x-0 bottom-0 h-[92%] bg-[linear-gradient(180deg,rgba(34,211,238,0)_0%,rgba(34,211,238,0.12)_28%,rgba(255,255,255,0.75)_100%)] animate-[enemy-data-scan_0.24s_ease-out_forwards]" />
                <div className="absolute inset-x-3 bottom-3 top-3 flex items-center justify-center">
                  {React.createElement(deathMonsterIconType, {
                    size: 84,
                    className: `${activeDeathEffect.monster.isBoss ? 'text-red-300' : 'text-cyan-200'} drop-shadow-[0_0_22px_currentColor]`,
                  })}
                </div>
              </div>
              {activeDeathEffect.shards.map((shard) => (
                <div
                  key={`enemy-death-shard-${activeDeathEffect.id}-${shard.id}`}
                  className={`absolute rounded-[2px] border ${activeDeathEffect.monster.isBoss ? 'bg-red-300/95 border-red-50/80 shadow-[0_0_18px_rgba(248,113,113,0.8)]' : 'bg-cyan-100/100 border-white/85 shadow-[0_0_20px_rgba(34,211,238,0.95)]'}`}
                  style={{
                    left: `${shard.left}px`,
                    top: `${shard.top}px`,
                    width: `${shard.size}px`,
                    height: `${Math.max(7, shard.size * 0.82)}px`,
                    '--shard-x': `${shard.driftX}px`,
                    '--shard-y': `${-shard.driftY}px`,
                    '--shard-rot': `${shard.rotate}deg`,
                    '--shard-opacity': `${shard.opacity}`,
                    animationDelay: `${shard.delay}ms`,
                    animation: `enemy-data-shard ${shard.duration}ms cubic-bezier(0.12,0.82,0.22,1) forwards`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}
        {run.activeEffects.filter((fx) => fx.cardObj && fx.launchOrigin).map(fx => (
          fx.cardObj && fx.launchOrigin ? (
            <div
              key={`global-ghost-${fx.id}`}
              className="absolute pointer-events-none animate-[card-launch_0.36s_cubic-bezier(0.05,0.7,0.2,1)_forwards]"
              style={{ left: `${fx.launchOrigin.x - gameFrameRect.left}px`, top: `${fx.launchOrigin.y - gameFrameRect.top}px` }}
            >
              <div className="relative animate-[card-disintegrate_0.36s_linear_forwards]">
                <Card
                  overrideCard={fx.cardObj}
                  pixelWidth={fx.launchOrigin.width || 128}
                  pixelHeight={fx.launchOrigin.height || 192}
                  level={fx.cardObj.currentLevel}
                  overrideValue={fx.cardObj.currentValue}
                  disableInteraction={true}
                />
                {[...Array(8)].map((_, idx) => (
                  <div
                    key={`global-ghost-${fx.id}-spark-${idx}`}
                    className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-[card-spark-rise_0.36s_ease-out_forwards]"
                    style={{ '--spark-x': `${(idx - 3.5) * 14}px`, '--spark-y': `${-20 - (idx % 3) * 12}px`, animationDelay: `${idx * 20}ms` }}
                  />
                ))}
              </div>
            </div>
          ) : null
        ))}
        {drawAnimations.map((fx) => (
          <React.Fragment key={`draw-ghost-${fx.id}`}>
            {fx.showHolo ? (
              <div
                className="absolute pointer-events-none animate-[draw-card-trail_0.54s_cubic-bezier(0.12,0.74,0.2,1)_forwards]"
                style={{
                  left: `${fx.origin.x - gameFrameRect.left}px`,
                  top: `${fx.origin.y - gameFrameRect.top}px`,
                  '--draw-dx': `${fx.target.x - fx.origin.x}px`,
                  '--draw-dy': `${fx.target.y - fx.origin.y}px`,
                  animationDelay: `${fx.staggerMs}ms`,
                }}
              >
                <div className="w-10 h-28 rounded-full bg-gradient-to-t from-cyan-400/0 via-cyan-300/55 to-white/90 blur-[3px]" />
              </div>
            ) : null}
            <div
              className="absolute pointer-events-none animate-[draw-card-flight_0.54s_cubic-bezier(0.12,0.74,0.2,1)_forwards]"
              style={{
                left: `${fx.origin.x - gameFrameRect.left}px`,
                top: `${fx.origin.y - gameFrameRect.top}px`,
                width: `${fx.target.width || fx.origin.width || 128}px`,
                height: `${fx.target.height || fx.origin.height || 192}px`,
                '--draw-dx': `${fx.target.x - fx.origin.x}px`,
                '--draw-dy': `${fx.target.y - fx.origin.y}px`,
                animationDelay: `${fx.staggerMs}ms`,
              }}
            >
              <div
                className={`relative w-full h-full overflow-hidden rounded ${fx.showHolo ? 'shadow-[0_0_16px_rgba(34,211,238,0.18)] animate-[draw-card-holo_0.54s_linear_forwards]' : ''}`}
              >
                <div className="absolute inset-0">
                  <Card
                    overrideCard={fx.cardObj}
                    pixelWidth={fx.target.width || fx.origin.width || 128}
                    pixelHeight={fx.target.height || fx.origin.height || 192}
                    level={fx.cardObj.currentLevel}
                    overrideValue={fx.cardObj.currentValue}
                    disableInteraction={true}
                  />
                </div>
                {fx.showHolo ? (
                  <>
                    <div className="absolute inset-[2px] rounded-[4px] bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(34,211,238,0.06))] mix-blend-screen" />
                    <div className="absolute inset-[2px] rounded-[4px] border border-cyan-200/85 shadow-[0_0_14px_rgba(34,211,238,0.42)]" />
                    <div className="absolute inset-[2px] rounded-[4px] bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.14)_0px,rgba(255,255,255,0.14)_2px,rgba(34,211,238,0)_2px,rgba(34,211,238,0)_6px)] opacity-55 mix-blend-screen" />
                  </>
                ) : null}
              </div>
            </div>
            {fx.showHolo ? (
              <div
                className="absolute pointer-events-none animate-[draw-card-arrive_0.28s_ease-out_forwards]"
                style={{
                  left: `${fx.target.x - gameFrameRect.left - (fx.target.width || 128) / 2}px`,
                  top: `${fx.target.y - gameFrameRect.top - (fx.target.height || 192) / 2}px`,
                  width: `${fx.target.width || 128}px`,
                  height: `${fx.target.height || 192}px`,
                  animationDelay: `${fx.staggerMs + 320}ms`,
                }}
              >
                <div className="w-full h-full rounded-sm border border-cyan-100/75 bg-cyan-200/12 shadow-[0_0_34px_rgba(34,211,238,0.75)]" />
              </div>
            ) : null}
          </React.Fragment>
        ))}
      </div>
      </div>
    </div>
  );
}
