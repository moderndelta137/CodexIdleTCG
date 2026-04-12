import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  RotateCcw, FastForward, Magnet, Search, Cross, Dna, Bug, Bot, Crown,
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
  'h1': { id: 'h1', name: 'Mending Light', type: 'util', cost: 2, color: 'G', value: 10, isHeal: true, desc: 'Heal [VAL] HP', icon: Cross },
  'h2': { id: 'h2', name: 'Vitality', type: 'util', cost: 4, color: 'G', value: 25, isHeal: true, desc: 'Heal [VAL] HP', icon: Dna },
};

const ENEMY_LIST = [{name:'Enforcer',icon:Bug},{name:'Sentry',icon:Ghost},{name:'Drone',icon:Bot},{name:'Watcher',icon:Eye},{name:'Revenant',icon:Skull}];
const BOSS_LIST = [{name:'Void Reaver',icon:Target},{name:'Doom Guard',icon:Crown},{name:'Soul Eater',icon:Flame},{name:'Cyber Dragon',icon:Zap},{name:'Mana Wraith',icon:Hexagon}];

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
    gp: 0, fragments: 0, packs: 0,
    unlockedSkillsFeature: false, unlockedShopFeature: false,
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

const Card = ({ cardId, overrideCard, onPlay, onDiscard, effectiveCost, canAfford, scale = 1, inHand = false, level = 1, overrideValue, isDiscardMode = false, isAnimNew = false, isEventNode = false, pixelWidth, pixelHeight }) => {
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
        flex flex-col p-[3px] bg-gradient-to-br ${outerBg} select-none border border-black group cursor-pointer overflow-hidden`}
      style={pixelWidth && pixelHeight ? { width: `${pixelWidth}px`, height: `${pixelHeight}px` } : { width: `${8 * scale}rem`, height: `${12 * scale}rem` }}
      onClick={(e) => { 
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
         
         <div className="h-[42%] bg-[#e8deca] border border-black/40 rounded-sm p-1.5 shadow-[inset_0_0_8px_rgba(0,0,0,0.3)] text-black flex flex-col relative shrink-0 pointer-events-auto">
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

const CombatStatusPanel = ({ isPlayer, hp, maxHp, title, showDanger, extraContent }) => (
    <div className={`w-full max-w-sm sm:max-w-md space-y-2 relative z-30 bg-black/80 p-4 rounded-lg border ${isPlayer ? 'border-cyan-900/50' : 'border-red-900/50'} backdrop-blur-md shadow-2xl`}>
        <div className="flex justify-between items-end px-1">
            <div className="flex items-center gap-2">
                <Heart className={isPlayer ? "text-cyan-500" : "text-red-500"} size={16} />
                <span className={`${isPlayer ? "text-cyan-400" : "text-red-400"} text-xs sm:text-sm tracking-widest font-black`}>{Math.ceil(hp)} / {maxHp} HP</span>
            </div>
            <span className={`font-black text-[10px] uppercase tracking-[0.3em] ${showDanger ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                {title}
            </span>
        </div>
        <div className="w-full h-3 bg-black rounded-sm border border-slate-700 overflow-hidden relative">
            <div className={`h-full transition-all duration-200 ${isPlayer ? 'bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)]'}`} style={{ width: `${(hp / maxHp) * 100}%` }} />
        </div>
        {extraContent && (
            <div className="mt-2">
                {extraContent}
            </div>
        )}
    </div>
);

const CombatVfxCanvas = ({ activeEffects, enemyAttackEffects, hitStopUntil, enemyRef }) => {
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
        particlesRef.current.push(particle);
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
            pushParticle({
                kind: 'ring',
                born: now,
                ttl: 240,
                x: metrics.player.x,
                y: metrics.player.y - 10,
                radius: fx.type === 'util' ? 86 : 118,
                lineWidth: fx.type === 'util' ? 4 : 6,
                color,
                dashed: fx.type === 'util',
            });
            pushParticle({
                kind: 'coreFlash',
                born: now,
                ttl: 140,
                x: metrics.player.x,
                y: metrics.player.y - 10,
                radius: fx.type === 'util' ? 22 : 28,
                color,
            });
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
        activeEffects.forEach((fx) => {
            if (seenActiveRef.current.has(fx.id)) return;
            seenActiveRef.current.add(fx.id);
            spawnActiveEffect(fx);
        });
    }, [activeEffects, spawnActiveEffect]);

    useEffect(() => {
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

            particlesRef.current = particlesRef.current.filter((p) => now < p.born + p.ttl + 20);

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
    const sector = Math.floor(nodeIndex / 10) + 1;
    const stage = (nodeIndex % 10) + 1;
    const visibleNodes = runMap.slice(startIndex, endIndex);

    return (
        <div className="h-16 bg-black/80 border-b border-cyan-800/50 z-20 backdrop-blur-md shrink-0 w-full overflow-hidden relative shadow-[0_5px_20px_rgba(0,255,255,0.05)] flex items-center pl-2">
            <div className="flex items-center justify-center bg-slate-900 border-2 border-cyan-800 shadow-[0_0_15px_rgba(0,255,255,0.2)] px-4 py-2 shrink-0 z-30 mr-4">
                <span className="text-cyan-400 font-mono font-black text-xl tracking-widest">{sector}-{stage}</span>
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
  
  const [meta, setMeta] = useState(() => {
    const saved = localStorage.getItem('codexIdleSaveData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_META, ...parsed, 
            unlockedSkillsFeature: parsed.unlockedSkillsFeature ?? false, 
            unlockedShopFeature: parsed.unlockedShopFeature ?? false 
        };
      } catch(e) { console.error("Failed to load save", e); }
    }
    return DEFAULT_META;
  });

  useEffect(() => {
    localStorage.setItem('codexIdleSaveData', JSON.stringify(meta));
  }, [meta]);

  const [pulledCards, setPulledCards] = useState([]);
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
              const w = window.innerWidth;
              const h = window.innerHeight;
              const canvasSize = 1600;
              const z = w < 768 ? 0.6 : 0.85;
              const headerH = 70;
              const viewH = h - headerH;
              setZoom(z);
              setPan({ x: (w - canvasSize * z) / 2, y: headerH + (viewH - canvasSize * z) / 2 });
          });
          return () => cancelAnimationFrame(rafId);
      }
  }, [view]);
  
  const [recentAdds, setRecentAdds] = useState([]); 
  const [unlockAnimId, setUnlockAnimId] = useState(null);
  const [upgradeAnimId, setUpgradeAnimId] = useState(null);
  const [frameNow, setFrameNow] = useState(0);
  const [hitStopUntil, setHitStopUntil] = useState(0);

  const generateRunMap = (currentMeta) => {
      const map = [];
      let combatCount = 0;
      for (let i = 0; i < 1000; i++) {
          if (i === 2 && !currentMeta.unlockedSkillsFeature) {
              map.push({ index: i, id: `node-${i}`, type: 'unlock_skills', label: 'Unlock: Skills' });
              continue;
          }
          if (i === 4 && !currentMeta.unlockedShopFeature) {
              map.push({ index: i, id: `node-${i}`, type: 'unlock_shop', label: 'Unlock: Shop' });
              continue;
          }

          if (combatCount % 5 === 4) {
              map.push({ index: i, id: `node-${i}`, type: 'boss', label: 'Boss' });
              combatCount++;
              continue;
          }

          const r = Math.random();
          if (r < 0.05) {
              map.push({ index: i, id: `node-${i}`, type: 'treasure', label: 'Treasure' });
          } else if (r < 0.10) {
              map.push({ index: i, id: `node-${i}`, type: 'rest', label: 'Rest' });
          } else {
              map.push({ index: i, id: `node-${i}`, type: 'encounter', label: 'Encounter' });
              combatCount++;
          }
      }
      return map;
  };

  const [run, setRun] = useState({
    hp: 50, maxHp: 50, shield: 0, mana: 0, kills: 0, gpEarned: 0, fragsEarned: 0, packsEarned: 0,
    deck: [], hand: [], discard: [], monster: null, isPaused: false, autoDrawTimer: 0, activeEffects: [], enemyAttackEffects: [],
    floatingDrops: [], deathEffect: null, runMap: [], nodeIndex: 0, activeEvent: null, eventPopup: null,
    cardDamage: {}
  });
  const enemyCardRef = useRef(null);

  useEffect(() => {
     if (run && run.nodeIndex !== undefined) {
         const sector = Math.floor(run.nodeIndex / 10) + 1;
         const stage = (run.nodeIndex % 10) + 1;
         const isBoss = run.runMap && run.runMap[run.nodeIndex]?.type === 'boss';
         const rafId = requestAnimationFrame(() => {
             setLevelBanner({ sector, stage, isBoss, visible: true });
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

  const getEffectiveCost = useCallback((card) => {
    if (meta.freeLowCost && card.cost === 1) return 0;
    if (meta.freeUtil && card.type === 'util' && !card.isHeal) return 0;
    return card.cost;
  }, [meta.freeLowCost, meta.freeUtil]);

  const drawInternal = useCallback((currentState, amount = 1) => {
      let state = { ...currentState, deck: [...currentState.deck], hand: [...currentState.hand], discard: [...currentState.discard] };
      for (let i = 0; i < amount; i++) {
          if (state.hand.length >= meta.maxHand) break;
          if (state.deck.length === 0) {
              if (state.discard.length === 0) break;
              state.deck = shuffle(state.discard);
              state.discard = [];
          }
          if (state.deck.length > 0) state.hand.push(state.deck.pop());
      }
      return state;
  }, [meta.maxHand]);

  // --- Actions ---

  const startRun = () => {
    if (meta.activeDeck.length < 10) {
        alert("Deck must have at least 10 cards!");
        return;
    }

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

    const freshMap = generateRunMap(meta);
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
      deck, hand, discard: [], monster: initialMonster, isPaused: false, autoDrawTimer: 0, activeEffects: [], enemyAttackEffects: [], floatingDrops: [], deathEffect: null,
      runMap: freshMap, nodeIndex: 0, activeEvent: initialEvent, eventPopup: null,
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
        } else if (currentEvent.type === 'unlock_skills') {
            popupData.text = "System override successful.";
            popupData.loot.push("Skill Architecture Unlocked");
            newDrops.push({ id: Math.random(), type: 'unlock', val: 'SKILLS', delay: 0 });
        } else if (currentEvent.type === 'unlock_shop') {
            popupData.text = "Network connection established.";
            popupData.loot.push("Data Shop Unlocked");
            newDrops.push({ id: Math.random(), type: 'unlock', val: 'SHOP', delay: 0 });
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
        
        if (next.eventPopup?.type === 'unlock_skills') {
            setMeta(m => ({...m, unlockedSkillsFeature: true}));
        } else if (next.eventPopup?.type === 'unlock_shop') {
            setMeta(m => ({...m, unlockedShopFeature: true}));
        }

        next.eventPopup = null;
        next.activeEvent = null;
        next.nodeIndex += 1;
        
        const nextNode = next.runMap[next.nodeIndex];
        
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
      let projectedDamage = card.currentValue + meta.dmgMod;
      if (meta.heavyDmgMod > 0 && card.cost >= 3) projectedDamage += meta.heavyDmgMod;
      if (meta.firstStrike && run.monster && run.monster.hp === run.monster.maxHp) projectedDamage *= 2;
      if (meta.bossSlayer && run.monster && run.monster.isBoss) projectedDamage = Math.floor(projectedDamage * 1.5);
      if (card.multiHit) projectedDamage *= (card.multiHit + (meta.multiStrike ? 1 : 0));
      setHitStopUntil(Date.now() + getAttackFxProfile(card, projectedDamage).hitStop);
    }
    setRun(prev => {
      const timestamp = Date.now();
      const attackProfile = card.type === 'atk' ? getAttackFxProfile(card, card.currentValue + meta.dmgMod) : null;

      let nextRun = {
        ...prev, mana: prev.mana - cost, hand: prev.hand.filter(c => c.runId !== card.runId), discard: [...prev.discard, card],
        activeEffects: [...prev.activeEffects, { id: Math.random(), type: card.isHeal ? 'heal' : card.type, cost: card.cost, timestamp, cardObj: card, attackProfile, launchOrigin }]
      };

      if (meta.manaRefund && cost > 0) nextRun.mana += 1;

      if (card.type === 'atk') {
        let dmg = card.currentValue + meta.dmgMod;
        if (meta.heavyDmgMod > 0 && card.cost >= 3) dmg += meta.heavyDmgMod;
        if (meta.firstStrike && nextRun.monster && nextRun.monster.hp === nextRun.monster.maxHp) dmg *= 2;
        if (meta.bossSlayer && nextRun.monster && nextRun.monster.isBoss) dmg = Math.floor(dmg * 1.5);
        if (card.multiHit) dmg *= (card.multiHit + (meta.multiStrike ? 1 : 0));
        if (nextRun.monster) {
            nextRun.monster.hp -= dmg;
            nextRun.cardDamage = { ...nextRun.cardDamage };
            const trackKey = card.id || card.name;
            nextRun.cardDamage[trackKey] = (nextRun.cardDamage[trackKey] || 0) + dmg;
        }
        
        if (meta.drawOnAtk) nextRun = drawInternal(nextRun, 1);
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
        } else {
            nextRun = drawInternal(nextRun, card.currentValue);
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
        nextRun.deathEffect = Date.now();
        
        nextRun.kills += 1;
        nextRun.nodeIndex += 1;
        const nextNode = nextRun.runMap[nextRun.nodeIndex];
        
        nextRun.mana = Math.floor(nextRun.mana * meta.manaRetain) + meta.startMana;
        nextRun.shield = 0;
        
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

  const drawCard = () => { setIsDiscardMode(false); setRun(prev => drawInternal(prev, meta.drawMulti)); };
  
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
            setMeta(m => ({ ...m, gp: m.gp + prev.gpEarned, fragments: m.fragments + prev.fragsEarned, packs: m.packs + prev.packsEarned }));
            setView('gameover');
            return prev;
        }

        let next = { ...prev };
        
        if (next.activeEffects.length > 0) next.activeEffects = next.activeEffects.filter(e => now - e.timestamp < 600);
        if (next.enemyAttackEffects && next.enemyAttackEffects.length > 0) next.enemyAttackEffects = next.enemyAttackEffects.filter(e => now - e.timestamp < 500);
        if (next.floatingDrops && next.floatingDrops.length > 0) next.floatingDrops = next.floatingDrops.filter(e => now - e.timestamp < 1500);

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
                next = drawInternal(next, 1);
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
  }, [view, run.isPaused, meta.regenRate, meta.autoDrawRate, meta.autoPlayMana, meta.maxHand, meta.kineticMana, meta.manaRefund, meta.manaSurge, drawInternal, getEffectiveCost, hitStopUntil]);


  // --- Gacha & Upgrades ---
  const convertFragments = () => {
      if (meta.fragments >= 10) {
          const packsToGain = Math.floor(meta.fragments / 10);
          setMeta(prev => ({ ...prev, fragments: prev.fragments % 10, packs: prev.packs + packsToGain }));
      }
  };

  const openPack = (count = 1) => {
      const actualCount = Math.min(count, meta.packs);
      if (actualCount > 0) {
          const cardKeys = Object.keys(CARD_DB);
          const newCards = [];
          
          for (let p = 0; p < actualCount; p++) {
              for(let i = 0; i < 5; i++) {
                  const roll = Math.random();
                  let pool = cardKeys.filter(k => CARD_DB[k].cost < 3); 
                  if (roll > 0.7) pool = cardKeys.filter(k => CARD_DB[k].cost >= 2 && CARD_DB[k].cost <= 4); 
                  if (roll > 0.95) pool = cardKeys.filter(k => CARD_DB[k].cost >= 4); 
                  if (pool.length === 0) pool = cardKeys;
                  const pulledId = pool[Math.floor(Math.random() * pool.length)];
                  newCards.push(CARD_DB[pulledId]);
              }
          }

          setPulledCards(newCards);
          setMeta(prev => {
              const newCollection = { ...prev.collection };
              newCards.forEach(c => { newCollection[c.id] = (newCollection[c.id] || 0) + 1; });
              return { ...prev, packs: prev.packs - actualCount, collection: newCollection };
          });
      }
  };

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
      @keyframes enemy-death { 0% { filter: brightness(1) blur(0px); transform: scale(1); } 50% { filter: brightness(2) blur(5px); transform: scale(1.2); opacity: 1; } 100% { filter: brightness(0) blur(10px); transform: scale(1.5); opacity: 0; } }
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
    return Object.values(SKILL_TREE_DICT).some(skill => {
        const reqsMet = skill.requiresAny.length === 0 || skill.requiresAny.some(req => meta.unlockedSkills.includes(req));
        return meta.gp >= skill.cost && reqsMet && !meta.unlockedSkills.includes(skill.id);
    });
  }, [meta.gp, meta.unlockedSkills]);

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

  // --- Views ---

  const renderMenu = () => {
    const btnBase = "w-full flex items-center justify-center gap-3 p-4 rounded font-black uppercase tracking-widest transition-all backdrop-blur-sm bg-slate-900 border text-slate-300 shadow-md";
    
    return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-blue-950 to-black text-white p-6 relative overflow-hidden font-tech">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      
      <div className="text-center relative z-10">
        <div className="absolute -inset-10 bg-cyan-500/10 blur-3xl rounded-full" />
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)] leading-tight">
          CODEX DUELIST
        </h1>
        <p className="text-cyan-400 tracking-[0.5em] text-[10px] md:text-xs mt-2 md:mt-4 font-bold uppercase drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">Master System Ready</p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-sm relative z-10">
        <button onClick={startRun} className={`${btnBase} border-slate-700 hover:border-cyan-400 hover:text-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] group overflow-hidden relative`}>
          <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          <Play className="group-hover:scale-125 transition-transform drop-shadow-md" fill="currentColor" />
          ENTER LINK VRAINS
        </button>
        
        <button onClick={() => { setView('deck'); setActiveTab('trunk'); }} className={`${btnBase} border-slate-700 hover:border-purple-400 hover:text-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]`}>
          <Layers size={18} /> DECK EDIT
        </button>

        {meta.unlockedSkillsFeature ? (
            <button onClick={() => setView('skills')} className={`${btnBase} ${canUnlockSkill ? 'border-blue-500 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse ring-1 ring-blue-400 hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]' : 'border-slate-700 hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]'}`}>
              <ArrowUpCircle size={18} /> SKILLS
            </button>
        ) : (
            <button disabled className={`${btnBase} border-slate-800 text-slate-700 cursor-not-allowed opacity-60`}>
              <Lock size={18} /> SKILLS (LOCKED)
            </button>
        )}

        <button onClick={() => { setView('codex'); setActiveTab('trunk'); }} className={`${btnBase} ${canUpgradeCard ? 'border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse ring-1 ring-emerald-400 hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]' : 'border-slate-700 hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}>
          <Library size={18} /> CODEX (UPGRADES)
        </button>

        {meta.unlockedShopFeature ? (
            <button onClick={() => setView('gacha')} className={`${btnBase} ${hasPacks ? 'border-amber-500 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse ring-1 ring-amber-400 hover:border-amber-400 hover:text-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.8)]' : 'border-slate-700 hover:border-amber-400 hover:text-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]'}`}>
              <Package size={20} /> SHOP & PACKS
            </button>
        ) : (
            <button disabled className={`${btnBase} border-slate-800 text-slate-700 cursor-not-allowed opacity-60`}>
              <Lock size={18} /> SHOP (LOCKED)
            </button>
        )}
        <button onClick={() => { if(confirm("Are you sure you want to completely erase your save data?")) { localStorage.clear(); window.location.reload(); } }} className={`${btnBase} border-red-900 hover:border-red-500 text-red-500 mt-8`}>
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

  const renderCombat = () => {
    if (!run.runMap || run.runMap.length === 0) return null;

    const currentMapNode = run.runMap[run.nodeIndex];
    const isCombatNode = currentMapNode && (currentMapNode.type === 'encounter' || currentMapNode.type === 'boss');
    const renderTimestamp = frameNow;
    const isHitStopActive = renderTimestamp < hitStopUntil;
    const manaFx = run.activeEffects.filter(e => e.type === 'mana');
    const hasManaFx = manaFx.length > 0;

    let monsterTimerPercent = 0;
    let timeLeft = "0.0";
    let showTimer = false, showDanger = false, showCritical = false;
    let isMonsterAttacking = false, isMonsterDying = false;
    let MonsterIcon = Trophy;

    if (isCombatNode && run.monster) {
        monsterTimerPercent = (run.monster.timer / run.monster.maxTimer) * 100;
        timeLeft = Math.max(0, run.monster.maxTimer - run.monster.timer).toFixed(1);
        showTimer = monsterTimerPercent > 50;
        showDanger = monsterTimerPercent > 80;
        showCritical = monsterTimerPercent > 90;
        isMonsterAttacking = run.enemyAttackEffects && run.enemyAttackEffects.some(e => renderTimestamp - e.timestamp < 200);
        isMonsterDying = run.deathEffect && renderTimestamp - run.deathEffect < 500;
        MonsterIcon = run.monster.iconId !== undefined 
            ? (run.monster.isBoss ? BOSS_LIST.map(e=>e.icon)[run.monster.iconId] : ENEMY_LIST.map(e=>e.icon)[run.monster.iconId]) 
            : (run.monster.isBoss ? Trophy : Sword);
    }

    const shakeLevel = isCombatNode ? run.activeEffects.reduce((max, e) => e.type === 'atk' ? Math.max(max, e.cost >= 3 ? 2 : 1) : max, 0) : 0;
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
                     <button onClick={() => { setShowOptions(false); setMeta(m => ({ ...m, gp: m.gp + run.gpEarned, fragments: m.fragments + run.fragsEarned, packs: m.packs + run.packsEarned })); setView('gameover'); }} className="bg-red-900 border border-red-500 text-white p-2 sm:p-4 font-black tracking-widest hover:bg-red-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">END RUN</button>
                     <button onClick={() => setShowOptions(false)} className="bg-cyan-900/60 border border-cyan-700 text-white p-2 sm:p-4 font-bold hover:bg-cyan-800 mt-2 sm:mt-4">RESUME</button>
                 </div>
              </div>
          )}

          {levelBanner && levelBanner.visible && (
             <div className="absolute top-[25%] left-1/2 -translate-x-1/2 pointer-events-none z-[100] w-full flex justify-center">
                 <div className={`px-16 py-6 border-y-4 shadow-2xl flex flex-col items-center animate-[loot-fountain_2s_ease-in-out_forwards] backdrop-blur-md ${levelBanner.isBoss ? 'bg-red-900/80 border-red-500 shadow-[0_0_50px_rgba(255,0,0,0.8)]' : 'bg-black/90 border-cyan-500 shadow-[0_0_50px_rgba(0,255,255,0.4)]'}`}>
                     <span className={`text-4xl sm:text-6xl font-black tracking-[0.2em] ${levelBanner.isBoss ? 'text-red-400 drop-shadow-[0_0_15px_rgba(255,0,0,1)]' : 'text-cyan-400 drop-shadow-[0_0_15px_rgba(0,255,255,1)]'}`}>
                         {levelBanner.isBoss ? 'WARNING: BOSS' : `SECTOR ${levelBanner.sector}-${levelBanner.stage}`}
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
               {run.activeEffects.map(fx => {
                   if (fx.type === 'atk' || fx.type === 'def' || fx.type === 'util' || fx.type === 'heal') return null;
                   return null;
               })}

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
                      
                      <div ref={enemyCardRef} className={`w-44 h-60 rounded-sm bg-gradient-to-br ${run.monster.isBoss ? 'from-red-950 to-black border-red-500 shadow-[0_0_50px_rgba(255,0,0,0.4)]' : 'from-slate-800 to-slate-900 border-cyan-400/50 shadow-[0_0_30px_rgba(0,255,255,0.2)]'} border-2 flex flex-col items-center justify-center relative overflow-hidden transform group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-500 ${isMonsterDying ? 'animate-[enemy-death_0.5s_ease-out_forwards]' : ''} ${isHitStopActive ? 'scale-110 brightness-125' : ''}`}>
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
                  extraContent={
                      <div className="flex justify-between items-center mt-2">
                          {run.shield > 0 ? (
                              <div className="flex items-center gap-1 sm:gap-2 bg-blue-900/40 px-3 py-0.5 rounded border border-blue-400 animate-pulse">
                                  <Shield className="text-blue-400" size={14} />
                                  <span className="font-mono text-sm font-black text-blue-100">{run.shield} Block</span>
                              </div>
                          ) : <div />}
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
              <Card 
                key={card.runId} 
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
                onClick={drawCard}
                className="relative w-16 h-24 sm:w-28 sm:h-40 bg-[#1a110a] rounded-sm border-[2px] sm:border-[4px] border-[#4a3222] shadow-[5px_5px_20px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center transform hover:-translate-y-2 hover:shadow-[10px_15px_30px_rgba(0,255,255,0.2)] transition-all active:scale-95 overflow-hidden origin-bottom-right sm:origin-center"
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
    Object.values(SKILL_TREE_DICT).forEach(skill => {
        (skill.requiresAny || []).forEach(req => {
            lines.push({ from: req, to: skill.id });
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
                    {Object.keys(SKILL_TREE_DICT).map(key => renderNode(key))}
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
                            {upgradeAnimId === activeDisplayId && (
                                <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
                                    {/* Soft green glow backdrop */}
                                    <div className="absolute w-60 h-80 bg-emerald-500/30 rounded-2xl blur-3xl animate-[upgrade-burst_1.2s_ease-out_forwards]" />
                                    {/* Expanding ring */}
                                    <div className="absolute w-52 h-72 border-4 border-emerald-400 rounded-lg animate-[upgrade-ring_0.8s_ease-out_forwards]" />
                                    <div className="absolute w-52 h-72 border-4 border-cyan-300 rounded-lg animate-[upgrade-ring_0.8s_ease-out_forwards]" style={{animationDelay:'0.15s'}} />
                                    {/* Diagonal shine sweep */}
                                    <div className="absolute w-52 h-72 rounded-lg overflow-hidden">
                                        <div className="absolute inset-0 w-[60px] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[upgrade-shine_0.6s_ease-in-out_forwards]" style={{animationDelay:'0.2s'}} />
                                    </div>
                                    {/* Cyber particles */}
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="absolute w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-[upgrade-burst_0.8s_ease-out_forwards]" 
                                             style={{animationDelay:`${i*0.08}s`, left:`${30+Math.random()*40}%`, top:`${20+Math.random()*60}%`}} />
                                    ))}
                                </div>
                            )}
                            <div className="animate-pulse shadow-[0_0_30px_rgba(0,255,255,0.2)] rounded-lg z-10">
                                <Card cardId={activeDisplayId} scale={1.5} level={lvl} overrideValue={getCardValue(CARD_DB[activeDisplayId], lvl)} />
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
          const packCount = Math.ceil(pulledCards.length / 5);
          const packs = [];
          for (let p = 0; p < packCount; p++) {
              packs.push(pulledCards.slice(p * 5, p * 5 + 5));
          }

          return (
              <div className="flex flex-col items-center justify-start h-full bg-black text-white p-4 sm:p-6 relative overflow-y-auto overflow-x-hidden pb-24 font-tech">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.2),transparent_70%)] pointer-events-none" />
                  
                  {/* Legendary screen flash */}
                  {pulledCards.some(c => c.cost >= 4) && (
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 via-yellow-500/20 to-transparent animate-[legendary-flash_1.5s_ease-out_forwards] pointer-events-none z-20" />
                  )}

                  <h2 className="text-3xl sm:text-5xl font-black text-cyan-400 uppercase tracking-widest mb-6 sm:mb-10 mt-8 sm:mt-12 drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] animate-pulse text-center z-10">
                      {packCount > 1 ? `${packCount}x Packs Acquired` : 'Pack Acquired'}
                  </h2>
                  
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

              <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 z-10 pb-12">
                  <div className="w-full max-w-[20rem] bg-slate-900/60 border border-purple-800/50 rounded-sm p-6 flex flex-col items-center text-center backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                      <Layers size={64} className="text-purple-500 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                      <h3 className="text-2xl font-black uppercase text-purple-400 tracking-widest mb-2">Synthesis</h3>
                      <p className="text-xs sm:text-sm text-slate-400 mb-6 h-12 font-read">Combine 10 Fragments to create 1 Data Pack.</p>
                      <button 
                          onClick={convertFragments}
                          disabled={meta.fragments < 10}
                          className={`w-full py-4 font-black uppercase tracking-widest rounded-sm transition-all border text-sm sm:text-base ${meta.fragments >= 10 ? 'bg-purple-900/40 text-purple-300 border-purple-500 hover:bg-purple-600 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]' : 'bg-black text-slate-600 border-slate-800 cursor-not-allowed'}`}
                      >
                          Synthesize Pack
                      </button>
                  </div>

                  <div className="w-full max-w-[20rem] bg-slate-900/60 border border-blue-800/50 rounded-sm p-6 flex flex-col items-center text-center backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                      <Package size={64} className="text-blue-500 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                      <h3 className="text-2xl font-black uppercase text-blue-400 tracking-widest mb-2">Extraction</h3>
                      <p className="text-xs sm:text-sm text-slate-400 mb-6 h-12 font-read">Open 1 Data Pack to extract 5 randomized cards.</p>
                      <button 
                          onClick={() => openPack(1)}
                          disabled={meta.packs < 1}
                          className={`w-full py-4 font-black uppercase tracking-widest rounded-sm transition-all border text-sm sm:text-base ${meta.packs >= 1 ? 'bg-blue-900/40 text-blue-300 border-blue-500 hover:bg-blue-600 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'bg-black text-slate-600 border-slate-800 cursor-not-allowed'}`}
                      >
                          Open 1 Pack
                      </button>
                      <button 
                          onClick={() => openPack(10)}
                          disabled={meta.packs < 10}
                          className={`w-full py-3 mt-2 font-black uppercase tracking-widest rounded-sm transition-all border text-sm ${meta.packs >= 10 ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 text-blue-200 border-blue-400 hover:from-blue-600 hover:to-purple-600 hover:text-white hover:shadow-[0_0_25px_rgba(59,130,246,0.8)]' : 'bg-black text-slate-600 border-slate-800 cursor-not-allowed'}`}
                      >
                          Open 10x Packs
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  const renderGameOver = () => {
      const sector = Math.floor(run.nodeIndex / 10) + 1;
      const stage = (run.nodeIndex % 10) + 1;
      const topCards = Object.entries(run.cardDamage || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
      const maxDmg = topCards.length > 0 ? topCards[0][1] : 1;

      return (
          <div className="flex flex-col items-center justify-start h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-red-950/30 to-black text-white p-4 sm:p-8 relative overflow-y-auto font-tech">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center w-full max-w-lg mt-8">
                  {/* Title */}
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-400 via-red-500 to-red-800 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)] mb-2">
                      RUN OVER
                  </h1>
                  <p className="text-red-400/60 tracking-[0.5em] text-[10px] uppercase font-bold mb-8">CONNECTION LOST</p>

                  {/* Progress */}
                  <div className="w-full bg-black/60 border border-slate-800 rounded-sm p-4 sm:p-6 mb-4">
                      <h3 className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-4">Progress</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                          <div><div className="text-2xl sm:text-3xl font-black text-cyan-400">{sector}-{stage}</div><div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Sector</div></div>
                          <div><div className="text-2xl sm:text-3xl font-black text-red-400">{run.kills}</div><div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Kills</div></div>
                          <div><div className="text-2xl sm:text-3xl font-black text-white">{run.nodeIndex}</div><div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Nodes</div></div>
                      </div>
                  </div>

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
    <div className="w-full h-[100dvh] max-w-6xl mx-auto overflow-hidden bg-black shadow-2xl relative select-none">
      {view === 'menu' && renderMenu()}
      {view === 'combat' && renderCombat()}
      {view === 'skills' && renderSkills()}
      {view === 'deck' && renderDeckEditor()}
      {view === 'codex' && renderCodex()}
      {view === 'gacha' && renderGacha()}
      {view === 'gameover' && renderGameOver()}
      <div className="fixed inset-0 pointer-events-none z-[200]">
        {run.activeEffects.map(fx => (
          fx.cardObj && fx.launchOrigin ? (
            <div
              key={`global-ghost-${fx.id}`}
              className="fixed pointer-events-none animate-[card-launch_0.36s_cubic-bezier(0.05,0.7,0.2,1)_forwards]"
              style={{ left: `${fx.launchOrigin.x}px`, top: `${fx.launchOrigin.y}px` }}
            >
              <div className="relative animate-[card-disintegrate_0.36s_linear_forwards]">
                <Card
                  overrideCard={fx.cardObj}
                  pixelWidth={fx.launchOrigin.width || 128}
                  pixelHeight={fx.launchOrigin.height || 192}
                  level={fx.cardObj.currentLevel}
                  overrideValue={fx.cardObj.currentValue}
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
      </div>
    </div>
  );
}
