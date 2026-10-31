const db = require('../database/db');
const path = require('path');
const fs = require('fs');

exports.read = (req, res) => {
  const id = req.params.id;
  const dbb = db.prepare(`
    SELECT db.*, b.title, b.author, b.rating, c.name AS category_name
    FROM digital_books db 
    JOIN books b ON b.id=db.book_id 
    LEFT JOIN categories c ON c.id=b.category_id
    WHERE db.id=? OR db.book_id=?
  `).get(id, id);

  if (!dbb) {
    return res.status(404).json({ success: false, message: 'Buku digital tidak ditemukan' });
  }
  if (!dbb.can_read) {
    return res.status(403).json({ success: false, message: 'Buku ini tidak diizinkan untuk dibaca online' });
  }

  // Get current user reading progress
  let progress = null;
  if (req.user) {
    progress = db.prepare(`
      SELECT * FROM reading_progress 
      WHERE user_id=? AND digital_book_id=?
    `).get(req.user.id, dbb.id);
  }

  res.json({
    success: true,
    data: {
      id: dbb.id,
      book_id: dbb.book_id,
      title: dbb.title,
      author: dbb.author,
      category_name: dbb.category_name,
      file_name: dbb.file_name,
      file_path: dbb.file_path,
      total_pages: dbb.total_pages || 100,
      can_read: !!dbb.can_read,
      can_download: !!dbb.can_download,
      last_page: progress?.last_page || 1,
      progress_percentage: progress?.progress_percentage || 0,
      completed: !!progress?.completed
    }
  });
};

exports.download = (req, res) => {
  const id = req.params.id;
  const dbb = db.prepare(`
    SELECT db.*, b.title 
    FROM digital_books db
    JOIN books b ON b.id=db.book_id
    WHERE db.id=? OR db.book_id=?
  `).get(id, id);

  if (!dbb) {
    return res.status(404).json({ success: false, message: 'Buku digital tidak ditemukan' });
  }
  if (!dbb.can_download) {
    return res.status(403).json({ success: false, message: 'Izin unduh tidak aktif untuk buku ini' });
  }

  // Check if physical file exists in storage
  const diskPath = path.join(__dirname, '..', '..', dbb.file_path.replace(/^\//, ''));
  if (fs.existsSync(diskPath)) {
    return res.download(diskPath, `${dbb.title}.pdf`);
  }

  // Fallback: send simple dummy PDF byte stream if sample file hasn't been generated
  const samplePdf = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(dbb.title)}.pdf"`);
  res.send(Buffer.from(samplePdf));
};
