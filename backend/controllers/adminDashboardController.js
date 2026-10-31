const db = require('../database/db');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { log, getLogs } = require('../utils/audit');

// 1. Dashboard Admin & Statistik Murni Database (PRD Bagian 13 Poin 2)
exports.admin = (req, res) => {
  const stats = {
    totalBooks: db.prepare('SELECT COUNT(*) c FROM books WHERE is_active = 1').get().c,
    totalDigital: db.prepare('SELECT COUNT(*) c FROM digital_books').get().c,
    totalStudents: db.prepare('SELECT COUNT(*) c FROM students').get().c,
    totalLoans: db.prepare('SELECT COUNT(*) c FROM loans').get().c,
    activeLoans: db.prepare("SELECT COUNT(*) c FROM loans WHERE status='dipinjam'").get().c,
    overdueLoans: db.prepare("SELECT COUNT(*) c FROM loans WHERE status='terlambat' OR (status='dipinjam' AND due_date < date('now'))").get().c,
    readingActivities: db.prepare('SELECT COUNT(*) c FROM reading_history').get().c,
    totalUsers: db.prepare('SELECT COUNT(*) c FROM users').get().c,
    totalLibrarians: db.prepare("SELECT COUNT(*) c FROM users WHERE role='petugas'").get().c,
  };

  // Aktivitas membaca terbaru dari database
  const recentReading = db.prepare(`
    SELECT rh.*, b.title AS book_title, s.full_name AS student_name, s.class_name
    FROM reading_history rh
    JOIN books b ON b.id = rh.book_id
    JOIN users u ON u.id = rh.user_id
    LEFT JOIN students s ON s.user_id = u.id
    ORDER BY rh.last_read_at DESC
    LIMIT 6
  `).all();

  // Transaksi peminjaman terbaru dari database
  const recentLoans = db.prepare(`
    SELECT l.*, s.full_name AS student_name, b.title AS book_title
    FROM loans l
    JOIN users u ON u.id = l.user_id
    LEFT JOIN students s ON s.user_id = u.id
    LEFT JOIN loan_details ld ON ld.loan_id = l.id
    LEFT JOIN books b ON b.id = ld.book_id
    ORDER BY l.created_at DESC
    LIMIT 6
  `).all();

  res.json({ success: true, stats, recentReading, recentLoans });
};

// -------------------------------------------------------------
// 2. MANAJEMEN PENGGUNA (PRD Poin 3)
// -------------------------------------------------------------

exports.getUsers = (req, res) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;

    let whereClause = ' WHERE 1=1';
    const whereParams = [];

    if (search && search.trim()) {
      whereClause += ` AND (u.username LIKE ? OR s.full_name LIKE ? OR s.nis LIKE ?)`;
      const q = `%${search.trim()}%`;
      whereParams.push(q, q, q);
    }

    if (role && role.trim()) {
      whereClause += ` AND u.role = ?`;
      whereParams.push(role.trim());
    }

    // 1. Hitung total data pengguna
    const countSql = `
      SELECT COUNT(*) AS c
      FROM users u
      LEFT JOIN students s ON s.user_id = u.id
      ${whereClause}
    `;
    const countRow = db.prepare(countSql).get(...whereParams);
    const total = countRow ? countRow.c : 0;

    // 2. Query data pengguna dengan pagination
    const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
    const dataSql = `
      SELECT u.id, u.username, u.role, u.is_active,
             COALESCE(u.created_at, datetime('now')) AS created_at,
             s.full_name, s.nis, s.class_name
      FROM users u
      LEFT JOIN students s ON s.user_id = u.id
      ${whereClause}
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(dataSql).all(...whereParams, Number(limit), offset);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: Math.max(1, Number(page)),
        limit: Number(limit),
        total,
        totalPages: Math.max(1, Math.ceil(total / Number(limit)))
      }
    });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat data pengguna: ' + err.message });
  }
};

exports.createUser = (req, res) => {
  const { username, password, role = 'siswa', is_active = 1, full_name, nis, class_name } = req.body || {};

  if (!username || !username.trim()) {
    return res.status(400).json({ success: false, message: 'Username wajib diisi' });
  }
  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, message: 'Kata sandi wajib diisi' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
  if (existing) {
    return res.status(400).json({ success: false, message: `Username "${cleanUsername}" sudah digunakan` });
  }

  const passwordHash = bcrypt.hashSync(password.trim(), 10);
  const activeStatus = Number(is_active) ? 1 : 0;

  const uid = db.prepare(`
    INSERT INTO users (username, password_hash, role, is_active)
    VALUES (?, ?, ?, ?)
  `).run(cleanUsername, passwordHash, role, activeStatus).lastInsertRowid;

  // Jika siswa, buat profil student jika disediakan
  if (role === 'siswa' && (full_name || nis)) {
    const studentNis = nis ? nis.trim() : 'NIS' + Date.now().toString().slice(-5);
    db.prepare(`
      INSERT INTO students (user_id, nis, full_name, class_name)
      VALUES (?, ?, ?, ?)
    `).run(uid, studentNis, full_name ? full_name.trim() : cleanUsername, class_name || null);
  }

  log('user_created', req.user.id, `Created user "${cleanUsername}" with role "${role}"`, req.ip);

  res.json({
    success: true,
    message: `Pengguna "${cleanUsername}" berhasil dibuat`,
    data: { id: uid, username: cleanUsername, role, is_active: activeStatus }
  });
};

exports.updateUser = (req, res) => {
  const id = req.params.id;
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(id);
  if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });

  const { username, password, role, is_active, full_name, nis, class_name } = req.body || {};

  if (username !== undefined) {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return res.status(400).json({ success: false, message: 'Username tidak boleh kosong' });
    const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(cleanUsername, id);
    if (existing) {
      return res.status(400).json({ success: false, message: `Username "${cleanUsername}" sudah digunakan oleh akun lain` });
    }
  }

  const newUsername = username !== undefined ? username.trim().toLowerCase() : user.username;
  const newRole = role !== undefined ? role : user.role;
  const newActive = is_active !== undefined ? (Number(is_active) ? 1 : 0) : user.is_active;

  if (password && password.trim()) {
    const newHash = bcrypt.hashSync(password.trim(), 10);
    db.prepare(`
      UPDATE users SET username=?, password_hash=?, role=?, is_active=?, updated_at=datetime('now')
      WHERE id=?
    `).run(newUsername, newHash, newRole, newActive, id);
  } else {
    db.prepare(`
      UPDATE users SET username=?, role=?, is_active=?, updated_at=datetime('now')
      WHERE id=?
    `).run(newUsername, newRole, newActive, id);
  }

  // Update profil siswa jika peran siswa
  if (newRole === 'siswa') {
    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(id);
    if (student) {
      db.prepare(`
        UPDATE students SET
          full_name = COALESCE(?, full_name),
          nis = COALESCE(?, nis),
          class_name = COALESCE(?, class_name)
        WHERE user_id = ?
      `).run(
        full_name ? full_name.trim() : null,
        nis ? nis.trim() : null,
        class_name ? class_name.trim() : null,
        id
      );
    } else if (full_name || nis) {
      db.prepare(`
        INSERT INTO students (user_id, nis, full_name, class_name)
        VALUES (?, ?, ?, ?)
      `).run(id, nis || 'NIS' + Date.now().toString().slice(-5), full_name || newUsername, class_name || null);
    }
  }

  log('user_updated', req.user.id, `Updated user "${newUsername}" (ID: ${id})`, req.ip);

  res.json({ success: true, message: 'Data pengguna berhasil diperbarui' });
};

exports.deactivateUser = (req, res) => {
  const id = req.params.id;
  if (Number(id) === Number(req.user.id)) {
    return res.status(400).json({ success: false, message: 'Anda tidak dapat menonaktifkan akun Anda sendiri' });
  }

  const user = db.prepare('SELECT username, is_active FROM users WHERE id=?').get(id);
  if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });

  // Toggle status aktif
  const newStatus = user.is_active ? 0 : 1;
  db.prepare("UPDATE users SET is_active=?, updated_at=datetime('now') WHERE id=?").run(newStatus, id);

  const actionText = newStatus ? 'diaktifkan kembali' : 'dinonaktifkan';
  log('user_status_changed', req.user.id, `User "${user.username}" ${actionText}`, req.ip);

  res.json({
    success: true,
    message: `Pengguna "${user.username}" berhasil ${actionText}`,
    data: { id, is_active: newStatus }
  });
};

// -------------------------------------------------------------
// 3. DATA PETUGAS (PRD Bagian 13)
// -------------------------------------------------------------

exports.getLibrarians = (req, res) => {
  const librarians = db.prepare(`
    SELECT id, username, role, is_active, created_at, updated_at
    FROM users
    WHERE role = 'petugas'
    ORDER BY created_at DESC
  `).all();
  res.json({ success: true, data: librarians });
};

// -------------------------------------------------------------
// 4. RIWAYAT MEMBACA SELURUH SISWA (PRD Bagian 13)
// -------------------------------------------------------------

exports.getReadingHistory = (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  let sql = `
    SELECT rh.*, b.title AS book_title, b.code AS book_code, c.name AS category_name,
           u.username, s.full_name AS student_name, s.nis, s.class_name
    FROM reading_history rh
    JOIN books b ON b.id = rh.book_id
    JOIN users u ON u.id = rh.user_id
    LEFT JOIN students s ON s.user_id = u.id
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ` AND (b.title LIKE ? OR s.full_name LIKE ? OR s.nis LIKE ? OR u.username LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }

  sql += ` ORDER BY rh.last_read_at DESC`;

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

// -------------------------------------------------------------
// 5. PENGATURAN SISTEM (PRD Bagian 13 & 19)
// -------------------------------------------------------------

// Simpan settings di tabel atau runtime config
db.exec(`
  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const DEFAULT_SETTINGS = {
  app_name: 'Perpustakaan Digital SD',
  school_name: 'Sekolah Dasar Negeri Percobaan',
  max_loan_days: '7',
  max_books_per_student: '2',
  fine_per_day: '500',
  auto_notify_overdue: 'true',
  reading_goal_books: '10'
};

exports.getSettings = (req, res) => {
  const rows = db.prepare('SELECT key, value FROM system_settings').all();
  const settings = { ...DEFAULT_SETTINGS };
  for (const r of rows) settings[r.key] = r.value;
  res.json({ success: true, data: settings });
};

exports.updateSettings = (req, res) => {
  const body = req.body || {};
  const insertOrUpdate = db.prepare(`
    INSERT INTO system_settings (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')
  `);

  for (const [k, v] of Object.entries(body)) {
    insertOrUpdate.run(k, String(v));
  }

  log('settings_updated', req.user.id, `Settings updated by admin`, req.ip);
  res.json({ success: true, message: 'Pengaturan sistem perpustakaan berhasil disimpan' });
};

// -------------------------------------------------------------
// 6. BACKUP DATABASE SQLITE (PRD Bagian 13 Poin 5)
// -------------------------------------------------------------

const backupDir = path.join(__dirname, '..', '..', 'storage', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

exports.createBackup = (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `perpus-sd-backup-${timestamp}.db`;
    const destPath = path.join(backupDir, backupFileName);

    // Ambil path database SQLite aktif
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'perpustakaan.db');

    if (!fs.existsSync(dbPath)) {
      return res.status(500).json({ success: false, message: 'File database sumber tidak ditemukan' });
    }

    // Salin file SQLite ke lokasi aman
    fs.copyFileSync(dbPath, destPath);
    const stats = fs.statSync(destPath);

    log('database_backup', req.user.id, `Created backup "${backupFileName}" (${Math.round(stats.size / 1024)} KB)`, req.ip);

    res.json({
      success: true,
      message: 'Salinan cadangan (backup) database berhasil dibuat di lokasi aman',
      data: {
        file_name: backupFileName,
        file_size_bytes: stats.size,
        file_size_kb: Math.round(stats.size / 1024),
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ success: false, message: 'Gagal membuat salinan cadangan database: ' + err.message });
  }
};

exports.getBackups = (req, res) => {
  try {
    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter((f) => f.endsWith('.db'))
      .map((f) => {
        const full = path.join(backupDir, f);
        const s = fs.statSync(full);
        return {
          file_name: f,
          size_kb: Math.round(s.size / 1024),
          created_at: s.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, data: backups });
  } catch (e) {
    res.json({ success: true, data: [] });
  }
};

// -------------------------------------------------------------
// 7. LAPORAN PERPUSTAKAAN (PRD Bagian 13 Poin 5)
// -------------------------------------------------------------

exports.getReports = (req, res) => {
  // 1. Peminjaman per bulan (6 bulan terakhir)
  const monthlyLoans = db.prepare(`
    SELECT strftime('%Y-%m', loan_date) as month, COUNT(*) as total_loans
    FROM loans
    GROUP BY month
    ORDER BY month DESC
    LIMIT 6
  `).all();

  // 2. Kategori paling sering dibaca
  const topCategories = db.prepare(`
    SELECT c.name, COUNT(rh.id) as read_count
    FROM categories c
    JOIN books b ON b.category_id = c.id
    JOIN reading_history rh ON rh.book_id = b.id
    GROUP BY c.id
    ORDER BY read_count DESC
    LIMIT 5
  `).all();

  // 3. Siswa paling aktif membaca
  const topStudents = db.prepare(`
    SELECT s.full_name, s.nis, s.class_name, COUNT(rh.id) as total_read,
           SUM(CASE WHEN rh.completed = 1 THEN 1 ELSE 0 END) as completed_books
    FROM students s
    JOIN reading_history rh ON rh.user_id = s.user_id
    GROUP BY s.id
    ORDER BY total_read DESC
    LIMIT 5
  `).all();

  // 4. Buku paling populer dibaca
  const topBooks = db.prepare(`
    SELECT b.title, b.author, c.name as category_name, COUNT(rh.id) as read_count
    FROM books b
    JOIN reading_history rh ON rh.book_id = b.id
    LEFT JOIN categories c ON c.id = b.category_id
    GROUP BY b.id
    ORDER BY read_count DESC
    LIMIT 5
  `).all();

  // 5. Rasio status peminjaman
  const loanStats = {
    total: db.prepare('SELECT COUNT(*) c FROM loans').get().c,
    dikembalikan: db.prepare("SELECT COUNT(*) c FROM loans WHERE status='dikembalikan'").get().c,
    dipinjam: db.prepare("SELECT COUNT(*) c FROM loans WHERE status='dipinjam'").get().c,
    terlambat: db.prepare("SELECT COUNT(*) c FROM loans WHERE status='terlambat'").get().c,
  };

  res.json({
    success: true,
    data: {
      monthlyLoans,
      topCategories,
      topStudents,
      topBooks,
      loanStats
    }
  });
};

// -------------------------------------------------------------
// 8. AUDIT LOGS KEAMANAN (PRD Bagian 19 Poin 6)
// -------------------------------------------------------------

exports.getAuditLogs = (req, res) => {
  const { limit = 100 } = req.query;
  const logs = getLogs(Math.min(200, Number(limit)));
  res.json({ success: true, data: logs });
};
