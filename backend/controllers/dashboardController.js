const db = require('../database/db');

exports.student = (req, res) => {
  const userId = req.user.id;
  const student = db.prepare('SELECT * FROM students WHERE user_id=?').get(userId);
  if (!student) return res.status(404).json({ success: false, message: 'Profil siswa tidak ditemukan' });

  // 4 Kartu Statistik Murni dari Database
  const totalDigital = db.prepare(`SELECT COUNT(*) c FROM digital_books db JOIN books b ON b.id=db.book_id WHERE b.is_active=1`).get().c;
  const completed = db.prepare(`SELECT COUNT(*) c FROM reading_progress WHERE user_id=? AND completed=1`).get(userId).c;
  const inProgress = db.prepare(`SELECT COUNT(*) c FROM reading_progress WHERE user_id=? AND progress_percentage>0 AND progress_percentage<100`).get(userId).c;
  const favoritesCount = db.prepare(`SELECT COUNT(*) c FROM favorites WHERE user_id=?`).get(userId).c;

  // Sedang Dibaca (tampilkan semua yang progress > 0 dan < 100)
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

  // Riwayat Membaca
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

  // Poin 1d: Rekomendasi Buku Rule-Based (berdasarkan kategori sering dibaca, rating tinggi, buku terbaru)
  // 1. Cari kategori yang paling sering dibaca / difavoritkan oleh siswa ini
  const topCategoryRow = db.prepare(`
    SELECT b.category_id, COUNT(*) as cnt
    FROM (
      SELECT book_id FROM reading_history WHERE user_id=?
      UNION ALL
      SELECT db.book_id FROM reading_progress rp JOIN digital_books db ON db.id=rp.digital_book_id WHERE rp.user_id=?
      UNION ALL
      SELECT book_id FROM favorites WHERE user_id=?
    ) user_books
    JOIN books b ON b.id=user_books.book_id
    WHERE b.category_id IS NOT NULL
    GROUP BY b.category_id
    ORDER BY cnt DESC
    LIMIT 1
  `).get(userId, userId, userId);

  const topCategoryId = topCategoryRow ? topCategoryRow.category_id : null;

  // Query rekomendasi: Jika ada kategori favorit, prioritaskan buku dari kategori tersebut, lalu rating tinggi dan terbaru
  let recommendations;
  if (topCategoryId) {
    recommendations = db.prepare(`
      SELECT b.id, b.title, b.cover_path, b.rating, b.author, c.name AS category_name,
             CASE WHEN b.category_id = ? THEN 1 ELSE 0 END AS is_preferred
      FROM books b
      LEFT JOIN categories c ON c.id=b.category_id
      WHERE b.is_active=1
      ORDER BY is_preferred DESC, b.rating DESC, b.created_at DESC
      LIMIT 6
    `).all(topCategoryId);
  } else {
    recommendations = db.prepare(`
      SELECT b.id, b.title, b.cover_path, b.rating, b.author, c.name AS category_name
      FROM books b
      LEFT JOIN categories c ON c.id=b.category_id
      WHERE b.is_active=1
      ORDER BY b.rating DESC, b.created_at DESC
      LIMIT 6
    `).all();
  }

  // Poin 1g: Buku Terbaru (created_at DESC)
  const newBooks = db.prepare(`
    SELECT b.id, b.title, b.cover_path, b.rating, b.author, c.name AS category_name, b.created_at
    FROM books b
    LEFT JOIN categories c ON c.id=b.category_id
    WHERE b.is_active=1
    ORDER BY b.created_at DESC
    LIMIT 6
  `).all();

  // Kategori Buku dari Database
  const categories = db.prepare(`
    SELECT c.id, c.name, c.slug, c.icon_name, c.color_theme, COUNT(b.id) AS book_count
    FROM categories c 
    LEFT JOIN books b ON b.category_id=c.id
    GROUP BY c.id 
    ORDER BY c.name
  `).all();

  // Notifikasi & Unread Count
  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 10
  `).all(userId);
  const unreadCount = db.prepare(`SELECT COUNT(*) c FROM notifications WHERE user_id=? AND is_read=0`).get(userId).c;

  // Daftar Peminjam Buku Fisik (Semua peminjaman dengan nama si peminjam)
  const recentBorrowers = db.prepare(`
    SELECT l.id, l.loan_code, l.loan_date, l.due_date, l.status,
           u.username, COALESCE(s.full_name, u.username) AS borrower_name, s.nis, s.class_name,
           b.id AS book_id, b.title AS book_title, b.cover_path, c.name AS category_name
    FROM loans l
    JOIN users u ON u.id = l.user_id
    LEFT JOIN students s ON s.user_id = u.id
    LEFT JOIN loan_details ld ON ld.loan_id = l.id
    LEFT JOIN books b ON b.id = ld.book_id
    LEFT JOIN categories c ON c.id = b.category_id
    ORDER BY l.created_at DESC
    LIMIT 6
  `).all();

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
    recentBorrowers,
  });
};
