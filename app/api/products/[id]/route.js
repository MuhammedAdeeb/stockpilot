import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { name, price, units } = await request.json();
    const db = getDb();
    db.prepare('UPDATE products SET name=?,price=?,units=? WHERE id=?').run(name, parseFloat(price), parseInt(units), params.id);
    return NextResponse.json(db.prepare('SELECT * FROM products WHERE id=?').get(params.id));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM products WHERE id=?').run(params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
