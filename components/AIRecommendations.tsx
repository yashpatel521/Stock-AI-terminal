'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStockStore } from '@/store/useStockStore';
import { 
  Sparkles, Brain, Clock, ChevronRight, ArrowUpRight, 
  AlertTriangle, Play, Zap, TrendingUp, TrendingDown,
  Loader2, Info
} from 'lucide-react';

export default function AIRecommendations() {
  const router = useRouter();
  const { addSymbol, setSelectedSymbol } = useStockStore();
  
  const [ideasTab, setIdeasTab] = useState<'scans' | 'individuals'>('scans');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [scans, setScans] = useState<any[]>([]);
  const [activeScan, setActiveScan] = useState<any>(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [loadingScansHistory, setLoadingScansHistory] = useState(true);

  useEffect(() => {
    async function fetchIndividualHistory() {
      try {
        const res = await fetch('/api/analyze');
        const data = await res.json();
        if (data.success && data.history) setHistory(data.history);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHistory(false);
      }
    }

    async function fetchMarketScans() {
      try {
        const res = await fetch('/api/market-scan');
        const data = await res.json();
        if (data.success && data.scans) {
          setScans(data.scans);
          if (data.scans.length > 0) setActiveScan(data.scans[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingScansHistory(false);
      }
    }

    fetchIndividualHistory();
    fetchMarketScans();
  }, []);

  const handleRunGlobalScan = async () => {
    setLoadingScan(true);
    setScanError(null);
    try {
      const res = await fetch('/api/market-scan', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.scan) {
        setScans((prev) => [data.scan, ...prev]);
        setActiveScan(data.scan);
      } else {
        setScanError(data.error || 'Failed to complete market scan.');
      }
    } catch (err: any) {
      setScanError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoadingScan(false);
    }
  };

  const handleTrackStock = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    addSymbol(symbol);
    setSelectedSymbol(symbol);
    router.push(`/stock/${symbol}`);
  };

  const handleRowClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    router.push(`/stock/${symbol}`);
  };

  const parseScanResults = (scan: any) => {
    if (!scan?.results) return [];
    try { return JSON.parse(scan.results); } 
    catch { return []; }
  };

  const activeScanRows = parseScanResults(activeScan);

  return (
    <div className="flex-1 p-6 bg-background overflow-y-auto h-full space-y-5 select-none animate-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-foreground font-display tracking-tight">AI Scanner</h2>
          <p className="text-[11px] text-muted-custom mt-0.5">Institutional-grade research engine powered by Gemini</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-[10px] text-muted-custom font-semibold">Online</span>
        </div>
      </div>

      {/* Tab Switcher — pill style */}
      <div className="flex items-center gap-1.5 bg-panel border border-border-custom rounded-xl p-1 w-fit">
        <button
          onClick={() => setIdeasTab('scans')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            ideasTab === 'scans'
              ? 'bg-foreground text-background shadow-sm'
              : 'text-muted-custom hover:text-foreground'
          }`}
        >
          <Zap className="h-3.5 w-3.5" /> Market Scan
        </button>
        <button
          onClick={() => setIdeasTab('individuals')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            ideasTab === 'individuals'
              ? 'bg-foreground text-background shadow-sm'
              : 'text-muted-custom hover:text-foreground'
          }`}
        >
          <Clock className="h-3.5 w-3.5" /> Ticker Reports
        </button>
      </div>

      {ideasTab === 'scans' ? (
        /* ──────── TAB 1: Global AI Market Scan ──────── */
        <div className="space-y-5">
          
          {/* Scan Trigger Card */}
          <div className="bg-panel border border-border-custom rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground font-display">Run /stockreport</h3>
                  <p className="text-[11px] text-muted-custom mt-0.5">Scans macro, CPI, technicals, options flow, and sector rotation to find today's top 5 trades</p>
                </div>
              </div>
              
              <button
                onClick={handleRunGlobalScan}
                disabled={loadingScan}
                className="px-5 py-2.5 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 font-bold text-xs flex items-center gap-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm shrink-0"
              >
                {loadingScan ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning...</>
                ) : (
                  <><Play className="h-3.5 w-3.5 fill-current" /> Execute Scan</>
                )}
              </button>
            </div>

            {/* Loading State */}
            {loadingScan && (
              <div className="border-t border-border-custom p-12 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-purple-500/10 mb-4">
                  <Loader2 className="h-8 w-8 text-purple-600 dark:text-purple-400 animate-spin" />
                </div>
                <h4 className="text-sm font-bold text-foreground font-display">Analyzing Global Markets</h4>
                <p className="text-[11px] text-muted-custom max-w-sm mx-auto mt-1.5 leading-relaxed">
                  Gemini is processing macro indicators, sentiment data, technical patterns, and institutional flow...
                </p>
              </div>
            )}
          </div>

          {/* Error State */}
          {scanError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/80 rounded-xl text-red-800 dark:text-red-200 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold">Scan Failed</span>
                <p className="text-[11px] leading-relaxed mt-0.5">{scanError}</p>
              </div>
            </div>
          )}

          {/* Scan Results */}
          {!loadingScan && (
            loadingScansHistory ? (
              <div className="bg-panel border border-border-custom rounded-2xl p-10 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-muted-custom animate-spin mr-2" />
                <span className="text-xs text-muted-custom">Loading scan history...</span>
              </div>
            ) : scans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-panel border border-border-custom flex items-center justify-center mb-4 shadow-sm">
                  <Sparkles className="h-6 w-6 text-muted-custom" />
                </div>
                <h3 className="text-sm font-bold text-foreground font-display mb-1">No scans yet</h3>
                <p className="text-xs text-muted-custom text-center max-w-xs leading-relaxed">
                  Click "Execute Scan" above to run the institutional scanning engine and discover today's best opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Scan Selector */}
                <div className="flex items-center justify-between">
                  <select
                    value={activeScan?.id || ''}
                    onChange={(e) => {
                      const target = scans.find(s => s.id === Number(e.target.value));
                      if (target) setActiveScan(target);
                    }}
                    className="px-3 py-2 bg-panel border border-border-custom rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {scans.map(s => (
                      <option key={s.id} value={s.id}>
                        {new Date(s.createdAt).toLocaleString()} — Scan #{s.id}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-muted-custom font-semibold">{activeScanRows.length} stocks ranked</span>
                </div>

                {/* Scan Results — Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                  {activeScanRows.map((row: any) => {
                    const isBullish = row.bias === 'bullish';
                    return (
                      <div
                        key={row.rank}
                        onClick={() => handleRowClick(row.symbol)}
                        className="bg-panel border border-border-custom rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-foreground/15 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        
                        <div className="relative z-10">
                          {/* Rank Badge */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-bold text-muted-custom bg-background border border-border-custom px-2 py-0.5 rounded-md">
                              #{row.rank}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg capitalize ${
                              isBullish 
                                ? 'bg-green-custom/10 text-green-custom border border-green-custom/20' 
                                : 'bg-red-custom/10 text-red-custom border border-red-custom/20'
                            }`}>
                              {isBullish ? <TrendingUp className="h-3 w-3 inline mr-0.5" /> : <TrendingDown className="h-3 w-3 inline mr-0.5" />}
                              {row.bias}
                            </span>
                          </div>

                          {/* Symbol */}
                          <h4 className="text-lg font-extrabold text-foreground font-display uppercase tracking-tight mb-3">{row.symbol}</h4>
                          
                          {/* Price Ranges */}
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-custom font-semibold">Day</span>
                              <div className="font-mono font-bold">
                                <span className="text-red-custom">{row.dayLow}</span>
                                <span className="text-muted-custom/50 mx-1">–</span>
                                <span className="text-green-custom">{row.dayHigh}</span>
                              </div>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-custom font-semibold">Week</span>
                              <div className="font-mono font-bold">
                                <span className="text-red-custom">{row.weekLow}</span>
                                <span className="text-muted-custom/50 mx-1">–</span>
                                <span className="text-green-custom">{row.weekHigh}</span>
                              </div>
                            </div>
                          </div>

                          {/* Confidence Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-[9px] mb-1">
                              <span className="text-muted-custom font-semibold">Confidence</span>
                              <span className="font-mono font-bold text-foreground">{row.confidence}%</span>
                            </div>
                            <div className="h-1.5 bg-hover-custom rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  row.confidence >= 80 ? 'bg-green-custom' : 
                                  row.confidence >= 60 ? 'bg-purple-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${row.confidence}%` }}
                              />
                            </div>
                          </div>

                          {/* Track Action */}
                          <button
                            onClick={(e) => handleTrackStock(e, row.symbol)}
                            className="w-full py-2 bg-background hover:bg-foreground hover:text-background border border-border-custom hover:border-transparent rounded-xl text-[10px] font-bold text-muted-custom transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                          >
                            <ArrowUpRight className="h-3 w-3" /> Track & Analyze
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        /* ──────── TAB 2: Individual Ticker Reports ──────── */
        <div className="space-y-5">

          {loadingHistory ? (
            <div className="bg-panel border border-border-custom rounded-2xl p-10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-muted-custom animate-spin mr-2" />
              <span className="text-xs text-muted-custom">Loading reports...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-14 w-14 rounded-2xl bg-panel border border-border-custom flex items-center justify-center mb-4 shadow-sm">
                <Brain className="h-6 w-6 text-muted-custom" />
              </div>
              <h3 className="text-sm font-bold text-foreground font-display mb-1">No reports yet</h3>
              <p className="text-xs text-muted-custom text-center max-w-xs leading-relaxed mb-4">
                Go to your Watchlist, select a stock, and click "Analyze" to generate AI trade reports.
              </p>
              <button
                onClick={() => router.push('/stock')}
                className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                Go to Watchlist
              </button>
            </div>
          ) : (
            /* Report Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {history.map((item) => {
                const isBullish = item.trend === 'bullish';
                const isBearish = item.trend === 'bearish';
                return (
                  <div
                    key={item.id}
                    onClick={() => handleRowClick(item.symbol)}
                    className="bg-panel border border-border-custom rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-foreground/15 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-custom/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                    <div className="relative z-10">
                      {/* Header: Symbol + Trend */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-background border border-border-custom flex items-center justify-center font-extrabold text-[10px] text-foreground font-display">
                            {item.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <span className="text-sm font-extrabold text-foreground font-display uppercase tracking-wider block">{item.symbol}</span>
                            <span className="text-[9px] text-muted-custom font-semibold">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg capitalize ${
                          isBullish ? 'bg-green-custom/10 text-green-custom border border-green-custom/20' :
                          isBearish ? 'bg-red-custom/10 text-red-custom border border-red-custom/20' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20'
                        }`}>
                          {item.trend}
                        </span>
                      </div>

                      {/* Strategy Zones */}
                      <div className="grid grid-cols-3 gap-2 bg-background border border-border-custom/50 rounded-xl p-2 mb-3 text-center">
                        <div>
                          <span className="text-[8px] uppercase font-bold text-muted-custom block">Entry</span>
                          <span className="text-[10px] font-mono font-bold text-foreground">{item.entryZone}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase font-bold text-muted-custom block">Target</span>
                          <span className="text-[10px] font-mono font-bold text-green-custom">{item.targetZone}</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase font-bold text-muted-custom block">Stop</span>
                          <span className="text-[10px] font-mono font-bold text-red-custom">{item.stopLoss}</span>
                        </div>
                      </div>

                      {/* Bottom: Risk + Confidence */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.riskLevel === 'Low' ? 'text-green-custom bg-green-custom/10' :
                            item.riskLevel === 'High' ? 'text-red-custom bg-red-custom/10' : 
                            'text-amber-600 dark:text-amber-500 bg-amber-500/10'
                          }`}>
                            {item.riskLevel} Risk
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1 bg-hover-custom rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${item.confidenceScore}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-foreground">{item.confidenceScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Advisory Footer */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-panel border border-border-custom rounded-xl">
        <Info className="h-3.5 w-3.5 text-muted-custom shrink-0" />
        <p className="text-[10px] text-muted-custom leading-relaxed">
          <span className="font-bold text-foreground">Advisory</span> — AI-generated recommendations are for research purposes only. Not financial advice.
        </p>
      </div>

    </div>
  );
}
