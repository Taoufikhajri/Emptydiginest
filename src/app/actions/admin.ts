"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { iconNames } from "@/lib/icons";
import { parsePriceToCents } from "@/lib/money";
import { orderStatuses } from "@/lib/queries";

export type AdminFormState = { error?: string; saved?: boolean } | undefined;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

const productSchema = z.object({
  name: z.string().trim().min(1, "Enter a product name.").max(160),
  slug: z.string().trim().max(80),
  description: z.string().trim().max(4000),
  categoryId: z.coerce.number().int().nonnegative(),
  icon: z.enum(iconNames as [string, ...string[]]),
  iconColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid icon color."),
  price: z.string(),
  compareAt: z.string(),
  features: z.string().max(2000),
  buyersThisMonth: z.coerce.number().int().min(0).max(1_000_000),
});

const revalidateStore = () => {
  revalidatePath("/", "layout");
};

export async function saveProduct(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const priceCents = parsePriceToCents(data.price);
  if (priceCents === null || priceCents <= 0) return { error: "Enter a price like 19.99." };
  const compareAtCents = data.compareAt.trim() ? parsePriceToCents(data.compareAt) : null;
  if (data.compareAt.trim() && compareAtCents === null) return { error: "Enter the original price like 49.99, or leave it empty." };

  const slug = slugify(data.slug || data.name);
  if (!slug) return { error: "Enter a slug using letters or numbers." };
  const features = data.features
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 10);

  const id = Number(formData.get("id")) || null;
  const clash = await queryOne<{ id: number }>("SELECT id FROM products WHERE slug = $1 AND id IS DISTINCT FROM $2", [slug, id]);
  if (clash) return { error: "Another product already uses this slug." };

  const values = [
    slug,
    data.name,
    data.categoryId || null,
    data.description,
    data.icon,
    data.iconColor,
    priceCents,
    compareAtCents,
    JSON.stringify(features),
    data.buyersThisMonth,
    formData.get("featured") === "on",
    formData.get("active") === "on",
  ];

  if (id) {
    await query(
      `UPDATE products SET slug = $1, name = $2, category_id = $3, description = $4, icon = $5, icon_color = $6,
         price_cents = $7, compare_at_cents = $8, features = $9::jsonb, buyers_this_month = $10, featured = $11,
         active = $12
       WHERE id = $13`,
      [...values, id],
    );
  } else {
    await query(
      `INSERT INTO products (slug, name, category_id, description, icon, icon_color, price_cents, compare_at_cents,
         features, buyers_this_month, featured, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12)`,
      values,
    );
  }
  revalidateStore();
  redirect("/admin/products?saved=1");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  await query("DELETE FROM products WHERE id = $1", [Number(formData.get("id"))]);
  revalidateStore();
  redirect("/admin/products");
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  await query("UPDATE products SET active = NOT active WHERE id = $1", [Number(formData.get("id"))]);
  revalidateStore();
}

const categorySchema = z.object({
  name: z.string().trim().min(1, "Enter a category name.").max(80),
  slug: z.string().trim().max(80),
  icon: z.enum(iconNames as [string, ...string[]]),
  sortOrder: z.coerce.number().int().min(0).max(1000),
});

export async function saveCategory(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) return { error: "Enter a slug using letters or numbers." };

  const id = Number(formData.get("id")) || null;
  const clash = await queryOne<{ id: number }>("SELECT id FROM categories WHERE slug = $1 AND id IS DISTINCT FROM $2", [slug, id]);
  if (clash) return { error: "Another category already uses this slug." };

  if (id) {
    await query("UPDATE categories SET name = $1, slug = $2, icon = $3, sort_order = $4 WHERE id = $5", [
      parsed.data.name,
      slug,
      parsed.data.icon,
      parsed.data.sortOrder,
      id,
    ]);
  } else {
    await query("INSERT INTO categories (name, slug, icon, sort_order) VALUES ($1, $2, $3, $4)", [
      parsed.data.name,
      slug,
      parsed.data.icon,
      parsed.data.sortOrder,
    ]);
  }
  revalidateStore();
  return { saved: true };
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  await query("DELETE FROM categories WHERE id = $1", [Number(formData.get("id"))]);
  revalidateStore();
}

const orderSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(orderStatuses),
  deliveryNote: z.string().max(10_000),
});

export async function updateOrder(_state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = orderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await query(
    `UPDATE orders SET status = $1, delivery_note = $2,
       paid_at = CASE WHEN $1 IN ('paid', 'delivered') THEN COALESCE(paid_at, now()) ELSE paid_at END
     WHERE id = $3`,
    [parsed.data.status, parsed.data.deliveryNote, parsed.data.id],
  );
  revalidatePath("/admin", "layout");
  return { saved: true };
}

export async function setUserRole(formData: FormData) {
  const admin = await requireAdmin();
  const userId = Number(formData.get("userId"));
  const role = formData.get("role") === "admin" ? "admin" : "customer";
  if (userId === admin.id && role !== "admin") {
    throw new Error("You can't remove your own admin access.");
  }
  await query("UPDATE users SET role = $1 WHERE id = $2", [role, userId]);
  revalidatePath("/admin/customers");
}
