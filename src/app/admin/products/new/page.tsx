import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { getCategories } from "@/lib/queries";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <>
      <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">
        ← All products
      </Link>
      <PageHeader title="New product" />
      <ProductForm
        categories={categories}
        values={{
          name: "",
          slug: "",
          description: "",
          categoryId: categories[0]?.id ?? null,
          icon: "Package",
          iconColor: "#5433eb",
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
