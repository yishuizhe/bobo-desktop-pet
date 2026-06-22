import React from "react";
import { PetState } from "../../shared/types";
import { SHOP_ITEMS } from "../../shared/petConfig";

export default function FeedMenu({ state }: { state: PetState }): React.ReactElement {
  const foodItems = SHOP_ITEMS.filter((i) => i.category === "food" && (state.inventory[i.id] ?? 0) > 0);
  const cleanItems = SHOP_ITEMS.filter((i) => i.category === "clean" && (state.inventory[i.id] ?? 0) > 0);

  return (
    <div className="panel-section">
      <h3>喂食</h3>
      {foodItems.length === 0 && <p className="empty-hint">背包没有食物了，去商店买一点吧</p>}
      <div className="item-grid">
        {foodItems.map((item) => (
          <button key={item.id} className="item-card" onClick={() => window.petApi.doAction({ type: "feed", itemId: item.id })}>
            <span className="emoji">{item.emoji}</span>
            <span>{item.name}</span>
            <span className="count">x{state.inventory[item.id]}</span>
          </button>
        ))}
      </div>

      <h3>清洁</h3>
      {cleanItems.length === 0 && <p className="empty-hint">背包没有清洁用品了，去商店买一点吧</p>}
      <div className="item-grid">
        {cleanItems.map((item) => (
          <button key={item.id} className="item-card" onClick={() => window.petApi.doAction({ type: "clean", itemId: item.id })}>
            <span className="emoji">{item.emoji}</span>
            <span>{item.name}</span>
            <span className="count">x{state.inventory[item.id]}</span>
          </button>
        ))}
      </div>

      <h3>休息</h3>
      <div className="row-buttons">
        {!state.isSleeping ? (
          <button onClick={() => window.petApi.doAction({ type: "sleep" })}>😴 哄睡</button>
        ) : (
          <button onClick={() => window.petApi.doAction({ type: "wake" })}>☀️ 叫醒</button>
        )}
      </div>
    </div>
  );
}
