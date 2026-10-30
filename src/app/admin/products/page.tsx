import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Star } from "lucide-react";
import { toggleProductActive } from "@/app/actions/admin";
import { PageHeader, Panel, buttonClass } from "@/components/admin/ui";
import { ProductVisual } from "@/components/product-visual";
import { formatPrice } from "@/lib/money";
import { getProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string; q?: string }> }) {
  const { saved, q } = await searchParams;
  const search = q?.trim().slice(0, 100);
  const [products, { currency }] = await Promise.all([getProducts({ includeInactive: true, search }), getSettings()]);

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products${search ? ` matching “${search}”` : ""}`}
        actions={
          <Link href="/admin/products/new" className={buttonClass}>
            <Plus className="size-4" />
            New product
          </Link>
        }
      />
      {saved && (
        <p role="status" className="mb-4 rounded-xl bg-signal-emerald/10 px-4 py-2 text-sm text-signal-emerald">
          Product saved.
        </p>
      )}
      <form className="mb-4 w-full sm:w-72">
        <input
          name="q"
          type="search"
          defaultValue={search}
          placeholder="Search products"
          aria-label="Search products"
          className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
        />
      </form>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 text-end font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-end font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                return (
                  <tr key={product.id} className={cn("hover:bg-secondary/60", !product.active && "text-muted-foreground")}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-secondary p-1">
                          <ProductVisual imageUrl={product.imageUrl} icon={product.icon} iconColor={product.iconColor} iconClassName="size-4" />
                        </span>
                        <Link href={`/admin/products/${product.id}`} className="font-medium hover:text-primary">
                          {product.name}
                        </Link>
                        {product.featured && <Star className="size-3.5 fill-amber-400 text-amber-400" aria-label="Featured" />}
                      </div>
                    </td>
                    <td className="px-5 py-3">{product.categoryName ?? "—"}</td>
                    <td className="px-5 py-3 text-end tabular-nums">{formatPrice(product.priceCents, currency)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          product.active ? "bg-signal-emerald/10 text-signal-emerald" : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {product.active ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <form action={toggleProductActive}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            aria-label={product.active ? `Hide ${product.name}` : `Show ${product.name}`}
                            className="grid size-8 place-items-center rounded-lg hover:bg-secondary"
                          >
                            {product.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </form>
                        <Link
                          href={`/admin/products/${product.id}`}
                          aria-label={`Edit ${product.name}`}
                          className="grid size-8 place-items-center rounded-lg hover:bg-secondary"
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted-foreground">No products found.</p>}
      </Panel>
    </>
  );
}
