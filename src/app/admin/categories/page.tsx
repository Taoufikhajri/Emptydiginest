import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { deleteCategory } from "@/app/actions/admin";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { PageHeader, Panel } from "@/components/admin/ui";
import { getCategories } from "@/lib/queries";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <PageHeader title="Categories" description="Lower order numbers appear first in the store." />
      <Panel className="p-5">
        <h2 className="mb-3 font-semibold">New category</h2>
        <CategoryForm values={{ name: "", slug: "", icon: "Package", sortOrder: categories.length }} />
      </Panel>
      <Panel className="mt-6 divide-y divide-border">
        {categories.map((category) => (
          <div key={category.id} className="flex flex-col gap-3 p-5 lg:flex-row lg:items-end">
            <div className="flex-1">
              <CategoryForm
                values={{ id: category.id, name: category.name, slug: category.slug, icon: category.icon, sortOrder: category.sortOrder }}
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {category.productCount} visible products
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={category.id} />
                <ConfirmButton
                  message={`Delete "${category.name}"? Its products stay in the store without a category.`}
                  className="grid size-10 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete {category.name}</span>
                </ConfirmButton>
              </form>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="p-5 text-sm text-muted-foreground">No categories yet.</p>}
      </Panel>
    </>
  );
}
