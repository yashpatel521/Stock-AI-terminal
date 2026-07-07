'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStockStore } from '@/store/useStockStore';
import { 
  TrendingUp, 
  Sparkles, 
  Brain, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  BarChart3,
  Clock,
  Zap,
  ChevronRight,
  Star,
  Layers
} from 'lucide-react';

export default function DashboardOverview() {
  const router = useRouter();
  const { user, watchlist, prices, setSelectedSymbol } = useStockStore();
  const [latestScans, setLatestScans] = useState<any[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch latest market scan
  useEffect(() => {
    async function fetchScans() {
      try {
        const res = await fetch('/api/market-scan');
        const data = await res.json();
        if (data.success && data.scans && data.scans.length > 0) {
          const latest = data.scans[0];
          const parsed = JSON.parse(latest.results);
          setLatestScans(parsed);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingScans(false);
      }
    }

    async function fetchAnalyses() {
      try {
        const res = await fetch('/api/analyze');
        const data = await res.json();
        if (data.success && data.history) {
          setRecentAnalyses(data.history.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAnalyses(false);
      }
    }

    fetchScans();
    fetchAnalyses();
  }, []);

  const handleStockClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    router.push(`/stock/${symbol}`);
  };

  // Portfolio summary calculations
  const totalTickers = watchlist.length;
  const gainers = watchlist.filter(s => prices[s]?.change >= 0).length;
  const losers = watchlist.filter(s => prices[s]?.change < 0).length;
  const avgChange = totalTickers > 0 
    ? watchlist.reduce((acc, s) => acc + (prices[s]?.changePercent || 0), 0) / totalTickers 
    : 0;

  const topMover = watchlist.length > 0
    ? watchlist.reduce((best, s) => {
        const curr = Math.abs(prices[s]?.changePercent || 0);
        const bestVal = Math.abs(prices[best]?.changePercent || 0);
        return curr > bestVal ? s : best;
      }, watchlist[0])
    : null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 p-6 bg-background overflow-y-auto h-full space-y-6 select-none animate-fade-in">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border-custom bg-panel shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-green-custom/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-custom/8 blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-green-custom/10 text-green-custom px-2 py-0.5 rounded-full border border-green-custom/20 font-bold uppercase tracking-wider font-display flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-custom animate-pulse"></span> Live Session
              </span>
              <span className="text-[10px] bg-background text-muted-custom px-2 py-0.5 rounded-full border border-border-custom font-semibold">
                {formatDate(currentTime)}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground font-display tracking-tight leading-tight">
              Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}, <span className="text-green-custom">{user?.username}</span>
            </h1>
            <p className="text-xs text-muted-custom mt-1.5 max-w-md leading-relaxed">
              Your terminal is active. {totalTickers} tickers streaming, {recentAnalyses.length} AI reports generated.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-3xl font-mono font-bold text-foreground tabular-nums tracking-tight">
              {formatTime(currentTime)}
            </span>
            <span className="text-[10px] text-muted-custom font-semibold uppercase tracking-wider">Market Clock</span>
          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Tracked Tickers', 
            value: totalTickers.toString(), 
            icon: Star, 
            color: 'text-green-custom',
            bgColor: 'bg-green-custom/10',
            sub: 'Active watchlist'
          },
          { 
            label: 'Gainers', 
            value: gainers.toString(), 
            icon: ArrowUpRight, 
            color: 'text-green-custom',
            bgColor: 'bg-green-custom/10',
            sub: 'Positive today'
          },
          { 
            label: 'Losers', 
            value: losers.toString(), 
            icon: ArrowDownRight, 
            color: 'text-red-custom',
            bgColor: 'bg-red-custom/10',
            sub: 'Negative today'
          },
          { 
            label: 'Avg Return', 
            value: `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`, 
            icon: BarChart3, 
            color: avgChange >= 0 ? 'text-green-custom' : 'text-red-custom',
            bgColor: avgChange >= 0 ? 'bg-green-custom/10' : 'bg-red-custom/10',
            sub: 'Portfolio average'
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-panel border border-border-custom rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-muted-custom tracking-wider font-display">{stat.label}</span>
                <div className={`h-7 w-7 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
              </div>
              <span className={`text-xl font-mono font-extrabold ${stat.color}`}>{stat.value}</span>
              <span className="text-[9px] text-muted-custom block mt-0.5 font-semibold">{stat.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column: Watchlist + Top Mover */}
        <div className="xl:col-span-2 space-y-6">

          {/* Watchlist Live Ticker Tape */}
          <div className="bg-panel border border-border-custom rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border-custom">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2 font-display uppercase tracking-wider">
                <Activity className="h-4 w-4 text-green-custom" /> Live Watchlist Feed
              </h3>
              <button 
                onClick={() => router.push('/stock')}
                className="text-[10px] font-bold text-muted-custom hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {watchlist.length === 0 ? (
              <div className="p-10 text-center">
                <div className="h-12 w-12 rounded-full bg-background border border-border-custom flex items-center justify-center mx-auto mb-3">
                  <Star className="h-5 w-5 text-muted-custom" />
                </div>
                <p className="text-xs text-muted-custom mb-3">No tickers in your watchlist yet.</p>
                <button 
                  onClick={() => router.push('/stock')}
                  className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  Add Stocks
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border-custom/50">
                {watchlist.slice(0, 6).map((symbol) => {
                  const info = prices[symbol];
                  const isPositive = info ? info.change >= 0 : true;

                  let flashClass = '';
                  if (info?.isGrowing === 'up') flashClass = 'flash-green-bg';
                  if (info?.isGrowing === 'down') flashClass = 'flash-red-bg';

                  return (
                    <div
                      key={symbol}
                      onClick={() => handleStockClick(symbol)}
                      className={`px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-hover-custom transition-all duration-150 group ${flashClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-background border border-border-custom flex items-center justify-center font-extrabold text-[10px] text-foreground font-display group-hover:border-green-custom/40 transition-colors">
                          {symbol.slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-extrabold text-foreground tracking-wider font-display uppercase">{symbol}</span>
                          <span className="text-[9px] text-muted-custom font-semibold">US Market</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono font-bold text-foreground tabular-nums">
                          {info ? `$${info.price.toFixed(2)}` : '—'}
                        </span>
                        {info && (
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-0.5 ${
                            isPositive ? 'bg-green-custom/10 text-green-custom' : 'bg-red-custom/10 text-red-custom'
                          }`}>
                            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {isPositive ? '+' : ''}{info.changePercent.toFixed(2)}%
                          </span>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-custom/50 group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  );
                })}
                {watchlist.length > 6 && (
                  <button
                    onClick={() => router.push('/stock')}
                    className="w-full py-3 text-[10px] text-muted-custom hover:text-foreground font-bold uppercase tracking-wider hover:bg-hover-custom transition-all cursor-pointer"
                  >
                    +{watchlist.length - 6} more tickers →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Latest AI Market Scan Results */}
          <div className="bg-panel border border-border-custom rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border-custom">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2 font-display uppercase tracking-wider">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Latest /stockreport Scan
              </h3>
              <button 
                onClick={() => router.push('/ideas')}
                className="text-[10px] font-bold text-muted-custom hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
              >
                Run New Scan <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {loadingScans ? (
              <div className="p-8 text-center text-xs text-muted-custom">Loading scan data...</div>
            ) : latestScans.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-muted-custom mb-3">No market scans executed yet.</p>
                <button 
                  onClick={() => router.push('/ideas')}
                  className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  Go to AI Scanner
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] uppercase font-bold text-muted-custom font-display tracking-wider border-b border-border-custom/50">
                      <th className="py-3 px-5">#</th>
                      <th className="py-3 px-5">Stock</th>
                      <th className="py-3 px-5 text-center">Bias</th>
                      <th className="py-3 px-5 text-right">Day Range</th>
                      <th className="py-3 px-5 text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom/30 text-xs">
                    {latestScans.map((row: any) => {
                      const isBullish = row.bias === 'bullish';
                      return (
                        <tr 
                          key={row.rank} 
                          onClick={() => handleStockClick(row.symbol)}
                          className="hover:bg-hover-custom cursor-pointer transition-colors group"
                        >
                          <td className="py-3 px-5 font-bold text-muted-custom">{row.rank}</td>
                          <td className="py-3 px-5 font-extrabold text-foreground font-display uppercase tracking-wider">{row.symbol}</td>
                          <td className="py-3 px-5 text-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg capitalize ${
                              isBullish ? 'bg-green-custom/10 text-green-custom' : 'bg-red-custom/10 text-red-custom'
                            }`}>
                              {row.bias}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-right font-mono text-[11px] text-muted-custom">
                            <span className="text-red-custom">{row.dayLow}</span>
                            <span className="mx-1 text-border-custom">/</span>
                            <span className="text-green-custom">{row.dayHigh}</span>
                          </td>
                          <td className="py-3 px-5 text-center">
                            <span className="font-mono font-bold text-foreground">{row.confidence}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">

          {/* Top Mover Spotlight */}
          {topMover && prices[topMover] && (
            <div 
              onClick={() => handleStockClick(topMover)}
              className="bg-panel border border-border-custom rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-custom/8 blur-[40px] pointer-events-none"></div>
              <div className="relative z-10">
                <span className="text-[9px] uppercase font-bold text-muted-custom tracking-wider font-display block mb-2">Top Mover Today</span>
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground font-display uppercase tracking-tight">{topMover}</h3>
                    <span className="text-sm font-mono font-bold text-foreground mt-1 block">${prices[topMover].price.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-lg font-mono font-extrabold ${
                      prices[topMover].change >= 0 ? 'text-green-custom' : 'text-red-custom'
                    }`}>
                      {prices[topMover].change >= 0 ? '+' : ''}{prices[topMover].changePercent.toFixed(2)}%
                    </span>
                    <span className="text-[9px] text-muted-custom font-semibold mt-0.5">
                      H: ${prices[topMover].high.toFixed(2)} · L: ${prices[topMover].low.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent AI Reports */}
          <div className="bg-panel border border-border-custom rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border-custom">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2 font-display uppercase tracking-wider">
                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Recent Reports
              </h3>
              <span className="text-[10px] text-muted-custom font-semibold bg-background border border-border-custom px-2 py-0.5 rounded">
                {recentAnalyses.length}
              </span>
            </div>

            {loadingAnalyses ? (
              <div className="p-6 text-center text-xs text-muted-custom">Loading...</div>
            ) : recentAnalyses.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-custom">
                <p className="mb-2">No AI reports yet.</p>
                <button 
                  onClick={() => router.push('/stock')}
                  className="text-green-custom font-bold hover:underline cursor-pointer text-[10px]"
                >
                  Analyze a stock →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border-custom/50">
                {recentAnalyses.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleStockClick(item.symbol)}
                    className="px-5 py-3 hover:bg-hover-custom cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-foreground font-display uppercase">{item.symbol}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded capitalize ${
                          item.trend === 'bullish' ? 'bg-green-custom/10 text-green-custom' :
                          item.trend === 'bearish' ? 'bg-red-custom/10 text-red-custom' : 
                          'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                        }`}>
                          {item.trend}
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-custom font-semibold mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">{item.confidenceScore}%</span>
                      <span className="text-[8px] text-muted-custom font-semibold">confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2">
            {[
              { title: 'Stock Watchlist', desc: 'Live prices & analysis cockpit', href: '/stock', icon: TrendingUp, color: 'text-green-custom' },
              { title: 'AI Market Scanner', desc: 'Run /stockreport macro scans', href: '/ideas', icon: Sparkles, color: 'text-purple-600 dark:text-purple-400' },
            ].map((nav, i) => {
              const Icon = nav.icon;
              return (
                <div 
                  key={i}
                  onClick={() => router.push(nav.href)}
                  className="bg-panel border border-border-custom hover:border-foreground/20 rounded-xl p-3.5 cursor-pointer transition-all flex items-center justify-between group hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-background border border-border-custom flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className={`h-4 w-4 ${nav.color}`} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block font-display">{nav.title}</span>
                      <span className="text-[9px] text-muted-custom font-semibold">{nav.desc}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-custom/50 group-hover:text-foreground transition-colors" />
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
