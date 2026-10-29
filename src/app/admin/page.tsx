import Link from "next/link";
import { Clock, Package, Receipt, TrendingUp, Users } from "lucide-react";
import { OrdersTable } from "@/components/admin/orders-table";
import { PageHeader, Panel } from "@/components/admin/ui";
import { query, queryOne } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { toOrder } from "@/lib/queries";

export default async function AdminOverviewPage() {
  const [stats, recentRows] = await Promise.all([
    queryOne<{ revenue: number; orders: number; awaiting_delivery: number; customers: number; products: number }>(
      `SELECT
         (SELECT COALESCE(sum(total_cents), 0)::int FROM orders WHERE status IN ('paid', 'delivered')) AS revenue,
         (SELECT count(*)::int FROM orders) AS orders,
         (SELECT count(*)::int FROM orders WHERE status = 'paid') AS awaiting_delivery,
         (SELECT count(*)::int FROM users WHERE role = 'customer') AS customers,
         (SELECT count(*)::int FROM products WHERE active) AS products`,
    ),
    query<Parameters<typeof toOrder>[0]>("SELECT * FROM orders ORDER BY created_at DESC LIMIT 8"),
  ]);
  const recent = recentRows.map(toOrder);

  const cards = [
    { label: "Revenue", value: formatPrice(stats?.revenue ?? 0), icon: TrendingUp, href: "/admin/orders?status=delivered" },
    { label: "Awaiting delivery", value: stats?.awaiting_delivery ?? 0, icon: Clock, href: "/admin/orders?status=paid" },
    { label: "Orders", value: stats?.orders ?? 0, icon: Receipt, href: "/admin/orders" },
    { label: "Customers", value: stats?.customers ?? 0, icon: Users, href: "/admin/customers" },
    { label: "Active products", value: stats?.products ?? 0, icon: Package, href: "/admin/products" },
  ];

  return (
    <>
      <PageHeader title="Overview" description="Revenue counts paid and delivered orders." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Panel className="p-5 transition-colors hover:border-primary/40">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {label}
                <Icon className="size-4" />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
            </Panel>
          </Link>
        ))}
      </div>

      <Panel className="mt-6">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <OrdersTable orders={recent} />
        )}
      </Panel>
    </>
  );
}
