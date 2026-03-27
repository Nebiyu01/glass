import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';
  if (!q) return NextResponse.json([]);

  try {
    const db = getDb();
    const like = `%${q}%`;

    const transcripts = db.prepare(`
      SELECT 'transcript' as type, t.id, t.session_id, t.text as content,
             t.start_at as ts, t.speaker, s.title as session_title
      FROM transcripts t
      JOIN sessions s ON s.id = t.session_id
      WHERE t.text LIKE ?
      LIMIT 50
    `).all(like);

    const messages = db.prepare(`
      SELECT 'message' as type, m.id, m.session_id, m.content,
             m.sent_at as ts, m.role as speaker, s.title as session_title
      FROM ai_messages m
      JOIN sessions s ON s.id = m.session_id
      WHERE m.content LIKE ?
      LIMIT 50
    `).all(like);

    const results = [...transcripts, ...messages].sort((a: any, b: any) => (b.ts || 0) - (a.ts || 0));
    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
