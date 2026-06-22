import { PetState } from "../shared/types";
import { SHOP_ITEMS } from "../shared/petConfig";

const stage = document.getElementById("stage") as HTMLDivElement;
const creature = document.getElementById("creature") as unknown as SVGSVGElement;
const eyeL = document.getElementById("eyeL")!;
const eyeR = document.getElementById("eyeR")!;
const mouth = document.getElementById("mouth")!;
const hatEmoji = document.getElementById("hatEmoji")!;
const bubble = document.getElementById("bubble") as HTMLDivElement;
const bodyGradTop = document.getElementById("bodyGradTop")!;
const bodyGradBottom = document.getElementById("bodyGradBottom")!;
const earL = document.getElementById("earL")!;
const earR = document.getElementById("earR")!;
const footL = document.getElementById("footL")!;
const footR = document.getElementById("footR")!;
const armL = document.getElementById("armL")!;
const armR = document.getElementById("armR")!;

function clamp255(v: number): number {
  return Math.max(0, Math.min(255, v));
}

function shade(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r0 = (num >> 16) & 255;
  const g0 = (num >> 8) & 255;
  const b0 = num & 255;
  const mix = (c: number) => (percent >= 0 ? clamp255(c + (255 - c) * (percent / 100)) : clamp255(c * (1 + percent / 100)));
  return `rgb(${Math.round(mix(r0))}, ${Math.round(mix(g0))}, ${Math.round(mix(b0))})`;
}

let currentState: PetState | null = null;
let isDragging = false;
let happyOverlayTimer: ReturnType<typeof setTimeout> | null = null;
let wanderTimer: ReturnType<typeof setTimeout> | null = null;
let blinkTimer: ReturnType<typeof setInterval> | null = null;
let bubbleTimer: ReturnType<typeof setTimeout> | null = null;

const PHRASES = [
  "今天也要元气满满！",
  "摸摸头~",
  "肚子有点饿了…",
  "波波在认真发呆",
  "要不要一起玩？",
  "感觉身上黏糊糊的~",
  "波波最喜欢你啦",
  "今天的任务做了吗？",
];

function setActivityClass(name: string): void {
  stage.className = name;
}

function computeBaseActivity(state: PetState): string {
  if (state.isSleeping) return "sleep";
  if (state.isWorking) return "work";
  if (state.mood < 30) return "sad";
  return "idle";
}

function applyVisuals(state: PetState): void {
  const colorItem = state.equipped.color ? SHOP_ITEMS.find((i) => i.id === state.equipped.color) : null;
  const base = colorItem?.colorValue ?? "#7fd9b6";
  bodyGradTop.setAttribute("stop-color", shade(base, 25));
  bodyGradBottom.setAttribute("stop-color", shade(base, -10));
  const darker = shade(base, -22);
  for (const el of [earL, earR, footL, footR]) (el as unknown as SVGElement).style.fill = darker;
  for (const el of [armL, armR]) (el as unknown as SVGElement).style.fill = base;

  const hatItem = state.equipped.hat ? SHOP_ITEMS.find((i) => i.id === state.equipped.hat) : null;
  hatEmoji.textContent = hatItem?.emoji ?? "";

  if (state.mood >= 60) {
    mouth.setAttribute("d", "M86 138 Q93 148 100 139 Q107 148 114 138");
  } else if (state.mood >= 30) {
    mouth.setAttribute("d", "M90 142 Q100 146 110 142");
  } else {
    mouth.setAttribute("d", "M90 146 Q100 138 110 146");
  }
}

function render(state: PetState): void {
  currentState = state;
  applyVisuals(state);
  if (!isDragging && happyOverlayTimer === null) {
    setActivityClass(computeBaseActivity(state));
  }
}

function showBubble(text: string): void {
  bubble.textContent = text;
  bubble.classList.remove("hidden");
  if (bubbleTimer) clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.add("hidden"), 2200);
}

function triggerHappyOverlay(): void {
  if (happyOverlayTimer) clearTimeout(happyOverlayTimer);
  setActivityClass("happy");
  happyOverlayTimer = setTimeout(() => {
    happyOverlayTimer = null;
    if (currentState) setActivityClass(computeBaseActivity(currentState));
  }, 900);
}

function blinkOnce(): void {
  eyeL.style.transform = "scaleY(0.1)";
  eyeR.style.transform = "scaleY(0.1)";
  setTimeout(() => {
    eyeL.style.transform = "scaleY(1)";
    eyeR.style.transform = "scaleY(1)";
  }, 130);
}

function startBlinking(): void {
  blinkTimer = setInterval(() => {
    if (currentState && !currentState.isSleeping) blinkOnce();
  }, 3200 + Math.random() * 1800);
}

function scheduleWander(): void {
  const delay = 4000 + Math.random() * 6000;
  wanderTimer = setTimeout(() => {
    if (!isDragging && currentState && !currentState.isSleeping && !currentState.isWorking) {
      const dx = (Math.random() - 0.5) * 60;
      window.petApi.movePetWindow(Math.round(dx), 0);
      setActivityClass("walk");
      setTimeout(() => {
        if (currentState && !isDragging) setActivityClass(computeBaseActivity(currentState));
      }, 900);
    }
    scheduleWander();
  }, delay);
}

// Mouse passthrough: only the creature circle should capture clicks.
function isOverCreature(clientX: number, clientY: number): boolean {
  const rect = creature.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const r = rect.width / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  return dx * dx + dy * dy <= r * r;
}

document.addEventListener("mousemove", (e) => {
  if (isDragging) return;
  const hovering = isOverCreature(e.clientX, e.clientY);
  window.petApi.setIgnoreMouse(!hovering);
});

let dragStartX = 0;
let dragStartY = 0;
let didDrag = false;

document.addEventListener("mousedown", (e) => {
  if (!isOverCreature(e.clientX, e.clientY)) return;
  isDragging = true;
  didDrag = false;
  dragStartX = e.screenX;
  dragStartY = e.screenY;
  setActivityClass("drag");
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const dx = e.movementX;
  const dy = e.movementY;
  if (Math.abs(e.screenX - dragStartX) > 3 || Math.abs(e.screenY - dragStartY) > 3) {
    didDrag = true;
  }
  if (dx !== 0 || dy !== 0) {
    window.petApi.movePetWindow(dx, dy);
  }
});

document.addEventListener("mouseup", (e) => {
  if (!isDragging) return;
  isDragging = false;
  if (currentState) setActivityClass(computeBaseActivity(currentState));
  if (!didDrag && isOverCreature(e.clientX, e.clientY)) {
    handleClick();
  }
});

function handleClick(): void {
  window.petApi.doAction({ type: "poke" });
  triggerHappyOverlay();
  showBubble(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
}

document.addEventListener("dblclick", (e) => {
  if (isOverCreature(e.clientX, e.clientY)) {
    window.petApi.openPanel();
  }
});

document.addEventListener("contextmenu", (e) => {
  if (isOverCreature(e.clientX, e.clientY)) {
    window.petApi.showContextMenu();
  }
});

async function init(): Promise<void> {
  const state = await window.petApi.getState();
  render(state);
  window.petApi.onStateChanged(render);
  startBlinking();
  scheduleWander();
  setTimeout(() => showBubble("右键我可以调大小，双击打开喂养面板~"), 1200);
}

init();
