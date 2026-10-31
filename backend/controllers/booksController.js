const db = require('../database/db');

exports.list = (req, res) => {
  const { search, category, type, page = 1, limit = 20 } = req.query;
  let sql = `SELECT b.*, c.name AS category_name, c.slug AS category_slug
             FROM books b LEFT JOIN categories c ON c.id=b.category_id WHERE b.is_active=1`;
  const params = [];
  if (search) {
    sql += ` AND (b.title LIKE ? OR b.author LIKE ? OR c.name LIKE ? OR b.code LIKE ?)`;
    const q = `%${search}%`;
    params.push(q,q,q,q);
  }
  if (category) {
    sql += ` AND (c.slug=? OR c.name=?)`;
    params.push(category, category);
  }
  if (type) {
    if (type === 'digital') sql += ` AND b.book_type IN ('digital','keduanya')`;
    else if (type === 'fisik') sql += ` AND b.book_type IN ('fisik','keduanya')`;
    else sql += ` AND b.book_type=?`;
    if (type !== 'digital' && type !== 'fisik') params.push(type);
  }
  sql += ` ORDER BY b.created_at DESC`;
  const offset = (Number(page)-1)*Number(limit);
  const total = db.prepare(`SELECT COUNT(*) c FROM (${sql})`).get(...params).c;
  sql += ` LIMIT ? OFFSET ?`;
  params.push(Number(limit), offset);
  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows, pagination: { page: Number(page), limit: Number(limit), total } });
};

exports.create = (req, res) => {
  const { title, author, publisher, publication_year, category_id, description, book_type, stock, rating } = req.body || {};
  if (!title) return res.status(400).json({ success: false, message: 'Judul wajib diisi' });
  const code = 'BK' + Date.now();
  const bid = db.prepare(`INSERT INTO books (code,isbn,title,author,publisher,publication_year,category_id,description,cover_path,book_type,stock,available_stock,rating,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)`)
    .run(code, null, title, author || null, publisher || null, publication_year || null, category_id || null, description || null, null, book_type || 'fisik', stock || 0, stock || 0, rating || 0).lastInsertRowid;
  res.json({ success: true, data: { id: bid } });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const book = db.prepare('SELECT id FROM books WHERE id=?').get(id);
  if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  const fields = ['title','author','publisher','publication_year','category_id','description','book_type','stock','available_stock','rating','is_active'];
  const updates = [];
  const params = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f}=?`); params.push(req.body[f]); }
  }
  if (updates.length) {
    params.push(id);
    db.prepare(`UPDATE books SET ${updates.join(',')}, updated_at=datetime('now') WHERE id=?`).run(...params);
  }
  res.json({ success: true, message: 'Buku diperbarui' });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  db.prepare("UPDATE books SET is_active=0, updated_at=datetime('now') WHERE id=?").run(id);
  res.json({ success: true, message: 'Buku dinonaktifkan' });
};
exports.detail = (req, res) => {
  const id = req.params.id;
  const book = db.prepare(`SELECT b.*, c.name AS category_name, c.slug AS category_slug FROM books b LEFT JOIN categories c ON c.id=b.category_id WHERE b.id=?`).get(id);
  if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  const digital = db.prepare(`SELECT * FROM digital_books WHERE book_id=?`).get(id);
  res.json({ success: true, data: { ...book, digital } });
};
