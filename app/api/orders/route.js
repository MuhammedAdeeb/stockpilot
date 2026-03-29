import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const { rows } = await db.execute(`
      SELECT o.*, c.name as customer_name, p.name as product_name, p.price as product_price
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN products p ON p.id = o.product_id
      ORDER BY o.date DESC, o.id DESC
    `);
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { customer_id, product_id, qty, status } = await request.json();
    if (!customer_id || !product_id || !qty)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const db = await getDb();

    const { rows: pRows } = await db.execute({ sql: 'SELECT * FROM products WHERE id=?', args: [product_id] });
    const product = pRows[0];
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const orderStatus = status || 'Pending';
    if (orderStatus !== 'Returned' && Number(product.units) < qty)
      return NextResponse.json({ error: `Only ${product.units} units available` }, { status: 400 });

    const { rows: countRows } = await db.execute('SELECT COUNT(*) as c FROM orders');
    const orderId = 'ORD-' + String(Number(countRows[0].c) + 1).padStart(3, '0');
    const total = Number(product.price) * qty;
    const date = new Date().toISOString().split('T')[0];

    const statements = [
      {
        sql: 'INSERT INTO orders (id,customer_id,product_id,qty,total,status,date) VALUES (?,?,?,?,?,?,?)',
        args: [orderId, customer_id, product_id, parseInt(qty), total, orderStatus, date],
      },
    ];
    if (orderStatus !== 'Returned') {
      statements.push({
        sql: 'UPDATE products SET units = units - ? WHERE id=?',
        args: [parseInt(qty), product_id],
      });
    }
    await db.batch(statements, 'write');

    const { rows: oRows } = await db.execute({
      sql: `SELECT o.*, c.name as customer_name, p.name as product_name
            FROM orders o
            LEFT JOIN customers c ON c.id = o.customer_id
            LEFT JOIN products p ON p.id = o.product_id
            WHERE o.id=?`,
      args: [orderId],
    });
    return NextResponse.json(oRows[0]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
