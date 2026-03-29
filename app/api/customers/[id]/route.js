import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { name, phone, address } = await request.json();
    const db = getDb();
    db.prepare('UPDATE customers SET name=?,phone=?,address=? WHERE id=?').run(name, phone, address, params.id);
    return NextResponse.json(db.prepare('SELECT * FROM customers WHERE id=?').get(params.id));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM customers WHERE id=?').run(params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
