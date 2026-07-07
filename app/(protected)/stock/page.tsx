'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStockStore } from '@/store/useStockStore';
import { useRouter } from 'next/navigation';
import { 
  Trash2, 
  Star, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

export default function StockMainPage() {
  const {
    watchlist,
    prices,
    setWatchlist,
    removeSymbol,
    setSelectedSymbol,
    initializePrice,
    updateLivePrice,
    clearFlash,
  } = useStockStore();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<Record<string, string>>({});
  const socketRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  // 1. Fetch initial watchlist & token
  useEffect(() => {
    async function loadData() {
      try {
        const tokenRes = await fetch('/api/token');
        const tokenData = await tokenRes.json();
        setToken(tokenData.token);

        const wlRes = await fetch('/api/watchlist');
        const wlData = await wlRes.json();
        if (wlData.success) {
          const symbols = wlData.watchlist.map((item: any) => item.symbol);
          setWatchlist(symbols);
          
          for (const sym of symbols) {
            await initStockPrice(sym);
          }
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    }
    loadData();
  }, []);

  // Sync quotes and profile details if new symbol added
  useEffect(() => {
    watchlist.forEach((sym) => {
      if (!prices[sym]) {
        initStockPrice(sym);
      }
      if (!names[sym]) {
        fetchProfileName(sym);
      }
    });
  }, [watchlist, prices]);

  // WebSocket prices
  useEffect(() => {
    if (!token || watchlist.length === 0) return;

    const socket = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => {
      watchlist.forEach((sym) => {
        socket.send(JSON.stringify({ type: 'subscribe', symbol: sym }));
      });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'trade' && Array.isArray(data.data)) {
          const latestPrices: Record<string, number> = {};
          data.data.forEach((trade: any) => {
            latestPrices[trade.s] = trade.p;
          });
          
          Object.entries(latestPrices).forEach(([sym, price]) => {
            updateLivePrice(sym, price);
            setTimeout(() => {
              clearFlash(sym);
            }, 1000);
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        watchlist.forEach((sym) => {
          socket.send(JSON.stringify({ type: 'unsubscribe', symbol: sym }));
        });
      }
      socket.close();
      socketRef.current = null;
    };
  }, [token, watchlist.join(',')]);

  const initStockPrice = async (symbol: string) => {
    try {
      const res = await fetch(`/api/quote?symbol=${symbol}`);
      const data = await res.json();
      if (data.success && data.quote) {
        initializePrice(symbol, data.quote.c || 0, data.quote.pc || 0, data.quote.h || 0, data.quote.l || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfileName = async (symbol: string) => {
    try {
      const res = await fetch(`/api/stock-info?symbol=${symbol}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setNames((prev) => ({ ...prev, [symbol]: data.profile.name }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStock = async (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();
      if (data.success) {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'unsubscribe', symbol }));
        }
        removeSymbol(symbol);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSuggestedSymbol = async (suggested: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: suggested }),
      });
      const data = await res.json();
      if (data.success) {
        const symbols = data.watchlist.map((item: any) => item.symbol);
        setWatchlist(symbols);
        await initStockPrice(suggested);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Summary stats
  const totalTickers = watchlist.length;
  const gainers = watchlist.filter(s => prices[s]?.change >= 0).length;
  const losers = watchlist.filter(s => prices[s]?.change < 0).length;

  return (
    <div className="flex-1 p-6 bg-background overflow-y-auto h-full space-y-5 select-none animate-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-foreground font-display tracking-tight">Watchlist</h2>
          <p className="text-[11px] text-muted-custom mt-0.5">Real-time streaming quotes · Click any row to analyze</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-custom opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-custom"></span>
          </span>
          <span className="text-[10px] text-muted-custom font-semibold">Live</span>
        </div>
      </div>

      {/* Quick Stats Bar */}
      {totalTickers > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-panel border border-border-custom rounded-lg">
            <BarChart3 className="h-3 w-3 text-muted-custom" />
            <span className="text-[10px] font-bold text-foreground">{totalTickers}</span>
            <span className="text-[10px] text-muted-custom font-semibold">Total</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-custom/5 border border-green-custom/15 rounded-lg">
            <TrendingUp className="h-3 w-3 text-green-custom" />
            <span className="text-[10px] font-bold text-green-custom">{gainers}</span>
            <span className="text-[10px] text-green-custom/70 font-semibold">Gainers</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-custom/5 border border-red-custom/15 rounded-lg">
            <TrendingDown className="h-3 w-3 text-red-custom" />
            <span className="text-[10px] font-bold text-red-custom">{losers}</span>
            <span className="text-[10px] text-red-custom/70 font-semibold">Losers</span>
          </div>
        </div>
      )}

      {watchlist.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-panel border border-border-custom flex items-center justify-center mb-5 shadow-sm">
            <Star className="h-7 w-7 text-muted-custom" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1 font-display">No tickers in your watchlist</h3>
          <p className="text-xs text-muted-custom text-center max-w-xs leading-relaxed mb-6">
            Use the search bar above to find and track stocks. Or quick-add one of these popular tickers:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL'].map((s) => (
              <button
                key={s}
                onClick={() => handleAddSuggestedSymbol(s)}
                disabled={loading}
                className="px-4 py-2 bg-panel hover:bg-hover-custom border border-border-custom hover:border-green-custom/40 rounded-xl text-xs font-bold text-foreground hover:text-green-custom transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1"
              >
                <span className="text-green-custom">+</span>{s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Stock Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {watchlist.map((symbol) => {
            const info = prices[symbol];
            const name = names[symbol] || 'Loading...';
            const isPositive = info ? info.change >= 0 : true;

            let flashClass = '';
            if (info?.isGrowing === 'up') flashClass = 'flash-green-bg';
            if (info?.isGrowing === 'down') flashClass = 'flash-red-bg';

            return (
              <div
                key={symbol}
                onClick={() => {
                  setSelectedSymbol(symbol);
                  router.push(`/stock/${symbol}`);
                }}
                className={`bg-panel border border-border-custom rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-foreground/15 group relative overflow-hidden ${flashClass}`}
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-custom/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <div className="relative z-10">
                  {/* Top: Symbol, Name, Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-background border border-border-custom flex items-center justify-center font-extrabold text-[11px] text-foreground font-display group-hover:border-green-custom/30 transition-colors">
                        {symbol.slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-foreground tracking-wider font-display uppercase">{symbol}</span>
                        <span className="text-[10px] text-muted-custom font-semibold truncate max-w-[140px]">{name}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRemoveStock(e, symbol)}
                      className="p-1.5 rounded-lg text-muted-custom/40 hover:text-red-custom hover:bg-red-custom/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-end justify-between mb-3">
                    <span className={`text-xl font-mono font-extrabold tabular-nums transition-all duration-200 ${
                      info?.isGrowing === 'up' ? 'text-green-custom' :
                      info?.isGrowing === 'down' ? 'text-red-custom' : 'text-foreground'
                    }`}>
                      {info ? `$${info.price.toFixed(2)}` : '—'}
                    </span>
                    {info && (
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 ${
                        isPositive ? 'bg-green-custom/10 text-green-custom' : 'bg-red-custom/10 text-red-custom'
                      }`}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {isPositive ? '+' : ''}{info.changePercent.toFixed(2)}%
                      </span>
                    )}
                  </div>

                  {/* Daily Range Bar */}
                  {info && info.high > 0 && info.low > 0 && (
                    <div className="mt-1">
                      <div className="flex justify-between text-[9px] text-muted-custom font-semibold mb-1">
                        <span>L ${info.low.toFixed(2)}</span>
                        <span>H ${info.high.toFixed(2)}</span>
                      </div>
                      <div className="h-1 bg-hover-custom rounded-full overflow-hidden relative">
                        <div 
                          className="absolute h-full bg-gradient-to-r from-red-custom via-amber-500 to-green-custom rounded-full"
                          style={{ width: '100%' }}
                        />
                        {/* Current price indicator */}
                        {info.high !== info.low && (
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-foreground rounded-full border-2 border-panel shadow-sm"
                            style={{ 
                              left: `${Math.min(100, Math.max(0, ((info.price - info.low) / (info.high - info.low)) * 100))}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom: Analyze CTA */}
                  <div className="mt-4 pt-3 border-t border-border-custom/50 flex items-center justify-between">
                    <span className="text-[9px] text-muted-custom font-semibold uppercase tracking-wider">US Market · Live</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-custom group-hover:text-green-custom transition-colors">
                      <span>Analyze</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
