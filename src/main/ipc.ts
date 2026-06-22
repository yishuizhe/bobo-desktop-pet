import { ipcMain, Menu } from "electron";
import { PetEngine } from "./gameLoop";
import { getPanelWindow, getPetWindow, resizePetWindow, showPanelWindow } from "./windows";
import { buildPetMenuTemplate } from "./petMenu";

export function registerIpcHandlers(engine: PetEngine): void {
  ipcMain.handle("pet:getState", () => engine.getState());

  ipcMain.handle("pet:doAction", (_e, action) => engine.performAction(action));

  ipcMain.handle("pet:buyItem", (_e, itemId: string) => engine.buyItem(itemId));

  ipcMain.handle("pet:equipItem", (_e, slot: "hat" | "color", itemId: string | null) =>
    engine.equipItem(slot, itemId)
  );

  ipcMain.handle("pet:claimTask", (_e, taskId: string) => engine.claimTask(taskId));

  ipcMain.on("pet:openPanel", () => showPanelWindow());

  ipcMain.on("pet:setIgnoreMouse", (_e, ignore: boolean) => {
    const win = getPetWindow();
    win?.setIgnoreMouseEvents(ignore, { forward: true });
  });

  ipcMain.on("pet:movePetWindow", (_e, dx: number, dy: number) => {
    const win = getPetWindow();
    if (!win) return;
    const [x, y] = win.getPosition();
    const newX = x + dx;
    const newY = y + dy;
    win.setPosition(newX, newY);
    engine.setPosition(newX, newY);
  });

  ipcMain.handle("pet:setScale", (_e, scale: number) => {
    const state = engine.setScale(scale);
    resizePetWindow(state.scale);
    return state;
  });

  ipcMain.on("pet:showContextMenu", () => {
    const win = getPetWindow();
    const menu = Menu.buildFromTemplate(buildPetMenuTemplate(engine));
    if (win) menu.popup({ window: win });
  });

  engine.onChange((state) => {
    getPetWindow()?.webContents.send("pet:stateChanged", state);
    getPanelWindow()?.webContents.send("pet:stateChanged", state);
  });
}
