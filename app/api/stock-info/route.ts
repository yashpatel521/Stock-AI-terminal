import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

async function fetchYahooCandles(symbol: string) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=90d&interval=1d`);
    if (!res.ok) throw new Error('Failed to fetch from Yahoo Finance');
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return { s: 'no_data' };

    const t = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const o = quote.open || [];
    const h = quote.high || [];
    const l = quote.low || [];
    const c = quote.close || [];
    const v = quote.volume || [];

    const cleanT: number[] = [];
    const cleanO: number[] = [];
    const cleanH: number[] = [];
    const cleanL: number[] = [];
    const cleanC: number[] = [];
    const cleanV: number[] = [];

    for (let i = 0; i < t.length; i++) {
      if (
        o[i] !== null && o[i] !== undefined &&
        h[i] !== null && h[i] !== undefined &&
        l[i] !== null && l[i] !== undefined &&
        c[i] !== null && c[i] !== undefined &&
        v[i] !== null && v[i] !== undefined
      ) {
        cleanT.push(t[i]);
        cleanO.push(o[i]);
        cleanH.push(h[i]);
        cleanL.push(l[i]);
        cleanC.push(c[i]);
        cleanV.push(v[i]);
      }
    }

    return {
      t: cleanT,
      o: cleanO,
      h: cleanH,
      l: cleanL,
      c: cleanC,
      v: cleanV,
      s: cleanT.length > 0 ? 'ok' : 'no_data'
    };
  } catch (err) {
    console.error('Yahoo candles error:', err);
    return { s: 'no_data' };
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol');
    if (!symbol) {
      return NextResponse.json({ success: false, error: 'Symbol parameter is required' }, { status: 400 });
    }
    
    const apiKey = process.env.FINNHUB_API_KEY;
    const cleanSymbol = symbol.trim().toUpperCase();

    // Fetch Profile
    const profileRes = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${cleanSymbol}&token=${apiKey}`);
    const profile = profileRes.ok ? await profileRes.json() : {};

    // Fetch News (last 7 days)
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newsRes = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${cleanSymbol}&from=${fromDate}&to=${toDate}&token=${apiKey}`);
    const news = newsRes.ok ? await newsRes.json() : [];

    // Fetch Candles (last 90 days) from Yahoo Finance
    const candles = await fetchYahooCandles(cleanSymbol);

    return NextResponse.json({
      success: true,
      profile,
      news: Array.isArray(news) ? news.slice(0, 10) : [],
      candles
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
