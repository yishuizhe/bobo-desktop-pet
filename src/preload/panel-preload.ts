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
  buyItem: (itemId: string): Promise<PetState> => ipcRenderer.invoke("pet:buyItem", itemId),
  equipItem: (slot: "hat" | "color", itemId: string | null): Promise<PetState> =>
    ipcRenderer.invoke("pet:equipItem", slot, itemId),
  claimTask: (taskId: string): Promise<PetState> => ipcRenderer.invoke("pet:claimTask", taskId),
  setScale: (scale: number): Promise<PetState> => ipcRenderer.invoke("pet:setScale", scale),
});
