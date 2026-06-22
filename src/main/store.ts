import Store from "electron-store";
import { PetState } from "../shared/types";
import { DAILY_TASKS, DEFAULT_PET_NAME, DEFAULT_SCALE } from "../shared/petConfig";

const store = new Store<{ pet: PetState }>({ name: "deskpet-save" });

export function loadState(): PetState {
  const existing = store.get("pet");
  if (existing) {
    if (typeof existing.scale !== "number") existing.scale = DEFAULT_SCALE;
    return existing;
  }
  const fresh = createDefaultState();
  store.set("pet", fresh);
  return fresh;
}

export function saveState(state: PetState): void {
  store.set("pet", state);
}

export function createDefaultState(): PetState {
  const now = Date.now();
  return {
    name: DEFAULT_PET_NAME,
    stage: 1,
    level: 1,
    exp: 0,
    coins: 30,
    hunger: 80,
    cleanliness: 80,
    mood: 80,
    energy: 80,
    isSleeping: false,
    isWorking: false,
    workEndsAt: null,
    equipped: {},
    inventory: { berry: 2, bubblesoap: 1 },
    dailyTasks: DAILY_TASKS.map((t) => ({ id: t.id, progress: 0, target: t.target, claimed: false })),
    dailyResetAt: nextMidnight(now),
    lastTickAt: now,
    position: null,
    scale: DEFAULT_SCALE,
  };
}

export function nextMidnight(fromMs: number): number {
  const d = new Date(fromMs);
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}
