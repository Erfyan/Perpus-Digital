const db = require('../database/db');

exports.list = (req, res) => {
  const rows = db.prepare(`
    SELECT f.id, f.created_at, b.id AS book_id, b.title, b.cover_path, b.rating, b.author, c.name AS category_name
    FROM favorites f JOIN books b ON b.id=f.book_id LEFT JOIN categories c ON c.id=b.category_id
    WHERE f.user_id=? ORDER BY f.created_at DESC
  `).all(req.user.id);
  res.json({ success: true, data: rows });
};

exports.add = (req, res) => {
  const { book_id } = req.body || {};
  if (!book_id) return res.status(400).json({ success: false, message: 'book_id wajib diisi' });
  const book = db.prepare('SELECT id FROM books WHERE id=?').get(book_id);
  if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  try {
    db.prepare('INSERT INTO favorites (user_id,book_id) VALUES (?,?)').run(req.user.id, book_id);
  } catch (e) {
    // ignore unique constraint
  }
  res.json({ success: true, message: 'Ditambahkan ke favorit' });
};

exports.remove = (req, res) => {
  const bookId = req.params.bookId || (req.body && req.body.book_id);
  if (!bookId) return res.status(400).json({ success: false, message: 'book_id wajib diisi' });
  db.prepare('DELETE FROM favorites WHERE user_id=? AND book_id=?').run(req.user.id, bookId);
  res.json({ success: true, message: 'Dihapus dari favorit' });
};
