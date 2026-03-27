'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Sessions', icon: '🗂' },
  { href: '/search', label: 'Search', icon: '🔍' },
  { href: '/summaries', label: 'Summaries', icon: '📋' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-52 bg-[#0f0f0f] border-r border-[#262626] flex flex-col py-6 px-4 shrink-0">
      <div className="mb-8">
        <span className="text-lg font-semibold text-white">Glass</span>
        <span className="text-xs text-[#666] block">Local Dashboard</span>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-[#888] hover:text-white hover:bg-[#161616]'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
