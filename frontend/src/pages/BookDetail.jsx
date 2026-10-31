import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import BookCover from '../components/BookCover';
import {
  Heart,
  BookOpen,
  Download,
  ArrowLeft,
  Star,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  Bookmark
} from 'lucide-react';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloadMsg, setDownloadMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/books/${id}`)
      .then((r) => {
        setBook(r.data.data);
      })
      .catch(console.error);

    // Check if favorited
    api
      .get('/favorites')
      .then((r) => {
        const found = (r.data.data || []).some((f) => f.book_id === Number(id));
        setIsFav(found);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFav) {
        await api.delete(`/favorites/${id}`);
        setIsFav(false);
      } else {
        await api.post('/favorites', { book_id: Number(id) });
        setIsFav(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async () => {
    if (!book?.digital?.id) return;
    try {
      setDownloadMsg('Memulai pengunduhan...');
      const response = await api.get(`/digital-books/${book.digital.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${book.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadMsg('Buku berhasil diunduh!');
      setTimeout(() => setDownloadMsg(''), 4000);
    } catch (err) {
      setDownloadMsg('Gagal mengunduh: ' + (err.response?.data?.message || 'Akses ditolak'));
      setTimeout(() => setDownloadMsg(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 font-bold">
        Memuat detail buku...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-lg mx-auto">
        <h3 className="font-bold text-slate-800 text-lg">Buku tidak ditemukan</h3>
        <Link to="/catalog" className="text-blue-600 text-sm font-bold mt-2 inline-block">
          ← Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const digital = book.digital;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-0">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-100 shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      {/* Main Detail Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-8">
        {/* Cover Column */}
        <div className="w-full md:w-64 shrink-0 flex flex-col items-center">
          <div className="w-48 sm:w-56 shadow-lg rounded-2xl overflow-hidden transform hover:scale-[1.02] transition-transform">
            <BookCover title={book.title} category={book.category_name} />
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-amber-500 font-extrabold text-sm">
            <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
            <span>{book.rating ? Number(book.rating).toFixed(1) : '4.8'}</span>
            <span className="text-slate-400 text-xs font-normal">/ 5.0</span>
          </div>

          <span className="mt-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-slate-100 rounded-full text-slate-600">
            Tipe: {book.book_type}
          </span>
        </div>

        {/* Info Column */}
        <div className="flex-1 space-y-5">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {book.category_name || 'Kategori Umum'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2 tracking-tight">
              {book.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Kode Buku: {book.code || 'BK-SD'}</p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {digital?.can_read ? (
              <Link
                to={`/read/${id}`}
                className="bg-[#1E74FD] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md shadow-blue-200 transition-all hover:scale-[1.02]"
              >
                <BookOpen className="w-4 h-4" />
                Baca Sekarang
              </Link>
            ) : null}

            <button
              onClick={toggleFavorite}
              className={`font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2 border transition-all ${
                isFav
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              {isFav ? 'Tersimpan di Favorit' : 'Tambah Favorit'}
            </button>

            {digital?.can_download ? (
              <button
                onClick={handleDownload}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            ) : null}
          </div>

          {downloadMsg && (
            <p className="text-xs font-bold text-blue-600 bg-blue-50 p-2 rounded-xl animate-fade-in">
              {downloadMsg}
            </p>
          )}

          {/* Meta Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Penulis
              </p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">{book.author || '-'}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Penerbit
              </p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">{book.publisher || '-'}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Tahun Terbit
              </p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">{book.publication_year || '-'}</p>
            </div>
            {book.book_type !== 'digital' && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5" /> Stok Fisik
                </p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {book.available_stock} / {book.stock} tersedia
                </p>
              </div>
            )}
            {digital && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Hak Akses
                </p>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">
                  {digital.can_download ? 'Baca & Unduh' : 'Hanya Baca Online'}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 mb-1.5">Sinopsis / Deskripsi</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {book.description ||
                'Buku edukasi menarik untuk siswa Sekolah Dasar, disusun dengan bahasa yang sederhana, ceria, dan penuh wawasan baru untuk menumbuhkan minat literasi anak.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Floating Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-slate-100 shadow-xl z-40 md:hidden flex items-center justify-between gap-2.5">
        <button
          onClick={toggleFavorite}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all shrink-0 ${
            isFav
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
          title={isFav ? 'Hapus dari favorit' : 'Tambah favorit'}
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {digital?.can_download && (
          <button
            onClick={handleDownload}
            className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>
        )}

        {digital?.can_read ? (
          <Link
            to={`/read/${id}`}
            className="flex-1 bg-[#1E74FD] hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-200"
          >
            <BookOpen className="w-4 h-4" />
            Baca Sekarang
          </Link>
        ) : (
          <span className="flex-1 bg-amber-50 text-amber-700 font-extrabold text-xs py-3 px-4 rounded-2xl text-center border border-amber-200">
            Koleksi Buku Fisik
          </span>
        )}
      </div>
    </div>
  );
}
