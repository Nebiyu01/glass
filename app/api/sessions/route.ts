import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const sessions = db.prepare(`
      SELECT
        s.id, s.uid, s.title, s.session_type, s.started_at, s.ended_at,
        COUNT(t.id) as transcript_count,
        MIN(t.text) as first_transcript
      FROM sessions s
      LEFT JOIN transcripts t ON t.session_id = s.id
      GROUP BY s.id
      ORDER BY s.started_at DESC
    `).all();
    return NextResponse.json(sessions);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
