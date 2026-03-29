import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { status } = await request.json();
    const db = await getDb();

    const { rows } = await db.execute({ sql: 'SELECT * FROM orders WHERE id=?', args: [params.id] });
    const order = rows[0];
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const oldStatus = order.status;
    if (oldStatus === status) return NextResponse.json({ success: true });

    const statements = [
      { sql: 'UPDATE orders SET status=? WHERE id=?', args: [status, params.id] },
    ];

    if (oldStatus !== 'Returned' && status === 'Returned') {
      // Returning: restore stock
      statements.push({
        sql: 'UPDATE products SET units = units + ? WHERE id=?',
        args: [Number(order.qty), order.product_id],
      });
    } else if (oldStatus === 'Returned' && status !== 'Returned') {
      // Un-returning: check stock then deduct
      const { rows: pRows } = await db.execute({ sql: 'SELECT * FROM products WHERE id=?', args: [order.product_id] });
      const product = pRows[0];
      if (!product || Number(product.units) < Number(order.qty))
        return NextResponse.json({ error: `Only ${product?.units ?? 0} units available` }, { status: 400 });
      statements.push({
        sql: 'UPDATE products SET units = units - ? WHERE id=?',
        args: [Number(order.qty), order.product_id],
      });
    }

    await db.batch(statements, 'write');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const db = await getDb();

    const { rows } = await db.execute({ sql: 'SELECT * FROM orders WHERE id=?', args: [params.id] });
    const order = rows[0];
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const statements = [
      { sql: 'DELETE FROM orders WHERE id=?', args: [params.id] },
    ];
    if (order.status !== 'Returned') {
      statements.push({
        sql: 'UPDATE products SET units = units + ? WHERE id=?',
        args: [Number(order.qty), order.product_id],
      });
    }
    await db.batch(statements, 'write');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
