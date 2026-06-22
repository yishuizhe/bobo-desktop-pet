import React from "react";
import { PetState } from "../../shared/types";
import { SCALE_PRESETS } from "../../shared/petConfig";

export default function Settings({ state }: { state: PetState }): React.ReactElement {
  return (
    <div className="panel-section">
      <h3>波波大小</h3>
      <p>桌面上的波波太大或太小，可以在这里调整（也可以在波波身上右键调整）。</p>
      <div className="item-grid">
        {SCALE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            className={Math.abs(state.scale - preset.value) < 0.01 ? "item-card active" : "item-card"}
            onClick={() => window.petApi.setScale(preset.value)}
          >
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      <h3>小提示</h3>
      <p>
        左键单击波波：互动 / 鼠标右键波波：弹出菜单（调大小、打开面板）/ 双击波波：打开本面板 / 拖拽波波：移动位置。
        点击系统托盘图标也能随时打开面板。
      </p>
    </div>
  );
}
