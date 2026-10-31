const db = require('../database/db');

function findDigital(bookId) {
  return db.prepare(`SELECT * FROM digital_books WHERE book_id=?`).get(bookId);
}

exports.get = (req, res) => {
  const userId = req.user.id;
  const dbb = findDigital(req.params.bookId);
  if (!dbb) return res.status(404).json({ success: false, message: 'Buku digital tidak ditemukan' });
  const rp = db.prepare(`SELECT * FROM reading_progress WHERE user_id=? AND digital_book_id=?`).get(userId, dbb.id);
  res.json({ success: true, data: rp || null, digital_book_id: dbb.id, total_pages: dbb.total_pages });
};

exports.update = (req, res) => {
  const userId = req.user.id;
  const dbb = findDigital(req.params.bookId);
  if (!dbb) return res.status(404).json({ success: false, message: 'Buku digital tidak ditemukan' });
  const { last_page, total_pages } = req.body || {};
  if (last_page == null) return res.status(400).json({ success: false, message: 'last_page wajib diisi' });
  const tp = total_pages || dbb.total_pages || 0;
  const lp = Math.max(0, Math.min(Number(last_page), tp || Number(last_page)));
  const pct = tp > 0 ? (lp / tp) * 100 : 0;
  const completed = (tp > 0 && lp >= tp) ? 1 : 0;
  const now = new Date().toISOString();
  const existing = db.prepare(`SELECT id FROM reading_progress WHERE user_id=? AND digital_book_id=?`).get(userId, dbb.id);
  if (existing) {
    db.prepare(`UPDATE reading_progress SET last_page=?, total_pages=?, progress_percentage=?, last_read_at=?, completed=? WHERE id=?`)
      .run(lp, tp, pct, now, completed, existing.id);
  } else {
    db.prepare(`INSERT INTO reading_progress (user_id,digital_book_id,last_page,total_pages,progress_percentage,last_read_at,completed) VALUES (?,?,?,?,?,?,?)`)
      .run(userId, dbb.id, lp, tp, pct, now, completed);
  }
  // also update reading_history? optional
  res.json({ success: true, data: { digital_book_id: dbb.id, last_page: lp, total_pages: tp, progress_percentage: pct, completed: !!completed } });
};
