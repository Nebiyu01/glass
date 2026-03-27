'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Summary {
  session_id: string;
  session_title: string;
  started_at: number;
  text: string;
  tldr: string;
  bullet_json: string;
  action_json: string;
  generated_at: number;
  model: string;
}

function fmt(unix: number) {
  return new Date(unix * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/summaries')
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setSummaries(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#666] text-sm">Loading summaries…</div>;
  if (error) return <div className="text-red-400 text-sm">Error: {error}</div>;
  if (!summaries.length) return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-4">Summaries</h1>
      <p className="text-[#666] text-sm">No summaries generated yet. Summaries are created automatically during Listen sessions.</p>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">Summaries</h1>
      <div className="flex flex-col gap-4">
        {summaries.map(s => {
          let bullets: string[] = [];
          let actions: string[] = [];
          try { bullets = JSON.parse(s.bullet_json || '[]'); } catch {}
          try { actions = JSON.parse(s.action_json || '[]'); } catch {}
          const isOpen = expanded === s.session_id;

          return (
            <div key={s.session_id} className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
                onClick={() => setExpanded(isOpen ? null : s.session_id)}
              >
                <div>
                  <div className="text-white text-sm font-medium">{s.session_title || 'Untitled session'}</div>
                  <div className="text-[#666] text-xs mt-1">{fmt(s.started_at)} · {s.model}</div>
                </div>
                <span className="text-[#444] text-lg">{isOpen ? '−' : '+'}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-[#1e1e1e] pt-4 flex flex-col gap-4">
                  {s.tldr && (
                    <div>
                      <h3 className="text-xs text-[#3b82f6] font-semibold uppercase tracking-wider mb-2">TL;DR</h3>
                      <p className="text-[#d4d4d4] text-sm leading-relaxed">{s.tldr}</p>
                    </div>
                  )}
                  {bullets.length > 0 && (
                    <div>
                      <h3 className="text-xs text-[#3b82f6] font-semibold uppercase tracking-wider mb-2">Key Points</h3>
                      <ul className="flex flex-col gap-1.5">
                        {bullets.map((b, i) => <li key={i} className="text-[#d4d4d4] text-sm flex gap-2"><span className="text-[#3b82f6] shrink-0">·</span>{b}</li>)}
                      </ul>
                    </div>
                  )}
                  {actions.filter((a: string) => a.startsWith('❓') || a.startsWith('✨') || a.startsWith('💬') ? false : true).length > 0 && (
                    <div>
                      <h3 className="text-xs text-[#a78bfa] font-semibold uppercase tracking-wider mb-2">Action Items</h3>
                      <ul className="flex flex-col gap-1.5">
                        {actions.map((a, i) => <li key={i} className="text-[#d4d4d4] text-sm flex gap-2"><span className="text-[#a78bfa] shrink-0">✓</span>{a}</li>)}
                      </ul>
                    </div>
                  )}
                  <Link href={`/sessions/${s.session_id}`} className="text-[#3b82f6] text-xs hover:underline mt-1 inline-block">
                    View full session →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
