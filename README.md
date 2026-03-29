# StockPilot — Next.js + Turso Inventory Tracker

Full-stack inventory management built with **Next.js 14** and **Turso** (cloud SQLite).  
Data is permanently persisted in Turso — survives deployments, cold starts, and scaling.

---

## 🚀 Setup

### 1. Get your Turso credentials

**Option A — Web dashboard (no CLI needed):**
1. Sign up at [turso.tech](https://turso.tech)
2. Create a database named `stockpilot`
3. Copy the database URL (`libsql://stockpilot-<yourname>.turso.io`)
4. Generate an auth token from the dashboard

**Option B — Turso CLI (Mac/Linux/WSL):**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create stockpilot
turso db show stockpilot --url
turso db tokens create stockpilot
```

**Option B — Turso CLI (Windows with Scoop):**
```powershell
irm get.scoop.sh | iex
scoop bucket add turso https://github.com/tursodatabase/scoop-bucket.git
scoop install turso
turso auth login
turso db create stockpilot
turso db show stockpilot --url
turso db tokens create stockpilot
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:
```
TURSO_DATABASE_URL=libsql://stockpilot-<yourname>.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

### 3. Install and run

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## 🌐 Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import repo
3. Before deploying, go to **Environment Variables** and add:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Click **Deploy**

---

## 📁 Project Structure

```
stockpilot/
├── app/
│   ├── layout.js
│   ├── page.js                  # Full React SPA
│   ├── globals.css
│   └── api/
│       ├── dashboard/route.js   # GET /api/dashboard
│       ├── products/
│       │   ├── route.js         # GET, POST
│       │   └── [id]/route.js    # PUT, DELETE
│       ├── customers/
│       │   ├── route.js         # GET, POST
│       │   └── [id]/route.js    # PUT, DELETE
│       └── orders/
│           ├── route.js         # GET, POST
│           └── [id]/route.js    # PATCH, DELETE
├── lib/
│   └── db.js                    # Turso client + schema + seed
├── .env.local.example
├── next.config.js
├── jsconfig.json
└── package.json
```
