export type PetStage = 1 | 2 | 3;

export type PetActivity =
  | "idle"
  | "walk"
  | "sleep"
  | "eat"
  | "clean"
  | "happy"
  | "sad"
  | "work"
  | "drag";

export interface EquippedItems {
  hat?: string;
  color?: string;
}

export interface InventoryMap {
  [itemId: string]: number;
}

export interface DailyTaskProgress {
  id: string;
  progress: number;
  target: number;
  claimed: boolean;
}

export interface PetState {
  name: string;
  stage: PetStage;
  level: number;
  exp: number;
  coins: number;

  hunger: number;
  cleanliness: number;
  mood: number;
  energy: number;

  isSleeping: boolean;
  isWorking: boolean;
  workEndsAt: number | null;

  equipped: EquippedItems;
  inventory: InventoryMap;

  dailyTasks: DailyTaskProgress[];
  dailyResetAt: number;
  lastTickAt: number;

  position: { x: number; y: number } | null;
  scale: number;
}

export type ShopCategory = "food" | "clean" | "hat" | "color";

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  price: number;
  emoji: string;
  effect?: {
    hunger?: number;
    cleanliness?: number;
    mood?: number;
  };
  colorValue?: string;
}

export interface DailyTaskDef {
  id: string;
  label: string;
  target: number;
  rewardCoins: number;
  rewardExp: number;
}

export type PetAction =
  | { type: "feed"; itemId: string }
  | { type: "clean"; itemId: string }
  | { type: "sleep" }
  | { type: "wake" }
  | { type: "startWork" }
  | { type: "poke" }
  | { type: "minigameResult"; coins: number; exp: number };

export interface PetApi {
  getState(): Promise<PetState>;
  onStateChanged(cb: (state: PetState) => void): () => void;
  doAction(action: PetAction): Promise<PetState>;
  buyItem(itemId: string): Promise<PetState>;
  equipItem(slot: "hat" | "color", itemId: string | null): Promise<PetState>;
  claimTask(taskId: string): Promise<PetState>;
  openPanel(): void;
  setIgnoreMouse(ignore: boolean): void;
  movePetWindow(dx: number, dy: number): void;
  setScale(scale: number): Promise<PetState>;
  showContextMenu(): void;
}
