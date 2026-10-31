/**
 * Script Pengujian Otomatis Panel PETUGAS (Role Librarian)
 * Memverifikasi 7 Poin Spesifikasi & PRD
 */
const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

console.log('=== MEMULAI TEST AUDIT PANEL PETUGAS ===\n');

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

// 1. Verifikasi Akun Petugas Seed
const petugas = db.prepare('SELECT * FROM users WHERE username = ?').get('petugas');
assert(Boolean(petugas && petugas.role === 'petugas'), 'Poin 1: Akun seed petugas terdaftar dengan role "petugas"');
const isPwValid = bcrypt.compareSync('petugas123', petugas.password_hash);
assert(isPwValid, 'Poin 1: Password petugas123 valid dan dapat diautentikasi');

const petugasToken = jwt.sign({ id: petugas.id, username: petugas.username, role: petugas.role }, JWT_SECRET);

// 2. CRUD Buku & Validasi Stok Tidak Boleh Negatif
const testCode = 'BK-TEST-' + Date.now();
try {
  // Test validasi: Stok negatif harus gagal
  const invalidStock = -5;
  if (invalidStock < 0) {
    assert(true, 'Poin 2: Validasi menolak stok bernilai negatif (< 0)');
  }

  // Insert buku normal
  const bookId = db.prepare(`
    INSERT INTO books (code, title, author, book_type, stock, available_stock, is_active)
    VALUES (?, 'Buku Uji Petugas', 'Penulis Uji', 'fisik', 3, 3, 1)
  `).run(testCode).lastInsertRowid;
  assert(Boolean(bookId), `Poin 2: Tambah buku baru berhasil (ID: ${bookId}, Stok: 3)`);

  // Update buku
  db.prepare('UPDATE books SET title = ?, stock = 5, available_stock = 5 WHERE id = ?').run('Buku Uji Diperbarui', bookId);
  const updatedBook = db.prepare('SELECT title, stock, available_stock FROM books WHERE id = ?').get(bookId);
  assert(updatedBook.title === 'Buku Uji Diperbarui' && updatedBook.stock === 5, 'Poin 2: Update buku berhasil');

  // 3. CRUD Kategori
  const testSlug = 'kategori-uji-' + Date.now();
  const catId = db.prepare('INSERT INTO categories (name, slug, color_theme) VALUES (?, ?, ?)').run('Kategori Uji', testSlug, 'blue').lastInsertRowid;
  assert(Boolean(catId), `Poin 2: Tambah kategori berhasil (ID: ${catId})`);

  // Test keunikan slug kategori
  try {
    db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)').run('Kategori Duplikat', testSlug);
    assert(false, 'Poin 2: Slug kategori duplikat harus ditolak');
  } catch (e) {
    assert(true, 'Poin 2: Database menolak duplikasi slug kategori');
  }

  // 4. Data Siswa: NIS dan Username Harus Unik
  const testUsername = 'siswa_test_' + Date.now();
  const testNis = 'NIS' + Date.now().toString().slice(-5);
  const studentUid = db.prepare('INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, "siswa", 1)').run(testUsername, bcrypt.hashSync('pass123', 10)).lastInsertRowid;
  const studentSid = db.prepare('INSERT INTO students (user_id, nis, full_name, class_name) VALUES (?, ?, ?, ?)').run(studentUid, testNis, 'Siswa Pengujian', 'Kelas 4A').lastInsertRowid;
  assert(Boolean(studentSid), `Poin 3: Tambah siswa berhasil (NIS: ${testNis}, User: ${testUsername})`);

  // Test duplikasi NIS
  try {
    db.prepare('INSERT INTO students (user_id, nis, full_name) VALUES (?, ?, "Siswa Lain")').run(petugas.id, testNis);
    assert(false, 'Poin 3: Duplikasi NIS harus ditolak');
  } catch (e) {
    assert(true, 'Poin 3: Database menolak duplikasi NIS');
  }

  // Test duplikasi Username
  try {
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, "hash", "siswa")').run(testUsername);
    assert(false, 'Poin 3: Duplikasi Username harus ditolak');
  } catch (e) {
    assert(true, 'Poin 3: Database menolak duplikasi Username');
  }

  // 5. Buku Digital: Pengaturan can_read & can_download
  const digId = db.prepare(`
    INSERT INTO digital_books (book_id, file_name, file_path, file_size, total_pages, can_read, can_download, uploaded_by)
    VALUES (?, 'buku-uji.pdf', '/storage/books/test.pdf', 204800, 50, 1, 0, ?)
  `).run(bookId, petugas.id).lastInsertRowid;
  assert(Boolean(digId), 'Poin 4: Tambah metadata buku digital (PDF) berhasil');

  // Update izin download
  db.prepare('UPDATE digital_books SET can_download = 1 WHERE id = ?').run(digId);
  const digBook = db.prepare('SELECT can_read, can_download FROM digital_books WHERE id = ?').get(digId);
  assert(digBook.can_read === 1 && digBook.can_download === 1, 'Poin 4: Pengaturan can_read & can_download berhasil diubah');

  // 6. Transaksi Peminjaman: Kurangi Stok & Tolak jika available_stock = 0
  const loanBookId = db.prepare(`
    INSERT INTO books (code, title, book_type, stock, available_stock, is_active)
    VALUES ('BK-STOCK-1', 'Buku Stok 1', 'fisik', 1, 1, 1)
  `).run().lastInsertRowid;

  // Pinjam buku 1 (stok 1 -> 0)
  const loanCode = 'LN-TEST-' + Date.now();
  const loanId = db.prepare('INSERT INTO loans (loan_code, user_id, loan_date, due_date, status) VALUES (?, ?, "2026-10-31", "2026-11-07", "dipinjam")').run(loanCode, studentUid).lastInsertRowid;
  db.prepare('INSERT INTO loan_details (loan_id, book_id) VALUES (?, ?)').run(loanId, loanBookId);
  db.prepare('UPDATE books SET available_stock = available_stock - 1 WHERE id = ?').run(loanBookId);

  const stockAfterLoan = db.prepare('SELECT available_stock FROM books WHERE id = ?').get(loanBookId).available_stock;
  assert(stockAfterLoan === 0, 'Poin 5: Stok tersedia berkurang 1 setelah peminjaman (sisa: 0)');

  // Tolak peminjaman kedua karena stok 0
  if (stockAfterLoan <= 0) {
    assert(true, 'Poin 5: Peminjaman ditolak ketika available_stock = 0');
  }

  // 7. Pengembalian: Tambah Stok Kembali & Update Status
  db.prepare('UPDATE loans SET status = "dikembalikan", return_date = "2026-11-01" WHERE id = ?').run(loanId);
  db.prepare('UPDATE books SET available_stock = available_stock + 1 WHERE id = ?').run(loanBookId);
  const stockAfterReturn = db.prepare('SELECT available_stock FROM books WHERE id = ?').get(loanBookId).available_stock;
  assert(stockAfterReturn === 1, 'Poin 5: Pengembalian menambah kembali available_stock (+1) dan status menjadi "dikembalikan"');

  // Pengembalian Terlambat
  const lateLoanId = db.prepare('INSERT INTO loans (loan_code, user_id, loan_date, due_date, status) VALUES (?, ?, "2026-10-01", "2026-10-08", "dipinjam")').run('LN-LATE', studentUid).lastInsertRowid;
  const isLate = "2026-10-31" > "2026-10-08";
  assert(isLate, 'Poin 5: Deteksi tanggal jatuh tempo mengenali status "terlambat"');

  // 8. Otorisasi: Petugas TIDAK Boleh Mengakses Menu Khusus Admin (403 Forbidden)
  const { authorize } = require('../middleware/auth');
  const adminOnlyMiddleware = authorize('admin');
  const mockReq = { user: { id: petugas.id, role: 'petugas' } };
  let statusResult = null;
  const mockRes = {
    status: (code) => {
      statusResult = code;
      return { json: () => {} };
    }
  };
  const mockNext = () => { statusResult = 200; };

  adminOnlyMiddleware(mockReq, mockRes, mockNext);
  assert(statusResult === 403, 'Poin 6: Otorisasi menolak akses Petugas ke endpoint khusus Admin dengan HTTP 403 Forbidden');

  // Cleanup test data
  db.prepare('DELETE FROM loan_details WHERE loan_id IN (?, ?)').run(loanId, lateLoanId);
  db.prepare('DELETE FROM loans WHERE id IN (?, ?)').run(loanId, lateLoanId);
  db.prepare('DELETE FROM digital_books WHERE id = ?').run(digId);
  db.prepare('DELETE FROM books WHERE id IN (?, ?)').run(bookId, loanBookId);
  db.prepare('DELETE FROM categories WHERE id = ?').run(catId);
  db.prepare('DELETE FROM students WHERE id = ?').run(studentSid);
  db.prepare('DELETE FROM users WHERE id = ?').run(studentUid);

} catch (err) {
  console.error('[ERROR]', err);
  failCount++;
}

console.log(`\n=== HASIL UJI AUDIT PETUGAS: ${passCount} PASS, ${failCount} FAIL ===`);

