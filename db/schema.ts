import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const watchlist = sqliteTable('watchlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (t) => ({
  userIdSymbolUnique: unique().on(t.userId, t.symbol)
}));

export const analysisHistory = sqliteTable('analysis_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  trend: text('trend').notNull(), // bullish, bearish, sideways
  entryZone: text('entry_zone').notNull(),
  targetZone: text('target_zone').notNull(),
  stopLoss: text('stop_loss').notNull(),
  riskLevel: text('risk_level').notNull(),
  confidenceScore: integer('confidence_score').notNull(),
  explanation: text('explanation').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const marketScans = sqliteTable('market_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  results: text('results').notNull(), // JSON string representing the 5 stocks array
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});
