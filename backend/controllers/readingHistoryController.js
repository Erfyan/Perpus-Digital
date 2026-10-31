const db = require('../database/db');
const { getScopedUserId } = require('../middleware/ownership');

exports.list = (req, res) => {
  // Aturan 1 & 2: Siswa HANYA dapat melihat riwayat membaca miliknya sendiri
  const isStudent = req.user.role === 'siswa';
  const targetUserId = isStudent ? req.user.id : (req.query.user_id || req.user.id);

  let sql = `
    SELECT rh.*, b.title, b.cover_path, c.name AS category_name
    FROM reading_history rh
    JOIN books b ON b.id=rh.book_id
    LEFT JOIN categories c ON c.id=b.category_id
    WHERE 1=1
  `;
  const params = [];

  if (isStudent || req.query.user_id) {
    sql += ` AND rh.user_id = ?`;
    params.push(targetUserId);
  }

  sql += ` ORDER BY rh.last_read_at DESC`;

  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows });
};

exports.getById = (req, res) => {
  const id = req.params.id;
  const rh = db.prepare(`
    SELECT rh.*, b.title, b.cover_path, c.name AS category_name
    FROM reading_history rh
    JOIN books b ON b.id=rh.book_id
    LEFT JOIN categories c ON c.id=b.category_id
    WHERE rh.id = ?
  `).get(id);

  if (!rh) {
    return res.status(404).json({ success: false, message: 'Data riwayat membaca tidak ditemukan' });
  }

  // Aturan 3: Jika siswa mengakses milik siswa lain, kembalikan 404
  if (req.user.role === 'siswa' && Number(rh.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Data riwayat membaca tidak ditemukan' });
  }

  res.json({ success: true, data: rh });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  const rh = db.prepare('SELECT id, user_id FROM reading_history WHERE id = ?').get(id);

  if (!rh) {
    return res.status(404).json({ success: false, message: 'Data riwayat membaca tidak ditemukan' });
  }

  // Aturan 3: Jika bukan pemilik dan bukan staff, tolak 404
  if (req.user.role === 'siswa' && Number(rh.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Data riwayat membaca tidak ditemukan' });
  }

  db.prepare('DELETE FROM reading_history WHERE id = ?').run(id);
  res.json({ success: true, message: 'Riwayat membaca berhasil dihapus' });
};
