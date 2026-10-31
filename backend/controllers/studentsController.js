const db = require('../database/db');
const bcrypt = require('bcryptjs');

exports.list = (req, res) => {
  const { search, class_name, page = 1, limit = 50 } = req.query;
  let sql = `
    SELECT s.*, u.username, u.is_active, u.created_at AS user_created_at,
           (SELECT COUNT(*) FROM reading_progress WHERE user_id = u.id AND completed = 1) AS books_read,
           (SELECT COUNT(*) FROM loans WHERE user_id = u.id AND status = 'dipinjam') AS active_loans
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ` AND (s.full_name LIKE ? OR s.nis LIKE ? OR u.username LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  if (class_name) {
    sql += ` AND s.class_name = ?`;
    params.push(class_name);
  }

  sql += ` ORDER BY s.full_name ASC`;

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
  const student = db.prepare(`
    SELECT s.*, u.username, u.is_active, u.created_at AS user_created_at,
           (SELECT COUNT(*) FROM reading_progress WHERE user_id = u.id AND completed = 1) AS books_read,
           (SELECT COUNT(*) FROM loans WHERE user_id = u.id AND status = 'dipinjam') AS active_loans
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ? OR s.user_id = ?
  `).get(id, id);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan' });
  }

  // Aturan 3: Siswa HANYA boleh mengakses profil miliknya sendiri
  if (req.user.role === 'siswa' && Number(student.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan' });
  }

  res.json({ success: true, data: student });
};

exports.create = (req, res) => {
  const { username, password, nis, full_name, class_name } = req.body || {};

  // Validasi field wajib
  if (!username || !username.trim()) {
    return res.status(400).json({ success: false, message: 'Username siswa wajib diisi' });
  }
  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, message: 'Kata sandi wajib diisi' });
  }
  if (!nis || !nis.trim()) {
    return res.status(400).json({ success: false, message: 'Nomor Induk Siswa (NIS) wajib diisi' });
  }
  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ success: false, message: 'Nama lengkap siswa wajib diisi' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanNis = nis.trim();

  // Validasi keunikan username
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
  if (existingUser) {
    return res.status(400).json({ success: false, message: `Username "${cleanUsername}" sudah digunakan oleh pengguna lain` });
  }

  // Validasi keunikan NIS
  const existingNis = db.prepare('SELECT id FROM students WHERE nis = ?').get(cleanNis);
  if (existingNis) {
    return res.status(400).json({ success: false, message: `NIS "${cleanNis}" sudah terdaftar` });
  }

  // Buat akun user dengan role 'siswa'
  const passwordHash = bcrypt.hashSync(password.trim(), 10);
  const uid = db.prepare(`
    INSERT INTO users (username, password_hash, role, is_active)
    VALUES (?, ?, 'siswa', 1)
  `).run(cleanUsername, passwordHash).lastInsertRowid;

  // Buat profil student
  const sid = db.prepare(`
    INSERT INTO students (user_id, nis, full_name, class_name)
    VALUES (?, ?, ?, ?)
  `).run(uid, cleanNis, full_name.trim(), class_name ? class_name.trim() : null).lastInsertRowid;

  res.json({
    success: true,
    message: 'Data siswa berhasil ditambahkan',
    data: { id: sid, user_id: uid, username: cleanUsername, nis: cleanNis, full_name: full_name.trim() }
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const student = db.prepare('SELECT * FROM students WHERE id=? OR user_id=?').get(id, id);
  if (!student) return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan' });

  // Aturan 3: Siswa hanya boleh mengupdate profil miliknya sendiri
  if (req.user.role === 'siswa' && Number(student.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan' });
  }

  const { username, password, nis, full_name, class_name, is_active } = req.body || {};

  // Siswa tidak boleh mengubah NIS atau status aktif sendiri
  const cleanNis = (req.user.role === 'siswa') ? student.nis : (nis !== undefined ? nis.trim() : student.nis);
  const cleanIsActive = (req.user.role === 'siswa') ? undefined : is_active;

  // Validasi nama jika diubah
  if (full_name !== undefined && (!full_name || !full_name.trim())) {
    return res.status(400).json({ success: false, message: 'Nama lengkap tidak boleh kosong' });
  }

  // Validasi NIS jika diubah oleh staff
  if (nis !== undefined && req.user.role !== 'siswa') {
    const checkNis = nis.trim();
    if (!checkNis) {
      return res.status(400).json({ success: false, message: 'NIS tidak boleh kosong' });
    }
    const existingNis = db.prepare('SELECT id FROM students WHERE nis = ? AND id != ?').get(checkNis, student.id);
    if (existingNis) {
      return res.status(400).json({ success: false, message: `NIS "${checkNis}" sudah terdaftar untuk siswa lain` });
    }
  }

  // Validasi username jika diubah
  if (username !== undefined) {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      return res.status(400).json({ success: false, message: 'Username tidak boleh kosong' });
    }
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(cleanUsername, student.user_id);
    if (existingUser) {
      return res.status(400).json({ success: false, message: `Username "${cleanUsername}" sudah digunakan oleh pengguna lain` });
    }
  }

  // Update tabel students
  db.prepare(`
    UPDATE students SET
      nis = ?,
      full_name = COALESCE(?, full_name),
      class_name = COALESCE(?, class_name)
    WHERE id = ?
  `).run(
    cleanNis,
    full_name !== undefined ? full_name.trim() : null,
    (req.user.role === 'siswa') ? student.class_name : (class_name !== undefined ? class_name.trim() : null),
    student.id
  );

  // Update tabel users (username, password jika ada, is_active jika ada)
  if (username !== undefined || password || cleanIsActive !== undefined) {
    let userUpdates = [];
    let userParams = [];

    if (username !== undefined) {
      userUpdates.push('username = ?');
      userParams.push(username.trim().toLowerCase());
    }
    if (password && password.trim()) {
      userUpdates.push('password_hash = ?');
      userParams.push(bcrypt.hashSync(password.trim(), 10));
    }
    if (cleanIsActive !== undefined) {
      userUpdates.push('is_active = ?');
      userParams.push(Number(cleanIsActive) ? 1 : 0);
    }

    if (userUpdates.length > 0) {
      userUpdates.push("updated_at = datetime('now')");
      userParams.push(student.user_id);
      db.prepare(`UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`).run(...userParams);
    }
  }

  res.json({ success: true, message: 'Data siswa berhasil diperbarui' });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  const s = db.prepare('SELECT user_id, full_name FROM students WHERE id=?').get(id);
  if (!s) return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan' });

  // Cek apakah siswa masih memiliki peminjaman buku aktif
  const activeLoans = db.prepare("SELECT COUNT(*) c FROM loans WHERE user_id=? AND status='dipinjam'").get(s.user_id).c;
  if (activeLoans > 0) {
    return res.status(400).json({ success: false, message: 'Siswa masih memiliki buku yang sedang dipinjam dan belum dikembalikan' });
  }

  db.prepare('DELETE FROM students WHERE id=?').run(id);
  db.prepare('DELETE FROM users WHERE id=?').run(s.user_id);
  res.json({ success: true, message: `Data siswa "${s.full_name}" berhasil dihapus` });
};
