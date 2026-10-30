import type { Metadata } from "next";
import Link from "next/link";
import { setUserRole } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PageHeader, Panel } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const admin = await requireAdmin();
  const { q } = await searchParams;
  const search = q?.trim().slice(0, 100);
  const { currency } = await getSettings();
  const users = await query<{
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: Date;
    order_count: number;
    spent_cents: number;
  }>(
    `SELECT u.id, u.name, u.email, u.role, u.created_at,
       count(o.id)::int AS order_count,
       COALESCE(sum(o.total_cents) FILTER (WHERE o.status IN ('paid', 'delivered') AND o.currency = $1), 0)::int AS spent_cents
     FROM users u LEFT JOIN orders o ON o.user_id = u.id
     ${search ? "WHERE u.email ILIKE $2 OR u.name ILIKE $2" : ""}
     GROUP BY u.id ORDER BY u.created_at DESC LIMIT 500`,
    search ? [currency, `%${search}%`] : [currency],
  );

  return (
    <>
      <PageHeader title="Customers" description={`${users.length} accounts`} />
      <form className="mb-4 w-full sm:w-72">
        <input
          name="q"
          type="search"
          defaultValue={search}
          placeholder="Search name or email"
          aria-label="Search customers"
          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
        />
      </form>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 text-end font-medium">Orders</th>
                <th className="px-5 py-3 text-end font-medium">Spent</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 text-end font-medium">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/60">
                  <td className="px-5 py-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                  </td>
                  <td className="px-5 py-3 text-end tabular-nums">
                    {user.order_count > 0 ? (
                      <Link href={`/admin/orders?q=${encodeURIComponent(user.email)}`} className="text-primary hover:underline">
                        {user.order_count}
                      </Link>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="px-5 py-3 text-end tabular-nums">{formatPrice(user.spent_cents, currency)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                        user.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-end">
                    {user.id === admin.id ? (
                      <span className="text-xs text-muted-foreground">You</span>
                    ) : (
                      <form action={setUserRole}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="role" value={user.role === "admin" ? "customer" : "admin"} />
                        <ConfirmButton
                          message={
                            user.role === "admin"
                              ? `Remove admin access from ${user.email}?`
                              : `Give ${user.email} full admin access to orders, products and customers?`
                          }
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                        >
                          {user.role === "admin" ? "Remove admin" : "Make admin"}
                        </ConfirmButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
