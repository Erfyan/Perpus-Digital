const db = require('../database/db');

exports.list = (req, res) => {
  const { search } = req.query;
  let sql = `
    SELECT c.*, COUNT(b.id) AS book_count
    FROM categories c
    LEFT JOIN books b ON b.category_id = c.id AND b.is_active = 1
  `;
  const params = [];
  if (search) {
    sql += ` WHERE c.name LIKE ? OR c.slug LIKE ?`;
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ` GROUP BY c.id ORDER BY c.name ASC`;
  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows });
};

exports.create = (req, res) => {
  const { name, slug, icon_name, color_theme } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
  }

  const s = slug ? slug.trim().toLowerCase().replace(/\s+/g, '-') : name.trim().toLowerCase().replace(/\s+/g, '-');

  // Cek duplikasi slug atau nama
  const existing = db.prepare('SELECT id FROM categories WHERE slug=? OR name=?').get(s, name.trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Kategori dengan nama atau slug tersebut sudah ada' });
  }

  const id = db.prepare(`
    INSERT INTO categories (name, slug, icon_name, color_theme) 
    VALUES (?,?,?,?)
  `).run(name.trim(), s, icon_name || 'BookOpen', color_theme || 'blue').lastInsertRowid;

  res.json({ success: true, message: 'Kategori berhasil ditambahkan', data: { id, name: name.trim(), slug: s } });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const cat = db.prepare('SELECT * FROM categories WHERE id=?').get(id);
  if (!cat) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });

  const { name, slug, icon_name, color_theme } = req.body || {};
  if (name !== undefined && (!name || !name.trim())) {
    return res.status(400).json({ success: false, message: 'Nama kategori tidak boleh kosong' });
  }

  const newName = name !== undefined ? name.trim() : cat.name;
  const newSlug = slug !== undefined ? slug.trim().toLowerCase().replace(/\s+/g, '-') : (name !== undefined ? newName.toLowerCase().replace(/\s+/g, '-') : cat.slug);

  // Cek duplikasi dengan kategori lain
  const existing = db.prepare('SELECT id FROM categories WHERE (slug=? OR name=?) AND id!=?').get(newSlug, newName, id);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Kategori dengan nama atau slug tersebut sudah digunakan' });
  }

  db.prepare(`
    UPDATE categories SET
      name = ?,
      slug = ?,
      icon_name = COALESCE(?, icon_name),
      color_theme = COALESCE(?, color_theme)
    WHERE id = ?
  `).run(newName, newSlug, icon_name || null, color_theme || null, id);

  res.json({ success: true, message: 'Kategori berhasil diperbarui' });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  const cat = db.prepare('SELECT id FROM categories WHERE id=?').get(id);
  if (!cat) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });

  // Update buku yang berelasi dengan kategori ini agar category_id menjadi null
  db.prepare('UPDATE books SET category_id = NULL WHERE category_id = ?').run(id);

  db.prepare('DELETE FROM categories WHERE id=?').run(id);
  res.json({ success: true, message: 'Kategori berhasil dihapus' });
};
