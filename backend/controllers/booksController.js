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

exports.detail = (req, res) => {
  const id = req.params.id;
  const book = db.prepare(`SELECT b.*, c.name AS category_name, c.slug AS category_slug FROM books b LEFT JOIN categories c ON c.id=b.category_id WHERE b.id=?`).get(id);
  if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  const digital = db.prepare(`SELECT * FROM digital_books WHERE book_id=?`).get(id);
  res.json({ success: true, data: { ...book, digital } });
};
