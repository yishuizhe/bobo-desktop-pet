import React from "react";
import { PetState, ShopCategory } from "../../shared/types";
import { SHOP_ITEMS } from "../../shared/petConfig";

const CATEGORY_LABELS: Record<ShopCategory, string> = {
  food: "食物",
  clean: "清洁用品",
  hat: "帽子",
  color: "配色",
};

export default function Shop({ state }: { state: PetState }): React.ReactElement {
  const categories: ShopCategory[] = ["food", "clean", "hat", "color"];

  return (
    <div className="panel-section">
      <h3>商店</h3>
      {categories.map((cat) => (
        <div key={cat}>
          <h4>{CATEGORY_LABELS[cat]}</h4>
          <div className="item-grid">
            {SHOP_ITEMS.filter((i) => i.category === cat).map((item) => {
              const owned = state.inventory[item.id] ?? 0;
              const affordable = state.coins >= item.price;
              const alreadyOwnedCosmetic = (item.category === "hat" || item.category === "color") && owned > 0;
              return (
                <button
                  key={item.id}
                  className="item-card"
                  disabled={!affordable || alreadyOwnedCosmetic}
                  onClick={() => window.petApi.buyItem(item.id)}
                >
                  <span className="emoji">{item.emoji}</span>
                  <span>{item.name}</span>
                  <span className="count">
                    {alreadyOwnedCosmetic ? "已拥有" : `🪙${item.price}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
