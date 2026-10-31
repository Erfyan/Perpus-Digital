const db = require('../database/db');

exports.list = (req, res) => {
  const rows = db.prepare(`
    SELECT l.*, u.username, s.full_name
    FROM loans l
    JOIN users u ON u.id=l.user_id
    LEFT JOIN students s ON s.user_id=u.id
    ORDER BY l.created_at DESC
  `).all();
  res.json({ success: true, data: rows });
};

exports.create = (req, res) => {
  const { user_id, book_id, due_date } = req.body || {};
  if (!user_id || !book_id) return res.status(400).json({ success: false, message: 'user_id dan book_id wajib' });
  const loanCode = 'LN' + Date.now();
  const loanId = db.prepare('INSERT INTO loans (loan_code,user_id,loan_date,due_date,status) VALUES (?,?,?,?,?)')
    .run(loanCode, user_id, new Date().toISOString().slice(0,10), due_date || new Date().toISOString().slice(0,10), 'dipinjam').lastInsertRowid;
  db.prepare('INSERT INTO loan_details (loan_id,book_id) VALUES (?,?)').run(loanId, book_id);
  db.prepare('UPDATE books SET available_stock = available_stock - 1 WHERE id=? AND available_stock>0').run(book_id);
  res.json({ success: true, data: { id: loanId, loan_code: loanCode } });
};

exports.returnLoan = (req, res) => {
  const id = req.params.id;
  const loan = db.prepare('SELECT * FROM loans WHERE id=?').get(id);
  if (!loan) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan' });
  db.prepare("UPDATE loans SET status='dikembalikan', return_date=? WHERE id=?").run(new Date().toISOString().slice(0,10), id);
  const details = db.prepare('SELECT book_id FROM loan_details WHERE loan_id=?').all(id);
  for (const d of details) db.prepare('UPDATE books SET available_stock = available_stock + 1 WHERE id=?').run(d.book_id);
  res.json({ success: true, message: 'Buku dikembalikan' });
};
