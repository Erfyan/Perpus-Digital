const db = require('../database/db');
const bcrypt = require('bcryptjs');

exports.list = (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, u.username, u.is_active
    FROM students s JOIN users u ON u.id=s.user_id
    ORDER BY s.full_name
  `).all();
  res.json({ success: true, data: rows });
};

exports.create = (req, res) => {
  const { username, password, nis, full_name, class_name } = req.body || {};
  if (!username || !password || !nis || !full_name) return res.status(400).json({ success: false, message: 'Field wajib belum lengkap' });
  const uid = db.prepare('INSERT INTO users (username,password_hash,role,is_active) VALUES (?,?,?,1)').run(username, bcrypt.hashSync(password,10), 'siswa').lastInsertRowid;
  const sid = db.prepare('INSERT INTO students (user_id,nis,full_name,class_name) VALUES (?,?,?,?)').run(uid, nis, full_name, class_name || null).lastInsertRowid;
  res.json({ success: true, data: { id: sid, user_id: uid } });
};

exports.remove = (req, res) => {
  const s = db.prepare('SELECT user_id FROM students WHERE id=?').get(req.params.id);
  if (!s) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
  db.prepare('DELETE FROM students WHERE id=?').run(req.params.id);
  db.prepare('DELETE FROM users WHERE id=?').run(s.user_id);
  res.json({ success: true, message: 'Siswa dihapus' });
};
