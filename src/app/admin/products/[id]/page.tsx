import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { getCategories, getProductById } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Edit product" };

const centsToInput = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2));

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [product, categories, { currency }] = await Promise.all([
    Number.isInteger(id) ? getProductById(id) : null,
    getCategories(),
    getSettings(),
  ]);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">
        ← All products
      </Link>
      <PageHeader
        title={product.name}
        actions={
          <div className="flex items-center gap-3">
            {product.active && (
              <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-primary hover:underline">
                View in store
              </Link>
            )}
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <ConfirmButton
                message={`Delete "${product.name}"? Past orders keep their line items, but this can't be undone.`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-destructive/30 px-4 text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
                Delete
              </ConfirmButton>
            </form>
          </div>
        }
      />
      <ProductForm
        currency={currency}
        categories={categories}
        values={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: product.categoryId,
          icon: product.icon,
          iconColor: product.iconColor,
          imageUrl: product.imageUrl,
          price: centsToInput(product.priceCents),
          compareAt: centsToInput(product.compareAtCents),
          features: product.features.join("\n"),
          buyersThisMonth: product.buyersThisMonth,
          featured: product.featured,
          active: product.active,
        }}
      />
    </>
  );
}
