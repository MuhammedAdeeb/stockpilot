import { NextResponse } from 'next/server';
import { getDb, uid } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, price, units } = await request.json();
    if (!name || price == null || units == null)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const db = getDb();
    const id = uid();
    db.prepare('INSERT INTO products (id,name,price,units) VALUES (?,?,?,?)').run(id, name, parseFloat(price), parseInt(units));
    return NextResponse.json(db.prepare('SELECT * FROM products WHERE id=?').get(id));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
