import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const { rows: statsRows } = await db.execute(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status='Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status='Returned'  THEN 1 ELSE 0 END) as returned,
        SUM(CASE WHEN status='Pending'   THEN 1 ELSE 0 END) as pending
      FROM orders
    `);
    const { rows: prodRows } = await db.execute('SELECT COUNT(*) as c FROM products');
    const stats = statsRows[0];
    return NextResponse.json({
      total_orders:   Number(stats.total_orders),
      completed:      Number(stats.completed),
      returned:       Number(stats.returned),
      pending:        Number(stats.pending),
      total_products: Number(prodRows[0].c),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
