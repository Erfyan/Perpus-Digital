import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import BookCover from '../components/BookCover';
import { Clock, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/reading-history')
      .then((r) => setItems(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-6 text-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Riwayat Membaca <Clock className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Lihat buku-buku yang pernah kamu baca dan lanjutkan halaman terakhirmu!
          </p>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-2xl font-bold text-xs backdrop-blur-xs">
          {items.length} Riwayat Tercatat
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-bold text-sm">
          Memuat riwayat membaca...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Clock className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-700">Belum ada riwayat membaca</h4>
          <p className="text-xs text-slate-400 mt-1">
            Mulai membaca buku pertama kamu di katalog perpustakaan!
          </p>
          <Link
            to="/catalog"
            className="mt-4 inline-block bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Mulai Membaca Buku
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((h, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 sm:w-16 shrink-0">
                  <BookCover title={h.title} category={h.category_name} coverPath={h.cover_path} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                    {h.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Terakhir dibaca: {h.last_read_at ? h.last_read_at.split('T')[0] : 'Hari ini'}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${Math.round(h.progress_percentage || 0)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600">
                      {Math.round(h.progress_percentage || 0)}%
                    </span>
                    {h.completed ? (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Selesai
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/read/${h.book_id}`}
                  className="bg-[#1E74FD] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  {h.completed ? 'Baca Lagi' : 'Lanjutkan Baca'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
