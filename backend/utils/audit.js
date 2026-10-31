const db = require('../database/db');

// Pastikan tabel audit_logs ada dengan indeks yang baik
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    detail TEXT,
    ip TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

function log(action, userId, detail, ip) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, detail, ip)
      VALUES (?, ?, ?, ?)
    `).run(userId || null, action, detail || null, ip || null);
  } catch (e) {
    console.error('Gagal mencatat audit log:', e.message);
  }
}

function getLogs(limit = 100) {
  return db.prepare(`
    SELECT al.*, u.username, u.role
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC
    LIMIT ?
  `).all(limit);
}

module.exports = { log, getLogs };
