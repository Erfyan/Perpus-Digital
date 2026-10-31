const db = require('../database/db');

exports.list = (req, res) => {
  const { search, category, type, grade, sort, page = 1, limit = 20 } = req.query;
  let sql = `SELECT b.*, c.name AS category_name, c.slug AS category_slug,
             (SELECT COUNT(*) FROM digital_books WHERE book_id = b.id) AS has_digital
             FROM books b LEFT JOIN categories c ON c.id=b.category_id WHERE b.is_active=1`;
  const params = [];

  // Search
  if (search) {
    sql += ` AND (b.title LIKE ? OR b.author LIKE ? OR c.name LIKE ? OR b.code LIKE ? OR b.description LIKE ? OR b.isbn LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q, q, q, q, q);
  }

  // Filter kategori
  if (category) {
    sql += ` AND (c.slug=? OR c.name=?)`;
    params.push(category, category);
  }

  // Filter jenis buku
  if (type) {
    if (type === 'digital') sql += ` AND b.book_type IN ('digital','keduanya')`;
    else if (type === 'fisik') sql += ` AND b.book_type IN ('fisik','keduanya')`;
    else {
      sql += ` AND b.book_type=?`;
      params.push(type);
    }
  }

  // Filter kelas
  if (grade) {
    sql += ` AND (b.title LIKE ? OR b.description LIKE ?)`;
    const g = `%Kelas ${grade}%`;
    params.push(g, g);
  }

  // Sorting
  if (sort === 'rating') {
    sql += ` ORDER BY b.rating DESC, b.created_at DESC`;
  } else if (sort === 'title') {
    sql += ` ORDER BY b.title ASC`;
  } else if (sort === 'oldest') {
    sql += ` ORDER BY b.created_at ASC`;
  } else {
    sql += ` ORDER BY b.created_at DESC`;
  }

  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
  const total = db.prepare(`SELECT COUNT(*) c FROM (${sql})`).get(...params).c;

  sql += ` LIMIT ? OFFSET ?`;
  params.push(Number(limit), offset);

  const rows = db.prepare(sql).all(...params);
  res.json({
    success: true,
    data: rows,
    pagination: {
      page: Math.max(1, Number(page)),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }
  });
};

exports.create = (req, res) => {
  const {
    code,
    isbn,
    title,
    author,
    publisher,
    publication_year,
    category_id,
    description,
    book_type = 'fisik',
    stock = 0,
    available_stock,
    rating = 0
  } = req.body || {};

  // Validasi judul wajib diisi
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Judul buku wajib diisi' });
  }

  // Validasi stok tidak boleh negatif
  const parsedStock = Number(stock);
  if (isNaN(parsedStock) || parsedStock < 0) {
    return res.status(400).json({ success: false, message: 'Stok tidak boleh bernilai negatif' });
  }

  // Validasi available_stock tidak boleh negatif & tidak boleh melebihi stok
  const parsedAvailable = available_stock !== undefined ? Number(available_stock) : parsedStock;
  if (isNaN(parsedAvailable) || parsedAvailable < 0) {
    return res.status(400).json({ success: false, message: 'Stok tersedia (available_stock) tidak boleh bernilai negatif' });
  }
  if (parsedAvailable > parsedStock) {
    return res.status(400).json({ success: false, message: 'Stok tersedia tidak boleh melebihi total stok' });
  }

  // Validasi kode buku unik jika disediakan
  let bookCode = code ? code.trim() : null;
  if (bookCode) {
    const existingCode = db.prepare('SELECT id FROM books WHERE code=?').get(bookCode);
    if (existingCode) {
      return res.status(400).json({ success: false, message: `Kode buku "${bookCode}" sudah digunakan` });
    }
  } else {
    // Generate kode otomatis jika kosong
    bookCode = 'BK' + Date.now();
  }

  // Validasi category_id jika ada
  if (category_id) {
    const cat = db.prepare('SELECT id FROM categories WHERE id=?').get(category_id);
    if (!cat) {
      return res.status(400).json({ success: false, message: 'Kategori yang dipilih tidak valid' });
    }
  }

  // Validasi book_type
  const validTypes = ['fisik', 'digital', 'keduanya'];
  if (!validTypes.includes(book_type)) {
    return res.status(400).json({ success: false, message: 'Tipe buku harus salah satu dari: fisik, digital, keduanya' });
  }

  const bid = db.prepare(`
    INSERT INTO books (
      code, isbn, title, author, publisher, publication_year,
      category_id, description, cover_path, book_type,
      stock, available_stock, rating, is_active
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)
  `).run(
    bookCode,
    isbn || null,
    title.trim(),
    author ? author.trim() : null,
    publisher ? publisher.trim() : null,
    publication_year ? Number(publication_year) : null,
    category_id ? Number(category_id) : null,
    description ? description.trim() : null,
    null,
    book_type,
    parsedStock,
    parsedAvailable,
    Number(rating) || 0
  ).lastInsertRowid;

  res.json({
    success: true,
    message: 'Buku berhasil ditambahkan',
    data: { id: bid, code: bookCode, title: title.trim() }
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const book = db.prepare('SELECT * FROM books WHERE id=?').get(id);
  if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });

  const {
    code,
    isbn,
    title,
    author,
    publisher,
    publication_year,
    category_id,
    description,
    book_type,
    stock,
    available_stock,
    rating,
    is_active
  } = req.body || {};

  // Validasi judul jika diubah
  if (title !== undefined && (!title || !title.trim())) {
    return res.status(400).json({ success: false, message: 'Judul buku tidak boleh kosong' });
  }

  // Validasi kode jika diubah
  if (code !== undefined && code !== book.code) {
    const existing = db.prepare('SELECT id FROM books WHERE code=? AND id!=?').get(code.trim(), id);
    if (existing) {
      return res.status(400).json({ success: false, message: `Kode buku "${code}" sudah digunakan` });
    }
  }

  // Validasi stok tidak boleh negatif
  let newStock = book.stock;
  if (stock !== undefined) {
    newStock = Number(stock);
    if (isNaN(newStock) || newStock < 0) {
      return res.status(400).json({ success: false, message: 'Stok tidak boleh bernilai negatif' });
    }
  }

  // Validasi available_stock tidak boleh negatif & tidak boleh melebihi stock
  let newAvailable = book.available_stock;
  if (available_stock !== undefined) {
    newAvailable = Number(available_stock);
    if (isNaN(newAvailable) || newAvailable < 0) {
      return res.status(400).json({ success: false, message: 'Stok tersedia tidak boleh bernilai negatif' });
    }
  }
  if (newAvailable > newStock) {
    return res.status(400).json({ success: false, message: 'Stok tersedia tidak boleh melebihi total stok' });
  }

  // Validasi kategori jika diubah
  if (category_id !== undefined && category_id !== null) {
    const cat = db.prepare('SELECT id FROM categories WHERE id=?').get(category_id);
    if (!cat) {
      return res.status(400).json({ success: false, message: 'Kategori yang dipilih tidak valid' });
    }
  }

  db.prepare(`
    UPDATE books SET
      code = COALESCE(?, code),
      isbn = COALESCE(?, isbn),
      title = COALESCE(?, title),
      author = COALESCE(?, author),
      publisher = COALESCE(?, publisher),
      publication_year = COALESCE(?, publication_year),
      category_id = ?,
      description = COALESCE(?, description),
      book_type = COALESCE(?, book_type),
      stock = ?,
      available_stock = ?,
      rating = COALESCE(?, rating),
      is_active = COALESCE(?, is_active),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    code !== undefined ? code.trim() : null,
    isbn !== undefined ? isbn : null,
    title !== undefined ? title.trim() : null,
    author !== undefined ? author.trim() : null,
    publisher !== undefined ? publisher.trim() : null,
    publication_year !== undefined ? Number(publication_year) : null,
    category_id !== undefined ? (category_id ? Number(category_id) : null) : book.category_id,
    description !== undefined ? description.trim() : null,
    book_type !== undefined ? book_type : null,
    newStock,
    newAvailable,
    rating !== undefined ? Number(rating) : null,
    is_active !== undefined ? Number(is_active) : null,
    id
  );

  res.json({ success: true, message: 'Buku berhasil diperbarui' });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  const book = db.prepare('SELECT id FROM books WHERE id=?').get(id);
  if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });

  // Cek apakah buku sedang dipinjam
  const activeLoan = db.prepare(`
    SELECT ld.id FROM loan_details ld 
    JOIN loans l ON l.id = ld.loan_id 
    WHERE ld.book_id = ? AND l.status = 'dipinjam'
  `).get(id);

  if (activeLoan) {
    return res.status(400).json({ success: false, message: 'Buku tidak dapat dihapus karena sedang dalam masa peminjaman aktif' });
  }

  db.prepare("UPDATE books SET is_active=0, updated_at=datetime('now') WHERE id=?").run(id);
  res.json({ success: true, message: 'Buku berhasil dinonaktifkan' });
};

exports.detail = (req, res) => {
  const id = req.params.id;
  const book = db.prepare(`SELECT b.*, c.name AS category_name, c.slug AS category_slug FROM books b LEFT JOIN categories c ON c.id=b.category_id WHERE b.id=?`).get(id);
  if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  const digital = db.prepare(`SELECT * FROM digital_books WHERE book_id=?`).get(id);
  res.json({ success: true, data: { ...book, digital } });
};
