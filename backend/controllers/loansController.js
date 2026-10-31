const db = require('../database/db');
const { getScopedUserId } = require('../middleware/ownership');

exports.list = (req, res) => {
  const isStudent = req.user.role === 'siswa';
  const { search, status, page = 1, limit = 50, only_mine } = req.query;

  let sql = `
    SELECT l.*, u.username, s.full_name, s.full_name AS borrower_name, s.nis, s.class_name,
           b.id AS book_id, b.title AS book_title, b.code AS book_code, b.cover_path,
           c.name AS category_name
    FROM loans l
    JOIN users u ON u.id = l.user_id
    LEFT JOIN students s ON s.user_id = u.id
    LEFT JOIN loan_details ld ON ld.loan_id = l.id
    LEFT JOIN books b ON b.id = ld.book_id
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE 1=1
  `;
  const params = [];

  // Jika diminta khusus 'only_mine' atau ada filter user_id dari staf
  if (only_mine === 'true') {
    sql += ` AND l.user_id = ?`;
    params.push(req.user.id);
  } else if (req.query.user_id) {
    // Petugas & Admin dapat memfilter peminjaman siswa tertentu
    sql += ` AND l.user_id = ?`;
    params.push(req.query.user_id);
  }

  // Filter pencarian
  if (search) {
    sql += ` AND (l.loan_code LIKE ? OR s.full_name LIKE ? OR s.nis LIKE ? OR b.title LIKE ? OR b.code LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q, q, q, q);
  }

  // Filter status
  if (status && status !== 'semua') {
    sql += ` AND l.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY l.created_at DESC`;

  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
  const total = db.prepare(`SELECT COUNT(*) c FROM (${sql})`).get(...params).c;

  sql += ` LIMIT ? OFFSET ?`;
  params.push(Number(limit), offset);

  const rows = db.prepare(sql).all(...params);
  res.json({
    success: true,
    data: rows,
    pagination: {
      page: Math.max(1, Number(page)),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  });
};

exports.getById = (req, res) => {
  const id = req.params.id;
  const loan = db.prepare(`
    SELECT l.*, u.username, s.full_name, s.nis, s.class_name,
           b.id AS book_id, b.title AS book_title, b.code AS book_code, b.cover_path,
           c.name AS category_name
    FROM loans l
    JOIN users u ON u.id = l.user_id
    LEFT JOIN students s ON s.user_id = u.id
    LEFT JOIN loan_details ld ON ld.loan_id = l.id
    LEFT JOIN books b ON b.id = ld.book_id
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE l.id = ?
  `).get(id);

  if (!loan) {
    return res.status(404).json({ success: false, message: 'Data transaksi peminjaman tidak ditemukan' });
  }

  // Siswa hanya boleh mengakses peminjaman miliknya sendiri
  if (req.user.role === 'siswa' && Number(loan.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Data transaksi peminjaman tidak ditemukan' });
  }

  res.json({ success: true, data: loan });
};

exports.create = (req, res) => {
  // Aturan 1 & 4: Siswa SELALU menggunakan req.user.id (mengabaikan body)
  const isStudent = req.user.role === 'siswa';
  const targetUserId = isStudent ? req.user.id : (req.body.user_id || req.body.student_id);
  const { book_id, due_date } = req.body || {};

  if (!targetUserId) {
    return res.status(400).json({ success: false, message: 'Peminjam (user_id siswa) wajib dipilih' });
  }
  if (!book_id) {
    return res.status(400).json({ success: false, message: 'Buku fisik yang dipinjam wajib dipilih' });
  }

  // Validasi siswa ada & aktif
  const user = db.prepare('SELECT id, is_active, role FROM users WHERE id=?').get(targetUserId);
  if (!user || !user.is_active || user.role !== 'siswa') {
    return res.status(400).json({ success: false, message: 'Siswa peminjam tidak valid atau tidak aktif' });
  }

  // Validasi buku ada
  const book = db.prepare('SELECT id, title, available_stock, stock, is_active FROM books WHERE id=?').get(book_id);
  if (!book || !book.is_active) {
    return res.status(404).json({ success: false, message: 'Buku tidak ditemukan atau tidak aktif' });
  }

  // Tolak jika available_stock = 0
  if (book.available_stock <= 0) {
    return res.status(400).json({
      success: false,
      message: `Peminjaman ditolak: Stok fisik buku "${book.title}" sedang habis (Stok tersedia: 0)`
    });
  }

  // Cek apakah siswa ini sudah meminjam buku yang sama dan belum dikembalikan
  const existingActiveLoan = db.prepare(`
    SELECT l.id FROM loans l
    JOIN loan_details ld ON ld.loan_id = l.id
    WHERE l.user_id = ? AND ld.book_id = ? AND l.status = 'dipinjam'
  `).get(targetUserId, book_id);

  if (existingActiveLoan) {
    return res.status(400).json({ success: false, message: 'Siswa ini masih meminjam buku yang sama dan belum mengembalikannya' });
  }

  // Hitung tanggal pinjam & jatuh tempo (default 7 hari jika tidak diisi)
  const today = new Date().toISOString().slice(0, 10);
  let finalDueDate = due_date;
  if (!finalDueDate) {
    const due = new Date();
    due.setDate(due.getDate() + 7);
    finalDueDate = due.toISOString().slice(0, 10);
  }

  const loanCode = 'PJ' + Date.now().toString().slice(-6);

  // Buat transaksi loan
  const loanId = db.prepare(`
    INSERT INTO loans (loan_code, user_id, loan_date, due_date, status)
    VALUES (?, ?, ?, ?, 'dipinjam')
  `).run(loanCode, targetUserId, today, finalDueDate).lastInsertRowid;

  // Buat detail peminjaman
  db.prepare(`
    INSERT INTO loan_details (loan_id, book_id)
    VALUES (?, ?)
  `).run(loanId, book_id);

  // Kurangi stok buku fisik
  db.prepare('UPDATE books SET available_stock = available_stock - 1, updated_at = datetime(\'now\') WHERE id = ?').run(book_id);

  res.json({
    success: true,
    message: `Peminjaman buku "${book.title}" berhasil diproses (Kode: ${loanCode})`,
    data: { id: loanId, loan_code: loanCode, user_id: targetUserId, due_date: finalDueDate }
  });
};

exports.returnLoan = (req, res) => {
  const id = req.params.id;
  const loan = db.prepare('SELECT * FROM loans WHERE id=?').get(id);

  if (!loan) {
    return res.status(404).json({ success: false, message: 'Data transaksi peminjaman tidak ditemukan' });
  }

  // Otorisasi Kepemilikan (Aturan 3 & 6):
  // Jika siswa mengakses peminjaman milik siswa lain, tolak dengan 404 agar data tidak bocor
  if (req.user.role === 'siswa' && Number(loan.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Data transaksi peminjaman tidak ditemukan' });
  }

  // PRD Bagian 11: Pengembalian fisik buku diproses oleh Petugas / Admin
  if (req.user.role === 'siswa') {
    return res.status(403).json({ success: false, message: 'Pengembalian buku fisik hanya dapat diproses oleh Petugas Perpustakaan' });
  }

  if (loan.status === 'dikembalikan') {
    return res.status(400).json({ success: false, message: 'Buku ini sudah tercatat dikembalikan sebelumnya' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const isLate = today > loan.due_date;
  const finalStatus = isLate ? 'terlambat' : 'dikembalikan';

  // Update status peminjaman & tanggal pengembalian
  db.prepare(`
    UPDATE loans SET
      status = ?,
      return_date = ?
    WHERE id = ?
  `).run(finalStatus, today, id);

  // Tambahkan kembali stok fisik buku
  const details = db.prepare('SELECT book_id FROM loan_details WHERE loan_id=?').all(id);
  for (const d of details) {
    db.prepare('UPDATE books SET available_stock = available_stock + 1, updated_at = datetime(\'now\') WHERE id = ?').run(d.book_id);
  }

  res.json({
    success: true,
    message: isLate
      ? `Pengembalian buku berhasil diproses dengan status TERLAMBAT (Jatuh tempo: ${loan.due_date})`
      : 'Buku berhasil dikembalikan tepat waktu',
    data: { id, status: finalStatus, return_date: today }
  });
};
