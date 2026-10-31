import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import BookCover from '../components/BookCover';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Heart,
  Star,
  Award,
  Compass,
  ArrowRight,
  GraduationCap,
  Sparkles,
  FlaskConical,
  Smile,
  Landmark,
  Lightbulb,
  HeartPulse,
  Church,
  Library,
  BookmarkCheck
} from 'lucide-react';

export default function Dashboard() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/student')
      .then((r) => {
        setData(r.data);
      })
      .catch((err) => {
        console.error('Gagal mengambil data dashboard:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Menyiapkan perpustakaan untukmu...</p>
        </div>
      </div>
    );
  }

  // Map category visual icons and theme colors
  const getCategoryTheme = (name) => {
    switch (name) {
      case 'Pelajaran':
        return { icon: GraduationCap, bg: 'bg-blue-50 text-blue-600 border-blue-100' };
      case 'Cerita':
        return { icon: BookOpen, bg: 'bg-rose-50 text-rose-600 border-rose-100' };
      case 'Dongeng':
        return { icon: Sparkles, bg: 'bg-amber-50 text-amber-600 border-amber-100' };
      case 'Sains':
        return { icon: FlaskConical, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'Komik Edukasi':
        return { icon: Smile, bg: 'bg-purple-50 text-purple-600 border-purple-100' };
      case 'Agama':
        return { icon: Church, bg: 'bg-orange-50 text-orange-600 border-orange-100' };
      case 'Pengetahuan Umum':
        return { icon: Lightbulb, bg: 'bg-cyan-50 text-cyan-600 border-cyan-100' };
      case 'Sejarah':
        return { icon: Landmark, bg: 'bg-red-50 text-red-600 border-red-100' };
      case 'Kesehatan':
        return { icon: HeartPulse, bg: 'bg-teal-50 text-teal-600 border-teal-100' };
      case 'Inspirasi':
      default:
        return { icon: Star, bg: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    }
  };

  const currentlyReadingList = data.currentlyReading || [];
  const primaryRead = currentlyReadingList[0];

  return (
    <div className="space-y-6">
      {/* 1. WELCOME BANNER (SESUAI GAMBAR REFERENSI & PRD 5.2) */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#D7EEFF] via-[#E6F3FF] to-[#CDE7FF] border border-[#BBDDFF] p-6 sm:p-8 overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-black text-[#153B68] tracking-tight">
            Selamat datang, <br className="sm:hidden" />
            <span>{student?.full_name || 'Andi Pratama'}! 👋</span>
          </h2>
          <p className="text-sm sm:text-base font-bold text-[#1E5697] mt-1.5 italic">
            “Membaca buku membuka jendela dunia.”
          </p>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Yuk, jelajahi koleksi buku menarik di perpustakaan digital kita!
          </p>
        </div>

        {/* Decorative Library Building & Reading Mascot */}
        <div className="absolute right-2 sm:right-6 bottom-0 sm:bottom-1 flex items-end pointer-events-none select-none opacity-85 sm:opacity-100">
          <div className="hidden md:flex flex-col items-center mr-4 mb-2">
            <div className="w-48 bg-amber-100/90 border-2 border-amber-300 rounded-2xl p-2.5 text-center shadow-md relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                PERPUSTAKAAN DIGITAL SD
              </div>
              <div className="text-2xl mt-1">🏫📚</div>
            </div>
          </div>
          <div className="text-6xl sm:text-8xl filter drop-shadow-md transform -translate-y-1">
            👦📖👧
          </div>
        </div>

        {/* Soft background accents */}
        <div className="absolute top-2 right-1/3 w-20 h-10 bg-white/40 rounded-full blur-xs pointer-events-none" />
        <div className="absolute bottom-2 left-1/2 w-32 h-14 bg-white/30 rounded-full blur-xs pointer-events-none" />
      </div>

      {/* 2. STATISTIK 4 CARD (NILAI MURNI DARI DATABASE SQLITE, BUKAN HARDCODE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Buku Digital */}
        <div className="bg-[#EBF5FF] border border-[#D5E9FF] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1E74FD] text-white flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Buku Digital</p>
              <h3 className="text-2xl font-black text-slate-800 leading-tight">
                {Number(data.stats?.totalDigital || 0)} <span className="text-xs font-medium text-slate-500">buku</span>
              </h3>
            </div>
          </div>
          <Library className="w-8 h-8 text-blue-300/40 hidden sm:block" />
        </div>

        {/* Card 2: Buku yang Sudah Dibaca */}
        <div className="bg-[#EDFBF2] border border-[#CEF3DB] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#12B76A] text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Buku yang Sudah Dibaca</p>
              <h3 className="text-2xl font-black text-slate-800 leading-tight">
                {Number(data.stats?.completed || 0)} <span className="text-xs font-medium text-slate-500">buku</span>
              </h3>
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-300/40 hidden sm:block" />
        </div>

        {/* Card 3: Sedang Dibaca */}
        <div className="bg-[#FFF8EC] border border-[#FFE7BE] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F79009] text-white flex items-center justify-center shadow-md shadow-amber-200 shrink-0">
              <Clock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Sedang Dibaca</p>
              <h3 className="text-2xl font-black text-slate-800 leading-tight">
                {Number(data.stats?.inProgress || 0)} <span className="text-xs font-medium text-slate-500">buku</span>
              </h3>
            </div>
          </div>
          <BookOpen className="w-8 h-8 text-amber-300/40 hidden sm:block" />
        </div>

        {/* Card 4: Buku Favorit */}
        <div className="bg-[#F9F5FF] border border-[#E9D7FE] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#9E77ED] text-white flex items-center justify-center shadow-md shadow-purple-200 shrink-0">
              <Heart className="w-6 h-6 stroke-[2.2] fill-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Buku Favorit</p>
              <h3 className="text-2xl font-black text-slate-800 leading-tight">
                {Number(data.stats?.favorites || 0)} <span className="text-xs font-medium text-slate-500">buku</span>
              </h3>
            </div>
          </div>
          <Heart className="w-8 h-8 text-purple-300/40 hidden sm:block" />
        </div>
      </div>

      {/* 2.5 MOBILE NATIVE: "LANJUTKAN MEMBACA" QUICK ACCESS CARD (< lg) */}
      {primaryRead && (
        <div className="lg:hidden bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 rounded-3xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Lanjutkan Membaca Buku</span>
            </div>
            <span className="text-[10px] font-black bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-white">
              {Math.round(primaryRead.progress_percentage || 0)}%
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-14 sm:w-16 shadow-md rounded-xl overflow-hidden shrink-0">
              <BookCover title={primaryRead.title} category={primaryRead.category_name} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-sm text-white truncate">
                {primaryRead.title}
              </h4>
              <p className="text-[11px] text-blue-100 mt-0.5">
                Halaman {primaryRead.last_page} dari {primaryRead.total_pages}
              </p>

              {/* Progress bar */}
              <div className="w-full bg-blue-950/40 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(primaryRead.progress_percentage || 0)}%` }}
                />
              </div>
            </div>

            <Link
              to={`/read/${primaryRead.book_id}`}
              className="bg-white text-blue-700 hover:bg-blue-50 font-black text-xs px-3.5 py-2.5 rounded-2xl shadow-sm shrink-0 flex items-center gap-1 transition-all active:scale-95"
            >
              Baca
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. GRID 2 KOLOM (KIRI: REKOMENDASI & TERBARU | KANAN: SEDANG DIBACA, KATEGORI, RIWAYAT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI (LEBAR) */}
        <div className="lg:col-span-8 space-y-6">
          {/* A. REKOMENDASI BUKU UNTUK KAMU (RULE-BASED) */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">
                    Rekomendasi Buku untuk Kamu
                  </h3>
                  <p className="text-[11px] text-slate-400 sm:hidden">Geser untuk melihat buku lainnya 👉</p>
                </div>
              </div>
              <Link
                to="/catalog?filter=rekomendasi"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group shrink-0"
              >
                Lihat Semua
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Mobile Horizontal Snap Scroller / Responsive Grid */}
            <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-5 gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 -mx-1 px-1">
              {(data.recommendations || []).slice(0, 5).map((book) => (
                <div
                  key={book.id}
                  className="min-w-[145px] w-[145px] sm:min-w-0 sm:w-auto snap-start shrink-0 sm:shrink bg-white rounded-2xl border border-slate-100 p-2.5 flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <BookCover title={book.title} category={book.category_name} />
                  <div className="mt-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors"
                        title={book.title}
                      >
                        {book.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{book.category_name}</p>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 mb-2">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                        <span>{book.rating ? Number(book.rating).toFixed(1) : '4.8'}</span>
                      </div>

                      <Link
                        to={`/read/${book.id}`}
                        className="w-full bg-[#1E74FD] hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 rounded-xl text-center block shadow-xs transition-colors"
                      >
                        Baca Sekarang
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* B. BUKU TERBARU (CREATED_AT DESC) */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Buku Terbaru</h3>
                  <p className="text-[11px] text-slate-400 sm:hidden">Geser untuk melihat buku terbaru 👉</p>
                </div>
              </div>
              <Link
                to="/catalog?sort=newest"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group shrink-0"
              >
                Lihat Semua
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Mobile Horizontal Snap Scroller / Responsive Grid */}
            <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-5 gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 -mx-1 px-1">
              {(data.newBooks || []).slice(0, 5).map((book) => (
                <div
                  key={book.id}
                  className="min-w-[145px] w-[145px] sm:min-w-0 sm:w-auto snap-start shrink-0 sm:shrink bg-white rounded-2xl border border-slate-100 p-2.5 flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <BookCover title={book.title} category={book.category_name} />
                  <div className="mt-2.5">
                    <h4
                      className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors"
                      title={book.title}
                    >
                      {book.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{book.category_name}</p>
                    <Link
                      to={`/books/${book.id}`}
                      className="mt-2 text-[11px] font-bold text-blue-600 hover:underline block"
                    >
                      Lihat Buku →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* C. DAFTAR PEMINJAM (SELURUH PEMINJAMAN DENGAN NAMA PEMINJAM) */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookmarkCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Daftar Peminjam</h3>
                  <p className="text-[11px] text-slate-400">Aktivitas peminjaman buku fisik perpustakaan oleh siswa</p>
                </div>
              </div>
              <Link
                to="/my-loans"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                Lihat Semua
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {(!data.recentBorrowers || data.recentBorrowers.length === 0) ? (
              <div className="py-8 text-center text-slate-400 text-xs font-bold">
                Belum ada transaksi peminjaman buku saat ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.recentBorrowers.slice(0, 4).map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                        👦
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-extrabold text-xs text-slate-800 truncate">
                            {loan.borrower_name || loan.username}
                          </p>
                          {loan.class_name && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                              {loan.class_name}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                          📖 {loan.book_title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Jatuh Tempo: {loan.due_date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                        loan.status === 'dikembalikan'
                          ? 'bg-emerald-100 text-emerald-800'
                          : loan.status === 'terlambat'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {loan.status === 'dikembalikan'
                        ? 'Kembali'
                        : loan.status === 'terlambat'
                        ? 'Terlambat'
                        : 'Dipinjam'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* KOLOM KANAN (SEDANG DIBACA, KATEGORI, RIWAYAT) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. SEDANG DIBACA */}
          <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-sm text-slate-800">Sedang Dibaca</h3>
              </div>
              <Link
                to="/history"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
              >
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {primaryRead ? (
              <div>
                <div className="flex gap-3.5 items-center">
                  <div className="w-20 shrink-0">
                    <BookCover title={primaryRead.title} category={primaryRead.category_name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">
                      {primaryRead.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      Halaman terakhir: {primaryRead.last_page} / {primaryRead.total_pages}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                        <span>Progress</span>
                        <span className="text-emerald-600">
                          {Math.round(primaryRead.progress_percentage || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(primaryRead.progress_percentage || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-50">
                  <Link
                    to={`/read/${primaryRead.book_id}`}
                    className="bg-[#1E74FD] hover:bg-blue-700 text-white font-bold text-xs py-2 px-2 rounded-xl text-center shadow-xs transition-colors"
                  >
                    Lanjutkan Membaca
                  </Link>
                  <Link
                    to={`/books/${primaryRead.book_id}`}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs py-2 px-2 rounded-xl text-center transition-colors"
                  >
                    Detail Buku
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs font-bold">
                Belum ada buku yang sedang dibaca.
              </div>
            )}
          </section>

          {/* 2. KATEGORI BUKU (DARI DATABASE) */}
          <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-800">Kategori Buku</h3>
              </div>
              <Link
                to="/catalog"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
              >
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(data.categories || []).map((cat) => {
                const theme = getCategoryTheme(cat.name);
                const Icon = theme.icon;
                return (
                  <button
                    key={cat.id || cat.name}
                    onClick={() => navigate(`/catalog?category=${encodeURIComponent(cat.name)}`)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left font-bold text-xs transition-all hover:scale-[1.02] ${theme.bg}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. RIWAYAT MEMBACA (DARI DATABASE) */}
          <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <h3 className="font-extrabold text-sm text-slate-800">Riwayat Membaca</h3>
              </div>
              <Link
                to="/history"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
              >
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {(data.history && data.history.length > 0) ? (
                data.history.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 shrink-0">
                      <BookCover title={item.title} className="!p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h5 className="text-xs font-bold text-slate-800 truncate" title={item.title}>
                          {item.title}
                        </h5>
                        <span className="text-[10px] font-bold text-emerald-600 shrink-0 ml-1">
                          {Math.round(item.progress_percentage || 0)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.last_read_at ? item.last_read_at.split('T')[0] : 'Baru saja'}
                      </p>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${Math.round(item.progress_percentage || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs font-semibold">
                  Belum ada riwayat membaca.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
