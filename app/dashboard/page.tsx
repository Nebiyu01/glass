'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Stats {
  totalSessions: number;
  totalTranscripts: number;
  totalMessages: number;
  totalSummaries: number;
  recentSession: { id: string; title: string; started_at: number } | null;
  avgDurationSecs: number | null;
  perDay: { day: string; count: number }[];
}

function dur(secs: number | null) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
      <div className="text-[#666] text-xs uppercase tracking-wider mb-1">{label}</div>
      <div className="text-white text-3xl font-semibold">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setStats(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#666] text-sm">Loading…</div>;
  if (error) return <div className="text-red-400 text-sm">Error: {error}</div>;
  if (!stats) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 mb-8 lg:grid-cols-4">
        <Stat label="Sessions" value={stats.totalSessions} />
        <Stat label="Transcripts" value={stats.totalTranscripts} />
        <Stat label="AI Messages" value={stats.totalMessages} />
        <Stat label="Avg Duration" value={dur(stats.avgDurationSecs)} />
      </div>

      {stats.recentSession && (
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 mb-8">
          <div className="text-xs text-[#666] uppercase tracking-wider mb-2">Most Recent Session</div>
          <Link href={`/sessions/${stats.recentSession.id}`} className="text-[#3b82f6] text-sm hover:underline">
            {stats.recentSession.title || 'Untitled session'} →
          </Link>
          <div className="text-[#444] text-xs mt-1">
            {new Date(stats.recentSession.started_at * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
          </div>
        </div>
      )}

      <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
        <div className="text-xs text-[#666] uppercase tracking-wider mb-4">Sessions — Last 30 Days</div>
        {stats.perDay.length === 0 ? (
          <p className="text-[#666] text-sm">No sessions in the last 30 days.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.perDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                labelStyle={{ color: '#888', fontSize: 12 }}
                itemStyle={{ color: '#3b82f6', fontSize: 12 }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
