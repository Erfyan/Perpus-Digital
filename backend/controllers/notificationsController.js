const db = require('../database/db');

exports.list = (req, res) => {
  // Aturan 1 & 2: Siswa HANYA dapat melihat notifikasi miliknya sendiri
  const isStudent = req.user.role === 'siswa';
  const targetUserId = isStudent ? req.user.id : (req.query.user_id || req.user.id);

  const rows = db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC').all(targetUserId);
  res.json({ success: true, data: rows });
};

exports.getById = (req, res) => {
  const id = req.params.id;
  const notif = db.prepare('SELECT * FROM notifications WHERE id=?').get(id);

  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan' });
  }

  // Aturan 3: Jika bukan pemilik, tolak dengan 404
  if (req.user.role === 'siswa' && Number(notif.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan' });
  }

  res.json({ success: true, data: notif });
};

exports.markRead = (req, res) => {
  const id = req.params.id;
  const notif = db.prepare('SELECT id, user_id FROM notifications WHERE id=?').get(id);

  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan' });
  }

  // Aturan 3: Jika bukan pemilik, tolak 404
  if (req.user.role === 'siswa' && Number(notif.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan' });
  }

  db.prepare('UPDATE notifications SET is_read=1 WHERE id=?').run(id);
  res.json({ success: true, message: 'Notifikasi ditandai telah dibaca' });
};

exports.markAllRead = (req, res) => {
  // Aturan 1: Hanya update notifikasi milik user yang sedang login
  db.prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(req.user.id);
  res.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca' });
};
