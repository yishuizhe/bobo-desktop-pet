import React from "react";
import { PetState } from "../../shared/types";
import { SHOP_ITEMS } from "../../shared/petConfig";

export default function Backpack({ state }: { state: PetState }): React.ReactElement {
  const hats = SHOP_ITEMS.filter((i) => i.category === "hat" && (state.inventory[i.id] ?? 0) > 0);
  const colors = SHOP_ITEMS.filter((i) => i.category === "color" && (state.inventory[i.id] ?? 0) > 0);
  const consumables = SHOP_ITEMS.filter(
    (i) => (i.category === "food" || i.category === "clean") && (state.inventory[i.id] ?? 0) > 0
  );

  return (
    <div className="panel-section">
      <h3>帽子</h3>
      <div className="item-grid">
        <button className={!state.equipped.hat ? "item-card active" : "item-card"} onClick={() => window.petApi.equipItem("hat", null)}>
          <span className="emoji">🚫</span>
          <span>不戴</span>
        </button>
        {hats.map((item) => (
          <button
            key={item.id}
            className={state.equipped.hat === item.id ? "item-card active" : "item-card"}
            onClick={() => window.petApi.equipItem("hat", item.id)}
          >
            <span className="emoji">{item.emoji}</span>
            <span>{item.name}</span>
          </button>
        ))}
        {hats.length === 0 && <p className="empty-hint">商店购买帽子后会出现在这里</p>}
      </div>

      <h3>配色</h3>
      <div className="item-grid">
        <button className={!state.equipped.color ? "item-card active" : "item-card"} onClick={() => window.petApi.equipItem("color", null)}>
          <span className="emoji">🟢</span>
          <span>原色</span>
        </button>
        {colors.map((item) => (
          <button
            key={item.id}
            className={state.equipped.color === item.id ? "item-card active" : "item-card"}
            onClick={() => window.petApi.equipItem("color", item.id)}
          >
            <span className="emoji">{item.emoji}</span>
            <span>{item.name}</span>
          </button>
        ))}
        {colors.length === 0 && <p className="empty-hint">商店购买配色后会出现在这里</p>}
      </div>

      <h3>消耗品库存</h3>
      <div className="item-grid">
        {consumables.map((item) => (
          <div key={item.id} className="item-card static">
            <span className="emoji">{item.emoji}</span>
            <span>{item.name}</span>
            <span className="count">x{state.inventory[item.id]}</span>
          </div>
        ))}
        {consumables.length === 0 && <p className="empty-hint">背包是空的</p>}
      </div>
    </div>
  );
}
