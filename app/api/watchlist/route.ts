import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { watchlist } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const list = await db.select().from(watchlist).where(eq(watchlist.userId, session.user.id));
    return NextResponse.json({ success: true, watchlist: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[Watchlist POST] Session resolved:', session);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol } = await req.json();
    console.log('[Watchlist POST] Adding symbol:', symbol);
    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ success: false, error: 'Symbol is required' }, { status: 400 });
    }
    const cleanSymbol = symbol.trim().toUpperCase();
    
    // Insert into DB associated with active user
    const dbResult = await db.insert(watchlist).values({ 
      userId: session.user.id, 
      symbol: cleanSymbol 
    }).onConflictDoNothing();
    console.log('[Watchlist POST] DB Insert result:', dbResult);
    
    const list = await db.select().from(watchlist).where(eq(watchlist.userId, session.user.id));
    console.log('[Watchlist POST] New watchlist:', list);
    return NextResponse.json({ success: true, watchlist: list });
  } catch (error: any) {
    console.error('[Watchlist POST] Error occurred:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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
    
    await db.delete(watchlist).where(
      and(
        eq(watchlist.userId, session.user.id),
        eq(watchlist.symbol, cleanSymbol)
      )
    );
    
    const list = await db.select().from(watchlist).where(eq(watchlist.userId, session.user.id));
    return NextResponse.json({ success: true, watchlist: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
