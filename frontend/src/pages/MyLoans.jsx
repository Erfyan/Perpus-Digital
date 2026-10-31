import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import BookCover from '../components/BookCover';
import {
  BookmarkCheck,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  User,
  Users,
  Search,
  BookOpen
} from 'lucide-react';

export default function MyLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'mine'
  const [search, setSearch] = useState('');

  const fetchLoans = () => {
    setLoading(true);
    const params = {};
    if (filterMode === 'mine') params.only_mine = 'true';
    if (search.trim()) params.search = search.trim();

    api
      .get('/loans', { params })
      .then((r) => setLoans(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLoans();
  }, [filterMode]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLoans();
  };

  const getStatusBadge = (status, dueDate) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'dipinjam';
    if (status === 'dikembalikan') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" /> Dikembalikan
        </span>
      );
    }
    if (isOverdue || status === 'terlambat') {
      return (
        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
          <AlertCircle className="w-3.5 h-3.5" /> Terlambat
        </span>
      );
    }
    return (
      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
        <Clock className="w-3.5 h-3.5" /> Sedang Dipinjam
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 rounded-3xl p-6 sm:p-7 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider backdrop-blur-xs mb-2">
            <Users className="w-3.5 h-3.5" /> Sirkulasi Buku Fisik
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            Daftar Peminjam
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Daftar seluruh siswa yang sedang atau pernah meminjam buku fisik perpustakaan sekolah, lengkap dengan nama peminjam dan status buku.
          </p>
        </div>
        <div className="bg-white/20 px-4 py-2.5 rounded-2xl font-black text-sm backdrop-blur-xs self-start sm:self-auto">
          {loans.length} Peminjaman
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tab Filter */}
        <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-xs flex gap-1">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Semua Peminjam
          </button>
          <button
            onClick={() => setFilterMode('mine')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterMode === 'mine'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Peminjaman Saya
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama peminjam / judul..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
          />
        </form>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-bold text-sm">
          Memuat daftar peminjam...
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto">
          <div className="text-5xl mb-3">📚✨</div>
          <h4 className="text-base font-bold text-slate-700">Tidak ada data peminjaman</h4>
          <p className="text-xs text-slate-400 mt-1">
            {filterMode === 'mine'
              ? 'Kamu belum memiliki catatan peminjaman buku fisik.'
              : 'Belum ada transaksi peminjaman buku tercatat di perpustakaan.'}
          </p>
          <Link
            to="/catalog"
            className="mt-4 inline-block bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Jelajahi Katalog Buku
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((item) => {
            const isMine = user && Number(item.user_id) === Number(user.id);
            const borrower = item.borrower_name || item.full_name || item.username || 'Siswa';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md transition-all ${
                  isMine ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-14 sm:w-16 shrink-0">
                    <BookCover title={item.book_title || 'Buku Fisik'} category={item.category_name} />
                  </div>
                  <div>
                    {/* Header Peminjam & Kode */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                        👦 {borrower}
                      </span>
                      {item.class_name && (
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                          {item.class_name}
                        </span>
                      )}
                      {isMine && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Pinjaman Saya
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        #{item.loan_code}
                      </span>
                    </div>

                    {/* Judul Buku */}
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                      {item.book_title || 'Buku Perpustakaan'}
                    </h3>

                    {/* Meta Informasi */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        Pinjam: <strong>{item.loan_date}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Jatuh Tempo: <strong>{item.due_date}</strong>
                      </span>
                      {item.return_date && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Kembali: {item.return_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  {getStatusBadge(item.status, item.due_date)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
