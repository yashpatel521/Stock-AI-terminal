'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStockStore } from '@/store/useStockStore';
import { Search, Plus, RefreshCw, TrendingUp, X } from 'lucide-react';

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
  const [isFocused, setIsFocused] = useState(false);

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
      
      {/* Top Search Bar — only on base /stock route */}
      {isBaseStockRoute && (
        <div className="border-b border-border-custom bg-panel px-6 py-3 shrink-0 z-10 animate-fade-in">
          <form onSubmit={handleAddStock} className="flex items-center gap-3 max-w-2xl mx-auto">
            <div className={`relative flex-1 transition-all duration-200 ${isFocused ? 'scale-[1.01]' : ''}`}>
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isFocused ? 'text-green-custom' : 'text-muted-custom'}`} />
              <input
                type="text"
                placeholder="Search stocks by name or ticker..."
                value={inputSymbol}
                onChange={(e) => setInputSymbol(e.target.value)}
                onFocus={() => { setShowDropdown(true); setIsFocused(true); }}
                onBlur={() => { setTimeout(() => setShowDropdown(false), 200); setIsFocused(false); }}
                disabled={loading}
                className="w-full pl-10 pr-10 py-2.5 bg-background border border-border-custom rounded-xl text-foreground text-xs placeholder-muted-custom/50 focus:outline-none focus:border-green-custom focus:ring-1 focus:ring-green-custom/20 transition-all uppercase font-semibold disabled:opacity-50"
              />
              {inputSymbol && (
                <button
                  type="button"
                  onClick={() => { setInputSymbol(''); setSuggestions([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-custom hover:text-foreground cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-panel border border-border-custom rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                  <div className="px-3.5 py-2 border-b border-border-custom">
                    <span className="text-[9px] uppercase font-bold text-muted-custom tracking-wider font-display">Search Results</span>
                  </div>
                  {suggestions.map((item) => {
                    const isPositive = item.change !== null ? item.change >= 0 : true;
                    return (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => handleSelectSuggestion(item.symbol)}
                        className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-hover-custom text-left transition-colors cursor-pointer border-b border-border-custom/30 last:border-0"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-8 w-8 rounded-lg bg-background border border-border-custom flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-extrabold text-foreground font-display">{item.symbol.slice(0, 2)}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-foreground uppercase truncate font-display">{item.symbol}</span>
                            <span className="text-[10px] text-muted-custom truncate max-w-60 font-semibold">{item.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          {item.price !== null && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-mono font-bold text-foreground">${item.price.toFixed(2)}</span>
                              {item.change !== null && (
                                <span className={`text-[9px] font-bold ${isPositive ? 'text-green-custom' : 'text-red-custom'}`}>
                                  {isPositive ? '+' : ''}{item.change.toFixed(2)}%
                                </span>
                              )}
                            </div>
                          )}
                          <div className="h-6 w-6 rounded-md bg-green-custom/10 border border-green-custom/20 flex items-center justify-center">
                            <Plus className="h-3 w-3 text-green-custom" />
                          </div>
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
              className="px-4 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs font-bold flex items-center gap-1.5 justify-center disabled:opacity-40 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <><Plus className="h-3.5 w-3.5" /> Add</>}
            </button>
          </form>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex overflow-hidden bg-background">
        {children}
      </div>

    </div>
  );
}
