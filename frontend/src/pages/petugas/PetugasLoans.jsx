import { useEffect, useState } from 'react';
import api from '../../lib/api';
import BookCover from '../../components/BookCover';
import {
  Repeat,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export default function PetugasLoans() {
  const [loans, setLoans] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [bookId, setBookId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadLoans = (page = pagination.page) => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (statusFilter && statusFilter !== 'semua') params.status = statusFilter;

    api
      .get('/loans', { params })
      .then((r) => {
        setLoans(r.data.data || []);
        if (r.data.pagination) setPagination(r.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadOptions = () => {
    // Ambil daftar siswa
    api.get('/students', { params: { limit: 100 } }).then((r) => setStudents(r.data.data || [])).catch(console.error);
    // Ambil daftar buku fisik yang aktif
    api.get('/books', { params: { limit: 100 } }).then((r) => setBooks(r.data.data || [])).catch(console.error);
  };

  useEffect(() => {
    loadLoans(1);
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadLoans(1);
  };

  const openAddModal = () => {
    loadOptions();
    setUserId('');
    setBookId('');
    // Default 7 hari ke depan
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().slice(0, 10));
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!userId) {
      setErrorMsg('Pilih siswa yang meminjam buku');
      return;
    }
    if (!bookId) {
      setErrorMsg('Pilih buku yang akan dipinjam');
      return;
    }

    // Poin 5: Cek ketersediaan stok fisik
    const selectedBook = books.find((b) => String(b.id) === String(bookId));
    if (selectedBook && selectedBook.available_stock <= 0) {
      setErrorMsg(`Peminjaman ditolak: Stok buku "${selectedBook.title}" sedang habis (0 tersedia).`);
      return;
    }

    try {
      const res = await api.post('/loans', {
        user_id: Number(userId),
        book_id: Number(bookId),
        due_date: dueDate,
      });
      setSuccessMsg(res.data.message || 'Transaksi peminjaman berhasil dibuat!');
      setModalOpen(false);
      loadLoans(1);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memproses peminjaman');
    }
  };

  const handleReturn = async (loanId, title) => {
    try {
      const res = await api.put(`/loans/${loanId}/return`);
      setSuccessMsg(res.data.message || `Buku "${title}" berhasil dikembalikan`);
      loadLoans(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses pengembalian');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Transaksi Peminjaman Buku <Repeat className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Catat peminjaman buku fisik siswa, pantau stok tersedia, dan batas waktu pengembalian.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Buat Peminjaman Baru
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode pinjam, nama siswa, NIS, atau judul buku..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="semua">Semua Status</option>
          <option value="dipinjam">Sedang Dipinjam</option>
          <option value="dikembalikan">Sudah Dikembalikan</option>
          <option value="terlambat">Terlambat</option>
        </select>
      </div>

      {/* Tabel Peminjaman */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">Memuat data peminjaman...</div>
        ) : loans.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            Tidak ada transaksi peminjaman yang cocok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Kode Transaksi</th>
                  <th className="pb-3 font-bold">Peminjam (Siswa)</th>
                  <th className="pb-3 font-bold">Buku Fisik</th>
                  <th className="pb-3 font-bold">Tanggal Pinjam</th>
                  <th className="pb-3 font-bold">Jatuh Tempo</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-blue-600">{l.loan_code}</td>
                    <td className="py-3">
                      <p className="font-extrabold text-slate-800">{l.full_name || l.username}</p>
                      <p className="text-[10px] text-slate-400">
                        NIS: {l.nis || '-'} • {l.class_name || 'Siswa'}
                      </p>
                    </td>
                    <td className="py-3">
                      <p className="font-extrabold text-slate-800 line-clamp-1">{l.book_title || '-'}</p>
                      <p className="text-[10px] text-slate-400">{l.category_name || 'Katalog Perpustakaan'}</p>
                    </td>
                    <td className="py-3 text-slate-500">{l.loan_date}</td>
                    <td className="py-3 font-semibold text-slate-700">{l.due_date}</td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          l.status === 'dikembalikan'
                            ? 'bg-emerald-50 text-emerald-700'
                            : l.status === 'terlambat'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {l.status === 'dipinjam' ? (
                        <button
                          onClick={() => handleReturn(l.id, l.book_title)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                        >
                          Terima Kembali
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} transaksi)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadLoans(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => loadLoans(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Peminjaman Baru */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">Buat Transaksi Peminjaman</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-600 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateLoan} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Siswa Peminjam *</label>
                <select
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map((s) => (
                    <option key={s.user_id} value={s.user_id}>
                      {s.full_name} (NIS: {s.nis} - {s.class_name || 'SD'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Buku Fisik * (Stok harus &gt; 0)
                </label>
                <select
                  required
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">-- Pilih Buku Perpustakaan --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.available_stock <= 0}>
                      {b.title} (Sisa Stok: {b.available_stock}/{b.stock}) {b.available_stock <= 0 ? '— [HABIS]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Jatuh Tempo *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Batas waktu peminjaman standar: 7 hari kalender</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Proses Pinjam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

