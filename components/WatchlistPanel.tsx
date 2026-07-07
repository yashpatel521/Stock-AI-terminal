'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStockStore } from '../store/useStockStore';
import { useRouter } from 'next/navigation';
import { Trash2, TrendingUp, TrendingDown, Star } from 'lucide-react';

export default function WatchlistPanel() {
  const {
    watchlist,
    prices,
    selectedSymbol,
    setWatchlist,
    addSymbol,
    removeSymbol,
    setSelectedSymbol,
    initializePrice,
    updateLivePrice,
    clearFlash,
  } = useStockStore();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  // 1. Fetch Finnhub Token & initial watchlist
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch Token
        const tokenRes = await fetch('/api/token');
        const tokenData = await tokenRes.json();
        setToken(tokenData.token);

        // Fetch Watchlist
        const wlRes = await fetch('/api/watchlist');
        const wlData = await wlRes.json();
        if (wlData.success) {
          const symbols = wlData.watchlist.map((item: any) => item.symbol);
          setWatchlist(symbols);
          
          // Initialize prices for existing symbols
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

  // 1.5. Watch list price sync effect
  useEffect(() => {
    watchlist.forEach((sym) => {
      if (!prices[sym]) {
        initStockPrice(sym);
      }
    });
  }, [watchlist, prices]);

  // 2. Manage WebSocket Connection
  useEffect(() => {
    if (!token || watchlist.length === 0) return;

    // Create Socket
    const socket = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('Finnhub WebSocket connected');
      // Subscribe to all watchlist symbols
      watchlist.forEach((sym) => {
        socket.send(JSON.stringify({ type: 'subscribe', symbol: sym }));
      });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'trade' && Array.isArray(data.data)) {
          // Process trades (grab latest price for each symbol in batch)
          const latestPrices: Record<string, number> = {};
          data.data.forEach((trade: any) => {
            latestPrices[trade.s] = trade.p;
          });
          
          Object.entries(latestPrices).forEach(([sym, price]) => {
            updateLivePrice(sym, price);
            // Trigger clear flash after 1 second
            setTimeout(() => {
              clearFlash(sym);
            }, 1000);
          });
        }
      } catch (err) {
        console.error('WS message error:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('WS Error:', err);
    };

    socket.onclose = () => {
      console.log('Finnhub WebSocket disconnected');
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
  }, [token, watchlist.join(',')]); // reconnect/resubscribe if list changes

  // Helper to fetch quote and initialize pricing state
  const initStockPrice = async (symbol: string) => {
    try {
      const res = await fetch(`/api/quote?symbol=${symbol}`);
      const data = await res.json();
      if (data.success && data.quote) {
        initializePrice(symbol, data.quote.c || 0, data.quote.pc || 0, data.quote.h || 0, data.quote.l || 0);
      }
    } catch (err) {
      console.error(`Error initializing price for ${symbol}:`, err);
    }
  };

  // Remove stock from watchlist
  const handleRemoveStock = async (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation(); // prevent row selection
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
        if (selectedSymbol === symbol) {
          setSelectedSymbol(null);
        }
      }
    } catch (err) {
      console.error('Failed to remove symbol:', err);
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
      console.error('Failed to add suggested symbol:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-80 border-r border-[#2A2E39] bg-[#0E1118] flex flex-col h-full shrink-0 select-none">
      
      {/* Sleek Minimal Header */}
      <div className="p-4 border-b border-[#2A2E39] bg-[#131722]/30 flex items-center justify-between">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">Watchlist</h2>
        <span className="text-[10px] font-semibold text-[#848E9C] bg-[#1E222D] px-2 py-0.5 rounded border border-[#2A2E39]/60">
          {watchlist.length} symbols
        </span>
      </div>

      {/* Flat Ticker List */}
      <div className="flex-1 overflow-y-auto">
        {watchlist.length === 0 ? (
          <div className="p-8 text-center">
            <div className="h-9 w-9 rounded-full bg-[#1E222D] flex items-center justify-center mx-auto mb-3 border border-[#2A2E39]">
              <Star className="h-4 w-4 text-[#848E9C]" />
            </div>
            <p className="text-xs text-[#848E9C] leading-relaxed mb-4">
              Your watchlist is empty.<br />Add a symbol or quick-add:
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {['AAPL', 'TSLA', 'NVDA', 'MSFT'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleAddSuggestedSymbol(s)}
                  disabled={loading}
                  className="px-2.5 py-1 bg-[#1E222D] hover:bg-[#089981]/20 border border-[#2A2E39] hover:border-[#089981]/30 rounded-lg text-[10px] font-bold text-[#D1D4DC] hover:text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  +{s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {watchlist.map((symbol) => {
              const info = prices[symbol];
              const isSelected = selectedSymbol === symbol;
              
              let flashClass = '';
              if (info?.isGrowing === 'up') flashClass = 'flash-green-bg';
              if (info?.isGrowing === 'down') flashClass = 'flash-red-bg';

              const priceFormatted = info ? `$${info.price.toFixed(2)}` : 'Loading...';
              const isPositive = info ? info.change >= 0 : true;
              const percentFormatted = info 
                ? `${isPositive ? '+' : ''}${info.changePercent.toFixed(2)}%`
                : '';

              return (
                <div
                  key={symbol}
                  onClick={() => {
                    setSelectedSymbol(symbol);
                    router.push(`/stock/${symbol}`);
                  }}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all border-b border-[#2A2E39]/30 select-none group relative ${
                    isSelected 
                      ? 'bg-[#1E222D] border-l-2 border-l-[#089981]' 
                      : 'hover:bg-[#131722]/30 border-l-2 border-l-transparent'
                  } ${flashClass}`}
                >
                  {/* Left: Ticker Symbol */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs tracking-wider">{symbol}</span>
                    <span className="text-[9px] text-[#848E9C] font-bold bg-[#1E222D] px-1 py-0.2 rounded border border-[#2A2E39]/40">US</span>
                  </div>

                  {/* Right: Pricing and Actions */}
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-white">
                      {priceFormatted}
                    </span>
                    {info && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[52px] text-center ${
                        isPositive 
                          ? 'bg-[#089981]/10 text-emerald-400' 
                          : 'bg-[#F23645]/10 text-rose-400'
                      }`}>
                        {percentFormatted}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleRemoveStock(e, symbol)}
                      className="text-[#848E9C] hover:text-[#F23645] p-1 rounded-md transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Remove symbol"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
