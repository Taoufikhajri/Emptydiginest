import type { OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

const styles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  delivered: "bg-signal-emerald/10 text-signal-emerald",
  cancelled: "bg-secondary text-muted-foreground",
  refunded: "bg-rose-100 text-rose-800",
};

const labels: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  paid: "Paid, preparing delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function OrderStatusBadge({ status, short = false }: { status: OrderStatus; short?: boolean }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", styles[status])}>
      {short ? status[0].toUpperCase() + status.slice(1) : labels[status]}
    </span>
  );
}
