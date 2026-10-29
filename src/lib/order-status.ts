// Client-safe: no database imports, so client components can use it.
export type OrderStatus = "pending" | "paid" | "delivered" | "cancelled" | "refunded";

export const orderStatuses: OrderStatus[] = ["pending", "paid", "delivered", "cancelled", "refunded"];
