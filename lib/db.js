import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// On Vercel, /tmp is the only writable directory
const DATA_DIR = process.env.NODE_ENV === 'production'
  ? '/tmp'
  : path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'stockpilot.db');

// Singleton pattern — reuse connection across hot reloads in dev
let db;

function getDb() {
  if (db) return db;

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
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
      customer_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      qty INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      date TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
  `);

  seedIfEmpty(db);
  return db;
}

function uid() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function seedIfEmpty(db) {
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get();
  if (count.c > 0) return;

  const p1 = uid(), p2 = uid(), p3 = uid(), p4 = uid();
  const c1 = uid(), c2 = uid(), c3 = uid();
  const today = new Date().toISOString().split('T')[0];

  db.prepare(`INSERT INTO products (id,name,price,units) VALUES (?,?,?,?)`).run(p1,'Wireless Headphones',2499,34);
  db.prepare(`INSERT INTO products (id,name,price,units) VALUES (?,?,?,?)`).run(p2,'USB-C Hub 7-in-1',1299,8);
  db.prepare(`INSERT INTO products (id,name,price,units) VALUES (?,?,?,?)`).run(p3,'Mechanical Keyboard',3999,0);
  db.prepare(`INSERT INTO products (id,name,price,units) VALUES (?,?,?,?)`).run(p4,'Monitor Stand',899,55);

  db.prepare(`INSERT INTO customers (id,name,phone,address) VALUES (?,?,?,?)`).run(c1,'Arjun Menon','+91 98765 43210','Palakkad, Kerala');
  db.prepare(`INSERT INTO customers (id,name,phone,address) VALUES (?,?,?,?)`).run(c2,'Priya Nair','+91 87654 32109','Thrissur, Kerala');
  db.prepare(`INSERT INTO customers (id,name,phone,address) VALUES (?,?,?,?)`).run(c3,'Rahul Dev','+91 76543 21098','Kozhikode, Kerala');

  db.prepare(`INSERT INTO orders (id,customer_id,product_id,qty,total,status,date) VALUES (?,?,?,?,?,?,?)`).run('ORD-001',c1,p1,2,4998,'Completed',today);
  db.prepare(`INSERT INTO orders (id,customer_id,product_id,qty,total,status,date) VALUES (?,?,?,?,?,?,?)`).run('ORD-002',c2,p2,1,1299,'Pending',today);
  db.prepare(`INSERT INTO orders (id,customer_id,product_id,qty,total,status,date) VALUES (?,?,?,?,?,?,?)`).run('ORD-003',c3,p1,1,2499,'Returned',today);
}

export { getDb, uid };
