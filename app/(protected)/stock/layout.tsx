'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStockStore } from '@/store/useStockStore';
import { Search, Plus, RefreshCw, TrendingUp } from 'lucide-react';

export default function StockLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isBaseStockRoute = pathname === '/stock';
  const { addSymbol, setSelectedSymbol } = useStockStore();
  const [inputSymbol, setInputSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    symbol: string;
    name: string;
    price: number | null;
    change: number | null;
  }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!inputSymbol.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(inputSymbol)}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.results);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [inputSymbol]);

  const handleSelectSuggestion = async (symbol: string) => {
    setShowDropdown(false);
    setSuggestions([]);
    setInputSymbol('');

    setLoading(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();
      if (data.success) {
        addSymbol(symbol);
        setSelectedSymbol(symbol);
        router.push(`/stock/${symbol}`);
      }
    } catch (err) {
      console.error('Failed to add symbol:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSymbol.trim()) return;

    const symbol = inputSymbol.trim().toUpperCase();
    setShowDropdown(false);
    setInputSymbol('');

    setLoading(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();
      if (data.success) {
        addSymbol(symbol);
        setSelectedSymbol(symbol);
        router.push(`/stock/${symbol}`);
      }
    } catch (err) {
      console.error('Failed to add symbol:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      
      {/* Top Watchlist Search Bar Row */}
      {isBaseStockRoute && (
        <div className="h-14 border-b border-border-custom bg-panel flex items-center justify-between px-6 shrink-0 z-10 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider font-display">Stock Workspace</span>
          </div>
          
          {/* Center Search Input */}
          <form onSubmit={handleAddStock} className="flex items-center gap-2 max-w-sm w-full mx-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-custom" />
              <input
                type="text"
                placeholder="Search & track ticker (e.g. MSFT)..."
                value={inputSymbol}
                onChange={(e) => setInputSymbol(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                disabled={loading}
                className="w-full pl-9 pr-3 py-1.5 bg-background border border-border-custom rounded-lg text-foreground text-xs placeholder-muted-custom/60 focus:outline-none focus:border-green-custom transition-all uppercase font-semibold disabled:opacity-50"
              />

              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-panel border border-border-custom rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-border-custom/40 max-h-75 overflow-y-auto">
                  {suggestions.map((item) => {
                    const isPositive = item.change !== null ? item.change >= 0 : true;
                    return (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => handleSelectSuggestion(item.symbol)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-hover-custom text-left transition-colors cursor-pointer animate-fade-in"
                      >
                        {/* Left: Icon and Ticker Details */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="h-7 w-7 rounded-lg bg-background border border-border-custom flex items-center justify-center text-green-custom shrink-0">
                            <TrendingUp className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-foreground uppercase truncate font-display">{item.symbol}</span>
                            <span className="text-[10px] text-muted-custom truncate max-w-37.5 font-semibold">{item.name}</span>
                          </div>
                        </div>
                        
                        {/* Right: Live Quote metrics */}
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          {item.price !== null && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-mono font-bold text-foreground">${item.price.toFixed(2)}</span>
                              {item.change !== null && (
                                <span className={`text-[9px] font-bold ${
                                  isPositive ? 'text-green-custom' : 'text-red-custom'
                                }`}>
                                  {isPositive ? '+' : ''}{item.change.toFixed(2)}%
                                </span>
                              )}
                            </div>
                          )}
                          <Plus className="h-3.5 w-3.5 text-muted-custom" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !inputSymbol}
              className="px-3.5 py-1.5 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-xs font-bold flex items-center justify-center disabled:opacity-50 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
          </form>
          
          {/* Right spacer for alignment */}
          <div className="w-25 hidden sm:block"></div>
        </div>
      )}

      {/* Workspace content side-by-side */}
      <div className="flex-1 flex overflow-hidden bg-background">
        {children}
      </div>

    </div>
  );
}
