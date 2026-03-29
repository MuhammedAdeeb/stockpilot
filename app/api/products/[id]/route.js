import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { name, price, units } = await request.json();
    const db = await getDb();
    await db.execute({
      sql: 'UPDATE products SET name=?,price=?,units=? WHERE id=?',
      args: [name, parseFloat(price), parseInt(units), params.id],
    });
    const { rows } = await db.execute({ sql: 'SELECT * FROM products WHERE id=?', args: [params.id] });
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const db = await getDb();
    await db.execute({ sql: 'DELETE FROM products WHERE id=?', args: [params.id] });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
