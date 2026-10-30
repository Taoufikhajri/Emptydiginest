"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/money";
import { heroCardActions, MAX_HERO_CARDS, type HeroCard } from "@/lib/settings-shared";
import { cn } from "@/lib/utils";
import { inputClass, secondaryButtonClass } from "./ui";

export type HeroCardProduct = { id: number; name: string; priceCents: number };

type HeroCardsEditorProps = {
  initialCards: HeroCard[];
  products: HeroCardProduct[];
  currency: string;
  storeName: string;
};

const iconButtonClass =
  "grid size-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40";

// Edits the rotating hero cards; the list is sent with the settings form as JSON.
export function HeroCardsEditor({ initialCards, products, currency, storeName }: HeroCardsEditorProps) {
  const [cards, setCards] = useState(initialCards);

  const update = (index: number, patch: Partial<HeroCard>) =>
    setCards((current) => current.map((card, i) => (i === index ? { ...card, ...patch } : card)));
  const move = (index: number, delta: number) =>
    setCards((current) => {
      const next = [...current];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  const addCard = () =>
    setCards((current) => [
      ...current,
      { productId: products[current.length % Math.max(products.length, 1)]?.id ?? null, label: "", title: "", detail: "", action: "cart" },
    ]);

  return (
    <div className="space-y-3">
      <input type="hidden" name="heroCards" value={JSON.stringify(cards)} />
      <div>
        <p className="text-sm font-medium">Hero cards</p>
        <p className="text-xs text-muted-foreground">
          {cards.length === 0
            ? "No cards set: the hero shows an intro card and your featured products. Add cards to choose them yourself."
            : "Pick a product for each card. Empty text fields use the product's name and price."}
        </p>
      </div>

      {cards.map((card, index) => {
        const product = products.find((option) => option.id === card.productId);
        return (
          <div key={index} className="space-y-3 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Card {index + 1}</span>
              <div className="flex gap-1.5">
                <button type="button" aria-label="Move card up" disabled={index === 0} onClick={() => move(index, -1)} className={iconButtonClass}>
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Move card down"
                  disabled={index === cards.length - 1}
                  onClick={() => move(index, 1)}
                  className={iconButtonClass}
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Remove card"
                  onClick={() => setCards((current) => current.filter((_, i) => i !== index))}
                  className={cn(iconButtonClass, "hover:text-destructive")}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium">
                Product
                <select
                  value={card.productId ?? ""}
                  onChange={(event) => update(index, { productId: event.target.value ? Number(event.target.value) : null })}
                  className={inputClass}
                >
                  <option value="">No product (opens all products)</option>
                  {products.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium">
                When clicked
                <select
                  value={product ? card.action : "product"}
                  disabled={!product}
                  onChange={(event) => update(index, { action: event.target.value as HeroCard["action"] })}
                  className={inputClass}
                >
                  {heroCardActions.map((action) => (
                    <option key={action.id} value={action.id}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium">
                Small top text
                <input
                  value={card.label}
                  maxLength={40}
                  placeholder={storeName.toUpperCase()}
                  onChange={(event) => update(index, { label: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block text-xs font-medium">
                Title
                <input
                  value={card.title}
                  maxLength={80}
                  placeholder={product?.name ?? "Browse the catalog"}
                  onChange={(event) => update(index, { title: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block text-xs font-medium sm:col-span-2">
                Second line
                <input
                  value={card.detail}
                  maxLength={60}
                  placeholder={product ? formatPrice(product.priceCents, currency) : "All products"}
                  onChange={(event) => update(index, { detail: event.target.value })}
                  className={inputClass}
                />
              </label>
            </div>
          </div>
        );
      })}

      {cards.length < MAX_HERO_CARDS && (
        <button type="button" onClick={addCard} className={secondaryButtonClass}>
          <Plus className="size-4" />
          Add card
        </button>
      )}
    </div>
  );
}
