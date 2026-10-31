const db = require('../database/db');
const bcrypt = require('bcryptjs');
const { signToken } = require('../middleware/auth');

exports.login = (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user || !user.is_active) return res.status(401).json({ success: false, message: 'Akun tidak ditemukan atau nonaktif' });
  if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ success: false, message: 'Password salah' });
  let student = null;
  if (user.role === 'siswa') {
    student = db.prepare('SELECT * FROM students WHERE user_id=?').get(user.id);
  }
  const token = signToken(user);
  res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role }, student });
};

exports.me = (req, res) => {
  const user = db.prepare('SELECT id,username,role,is_active,created_at FROM users WHERE id=?').get(req.user.id);
  let student = null;
  if (user.role === 'siswa') student = db.prepare('SELECT * FROM students WHERE user_id=?').get(user.id);
  res.json({ success: true, user, student });
};
