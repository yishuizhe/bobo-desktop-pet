import { app, BrowserWindow } from "electron";
import { PetEngine } from "./gameLoop";
import { createPanelWindow, createPetWindow } from "./windows";
import { createTray } from "./tray";
import { registerIpcHandlers } from "./ipc";

let engine: PetEngine;

function bootstrap(): void {
  engine = new PetEngine();
  registerIpcHandlers(engine);

  const state = engine.getState();
  createPetWindow(state.position, state.scale);
  createPanelWindow();
  createTray(engine);

  engine.start();
}

app.whenReady().then(bootstrap);

app.on("window-all-closed", () => {
  // Pet window stays alive via tray; keep app running on all platforms.
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    bootstrap();
  }
});

app.on("before-quit", () => {
  engine?.stop();
});
