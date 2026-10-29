import type { Metadata } from "next";
import Link from "next/link";
import { OrdersTable } from "@/components/admin/orders-table";
import { PageHeader, Panel } from "@/components/admin/ui";
import { query } from "@/lib/db";
import { orderStatuses, toOrder, type OrderStatus } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const activeStatus = orderStatuses.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const search = q?.trim().slice(0, 100);

  const where: string[] = [];
  const params: unknown[] = [];
  if (activeStatus) {
    params.push(activeStatus);
    where.push(`status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(public_id ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }
  const rows = await query<Parameters<typeof toOrder>[0]>(
    `SELECT * FROM orders ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC LIMIT 200`,
    params,
  );
  const counts = await query<{ status: OrderStatus; count: number }>(
    "SELECT status, count(*)::int AS count FROM orders GROUP BY status",
  );
  const countFor = (value?: OrderStatus) =>
    value ? (counts.find((row) => row.status === value)?.count ?? 0) : counts.reduce((sum, row) => sum + row.count, 0);

  return (
    <>
      <PageHeader title="Orders" description="Orders marked Paid are waiting for you to deliver them." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[undefined, ...orderStatuses].map((value) => (
          <Link
            key={value ?? "all"}
            href={value ? `/admin/orders?status=${value}` : "/admin/orders"}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize",
              value === activeStatus
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {value ?? "All"} ({countFor(value)})
          </Link>
        ))}
        <form className="ms-auto w-full sm:w-64">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <input
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Search order number or email"
            aria-label="Search orders"
            className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
          />
        </form>
      </div>
      <Panel>
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No orders found.</p>
        ) : (
          <OrdersTable orders={rows.map(toOrder)} />
        )}
      </Panel>
    </>
  );
}
