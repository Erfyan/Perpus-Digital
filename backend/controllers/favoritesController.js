const db = require('../database/db');
const { getScopedUserId } = require('../middleware/ownership');

exports.list = (req, res) => {
  // Siswa HANYA dapat melihat favorit miliknya sendiri (Aturan 1 & 2)
  const isStudent = req.user.role === 'siswa';
  const targetUserId = isStudent ? req.user.id : (req.query.user_id || req.user.id);

  const rows = db.prepare(`
    SELECT f.id, f.created_at, b.id AS book_id, b.title, b.cover_path, b.rating, b.author, c.name AS category_name
    FROM favorites f
    JOIN books b ON b.id=f.book_id
    LEFT JOIN categories c ON c.id=b.category_id
    WHERE f.user_id=?
    ORDER BY f.created_at DESC
  `).all(targetUserId);

  res.json({ success: true, data: rows });
};

exports.add = (req, res) => {
  const { book_id } = req.body || {};
  if (!book_id) return res.status(400).json({ success: false, message: 'book_id wajib diisi' });

  const book = db.prepare('SELECT id FROM books WHERE id=?').get(book_id);
  if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });

  // Aturan 1 & 4: SELALU simpan atas nama user sesi yang login, abaikan user_id dari req.body
  const safeUserId = req.user.id;

  try {
    db.prepare('INSERT INTO favorites (user_id, book_id) VALUES (?, ?)').run(safeUserId, book_id);
  } catch (e) {
    // Unique constraint: buku sudah difavoritkan sebelumnya
  }

  res.json({ success: true, message: 'Ditambahkan ke favorit', data: { user_id: safeUserId, book_id } });
};

exports.remove = (req, res) => {
  const bookId = req.params.bookId || (req.body && req.body.book_id);
  if (!bookId) return res.status(400).json({ success: false, message: 'book_id wajib diisi' });

  // Cari apakah ada data favorit untuk buku ini
  const rows = db.prepare('SELECT id, user_id FROM favorites WHERE book_id=?').all(bookId);
  if (!rows || rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Data buku favorit tidak ditemukan' });
  }

  // Aturan 3: Cek kepemilikan. Jika milik siswa lain, kembalikan 404 (jangan bocorkan)
  const isOwner = rows.some((f) => Number(f.user_id) === Number(req.user.id));
  if (!isOwner && req.user.role === 'siswa') {
    return res.status(404).json({ success: false, message: 'Data buku favorit tidak ditemukan' });
  }

  // Hapus data favorit milik user saat ini
  db.prepare('DELETE FROM favorites WHERE user_id=? AND book_id=?').run(req.user.id, bookId);
  res.json({ success: true, message: 'Dihapus dari favorit' });
};

exports.removeById = (req, res) => {
  const id = req.params.id;
  const fav = db.prepare('SELECT * FROM favorites WHERE id=?').get(id);
  if (!fav) {
    return res.status(404).json({ success: false, message: 'Data buku favorit tidak ditemukan' });
  }

  if (req.user.role === 'siswa' && Number(fav.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Data buku favorit tidak ditemukan' });
  }

  db.prepare('DELETE FROM favorites WHERE id=?').run(id);
  res.json({ success: true, message: 'Buku berhasil dihapus dari daftar favorit' });
};
