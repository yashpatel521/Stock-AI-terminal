import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/db/db';
import { analysisHistory } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol } = await req.json();
    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ success: false, error: 'Symbol is required' }, { status: 400 });
    }
    const cleanSymbol = symbol.trim().toUpperCase();
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Finnhub API key is not configured' }, { status: 500 });
    }

    // 1. Fetch Profile
    const profileRes = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${cleanSymbol}&token=${apiKey}`);
    const profile = profileRes.ok ? await profileRes.json() : {};

    // 2. Fetch Quote
    const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${cleanSymbol}&token=${apiKey}`);
    const quote = quoteRes.ok ? await quoteRes.json() : {};

    // 3. Fetch Candles (90 days) from Yahoo Finance
    const candles = await fetchYahooCandles(cleanSymbol);

    // 4. Fetch News (7 days)
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newsRes = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${cleanSymbol}&from=${fromDate}&to=${toDate}&token=${apiKey}`);
    const news = newsRes.ok ? await newsRes.json() : [];

    // Limit news to latest 10 items to avoid token bloat
    const limitedNews = Array.isArray(news) ? news.slice(0, 10) : [];

    // Construct the structured prompt
    const prompt = `
You are a professional financial research analyst assistant. Analyze the stock data for ${cleanSymbol} and generate a structured trade plan/report.

DATA:
Company Name: ${profile.name || cleanSymbol}
Industry: ${profile.finnhubIndustry || 'N/A'}
Market Capitalization: ${profile.marketCapitalization || 'N/A'}

Current Quote:
- Last Price: $${quote.c || 'N/A'}
- Daily High: $${quote.h || 'N/A'}
- Daily Low: $${quote.l || 'N/A'}
- Previous Close: $${quote.pc || 'N/A'}

Recent 90-Day Candles (OHLCV Arrays):
- Close Prices: ${JSON.stringify(candles.c || [])}
- High Prices: ${JSON.stringify(candles.h || [])}
- Low Prices: ${JSON.stringify(candles.l || [])}
- Volume: ${JSON.stringify(candles.v || [])}

Recent Company News:
${limitedNews.map((item: any) => `- [${new Date(item.datetime * 1000).toDateString()}] ${item.headline}: ${item.summary}`).join('\n')}

INSTRUCTIONS:
Provide a clear analysis and trading recommendation based on the data. Focus on trend, support, resistance, news sentiment, and risk levels. 
Your output MUST be a strict JSON object matching this TypeScript interface:
interface AnalysisResult {
  trend: "bullish" | "bearish" | "sideways";
  entryZone: string; // Recommended entry price range, e.g. "$170 - $175"
  targetZone: string; // Target price range, e.g. "$195 - $200"
  stopLoss: string; // Stop loss price level, e.g. "$165"
  riskLevel: "Low" | "Medium" | "High";
  confidenceScore: number; // An integer value from 0 to 100
  explanation: string; // 2-3 sentences explaining why this trade plan is recommended based on trend and news.
}
Return ONLY the raw JSON string matching the specified structure. Do NOT wrap it in any Markdown code blocks.
`;

    // Send to Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    // Save to SQLite associated with active user
    const inserted = await db.insert(analysisHistory).values({
      userId: session.user.id,
      symbol: cleanSymbol,
      trend: parsed.trend || 'sideways',
      entryZone: parsed.entryZone || 'N/A',
      targetZone: parsed.targetZone || 'N/A',
      stopLoss: parsed.stopLoss || 'N/A',
      riskLevel: parsed.riskLevel || 'Medium',
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 50,
      explanation: parsed.explanation || '',
    }).returning();

    return NextResponse.json({ success: true, analysis: inserted[0] });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
    
    let history;
    if (symbol) {
      const cleanSymbol = symbol.trim().toUpperCase();
      // Fetch history for specific symbol, newest first
      history = await db
        .select()
        .from(analysisHistory)
        .where(
          and(
            eq(analysisHistory.symbol, cleanSymbol),
            eq(analysisHistory.userId, session.user.id)
          )
        )
        .orderBy(desc(analysisHistory.createdAt))
        .limit(10);
    } else {
      // Fetch all history for user, newest first
      history = await db
        .select()
        .from(analysisHistory)
        .where(eq(analysisHistory.userId, session.user.id))
        .orderBy(desc(analysisHistory.createdAt))
        .limit(50);
    }

    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
