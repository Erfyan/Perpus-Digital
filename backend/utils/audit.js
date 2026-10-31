const db = require('../database/db');

// ensure table
db.exec(`CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  detail TEXT,
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);

function log(action, userId, detail, ip) {
  try { db.prepare('INSERT INTO audit_logs (user_id,action,detail,ip) VALUES (?,?,?,?)').run(userId || null, action, detail || null, ip || null); } catch (e) {}
}

module.exports = { log };
