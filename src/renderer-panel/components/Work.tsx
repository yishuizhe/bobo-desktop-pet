import React, { useEffect, useState } from "react";
import { PetState } from "../../shared/types";
import { WORK_COIN_REWARD, WORK_DURATION_MS, WORK_ENERGY_COST, WORK_EXP_REWARD } from "../../shared/petConfig";

export default function Work({ state }: { state: PetState }): React.ReactElement {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = state.workEndsAt ? Math.max(0, state.workEndsAt - now) : 0;
  const remainingSec = Math.ceil(remainingMs / 1000);
  const canWork = !state.isWorking && !state.isSleeping && state.energy >= WORK_ENERGY_COST;

  return (
    <div className="panel-section">
      <h3>打工街</h3>
      <p>
        每次打工耗时 {Math.round(WORK_DURATION_MS / 60000)} 分钟，消耗 {WORK_ENERGY_COST} 体力，
        奖励 {WORK_COIN_REWARD} 金币 + {WORK_EXP_REWARD} 经验。
      </p>
      {state.isWorking ? (
        <div className="working-status">
          ⏳ 波波正在打工，剩余 {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, "0")}
        </div>
      ) : (
        <button disabled={!canWork} onClick={() => window.petApi.doAction({ type: "startWork" })}>
          {canWork ? "去打工" : state.isSleeping ? "波波睡着了" : "体力不足"}
        </button>
      )}
    </div>
  );
}
