import React from "react";
import { PetState } from "../../shared/types";
import { expForNextLevel } from "../../shared/petConfig";

function Bar({ label, value, color }: { label: string; value: number; color: string }): React.ReactElement {
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function StatusBar({ state }: { state: PetState }): React.ReactElement {
  const needed = expForNextLevel(state.level);
  return (
    <div className="status-bar">
      <div className="status-header">
        <div>
          <strong>{state.name}</strong> · Lv.{state.level} · 第{state.stage}阶段
        </div>
        <div className="coins">🪙 {state.coins}</div>
      </div>
      <Bar label="饥饿" value={state.hunger} color="#f0a85a" />
      <Bar label="清洁" value={state.cleanliness} color="#6fc3e8" />
      <Bar label="心情" value={state.mood} color="#ff9fa8" />
      <Bar label="体力" value={state.energy} color="#9fd887" />
      <div className="exp-row">
        经验 {state.exp} / {needed}
        {state.isSleeping && <span className="tag">睡眠中</span>}
        {state.isWorking && <span className="tag">打工中</span>}
      </div>
    </div>
  );
}
