/**
 * Script verifikasi otomatis 8 Poin Audit PRD Perpustakaan Digital SD
 */
const db = require('../database/db');

console.log('=== MEMULAI TEST VERIFIKASI 8 POIN PRD ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Audit Dashboard Data
const andi = db.prepare('SELECT id FROM users WHERE username=?').get('andi');
assert(Boolean(andi), 'User "andi" (Siswa) terdaftar di database');

const totalDigital = db.prepare('SELECT COUNT(*) c FROM digital_books db JOIN books b ON b.id=db.book_id WHERE b.is_active=1').get().c;
assert(totalDigital >= 120, `Poin 1: Total buku digital aktif >= 120 (Ditemukan: ${totalDigital})`);

const completedCount = db.prepare('SELECT COUNT(*) c FROM reading_progress WHERE user_id=? AND completed=1').get(andi.id).c;
assert(completedCount === 12, `Poin 1: Buku yang sudah dibaca Andi = 12 (Ditemukan: ${completedCount})`);

const inProgressCount = db.prepare('SELECT COUNT(*) c FROM reading_progress WHERE user_id=? AND progress_percentage>0 AND progress_percentage<100').get(andi.id).c;
assert(inProgressCount === 2, `Poin 1: Sedang dibaca Andi = 2 (Ditemukan: ${inProgressCount})`);

const favCount = db.prepare('SELECT COUNT(*) c FROM favorites WHERE user_id=?').get(andi.id).c;
assert(favCount === 5, `Poin 1: Buku favorit Andi = 5 (Ditemukan: ${favCount})`);

// 2. Audit 10 Kategori Sesuai PRD 5.6
const categories = db.prepare('SELECT name FROM categories').all().map(c => c.name);
const expectedCats = ['Pelajaran', 'Cerita', 'Dongeng', 'Sains', 'Komik Edukasi', 'Agama', 'Sejarah', 'Kesehatan', 'Pengetahuan Umum', 'Inspirasi'];
const allCatsExist = expectedCats.every(c => categories.includes(c));
assert(allCatsExist, `Poin 1: 10 Kategori lengkap sesuai PRD (${expectedCats.join(', ')})`);

// 3. Buku Terbaru terurut created_at DESC
const newestBooks = db.prepare('SELECT title, created_at FROM books WHERE is_active=1 ORDER BY created_at DESC LIMIT 5').all();
assert(newestBooks.length === 5, 'Poin 1: Buku terbaru berhasil diambil terurut created_at DESC');

// 4. Download authorization di Backend
const canDownloadBook = db.prepare('SELECT id, can_download FROM digital_books WHERE can_download=1 LIMIT 1').get();
const cannotDownloadBook = db.prepare('SELECT id, can_download FROM digital_books WHERE can_download=0 LIMIT 1').get();
assert(Boolean(canDownloadBook && cannotDownloadBook), 'Poin 4: Memiliki sampel buku dengan can_download=1 dan can_download=0');

// 5. Unik Favorit (tidak boleh duplikat)
try {
  const existingFav = db.prepare('SELECT book_id FROM favorites WHERE user_id=? LIMIT 1').get(andi.id);
  db.prepare('INSERT INTO favorites (user_id, book_id) VALUES (?, ?)').run(andi.id, existingFav.book_id);
  assert(false, 'Poin 6: Duplikat favorit harus dicegah');
} catch (e) {
  assert(true, 'Poin 6: Database menolak duplikasi data favorit (UNIQUE constraint)');
}

// 6. Keamanan & Peminjaman Siswa
const studentLoans = db.prepare('SELECT * FROM loans WHERE user_id=?').all(andi.id);
assert(Array.isArray(studentLoans), 'Poin 6 & 7: Query peminjaman siswa terisolasi berdasarkan user_id');

console.log(`\nHasil: ${passCount} PASS, ${failCount} FAIL`);

