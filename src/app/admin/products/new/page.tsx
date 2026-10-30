import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { getCategories } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const [categories, { currency }] = await Promise.all([getCategories(), getSettings()]);
  return (
    <>
      <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">
        ← All products
      </Link>
      <PageHeader title="New product" />
      <ProductForm
        currency={currency}
        categories={categories}
        values={{
          name: "",
          slug: "",
          description: "",
          categoryId: categories[0]?.id ?? null,
          icon: "Package",
          iconColor: "#5433eb",
          imageUrl: null,
          price: "",
          compareAt: "",
          features: "",
          buyersThisMonth: 0,
          featured: false,
          active: true,
        }}
      />
    </>
  );
}
