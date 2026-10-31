const db = require('../database/db');
const bcrypt = require('bcryptjs');
const { signToken } = require('../middleware/auth');
const { log } = require('../utils/audit');

const attempts = new Map();
function rateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const max = 10;
  const rec = attempts.get(ip) || { count: 0, start: now };
  if (now - rec.start > windowMs) { rec.count = 0; rec.start = now; }
  rec.count++;
  attempts.set(ip, rec);
  return rec.count <= max;
}

exports.login = (req, res) => {
  const ip = req.ip || req.connection?.remoteAddress;
  if (!rateLimit(ip)) return res.status(429).json({ success: false, message: 'Terlalu banyak percobaan login' });
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user || !user.is_active) {
    log('login_failed', null, `username=${username}`, ip);
    return res.status(401).json({ success: false, message: 'Akun tidak ditemukan atau nonaktif' });
  }
  if (!bcrypt.compareSync(password, user.password_hash)) {
    log('login_failed', user.id, 'password salah', ip);
    return res.status(401).json({ success: false, message: 'Password salah' });
  }
  let student = null;
  if (user.role === 'siswa') {
    student = db.prepare('SELECT * FROM students WHERE user_id=?').get(user.id);
  }
  const token = signToken(user);
  log('login_success', user.id, user.role, ip);
  res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role }, student });
};

exports.me = (req, res) => {
  const user = db.prepare('SELECT id,username,role,is_active,created_at FROM users WHERE id=?').get(req.user.id);
  let student = null;
  if (user.role === 'siswa') student = db.prepare('SELECT * FROM students WHERE user_id=?').get(user.id);
  res.json({ success: true, user, student });
};
