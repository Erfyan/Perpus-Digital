const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'perpustakaan.db');

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Apply base schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// 1. Migrasi kolom tabel users jika belum ada
try {
  const userCols = db.pragma('table_info(users)').map((c) => c.name);
  if (!userCols.includes('created_at')) {
    db.exec("ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (datetime('now'))");
  }
  if (!userCols.includes('updated_at')) {
    db.exec("ALTER TABLE users ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))");
  }
  if (!userCols.includes('is_active')) {
    db.exec("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1");
  }
  db.exec("UPDATE users SET created_at = datetime('now') WHERE created_at IS NULL");
  db.exec("UPDATE users SET updated_at = datetime('now') WHERE updated_at IS NULL");
  db.exec("UPDATE users SET is_active = 1 WHERE is_active IS NULL");
} catch (err) {
  console.warn('User table migration warning:', err.message);
}

// 2. Migrasi kolom tabel students jika belum ada
try {
  const studentCols = db.pragma('table_info(students)').map((c) => c.name);
  if (!studentCols.includes('created_at')) {
    db.exec("ALTER TABLE students ADD COLUMN created_at TEXT DEFAULT (datetime('now'))");
  }
  db.exec("UPDATE students SET created_at = datetime('now') WHERE created_at IS NULL");
} catch (err) {
  console.warn('Student table migration warning:', err.message);
}

// 3. Permintaan Pengguna: Ubah SELURUH password siswa menjadi 123456
try {
  const studentPasswordHash = bcrypt.hashSync('123456', 10);
  const updatedResult = db.prepare("UPDATE users SET password_hash = ? WHERE role = 'siswa'").run(studentPasswordHash);
  console.log(`[DB Migration] Berhasil memperbarui password ${updatedResult.changes} akun siswa menjadi "123456"`);
} catch (err) {
  console.error('[DB Migration Error] Gagal memperbarui password siswa:', err.message);
}

module.exports = db;
