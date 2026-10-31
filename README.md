# Perpustakaan Digital Sekolah Dasar (SD)

Aplikasi Web Perpustakaan Digital ramah anak (*child-friendly*) untuk siswa Sekolah Dasar, dirancang khusus dengan UI/UX bertema pastel ceria, dilengkapi pembaca PDF digital, pelacak progress baca otomatis, katalog pintar, serta panel operasional petugas perpustakaan dan administrator.

---

## 🎨 Panel Siswa (Sesuai Desain Referensi)
- **Header & Search**: Input pencarian ramah anak, notifikasi dengan indikator unread, dan profil siswa (Andi Pratama - Kelas 4A).
- **Welcome Hero Banner**: Sapaan ramah dengan ilustrasi gedung perpustakaan sekolah dan siswa membaca.
- **4 Statistik Interaktif**:
  - Total Buku Digital (120 buku)
  - Buku yang Sudah Dibaca (12 buku)
  - Sedang Dibaca (2 buku)
  - Buku Favorit (5 buku)
- **Rekomendasi Buku untuk Kamu**: Koleksi buku pilihan (*Dongeng Nusantara, Sains di Sekitarku, Matematika Menyenangkan, Ayo Jaga Lingkungan, Komik Pahlawan Indonesia*) lengkap dengan cover warna-warni, rating bintang, dan tombol *"Baca Sekarang"*.
- **Sedang Dibaca**: Kartu interaktif *Matematika Kelas 4 SD* dengan progress bar 40% (Halaman 48 / 120), tombol *"Lanjutkan Membaca"* dan *"Detail Buku"*.
- **Kategori Buku**: Grid 2-kolom warna-warni (*Pelajaran, Cerita, Dongeng, Sains, Komik Edukasi, Agama, Pengetahuan Umum, Sejarah, Kesehatan, Inspirasi*).
- **Riwayat Membaca**: Daftar buku terakhir yang dibaca beserta persentase kelulusan membaca.
- **Peminjaman Saya**: Pantau status buku fisik yang sedang dipinjam siswa dan tanggal jatuh tempo.

---

## 👩‍💼 Panel Petugas Perpustakaan (Librarian) — PRD Bagian 2
Panel operasional terisolasi khusus Petugas Perpustakaan dengan hak akses:
1. **Dashboard Operasional**: Ringkasan statistik koleksi, peminjaman aktif, peminjaman terlambat (*overdue*), dan transaksi terkini.
2. **Katalog Buku**: Tambah, ubah, dan nonaktifkan buku fisik dengan validasi ketat (stok dan stok tersedia tidak boleh negatif).
3. **Kategori**: Kelola klasifikasi buku, tema warna, ikon, dan slug unik.
4. **Data Siswa**: Tambah dan ubah data siswa/anggota dengan validasi keunikan NIS dan Username.
5. **Buku Digital (PDF)**: Unggah file PDF dengan validasi format dokumen (.pdf), batas ukuran (50 MB), proteksi path traversal, serta konfigurasi izin baca online (`can_read`) dan unduh (`can_download`).
6. **Peminjaman**: Proses peminjaman buku fisik dengan auto-penurunan stok dan proteksi tolak pinjam jika stok habis (`available_stock = 0`).
7. **Pengembalian**: Proses pengembalian cepat dengan auto-pemulihan stok buku (+1) dan auto-deteksi keterlambatan jatuh tempo.

> **Catatan Keamanan**: Petugas **dilarang mengakses** menu khusus Admin (*Data Pengguna, Data Petugas, Pengaturan Sistem, Backup Database, Laporan Admin*). Akses API langsung ke endpoint admin akan ditolak dengan **HTTP 403 Forbidden**.

---

## 🚀 Tech Stack
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Lucide Icons + React Router v7 + Axios
- **Backend**: Node.js + Express.js
- **Database**: SQLite (`better-sqlite3`) — ringan, tanpa perlu install server database eksternal
- **Authentication**: JWT (JSON Web Token) dengan otorisasi Role-Based (`siswa`, `petugas`, `admin`)
- **Digital Reader**: Interactive in-browser reader dengan autosave progress & resume reading

---

## 🔑 Akun Uji Coba Siap Pakai

Pada halaman login terdapat tombol **Pilih Cepat Akun Uji Coba**:

| Role | Username | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Petugas** | `petugas` | `petugas123` | Petugas Perpustakaan (Hak: Buku, Kategori, Siswa, Digital, Pinjam, Kembali) |
| **Siswa** | `andi` | `siswa123` | Andi Pratama (Kelas 4A) |
| **Admin** | `admin` | `admin123` | Administrator Sistem (Akses penuh + Backup, Pengaturan, Laporan) |

---

## 💻 Panduan Menjalankan Aplikasi

### 1. Jalankan Backend (API & SQLite)
Buka terminal baru di folder backend:
```bash
cd backend
npm install
npm run seed     # Mengisi data awal SQLite & akun uji coba
npm start        # Berjalan di http://localhost:5000
```

### 2. Jalankan Frontend (React + Vite)
Buka terminal baru di folder frontend:
```bash
cd frontend
npm install
npm run dev      # Berjalan di http://localhost:5173
```

Buka browser dan akses **`http://localhost:5173`**.
