const db = require('../database/db');

exports.student = (req, res) => {
  const userId = req.user.id;
  const student = db.prepare('SELECT * FROM students WHERE user_id=?').get(userId);
  if (!student) return res.status(404).json({ success: false, message: 'Profil siswa tidak ditemukan' });

  const totalDigital = db.prepare(`SELECT COUNT(*) c FROM digital_books db JOIN books b ON b.id=db.book_id WHERE b.is_active=1`).get().c;
  const completed = db.prepare(`SELECT COUNT(*) c FROM reading_progress WHERE user_id=? AND completed=1`).get(userId).c;
  const inProgress = db.prepare(`SELECT COUNT(*) c FROM reading_progress WHERE user_id=? AND progress_percentage>0 AND progress_percentage<100`).get(userId).c;
  const favoritesCount = db.prepare(`SELECT COUNT(*) c FROM favorites WHERE user_id=?`).get(userId).c;

  const currentlyReading = db.prepare(`
    SELECT rp.last_page, rp.total_pages, rp.progress_percentage, rp.last_read_at,
           db.id AS digital_book_id, b.id AS book_id, b.title, b.cover_path, b.rating,
           c.name AS category_name
    FROM reading_progress rp
    JOIN digital_books db ON db.id=rp.digital_book_id
    JOIN books b ON b.id=db.book_id
    LEFT JOIN categories c ON c.id=b.category_id
    WHERE rp.user_id=? AND rp.progress_percentage>0 AND rp.progress_percentage<100
    ORDER BY rp.last_read_at DESC
  `).all(userId);

  const history = db.prepare(`
    SELECT rh.last_page, rh.progress_percentage, rh.last_read_at, rh.completed,
           b.id AS book_id, b.title, b.cover_path, c.name AS category_name
    FROM reading_history rh
    JOIN books b ON b.id=rh.book_id
    LEFT JOIN categories c ON c.id=b.category_id
    WHERE rh.user_id=?
    ORDER BY rh.last_read_at DESC
    LIMIT 10
  `).all(userId);

  const recommendations = db.prepare(`
    SELECT b.id,b.title,b.cover_path,b.rating,b.author, c.name AS category_name
    FROM books b
    LEFT JOIN categories c ON c.id=b.category_id
    WHERE b.is_active=1
    ORDER BY b.rating DESC, b.created_at DESC
    LIMIT 6
  `).all();

  const newBooks = db.prepare(`
    SELECT b.id,b.title,b.cover_path,b.rating,b.author, c.name AS category_name, b.created_at
    FROM books b
    LEFT JOIN categories c ON c.id=b.category_id
    WHERE b.is_active=1
    ORDER BY b.created_at DESC
    LIMIT 6
  `).all();

  const categories = db.prepare(`
    SELECT c.id,c.name,c.slug,c.icon_name,c.color_theme, COUNT(b.id) AS book_count
    FROM categories c LEFT JOIN books b ON b.category_id=c.id
    GROUP BY c.id ORDER BY c.name
  `).all();

  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 10
  `).all(userId);
  const unreadCount = db.prepare(`SELECT COUNT(*) c FROM notifications WHERE user_id=? AND is_read=0`).get(userId).c;

  res.json({
    success: true,
    student,
    stats: { totalDigital, completed, inProgress, favorites: favoritesCount },
    currentlyReading,
    history,
    recommendations,
    newBooks,
    categories,
    notifications,
    unreadCount,
  });
};
