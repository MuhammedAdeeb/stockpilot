import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { status } = await request.json();
    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id=?').get(params.id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const oldStatus = order.status;
    if (oldStatus === status) return NextResponse.json({ success: true });

    const update = db.transaction(() => {
      if (oldStatus !== 'Returned' && status === 'Returned') {
        db.prepare('UPDATE products SET units = units + ? WHERE id=?').run(order.qty, order.product_id);
      } else if (oldStatus === 'Returned' && status !== 'Returned') {
        const product = db.prepare('SELECT * FROM products WHERE id=?').get(order.product_id);
        if (product.units < order.qty) throw new Error(`Only ${product.units} units available`);
        db.prepare('UPDATE products SET units = units - ? WHERE id=?').run(order.qty, order.product_id);
      }
      db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, params.id);
    });
    update();

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id=?').get(params.id);
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const del = db.transaction(() => {
      if (order.status !== 'Returned')
        db.prepare('UPDATE products SET units = units + ? WHERE id=?').run(order.qty, order.product_id);
      db.prepare('DELETE FROM orders WHERE id=?').run(params.id);
    });
    del();

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
