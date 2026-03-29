import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { name, phone, address } = await request.json();
    const db = await getDb();
    await db.execute({
      sql: 'UPDATE customers SET name=?,phone=?,address=? WHERE id=?',
      args: [name, phone, address, params.id],
    });
    const { rows } = await db.execute({ sql: 'SELECT * FROM customers WHERE id=?', args: [params.id] });
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const db = await getDb();
    await db.execute({ sql: 'DELETE FROM customers WHERE id=?', args: [params.id] });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
