# Diginest: running and deploying

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no `DATABASE_URL`, the store uses an embedded Postgres saved in `.data/pglite`
and loads the placeholder catalog on first start. The admin account comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
in `.env.local`. Sign in, then open `/admin`.

Payment providers without API keys run in **demo mode** locally: the order page shows a
"Simulate successful payment" button. Delete `.data/` to reset the local database.

## Pages

| Store | Admin (`/admin`, admins only) |
| --- | --- |
| `/` home, `/products`, `/categories/[slug]`, `/products/[slug]` | Overview: revenue, orders awaiting delivery |
| `/cart`, `/checkout` (sign-in required) | Orders: filter, search, set status, add delivery details |
| `/orders/[id]` order status and delivery | Products: create, edit, hide, delete |
| `/account`, `/login`, `/register` | Categories: create, rename, reorder, delete |
| `/guarantee`, `/terms`, `/privacy` | Customers: order totals, grant or remove admin |

## How an order flows

1. The customer places an order. Prices are recalculated on the server, and the order is saved as **Pending**.
2. They're sent to NOWPayments or Binance Pay to pay.
3. The provider calls the webhook (`/api/webhooks/nowpayments` or `/api/webhooks/binance`). The signature and
   amount are verified, then the order becomes **Paid**.
4. In **Admin → Orders**, add the license keys or links under *Delivery details* and set the status to **Delivered**.
   The customer sees them on their order page.

## Deploy on Railway

1. Push the repo to GitHub, then in Railway: **New Project → Deploy from GitHub repo**. Railway uses the `Dockerfile`.
2. Add a database: **New → Database → PostgreSQL**. In your app service, add the variable
   `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`.
3. Add the variables below, then **Settings → Networking → Generate Domain**, and put that URL in `APP_URL`.

## Deploy on Vercel

1. Import the GitHub repo. Vercel detects Next.js; keep the default settings.
2. Create a Postgres database (Vercel Marketplace → Neon) and set `DATABASE_URL`, plus `DATABASE_SSL=true`.
3. Add the variables below. Set `APP_URL` to your Vercel domain.

The embedded local database does **not** work on Vercel or Railway. Always set `DATABASE_URL` in production.

## Production variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string |
| `DATABASE_SSL` | Neon / most managed hosts | `true` |
| `APP_URL` | Yes | Public site URL, used for payment returns and webhooks |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First deploy | Creates the first admin if none exists |
| `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` | To accept NOWPayments | From the NOWPayments dashboard. Set the IPN callback URL there to `APP_URL/api/webhooks/nowpayments` |
| `NOWPAYMENTS_SANDBOX` | Optional | `true` to test with sandbox keys |
| `BINANCE_PAY_API_KEY`, `BINANCE_PAY_SECRET_KEY` | To accept Binance Pay | From the Binance Pay merchant portal |
| `BINANCE_PAY_USDT_PER_EUR` | With Binance Pay | EUR → USDT rate used to price orders; keep it current |
| `SEED_PLACEHOLDER_PRODUCTS` | Optional | `false` to start with an empty catalog |
| `ALLOW_DEMO_PAYMENTS` | Never on a live store | Lets unpaid demo orders be marked paid |

A payment method only appears at checkout once its keys are set, unless demo payments are allowed.

## Before going live

- Replace the placeholder products, logo (`src/components/store/brand-mark.tsx`) and the terms, privacy and
  guarantee text.
- Test each provider with sandbox or small real payments. The Binance Pay request format follows its v3 API docs
  and should be checked against your merchant account before launch.
- Customers aren't emailed automatically yet. Delivery details appear on the order page.
