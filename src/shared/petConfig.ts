import { DailyTaskDef, PetStage, ShopItem } from "./types";

export const TICK_INTERVAL_MS = 30_000;

// Decay per tick (awake, not sleeping)
export const DECAY = {
  hunger: 0.6,
  cleanliness: 0.35,
  energy: 0.4,
};

// Decay multiplier while sleeping
export const SLEEP_DECAY_FACTOR = 0.4;
export const SLEEP_ENERGY_RECOVERY = 3.5;

export const WORK_DURATION_MS = 5 * 60_000;
export const WORK_COIN_REWARD = 40;
export const WORK_EXP_REWARD = 15;
export const WORK_ENERGY_COST = 18;

export const POKE_MOOD_GAIN = 4;
export const POKE_COOLDOWN_MS = 10_000;

export function moodFromStats(hunger: number, cleanliness: number, energy: number): number {
  return Math.round((hunger * 0.4 + cleanliness * 0.3 + energy * 0.3));
}

export function expForNextLevel(level: number): number {
  return 50 + level * 25;
}

export function stageForLevel(level: number): PetStage {
  if (level >= 16) return 3;
  if (level >= 6) return 2;
  return 1;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "berry", category: "food", name: "野莓", price: 5, emoji: "🫐", effect: { hunger: 15, mood: 2 } },
  { id: "honeybun", category: "food", name: "蜜糖卷", price: 12, emoji: "🥐", effect: { hunger: 30, mood: 5 } },
  { id: "starfruit", category: "food", name: "星果", price: 25, emoji: "⭐", effect: { hunger: 45, mood: 12 } },
  { id: "bubblesoap", category: "clean", name: "泡泡皂", price: 8, emoji: "🧼", effect: { cleanliness: 30, mood: 3 } },
  { id: "dewspray", category: "clean", name: "晨露喷雾", price: 18, emoji: "💧", effect: { cleanliness: 50, mood: 6 } },
  { id: "hat-leaf", category: "hat", name: "叶子帽", price: 60, emoji: "🍃" },
  { id: "hat-bow", category: "hat", name: "蝴蝶结", price: 80, emoji: "🎀" },
  { id: "hat-crown", category: "hat", name: "小皇冠", price: 200, emoji: "👑" },
  { id: "color-mint", category: "color", name: "薄荷色", price: 40, emoji: "🟢", colorValue: "#7fd9b6" },
  { id: "color-peach", category: "color", name: "蜜桃色", price: 40, emoji: "🟠", colorValue: "#ffb38a" },
  { id: "color-lavender", category: "color", name: "薰衣草色", price: 40, emoji: "🟣", colorValue: "#b9a6e8" },
];

export const DAILY_TASKS: DailyTaskDef[] = [
  { id: "feed3", label: "喂食 3 次", target: 3, rewardCoins: 15, rewardExp: 10 },
  { id: "clean1", label: "清洁 1 次", target: 1, rewardCoins: 10, rewardExp: 5 },
  { id: "work1", label: "打工 1 次", target: 1, rewardCoins: 20, rewardExp: 10 },
  { id: "poke5", label: "互动 5 次", target: 5, rewardCoins: 10, rewardExp: 5 },
  { id: "minigame1", label: "玩一次接星星", target: 1, rewardCoins: 15, rewardExp: 10 },
];

export const DEFAULT_PET_NAME = "波波";

export const DEFAULT_SCALE = 0.6;
export const SCALE_PRESETS: { label: string; value: number }[] = [
  { label: "极小", value: 0.45 },
  { label: "小", value: 0.6 },
  { label: "中", value: 0.8 },
  { label: "大", value: 1.0 },
  { label: "特大", value: 1.3 },
];
