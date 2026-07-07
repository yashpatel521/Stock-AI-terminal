'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStockStore } from '@/store/useStockStore';
import { useRouter } from 'next/navigation';
import { 
  Trash2, 
  Star, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight 
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

  return (
    <div className="flex-1 p-6 bg-background overflow-y-auto h-full space-y-6 select-none animate-fade-in">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-border-custom pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground font-display tracking-tight">Your Stock Watchlist</h2>
          <p className="text-xs text-muted-custom">Real-time quote streaming and terminal workspace selector</p>
        </div>
        <span className="text-[10px] bg-green-custom/10 text-green-custom px-2.5 py-1 rounded-lg border border-green-custom/20 font-bold tracking-wider uppercase font-display">
          Streaming Active
        </span>
      </div>

      {watchlist.length === 0 ? (
        <div className="bg-panel border border-border-custom rounded-2xl p-10 text-center max-w-lg mx-auto shadow-sm">
          <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center mx-auto mb-4 border border-border-custom">
            <Star className="h-5 w-5 text-muted-custom" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1.5 font-display uppercase tracking-wider">No Tickers Tracked</h3>
          <p className="text-xs text-muted-custom leading-relaxed mb-6">
            Search for stocks in the bar above to begin tracking and analyzing daily price changes. Or try suggestions:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['AAPL', 'TSLA', 'NVDA', 'MSFT'].map((s) => (
              <button
                key={s}
                onClick={() => handleAddSuggestedSymbol(s)}
                disabled={loading}
                className="px-3.5 py-1.5 bg-background hover:bg-green-custom/10 border border-border-custom hover:border-green-custom/40 rounded-xl text-xs font-bold text-foreground hover:text-green-custom transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                +{s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-panel border border-border-custom rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-custom text-[10px] uppercase font-bold text-muted-custom bg-background font-display tracking-wider">
                  <th className="py-4 px-6">Asset</th>
                  <th className="py-4 px-6 text-right">Current Price</th>
                  <th className="py-4 px-6 text-right">24h Return</th>
                  <th className="py-4 px-6 text-right">Daily Range</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/50 text-xs">
                {watchlist.map((symbol) => {
                  const info = prices[symbol];
                  const name = names[symbol] || 'Loading profile...';
                  const isPositive = info ? info.change >= 0 : true;

                  let flashClass = '';
                  if (info?.isGrowing === 'up') flashClass = 'flash-green-bg';
                  if (info?.isGrowing === 'down') flashClass = 'flash-red-bg';

                  return (
                    <tr
                      key={symbol}
                      onClick={() => {
                        setSelectedSymbol(symbol);
                        router.push(`/stock/${symbol}`);
                      }}
                      className={`hover:bg-hover-custom cursor-pointer transition-colors duration-150 group ${flashClass}`}
                    >
                      {/* Asset Symbol & Name */}
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-foreground text-sm tracking-wider font-display">{symbol}</span>
                          <span className="text-[10px] text-muted-custom font-semibold truncate max-w-[180px]">{name}</span>
                        </div>
                      </td>
                      
                      {/* Current Price */}
                      <td className="py-4 px-6 text-right font-mono font-bold text-foreground text-sm">
                        {info ? `$${info.price.toFixed(2)}` : 'Loading...'}
                      </td>

                      {/* 24h Return */}
                      <td className="py-4 px-6 text-right">
                        {info ? (
                          <span className={`inline-flex items-center font-mono font-bold px-2 py-0.5 rounded-lg ${
                            isPositive ? 'bg-green-custom/10 text-green-custom' : 'bg-red-custom/10 text-red-custom'
                          }`}>
                            {isPositive ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
                            {isPositive ? '+' : ''}{info.changePercent.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-muted-custom">-</span>
                        )}
                      </td>

                      {/* Daily Range */}
                      <td className="py-4 px-6 text-right font-mono font-bold text-xs">
                        {info ? (
                          <div className="inline-flex items-center gap-1.5 justify-end w-full">
                            <span className="text-green-custom">${info.high.toFixed(2)}</span>
                            <span className="text-muted-custom/60 text-[9px] font-sans">H</span>
                            <span className="text-border-custom">|</span>
                            <span className="text-red-custom">${info.low.toFixed(2)}</span>
                            <span className="text-muted-custom/60 text-[9px] font-sans">L</span>
                          </div>
                        ) : (
                          <span className="text-muted-custom">-</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSymbol(symbol);
                              router.push(`/stock/${symbol}`);
                            }}
                            className="p-1.5 rounded-lg bg-background hover:bg-green-custom text-muted-custom hover:text-white transition-colors cursor-pointer"
                            title="Analyze Ticker"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleRemoveStock(e, symbol)}
                            className="p-1.5 rounded-lg bg-background hover:bg-red-custom/10 text-muted-custom hover:text-red-custom transition-colors cursor-pointer"
                            title="Remove Stock"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
