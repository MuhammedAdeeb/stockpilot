import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export async function GET() {
  try {
    // Log what env vars are present
    const url = process.env.TURSO_DATABASE_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!url) return NextResponse.json({ error: 'TURSO_DATABASE_URL is missing' }, { status: 500 });
    if (!token) return NextResponse.json({ error: 'TURSO_AUTH_TOKEN is missing' }, { status: 500 });

    // Try a raw connection with no schema work
    const db = createClient({ url, authToken: token });
    const { rows } = await db.execute('SELECT 1 as ok');

    return NextResponse.json({
      success: true,
      db_responding: rows[0].ok === 1,
      url_prefix: url.substring(0, 30) + '...',
    });
  } catch (e) {
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
  }
}
