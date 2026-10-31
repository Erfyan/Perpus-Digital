const db = require('../database/db');
const path = require('path');
const fs = require('fs');

exports.read = (req, res) => {
  const id = req.params.id;
  const dbb = db.prepare(`SELECT db.*, b.title FROM digital_books db JOIN books b ON b.id=db.book_id WHERE db.id=?`).get(id);
  if (!dbb) return res.status(404).json({ success: false, message: 'Buku digital tidak ditemukan' });
  if (!dbb.can_read) return res.status(403).json({ success: false, message: 'Tidak diizinkan membaca' });
  // In MVP, we return metadata + a safe file URL placeholder; actual file serving optional.
  const filePath = dbb.file_path;
  res.json({ success: true, data: { id: dbb.id, book_id: dbb.book_id, title: dbb.title, file_name: dbb.file_name, file_path: filePath, total_pages: dbb.total_pages, can_read: !!dbb.can_read, can_download: !!dbb.can_download } });
};

exports.download = (req, res) => {
  const id = req.params.id;
  const dbb = db.prepare(`SELECT * FROM digital_books WHERE id=?`).get(id);
  if (!dbb) return res.status(404).json({ success: false, message: 'Buku digital tidak ditemukan' });
  if (!dbb.can_download) return res.status(403).json({ success: false, message: 'Download tidak diizinkan' });
  res.json({ success: true, message: 'Download diizinkan', file_path: dbb.file_path, file_name: dbb.file_name });
};
