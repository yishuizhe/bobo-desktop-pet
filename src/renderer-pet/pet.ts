import { PetState } from "../shared/types";
import { SHOP_ITEMS } from "../shared/petConfig";

const stage = document.getElementById("stage") as HTMLDivElement;
const creature = document.getElementById("creature") as unknown as SVGSVGElement;
const mouth = document.getElementById("mouth")!;
const hatEmoji = document.getElementById("hatEmoji")!;
const bubble = document.getElementById("bubble") as HTMLDivElement;
const affection = document.getElementById("affection") as HTMLDivElement;
const bodyGradTop = document.getElementById("bodyGradTop")!;
const bodyGradMid = document.getElementById("bodyGradMid")!;
const bodyGradBottom = document.getElementById("bodyGradBottom")!;
const earL = document.getElementById("earL")!;
const earR = document.getElementById("earR")!;
const earInnerL = document.getElementById("earInnerL")!;
const earInnerR = document.getElementById("earInnerR")!;
const footL = document.getElementById("footL")!;
const footR = document.getElementById("footR")!;
const armL = document.getElementById("armL")!;
const armR = document.getElementById("armR")!;
const body = document.getElementById("body")!;
const bellyGradTop = document.getElementById("bellyGradTop")!;
const bellyGradBottom = document.getElementById("bellyGradBottom")!;
const tail = document.getElementById("tail")!;
const tailShine = document.getElementById("tailShine")!;
const sproutStem = document.getElementById("sproutStem")!;
const pupilL = document.getElementById("pupilL")!;
const pupilR = document.getElementById("pupilR")!;
const cheekL = document.getElementById("cheekL")!;
const cheekR = document.getElementById("cheekR")!;

type ActivityClass = "idle" | "walk" | "sleep" | "work" | "sad" | "happy" | "drag";

const ACTIVITY_CLASSES: ActivityClass[] = ["idle", "walk", "sleep", "work", "sad", "happy", "drag"];

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
let blinkTimer: ReturnType<typeof setTimeout> | null = null;
let bubbleTimer: ReturnType<typeof setTimeout> | null = null;

const PHRASES = [
  "今天也要元气满满！",
  "摸摸头~",
  "波波在认真发呆",
  "要不要一起玩？",
  "波波最喜欢你啦",
  "今天的任务做了吗？",
  "尾巴停不下来啦",
  "刚刚看到星星了！",
];

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function setSvgStyle(el: Element, prop: string, value: string): void {
  (el as SVGElement).style.setProperty(prop, value);
}

function setActivityClass(name: ActivityClass): void {
  stage.classList.remove(...ACTIVITY_CLASSES);
  stage.classList.add(name);
}

function computeBaseActivity(state: PetState): ActivityClass {
  if (state.isSleeping) return "sleep";
  if (state.isWorking) return "work";
  if (state.mood < 30) return "sad";
  return "idle";
}

function applyVisuals(state: PetState): void {
  const colorItem = state.equipped.color ? SHOP_ITEMS.find((i) => i.id === state.equipped.color) : null;
  const base = colorItem?.colorValue ?? "#7fd9b6";
  stage.dataset.stage = String(state.stage);

  bodyGradTop.setAttribute("stop-color", shade(base, 42));
  bodyGradMid.setAttribute("stop-color", shade(base, 11));
  bodyGradBottom.setAttribute("stop-color", shade(base, -13));
  bellyGradTop.setAttribute("stop-color", shade("#fff5dd", state.mood >= 60 ? 8 : 0));
  bellyGradBottom.setAttribute("stop-color", shade("#f7d7b3", state.mood < 30 ? -8 : 0));

  const darker = shade(base, -22);
  const outline = shade(base, -56);
  for (const el of [earL, earR, footL, footR]) setSvgStyle(el, "fill", darker);
  for (const el of [armL, armR]) setSvgStyle(el, "fill", shade(base, 3));
  for (const el of [body, earL, earR, armL, armR, footL, footR]) setSvgStyle(el, "stroke", outline);
  setSvgStyle(tail, "stroke", shade(base, -15));
  setSvgStyle(tailShine, "stroke", shade(base, 58));
  setSvgStyle(sproutStem, "stroke", shade(base, -5));
  setSvgStyle(earInnerL, "fill", state.mood < 30 ? "#eeb6bf" : "#ffc2cc");
  setSvgStyle(earInnerR, "fill", state.mood < 30 ? "#eeb6bf" : "#ffc2cc");
  const cheekOpacity = state.mood >= 60 ? "0.76" : state.mood < 30 ? "0.3" : "0.58";
  cheekL.setAttribute("opacity", cheekOpacity);
  cheekR.setAttribute("opacity", cheekOpacity);

  const hatItem = state.equipped.hat ? SHOP_ITEMS.find((i) => i.id === state.equipped.hat) : null;
  hatEmoji.textContent = hatItem?.emoji ?? "";
  hatEmoji.setAttribute("y", hatItem ? "46" : "0");

  if (state.isSleeping) {
    mouth.setAttribute("d", "M96 145 C104 149 116 149 124 145");
  } else if (state.isWorking) {
    mouth.setAttribute("d", "M97 146 C104 143 116 143 123 146");
  } else if (state.mood >= 60) {
    mouth.setAttribute("d", "M94 143 C100 153 107 153 110 145 C113 153 120 153 126 143");
  } else if (state.mood >= 30) {
    mouth.setAttribute("d", "M96 146 C103 150 117 150 124 146");
  } else {
    mouth.setAttribute("d", "M94 151 C103 142 117 142 126 151");
  }
}

function render(state: PetState): void {
  currentState = state;
  applyVisuals(state);
  if (state.isSleeping) stage.classList.remove("blink");
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
  stage.classList.remove("show-love");
  void affection.offsetWidth;
  stage.classList.add("show-love");
  setActivityClass("happy");
  happyOverlayTimer = setTimeout(() => {
    stage.classList.remove("show-love");
    happyOverlayTimer = null;
    if (currentState) setActivityClass(computeBaseActivity(currentState));
  }, 900);
}

function blinkOnce(): void {
  if (!currentState || currentState.isSleeping) return;
  stage.classList.add("blink");
  setTimeout(() => {
    stage.classList.remove("blink");
  }, 120);
}

function startBlinking(): void {
  const scheduleNext = () => {
    blinkTimer = setTimeout(() => {
      blinkOnce();
      scheduleNext();
    }, 2600 + Math.random() * 2400);
  };
  scheduleNext();
}

function scheduleWander(): void {
  const delay = 4000 + Math.random() * 6000;
  wanderTimer = setTimeout(() => {
    if (!isDragging && happyOverlayTimer === null && currentState && !currentState.isSleeping && !currentState.isWorking) {
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

// Mouse passthrough: only the visible mascot area should capture clicks.
function isOverCreature(clientX: number, clientY: number): boolean {
  const rect = creature.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height * 0.55;
  const rx = rect.width * 0.47;
  const ry = rect.height * 0.47;
  const dx = (clientX - cx) / rx;
  const dy = (clientY - cy) / ry;
  return dx * dx + dy * dy <= 1.08;
}

function updateEyeFocus(clientX: number, clientY: number): void {
  if (currentState?.isSleeping) {
    resetEyeFocus();
    return;
  }
  const rect = creature.getBoundingClientRect();
  const nx = clamp(((clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
  const ny = clamp(((clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
  const transform = `translate(${(nx * 3.2).toFixed(1)}px, ${(ny * 2.6).toFixed(1)}px)`;
  setSvgStyle(pupilL, "transform", transform);
  setSvgStyle(pupilR, "transform", transform);
}

function resetEyeFocus(): void {
  setSvgStyle(pupilL, "transform", "translate(0, 0)");
  setSvgStyle(pupilR, "transform", "translate(0, 0)");
}

function choosePhrase(state: PetState | null): string {
  if (!state) return PHRASES[Math.floor(Math.random() * PHRASES.length)];
  if (state.isSleeping) return "嘘，波波正在做软乎乎的梦";
  if (state.isWorking) return "波波正在努力赚零花钱";
  if (state.hunger < 35) return "肚子咕噜咕噜了";
  if (state.cleanliness < 35) return "想洗个香香澡";
  if (state.energy < 30) return "电量快见底啦";
  if (state.mood < 30) return "想再被摸摸头";
  return PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

document.addEventListener("mousemove", (e) => {
  if (isDragging) return;
  updateEyeFocus(e.clientX, e.clientY);
  const hovering = isOverCreature(e.clientX, e.clientY);
  window.petApi.setIgnoreMouse(!hovering);
});

document.addEventListener("mouseleave", resetEyeFocus);

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
  showBubble(choosePhrase(currentState));
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
  setTimeout(() => showBubble("右键调大小，双击打开喂养面板"), 1200);
}

init();
