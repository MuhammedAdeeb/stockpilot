import { NextResponse } from 'next/server';
import { getDb, uid } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const { rows } = await db.execute(`
      SELECT c.*, COUNT(o.id) as order_count
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, phone, address } = await request.json();
    if (!name || !phone || !address)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const db = await getDb();
    const id = uid();
    await db.execute({
      sql: 'INSERT INTO customers (id,name,phone,address) VALUES (?,?,?,?)',
      args: [id, name, phone, address],
    });
    const { rows } = await db.execute({ sql: 'SELECT * FROM customers WHERE id=?', args: [id] });
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
