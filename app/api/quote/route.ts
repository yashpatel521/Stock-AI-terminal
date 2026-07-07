import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol');
    if (!symbol) {
      return NextResponse.json({ success: false, error: 'Symbol is required' }, { status: 400 });
    }
    
    const apiKey = process.env.FINNHUB_API_KEY;
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`);
    if (!res.ok) {
      throw new Error('Failed to fetch quote from Finnhub');
    }
    const data = await res.json();
    return NextResponse.json({ success: true, quote: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
