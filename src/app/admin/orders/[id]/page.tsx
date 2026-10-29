import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderUpdateForm } from "@/components/admin/order-update-form";
import { PageHeader, Panel } from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { queryOne } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { getOrderItems, toOrder } from "@/lib/queries";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const row = Number.isInteger(id) ? await queryOne<Parameters<typeof toOrder>[0]>("SELECT * FROM orders WHERE id = $1", [id]) : null;
  if (!row) notFound();
  const order = toOrder(row);
  const items = await getOrderItems(order.id);
  const customer = order.userId
    ? await queryOne<{ name: string }>("SELECT name FROM users WHERE id = $1", [order.userId])
    : null;

  const details = [
    ["Customer", customer ? `${customer.name} (${order.email})` : order.email],
    ["Placed", order.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })],
    ["Paid", order.paidAt ? order.paidAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "Not yet"],
    ["Payment provider", order.paymentProvider],
    ["Provider reference", order.paymentRef ?? "None (demo mode or not started)"],
    ["Amount charged", order.paymentAmount ?? formatPrice(order.totalCents)],
  ];

  return (
    <>
      <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">
        ← All orders
      </Link>
      <PageHeader
        title={`Order ${order.publicId}`}
        actions={
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <Link href={`/orders/${order.publicId}`} className="text-sm font-semibold text-primary hover:underline">
              Customer view
            </Link>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Panel>
            <h2 className="border-b border-border px-5 py-4 font-semibold">Items</h2>
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <span>
                    {item.productId ? (
                      <Link href={`/admin/products/${item.productId}`} className="font-medium hover:text-primary">
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                    <span className="text-muted-foreground">
                      {" "}
                      × {item.quantity} at {formatPrice(item.unitPriceCents)}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">{formatPrice(item.unitPriceCents * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-border px-5 py-4 font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
            </div>
          </Panel>
          <Panel className="p-5">
            <h2 className="font-semibold">Details</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[180px_1fr]">
              {details.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="break-all">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
        <Panel className="h-fit p-5">
          <h2 className="mb-4 font-semibold">Fulfil order</h2>
          <OrderUpdateForm id={order.id} status={order.status} deliveryNote={order.deliveryNote} />
        </Panel>
      </div>
    </>
  );
}
