'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStockStore } from '../store/useStockStore';
import StockChart from './StockChart';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Newspaper, 
  Zap, 
  Loader2,
  ArrowLeft
} from 'lucide-react';

export default function StockDetail() {
  const router = useRouter();
  const { selectedSymbol, prices } = useStockStore();
  const [profile, setProfile] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [candles, setCandles] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Unified detail page tab state
  const [detailTab, setDetailTab] = useState<'chart' | 'news' | 'history'>('chart');

  // Paging states
  const [newsPage, setNewsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Fetch stock profile, news, candles, and analysis history on select
  useEffect(() => {
    if (!selectedSymbol) return;

    async function loadStockData() {
      setLoadingInfo(true);
      setLatestAnalysis(null);
      setAnalysisError(null);
      setNewsPage(1);
      setHistoryPage(1);
      setProfile(null);
      setNews([]);
      setCandles(null);
      
      try {
        // Fetch Profile, News, Candles
        const infoRes = await fetch(`/api/stock-info?symbol=${selectedSymbol}`);
        const infoData = await infoRes.json();
        if (infoData.success) {
          setProfile(infoData.profile);
          setNews(infoData.news);
          setCandles(infoData.candles);
        }

        // Fetch Analysis History
        const histRes = await fetch(`/api/analyze?symbol=${selectedSymbol}`);
        const histData = await histRes.json();
        if (histData.success && histData.history) {
          setHistory(histData.history);
          if (histData.history.length > 0) {
            setLatestAnalysis(histData.history[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching stock details:', err);
      } finally {
        setLoadingInfo(false);
      }
    }

    loadStockData();
  }, [selectedSymbol]);

  // Reset tab to chart when symbol changes
  useEffect(() => {
    setDetailTab('chart');
  }, [selectedSymbol]);

  const handleAnalyze = async () => {
    if (!selectedSymbol) return;
    setLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedSymbol }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setLatestAnalysis(data.analysis);
        setHistory((prev) => [data.analysis, ...prev].slice(0, 10));
      } else {
        setAnalysisError(data.error || 'Failed to complete analysis. Please verify your API keys.');
      }
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAnalysisError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  if (!selectedSymbol) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-custom p-8 text-center animate-fade-in select-none">
        <Zap className="h-12 w-12 text-border-custom mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2 font-display">No Stock Selected</h3>
        <p className="text-xs max-w-xs leading-relaxed">
          Select a ticker from your watchlist or add a new one to view charts, news, and run AI research.
        </p>
      </div>
    );
  }

  const livePriceInfo = prices[selectedSymbol];
  const priceFormatted = livePriceInfo ? `$${livePriceInfo.price.toFixed(2)}` : '...';
  const isPositive = livePriceInfo ? livePriceInfo.change >= 0 : true;
  const changePercentFormatted = livePriceInfo 
    ? `${isPositive ? '+' : ''}${livePriceInfo.changePercent.toFixed(2)}%`
    : '';

  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-y-auto animate-fade-in select-none">
      
      {/* Header Info */}
      <div className="p-6 border-b border-border-custom flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-panel">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/stock')}
            className="p-2 border border-border-custom hover:bg-hover-custom rounded-xl text-muted-custom hover:text-foreground transition-all cursor-pointer mr-1 active:scale-95"
            title="Back to Watchlist Table"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-foreground leading-none font-display tracking-tight uppercase">{selectedSymbol}</h1>
              {profile?.finnhubIndustry && (
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-hover-custom text-green-custom font-bold border border-border-custom uppercase font-display">
                  {profile.finnhubIndustry}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-custom mt-1 font-semibold">{profile?.name || 'Loading company info...'}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className={`text-2xl font-mono font-bold leading-none transition-all duration-200 ${
              livePriceInfo?.isGrowing === 'up' ? 'text-green-custom scale-105' :
              livePriceInfo?.isGrowing === 'down' ? 'text-red-custom scale-105' : 'text-foreground'
            }`}>
              {priceFormatted}
            </span>
            {livePriceInfo && (
              <span className={`flex items-center text-xs font-bold mt-1.5 ${
                isPositive ? 'text-green-custom' : 'text-red-custom'
              }`}>
                {isPositive ? <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> : <TrendingDown className="h-3.5 w-3.5 mr-0.5" />}
                {changePercentFormatted}
              </span>
            )}
          </div>
          {profile?.marketCapitalization && (
            <div className="hidden md:flex flex-col items-end border-l border-border-custom pl-6">
              <span className="text-[10px] text-muted-custom uppercase font-bold tracking-wider font-display">Market Cap</span>
              <span className="text-xs font-mono font-bold text-foreground mt-1.5 bg-background px-2.5 py-1 border border-border-custom rounded-lg">
                ${(profile.marketCapitalization / 1000).toFixed(2)}B
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Unified Workspace Panel (Chart, News & History in Tabs) */}
        <div className="xl:col-span-2">
          
          <div className="bg-panel border border-border-custom rounded-2xl p-5 flex flex-col h-[520px] shadow-sm">
            
            {/* Tab Headers */}
            <div className="flex items-center gap-4 border-b border-border-custom/50 pb-3 mb-4 shrink-0">
              <button
                onClick={() => setDetailTab('chart')}
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-2.5 cursor-pointer transition-all border-b-2 font-display ${
                  detailTab === 'chart'
                    ? 'text-foreground border-green-custom'
                    : 'text-muted-custom border-transparent hover:text-foreground'
                }`}
              >
                <Activity className="h-4 w-4" /> Candle Chart
              </button>
              <button
                onClick={() => setDetailTab('news')}
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-2.5 cursor-pointer transition-all border-b-2 font-display ${
                  detailTab === 'news'
                    ? 'text-foreground border-green-custom'
                    : 'text-muted-custom border-transparent hover:text-foreground'
                }`}
              >
                <Newspaper className="h-4 w-4" /> Latest Headlines
              </button>
              <button
                onClick={() => setDetailTab('history')}
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-2.5 cursor-pointer transition-all border-b-2 font-display ${
                  detailTab === 'history'
                    ? 'text-foreground border-green-custom'
                    : 'text-muted-custom border-transparent hover:text-foreground'
                }`}
              >
                <Clock className="h-4 w-4" /> Research History
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto min-h-0 relative pr-1">
              
              {detailTab === 'chart' && (
                <div className="w-full h-full relative">
                  {candles && <StockChart symbol={selectedSymbol} data={candles} />}
                  {loadingInfo && (
                    <div className="absolute inset-0 bg-panel/80 flex items-center justify-center rounded-2xl">
                      <Loader2 className="h-8 w-8 text-green-custom animate-spin" />
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'news' && (
                loadingInfo ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 text-muted-custom animate-spin" />
                  </div>
                ) : news.length === 0 ? (
                  <p className="text-xs text-muted-custom text-center py-20 leading-relaxed">No recent news available.</p>
                ) : (() => {
                  const newsPerPage = 5;
                  const totalNewsPages = Math.ceil(news.length / newsPerPage);
                  const paginatedNews = news.slice((newsPage - 1) * newsPerPage, newsPage * newsPerPage);
                  return (
                    <div className="flex flex-col h-full justify-between">
                      <div className="space-y-3">
                        {paginatedNews.map((item) => (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-xl bg-background/50 hover:bg-hover-custom border border-border-custom/50 hover:border-border-custom transition-all duration-200 animate-fade-in"
                          >
                            <span className="text-[10px] text-muted-custom font-semibold block mb-1">
                              {new Date(item.datetime * 1000).toLocaleDateString()} · {item.source}
                            </span>
                            <h4 className="text-xs font-bold text-foreground hover:text-green-custom transition-colors line-clamp-2 leading-relaxed">
                              {item.headline}
                            </h4>
                            <p className="text-[10px] text-muted-custom mt-1.5 line-clamp-2 leading-relaxed">{item.summary}</p>
                          </a>
                        ))}
                      </div>
                      {totalNewsPages > 1 && (
                        <div className="flex justify-between items-center mt-5 pt-3 border-t border-border-custom shrink-0">
                          <button
                            onClick={() => setNewsPage((p) => Math.max(1, p - 1))}
                            disabled={newsPage === 1}
                            className="px-3.5 py-1.5 bg-background hover:bg-hover-custom border border-border-custom hover:border-foreground/20 disabled:opacity-30 rounded-lg text-xs font-bold text-foreground transition-all cursor-pointer select-none active:scale-95"
                          >
                            Previous
                          </button>
                          <span className="text-xs text-muted-custom font-semibold">
                            Page {newsPage} of {totalNewsPages}
                          </span>
                          <button
                            onClick={() => setNewsPage((p) => Math.min(totalNewsPages, p + 1))}
                            disabled={newsPage === totalNewsPages}
                            className="px-3.5 py-1.5 bg-background hover:bg-hover-custom border border-border-custom hover:border-foreground/20 disabled:opacity-30 rounded-lg text-xs font-bold text-foreground transition-all cursor-pointer select-none active:scale-95"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {detailTab === 'history' && (
                history.length <= 1 ? (
                  <p className="text-xs text-muted-custom text-center py-20">No historical analyses found for this symbol.</p>
                ) : (() => {
                  const historyPerPage = 4;
                  const historicalItems = history.slice(1);
                  const totalHistoryPages = Math.ceil(historicalItems.length / historyPerPage);
                  const paginatedHistory = historicalItems.slice(
                    (historyPage - 1) * historyPerPage,
                    historyPage * historyPerPage
                  );
                  return (
                    <div className="flex flex-col h-full justify-between">
                      <div className="space-y-3">
                        {paginatedHistory.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setLatestAnalysis(item)}
                            className="p-3 rounded-xl bg-background/50 hover:bg-hover-custom border border-border-custom cursor-pointer transition-all flex justify-between items-center animate-fade-in"
                          >
                            <div className="flex flex-col">
                              <span className="text-[9px] text-muted-custom font-semibold">
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                              <span className="text-xs font-bold capitalize mt-0.5 text-foreground font-display">
                                Trend: <span className={
                                  item.trend === 'bullish' ? 'text-green-custom' :
                                  item.trend === 'bearish' ? 'text-red-custom' : 'text-amber-600 dark:text-amber-500'
                                }>{item.trend}</span>
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[9px] font-mono text-foreground bg-background px-2 py-0.5 rounded border border-border-custom">
                                Score: {item.confidenceScore}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {totalHistoryPages > 1 && (
                        <div className="flex justify-between items-center mt-4 pt-2.5 border-t border-border-custom shrink-0">
                          <button
                            onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                            disabled={historyPage === 1}
                            className="px-2.5 py-1 bg-background hover:bg-hover-custom border border-border-custom hover:border-foreground/20 disabled:opacity-30 rounded-lg text-[10px] font-bold text-foreground transition-all cursor-pointer select-none active:scale-95"
                          >
                            Prev
                          </button>
                          <span className="text-[10px] text-muted-custom font-semibold">
                            {historyPage} / {totalHistoryPages}
                          </span>
                          <button
                            onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                            disabled={historyPage === totalHistoryPages}
                            className="px-2.5 py-1 bg-background hover:bg-hover-custom border border-border-custom hover:border-foreground/20 disabled:opacity-30 rounded-lg text-[10px] font-bold text-foreground transition-all cursor-pointer select-none active:scale-95"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

            </div>

          </div>

        </div>

        {/* Right Column: AI Analysis */}
        <div className="flex flex-col gap-6">
          
          {/* AI Analysis Panel */}
          <div className="bg-panel border border-border-custom rounded-2xl p-5 flex flex-col shadow-sm">
            <div className="flex items-center justify-between border-b border-border-custom/50 pb-3 mb-4">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2 font-display uppercase tracking-wider">
                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" /> AI Analyst Research
              </h3>
              <button
                onClick={handleAnalyze}
                disabled={loadingAnalysis || loadingInfo}
                className="px-3.5 py-1.5 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all select-none cursor-pointer active:scale-95 shadow-sm"
              >
                {loadingAnalysis ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 animate-bounce" /> Analyze Stock
                  </>
                )}
              </button>
            </div>

            {loadingAnalysis ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-8 w-8 text-green-custom animate-spin mb-3" />
                <span className="text-xs text-foreground font-bold">Gemini is analyzing market data...</span>
                <span className="text-[10px] text-muted-custom mt-2 max-w-50 leading-relaxed">
                  Parsing daily candles, news headlines, and price action to generate a plan.
                </span>
              </div>
            ) : analysisError ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/80 rounded-2xl text-red-800 dark:text-red-200">
                <h4 className="text-xs font-bold uppercase mb-1 flex items-center gap-1 font-display">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" /> Analysis Failed
                </h4>
                <p className="text-[11px] leading-relaxed mt-1.5">{analysisError}</p>
                <p className="text-[10px] text-red-700/80 dark:text-red-300/80 mt-2">
                  Tip: Verify that the <strong>GEMINI_API_KEY</strong> in your environment is active.
                </p>
              </div>
            ) : latestAnalysis ? (
              <div className="space-y-4 animate-fade-in">
                {/* Trend & Confidence */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background border border-border-custom rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-muted-custom block tracking-wider font-display">Trend Outlook</span>
                    <span className={`text-xs font-bold block mt-1 capitalize ${
                      latestAnalysis.trend === 'bullish' ? 'text-green-custom' :
                      latestAnalysis.trend === 'bearish' ? 'text-red-custom' : 'text-amber-600 dark:text-amber-500'
                    }`}>
                      {latestAnalysis.trend}
                    </span>
                  </div>
                  <div className="p-3 bg-background border border-border-custom rounded-xl">
                    <span className="text-[9px] uppercase font-bold text-muted-custom block tracking-wider font-display">Confidence Score</span>
                    <span className="text-xs font-mono font-bold text-foreground block mt-1">
                      {latestAnalysis.confidenceScore}%
                    </span>
                  </div>
                </div>

                {/* Strategy Zones */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-background border border-border-custom rounded-xl">
                    <span className="text-xs text-muted-custom font-semibold">Entry Zone</span>
                    <span className="text-xs font-mono font-bold text-green-custom">{latestAnalysis.entryZone}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background border border-border-custom rounded-xl">
                    <span className="text-xs text-muted-custom font-semibold">Target Zone</span>
                    <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">{latestAnalysis.targetZone}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background border border-border-custom rounded-xl">
                    <span className="text-xs text-muted-custom font-semibold">Stop Loss</span>
                    <span className="text-xs font-mono font-bold text-red-custom">{latestAnalysis.stopLoss}</span>
                  </div>
                </div>

                {/* Risk Level */}
                <div className="flex items-center justify-between p-3 bg-background border border-border-custom rounded-xl">
                  <span className="text-xs text-muted-custom flex items-center gap-1 font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Risk Rating
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    latestAnalysis.riskLevel === 'Low' ? 'text-green-custom bg-green-custom/10' :
                    latestAnalysis.riskLevel === 'High' ? 'text-red-custom bg-red-custom/10' : 'text-amber-500 bg-amber-500/10'
                  }`}>
                    {latestAnalysis.riskLevel}
                  </span>
                </div>

                {/* Explanation text */}
                <div className="p-3.5 bg-background border border-border-custom rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-muted-custom block mb-1 font-display tracking-wider">Analyst Notes</span>
                  <p className="text-xs text-foreground/80 leading-relaxed font-sans">{latestAnalysis.explanation}</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-custom">
                <Brain className="h-8 w-8 text-border-custom mx-auto mb-2" />
                <p className="text-xs leading-relaxed">No analysis reports generated yet.</p>
                <p className="text-[10px] mt-1">Click the analyze button to run AI trade planning.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
