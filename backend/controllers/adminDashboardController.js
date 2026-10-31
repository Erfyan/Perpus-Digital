const db = require('../database/db');

exports.admin = (req, res) => {
  const stats = {
    totalBooks: db.prepare('SELECT COUNT(*) c FROM books').get().c,
    totalDigital: db.prepare('SELECT COUNT(*) c FROM digital_books').get().c,
    totalStudents: db.prepare('SELECT COUNT(*) c FROM students').get().c,
    totalLoans: db.prepare('SELECT COUNT(*) c FROM loans').get().c,
    activeLoans: db.prepare("SELECT COUNT(*) c FROM loans WHERE status='dipinjam'").get().c,
  };
  res.json({ success: true, stats });
};
