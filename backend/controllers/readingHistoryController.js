const db = require('../database/db');

exports.list = (req, res) => {
  const rows = db.prepare(`
    SELECT rh.*, b.title, b.cover_path, c.name AS category_name
    FROM reading_history rh
    JOIN books b ON b.id=rh.book_id
    LEFT JOIN categories c ON c.id=b.category_id
    WHERE rh.user_id=?
    ORDER BY rh.last_read_at DESC
  `).all(req.user.id);
  res.json({ success: true, data: rows });
};
