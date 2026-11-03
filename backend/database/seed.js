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
function cid(name){ return catId[name]; }

const insertBook = db.prepare(`INSERT INTO books (code,isbn,title,author,publisher,publication_year,category_id,description,cover_path,book_type,stock,available_stock,rating,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)`);
const insertDigital = db.prepare(`INSERT INTO digital_books (book_id,file_name,file_path,file_size,total_pages,can_read,can_download,uploaded_by) VALUES (?,?,?,?,?,?,?,?)`);

const bookIds = {};
const digitalIds = {};
let bookCounter = 1;

function addBook(b, coverFile, pages) {
  const code = 'BK' + String(bookCounter).padStart(4,'0');
  const coverPath = coverFile ? `/book_cover/${coverFile}` : null;
  const bid = insertBook.run(code, null, b.title, b.author, b.publisher, b.year, cid(b.category), b.desc || ('Buku ' + b.title + ' adalah buku digital berkualitas untuk siswa SD yang menyenangkan dan edukatif.'), coverPath, 'digital', 5, 5, b.rating).lastInsertRowid;
  const totalPages = pages || (40 + (bookCounter % 80));
  const dbid = insertDigital.run(bid, b.title.replace(/\s+/g,'_')+'.pdf', '/storage/books/'+code+'.pdf', 1024*(50+(bookCounter%200)), totalPages, 1, (bookCounter % 3 === 0 ? 1 : 0), adminId).lastInsertRowid;
  bookIds[b.title] = bid;
  digitalIds[b.title] = dbid;
  bookCounter++;
  return {bid, dbid, totalPages};
}

// ============================================================
// 50 BUKU SESUAI NAMA FILE FOTO ASLI DI frontend/public/book_cover/
// ============================================================
const books50 = [
  {
    title: "Aku Anak Pemberani, Aku Anak Mandiri",
    category: "Inspirasi",
    rating: 4.8,
    author: "Tim Karakter Anak",
    publisher: "Penerbit Tunas Bangsa",
    year: 2024,
    cover: "Aku Anak Pemberani, Aku Anak Mandiri.jpg",
    pages: 72,
    desc: "Membentuk kepribadian siswa SD yang mandiri, percaya diri, dan berani menghadapi tantangan dengan penuh tanggung jawab."
  },
  {
    title: "Aku Pandai Membaca",
    category: "Pelajaran",
    rating: 4.9,
    author: "Ibu Guru Rahayu",
    publisher: "Penerbit Cerdas Prima",
    year: 2024,
    cover: "Aku Pandai Membaca.jpg",
    pages: 64,
    desc: "Metode menyenangkan dan bertahap untuk melatih kelancaran membaca, pemahaman kosa kata, dan intonasi yang tepat bagi anak SD."
  },
  {
    title: "Ayo Mengenal Tata Surya",
    category: "Sains",
    rating: 4.7,
    author: "Dr. Astronomi Cilik",
    publisher: "Penerbit Galaksi Ilmu",
    year: 2024,
    cover: "Ayo Mengenal Tata Surya.jpg",
    pages: 88,
    desc: "Menjelajahi matahari, delapan planet, satelit, komet, dan misteri luar angkasa dengan ilustrasi warna-warni memukau."
  },
  {
    title: "Ayo Menggambar dan Mewarnai",
    category: "Pelajaran",
    rating: 4.6,
    author: "Kak Raden Seni",
    publisher: "Penerbit Kreatif Anak",
    year: 2024,
    cover: "Ayo Menggambar dan Mewarnai.jpg",
    pages: 50,
    desc: "Panduan praktis langkah demi langkah menggambar objek di sekitar serta teknik perpaduan warna yang memicu imajinasi anak."
  },
  {
    title: "Bangun Datar dan Bangun Ruang",
    category: "Pelajaran",
    rating: 4.8,
    author: "Tim Matematika Asyik",
    publisher: "Penerbit Sains Cilik",
    year: 2024,
    cover: "Bangun Datar dan bangun Ruang.jpg",
    pages: 96,
    desc: "Mengenal bentuk geometri, rumus luas, keliling, volume balok, kubus, dan prisma lewat contoh benda konkret sehari-hari."
  },
  {
    title: "Bawang Merah Bawang Putih",
    category: "Dongeng",
    rating: 4.7,
    author: "Cerita Rakyat Nusantara",
    publisher: "Penerbit Pusaka Daerah",
    year: 2023,
    cover: "Bawang Merah Bawang Putih.jpg",
    pages: 58,
    desc: "Kisah dongeng klasik yang sarat pesan moral tentang ketulusan hati, kesabaran Bawang Putih, dan akibat dari sifat dengki."
  },
  {
    title: "Belajar Coding untuk Anak",
    category: "Pengetahuan Umum",
    rating: 4.9,
    author: "Kak Programmer",
    publisher: "Penerbit Digital Masa Depan",
    year: 2025,
    cover: "Belajar Coding untuk Anak.jpg",
    pages: 80,
    desc: "Mengenalkan logika komputasi, algoritma sederhana, dan cara berpikir terstruktur bagi anak usia sekolah dasar dengan visual interaktif."
  },
  {
    title: "Belajar Huruf dan Suku Kata",
    category: "Pelajaran",
    rating: 4.7,
    author: "Bunda Literasi",
    publisher: "Penerbit Sahabat Guru",
    year: 2024,
    cover: "Belajar Huruf dan Suku Kata.jpg",
    pages: 60,
    desc: "Membantu adik-adik tingkat awal mengeja dan merangkai suku kata menjadi kalimat utuh dengan ceria tanpa rasa bosan."
  },
  {
    title: "Belajar Origami",
    category: "Pelajaran",
    rating: 4.6,
    author: "Sensei Kriya",
    publisher: "Penerbit Terampil",
    year: 2024,
    cover: "Belajar Origami.jpg",
    pages: 70,
    desc: "Kreasi seni melipat kertas Jepang membentuk burung bangau, kodok, bunga, dan hewan-hewan lucu untuk melatih motorik halus."
  },
  {
    title: "Belajar Uang dan Menabung",
    category: "Pengetahuan Umum",
    rating: 4.8,
    author: "Tim Edukasi Finansial",
    publisher: "Penerbit Celengan Cerdas",
    year: 2024,
    cover: "Belajar Uang dan Menabung.jpg",
    pages: 76,
    desc: "Pendidikan literasi keuangan dini: mengenal nilai mata uang rupiah, pentingnya hemat, berhemat, dan berinvestasi di tabungan."
  },
  {
    title: "Berani Berkata Tidak",
    category: "Kesehatan",
    rating: 4.9,
    author: "Dr. Melati Psi",
    publisher: "Penerbit Aman Mandiri",
    year: 2024,
    cover: "Berani Berkata Tidak.jpg",
    pages: 64,
    desc: "Edukasi perlindungan diri dan batasan personal agar anak berani menolak ajakan yang mencurigakan atau membahayakan tubuh mereka."
  },
  {
    title: "Berhitung Bersama si Kelinci",
    category: "Pelajaran",
    rating: 4.7,
    author: "Kak Fabel Ceria",
    publisher: "Penerbit Dunia Hewan",
    year: 2024,
    cover: "Berhitung Bersama si Kelinci.jpg",
    pages: 68,
    desc: "Belajar penjumlahan dan pengurangan dasar ditemani cerita seru petualangan Kelinci Putih di kebun wortel."
  },
  {
    title: "Bijak Menggunakan Internet",
    category: "Pengetahuan Umum",
    rating: 4.8,
    author: "Tim Siber Cilik",
    publisher: "Penerbit Literasi Digital",
    year: 2025,
    cover: "Bijak Menggunakan Internet.jpg",
    pages: 82,
    desc: "Panduan aman berselancar di dunia maya: menjaga privasi data, etika di media sosial, dan menyaring konten bermanfaat untuk anak."
  },
  {
    title: "Cerita Rakyat dari Sulawesi",
    category: "Cerita",
    rating: 4.6,
    author: "Drs. La Galigo",
    publisher: "Penerbit Celebes Pusaka",
    year: 2023,
    cover: "Cerita Rakyat dari Sulawesi.jpg",
    pages: 90,
    desc: "Himpunan legenda dan cerita turun-temurun dari berbagai suku di Sulawesi yang kaya akan kearifan lokal dan pesan persaudaraan."
  },
  {
    title: "Dunia Serangga Mini",
    category: "Sains",
    rating: 4.7,
    author: "Entomolog Cilik",
    publisher: "Penerbit Alam Raya",
    year: 2024,
    cover: "Dunia Serangga Mini.jpg",
    pages: 85,
    desc: "Melihat kehidupan semut, lebah madu, belalang, dan kumbang yang menakjubkan melalui kaca pembesar ilmu pengetahuan."
  },
  {
    title: "Gunung Berapi dan Gempa Bumi",
    category: "Sains",
    rating: 4.7,
    author: "Dr. Geologi Nusantara",
    publisher: "Penerbit Vulkano Ceria",
    year: 2024,
    cover: "Gunung Berapi dan Gempa Bumi.jpg",
    pages: 92,
    desc: "Memahami mengapa gunung meletus dan lempeng bumi bergeser di cincin api Pasifik, serta kiat mitigasi bencana alam."
  },
  {
    title: "Hewan Langka Indonesia",
    category: "Pengetahuan Umum",
    rating: 4.8,
    author: "Sahabat Satwa Liar",
    publisher: "Penerbit Rimba Lestari",
    year: 2024,
    cover: "Hewan Langka Indonesia.jpg",
    pages: 104,
    desc: "Mengenal habitat komodo, orangutan, badak bercula satu, dan burung cenderawasih agar generasi penerus peduli pelestarian satwa."
  },
  {
    title: "Kebudayaan dan Rumah Adat Nusantara",
    category: "Sejarah",
    rating: 4.9,
    author: "Dra. Siti Nusantara",
    publisher: "Penerbit Budaya Bangsa",
    year: 2024,
    cover: "Kebudayaan dan Rumah Adat Nusantara.jpg",
    pages: 110,
    desc: "Eksplorasi arsitektur rumah Gadang, Joglo, Tongkonan, Honai, dan ragam adat istiadat dari Sabang sampai Merauke."
  },
  {
    title: "Kerajaan-kerajaan di Nusantara",
    category: "Sejarah",
    rating: 4.8,
    author: "Prof. Sejarah Kuno",
    publisher: "Penerbit Mahardika",
    year: 2024,
    cover: "Kerajaan-kerajaan di Nusantara.jpg",
    pages: 125,
    desc: "Menelusuri kejayaan Kutai, Sriwijaya, Tarumanegara, Majapahit, hingga kesultanan Islam di tanah air."
  },
  {
    title: "Kerajinan dari Barang Bekas",
    category: "Pengetahuan Umum",
    rating: 4.6,
    author: "Tim Daur Ulang Kreatif",
    publisher: "Penerbit Bumi Hijau",
    year: 2024,
    cover: "Kerajinan dari Barang Bekas.jpg",
    pages: 74,
    desc: "Ubah botol plastik, kardus, dan stik es krim menjadi celengan cantik, mobil-mobilan, dan hiasan kamar yang estetik."
  },
  {
    title: "Kisah Anak Jujur",
    category: "Inspirasi",
    rating: 4.8,
    author: "Pak Guru Budi",
    publisher: "Penerbit Budi Pekerti",
    year: 2024,
    cover: "Kisah Anak Jujur.jpg",
    pages: 66,
    desc: "Cerita teladan tentang bagaimana kejujuran membawa ketenangan hati, kepercayaan sahabat, dan keberkahan dalam hidup."
  },
  {
    title: "Kisah Si Pitung",
    category: "Cerita",
    rating: 4.7,
    author: "Bang Mandra Betawi",
    publisher: "Penerbit Batavia Press",
    year: 2023,
    cover: "Kisah Si Pitung.jpg",
    pages: 78,
    desc: "Kisah kepahlawanan jagoan Betawi yang membela rakyat jelata dan melawan kesewenang-wenangan penjajah dengan silat dan budi pekerti."
  },
  {
    title: "Kisah Tokoh Dunia yang Menginspirasi",
    category: "Inspirasi",
    rating: 4.9,
    author: "Tim Biografi Dunia",
    publisher: "Penerbit Insan Unggul",
    year: 2024,
    cover: "Kisah Tokoh Dunia yang Menginspirasi.jpg",
    pages: 115,
    desc: "Perjalanan hidup Thomas Alva Edison, Wright Bersaudara, Marie Curie, dan B.J. Habibie yang pantang menyerah mewujudkan inovasi."
  },
  {
    title: "Laut Kita yang Kaya",
    category: "Sains",
    rating: 4.7,
    author: "Oseanografer Cilik",
    publisher: "Penerbit Maritim Sejahtera",
    year: 2024,
    cover: "Laut Kita yang Kaya.jpg",
    pages: 94,
    desc: "Keanekaragaman terumbu karang, ikan warna-warni, rumput laut, dan potensi maritim nusantara yang luas membentang."
  },
  {
    title: "Legenda Danau Toba",
    category: "Dongeng",
    rating: 4.8,
    author: "Penulis Cerita Batak",
    publisher: "Penerbit Horas Mandiri",
    year: 2023,
    cover: "Legenda Danau Toba.jpg",
    pages: 62,
    desc: "Cerita rakyat Toba tentang seorang petani bernama Toba, ikan mas jelmaan putri cantik, dan asal usul pulau Samosir."
  },
  {
    title: "Let's Speak English",
    category: "Pelajaran",
    rating: 4.8,
    author: "Miss Clara English",
    publisher: "Penerbit English World",
    year: 2025,
    cover: "Let's Speak English.jpg",
    pages: 86,
    desc: "Percakapan bahasa Inggris dasar sehari-hari untuk anak sekolah dasar dilengkapi pelafalan fonetik dan kartu bergambar."
  },
  {
    title: "Makan Sehat Tumbuh Kuat",
    category: "Kesehatan",
    rating: 4.7,
    author: "Ahli Gizi Puskesmas",
    publisher: "Penerbit Sehat Bugar",
    year: 2024,
    cover: "Makan Sehat Tumbuh Kuat.jpg",
    pages: 70,
    desc: "Mengenal konsep Isi Piringku: makanan bergizi seimbang, vitamin, sayuran hijau, dan pentingnya minum air putih cukup."
  },
  {
    title: "Malin Kundang Belajar Menyesal",
    category: "Dongeng",
    rating: 4.6,
    author: "Cerita Rakyat Minangkabau",
    publisher: "Penerbit Ranah Minang",
    year: 2023,
    cover: "Malin Kundang Belajar Menyesal.jpg",
    pages: 56,
    desc: "Pelajaran berbakti kepada orang tua agar anak senantiasa menyayangi dan menghormati ibu yang telah melahirkan dan membesarkan."
  },
  {
    title: "Mencuci Tangan itu Penting",
    category: "Kesehatan",
    rating: 4.9,
    author: "Dokter Cilik Peduli",
    publisher: "Penerbit Sanitasi Sehat",
    year: 2024,
    cover: "Mencuci Tangan itu Penting.jpg",
    pages: 48,
    desc: "Langkah-langkah mencuci tangan 6 langkah pakai sabun dan air mengalir untuk mencegah kuman penyakit masuk ke tubuh."
  },
  {
    title: "Mengapa Langit Berwarna Biru",
    category: "Sains",
    rating: 4.8,
    author: "Kak Fisika Asyik",
    publisher: "Penerbit Kuark Sains",
    year: 2024,
    cover: "Mengapa Langit Berwarna Biru.jpg",
    pages: 78,
    desc: "Jawaban ilmiah seru tentang pembiasan cahaya matahari, atmosfer bumi, pelangi, dan peristiwa langit lainnya."
  },
  {
    title: "Mengenal 38 Provinsi Indonesia",
    category: "Pengetahuan Umum",
    rating: 4.9,
    author: "Tim Geografi Bangsa",
    publisher: "Penerbit Peta Nusantara",
    year: 2024,
    cover: "Mengenal 38 Provinsi Indonesia.jpg",
    pages: 120,
    desc: "Informasi lengkap 38 provinsi di Indonesia dari ibu kota, suku bangsa, lambang daerah, hingga potensi wisatanya."
  },
  {
    title: "Mengenal Alat Musik Tradisional",
    category: "Sejarah",
    rating: 4.7,
    author: "Sanggar Seni Karawitan",
    publisher: "Penerbit Melodi Nusantara",
    year: 2024,
    cover: "Mengenal Alat Musik Tradisional.jpg",
    pages: 84,
    desc: "Mengenal gamelan, angklung, sasando, kolintang, tifa, dan cara memainkannya dengan penuh kecintaan pada budaya lokal."
  },
  {
    title: "Menulis Cerita Pertamaku",
    category: "Pelajaran",
    rating: 4.7,
    author: "Penulis Cilik Sahabat",
    publisher: "Penerbit Pena Pintar",
    year: 2024,
    cover: "Menulis Cerita Pertamaku.jpg",
    pages: 75,
    desc: "Kembangkan bakat menulis siswa: menentukan tokoh, alur cerita yang seru, konflik ringan, dan pesan penutup yang manis."
  },
  {
    title: "My First English Words",
    category: "Pelajaran",
    rating: 4.8,
    author: "Teacher John",
    publisher: "Penerbit Cambridge Fun",
    year: 2024,
    cover: "My First English Words.jpg",
    pages: 60,
    desc: "100 kosakata bahasa Inggris pertama untuk anak-anak: nama anggota keluarga, binatang, warna, buah-buahan, dan angka."
  },
  {
    title: "Pakaian dan Tarian Daerah",
    category: "Sejarah",
    rating: 4.8,
    author: "Maestro Tari Nusantara",
    publisher: "Penerbit Kencana Tradisi",
    year: 2024,
    cover: "Pakaian dan Tarian Daerah.jpg",
    pages: 98,
    desc: "Kemegahan tari Saman, Pendet, Jaipong, Piring, serta keelokan busana kain tenun, songket, dan batik nusantara."
  },
  {
    title: "Pasar Tradisional di Kotaku",
    category: "Pengetahuan Umum",
    rating: 4.6,
    author: "Pemerhati Sosial Anak",
    publisher: "Penerbit Komunitas Cilik",
    year: 2024,
    cover: "Pasar Tradisional di Kotaku.jpg",
    pages: 68,
    desc: "Mengenal denyut ekonomi pasar rakyat: interaksi pedagang sayur, buah segar, jajanan pasar, dan nilai gotong royong."
  },
  {
    title: "Pecahan itu Mudah",
    category: "Pelajaran",
    rating: 4.7,
    author: "Prof. Matematika Ceria",
    publisher: "Penerbit Logika Prima",
    year: 2025,
    cover: "Pecahan itu Mudah.jpg",
    pages: 88,
    desc: "Menguasai pecahan biasa, pecahan campuran, dan desimal menggunakan ilustrasi potongan pizza dan kue ulang tahun."
  },
  {
    title: "Percobaan Sains Seru di Rumah",
    category: "Sains",
    rating: 4.9,
    author: "Tim Laboratorium Kecil",
    publisher: "Penerbit Eksperimen Cerdas",
    year: 2025,
    cover: "Percobaan Sains Seru di Rumah.jpg",
    pages: 92,
    desc: "25 eksperimen sains sederhana menggunakan bahan dapur yang aman: gunung meletus dari baking soda, telur melayang, dan balon mengembang sendiri."
  },
  {
    title: "Perjalanan Setetes Air",
    category: "Sains",
    rating: 4.8,
    author: "Hidrolog Cilik",
    publisher: "Penerbit Alam Raya",
    year: 2024,
    cover: "Perjalanan Setetes Air.jpg",
    pages: 72,
    desc: "Siklus hidrologi air dari penguapan air laut, awan mendung, hujan rintik di pegunungan, hingga mengalir kembali ke samudera."
  },
  {
    title: "Profesi di Sekitar Kita",
    category: "Pengetahuan Umum",
    rating: 4.7,
    author: "Kak Cita-Cita",
    publisher: "Penerbit Masa Depan Cerah",
    year: 2024,
    cover: "Profesi di Sekitar Kita.jpg",
    pages: 80,
    desc: "Mengenal beragam pekerjaan mulia: dokter, guru, pemadam kebakaran, petani, pilot, arsitek, dan polisi lalu lintas."
  },
  {
    title: "Proklamasi Kemerdekaan Kita",
    category: "Sejarah",
    rating: 4.9,
    author: "Sejarawan Merdeka",
    publisher: "Penerbit Republik 1945",
    year: 2024,
    cover: "Proklamasi Kemerdekaan Kita.jpg",
    pages: 86,
    desc: "Detik-detik bersejarah 17 Agustus 1945: peristiwa Rengasdengklok, perumusan naskah proklamasi, dan pengibaran sang saka merah putih."
  },
  {
    title: "Puisi untuk Ibu Pertiwi",
    category: "Cerita",
    rating: 4.6,
    author: "Penyair Sahabat Anak",
    publisher: "Penerbit Kata Indah",
    year: 2024,
    cover: "Puisi untuk Ibu Pertiwi.jpg",
    pages: 64,
    desc: "Untaian sajak dan bait puisi cinta tanah air, keindahan sawah menghijau, gunung biru, dan kebanggaan menjadi anak Indonesia."
  },
  {
    title: "Rahasia Tumbuhan Hijau",
    category: "Sains",
    rating: 4.8,
    author: "Botanikus Muda",
    publisher: "Penerbit Flora Ceria",
    year: 2024,
    cover: "Rahasia Tumbuhan Hijau.jpg",
    pages: 76,
    desc: "Bagaimana daun memasak makanannya sendiri melalui fotosintesis, peran klorofil, dan pentingnya oksigen bagi kehidupan."
  },
  {
    title: "Robot, Mesin, dan Masa Depan",
    category: "Sains",
    rating: 4.9,
    author: "Insinyur Robotika",
    publisher: "Penerbit Teknologi Hebat",
    year: 2025,
    cover: "Robot, Mesin, dan Masa Depan.jpg",
    pages: 98,
    desc: "Kecerdasan buatan, lengan mekanik canggih, robot penjelajah Mars, dan kemajuan teknologi masa depan yang mengagumkan."
  },
  {
    title: "Sahabat Hutan Kalimantan",
    category: "Cerita",
    rating: 4.7,
    author: "Relawan Konservasi",
    publisher: "Penerbit Borneo Hijau",
    year: 2024,
    cover: "Sahabat Hutan Kalimantan.jpg",
    pages: 84,
    desc: "Persahabatan anak pedalaman dengan seekor anak orangutan dalam menjaga hutan hujan tropis dari ancaman kebakaran."
  },
  {
    title: "Sangkuriang dan Perahu Raksasa",
    category: "Dongeng",
    rating: 4.8,
    author: "Legenda Sunda Parahyangan",
    publisher: "Penerbit Pasundan Emas",
    year: 2023,
    cover: "Sangkuriang dan Perahu Raksasa.jpg",
    pages: 70,
    desc: "Asal mula terciptanya Gunung Tangkuban Parahu akibat perahu raksasa yang ditendang oleh Sangkuriang dalam semalam."
  },
  {
    title: "Siaga Bencana untuk Anak",
    category: "Pengetahuan Umum",
    rating: 4.8,
    author: "Tim Tanggap Darurat",
    publisher: "Penerbit Siaga Selalu",
    year: 2024,
    cover: "Siaga Bencana untuk Anak.jpg",
    pages: 75,
    desc: "Langkah penyelamatan diri saat terjadi gempa bumi, banjir, dan kebakaran di sekolah maupun di lingkungan rumah."
  },
  {
    title: "Sopan Santun di Mana Saja",
    category: "Agama",
    rating: 4.9,
    author: "Ustaz Akhlak Mulia",
    publisher: "Penerbit Adab Islami",
    year: 2024,
    cover: "Sopan Santun di Mana Saja.jpg",
    pages: 66,
    desc: "Menghormati orang tua, menyayangi teman, mengucap salam, tolong, maaf, dan terima kasih sebagai perhiasan perilaku sehari-hari."
  },
  {
    title: "Teka-teki Logika Seru",
    category: "Pelajaran",
    rating: 4.8,
    author: "Kak Asah Otak",
    publisher: "Penerbit Jenius Muda",
    year: 2025,
    cover: "Teka-teki Logika Seru.jpg",
    pages: 80,
    desc: "Asah kecerdasan berpikir dan konsentrasi lewat teka-teki pola gambar, labirin, tebak kata, dan penalaran logis yang seru."
  },
  {
    title: "Timun Mas dan Raksasa",
    category: "Dongeng",
    rating: 4.8,
    author: "Cerita Rakyat Jawa Tengah",
    publisher: "Penerbit Kencana Cerita",
    year: 2023,
    cover: "Timun Mas dan Raksasa.jpg",
    pages: 64,
    desc: "Keberanian Timun Mas melawan raksasa berbekal empat bungkusan sakti: biji timun, jarum, garam, dan terasi udang."
  }
];

// Insert 50 buku dengan cover asli
for (const b of books50) {
  addBook(b, b.cover, b.pages);
}

// Fill sisa buku ke 120 (tanpa cover, filler)
const fillerCategories = ['Pelajaran','Cerita','Dongeng','Sains','Komik Edukasi','Agama','Pengetahuan Umum','Sejarah','Kesehatan','Inspirasi'];
while (bookCounter <= 120) {
  const cat = fillerCategories[bookCounter % fillerCategories.length];
  const b = {
    title: `Buku Digital ${bookCounter}`,
    category: cat,
    rating: (3.5 + (bookCounter % 15)/10).toFixed(1)*1,
    author: 'Penulis ' + bookCounter,
    publisher: 'Penerbit SD',
    year: 2023 + (bookCounter % 3)
  };
  addBook(b, null, 30 + (bookCounter % 90));
}

// Reading progress for Andi
const insertProgress = db.prepare(`INSERT INTO reading_progress (user_id,digital_book_id,last_page,total_pages,progress_percentage,last_read_at,completed) VALUES (?,?,?,?,?,?,?)`);
const mathDigital = digitalIds['Bangun Datar dan Bangun Ruang'] || Object.values(digitalIds)[0];
insertProgress.run(andiId, mathDigital, 48, 96, 50, new Date().toISOString(), 0);

const sainsDigital = digitalIds['Ayo Mengenal Tata Surya'] || Object.values(digitalIds)[1];
insertProgress.run(andiId, sainsDigital, 60, 88, 68, new Date().toISOString(), 0);

const allDigital = db.prepare(`SELECT id FROM digital_books LIMIT 12`).all();
let completedCount = 0;
for (const r of allDigital) {
  if (r.id === mathDigital || r.id === sainsDigital) continue;
  const tp = 50 + (r.id % 40);
  insertProgress.run(andiId, r.id, tp, tp, 100, new Date().toISOString(), 1);
  completedCount++;
  if (completedCount >= 10) break;
}
const moreDigital = db.prepare(`SELECT id FROM digital_books WHERE id NOT IN (SELECT digital_book_id FROM reading_progress WHERE user_id=?) LIMIT 2`).all(andiId);
for (const r of moreDigital) {
  const tp = 60;
  insertProgress.run(andiId, r.id, tp, tp, 100, new Date().toISOString(), 1);
  completedCount++;
  if (completedCount >= 12) break;
}

// Reading history
const insertHistory = db.prepare(`INSERT INTO reading_history (user_id,book_id,last_page,progress_percentage,last_read_at,completed) VALUES (?,?,?,?,?,?)`);
const book1 = bookIds['Aku Anak Pemberani, Aku Anak Mandiri'] || 1;
const book2 = bookIds['Ayo Mengenal Tata Surya'] || 2;
const book3 = bookIds['Bawang Merah Bawang Putih'] || 3;
insertHistory.run(andiId, book1, 72, 100, '2025-05-25T10:00:00', 1);
insertHistory.run(andiId, book2, 60, 68, '2025-05-24T10:00:00', 0);
insertHistory.run(andiId, book3, 30, 50, '2025-05-22T10:00:00', 0);

// Favorites (5 buku)
const insertFav = db.prepare(`INSERT OR IGNORE INTO favorites (user_id,book_id) VALUES (?,?)`);
const favTitles = [
  'Aku Anak Pemberani, Aku Anak Mandiri',
  'Ayo Mengenal Tata Surya',
  'Belajar Coding untuk Anak',
  'Bawang Merah Bawang Putih',
  'Legenda Danau Toba'
];
for (const t of favTitles) {
  if (bookIds[t]) insertFav.run(andiId, bookIds[t]);
}

// Notifications (3 unread)
const insertNotif = db.prepare(`INSERT INTO notifications (user_id,title,message,type,is_read) VALUES (?,?,?,?,0)`);
insertNotif.run(andiId, 'Selamat datang!', 'Selamat datang di Perpustakaan Digital SD.', 'info');
insertNotif.run(andiId, 'Pengingat baca', 'Jangan lupa lanjutkan membaca Bangun Datar dan Bangun Ruang.', 'reminder');
insertNotif.run(andiId, 'Buku baru tersedia', 'Buku terbaru Robot, Mesin, dan Masa Depan sudah tersedia.', 'recommendation');

console.log('Seed selesai.');
console.log('Total digital books:', db.prepare('SELECT COUNT(*) c FROM digital_books').get().c);
console.log('Buku dengan cover:', db.prepare("SELECT COUNT(*) c FROM books WHERE cover_path IS NOT NULL").get().c);
console.log('Completed for andi:', db.prepare('SELECT COUNT(*) c FROM reading_progress WHERE user_id=? AND completed=1').get(andiId).c);
console.log('In progress for andi:', db.prepare("SELECT COUNT(*) c FROM reading_progress WHERE user_id=? AND progress_percentage>0 AND progress_percentage<100").get(andiId).c);
console.log('Favorites for andi:', db.prepare('SELECT COUNT(*) c FROM favorites WHERE user_id=?').get(andiId).c);
console.log('Unread notif:', db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND is_read=0').get(andiId).c);
