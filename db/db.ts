import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var db: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>>;

const createTableSql = `
  CREATE TABLE IF NOT EXISTS market_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    results TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

if (process.env.NODE_ENV === 'production') {
  const sqlite = new Database('sqlite.db');
  sqlite.exec(createTableSql);
  dbInstance = drizzle(sqlite, { schema });
} else {
  if (!global.db) {
    const sqlite = new Database('sqlite.db');
    sqlite.exec(createTableSql);
    global.db = drizzle(sqlite, { schema });
  }
  dbInstance = global.db;
}

export const db = dbInstance;
