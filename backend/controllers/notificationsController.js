const db = require('../database/db');

exports.list = (req, res) => {
  const rows = db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  res.json({ success: true, data: rows });
};

exports.markRead = (req, res) => {
  db.prepare('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
};

exports.markAllRead = (req, res) => {
  db.prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(req.user.id);
  res.json({ success: true });
};
