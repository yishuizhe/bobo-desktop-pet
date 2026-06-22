import { MenuItemConstructorOptions } from "electron";
import { PetEngine } from "./gameLoop";
import { resizePetWindow, showPanelWindow } from "./windows";
import { SCALE_PRESETS } from "../shared/petConfig";

export function buildPetMenuTemplate(engine: PetEngine): MenuItemConstructorOptions[] {
  const currentScale = engine.getState().scale;
  return [
    { label: "打开面板（喂食/商店/打工/任务…）", click: () => showPanelWindow() },
    {
      label: "投喂一个野莓",
      click: () => engine.performAction({ type: "feed", itemId: "berry" }),
    },
    { type: "separator" },
    {
      label: "波波大小",
      submenu: SCALE_PRESETS.map((preset) => ({
        label: preset.label,
        type: "radio",
        checked: Math.abs(currentScale - preset.value) < 0.01,
        click: () => {
          engine.setScale(preset.value);
          resizePetWindow(preset.value);
        },
      })),
    },
  ];
}
