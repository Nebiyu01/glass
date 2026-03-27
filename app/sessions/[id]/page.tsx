'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Transcript {
  id: string;
  start_at: number;
  speaker: string;
  text: string;
}
interface Message {
  id: string;
  sent_at: number;
  role: string;
  content: string;
  model: string;
}
interface Summary {
  text: string;
  tldr: string;
  bullet_json: string;
  action_json: string;
  generated_at: number;
  model: string;
}
interface Session {
  id: string;
  title: string;
  session_type: string;
  started_at: number;
  ended_at: number | null;
}

function fmt(unix: number | null) {
  if (!unix) return '';
  return new Date(unix * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function Highlight({ text, query }: { text: string; query: string }) {
  return <span>{text}</span>;
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ session: Session; transcripts: Transcript[]; messages: Message[]; summary: Summary | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'transcript' | 'ai' | 'summary'>('transcript');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/sessions/${id}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-[#666] text-sm">Loading…</div>;
  if (error) return <div className="text-red-400 text-sm">Error: {error}</div>;
  if (!data) return null;

  const { session, transcripts, messages, summary } = data;

  let bullets: string[] = [];
  let actions: string[] = [];
  if (summary?.bullet_json) { try { bullets = JSON.parse(summary.bullet_json); } catch {} }
  if (summary?.action_json) { try { actions = JSON.parse(summary.action_json); } catch {} }

  return (
    <div>
      <Link href="/" className="text-[#3b82f6] text-sm hover:underline mb-6 inline-block">← All sessions</Link>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">{session.title || 'Untitled session'}</h1>
        <div className="flex gap-3 mt-1 text-xs text-[#666]">
          <span>{new Date(session.started_at * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
          <span className={`px-2 py-0.5 rounded-full ${session.session_type === 'listen' ? 'bg-[#1e3a1e] text-green-400' : 'bg-[#1a1f3a] text-blue-400'}`}>{session.session_type}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#262626]">
        {(['transcript', 'ai', 'summary'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize transition-colors ${tab === t ? 'text-white border-b-2 border-[#3b82f6]' : 'text-[#666] hover:text-white'}`}
          >
            {t === 'ai' ? `AI Messages (${messages.length})` : t === 'transcript' ? `Transcript (${transcripts.length})` : 'Summary'}
          </button>
        ))}
      </div>

      {tab === 'transcript' && (
        <div className="flex flex-col gap-2">
          {transcripts.length === 0 && <p className="text-[#666] text-sm">No transcripts for this session.</p>}
          {transcripts.map(t => (
            <div key={t.id} className="flex gap-3 items-start bg-[#141414] border border-[#1e1e1e] rounded-lg px-4 py-3">
              <span className="text-[#444] text-xs mt-0.5 w-14 shrink-0">{fmt(t.start_at)}</span>
              <span className={`text-xs font-medium w-10 shrink-0 ${t.speaker === 'Me' ? 'text-[#3b82f6]' : 'text-[#a78bfa]'}`}>{t.speaker || '—'}</span>
              <p className="text-[#d4d4d4] text-sm leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'ai' && (
        <div className="flex flex-col gap-4">
          {messages.length === 0 && <p className="text-[#666] text-sm">No AI messages for this session.</p>}
          {messages.map(m => (
            <div key={m.id} className={`rounded-xl px-5 py-4 ${m.role === 'assistant' ? 'bg-[#141e2e] border border-[#1e3a5f]' : 'bg-[#141414] border border-[#262626]'}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-medium ${m.role === 'assistant' ? 'text-[#3b82f6]' : 'text-[#888]'}`}>{m.role}</span>
                <span className="text-[#444] text-xs">{fmt(m.sent_at)}</span>
                {m.model && m.model !== 'unknown' && <span className="text-[#444] text-xs">{m.model}</span>}
              </div>
              <p className="text-[#d4d4d4] text-sm leading-relaxed whitespace-pre-wrap">{m.content || <span className="text-[#444] italic">empty</span>}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'summary' && (
        <div>
          {!summary ? (
            <p className="text-[#666] text-sm">No summary available for this session.</p>
          ) : (
            <div className="flex flex-col gap-5">
              {summary.tldr && (
                <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
                  <h2 className="text-xs font-semibold text-[#3b82f6] uppercase tracking-wider mb-3">TL;DR</h2>
                  <p className="text-[#d4d4d4] text-sm leading-relaxed">{summary.tldr}</p>
                </div>
              )}
              {summary.text && (
                <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
                  <h2 className="text-xs font-semibold text-[#3b82f6] uppercase tracking-wider mb-3">Full Summary</h2>
                  <p className="text-[#d4d4d4] text-sm leading-relaxed whitespace-pre-wrap">{summary.text}</p>
                </div>
              )}
              {bullets.length > 0 && (
                <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
                  <h2 className="text-xs font-semibold text-[#3b82f6] uppercase tracking-wider mb-3">Key Points</h2>
                  <ul className="flex flex-col gap-2">
                    {bullets.map((b, i) => <li key={i} className="text-[#d4d4d4] text-sm flex gap-2"><span className="text-[#3b82f6] shrink-0">·</span>{b}</li>)}
                  </ul>
                </div>
              )}
              {actions.length > 0 && (
                <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
                  <h2 className="text-xs font-semibold text-[#a78bfa] uppercase tracking-wider mb-3">Action Items</h2>
                  <ul className="flex flex-col gap-2">
                    {actions.map((a, i) => <li key={i} className="text-[#d4d4d4] text-sm flex gap-2"><span className="text-[#a78bfa] shrink-0">✓</span>{a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
