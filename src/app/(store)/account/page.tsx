import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/money";
import { getOrdersForUser } from "@/lib/queries";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const orders = await getOrdersForUser(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Hi, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background"
            >
              <LayoutDashboard className="size-4" />
              Admin dashboard
            </Link>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-[-0.03em]">My orders</h2>
        {orders.length === 0 ? (
          <div className="mt-4 rounded-[28px] bg-card px-6 py-12 text-center">
            <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            <Link href="/products" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              Browse the catalog
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border/70 rounded-[28px] bg-card px-4 sm:px-6">
            {orders.map((order) => (
              <li key={order.id}>
                <Link href={`/orders/${order.publicId}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4 hover:text-primary">
                  <span className="font-mono text-sm font-semibold">{order.publicId}</span>
                  <span className="text-sm text-muted-foreground">
                    {order.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                  </span>
                  <span className="ms-auto flex items-center gap-3">
                    <OrderStatusBadge status={order.status} short />
                    <span className="w-20 text-end text-sm font-semibold tabular-nums">{formatPrice(order.totalCents)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
