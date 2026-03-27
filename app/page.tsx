'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatTs, duration } from '@/lib/db';

interface Session {
  id: string;
  title: string;
  session_type: string;
  started_at: number;
  ended_at: number | null;
  transcript_count: number;
  first_transcript: string | null;
}

function formatTs2(unix: number | null) {
  if (!unix) return '—';
  return new Date(unix * 1000).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function dur(start: number | null, end: number | null) {
  if (!start || !end) return null;
  const secs = end - start;
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setSessions(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#666] text-sm">Loading sessions…</div>;
  if (error) return <div className="text-red-400 text-sm">Error: {error}</div>;
  if (!sessions.length) return <div className="text-[#666] text-sm">No sessions found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Sessions</h1>
      <div className="flex flex-col gap-3">
        {sessions.map(s => (
          <Link
            key={s.id}
            href={`/sessions/${s.id}`}
            className="block bg-[#141414] border border-[#262626] rounded-xl p-5 hover:border-[#3b82f6] transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm">{s.title || 'Untitled session'}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.session_type === 'listen' ? 'bg-[#1e3a1e] text-green-400' : 'bg-[#1a1f3a] text-blue-400'}`}>
                {s.session_type}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#666] mb-3">
              <span>{formatTs2(s.started_at)}</span>
              {dur(s.started_at, s.ended_at) && <span>· {dur(s.started_at, s.ended_at)}</span>}
              <span>· {s.transcript_count} transcript{s.transcript_count !== 1 ? 's' : ''}</span>
            </div>
            {s.first_transcript && (
              <p className="text-[#888] text-sm truncate">
                {s.first_transcript.slice(0, 120)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
