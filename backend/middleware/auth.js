const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function authenticate(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id,username,role,is_active FROM users WHERE id=?').get(payload.id);
    if (!user || !user.is_active) return res.status(401).json({ success: false, message: 'User tidak aktif' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Belum login' });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    next();
  };
}

module.exports = { signToken, authenticate, authorize, JWT_SECRET };
