import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const totalSessions = (db.prepare('SELECT COUNT(*) as n FROM sessions').get() as any).n;
    const totalTranscripts = (db.prepare('SELECT COUNT(*) as n FROM transcripts').get() as any).n;
    const totalMessages = (db.prepare('SELECT COUNT(*) as n FROM ai_messages').get() as any).n;
    const totalSummaries = (db.prepare('SELECT COUNT(*) as n FROM summaries').get() as any).n;

    const recentSession = db.prepare(
      'SELECT * FROM sessions ORDER BY started_at DESC LIMIT 1'
    ).get();

    const avgDuration = db.prepare(`
      SELECT AVG(ended_at - started_at) as avg
      FROM sessions
      WHERE ended_at IS NOT NULL AND started_at IS NOT NULL
    `).get() as any;

    // Sessions per day over last 30 days
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 86400;
    const perDay = db.prepare(`
      SELECT
        date(started_at, 'unixepoch', 'localtime') as day,
        COUNT(*) as count
      FROM sessions
      WHERE started_at >= ?
      GROUP BY day
      ORDER BY day ASC
    `).all(thirtyDaysAgo);

    return NextResponse.json({
      totalSessions,
      totalTranscripts,
      totalMessages,
      totalSummaries,
      recentSession,
      avgDurationSecs: avgDuration?.avg ?? null,
      perDay,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
