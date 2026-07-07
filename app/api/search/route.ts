import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q');
    if (!q) {
      return NextResponse.json({ success: true, results: [] });
    }
    
    const token = process.env.FINNHUB_API_KEY;
    const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${token}`);
    
    if (!res.ok) {
      throw new Error('Finnhub search request failed');
    }
    
    const data = await res.json();
    
    // Filter results to return clean US stocks
    const filtered = (data.result || [])
      .filter((item: any) => item.type === 'Common Stock' && !item.symbol.includes('.'))
      .slice(0, 5);

    // Fetch quote in parallel for each suggestion
    const results = await Promise.all(
      filtered.map(async (item: any) => {
        try {
          const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${item.symbol}&token=${token}`);
          if (quoteRes.ok) {
            const quoteData = await quoteRes.json();
            return {
              symbol: item.symbol,
              name: item.description,
              price: typeof quoteData.c === 'number' ? quoteData.c : null,
              change: typeof quoteData.dp === 'number' ? quoteData.dp : null,
            };
          }
        } catch (err) {
          console.error(`Autocomplete fetch quote failed for ${item.symbol}:`, err);
        }
        return {
          symbol: item.symbol,
          name: item.description,
          price: null,
          change: null,
        };
      })
    );
      
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Autocomplete search error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
