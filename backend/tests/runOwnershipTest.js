const db = require('../database/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Import Controllers
const loansCtrl = require('../controllers/loansController');
const favCtrl = require('../controllers/favoritesController');
const progCtrl = require('../controllers/readingProgressController');
const histCtrl = require('../controllers/readingHistoryController');
const notifCtrl = require('../controllers/notificationsController');
const studentCtrl = require('../controllers/studentsController');
const digitalCtrl = require('../controllers/digitalBooksController');

// Helper to create mock req and res
function createMockContext(user, params = {}, query = {}, body = {}, headers = {}) {
  let statusCode = 200;
  let responseData = null;
  let ended = false;

  const req = {
    user,
    params,
    query,
    body,
    headers: {
      ...headers,
      ...(user ? { authorization: `Bearer ${jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET)}` } : {})
    }
  };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      ended = true;
      return this;
    },
    send(data) {
      responseData = data;
      ended = true;
      return this;
    },
    download() {
      ended = true;
      return this;
    },
    setHeader() {
      return this;
    }
  };

  return { req, res, getStatus: () => statusCode, getData: () => responseData };
}

function runOwnershipAudit() {
  console.log('========================================================================');
  console.log('AUDIT & VERIFIKASI OTORISASI PER KEPEMILIKAN DATA SISWA (PRD Bagian 18)');
  console.log('========================================================================\n');

  const testResults = [];

  function recordTest(name, passed, detail) {
    testResults.push({ name, passed, detail });
    const tag = passed ? 'PASS' : 'FAIL';
    console.log(`[${tag}] ${name}`);
    if (detail) console.log(`       Detail: ${detail}`);
  }

  // Siapkan Data Uji Minimal 2 Siswa Seed
  const user1 = db.prepare("SELECT id, username, role FROM users WHERE username = 'andi'").get();
  const user2 = db.prepare("SELECT id, username, role FROM users WHERE username = 'budi'").get();
  const userPetugas = db.prepare("SELECT id, username, role FROM users WHERE role = 'petugas'").get();
  const userAdmin = db.prepare("SELECT id, username, role FROM users WHERE role = 'admin'").get();

  if (!user1 || !user2) {
    console.error('Akun seed andi / budi tidak ditemukan di database');
    return;
  }

  const s1 = user1;
  const s2 = user2;

  // Siapkan buku & pinjaman untuk Siswa 1
  const book = db.prepare("SELECT id, title FROM books WHERE is_active=1 LIMIT 1").get();
  const bookId = book.id;

  // Reset pinjaman uji
  db.prepare("DELETE FROM loans WHERE user_id IN (?, ?)").run(s1.id, s2.id);

  // Buat pinjaman milik Siswa 1
  const loanIdS1 = db.prepare(`
    INSERT INTO loans (loan_code, user_id, loan_date, due_date, status)
    VALUES ('PJ-TEST-S1', ?, '2026-10-01', '2026-10-08', 'dipinjam')
  `).run(s1.id).lastInsertRowid;

  db.prepare(`INSERT INTO loan_details (loan_id, book_id) VALUES (?, ?)`).run(loanIdS1, bookId);

  // ---------------------------------------------------------------------------------------
  // TEST 1: Siswa 1 login, GET /api/loans HANYA mengembalikan peminjaman siswa 1
  // ---------------------------------------------------------------------------------------
  {
    const { req, res, getStatus, getData } = createMockContext(s1, {}, {}, {});
    loansCtrl.list(req, res);
    const data = getData()?.data || [];
    const allMine = data.length > 0 && data.every(item => Number(item.user_id) === Number(s1.id));
    recordTest(
      '1. Siswa 1 login: GET /api/loans hanya mengembalikan peminjaman milik siswa 1',
      getStatus() === 200 && allMine,
      `Status: ${getStatus()}, Total Data: ${data.length}, Semua UserID=${s1.id}`
    );
  }

  // ---------------------------------------------------------------------------------------
  // TEST 2: Siswa 2 mengakses peminjaman milik siswa 1 lewat id langsung: DITOLAK (404)
  // ---------------------------------------------------------------------------------------
  {
    const { req, res, getStatus, getData } = createMockContext(s2, { id: loanIdS1 }, {}, {});
    loansCtrl.getById(req, res);
    const rejected = getStatus() === 404 || getStatus() === 403;
    recordTest(
      '2. Siswa 2 mengakses peminjaman Siswa 1 lewat ID langsung: ditolak (404)',
      rejected && getData()?.success === false,
      `Status: ${getStatus()}, Message: "${getData()?.message}" (Data tidak bocor)`
    );
  }

  // ---------------------------------------------------------------------------------------
  // TEST 3: Siswa 2 mencoba PUT /api/loans/:id/return milik siswa 1: DITOLAK, data tidak berubah
  // ---------------------------------------------------------------------------------------
  {
    const { req, res, getStatus, getData } = createMockContext(s2, { id: loanIdS1 }, {}, {});
    loansCtrl.returnLoan(req, res);
    const rejected = getStatus() === 404 || getStatus() === 403;

    // Verifikasi database: status tetap 'dipinjam'
    const currentLoan = db.prepare('SELECT status FROM loans WHERE id=?').get(loanIdS1);
    const dataUnchanged = currentLoan && currentLoan.status === 'dipinjam';

    recordTest(
      '3. Siswa 2 mencoba PUT /api/loans/:id/return milik Siswa 1: ditolak, data tidak berubah',
      rejected && dataUnchanged,
      `Status: ${getStatus()}, DB Status Pinjaman Tetap: "${currentLoan?.status}"`
    );
  }

  // ---------------------------------------------------------------------------------------
  // TEST 4: Siswa 2 mengirim user_id Siswa 1 di body saat membuat favorit: DIABAIKAN
  // ---------------------------------------------------------------------------------------
  {
    // Bersihkan favorit uji
    db.prepare("DELETE FROM favorites WHERE book_id = ? AND user_id IN (?, ?)").run(bookId, s1.id, s2.id);

    // Siswa 2 request dengan body { book_id, user_id: s1.id }
    const { req, res, getStatus, getData } = createMockContext(s2, {}, {}, { book_id: bookId, user_id: s1.id });
    favCtrl.add(req, res);

    // Verifikasi di DB: tersimpan atas nama Siswa 2, BUKAN Siswa 1
    const favS2 = db.prepare("SELECT * FROM favorites WHERE user_id=? AND book_id=?").get(s2.id, bookId);
    const favS1 = db.prepare("SELECT * FROM favorites WHERE user_id=? AND book_id=?").get(s1.id, bookId);

    const safeSaved = favS2 && !favS1;
    recordTest(
      '4. Siswa 2 mengirim user_id Siswa 1 saat POST favorit: diabaikan, tersimpan atas nama Siswa 2',
      getStatus() === 200 && safeSaved,
      `Tersimpan di user_id=${s2.id} (Siswa 2), Ada di Siswa 1? ${!!favS1}`
    );
  }

  // ---------------------------------------------------------------------------------------
  // TEST 5: Siswa 2 mengirim user_id Siswa 1 di body saat update reading-progress: DIABAIKAN
  // ---------------------------------------------------------------------------------------
  {
    // Cari buku digital
    const digiBook = db.prepare("SELECT id, book_id FROM digital_books LIMIT 1").get();
    if (digiBook) {
      // Siswa 2 update progress dengan injeksi user_id Siswa 1
      const { req, res, getStatus, getData } = createMockContext(s2, { bookId: digiBook.book_id }, {}, {
        last_page: 25,
        total_pages: 100,
        user_id: s1.id
      });
      progCtrl.update(req, res);

      const progS2 = db.prepare("SELECT * FROM reading_progress WHERE user_id=? AND digital_book_id=?").get(s2.id, digiBook.id);
      const progS1 = db.prepare("SELECT * FROM reading_progress WHERE user_id=? AND digital_book_id=?").get(s1.id, digiBook.id);

      const safeProgress = progS2 && progS2.last_page === 25 && (!progS1 || progS1.last_page !== 25);
      recordTest(
        '5. Siswa 2 mengirim user_id Siswa 1 saat PUT progress: diabaikan, tersimpan atas nama Siswa 2',
        getStatus() === 200 && safeProgress,
        `Tersimpan di user_id=${s2.id} halaman ${progS2?.last_page}, Tidak menimpa Siswa 1`
      );
    }
  }

  // ---------------------------------------------------------------------------------------
  // TEST 6: Petugas dan Admin bisa melihat peminjaman semua siswa
  // ---------------------------------------------------------------------------------------
  {
    const ctxPetugas = createMockContext(userPetugas, {}, {}, {});
    loansCtrl.list(ctxPetugas.req, ctxPetugas.res);
    const totalPetugas = ctxPetugas.getData()?.data?.length || 0;

    const ctxAdmin = createMockContext(userAdmin, {}, {}, {});
    loansCtrl.list(ctxAdmin.req, ctxAdmin.res);
    const totalAdmin = ctxAdmin.getData()?.data?.length || 0;

    const staffCanSeeAll = totalPetugas > 0 && totalAdmin > 0;
    recordTest(
      '6. Petugas dan Admin bisa melihat peminjaman seluruh siswa',
      staffCanSeeAll,
      `Petugas melihat ${totalPetugas} transaksi, Admin melihat ${totalAdmin} transaksi`
    );
  }

  // ---------------------------------------------------------------------------------------
  // TEST 7: Request tanpa login (tanpa token) ditolak HTTP 401
  // ---------------------------------------------------------------------------------------
  {
    const { authenticate } = require('../middleware/auth');
    const { req, res, getStatus, getData } = createMockContext(null, {}, {}, {});
    let nextCalled = false;
    authenticate(req, res, () => { nextCalled = true; });

    recordTest(
      '7. Request tanpa login ditolak HTTP 401 Unauthorized',
      getStatus() === 401 && !nextCalled,
      `Status: ${getStatus()}, Message: "${getData()?.message}"`
    );
  }

  // ---------------------------------------------------------------------------------------
  // TEST 8: Siswa 2 mencoba DELETE favorit milik Siswa 1: DITOLAK (404), data Siswa 1 aman
  // ---------------------------------------------------------------------------------------
  {
    // Berikan Siswa 1 favorit buku
    try {
      db.prepare("INSERT INTO favorites (user_id, book_id) VALUES (?, ?)").run(s1.id, bookId);
    } catch(e) {}

    // Siswa 2 mencoba DELETE buku tersebut
    const { req, res, getStatus, getData } = createMockContext(s2, { bookId: bookId }, {}, {});
    favCtrl.remove(req, res);

    const s1FavStillExists = db.prepare("SELECT * FROM favorites WHERE user_id=? AND book_id=?").get(s1.id, bookId);
    recordTest(
      '8. Siswa 2 mencoba DELETE favorit Siswa 1: ditolak (404), favorit Siswa 1 tidak terhapus',
      getStatus() === 404 && !!s1FavStillExists,
      `Status: ${getStatus()}, Data Siswa 1 masih utuh di DB: ${!!s1FavStillExists}`
    );
  }

  // ---------------------------------------------------------------------------------------
  // TEST 9: Siswa 2 mencoba mengakses profil Siswa 1 via GET /api/students/:id: DITOLAK (404)
  // ---------------------------------------------------------------------------------------
  {
    const s1Record = db.prepare("SELECT id FROM students WHERE user_id=?").get(s1.id);
    if (s1Record) {
      const { req, res, getStatus, getData } = createMockContext(s2, { id: s1Record.id }, {}, {});
      studentCtrl.getById(req, res);

      recordTest(
        '9. Siswa 2 mengakses profil Siswa 1 lewat ID langsung: ditolak (404)',
        getStatus() === 404 && getData()?.success === false,
        `Status: ${getStatus()}, Message: "${getData()?.message}"`
      );
    }
  }

  // ---------------------------------------------------------------------------------------
  // TEST 10: Siswa 2 mencoba menandai notifikasi Siswa 1 via PUT /notifications/:id/read: DITOLAK (404)
  // ---------------------------------------------------------------------------------------
  {
    // Buat notifikasi untuk Siswa 1
    const notifId = db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, is_read)
      VALUES (?, 'Notif Uji', 'Pesan rahasia', 'info', 0)
    `).run(s1.id).lastInsertRowid;

    // Siswa 2 mencoba menandai dibaca
    const { req, res, getStatus, getData } = createMockContext(s2, { id: notifId }, {}, {});
    notifCtrl.markRead(req, res);

    const notif = db.prepare("SELECT is_read FROM notifications WHERE id=?").get(notifId);
    const unread = notif && notif.is_read === 0;

    recordTest(
      '10. Siswa 2 mencoba markRead notifikasi Siswa 1: ditolak (404), status tetap belum dibaca',
      getStatus() === 404 && unread,
      `Status: ${getStatus()}, is_read di DB tetap: ${notif?.is_read}`
    );

    // Cleanup notif
    db.prepare("DELETE FROM notifications WHERE id=?").run(notifId);
  }

  // ---------------------------------------------------------------------------------------
  // TEST 11: Buku Digital dengan can_read=false & can_download=false ditolak 403
  // ---------------------------------------------------------------------------------------
  {
    // Buat buku digital dengan can_read=0 dan can_download=0
    const testBookId = db.prepare(`
      INSERT INTO books (code, title, author, book_type, stock, available_stock, is_active)
      VALUES ('BK-PROT', 'Buku Terlindungi', 'Penulis Rahasia', 'digital', 1, 1, 1)
    `).run().lastInsertRowid;

    const testDigiId = db.prepare(`
      INSERT INTO digital_books (book_id, file_name, file_path, file_size, can_read, can_download)
      VALUES (?, 'protected.pdf', '/storage/books/protected.pdf', 1024, 0, 0)
    `).run(testBookId).lastInsertRowid;

    const ctxRead = createMockContext(s1, { id: testDigiId }, {}, {});
    digitalCtrl.read(ctxRead.req, ctxRead.res);

    const ctxDown = createMockContext(s1, { id: testDigiId }, {}, {});
    digitalCtrl.download(ctxDown.req, ctxDown.res);

    const readDenied = ctxRead.getStatus() === 403;
    const downDenied = ctxDown.getStatus() === 403;

    recordTest(
      '11. Proteksi Buku Digital (can_read=false & can_download=false) ditolak HTTP 403',
      readDenied && downDenied,
      `Read status: ${ctxRead.getStatus()}, Download status: ${ctxDown.getStatus()}`
    );

    // Cleanup
    db.prepare("DELETE FROM digital_books WHERE id=?").run(testDigiId);
    db.prepare("DELETE FROM books WHERE id=?").run(testBookId);
  }

  console.log('\n========================================================================');
  const allPassed = testResults.every(t => t.passed);
  console.log(`RINGKASAN HASIL: ${allPassed ? 'SEMUA 11 PENGUJIAN LOLOS (ALL PASS)' : 'ADA PENGUJIAN GAGAL'}`);
  console.log('========================================================================\n');

  return testResults;
}

if (require.main === module) {
  runOwnershipAudit();
}

module.exports = runOwnershipAudit;

