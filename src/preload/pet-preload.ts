import { contextBridge, ipcRenderer } from "electron";
import { PetAction, PetState } from "../shared/types";

contextBridge.exposeInMainWorld("petApi", {
  getState: (): Promise<PetState> => ipcRenderer.invoke("pet:getState"),
  onStateChanged: (cb: (state: PetState) => void) => {
    const handler = (_e: unknown, state: PetState) => cb(state);
    ipcRenderer.on("pet:stateChanged", handler);
    return () => ipcRenderer.removeListener("pet:stateChanged", handler);
  },
  doAction: (action: PetAction): Promise<PetState> => ipcRenderer.invoke("pet:doAction", action),
  openPanel: () => ipcRenderer.send("pet:openPanel"),
  setIgnoreMouse: (ignore: boolean) => ipcRenderer.send("pet:setIgnoreMouse", ignore),
  movePetWindow: (dx: number, dy: number) => ipcRenderer.send("pet:movePetWindow", dx, dy),
  setScale: (scale: number): Promise<PetState> => ipcRenderer.invoke("pet:setScale", scale),
  showContextMenu: () => ipcRenderer.send("pet:showContextMenu"),
});
