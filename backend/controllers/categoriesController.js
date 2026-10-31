const db = require('../database/db');

exports.list = (req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json({ success: true, data: rows });
};

exports.create = (req, res) => {
  const { name, slug, icon_name, color_theme } = req.body || {};
  if (!name) return res.status(400).json({ success: false, message: 'Nama wajib diisi' });
  const s = slug || name.toLowerCase().replace(/\s+/g,'-');
  const id = db.prepare('INSERT INTO categories (name,slug,icon_name,color_theme) VALUES (?,?,?,?)').run(name, s, icon_name || null, color_theme || null).lastInsertRowid;
  res.json({ success: true, data: { id } });
};

exports.remove = (req, res) => {
  db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
  res.json({ success: true, message: 'Kategori dihapus' });
};
