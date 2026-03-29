import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const orders = db.prepare(`
      SELECT o.*, c.name as customer_name, p.name as product_name, p.price as product_price
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN products p ON p.id = o.product_id
      ORDER BY o.date DESC, o.id DESC
    `).all();
    return NextResponse.json(orders);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { customer_id, product_id, qty, status } = await request.json();
    if (!customer_id || !product_id || !qty)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE id=?').get(product_id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const orderStatus = status || 'Pending';
    if (orderStatus !== 'Returned' && product.units < qty)
      return NextResponse.json({ error: `Only ${product.units} units available` }, { status: 400 });

    const count = db.prepare('SELECT COUNT(*) as c FROM orders').get();
    const orderId = 'ORD-' + String(count.c + 1).padStart(3, '0');
    const total = product.price * qty;
    const date = new Date().toISOString().split('T')[0];

    const create = db.transaction(() => {
      db.prepare('INSERT INTO orders (id,customer_id,product_id,qty,total,status,date) VALUES (?,?,?,?,?,?,?)')
        .run(orderId, customer_id, product_id, parseInt(qty), total, orderStatus, date);
      if (orderStatus !== 'Returned')
        db.prepare('UPDATE products SET units = units - ? WHERE id=?').run(parseInt(qty), product_id);
    });
    create();

    const order = db.prepare(`
      SELECT o.*, c.name as customer_name, p.name as product_name
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN products p ON p.id = o.product_id
      WHERE o.id=?
    `).get(orderId);
    return NextResponse.json(order);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
