const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../database/db');
const { authenticate, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'storage', 'books')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/', authenticate, authorize('admin','petugas'), upload.single('file'), (req, res) => {
  const { book_id, total_pages, can_read, can_download } = req.body || {};
  if (!req.file || !book_id) return res.status(400).json({ success: false, message: 'file dan book_id wajib' });
  const id = db.prepare(`INSERT INTO digital_books (book_id,file_name,file_path,file_size,total_pages,can_read,can_download,uploaded_by) VALUES (?,?,?,?,?,?,?,?)`)
    .run(book_id, req.file.originalname, '/storage/books/' + req.file.filename, req.file.size, total_pages || 0, can_read === 'false' ? 0 : 1, can_download === 'true' ? 1 : 0, req.user.id).lastInsertRowid;
  // update book_type to digital/keduanya
  db.prepare("UPDATE books SET book_type='keduanya', updated_at=datetime('now') WHERE id=? AND book_type='fisik'").run(book_id);
  res.json({ success: true, data: { id } });
});

router.get('/', authenticate, (req, res) => {
  const rows = db.prepare(`SELECT db.*, b.title FROM digital_books db JOIN books b ON b.id=db.book_id`).all();
  res.json({ success: true, data: rows });
});

module.exports = router;
