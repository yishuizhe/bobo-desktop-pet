import React from "react";
import { PetState } from "../../shared/types";
import { DAILY_TASKS } from "../../shared/petConfig";

export default function Tasks({ state }: { state: PetState }): React.ReactElement {
  return (
    <div className="panel-section">
      <h3>每日任务</h3>
      <ul className="task-list">
        {state.dailyTasks.map((task) => {
          const def = DAILY_TASKS.find((d) => d.id === task.id)!;
          const done = task.progress >= task.target;
          return (
            <li key={task.id} className="task-row">
              <div>
                <div>{def.label}</div>
                <div className="task-progress">
                  {task.progress}/{task.target} · 奖励 🪙{def.rewardCoins} + 经验{def.rewardExp}
                </div>
              </div>
              <button disabled={!done || task.claimed} onClick={() => window.petApi.claimTask(task.id)}>
                {task.claimed ? "已领取" : done ? "领取" : "进行中"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
