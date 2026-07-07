import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/db/db';
import { marketScans } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gemini API key is not configured in the environment variables.' 
      }, { status: 500 });
    }

    const prompt = `
You are an elite institutional market research AI with expertise in equities, macroeconomics, technical analysis, quantitative investing, options flow, and market sentiment.
PRIMARY OBJECTIVE
Research the current market using the most recent available information and identify the 5 best stocks to trade today.
Do NOT simply choose the largest companies. Select stocks with the highest probability trading opportunities based on all available evidence.
Think like a hedge fund research team combining macro analysts, technical analysts, quantitative researchers, and fundamental analysts.

RESEARCH REQUIREMENTS
Research and analyze all available information including macro trends, CPI/PPI data, interest rates, CPI adjustments, sector rotations, volume flow, analyst upgrades/downgrades, RSI/MACD charts, options activity, and historical stock trends.

STOCK SELECTION RULES
Choose EXACTLY 5 stocks.
The stocks should have:
- Strong liquidity
- Good risk/reward
- Clear technical setup
- Positive catalyst
- Institutional interest
- Strong momentum
- High probability opportunity

Avoid weak setups.
Avoid duplicate ideas.
Diversify when appropriate.

FOR EACH STOCK CALCULATE
- Expected Day High
- Expected Day Low
- Expected Week High
- Expected Week Low
- Bullish or Bearish Bias
- Confidence Score (0–100)

RANKING
Rank all five stocks.
Rank #1 should be the best opportunity.
Rank #5 should be the weakest of the top five.

OUTPUT FORMAT:
Provide the resulting table as a raw JSON array. Do NOT wrap it in Markdown code blocks or markdown code syntax. Return only the JSON content.
Each object in the array MUST match this TypeScript structure:
{
  "rank": number, // 1 to 5
  "symbol": string, // e.g. "NVDA"
  "bias": "bullish" | "bearish",
  "dayHigh": string, // e.g. "$125.40"
  "dayLow": string, // e.g. "$121.20"
  "weekHigh": string, // e.g. "$130.00"
  "weekLow": string, // e.g. "$118.50"
  "confidence": number // 0 to 100
}
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    if (!Array.isArray(parsed) || parsed.length !== 5) {
      throw new Error('Gemini failed to return exactly 5 stock predictions.');
    }

    // Save to SQLite
    const inserted = await db.insert(marketScans).values({
      userId: session.user.id,
      results: JSON.stringify(parsed),
    }).returning();

    return NextResponse.json({ success: true, scan: inserted[0] });
  } catch (error: any) {
    console.error('Market scan error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch history, newest first
    const scansList = await db
      .select()
      .from(marketScans)
      .where(eq(marketScans.userId, session.user.id))
      .orderBy(desc(marketScans.createdAt))
      .limit(10);

    return NextResponse.json({ success: true, scans: scansList });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
