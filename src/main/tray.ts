import { Tray, Menu, app, nativeImage } from "electron";
import path from "path";
import { PetEngine } from "./gameLoop";
import { getPetWindow, togglePetVisibility } from "./windows";
import { buildPetMenuTemplate } from "./petMenu";

let tray: Tray | null = null;

export function createTray(engine: PetEngine): Tray {
  const iconPath = path.join(__dirname, "../../build/tray-icon.png");
  let image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) {
    image = nativeImage.createEmpty();
  }
  tray = new Tray(image.resize({ width: 16, height: 16 }));
  tray.setToolTip("波波桌宠");

  const rebuildMenu = () => {
    const loginEnabled = app.getLoginItemSettings().openAtLogin;
    const petVisible = getPetWindow()?.isVisible() ?? true;
    const menu = Menu.buildFromTemplate([
      ...buildPetMenuTemplate(engine),
      { label: petVisible ? "隐藏波波" : "显示波波", click: () => togglePetVisibility() },
      { type: "separator" },
      {
        label: "开机自启",
        type: "checkbox",
        checked: loginEnabled,
        click: (item) => {
          app.setLoginItemSettings({ openAtLogin: item.checked });
        },
      },
      { type: "separator" },
      { label: "退出", click: () => app.quit() },
    ]);
    tray?.setContextMenu(menu);
  };

  rebuildMenu();
  tray.on("click", () => {
    rebuildMenu();
    const win = getPetWindow();
    if (win) {
      win.show();
      win.focus();
    }
  });
  tray.on("right-click", rebuildMenu);

  return tray;
}
