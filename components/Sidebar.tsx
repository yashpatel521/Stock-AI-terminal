'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Star, Sparkles } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'watchlist', name: 'Watchlist', icon: Star, href: '/stock' },
    { id: 'recommendations', name: 'AI Setup Ideas', icon: Sparkles, href: '/ideas' },
  ] as const;

  return (
    <aside className="w-64 bg-background border-r border-border-custom flex flex-col py-6 h-full shrink-0 z-20 select-none px-4">
      
      {/* Navigation Header Title */}
      <div className="px-4 mb-6">
        <span className="text-[10px] font-bold text-muted-custom uppercase tracking-widest block font-display">
          Terminal Menu
        </span>
      </div>

      {/* Vertical List Navigation */}
      <nav className="w-full flex flex-col gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === 'watchlist' 
            ? pathname.startsWith('/stock') 
            : pathname === tab.href;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`w-full px-4 py-3 flex items-center gap-3.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer relative focus:outline-none ${
                isActive 
                  ? 'text-foreground bg-hover-custom border border-border-custom' 
                  : 'text-muted-custom hover:text-foreground hover:bg-hover-custom border border-transparent'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-green-custom' : 'text-muted-custom'}`} />
              <span>{tab.name}</span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-green-custom rounded-r-md" />
              )}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
