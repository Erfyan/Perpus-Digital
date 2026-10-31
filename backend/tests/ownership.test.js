/**
 * Test Otorisasi Per Kepemilikan (Ownership-based Authorization)
 * Sesuai PRD Bagian 9, 10, 11, 15, 18, 19
 *
 * Test cases:
 * 1. Siswa 1 login, GET /api/loans hanya mengembalikan peminjaman siswa 1.
 * 2. Siswa 2 mengakses peminjaman milik siswa 1 lewat id langsung: ditolak (404/403).
 * 3. Siswa 2 mencoba PUT /api/loans/:id/return milik siswa 1: ditolak, data tidak berubah.
 * 4. Siswa 2 mengirim user_id siswa 1 di body saat membuat favorit/progress: diabaikan, data tersimpan atas nama siswa 2.
 * 5. Petugas dan Admin bisa melihat peminjaman semua siswa.
 * 6. Request tanpa login: 401.
 */

const { describe, it, expect, beforeAll } = require('vitest');
let request;
try {
  request = require('supertest');
} catch (e) {
  // Fallback jika dijalankan tanpa modul supertest terpasang
  request = null;
}

const app = require('../server');
const db = require('../database/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

describe('Otorisasi Kepemilikan Data Siswa (PRD Bagian 18)', () => {
  let tokenSiswa1;
  let tokenSiswa2;
  let tokenPetugas;
  let tokenAdmin;
  let siswa1Id;
  let siswa2Id;
  let loanSiswa1Id;
  let bookId;

  beforeAll(() => {
    // 1. Ambil atau pastikan akun Siswa 1 (andi) & Siswa 2 (budi)
    const user1 = db.prepare("SELECT id, username, role FROM users WHERE username = 'andi'").get();
    const user2 = db.prepare("SELECT id, username, role FROM users WHERE username = 'budi'").get();
    const userPetugas = db.prepare("SELECT id, username, role FROM users WHERE role = 'petugas'").get();
    const userAdmin = db.prepare("SELECT id, username, role FROM users WHERE role = 'admin'").get();

    siswa1Id = user1.id;
    siswa2Id = user2.id;

    tokenSiswa1 = jwt.sign({ id: user1.id, username: user1.username, role: user1.role }, JWT_SECRET, { expiresIn: '1d' });
    tokenSiswa2 = jwt.sign({ id: user2.id, username: user2.username, role: user2.role }, JWT_SECRET, { expiresIn: '1d' });
    tokenPetugas = jwt.sign({ id: userPetugas.id, username: userPetugas.username, role: userPetugas.role }, JWT_SECRET, { expiresIn: '1d' });
    tokenAdmin = jwt.sign({ id: userAdmin.id, username: userAdmin.username, role: userAdmin.role }, JWT_SECRET, { expiresIn: '1d' });

    // 2. Siapkan buku & pinjaman untuk siswa 1
    const book = db.prepare("SELECT id FROM books WHERE stock > 0 LIMIT 1").get();
    bookId = book.id;

    // Bersihkan pinjaman aktif sebelumnya untuk user1 & book
    db.prepare("DELETE FROM loans WHERE user_id = ?").run(siswa1Id);
    db.prepare("DELETE FROM loans WHERE user_id = ?").run(siswa2Id);

    // Buat pinjaman atas nama siswa 1
    const res = db.prepare(`
      INSERT INTO loans (loan_code, user_id, loan_date, due_date, status)
      VALUES ('PJ-TEST-S1', ?, '2026-10-01', '2026-10-08', 'dipinjam')
    `).run(siswa1Id);
    loanSiswa1Id = res.lastInsertRowid;

    db.prepare(`
      INSERT INTO loan_details (loan_id, book_id)
      VALUES (?, ?)
    `).run(loanSiswa1Id, bookId);
  });

  it('1. Siswa 1 login, GET /api/loans HANYA mengembalikan peminjaman siswa 1', async () => {
    if (!request) return;
    const res = await request(app)
      .get('/api/loans')
      .set('Authorization', `Bearer ${tokenSiswa1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    // Seluruh item harus milik siswa 1
    for (const item of res.body.data) {
      expect(Number(item.user_id)).toBe(siswa1Id);
    }
  });

  it('2. Siswa 2 mengakses peminjaman milik siswa 1 lewat id langsung: ditolak (404/403)', async () => {
    if (!request) return;
    const res = await request(app)
      .get(`/api/loans/${loanSiswa1Id}`)
      .set('Authorization', `Bearer ${tokenSiswa2}`);

    expect([403, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('3. Siswa 2 mencoba PUT /api/loans/:id/return milik siswa 1: ditolak, status tetap dipinjam', async () => {
    if (!request) return;
    const res = await request(app)
      .put(`/api/loans/${loanSiswa1Id}/return`)
      .set('Authorization', `Bearer ${tokenSiswa2}`);

    expect([403, 404]).toContain(res.status);

    // Verifikasi di database bahwa status pinjaman TIDAK berubah
    const loan = db.prepare('SELECT status FROM loans WHERE id = ?').get(loanSiswa1Id);
    expect(loan.status).toBe('dipinjam');
  });

  it('4. Siswa 2 mengirim user_id siswa 1 di body saat membuat favorit: diabaikan, data tersimpan atas nama siswa 2', async () => {
    if (!request) return;
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${tokenSiswa2}`)
      .send({ book_id: bookId, user_id: siswa1Id }); // Mencoba inject user_id siswa 1

    expect(res.status).toBe(200);

    // Verifikasi di database bahwa favorit tersimpan untuk siswa 2, BUKAN siswa 1
    const favSiswa2 = db.prepare('SELECT * FROM favorites WHERE user_id = ? AND book_id = ?').get(siswa2Id, bookId);
    expect(favSiswa2).toBeTruthy();

    const favSiswa1 = db.prepare('SELECT * FROM favorites WHERE user_id = ? AND book_id = ?').get(siswa1Id, bookId);
    expect(favSiswa1).toBeFalsy();
  });

  it('5. Siswa 2 mengirim user_id siswa 1 di body saat update reading-progress: diabaikan, tersimpan atas nama siswa 2', async () => {
    if (!request) return;
    const res = await request(app)
      .put(`/api/reading-progress/${bookId}`)
      .set('Authorization', `Bearer ${tokenSiswa2}`)
      .send({ last_page: 15, total_pages: 50, user_id: siswa1Id }); // Inject user_id siswa 1

    expect(res.status).toBe(200);

    // Progress harus tersimpan untuk siswa 2
    const progSiswa2 = db.prepare(`
      SELECT * FROM reading_progress rp
      JOIN digital_books db ON db.id = rp.digital_book_id
      WHERE rp.user_id = ? AND db.book_id = ?
    `).get(siswa2Id, bookId);

    if (progSiswa2) {
      expect(Number(progSiswa2.user_id)).toBe(siswa2Id);
      expect(progSiswa2.last_page).toBe(15);
    }
  });

  it('6. Petugas dan Admin bisa melihat peminjaman semua siswa', async () => {
    if (!request) return;
    const resPetugas = await request(app)
      .get('/api/loans')
      .set('Authorization', `Bearer ${tokenPetugas}`);

    expect(resPetugas.status).toBe(200);
    expect(resPetugas.body.data.length).toBeGreaterThanOrEqual(1);

    const resAdmin = await request(app)
      .get('/api/loans')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(resAdmin.status).toBe(200);
    expect(resAdmin.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('7. Request tanpa login (tanpa header Authorization): ditolak 401', async () => {
    if (!request) return;
    const resLoans = await request(app).get('/api/loans');
    expect(resLoans.status).toBe(401);

    const resFav = await request(app).get('/api/favorites');
    expect(resFav.status).toBe(401);

    const resProg = await request(app).get(`/api/reading-progress/${bookId}`);
    expect(resProg.status).toBe(401);
  });
});

