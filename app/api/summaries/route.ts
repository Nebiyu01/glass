import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const summaries = db.prepare(`
      SELECT s.*, ss.title as session_title, ss.started_at, ss.session_type
      FROM summaries s
      JOIN sessions ss ON ss.id = s.session_id
      ORDER BY s.generated_at DESC
    `).all();
    return NextResponse.json(summaries);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
