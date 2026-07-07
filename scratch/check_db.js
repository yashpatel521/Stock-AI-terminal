const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
  const users = db.prepare("SELECT * FROM users").all();
  console.log("Users in DB:", users);
  
  const watchlist = db.prepare("SELECT * FROM watchlist").all();
  console.log("Watchlist in DB:", watchlist);
} catch (err) {
  console.error("Query failed:", err);
} finally {
  db.close();
}
