const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');
const { log } = require('../utils/audit');

// Pastikan direktori penyimpanan ada
const uploadDir = path.join(__dirname, '..', '..', 'storage', 'books');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer dengan proteksi sanitasi filename & path traversal
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeBaseName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `${Date.now()}-${safeBaseName}`;
    cb(null, uniqueFilename);
  },
});

// Filter hanya file PDF dan ukuran maks 50 MB
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isPdfExt = ext === '.pdf';
  const isPdfMime = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf';

  if (!isPdfExt || !isPdfMime) {
    const error = new Error('Hanya file dokumen format PDF yang diizinkan!');
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter,
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Ukuran file melebihi batas maksimal (50 MB)' });
      }
      if (err.code === 'INVALID_FILE_TYPE' || err.message) {
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(400).json({ success: false, message: 'Gagal mengunggah file' });
    }
    next();
  });
};

// POST /api/digital-books: Upload file PDF buku digital
router.post('/', authenticate, authorize('admin', 'petugas'), handleUpload, (req, res) => {
  const { book_id, total_pages = 100, can_read, can_download, copyright_confirmed } = req.body || {};

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File PDF wajib diunggah' });
  }
  if (!book_id) {
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    return res.status(400).json({ success: false, message: 'ID buku (book_id) wajib disertakan' });
  }

  // Poin 7 (Bagian 23 PRD): Konfirmasi hak cipta
  if (copyright_confirmed === 'false' || copyright_confirmed === false) {
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    return res.status(400).json({
      success: false,
      message: 'Anda wajib mengonfirmasi kepatuhan terhadap lisensi dan hak cipta buku sekolah dasar (PRD Bagian 23)'
    });
  }

  const book = db.prepare('SELECT id, book_type, title FROM books WHERE id=?').get(book_id);
  if (!book) {
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  }

  const existingDigital = db.prepare('SELECT id FROM digital_books WHERE book_id=?').get(book_id);
  if (existingDigital) {
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    return res.status(400).json({ success: false, message: 'Buku ini sudah memiliki file digital. Gunakan opsi edit untuk mengubah izin/file.' });
  }

  const readAllowed = can_read === 'false' || can_read === false || can_read === '0' || can_read === 0 ? 0 : 1;
  const downloadAllowed = can_download === 'true' || can_download === true || can_download === '1' || can_download === 1 ? 1 : 0;
  const filePath = '/storage/books/' + req.file.filename;

  const id = db.prepare(`
    INSERT INTO digital_books (
      book_id, file_name, file_path, file_size, total_pages, can_read, can_download, uploaded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    book_id,
    req.file.originalname,
    filePath,
    req.file.size,
    Number(total_pages) || 100,
    readAllowed,
    downloadAllowed,
    req.user.id
  ).lastInsertRowid;

  const newType = book.book_type === 'fisik' ? 'keduanya' : 'digital';
  db.prepare("UPDATE books SET book_type=?, updated_at=datetime('now') WHERE id=?").run(newType, book_id);

  // Audit log aktivitas unggah
  log('file_uploaded', req.user.id, `book_id=${book_id}, title="${book.title}", file="${req.file.originalname}"`, req.ip);

  res.json({
    success: true,
    message: `File digital untuk buku "${book.title}" berhasil diunggah`,
    data: { id, book_id, file_name: req.file.originalname, can_read: !!readAllowed, can_download: !!downloadAllowed }
  });
});

// GET /api/digital-books: Daftar seluruh buku digital
router.get('/', authenticate, (req, res) => {
  const { search } = req.query;
  let sql = `
    SELECT db.*, b.title, b.code, b.rating, c.name AS category_name, u.username AS uploader_name
    FROM digital_books db
    JOIN books b ON b.id = db.book_id
    LEFT JOIN categories c ON c.id = b.category_id
    LEFT JOIN users u ON u.id = db.uploaded_by
  `;
  const params = [];
  if (search) {
    sql += ` WHERE b.title LIKE ? OR b.code LIKE ? OR db.file_name LIKE ?`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  sql += ` ORDER BY db.created_at DESC`;
  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows });
});

// PUT /api/digital-books/:id: Atur izin can_read, can_download, dan total_pages
router.put('/:id', authenticate, authorize('admin', 'petugas'), (req, res) => {
  const id = req.params.id;
  const dbb = db.prepare('SELECT db.*, b.title FROM digital_books db JOIN books b ON b.id = db.book_id WHERE db.id=?').get(id);
  if (!dbb) return res.status(404).json({ success: false, message: 'Buku digital tidak ditemukan' });

  const { can_read, can_download, total_pages } = req.body || {};

  const readVal = can_read !== undefined
    ? (can_read === true || can_read === 1 || can_read === '1' ? 1 : 0)
    : dbb.can_read;

  const downloadVal = can_download !== undefined
    ? (can_download === true || can_download === 1 || can_download === '1' ? 1 : 0)
    : dbb.can_download;

  const pagesVal = total_pages !== undefined ? Math.max(1, Number(total_pages)) : dbb.total_pages;

  db.prepare(`
    UPDATE digital_books SET
      can_read = ?,
      can_download = ?,
      total_pages = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(readVal, downloadVal, pagesVal, id);

  // Poin 6: Audit log perubahan hak akses file
  log(
    'file_permission_changed',
    req.user.id,
    `book="${dbb.title}", digital_id=${id}, can_read=${readVal}, can_download=${downloadVal}`,
    req.ip
  );

  res.json({
    success: true,
    message: 'Pengaturan akses buku digital berhasil diperbarui',
    data: { id, can_read: !!readVal, can_download: !!downloadVal, total_pages: pagesVal }
  });
});

// DELETE /api/digital-books/:id: Hapus file digital
router.delete('/:id', authenticate, authorize('admin', 'petugas'), (req, res) => {
  const id = req.params.id;
  const dbb = db.prepare('SELECT db.*, b.title FROM digital_books db JOIN books b ON b.id = db.book_id WHERE db.id=?').get(id);
  if (!dbb) return res.status(404).json({ success: false, message: 'Buku digital tidak ditemukan' });

  const absoluteDiskPath = path.join(__dirname, '..', '..', dbb.file_path.replace(/^\//, ''));
  if (fs.existsSync(absoluteDiskPath)) {
    try { fs.unlinkSync(absoluteDiskPath); } catch (e) {}
  }

  db.prepare('DELETE FROM digital_books WHERE id=?').run(id);

  const remaining = db.prepare('SELECT COUNT(*) c FROM digital_books WHERE book_id=?').get(dbb.book_id).c;
  if (remaining === 0) {
    db.prepare("UPDATE books SET book_type='fisik', updated_at=datetime('now') WHERE id=?").run(dbb.book_id);
  }

  // Audit log penghapusan file
  log('file_deleted', req.user.id, `digital_id=${id}, book="${dbb.title}", file="${dbb.file_name}"`, req.ip);

  res.json({ success: true, message: 'Buku digital berhasil dihapus' });
});

module.exports = router;
