import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      return NextResponse.json({ success: false, error: 'Username must be at least 3 characters' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if username exists
    const existing = await db.select().from(users).where(eq(users.username, cleanUsername)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Username is already taken' }, { status: 400 });
    }

    // Hash and insert user
    const passwordHash = hashPassword(password);
    const inserted = await db.insert(users).values({
      username: cleanUsername,
      passwordHash,
    }).returning();

    const user = inserted[0];

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
