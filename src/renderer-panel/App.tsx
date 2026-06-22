import React, { useEffect, useState } from "react";
import { PetState } from "../shared/types";
import StatusBar from "./components/StatusBar";
import FeedMenu from "./components/FeedMenu";
import Shop from "./components/Shop";
import Backpack from "./components/Backpack";
import Work from "./components/Work";
import Tasks from "./components/Tasks";
import MiniGame from "./components/MiniGame";
import Settings from "./components/Settings";

type Tab = "care" | "work" | "shop" | "backpack" | "tasks" | "minigame" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "care", label: "喂养护理" },
  { id: "work", label: "打工" },
  { id: "shop", label: "商店" },
  { id: "backpack", label: "背包" },
  { id: "tasks", label: "每日任务" },
  { id: "minigame", label: "接星星" },
  { id: "settings", label: "设置" },
];

export default function App(): React.ReactElement {
  const [state, setState] = useState<PetState | null>(null);
  const [tab, setTab] = useState<Tab>("care");

  useEffect(() => {
    window.petApi.getState().then(setState);
    const unsubscribe = window.petApi.onStateChanged(setState);
    return unsubscribe;
  }, []);

  if (!state) return <div className="loading">加载中…</div>;

  return (
    <div className="app">
      <StatusBar state={state} />
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      <div className="tab-content">
        {tab === "care" && <FeedMenu state={state} />}
        {tab === "work" && <Work state={state} />}
        {tab === "shop" && <Shop state={state} />}
        {tab === "backpack" && <Backpack state={state} />}
        {tab === "tasks" && <Tasks state={state} />}
        {tab === "minigame" && <MiniGame state={state} />}
        {tab === "settings" && <Settings state={state} />}
      </div>
    </div>
  );
}
