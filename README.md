# StockPilot — Next.js + Turso

## Step 1 — Create tables in Turso dashboard

Go to [turso.tech](https://turso.tech) → your `stockpilot` database → **Shell** tab.

Run each of these statements one at a time:

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  units INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
```

```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  product_id TEXT,
  qty INTEGER NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  date TEXT NOT NULL
);
```

## Step 2 — Add environment variables

Create `.env.local` in the project root:

```
TURSO_DATABASE_URL=libsql://stockpilot-<yourname>.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

## Step 3 — Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — the app connects directly to Turso.

## Step 4 — Deploy to Vercel

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel → Settings → Environment Variables
4. Deploy
