const db = require('../database/db');
const { getScopedUserId } = require('../middleware/ownership');

function findDigital(id) {
  return db.prepare(`SELECT * FROM digital_books WHERE book_id=? OR id=?`).get(id, id);
}

exports.list = (req, res) => {
  // Aturan 2: List reading-progress difilter WHERE user_id = req.user.id untuk siswa
  const isStudent = req.user.role === 'siswa';
  const targetUserId = isStudent ? req.user.id : (req.query.user_id || req.user.id);

  const rows = db.prepare(`
    SELECT rp.*, db.book_id, b.title, b.cover_path, c.name AS category_name
    FROM reading_progress rp
    JOIN digital_books db ON db.id = rp.digital_book_id
    JOIN books b ON b.id = db.book_id
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE rp.user_id = ?
    ORDER BY rp.last_read_at DESC
  `).all(targetUserId);

  res.json({ success: true, data: rows });
};

exports.get = (req, res) => {
  // Aturan 1: Identitas siswa SELALU diambil dari sesi login req.user.id
  const isStudent = req.user.role === 'siswa';
  const targetUserId = isStudent ? req.user.id : (req.query.user_id || req.user.id);

  const dbb = findDigital(req.params.bookId);
  if (!dbb) return res.status(404).json({ success: false, message: 'Buku digital tidak ditemukan' });

  const rp = db.prepare(`SELECT * FROM reading_progress WHERE user_id=? AND digital_book_id=?`).get(targetUserId, dbb.id);
  res.json({ success: true, data: rp || null, digital_book_id: dbb.id, total_pages: dbb.total_pages });
};

exports.getById = (req, res) => {
  const id = req.params.id;
  const rp = db.prepare(`SELECT * FROM reading_progress WHERE id=?`).get(id);

  if (!rp) {
    return res.status(404).json({ success: false, message: 'Data progres membaca tidak ditemukan' });
  }

  // Aturan 3: Jika bukan pemilik, tolak dengan 404
  if (req.user.role === 'siswa' && Number(rp.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Data progres membaca tidak ditemukan' });
  }

  res.json({ success: true, data: rp });
};

exports.update = (req, res) => {
  // Aturan 1 & 4: SELALU simpan user_id dari sesi req.user.id, abaikan user_id di body
  const userId = req.user.id;
  const dbb = findDigital(req.params.bookId);
  if (!dbb) return res.status(404).json({ success: false, message: 'Buku digital tidak ditemukan' });

  const { last_page, total_pages } = req.body || {};
  if (last_page == null) return res.status(400).json({ success: false, message: 'last_page wajib diisi' });

  const tp = total_pages || dbb.total_pages || 100;
  const lp = Math.max(1, Math.min(Number(last_page), tp));
  const pct = tp > 0 ? Math.round(((lp / tp) * 100) * 10) / 10 : 0;
  const completed = (tp > 0 && lp >= tp) ? 1 : 0;
  const now = new Date().toISOString();

  // Update or insert reading_progress atas nama req.user.id
  const existing = db.prepare(`SELECT id FROM reading_progress WHERE user_id=? AND digital_book_id=?`).get(userId, dbb.id);
  if (existing) {
    db.prepare(`
      UPDATE reading_progress 
      SET last_page=?, total_pages=?, progress_percentage=?, last_read_at=?, completed=? 
      WHERE id=?
    `).run(lp, tp, pct, now, completed, existing.id);
  } else {
    db.prepare(`
      INSERT INTO reading_progress 
      (user_id, digital_book_id, last_page, total_pages, progress_percentage, last_read_at, completed) 
      VALUES (?,?,?,?,?,?,?)
    `).run(userId, dbb.id, lp, tp, pct, now, completed);
  }

  // Sync reading_history atas nama req.user.id
  const existingHistory = db.prepare(`SELECT id FROM reading_history WHERE user_id=? AND book_id=?`).get(userId, dbb.book_id);
  if (existingHistory) {
    db.prepare(`
      UPDATE reading_history 
      SET last_page=?, progress_percentage=?, last_read_at=?, completed=?
      WHERE id=?
    `).run(lp, pct, now, completed, existingHistory.id);
  } else {
    db.prepare(`
      INSERT INTO reading_history 
      (user_id, book_id, last_page, progress_percentage, last_read_at, completed)
      VALUES (?,?,?,?,?,?)
    `).run(userId, dbb.book_id, lp, pct, now, completed);
  }

  res.json({
    success: true,
    data: {
      user_id: userId,
      digital_book_id: dbb.id,
      book_id: dbb.book_id,
      last_page: lp,
      total_pages: tp,
      progress_percentage: pct,
      completed: !!completed
    }
  });
};
