import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const { id } = params;

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const transcripts = db.prepare(
      'SELECT * FROM transcripts WHERE session_id = ? ORDER BY start_at ASC'
    ).all(id);

    const messages = db.prepare(
      'SELECT * FROM ai_messages WHERE session_id = ? ORDER BY sent_at ASC'
    ).all(id);

    const summary = db.prepare('SELECT * FROM summaries WHERE session_id = ?').get(id);

    return NextResponse.json({ session, transcripts, messages, summary });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
