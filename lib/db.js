import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('Missing TURSO_DATABASE_URL environment variable');
}
if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('Missing TURSO_AUTH_TOKEN environment variable');
}

// Singleton — reuse client across requests
let client;
function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

let initialized = false;

async function getDb() {
  const db = getClient();
  if (!initialized) {
    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        units INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        product_id TEXT,
        qty INTEGER NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        date TEXT NOT NULL
      );
    `);
    await seedIfEmpty(db);
    initialized = true;
  }
  return db;
}

function uid() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

async function seedIfEmpty(db) {
  const { rows } = await db.execute('SELECT COUNT(*) as c FROM products');
  if (Number(rows[0].c) > 0) return;

  const p1 = uid(), p2 = uid(), p3 = uid(), p4 = uid();
  const c1 = uid(), c2 = uid(), c3 = uid();
  const today = new Date().toISOString().split('T')[0];

  await db.batch([
    { sql: 'INSERT INTO products (id,name,price,units) VALUES (?,?,?,?)', args: [p1, 'Wireless Headphones', 2499, 34] },
    { sql: 'INSERT INTO products (id,name,price,units) VALUES (?,?,?,?)', args: [p2, 'USB-C Hub 7-in-1', 1299, 8] },
    { sql: 'INSERT INTO products (id,name,price,units) VALUES (?,?,?,?)', args: [p3, 'Mechanical Keyboard', 3999, 0] },
    { sql: 'INSERT INTO products (id,name,price,units) VALUES (?,?,?,?)', args: [p4, 'Monitor Stand', 899, 55] },
    { sql: 'INSERT INTO customers (id,name,phone,address) VALUES (?,?,?,?)', args: [c1, 'Arjun Menon', '+91 98765 43210', 'Palakkad, Kerala'] },
    { sql: 'INSERT INTO customers (id,name,phone,address) VALUES (?,?,?,?)', args: [c2, 'Priya Nair', '+91 87654 32109', 'Thrissur, Kerala'] },
    { sql: 'INSERT INTO customers (id,name,phone,address) VALUES (?,?,?,?)', args: [c3, 'Rahul Dev', '+91 76543 21098', 'Kozhikode, Kerala'] },
    { sql: 'INSERT INTO orders (id,customer_id,product_id,qty,total,status,date) VALUES (?,?,?,?,?,?,?)', args: ['ORD-001', c1, p1, 2, 4998, 'Completed', today] },
    { sql: 'INSERT INTO orders (id,customer_id,product_id,qty,total,status,date) VALUES (?,?,?,?,?,?,?)', args: ['ORD-002', c2, p2, 1, 1299, 'Pending', today] },
    { sql: 'INSERT INTO orders (id,customer_id,product_id,qty,total,status,date) VALUES (?,?,?,?,?,?,?)', args: ['ORD-003', c3, p1, 1, 2499, 'Returned', today] },
  ], 'write');
}

export { getDb, uid };
