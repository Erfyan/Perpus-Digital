const db = require('../database/db');

/**
 * Middleware untuk validasi kepemilikan data (Ownership-based Authorization).
 *
 * Aturan (PRD Bagian 9, 10, 11, 15, 18, 19):
 * 1. Siswa hanya dapat mengakses data miliknya sendiri.
 * 2. Petugas dan Admin boleh melihat dan memproses data semua siswa.
 * 3. Jika bukan pemilik dan bukan staff, kembalikan 404 (mencegah data leakage).
 * 4. Tanpa login: 401 (ditangani oleh middleware authenticate).
 *
 * @param {string} table - Nama tabel database (misal: 'loans', 'notifications', 'students')
 * @param {object} options - Opsi konfigurasi
 */
function checkOwnership(table, options = {}) {
  const {
    param = 'id',
    ownerField = 'user_id',
    resourceName = 'Data',
    allowStaff = true,
    idField = 'id',
    reqProp = null
  } = options;

  return (req, res, next) => {
    // 1. Pastikan request telah terautentikasi
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Belum terautentikasi' });
    }

    const resourceId = req.params[param];
    if (!resourceId) {
      return res.status(400).json({ success: false, message: `Parameter "${param}" tidak ditemukan` });
    }

    // 2. Ambil record dari database
    const record = db.prepare(`SELECT * FROM ${table} WHERE ${idField} = ?`).get(resourceId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `${resourceName} tidak ditemukan`
      });
    }

    // 3. Simpan record di req agar controller tidak perlu query ulang
    if (reqProp) {
      req[reqProp] = record;
    } else {
      req.currentResource = record;
    }

    // 4. Petugas & Admin memiliki izin akses penuh jika allowStaff = true
    if (allowStaff && (req.user.role === 'admin' || req.user.role === 'petugas')) {
      return next();
    }

    // 5. Cek kepemilikan untuk Siswa
    const resourceOwnerId = record[ownerField];

    if (Number(resourceOwnerId) !== Number(req.user.id)) {
      // Kembalikan 404 secara konsisten agar keberadaan ID tidak bocor ke siswa lain
      return res.status(404).json({
        success: false,
        message: `${resourceName} tidak ditemukan`
      });
    }

    next();
  };
}

/**
 * Helper untuk menentukan ID pengguna target yang aman:
 * - Siswa: SELALU mengembalikan req.user.id (mengabaikan body/query)
 * - Petugas / Admin: boleh mengarahkan ke user_id tertentu jika disediakan
 */
function getScopedUserId(req) {
  if (!req.user) return null;
  if (req.user.role === 'siswa') {
    return req.user.id;
  }
  return req.query.user_id || req.body.user_id || req.body.student_id || req.user.id;
}

/**
 * Helper boolean untuk memeriksa apakah user saat ini adalah pemilik atau staff
 */
function isOwnerOrStaff(resourceOwnerId, req) {
  if (!req.user) return false;
  if (req.user.role === 'admin' || req.user.role === 'petugas') return true;
  return Number(resourceOwnerId) === Number(req.user.id);
}

module.exports = {
  checkOwnership,
  getScopedUserId,
  isOwnerOrStaff
};

