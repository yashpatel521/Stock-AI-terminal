'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStockStore } from '@/store/useStockStore';
import { Sparkles, Brain, Clock, ChevronRight, HelpCircle, ArrowUpRight, AlertTriangle, Play } from 'lucide-react';

export default function AIRecommendations() {
  const router = useRouter();
  const { addSymbol, setSelectedSymbol } = useStockStore();
  
  // Section Navigation Tab
  const [ideasTab, setIdeasTab] = useState<'scans' | 'individuals'>('scans');

  // Individual Tickers History
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Macro Scans State
  const [scans, setScans] = useState<any[]>([]);
  const [activeScan, setActiveScan] = useState<any>(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [loadingScansHistory, setLoadingScansHistory] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    async function fetchIndividualHistory() {
      try {
        const res = await fetch('/api/analyze');
        const data = await res.json();
        if (data.success && data.history) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error('Failed to fetch analysis history:', err);
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
          if (data.scans.length > 0) {
            setActiveScan(data.scans[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch scans:', err);
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
        setScanError(data.error || 'Failed to complete market scan. Please verify Gemini API key.');
      }
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || 'An unexpected error occurred during macro scan.');
    } finally {
      setLoadingScan(false);
    }
  };

  const handleTrackStock = (symbol: string) => {
    addSymbol(symbol);
    setSelectedSymbol(symbol);
    router.push(`/stock/${symbol}`);
  };

  const handleRowClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    router.push(`/stock/${symbol}`);
  };

  const parseScanResults = (scan: any) => {
    if (!scan || !scan.results) return [];
    try {
      return JSON.parse(scan.results);
    } catch (err) {
      console.error('Error parsing scan results:', err);
      return [];
    }
  };

  const activeScanRows = parseScanResults(activeScan);



  return (
    <div className="flex-1 p-6 bg-background overflow-y-auto h-full space-y-6 select-none animate-fade-in">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-border-custom pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 dark:text-purple-400 border border-purple-500/25">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground font-display tracking-tight">AI Recommendations</h2>
            <p className="text-xs text-muted-custom">Hedge-fund level stock scans and detailed dynamic trade reports</p>
          </div>
        </div>
        <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-lg border border-purple-500/20 font-bold tracking-wider uppercase font-display">
          AI Engine Online
        </span>
      </div>

      {/* Ideas Page Sub-Tabs Switcher */}
      <div className="flex items-center gap-4 border-b border-border-custom/50 pb-2 mb-4 shrink-0">
        <button
          onClick={() => setIdeasTab('scans')}
          className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-2 cursor-pointer transition-all border-b-2 font-display ${
            ideasTab === 'scans'
              ? 'text-foreground border-purple-600'
              : 'text-muted-custom border-transparent hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" /> Global AI Market Scan (/stockreport)
        </button>
        <button
          onClick={() => setIdeasTab('individuals')}
          className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-2 cursor-pointer transition-all border-b-2 font-display ${
            ideasTab === 'individuals'
              ? 'text-foreground border-purple-600'
              : 'text-muted-custom border-transparent hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4" /> Individual Ticker Reports
        </button>
      </div>

      {ideasTab === 'scans' ? (
        /* TAB 1: Global AI scans (/stockreport) */
        <div className="space-y-6">
          
          {/* Scan Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-panel border border-border-custom rounded-2xl p-5 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-foreground font-display">Run Global Institutional Scan</h3>
              <p className="text-xs text-muted-custom mt-0.5">Executes the /stockreport macro prompt analyzing macro indicators, CPI, and technicals</p>
            </div>
            
            <button
              onClick={handleRunGlobalScan}
              disabled={loadingScan}
              className="px-4 py-2.5 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 font-bold text-xs flex items-center gap-2 rounded-xl transition-all cursor-pointer select-none active:scale-95 shadow-sm shrink-0"
            >
              {loadingScan ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning Markets...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" /> Run Scan (/stockreport)
                </>
              )}
            </button>
          </div>

          {loadingScan && (
            <div className="bg-panel border border-border-custom rounded-2xl p-16 text-center flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-purple-600 dark:text-purple-400 animate-spin mb-4" />
              <h4 className="text-sm font-bold text-foreground font-display uppercase tracking-wider">Hedge Fund Research Active</h4>
              <p className="text-xs text-muted-custom max-w-sm mt-1.5 leading-relaxed">
                Gemini is executing macro analysis calculations, sentiment checks, options flow monitoring, and CPI rotation indexing.
              </p>
            </div>
          )}

          {scanError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/80 rounded-2xl text-red-800 dark:text-red-200 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase mb-1 font-display">Scan Execution Failed</h4>
                <p className="text-[11px] leading-relaxed">{scanError}</p>
              </div>
            </div>
          )}

          {!loadingScan && (
            loadingScansHistory ? (
              <div className="bg-panel border border-border-custom rounded-2xl p-10 flex items-center justify-center">
                <span className="text-xs text-muted-custom">Loading macro scans database...</span>
              </div>
            ) : scans.length === 0 ? (
              /* Scans Empty State */
              <div className="bg-panel border border-border-custom rounded-2xl p-10 text-center max-w-lg mx-auto shadow-sm">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center mx-auto mb-4 border border-border-custom">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1.5 font-display uppercase tracking-wider">No Macro Scans Found</h3>
                <p className="text-xs text-muted-custom leading-relaxed mb-4">
                  Trigger the institutional scanning engine above to process current market indicators and identify the 5 best opportunities today.
                </p>
              </div>
            ) : (
              /* Active Scan Table */
              <div className="space-y-4">
                
                {/* Selector Header */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground font-display uppercase tracking-wider">Selected Report</span>
                    <select
                      value={activeScan?.id || ''}
                      onChange={(e) => {
                        const target = scans.find(s => s.id === Number(e.target.value));
                        if (target) setActiveScan(target);
                      }}
                      className="px-3 py-1.5 bg-panel border border-border-custom rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:border-purple-500"
                    >
                      {scans.map(s => (
                        <option key={s.id} value={s.id}>
                          Scan Result - {new Date(s.createdAt).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] text-muted-custom font-semibold">
                    Scan ID: #{activeScan?.id}
                  </span>
                </div>

                {/* Scans Result Table */}
                <div className="bg-panel border border-border-custom rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border-custom text-[10px] uppercase font-bold text-muted-custom bg-background font-display tracking-wider">
                          <th className="py-4 px-6 text-center">Rank</th>
                          <th className="py-4 px-6">Stock</th>
                          <th className="py-4 px-6 text-center">Bias</th>
                          <th className="py-4 px-6 text-right">Expected Day (L / H)</th>
                          <th className="py-4 px-6 text-right">Expected Week (L / H)</th>
                          <th className="py-4 px-6 text-center">Confidence</th>
                          <th className="py-4 px-6 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-custom/50 text-xs">
                        {activeScanRows.map((row: any) => {
                          const isBullish = row.bias === 'bullish';
                          return (
                            <tr
                              key={row.rank}
                              onClick={() => handleRowClick(row.symbol)}
                              className="hover:bg-hover-custom cursor-pointer transition-colors duration-150 group"
                            >
                              {/* Rank */}
                              <td className="py-4 px-6 text-center font-bold text-foreground">
                                {row.rank}
                              </td>

                              {/* Ticker Ticker */}
                              <td className="py-4 px-6">
                                <span className="font-extrabold text-foreground text-sm tracking-wider font-display uppercase">{row.symbol}</span>
                              </td>

                              {/* Bias */}
                              <td className="py-4 px-6 text-center">
                                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-lg capitalize ${
                                  isBullish ? 'bg-green-custom/10 text-green-custom border border-green-custom/20' :
                                  'bg-red-custom/10 text-red-custom border border-red-custom/20'
                                }`}>
                                  {row.bias}
                                </span>
                              </td>

                              {/* Expected Day Range */}
                              <td className="py-4 px-6 text-right font-mono font-bold text-muted-custom text-[11px]">
                                <span className="text-red-custom">{row.dayLow}</span>
                                <span className="mx-1.5 text-border-custom">/</span>
                                <span className="text-green-custom">{row.dayHigh}</span>
                              </td>

                              {/* Expected Week Range */}
                              <td className="py-4 px-6 text-right font-mono font-bold text-muted-custom text-[11px]">
                                <span className="text-red-custom">{row.weekLow}</span>
                                <span className="mx-1.5 text-border-custom">/</span>
                                <span className="text-green-custom">{row.weekHigh}</span>
                              </td>

                              {/* Confidence score */}
                              <td className="py-4 px-6 text-center">
                                <div className="flex flex-col items-center">
                                  <span className="font-mono font-bold text-foreground text-[11px]">{row.confidence}%</span>
                                  <div className="w-16 h-1 bg-hover-custom rounded-full mt-1.5 overflow-hidden">
                                    <div 
                                      className="h-full bg-purple-600 dark:bg-purple-500" 
                                      style={{ width: `${row.confidence}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Action track in watchlist */}
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTrackStock(row.symbol);
                                  }}
                                  className="px-2.5 py-1 bg-background hover:bg-green-custom text-muted-custom hover:text-white rounded-lg border border-border-custom hover:border-transparent font-bold text-[10px] transition-colors cursor-pointer"
                                >
                                  Track Ticker
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )
          )}

        </div>
      ) : (
        /* TAB 2: Individual Tickers Reports */
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2 font-display uppercase tracking-wider">
              <Clock className="h-4 w-4 text-muted-custom" /> Your Generated Ticker Reports
            </h3>

            {loadingHistory ? (
              <div className="bg-panel border border-border-custom rounded-2xl p-10 flex items-center justify-center shadow-sm">
                <span className="text-xs text-muted-custom">Querying database records...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="bg-panel border border-border-custom rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center mx-auto mb-3 border border-border-custom">
                  <Brain className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </div>
                <h4 className="text-xs font-bold text-foreground mb-1.5 font-display uppercase tracking-wider">No Reports Generated Yet</h4>
                <p className="text-xs text-muted-custom leading-relaxed mb-4">
                  To populate this table, go to your Stock Watchlist, click the analyze trigger on any ticker, and Gemini will compile structured trade setups here.
                </p>
                <button
                  onClick={() => router.push('/stock')}
                  className="px-3.5 py-1.5 bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Go to Watchlist
                </button>
              </div>
            ) : (
              <div className="bg-panel border border-border-custom rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-custom text-[10px] uppercase font-bold text-muted-custom bg-background font-display tracking-wider">
                        <th className="py-4 px-6">Timestamp</th>
                        <th className="py-4 px-6">Symbol</th>
                        <th className="py-4 px-6 text-center">Trend Outlook</th>
                        <th className="py-4 px-6 text-center">Targets (Entry / TP / SL)</th>
                        <th className="py-4 px-6 text-center">Risk</th>
                        <th className="py-4 px-6 text-center">Confidence</th>
                        <th className="py-4 px-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-custom/50 text-xs">
                      {history.map((item) => {
                        const isPositiveTrend = item.trend === 'bullish';
                        const isNegativeTrend = item.trend === 'bearish';
                        return (
                          <tr
                            key={item.id}
                            onClick={() => handleRowClick(item.symbol)}
                            className="hover:bg-hover-custom cursor-pointer transition-colors duration-150 group"
                          >
                            {/* Timestamp */}
                            <td className="py-4 px-6 text-muted-custom font-mono">
                              {new Date(item.createdAt).toLocaleString()}
                            </td>

                            {/* Symbol */}
                            <td className="py-4 px-6">
                              <span className="font-extrabold text-foreground text-sm tracking-wider font-display uppercase">{item.symbol}</span>
                            </td>

                            {/* Trend Outlook */}
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-lg capitalize ${
                                isPositiveTrend ? 'bg-green-custom/10 text-green-custom border border-green-custom/20' :
                                isNegativeTrend ? 'bg-red-custom/10 text-red-custom border border-red-custom/20' :
                                'bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20'
                              }`}>
                                {item.trend}
                              </span>
                            </td>

                            {/* Entry / Target / Stop Loss */}
                            <td className="py-4 px-6 text-center font-mono font-bold text-muted-custom text-[11px]">
                              <span className="text-foreground">{item.entryZone}</span>
                              <span className="mx-1.5 text-border-custom">|</span>
                              <span className="text-green-custom">{item.targetZone}</span>
                              <span className="mx-1.5 text-border-custom">|</span>
                              <span className="text-red-custom">{item.stopLoss}</span>
                            </td>

                            {/* Risk Rating */}
                            <td className="py-4 px-6 text-center">
                              <span className={`text-[10px] font-bold ${
                                item.riskLevel === 'Low' ? 'text-green-custom' :
                                item.riskLevel === 'High' ? 'text-red-custom' : 'text-amber-600 dark:text-amber-500'
                              }`}>
                                {item.riskLevel}
                              </span>
                            </td>

                            {/* Confidence Score */}
                            <td className="py-4 px-6 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-mono font-bold text-foreground text-[11px]">{item.confidenceScore}%</span>
                                <div className="w-16 h-1 bg-hover-custom rounded-full mt-1.5 overflow-hidden">
                                  <div 
                                    className="h-full bg-purple-600 dark:bg-purple-500" 
                                    style={{ width: `${item.confidenceScore}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* View Action Chevron */}
                            <td className="py-4 px-6 text-center">
                              <button
                                className="p-1.5 rounded-lg bg-background group-hover:bg-green-custom text-muted-custom group-hover:text-white transition-colors cursor-pointer"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
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
        </div>
      )}



      {/* Advisory Alert Card */}
      <div className="p-4 bg-panel border border-border-custom rounded-2xl flex items-start gap-3 shadow-sm pt-4">
        <HelpCircle className="h-5 w-5 text-muted-custom shrink-0 mt-0.5" />
        <div className="text-xs text-muted-custom leading-relaxed">
          <span className="text-foreground font-bold font-display">Educational Advisory</span>: All recommendations are compiled by LLMs evaluating public API data sources. They do not represent explicit financial guidance. Perform due diligence and check technical charts prior to committing cash positions.
        </div>
      </div>

    </div>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2.5} 
      stroke="currentColor" 
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// Inline loader helper
function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}
