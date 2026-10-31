const db = require('./db');
const bcrypt = require('bcryptjs');

function hash(pw) { return bcrypt.hashSync(pw, 10); }

// Reset tables
const tables = ['loan_details','loans','notifications','favorites','reading_history','reading_progress','digital_books','books','categories','students','users'];
for (const t of tables) db.prepare(`DELETE FROM ${t}`).run();
for (const t of tables) { try { db.prepare(`DELETE FROM sqlite_sequence WHERE name=?`).run(t); } catch(e){} }

// Users
const insertUser = db.prepare(`INSERT INTO users (username,password_hash,role,is_active) VALUES (?,?,?,1)`);
const adminId = insertUser.run('admin', hash('admin123'), 'admin').lastInsertRowid;
const petugasId = insertUser.run('petugas', hash('petugas123'), 'petugas').lastInsertRowid;
const andiId = insertUser.run('andi', hash('123456'), 'siswa').lastInsertRowid;

const extraStudents = [
  ['budi','123456','Budi Santoso','Kelas 4B','10002'],
  ['citra','123456','Citra Lestari','Kelas 4A','10003'],
  ['dani','123456','Dani Firmansyah','Kelas 4C','10004'],
  ['eka','123456','Eka Putri','Kelas 5A','10005'],
  ['fajar','123456','Fajar Ramadhan','Kelas 5B','10006'],
  ['gita','123456','Gita Ananda','Kelas 3A','10007'],
  ['hadi','123456','Hadi Wijaya','Kelas 3B','10008'],
  ['indah','123456','Indah Sari','Kelas 6A','10009'],
  ['joko','123456','Joko Susilo','Kelas 6B','10010'],
];
const studentUserIds = { andi: andiId };
for (const [u,p,name,cls,nis] of extraStudents) {
  const uid = insertUser.run(u, hash(p), 'siswa').lastInsertRowid;
  studentUserIds[u] = uid;
}

// Students
const insertStudent = db.prepare(`INSERT INTO students (user_id,nis,full_name,class_name,avatar_url) VALUES (?,?,?,?,?)`);
insertStudent.run(andiId, '10001', 'Andi Pratama', 'Kelas 4A', null);
let nisCounter = 10002;
for (const [u,p,name,cls,nis] of extraStudents) {
  insertStudent.run(studentUserIds[u], nis, name, cls, null);
}

// Categories
const cats = [
  ['Pelajaran','pelajaran','BookOpen','blue'],
  ['Cerita','cerita','Book','pink'],
  ['Dongeng','dongeng','Sparkles','purple'],
  ['Sains','sains','FlaskConical','green'],
  ['Komik Edukasi','komik-edukasi','Smile','orange'],
  ['Agama','agama','Heart','amber'],
  ['Pengetahuan Umum','pengetahuan-umum','Globe','cyan'],
  ['Sejarah','sejarah','Landmark','brown'],
  ['Kesehatan','kesehatan','Stethoscope','red'],
  ['Inspirasi','inspirasi','Star','yellow'],
];
const insertCat = db.prepare(`INSERT INTO categories (name,slug,icon_name,color_theme) VALUES (?,?,?,?)`);
const catId = {};
for (const [name,slug,icon,color] of cats) {
  catId[name] = insertCat.run(name,slug,icon,color).lastInsertRowid;
}
// map by slug too
const catBySlug = {};
for (const [name,slug] of cats.map(c=>[c[0],c[1]])) catBySlug[slug]=catId[name];

// Helper to find cat id by name
function cid(name){ return catId[name]; }

// Named books
const namedBooks = [
  {title:'Dongeng Nusantara', category:'Cerita', rating:4.8, author:'Tim Perpustakaan', publisher:'Penerbit SD', year:2024},
  {title:'Sains di Sekitarku', category:'Sains', rating:4.7, author:'Dr. Sains', publisher:'Penerbit SD', year:2024},
  {title:'Matematika Menyenangkan', category:'Pelajaran', rating:4.9, author:'Guru Matematika', publisher:'Penerbit SD', year:2024},
  {title:'Ayo Jaga Lingkungan', category:'Pengetahuan Umum', rating:4.6, author:'Tim Lingkungan', publisher:'Penerbit SD', year:2024},
  {title:'Komik Pahlawan Indonesia', category:'Komik Edukasi', rating:4.8, author:'Komikus', publisher:'Penerbit SD', year:2024},
  {title:'Matematika Kelas 4 SD', category:'Pelajaran', rating:4.5, author:'Guru Matematika', publisher:'Penerbit SD', year:2024, pages:120},
  {title:'Petualangan Si Kancil', category:'Dongeng', rating:4.7, author:'Penulis Dongeng', publisher:'Penerbit SD', year:2025},
  {title:'Tubuh Manusia untuk Anak', category:'Kesehatan', rating:4.6, author:'Dr. Sehat', publisher:'Penerbit SD', year:2025},
  {title:'Aku Bisa Menjaga Diri', category:'Kesehatan', rating:4.5, author:'Tim Kesehatan', publisher:'Penerbit SD', year:2025},
  {title:'Ensiklopedia Hewan', category:'Pengetahuan Umum', rating:4.7, author:'Tim Sains', publisher:'Penerbit SD', year:2025},
  {title:'Cita-Citaku', category:'Inspirasi', rating:4.8, author:'Tim Inspirasi', publisher:'Penerbit SD', year:2025},
];

const insertBook = db.prepare(`INSERT INTO books (code,isbn,title,author,publisher,publication_year,category_id,description,cover_path,book_type,stock,available_stock,rating,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)`);
const insertDigital = db.prepare(`INSERT INTO digital_books (book_id,file_name,file_path,file_size,total_pages,can_read,can_download,uploaded_by) VALUES (?,?,?,?,?,?,?,?)`);

const bookIds = {}; // title -> book id
const digitalIds = {}; // title -> digital_book id
let bookCounter = 1;
function addBook(b, pages) {
  const code = 'BK' + String(bookCounter).padStart(4,'0');
  const bid = insertBook.run(code, null, b.title, b.author, b.publisher, b.year, cid(b.category), 'Deskripsi ' + b.title, null, 'digital', 5, 5, b.rating).lastInsertRowid;
  const totalPages = pages || (40 + (bookCounter % 80));
  const dbid = insertDigital.run(bid, b.title.replace(/\s+/g,'_')+'.pdf', '/storage/books/'+code+'.pdf', 1024* (50 + (bookCounter%200)), totalPages, 1, (bookCounter % 3 === 0 ? 1 : 0), adminId).lastInsertRowid;
  bookIds[b.title] = bid;
  digitalIds[b.title] = dbid;
  bookCounter++;
  return {bid, dbid, totalPages};
}

for (const b of namedBooks) {
  const pages = b.pages || undefined;
  addBook(b, pages);
}

// Fill to 120 digital books
const fillerCategories = ['Pelajaran','Cerita','Dongeng','Sains','Komik Edukasi','Agama','Pengetahuan Umum','Sejarah','Kesehatan','Inspirasi'];
let i = namedBooks.length + 1;
while (bookCounter <= 120) {
  const cat = fillerCategories[(bookCounter) % fillerCategories.length];
  const b = { title: `Buku Digital ${bookCounter}`, category: cat, rating: (3.5 + (bookCounter % 15)/10).toFixed(1)*1, author: 'Penulis ' + bookCounter, publisher: 'Penerbit SD', year: 2023 + (bookCounter % 3) };
  addBook(b, 30 + (bookCounter % 90));
  i++;
}

// Reading progress for Andi
const insertProgress = db.prepare(`INSERT INTO reading_progress (user_id,digital_book_id,last_page,total_pages,progress_percentage,last_read_at,completed) VALUES (?,?,?,?,?,?,?)`);
const mathDigital = digitalIds['Matematika Kelas 4 SD'];
insertProgress.run(andiId, mathDigital, 48, 120, 40, new Date().toISOString(), 0);

// second in-progress: Sains di Sekitarku 60%
const sainsDigital = digitalIds['Sains di Sekitarku'];
insertProgress.run(andiId, sainsDigital, 60, 100, 60, new Date().toISOString(), 0);

// 12 completed books: use first 12 digital books excluding the two in-progress? Just mark 12 progress completed.
const allDigital = db.prepare(`SELECT id FROM digital_books LIMIT 12`).all();
// ensure math & sains not double; insert completed for 10 others
let completedCount = 0;
for (const r of allDigital) {
  if (r.id === mathDigital || r.id === sainsDigital) continue;
  const tp = 50 + (r.id % 40);
  insertProgress.run(andiId, r.id, tp, tp, 100, new Date().toISOString(), 1);
  completedCount++;
  if (completedCount >= 10) break;
}
// Need total 12 completed. We have 10 from above + ? Let's add 2 more
const moreDigital = db.prepare(`SELECT id FROM digital_books WHERE id NOT IN (SELECT digital_book_id FROM reading_progress WHERE user_id=?) LIMIT 2`).all(andiId);
for (const r of moreDigital) {
  const tp = 60;
  insertProgress.run(andiId, r.id, tp, tp, 100, new Date().toISOString(), 1);
  completedCount++;
  if (completedCount >= 12) break;
}

// Reading history
const insertHistory = db.prepare(`INSERT INTO reading_history (user_id,book_id,last_page,progress_percentage,last_read_at,completed) VALUES (?,?,?,?,?,?)`);
const dongengBook = bookIds['Dongeng Nusantara'];
const sainsBook = bookIds['Sains di Sekitarku'];
const ayoBook = bookIds['Ayo Jaga Lingkungan'];
insertHistory.run(andiId, dongengBook, 100, 100, '2025-05-25T10:00:00', 1);
insertHistory.run(andiId, sainsBook, 60, 60, '2025-05-24T10:00:00', 0);
insertHistory.run(andiId, ayoBook, 35, 35, '2025-05-22T10:00:00', 0);

// Favorites (5)
const insertFav = db.prepare(`INSERT OR IGNORE INTO favorites (user_id,book_id) VALUES (?,?)`);
const favTitles = ['Dongeng Nusantara','Sains di Sekitarku','Matematika Menyenangkan','Ayo Jaga Lingkungan','Komik Pahlawan Indonesia'];
for (const t of favTitles) insertFav.run(andiId, bookIds[t]);

// Notifications (3 unread)
const insertNotif = db.prepare(`INSERT INTO notifications (user_id,title,message,type,is_read) VALUES (?,?,?,?,0)`);
insertNotif.run(andiId, 'Selamat datang!', 'Selamat datang di Perpustakaan Digital SD.', 'info');
insertNotif.run(andiId, 'Pengingat baca', 'Jangan lupa lanjutkan membaca Matematika Kelas 4 SD.', 'reminder');
insertNotif.run(andiId, 'Buku baru tersedia', 'Buku terbaru Petualangan Si Kancil sudah tersedia.', 'recommendation');

console.log('Seed selesai.');
console.log('Total digital books:', db.prepare('SELECT COUNT(*) c FROM digital_books').get().c);
console.log('Completed for andi:', db.prepare('SELECT COUNT(*) c FROM reading_progress WHERE user_id=? AND completed=1').get(andiId).c);
console.log('In progress for andi:', db.prepare("SELECT COUNT(*) c FROM reading_progress WHERE user_id=? AND progress_percentage>0 AND progress_percentage<100").get(andiId).c);
console.log('Favorites for andi:', db.prepare('SELECT COUNT(*) c FROM favorites WHERE user_id=?').get(andiId).c);
console.log('Unread notif:', db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND is_read=0').get(andiId).c);
