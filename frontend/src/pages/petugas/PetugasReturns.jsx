import { useEffect, useState } from 'react';
import api from '../../lib/api';
import BookCover from '../../components/BookCover';
import {
  CheckCircle2,
  Search,
  AlertCircle,
  Clock,
  Calendar,
  Repeat,
  Check,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function PetugasReturns() {
  const [loans, setLoans] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Quick return input by loan code
  const [quickCode, setQuickCode] = useState('');
  const [processing, setProcessing] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadActiveLoans = () => {
    setLoading(true);
    api
      .get('/loans', { params: { status: 'dipinjam', search } })
      .then((r) => setLoans(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadActiveLoans();
  }, [search]);

  const handleReturnLoan = async (loanId, title) => {
    setProcessing(true);
    setErrorMsg('');
    try {
      const res = await api.put(`/loans/${loanId}/return`);
      setSuccessMsg(res.data.message || `Buku "${title}" berhasil dikembalikan`);
      loadActiveLoans();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memproses pengembalian buku');
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickReturnSubmit = async (e) => {
    e.preventDefault();
    if (!quickCode.trim()) return;

    setErrorMsg('');
    const targetLoan = loans.find(
      (l) => l.loan_code.toLowerCase() === quickCode.trim().toLowerCase()
    );

    if (!targetLoan) {
      setErrorMsg(`Transaksi dengan kode "${quickCode}" tidak ditemukan di daftar peminjaman aktif`);
      return;
    }

    await handleReturnLoan(targetLoan.id, targetLoan.book_title);
    setQuickCode('');
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Pusat Pengembalian Buku <CheckCircle2 className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Proses buku fisik yang dikembalikan siswa, otomatis pulihkan stok tersedia, dan deteksi keterlambatan.
          </p>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-2xl font-bold text-xs backdrop-blur-xs shrink-0">
          {loans.length} Buku Sedang Dipinjam
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Quick Return Bar (Scan / Input Kode Pinjam) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
        <form onSubmit={handleQuickReturnSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Repeat className="w-4 h-4 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value)}
              placeholder="Ketik atau scan kode peminjaman (contoh: PJ123456)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-mono font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={processing || !quickCode.trim()}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-2xl shadow-xs transition-colors disabled:opacity-40"
          >
            Proses Pengembalian Cepat
          </button>
        </form>
      </div>

      {/* Daftar Buku yang Masih Dipinjam */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-slate-800">
            Daftar Buku yang Perlu Dikembalikan ({loans.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari siswa atau buku..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-700 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">Memuat daftar pinjaman aktif...</div>
        ) : loans.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            Semua buku fisik perpustakaan telah tersimpan lengkap di rak (tidak ada pinjaman aktif).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {loans.map((l) => {
              const isOverdue = today > l.due_date;
              return (
                <div
                  key={l.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                    isOverdue
                      ? 'bg-rose-50/40 border-rose-200/80 shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 shrink-0">
                        <BookCover title={l.book_title} category={l.category_name} className="!p-1" />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                          {l.loan_code}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-800 mt-1 line-clamp-1">
                          {l.book_title}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                          {l.full_name} ({l.class_name || 'Siswa'})
                        </p>
                      </div>
                    </div>

                    {isOverdue ? (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3" /> Terlambat
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> Dipinjam
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 space-y-0.5">
                      <p>
                        Pinjam: <strong>{l.loan_date}</strong>
                      </p>
                      <p className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                        Jatuh Tempo: <strong>{l.due_date}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleReturnLoan(l.id, l.book_title)}
                      disabled={processing}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <Check className="w-3.5 h-3.5" /> Terima Kembali
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

