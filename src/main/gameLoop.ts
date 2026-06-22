import { PetAction, PetState } from "../shared/types";
import {
  DAILY_TASKS,
  DECAY,
  POKE_MOOD_GAIN,
  SHOP_ITEMS,
  SLEEP_DECAY_FACTOR,
  SLEEP_ENERGY_RECOVERY,
  TICK_INTERVAL_MS,
  WORK_COIN_REWARD,
  WORK_DURATION_MS,
  WORK_ENERGY_COST,
  WORK_EXP_REWARD,
  expForNextLevel,
  moodFromStats,
  stageForLevel,
} from "../shared/petConfig";
import { loadState, nextMidnight, saveState } from "./store";

type Listener = (state: PetState) => void;

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

export class PetEngine {
  private state: PetState;
  private listeners: Listener[] = [];
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.state = loadState();
    this.applyOfflineCatchUp();
  }

  onChange(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getState(): PetState {
    return this.state;
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private emit(): void {
    saveState(this.state);
    for (const l of this.listeners) l(this.state);
  }

  private applyOfflineCatchUp(): void {
    const now = Date.now();
    const elapsedMs = now - this.state.lastTickAt;
    const ticks = Math.floor(elapsedMs / TICK_INTERVAL_MS);
    if (ticks > 0) {
      this.applyDecay(Math.min(ticks, 2880)); // cap at ~24h worth of ticks
    }
    this.resetDailyTasksIfNeeded(now);
    this.checkWorkCompletion(now);
    this.state.lastTickAt = now;
    this.emit();
  }

  private applyDecay(ticks: number): void {
    const factor = this.state.isSleeping ? SLEEP_DECAY_FACTOR : 1;
    this.state.hunger = clamp(this.state.hunger - DECAY.hunger * factor * ticks);
    this.state.cleanliness = clamp(this.state.cleanliness - DECAY.cleanliness * factor * ticks);
    if (this.state.isSleeping) {
      this.state.energy = clamp(this.state.energy + SLEEP_ENERGY_RECOVERY * ticks);
    } else {
      this.state.energy = clamp(this.state.energy - DECAY.energy * ticks);
    }
    this.state.mood = clamp(moodFromStats(this.state.hunger, this.state.cleanliness, this.state.energy));
  }

  private resetDailyTasksIfNeeded(now: number): void {
    if (now >= this.state.dailyResetAt) {
      this.state.dailyTasks = DAILY_TASKS.map((t) => ({ id: t.id, progress: 0, target: t.target, claimed: false }));
      this.state.dailyResetAt = nextMidnight(now);
    }
  }

  private checkWorkCompletion(now: number): void {
    if (this.state.isWorking && this.state.workEndsAt && now >= this.state.workEndsAt) {
      this.state.isWorking = false;
      this.state.workEndsAt = null;
      this.state.coins += WORK_COIN_REWARD;
      this.addExp(WORK_EXP_REWARD);
      this.incrementTask("work1", 1);
    }
  }

  private addExp(amount: number): void {
    this.state.exp += amount;
    let needed = expForNextLevel(this.state.level);
    while (this.state.exp >= needed) {
      this.state.exp -= needed;
      this.state.level += 1;
      this.state.stage = stageForLevel(this.state.level);
      needed = expForNextLevel(this.state.level);
    }
  }

  private incrementTask(taskId: string, amount: number): void {
    const task = this.state.dailyTasks.find((t) => t.id === taskId);
    if (task && !task.claimed) {
      task.progress = Math.min(task.target, task.progress + amount);
    }
  }

  tick(): void {
    const now = Date.now();
    this.applyDecay(1);
    this.resetDailyTasksIfNeeded(now);
    this.checkWorkCompletion(now);
    this.state.lastTickAt = now;
    this.emit();
  }

  performAction(action: PetAction): PetState {
    const now = Date.now();
    switch (action.type) {
      case "feed": {
        const item = SHOP_ITEMS.find((i) => i.id === action.itemId);
        if (item && (this.state.inventory[item.id] ?? 0) > 0) {
          this.state.inventory[item.id] -= 1;
          this.state.hunger = clamp(this.state.hunger + (item.effect?.hunger ?? 0));
          this.state.mood = clamp(this.state.mood + (item.effect?.mood ?? 0));
          this.incrementTask("feed3", 1);
        }
        break;
      }
      case "clean": {
        const item = SHOP_ITEMS.find((i) => i.id === action.itemId);
        if (item && (this.state.inventory[item.id] ?? 0) > 0) {
          this.state.inventory[item.id] -= 1;
          this.state.cleanliness = clamp(this.state.cleanliness + (item.effect?.cleanliness ?? 0));
          this.state.mood = clamp(this.state.mood + (item.effect?.mood ?? 0));
          this.incrementTask("clean1", 1);
        }
        break;
      }
      case "sleep":
        this.state.isSleeping = true;
        break;
      case "wake":
        this.state.isSleeping = false;
        break;
      case "startWork":
        if (!this.state.isWorking && !this.state.isSleeping && this.state.energy >= WORK_ENERGY_COST) {
          this.state.isWorking = true;
          this.state.workEndsAt = now + WORK_DURATION_MS;
          this.state.energy = clamp(this.state.energy - WORK_ENERGY_COST);
        }
        break;
      case "poke":
        this.state.mood = clamp(this.state.mood + POKE_MOOD_GAIN);
        this.incrementTask("poke5", 1);
        break;
      case "minigameResult":
        this.state.coins += action.coins;
        this.addExp(action.exp);
        this.incrementTask("minigame1", 1);
        break;
    }
    this.state.mood = clamp(moodFromStats(this.state.hunger, this.state.cleanliness, this.state.energy));
    this.emit();
    return this.state;
  }

  buyItem(itemId: string): PetState {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (item && this.state.coins >= item.price) {
      this.state.coins -= item.price;
      if (item.category === "food" || item.category === "clean") {
        this.state.inventory[item.id] = (this.state.inventory[item.id] ?? 0) + 1;
      } else if (item.category === "hat") {
        this.state.inventory[item.id] = (this.state.inventory[item.id] ?? 0) + 1;
      } else if (item.category === "color") {
        this.state.inventory[item.id] = (this.state.inventory[item.id] ?? 0) + 1;
      }
    }
    this.emit();
    return this.state;
  }

  equipItem(slot: "hat" | "color", itemId: string | null): PetState {
    if (itemId === null) {
      delete this.state.equipped[slot];
    } else if ((this.state.inventory[itemId] ?? 0) > 0) {
      this.state.equipped[slot] = itemId;
    }
    this.emit();
    return this.state;
  }

  claimTask(taskId: string): PetState {
    const def = DAILY_TASKS.find((t) => t.id === taskId);
    const task = this.state.dailyTasks.find((t) => t.id === taskId);
    if (def && task && !task.claimed && task.progress >= task.target) {
      task.claimed = true;
      this.state.coins += def.rewardCoins;
      this.addExp(def.rewardExp);
    }
    this.emit();
    return this.state;
  }

  setPosition(x: number, y: number): void {
    this.state.position = { x, y };
    saveState(this.state);
  }

  setScale(scale: number): PetState {
    this.state.scale = clamp(scale, 0.3, 2);
    this.emit();
    return this.state;
  }
}
