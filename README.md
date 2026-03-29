# StockPilot — Next.js + SQLite Inventory Tracker

Full-stack inventory management system built with **Next.js 14 App Router** and **SQLite** via `better-sqlite3`.

---

## ⚡ Deploy to Vercel (Recommended)

> **Important note about SQLite on Vercel:**  
> Vercel's serverless functions are stateless — the filesystem resets between deployments. SQLite data is stored in `/tmp` at runtime, which persists across requests **within the same instance** but is not permanent across deployments or cold starts.  
>
> **For production use with persistent data**, connect a free database instead:
> - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (free tier, Postgres)
> - [Turso](https://turso.tech) (free tier, SQLite-compatible, truly persistent)
> - [PlanetScale](https://planetscale.com) (free tier, MySQL)
>
> For personal/demo use, SQLite on Vercel works fine within a session.

### Steps:
1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Vercel auto-detects Next.js — click **Deploy**
5. Done! You get a URL like `stockpilot.vercel.app`

---

## 💻 Run Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

Data is stored in `./data/stockpilot.db` locally (created automatically).

---

## 📁 Project Structure

```
stockpilot-next/
├── app/
│   ├── layout.js              # Root HTML layout
│   ├── page.js                # Full React SPA (client component)
│   ├── globals.css            # All styles
│   └── api/
│       ├── dashboard/route.js # GET /api/dashboard
│       ├── products/
│       │   ├── route.js       # GET, POST /api/products
│       │   └── [id]/route.js  # PUT, DELETE /api/products/:id
│       ├── customers/
│       │   ├── route.js       # GET, POST /api/customers
│       │   └── [id]/route.js  # PUT, DELETE /api/customers/:id
│       └── orders/
│           ├── route.js       # GET, POST /api/orders
│           └── [id]/route.js  # PATCH, DELETE /api/orders/:id
├── lib/
│   └── db.js                  # SQLite singleton + seed data
├── next.config.js
├── jsconfig.json
└── package.json
```

---

## 🔌 API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/dashboard | Stats summary |
| GET | /api/products | All products |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/customers | All customers + order count |
| POST | /api/customers | Create customer |
| PUT | /api/customers/:id | Update customer |
| DELETE | /api/customers/:id | Delete customer |
| GET | /api/orders | All orders (joined) |
| POST | /api/orders | Create order (deducts stock) |
| PATCH | /api/orders/:id | Update order status (manages stock) |
| DELETE | /api/orders/:id | Delete order (restores stock) |
