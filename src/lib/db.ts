import { connection } from "next/server";
import { hashPassword } from "./password";
import { seedCategories, seedProducts } from "./seed-data";

type QueryResult<T> = { rows: T[] };
type Queryable = {
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
};

// One client per server process, kept on globalThis so dev hot reloads don't open new ones.
const globalForDb = globalThis as unknown as { diginestDb?: Promise<Queryable> };

async function createClient(): Promise<Queryable> {
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
    return {
      query: async <T>(sql: string, params?: unknown[]) => {
        const result = await pool.query(sql, params);
        return { rows: result.rows as T[] };
      },
    };
  }

  // No DATABASE_URL: embedded Postgres stored on disk, for local development.
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "DATABASE_URL is not set: using the embedded database. Its data is lost on every redeploy; connect PostgreSQL.",
    );
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdir } = await import("node:fs/promises");
  const dataDir = process.env.PGLITE_DIR ?? ".data/pglite";
  await mkdir(dataDir, { recursive: true });
  const lite = new PGlite(dataDir);
  return {
    query: async <T>(sql: string, params?: unknown[]) => {
      const result = await lite.query<T>(sql, params);
      return { rows: result.rows };
    },
  };
}

async function initialize(): Promise<Queryable> {
  const client = await createClient();
  await migrate(client);
  await seed(client);
  return client;
}

export function getDb() {
  globalForDb.diginestDb ??= initialize().catch((error) => {
    globalForDb.diginestDb = undefined;
    throw error;
  });
  return globalForDb.diginestDb;
}

export async function query<T>(sql: string, params?: unknown[]) {
  // Store data is per request: never query while `next build` prerenders, when the database may be unreachable.
  await connection();
  const db = await getDb();
  return (await db.query<T>(sql, params)).rows;
}

export async function queryOne<T>(sql: string, params?: unknown[]) {
  return (await query<T>(sql, params))[0] ?? null;
}

const schema = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Package',
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'Package',
    icon_color TEXT NOT NULL DEFAULT '#5433eb',
    price_cents INTEGER NOT NULL,
    compare_at_cents INTEGER,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    buyers_this_month INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    public_id TEXT NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_provider TEXT NOT NULL,
    payment_ref TEXT,
    payment_url TEXT,
    payment_amount TEXT,
    total_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    delivery_note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    unit_price_cents INTEGER NOT NULL,
    quantity INTEGER NOT NULL
  )`,
  // A single row (id = 1): settings JSON plus the uploaded logo, stored as base64.
  `CREATE TABLE IF NOT EXISTS store_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    logo_type TEXT,
    logo_data TEXT,
    logo_updated_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id)`,
  `CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id)`,
];

async function migrate(client: Queryable) {
  for (const statement of schema) {
    await client.query(statement);
  }
}

async function seed(client: Queryable) {
  const { rows } = await client.query<{ count: number }>("SELECT count(*)::int AS count FROM categories");
  if (rows[0].count === 0 && process.env.SEED_PLACEHOLDER_PRODUCTS !== "false") {
    for (const [index, category] of seedCategories.entries()) {
      await client.query(
        "INSERT INTO categories (slug, name, icon, sort_order) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING",
        [category.slug, category.name, category.icon, index],
      );
    }
    for (const product of seedProducts) {
      await client.query(
        `INSERT INTO products (slug, name, category_id, description, icon, icon_color, price_cents,
           compare_at_cents, features, buyers_this_month, featured)
         VALUES ($1, $2, (SELECT id FROM categories WHERE slug = $3), $4, $5, $6, $7, $8, $9::jsonb, $10, $11)
         ON CONFLICT (slug) DO NOTHING`,
        [
          product.slug,
          product.name,
          product.category,
          `${product.name}, delivered by email right after payment is confirmed.`,
          product.icon,
          product.iconColor,
          Math.round(product.price * 100),
          product.compareAt ? Math.round(product.compareAt * 100) : null,
          JSON.stringify(product.features ?? []),
          product.buyersThisMonth ?? 0,
          product.featured ?? false,
        ],
      );
    }
  }

  // The first admin comes from ADMIN_EMAIL / ADMIN_PASSWORD; later admins are promoted in the dashboard.
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const admins = await client.query<{ count: number }>(
      "SELECT count(*)::int AS count FROM users WHERE role = 'admin'",
    );
    if (admins.rows[0].count === 0) {
      await client.query(
        `INSERT INTO users (email, name, password_hash, role) VALUES ($1, 'Admin', $2, 'admin')
         ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
        [email, await hashPassword(password)],
      );
    }
  }
}
