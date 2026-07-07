'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStockStore } from '@/store/useStockStore';
import { TrendingUp, Sparkles, Brain, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

export default function DashboardOverview() {
  const router = useRouter();
  const { user, watchlist, prices, setSelectedSymbol } = useStockStore();

  const handleStockClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    router.push(`/stock/${symbol}`);
  };

  return (
    <div className="flex-1 p-6 bg-background overflow-y-auto h-full space-y-6 select-none animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="p-6 bg-panel border border-border-custom rounded-2xl relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-100 h-full bg-green-custom/5 blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-extrabold text-foreground mb-1.5 font-display tracking-tight">
            Welcome to Stock AI Terminal
          </h2>
          <p className="text-xs text-muted-custom max-w-xl leading-relaxed">
            Welcome back, <span className="text-green-custom font-bold">{user?.username}</span>. Live feeds are active. Toggle between your watchlist and AI-generated setup ideas using the sidebar.
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Watchlist Summary card */}
        <div className="bg-panel border border-border-custom rounded-2xl p-5 shadow-sm flex flex-col">
          <h3 className="text-xs font-bold text-foreground mb-4 flex items-center justify-between border-b border-border-custom pb-3 font-display uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-custom" /> Watchlist Overview
            </span>
            <span className="text-[10px] text-muted-custom font-semibold bg-background border border-border-custom px-2 py-0.5 rounded">
              {watchlist.length} Tickers Tracked
            </span>
          </h3>

          {watchlist.length === 0 ? (
            <div className="text-center py-10 text-muted-custom text-xs flex-1 flex flex-col justify-center items-center">
              <span className="mb-2">Your watchlist is currently empty.</span>
              <button 
                onClick={() => router.push('/stock')}
                className="text-green-custom font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                Go add symbols <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-55 overflow-y-auto pr-1">
              {watchlist.map((symbol) => {
                const info = prices[symbol];
                const priceStr = info ? `$${info.price.toFixed(2)}` : 'Loading...';
                const isPositive = info ? info.change >= 0 : true;
                const changeStr = info ? `${isPositive ? '+' : ''}${info.changePercent.toFixed(2)}%` : '';
                return (
                  <div 
                    key={symbol}
                    onClick={() => handleStockClick(symbol)}
                    className="p-3 bg-hover-custom/20 hover:bg-hover-custom border border-border-custom/50 hover:border-border-custom rounded-xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground tracking-wide uppercase">{symbol}</span>
                      <span className="text-[9px] text-muted-custom font-semibold">US Market</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-foreground">{priceStr}</span>
                      {info && (
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center ${
                          isPositive ? 'bg-green-custom/10 text-green-custom' : 'bg-red-custom/10 text-red-custom'
                        }`}>
                          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
                          {changeStr}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Catalyst Widget */}
        <div className="bg-panel border border-border-custom rounded-2xl p-5 shadow-sm flex flex-col">
          <h3 className="text-xs font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border-custom pb-3 font-display uppercase tracking-wider">
            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" /> AI Market Summary
          </h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            
            <div className="p-3.5 bg-background rounded-xl border border-border-custom">
              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block mb-1 tracking-wider font-display">Macro Sentiment</span>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Aggregated sentiment indices score the macro trend as <span className="text-green-custom font-bold">Moderately Bullish</span>. Technology and Semiconductor indices show strong volume expansions.
              </p>
            </div>

            <div className="p-3.5 bg-background rounded-xl border border-border-custom">
              <span className="text-[10px] uppercase font-bold text-green-custom block mb-1 tracking-wider font-display">Sector Catalyst</span>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Heavy institutional rotations detected in energy and commodities sectors, driven by key macro inflation updates. High confidence buy alerts registered for SaaS structures.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Analyze Watchlist',
            desc: 'Analyze trends and plan trades for watchlist stocks.',
            href: '/stock',
            icon: TrendingUp,
            color: 'text-green-custom',
            badgeColor: 'bg-green-custom/10 border-green-custom/25 hover:border-green-custom/50'
          },
          {
            title: 'Discover AI Ideas',
            desc: 'Browse momentum and value stock recommendation candidates.',
            href: '/ideas',
            icon: Sparkles,
            color: 'text-purple-600 dark:text-purple-400',
            badgeColor: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40'
          },
          {
            title: 'Terminal Specs',
            desc: 'Review developer guidelines and open source config schemas.',
            href: '/dashboard',
            icon: Compass,
            color: 'text-muted-custom',
            badgeColor: 'bg-background border-border-custom hover:border-foreground/30'
          }
        ].map((act, index) => {
          const Icon = act.icon;
          return (
            <div 
              key={index}
              onClick={() => router.push(act.href)}
              className="p-5 bg-panel hover:bg-hover-custom border border-border-custom hover:border-foreground/30 rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-32.5 group hover:-translate-y-0.5 hover:shadow-md duration-200"
            >
              <div className="flex justify-between items-start">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${act.badgeColor} border`}>
                  <Icon className={`h-4.5 w-4.5 ${act.color}`} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-custom group-hover:text-foreground transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground mb-1 font-display uppercase tracking-wider">{act.title}</h4>
                <p className="text-[10px] text-muted-custom leading-relaxed">{act.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// Inline helper for right arrow
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2.5} 
      stroke="currentColor" 
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
