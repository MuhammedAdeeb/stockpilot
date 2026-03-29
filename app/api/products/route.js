import { NextResponse } from 'next/server';
import { getDb, uid } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const { rows } = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, price, units } = await request.json();
    if (!name || price == null || units == null)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const db = await getDb();
    const id = uid();
    await db.execute({
      sql: 'INSERT INTO products (id,name,price,units) VALUES (?,?,?,?)',
      args: [id, name, parseFloat(price), parseInt(units)],
    });
    const { rows } = await db.execute({ sql: 'SELECT * FROM products WHERE id=?', args: [id] });
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
