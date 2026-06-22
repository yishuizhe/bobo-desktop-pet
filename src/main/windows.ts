import { BrowserWindow, screen } from "electron";
import path from "path";

const isDev = process.env.NODE_ENV === "development";
const DEV_SERVER_URL = "http://localhost:5173";

export const BASE_PET_SIZE = 220;

let petWindow: BrowserWindow | null = null;
let panelWindow: BrowserWindow | null = null;

export function createPetWindow(initialPos: { x: number; y: number } | null, scale: number): BrowserWindow {
  const display = screen.getPrimaryDisplay();
  const { width: sw, height: sh } = display.workArea;
  const size = Math.round(BASE_PET_SIZE * scale);
  const x = initialPos?.x ?? Math.round(sw - size - 40);
  const y = initialPos?.y ?? Math.round(sh - size - 20);

  petWindow = new BrowserWindow({
    width: size,
    height: size,
    x,
    y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/pet-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWindow.setAlwaysOnTop(true, "screen-saver");

  if (isDev) {
    petWindow.loadURL(`${DEV_SERVER_URL}/renderer-pet/index.html`);
  } else {
    petWindow.loadFile(path.join(__dirname, "../renderer-pet/index.html"));
  }

  petWindow.on("closed", () => {
    petWindow = null;
  });

  return petWindow;
}

export function createPanelWindow(): BrowserWindow {
  panelWindow = new BrowserWindow({
    width: 420,
    height: 600,
    show: false,
    title: "波波桌宠",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/panel-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    panelWindow.loadURL(`${DEV_SERVER_URL}/renderer-panel/index.html`);
  } else {
    panelWindow.loadFile(path.join(__dirname, "../renderer-panel/index.html"));
  }

  panelWindow.on("close", (e) => {
    e.preventDefault();
    panelWindow?.hide();
  });

  return panelWindow;
}

export function getPetWindow(): BrowserWindow | null {
  return petWindow;
}

export function getPanelWindow(): BrowserWindow | null {
  return panelWindow;
}

export function showPanelWindow(): void {
  if (!panelWindow) return;
  panelWindow.show();
  panelWindow.focus();
}

export function togglePetVisibility(): void {
  if (!petWindow) return;
  if (petWindow.isVisible()) petWindow.hide();
  else petWindow.show();
}

export function resizePetWindow(scale: number): void {
  if (!petWindow) return;
  const size = Math.round(BASE_PET_SIZE * scale);
  const [x, y] = petWindow.getPosition();
  petWindow.setBounds({ x, y, width: size, height: size });
}
