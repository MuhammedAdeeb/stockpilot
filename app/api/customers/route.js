import { NextResponse } from 'next/server';
import { getDb, uid } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const customers = db.prepare(`
      SELECT c.*, COUNT(o.id) as order_count
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `).all();
    return NextResponse.json(customers);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, phone, address } = await request.json();
    if (!name || !phone || !address)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const db = getDb();
    const id = uid();
    db.prepare('INSERT INTO customers (id,name,phone,address) VALUES (?,?,?,?)').run(id, name, phone, address);
    return NextResponse.json(db.prepare('SELECT * FROM customers WHERE id=?').get(id));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
