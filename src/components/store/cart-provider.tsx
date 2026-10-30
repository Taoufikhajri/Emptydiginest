"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  priceCents: number;
  icon: string;
  iconColor: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  totalCents: number;
  ready: boolean;
  currency: string;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "dn_cart";
const CLEAR_CART_COOKIE = "dn_clear_cart";
const MAX_QUANTITY = 20;

const CartContext = createContext<CartContextValue | null>(null);

const readStoredCart = (): CartItem[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
};

const consumeClearCartCookie = () => {
  if (!document.cookie.split("; ").some((cookie) => cookie === `${CLEAR_CART_COOKIE}=1`)) return false;
  document.cookie = `${CLEAR_CART_COOKIE}=; path=/; max-age=0`;
  return true;
};

export function CartProvider({ currency, children }: { currency: string; children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Load after mount so server and client render the same empty cart first.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from browser storage
    setItems(consumeClearCartCookie() ? [] : readStoredCart());
    setReady(true);
  }, []);

  // The server sets the cookie after an order is placed. Checking on every route change also covers
  // client-side redirects from the checkout action, where this provider doesn't remount.
  const pathname = usePathname();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with a server-set cookie
    if (consumeClearCartCookie()) setItems([]);
  }, [pathname]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback<CartContextValue["add"]>((item, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.productId === item.productId);
      if (existing) {
        return current.map((entry) =>
          entry.productId === item.productId
            ? { ...entry, ...item, quantity: Math.min(entry.quantity + quantity, MAX_QUANTITY) }
            : entry,
        );
      }
      return [...current, { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }];
    });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((entry) => entry.productId !== productId)
        : current.map((entry) =>
            entry.productId === productId ? { ...entry, quantity: Math.min(quantity, MAX_QUANTITY) } : entry,
          ),
    );
  }, []);

  const remove = useCallback((productId: number) => {
    setItems((current) => current.filter((entry) => entry.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      currency,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      totalCents: items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [items, ready, currency, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
