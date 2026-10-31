import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
  BarChart3,
  BookOpen,
  Users,
  Repeat,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Printer,
  RefreshCw,
  Award
} from 'lucide-react';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/reports');
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <RefreshCw className="h-6 w-6 animate-spin mr-2 text-indigo-600" />
        Memuat laporan statistik perpustakaan...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200">
        {error}
      </div>
    );
  }

  const { loanStats, topBooks, topStudents, topCategories, monthlyLoans } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            Laporan & Statistik Perpustakaan
          </h1>
          <p className="text-sm text-slate-500">
            Analisis aktivitas sirkulasi peminjaman, buku terfavorit, dan keterlibatan siswa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Cetak Laporan
          </button>
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" />
            Segarkan
          </button>
        </div>
      </div>

      {/* Ringkasan Sirkulasi Peminjaman */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transaksi</span>
            <Repeat className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-slate-800">{loanStats?.total || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Seluruh riwayat peminjaman</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Selesai Dikembalikan</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{loanStats?.dikembalikan || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Buku telah kembali ke stok</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Sedang Dipinjam</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600">{loanStats?.dipinjam || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Buku masih di tangan siswa</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Terlambat</span>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600">{loanStats?.terlambat || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Melewati batas jatuh tempo</p>
        </div>
      </div>

      {/* Grid: Top Buku & Top Siswa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Buku */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Top 5 Buku Paling Populer Dibaca
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full">
              Digital Activity
            </span>
          </div>

          <div className="space-y-3">
            {(!topBooks || topBooks.length === 0) ? (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada aktivitas membaca tercatat.</p>
            ) : (
              topBooks.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">{b.title}</h3>
                      <p className="text-xs text-slate-500">{b.author || 'Penulis Anonim'} • <span className="text-indigo-600">{b.category_name || 'Umum'}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-800">{b.read_count}</span>
                    <span className="text-xs text-slate-500 block">kali dibaca</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top 5 Siswa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Top 5 Siswa Paling Aktif Membaca
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
              Keterlibatan Siswa
            </span>
          </div>

          <div className="space-y-3">
            {(!topStudents || topStudents.length === 0) ? (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada data siswa aktif.</p>
            ) : (
              topStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">{s.full_name}</h3>
                      <p className="text-xs text-slate-500">NIS: {s.nis} • Kelas {s.class_name || '-'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-blue-600">{s.total_read} buku</span>
                    <span className="text-xs text-emerald-600 font-semibold block">{s.completed_books} tamat</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid: Kategori Favorit & Tren Bulanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Kategori */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Distribusi Minat Kategori Buku
          </h2>
          <div className="space-y-4">
            {(!topCategories || topCategories.length === 0) ? (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada data minat kategori.</p>
            ) : (
              topCategories.map((c, i) => {
                const max = topCategories[0]?.read_count || 1;
                const pct = Math.round((c.read_count / max) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>{c.name}</span>
                      <span>{c.read_count} sesi baca</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tren Peminjaman Bulanan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2">
            <Repeat className="h-5 w-5 text-indigo-500" />
            Aktivitas Peminjaman (6 Bulan Terakhir)
          </h2>
          <div className="space-y-3">
            {(!monthlyLoans || monthlyLoans.length === 0) ? (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada catatan peminjaman dalam 6 bulan terakhir.</p>
            ) : (
              monthlyLoans.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="font-bold text-sm text-slate-700">Periode: {m.month}</span>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                    {m.total_loans} Peminjaman
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

