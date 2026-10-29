import Link from "next/link";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatPrice } from "@/lib/money";
import type { Order } from "@/lib/queries";

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-medium">Order</th>
            <th className="px-5 py-3 font-medium">Customer</th>
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Payment</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 text-end font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-secondary/60">
              <td className="px-5 py-3">
                <Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold text-primary hover:underline">
                  {order.publicId}
                </Link>
              </td>
              <td className="px-5 py-3">{order.email}</td>
              <td className="px-5 py-3 text-muted-foreground">
                {order.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
              </td>
              <td className="px-5 py-3 text-muted-foreground capitalize">{order.paymentProvider}</td>
              <td className="px-5 py-3">
                <OrderStatusBadge status={order.status} short />
              </td>
              <td className="px-5 py-3 text-end font-semibold tabular-nums">{formatPrice(order.totalCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
