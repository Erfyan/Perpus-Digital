**PRODUCT REQUIREMENTS DOCUMENT (PRD)**

*PERPUSTAKAAN DIGITAL SEKOLAH DASAR*

Versi: 1.0

Status: Ready for Development

Platform: Web Application

Konsep Pengembangan: Vibe Coding / AI-Assisted Development

Target Pengguna: Siswa SD, Petugas Perpustakaan, Administrator

![Referensi dashboard siswa](images/dashboard-siswa.jpeg)

*Gambar 1. Referensi utama tampilan dashboard siswa.*

# 1. Deskripsi Produk

Perpustakaan Digital SD adalah aplikasi web yang memungkinkan siswa sekolah dasar mencari, membaca, menyimpan progres, memfavoritkan, dan mengunduh buku digital sesuai hak akses. Sistem juga mendukung pengelolaan buku fisik, peminjaman, pengembalian, anggota, pengguna, dan aktivitas literasi.

## 1.1 Tujuan Produk

- Menyediakan pengalaman membaca digital yang sederhana dan ramah anak.
- Memudahkan siswa menemukan buku berdasarkan judul, penulis, kategori, atau kata kunci.
- Memungkinkan siswa membaca buku digital langsung di browser.
- Menyimpan posisi dan progres membaca secara otomatis.
- Menyediakan pengelolaan perpustakaan bagi petugas dan administrator.

# 2. Target Pengguna

| **Role** | **Tujuan** | **Hak Utama** |
| --- | --- | --- |
| Siswa | Membaca dan menemukan buku | Dashboard, katalog, reader, favorit, riwayat, peminjaman, download sesuai izin |
| Petugas | Operasional perpustakaan | Buku, kategori, siswa, peminjaman, pengembalian, buku digital |
| Admin | Mengelola sistem | Semua fitur, pengguna, hak akses, laporan, pengaturan, backup |

# 3. Konsep UI/UX

Dashboard harus mengikuti gambar referensi: cerah, ramah anak, menggunakan card rounded, ilustrasi siswa, icon yang jelas, typography mudah dibaca, whitespace cukup, dan navigasi sederhana.

- Warna pastel dan cerah.
- Card dengan sudut membulat dan shadow ringan.
- Tombol aksi jelas seperti Baca Sekarang dan Lanjutkan Membaca.
- Book cover menjadi elemen visual utama.
- Responsive untuk desktop, tablet, dan mobile.

# 4. Struktur Navigasi Siswa

```
PERPUSTAKAAN DIGITAL SD
├── Dashboard
├── Katalog Buku
├── Buku Favorit
├── Riwayat Membaca
├── Peminjaman Saya
├── Notifikasi
├── Profil Saya
├── Pengaturan
└── Keluar
```

# 5. Dashboard Siswa

## 5.1 Header

Header berisi search bar dengan placeholder: “Cari buku (judul, penulis, atau kategori)...”, notifikasi, serta profil siswa dan kelas.

## 5.2 Welcome Banner

Banner menampilkan sapaan seperti “Selamat datang, Andi Pratama!” dan slogan “Membaca buku membuka jendela dunia.” dengan ilustrasi anak dan perpustakaan.

## 5.3 Statistik

| **Card** | **Contoh** | **Sumber Data** |
| --- | --- | --- |
| Total Buku Digital | 120 buku | Jumlah digital_books aktif |
| Buku yang Sudah Dibaca | 12 buku | Buku digital unik yang pernah dibaca |
| Sedang Dibaca | 2 buku | Progress > 0 dan < 100% |
| Buku Favorit | 5 buku | Jumlah favorites milik siswa |

## 5.4 Rekomendasi Buku

Menampilkan book card dengan cover, judul, kategori, rating, dan tombol Baca Sekarang. MVP menggunakan rule-based recommendation berdasarkan kategori yang sering dibaca, buku populer, rating tinggi, dan buku terbaru.

## 5.5 Sedang Dibaca

Menampilkan cover, judul, halaman terakhir, progress bar, tombol Lanjutkan Membaca, dan Detail Buku.

## 5.6 Kategori Buku

Kategori awal: Pelajaran, Cerita, Dongeng, Sains, Komik Edukasi, Agama, Sejarah, Kesehatan, Pengetahuan Umum, dan Inspirasi.

## 5.7 Buku Terbaru

Menampilkan buku yang baru ditambahkan dengan sorting created_at DESC.

## 5.8 Riwayat Membaca

Menampilkan cover, judul, tanggal terakhir membaca, dan progress.

# 6. Katalog Buku

- Search berdasarkan judul, penulis, kategori, kode buku, atau kata kunci.
- Filter kategori.
- Filter kelas.
- Filter jenis buku: fisik/digital.
- Sorting.
- Pagination.
- Detail buku.

# 7. Detail Buku

```
Cover
Judul
Kategori
Penulis
Penerbit
Tahun Terbit
Rating
Deskripsi

[ Favorit ] [ Baca Sekarang ] [ Download ]
```

Tombol Download hanya boleh tersedia apabila can_download = true.

# 8. Pembaca Buku Digital

- Siswa dapat membaca PDF langsung di browser.
- Next/previous page.
- Nomor halaman.
- Zoom.
- Fullscreen.
- Progress membaca.
- Resume reading.
- Penyimpanan halaman terakhir.
- Progress dihitung dengan: progress_percentage = (last_page / total_pages) × 100.

# 9. Download Buku

Buku digital memiliki dua kontrol: can_read dan can_download. Backend wajib melakukan authorization; menyembunyikan tombol di frontend saja tidak cukup.

```
GET /api/digital-books/:id/read
GET /api/digital-books/:id/download
```

# 10. Favorit dan Riwayat

Siswa dapat menambah/menghapus favorit. Riwayat membaca mencatat buku, halaman terakhir, progress, waktu mulai, waktu terakhir membaca, dan status selesai.

# 11. Peminjaman Buku Fisik

- Melihat buku yang sedang dipinjam.
- Tanggal pinjam.
- Tanggal jatuh tempo.
- Status dipinjam/dikembalikan/terlambat.
- Petugas memproses peminjaman dan pengembalian.

# 12. Notifikasi

- Buku baru tersedia.
- Pengingat jatuh tempo.
- Buku yang ditunggu tersedia.
- Pemberitahuan buku selesai dibaca.

# 13. Dashboard Admin dan Petugas

Admin memiliki dashboard operasional dengan statistik total buku, buku digital, siswa, peminjaman, buku sedang dipinjam, dan aktivitas membaca. Petugas fokus pada operasional koleksi dan transaksi.

```
Admin:
Dashboard
Data Pengguna
Data Siswa
Data Petugas
Katalog Buku
Kategori
Buku Digital
Peminjaman
Pengembalian
Riwayat Membaca
Laporan
Pengaturan
Backup
```

# 14. Database

| **Tabel** | **Fungsi** |
| --- | --- |
| users | Akun dan role pengguna |
| students | Profil siswa |
| categories | Kategori buku |
| books | Metadata buku |
| digital_books | File dan hak akses buku digital |
| favorites | Daftar favorit siswa |
| reading_progress | Posisi dan progress membaca |
| reading_history | Riwayat membaca |
| loans | Transaksi peminjaman |
| loan_details | Detail buku dalam transaksi |
| notifications | Notifikasi pengguna |

## 14.1 Field Utama

```
users:
id, username, password_hash, role, is_active, created_at, updated_at

books:
id, code, isbn, title, author, publisher, publication_year,
category_id, description, cover_path, book_type, stock,
available_stock, rating, is_active, created_at, updated_at

digital_books:
id, book_id, file_name, file_path, file_size, file_type,
total_pages, can_read, can_download, uploaded_by,
created_at, updated_at

reading_progress:
id, user_id, digital_book_id, last_page, total_pages,
progress_percentage, last_read_at, completed

favorites:
id, user_id, book_id, created_at
```

# 15. API

| **Area** | **Endpoint** |
| --- | --- |
| Auth | POST /api/auth/login |
| Auth | POST /api/auth/logout |
| Auth | GET /api/auth/me |
| Dashboard | GET /api/dashboard |
| Books | GET /api/books |
| Books | GET /api/books/:id |
| Books | POST /api/books |
| Books | PUT /api/books/:id |
| Books | DELETE /api/books/:id |
| Digital | GET /api/digital-books |
| Digital | POST /api/digital-books |
| Reader | GET /api/digital-books/:id/read |
| Download | GET /api/digital-books/:id/download |
| Progress | GET /api/reading-progress/:bookId |
| Progress | PUT /api/reading-progress/:bookId |
| History | GET /api/reading-history |
| Favorites | GET/POST/DELETE /api/favorites |
| Loans | GET /api/loans |
| Loans | POST /api/loans |
| Loans | PUT /api/loans/:id/return |

# 16. Teknologi

| **Komponen** | **Teknologi** |
| --- | --- |
| Frontend | React + Vite + Tailwind CSS |
| Routing | React Router |
| HTTP Client | Axios |
| Icons | Lucide React |
| Backend | Node.js + Express.js |
| Database | SQLite |
| Authentication | Session-based atau JWT |
| Testing | Vitest + React Testing Library + Supertest |
| Version Control | Git |

# 17. Struktur Project

```
perpustakaan-digital-sd/
├── frontend/
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── features/
│       ├── services/
│       ├── hooks/
│       └── utils/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── database/
│   └── validators/
├── storage/
│   ├── books/
│   ├── covers/
│   └── avatars/
├── tests/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── API.md
├── .env.example
├── .gitignore
└── README.md
```

# 18. Business Rules

- Siswa hanya dapat melihat data favorit, riwayat, progress, dan peminjaman miliknya sendiri.
- Siswa hanya dapat membaca jika can_read = true.
- Siswa hanya dapat download jika can_download = true.
- Progress harus terkait dengan user yang sedang login.
- Buku selesai jika progress_percentage = 100 dan completed = true.
- Buku fisik tidak dapat dipinjam jika available_stock = 0.
- NIS harus unik.
- Username harus unik.
- File digital MVP hanya PDF.
- File digital yang dilindungi tidak boleh dapat diakses langsung tanpa authorization.

# 19. Security Requirements

- Password hashing.
- Authentication dan authorization.
- Protected routes.
- Input validation.
- Validasi tipe dan ukuran file.
- Sanitasi filename.
- Path traversal protection.
- Protected PDF endpoint.
- Rate limiting login.
- Secure session/cookie.
- Audit log untuk aktivitas penting.

# 20. Testing

| **Area** | **Test Minimal** |
| --- | --- |
| Authentication | Login berhasil/gagal, password salah, user nonaktif, logout |
| Dashboard | Data statistik, rekomendasi, terbaru, progress, history |
| Reader | Open, next, previous, save progress, resume, complete |
| Download | Allowed berhasil, denied ditolak |
| Favorites | Add/remove dan uniqueness |
| Loans | Create loan, return, stock, overdue |

# 21. Acceptance Criteria

- Siswa berhasil login dan diarahkan ke dashboard.
- Nama dan kelas siswa tampil dengan benar.
- Search dapat mencari judul, penulis, dan kategori.
- Empat statistik dashboard tampil sesuai database.
- Buku rekomendasi tampil.
- Buku terbaru tampil.
- Kategori tampil.
- Buku yang sedang dibaca tampil.
- Progress membaca tampil benar.
- Lanjutkan Membaca membuka halaman terakhir.
- Favorit dapat ditambah dan dihapus.
- Riwayat membaca tampil.
- Buku digital dapat dibaca jika can_read = true.
- Download hanya berhasil jika can_download = true.
- Backend tetap melakukan authorization terhadap file.

# 22. Non-Functional Requirements

| **Aspek** | **Target** |
| --- | --- |
| Performance | Initial load target < 3 detik pada lingkungan normal |
| Usability | Siswa kelas 4 SD dapat login, mencari, dan membaca tanpa tutorial panjang |
| Responsive | Desktop, laptop, tablet, mobile |
| Accessibility | Kontras memadai, tombol cukup besar, icon + text, alt text, keyboard navigation |

# 23. Copyright

Admin hanya boleh mengunggah buku milik sekolah, buku berlisensi, public domain, atau buku yang telah memperoleh izin pemegang hak cipta. Sistem tidak boleh digunakan untuk mendistribusikan materi berhak cipta tanpa izin.

# 24. Seed Data

- 1 Admin.
- 1 Petugas.
- 10 Siswa.
- 10–20 Buku.
- 10 Kategori.
- 10 Buku Digital untuk testing.

Contoh akun siswa: Andi Pratama, Kelas 4A.

# 25. Roadmap Development

1. Project setup: React, Vite, Tailwind, Express, SQLite.
2. Database schema dan migration/seed.
3. Authentication dan role authorization.
4. Dashboard siswa sesuai desain referensi.
5. Katalog, search, filter, dan detail buku.
6. PDF reader, progress, dan resume reading.
7. Favorites dan reading history.
8. Peminjaman/pengembalian buku fisik.
9. Dashboard admin/petugas dan CRUD.
10. Testing, security review, refactor, dokumentasi, dan deployment.

# 26. Aturan Codex / Vibe Coding

- Baca docs/PRD.md sebelum mengimplementasikan fitur.
- Jangan membuat fitur di luar PRD tanpa persetujuan.
- Jangan mengubah business rule tanpa persetujuan.
- Implementasikan secara bertahap.
- Setiap feature harus melalui Feature → Test → Run → Review → Fix → Refactor → Commit.
- Jangan melakukan perubahan acak ketika terjadi error; cari root cause terlebih dahulu.
- Jangan menghapus fitur yang sudah bekerja hanya untuk memperbaiki fitur lain.
- UI harus mengikuti desain dashboard yang diberikan sebagai design reference.

# 27. Traceability

```
Requirement
    ↓
Feature
    ↓
Business Rule
    ↓
Database
    ↓
API
    ↓
UI
    ↓
Test Case
```

# 28. MVP User Flow

```
LOGIN
  ↓
DASHBOARD
  ↓
Cari Buku
  ↓
Pilih Buku
  ↓
Detail Buku
  ↓
Baca Sekarang
  ↓
PDF Reader
  ↓
Baca
  ↓
Progress Tersimpan
  ↓
Keluar
  ↓
Login Kembali
  ↓
Lanjutkan Membaca
  ↓
Halaman Terakhir
```

# 29. Prioritas Fitur

| **Prioritas** | **Fitur** |
| --- | --- |
| MUST HAVE | Login, Dashboard, Katalog, Search, Detail, Digital Book, PDF Reader, Progress, Resume, Favorites, History, Download Authorization, Admin CRUD |
| SHOULD HAVE | Notifikasi, Peminjaman, Pengembalian, Statistik, Backup |
| COULD HAVE | Rating, komentar, smart recommendation, gamifikasi, badge, leaderboard |
| NOT NOW | AI recommendation, chatbot, social network, video learning, marketplace, payment |

# 30. Definition of Done

```
Requirement
→ UI
→ Frontend
→ Backend
→ Database
→ Validation
→ Authorization
→ Security
→ Testing
→ PASS
→ Code Review
→ Refactor
→ Documentation
→ Git Commit
```

# 31. Tujuan Akhir MVP

Produk akhir harus memastikan siswa dapat menemukan buku, membaca buku digital, menyimpan progress, keluar dari aplikasi, kemudian kembali dan melanjutkan membaca dari halaman terakhir. Dengan demikian aplikasi berfungsi sebagai platform membaca digital sekolah dasar, bukan sekadar sistem administrasi perpustakaan.