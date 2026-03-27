'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Result {
  id: string;
  type: 'transcript' | 'message';
  session_id: string;
  session_title: string;
  content: string;
  ts: number;
  speaker: string;
}

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text.slice(0, 200)}</>;
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + query.length + 100);
  return (
    <>
      {start > 0 && '…'}
      {text.slice(start, idx)}
      <mark className="bg-[#3b82f6]/30 text-[#93c5fd] rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length, end)}
      {end < text.length && '…'}
    </>
  );
}

function fmt(unix: number) {
  return new Date(unix * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(d => { setResults(Array.isArray(d) ? d : []); setSearched(true); })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Search</h1>
      <div className="relative mb-6">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search transcripts and AI messages…"
          className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-[#e5e5e5] placeholder-[#444] focus:outline-none focus:border-[#3b82f6] text-sm"
          autoFocus
        />
        {loading && <span className="absolute right-4 top-3 text-[#444] text-sm">searching…</span>}
      </div>

      {searched && results.length === 0 && (
        <p className="text-[#666] text-sm">No results for "{q}".</p>
      )}

      <div className="flex flex-col gap-3">
        {results.map(r => (
          <Link key={r.id} href={`/sessions/${r.session_id}`} className="block bg-[#141414] border border-[#262626] rounded-xl p-4 hover:border-[#3b82f6] transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${r.type === 'transcript' ? 'bg-[#1e3a1e] text-green-400' : 'bg-[#1a1f3a] text-blue-400'}`}>
                {r.type === 'transcript' ? r.speaker || 'transcript' : r.speaker}
              </span>
              <span className="text-[#444] text-xs">{fmt(r.ts)}</span>
              <span className="text-[#555] text-xs truncate">{r.session_title}</span>
            </div>
            <p className="text-[#d4d4d4] text-sm leading-relaxed">{highlight(r.content || '', q)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
