import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status='Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status='Returned'  THEN 1 ELSE 0 END) as returned,
        SUM(CASE WHEN status='Pending'   THEN 1 ELSE 0 END) as pending
      FROM orders
    `).get();
    const { c: total_products } = db.prepare('SELECT COUNT(*) as c FROM products').get();
    return NextResponse.json({ ...stats, total_products });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
