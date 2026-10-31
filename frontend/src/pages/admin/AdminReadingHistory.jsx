import { useEffect, useState } from 'react';
import api from '../../lib/api';
import BookCover from '../../components/BookCover';
import { History, Search, CheckCircle2, BookOpen, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminReadingHistory() {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadHistory = (page = pagination.page) => {
    setLoading(true);
    api
      .get('/admin/reading-history', { params: { search, page, limit: 15 } })
      .then((r) => {
        setHistory(r.data.data || []);
        if (r.data.pagination) setPagination(r.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadHistory(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-700 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Riwayat Membaca Siswa <History className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-pink-100 mt-1">
            Pantau seluruh aktivitas membaca digital siswa, persentase progres, dan tingkat penyelesaian buku.
          </p>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-2xl font-bold text-xs backdrop-blur-xs shrink-0">
          {pagination.total} Aktivitas Tercatat
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa, NIS, atau judul buku..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-700 outline-none focus:border-rose-500 focus:bg-white"
          />
        </form>
      </div>

      {/* Tabel Riwayat Membaca */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">Memuat riwayat membaca...</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">Tidak ada riwayat membaca yang cocok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Buku Dibaca</th>
                  <th className="pb-3 font-bold">Siswa Pembaca</th>
                  <th className="pb-3 font-bold">Halaman Terakhir</th>
                  <th className="pb-3 font-bold">Persentase Progres</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Waktu Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((h, i) => (
                  <tr key={h.id || i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 shrink-0">
                          <BookCover title={h.book_title} category={h.category_name} className="!p-1" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 line-clamp-1">{h.book_title}</p>
                          <p className="text-[10px] text-slate-400">{h.category_name || 'Umum'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="font-extrabold text-slate-800">{h.student_name || h.username}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        NIS: {h.nis || '-'} • {h.class_name || 'Siswa'}
                      </p>
                    </td>
                    <td className="py-3 font-bold text-slate-700">Hal. {h.last_page || 0}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${Math.round(h.progress_percentage || 0)}%` }}
                          />
                        </div>
                        <span className="font-bold text-emerald-600 text-[11px]">
                          {Math.round(h.progress_percentage || 0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      {h.completed ? (
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Selesai 100%
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Membaca
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[10px]">
                      {h.last_read_at ? h.last_read_at.replace('T', ' ').substring(0, 16) : '-'}
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
              Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} aktivitas)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadHistory(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => loadHistory(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

