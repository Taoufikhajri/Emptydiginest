import { query, queryOne } from "./db";
import type { OrderStatus } from "./order-status";

export type Category = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  sortOrder: number;
  productCount: number;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  categoryId: number | null;
  categorySlug: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  description: string;
  icon: string;
  iconColor: string;
  // Uploaded in the admin; when null, the icon is shown instead.
  imageUrl: string | null;
  priceCents: number;
  compareAtCents: number | null;
  features: string[];
  buyersThisMonth: number;
  featured: boolean;
  active: boolean;
};

export { orderStatuses, type OrderStatus } from "./order-status";

export type Order = {
  id: number;
  publicId: string;
  userId: number | null;
  email: string;
  status: OrderStatus;
  paymentProvider: string;
  paymentRef: string | null;
  paymentUrl: string | null;
  paymentAmount: string | null;
  totalCents: number;
  currency: string;
  deliveryNote: string;
  createdAt: Date;
  paidAt: Date | null;
};

export type OrderItem = {
  id: number;
  productId: number | null;
  productSlug: string | null;
  name: string;
  unitPriceCents: number;
  quantity: number;
};

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  category_id: number | null;
  category_slug: string | null;
  category_name: string | null;
  category_icon: string | null;
  description: string;
  icon: string;
  icon_color: string;
  image_updated_at: Date | null;
  price_cents: number;
  compare_at_cents: number | null;
  features: string[];
  buyers_this_month: number;
  featured: boolean;
  active: boolean;
};

type OrderRow = {
  id: number;
  public_id: string;
  user_id: number | null;
  email: string;
  status: OrderStatus;
  payment_provider: string;
  payment_ref: string | null;
  payment_url: string | null;
  payment_amount: string | null;
  total_cents: number;
  currency: string;
  delivery_note: string;
  created_at: Date;
  paid_at: Date | null;
};

const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  categoryId: row.category_id,
  categorySlug: row.category_slug,
  categoryName: row.category_name,
  categoryIcon: row.category_icon,
  description: row.description,
  icon: row.icon,
  iconColor: row.icon_color,
  imageUrl: row.image_updated_at ? `/media/products/${row.id}?v=${new Date(row.image_updated_at).getTime()}` : null,
  priceCents: row.price_cents,
  compareAtCents: row.compare_at_cents,
  features: Array.isArray(row.features) ? row.features : [],
  buyersThisMonth: row.buyers_this_month,
  featured: row.featured,
  active: row.active,
});

export const toOrder = (row: OrderRow): Order => ({
  id: row.id,
  publicId: row.public_id,
  userId: row.user_id,
  email: row.email,
  status: row.status,
  paymentProvider: row.payment_provider,
  paymentRef: row.payment_ref,
  paymentUrl: row.payment_url,
  paymentAmount: row.payment_amount,
  totalCents: row.total_cents,
  currency: row.currency,
  deliveryNote: row.delivery_note,
  createdAt: new Date(row.created_at),
  paidAt: row.paid_at ? new Date(row.paid_at) : null,
});

const productSelect = `
  SELECT p.*, c.slug AS category_slug, c.name AS category_name, c.icon AS category_icon, pi.updated_at AS image_updated_at
  FROM products p LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN product_images pi ON pi.product_id = p.id`;

export async function getCategories() {
  const rows = await query<{ id: number; slug: string; name: string; icon: string; sort_order: number; product_count: number }>(
    `SELECT c.*, count(p.id) FILTER (WHERE p.active)::int AS product_count
     FROM categories c LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id ORDER BY c.sort_order, c.name`,
  );
  return rows.map<Category>((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    sortOrder: row.sort_order,
    productCount: row.product_count,
  }));
}

export async function getCategoryBySlug(slug: string) {
  return (await getCategories()).find((category) => category.slug === slug) ?? null;
}

export async function getProducts(options: {
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  includeInactive?: boolean;
  limit?: number;
} = {}) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (!options.includeInactive) where.push("p.active");
  if (options.featuredOnly) where.push("p.featured");
  if (options.categorySlug) {
    params.push(options.categorySlug);
    where.push(`c.slug = $${params.length}`);
  }
  if (options.search?.trim()) {
    params.push(`%${options.search.trim()}%`);
    where.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }
  let sql = `${productSelect} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY p.featured DESC, p.price_cents DESC, p.id`;
  if (options.limit) {
    params.push(options.limit);
    sql += ` LIMIT $${params.length}`;
  }
  return (await query<ProductRow>(sql, params)).map(toProduct);
}

export async function getProductBySlug(slug: string) {
  const row = await queryOne<ProductRow>(`${productSelect} WHERE p.slug = $1 AND p.active`, [slug]);
  return row ? toProduct(row) : null;
}

export async function getProductById(id: number) {
  const row = await queryOne<ProductRow>(`${productSelect} WHERE p.id = $1`, [id]);
  return row ? toProduct(row) : null;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const rows = await query<ProductRow>(
    `${productSelect} WHERE p.active AND p.id <> $1 AND p.category_id IS NOT DISTINCT FROM $2
     ORDER BY p.featured DESC, p.id LIMIT $3`,
    [product.id, product.categoryId, limit],
  );
  return rows.map(toProduct);
}

export async function getOrderByPublicId(publicId: string) {
  const row = await queryOne<OrderRow>("SELECT * FROM orders WHERE public_id = $1", [publicId]);
  return row ? toOrder(row) : null;
}

export async function getOrderItems(orderId: number) {
  const rows = await query<{
    id: number;
    product_id: number | null;
    product_slug: string | null;
    name: string;
    unit_price_cents: number;
    quantity: number;
  }>(
    `SELECT oi.*, p.slug AS product_slug FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1 ORDER BY oi.id`,
    [orderId],
  );
  return rows.map<OrderItem>((row) => ({
    id: row.id,
    productId: row.product_id,
    productSlug: row.product_slug,
    name: row.name,
    unitPriceCents: row.unit_price_cents,
    quantity: row.quantity,
  }));
}

export async function getOrdersForUser(userId: number) {
  return (await query<OrderRow>("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [userId])).map(
    toOrder,
  );
}
