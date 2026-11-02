import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import {
  BookOpen,
  Library,
  Users,
  Repeat,
  AlertTriangle,
  FolderTree,
  PlusCircle,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function PetugasDashboard() {
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin')
      .then((r) => {
        setStats(r.data.stats);
        setRecentLoans(r.data.recentLoans || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Memuat dashboard operasional...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Koleksi Buku Fisik', value: stats.totalBooks, icon: BookOpen, color: 'bg-blue-600', sub: 'Judul terdaftar' },
    { label: 'Buku Digital (PDF)', value: stats.totalDigital, icon: Library, color: 'bg-indigo-600', sub: 'E-Book aktif' },
    { label: 'Siswa / Anggota', value: stats.totalStudents, icon: Users, color: 'bg-emerald-600', sub: 'Siswa terdaftar' },
    { label: 'Sedang Dipinjam', value: stats.activeLoans, icon: Repeat, color: 'bg-amber-500', sub: 'Buku fisik beredar' },
    { label: 'Pinjaman Terlambat', value: stats.overdueLoans || 0, icon: AlertTriangle, color: 'bg-rose-500', sub: 'Perlu ditindaklanjuti' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm min-h-[140px] flex items-center border border-blue-900/40">
        <img
          src="/img/Banner-panjang.jpg"
          alt="Banner Petugas Perpustakaan"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-indigo-950/90 to-blue-900/50" />
        <div className="relative z-10 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div>
            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
              Panel Operasional Petugas Perpustakaan
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight drop-shadow-sm">
              Dashboard Sirkulasi & Koleksi
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">
              Pantau transaksi peminjaman, pengembalian buku fisik, koleksi digital, dan data siswa.
            </p>
          </div>

          {/* Quick Transaction Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/petugas/loans"
              className="bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Pinjam Baru
            </Link>
            <Link
              to="/petugas/returns"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Pengembalian
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards Operasional */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="bg-white rounded-3xl border border-slate-100 p-4 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">{c.label}</span>
                <div className={`w-8 h-8 rounded-xl ${c.color} text-white flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 leading-tight">{c.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Menu Navigasi Cepat Petugas (6 Modul Utama PRD Bagian 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Katalog Buku', to: '/petugas/books', icon: BookOpen, desc: 'Kelola buku fisik' },
          { label: 'Kategori', to: '/petugas/categories', icon: FolderTree, desc: 'Kelola klasifikasi' },
          { label: 'Data Siswa', to: '/petugas/students', icon: Users, desc: 'Daftar anggota siswa' },
          { label: 'Buku Digital', to: '/petugas/digital-books', icon: Library, desc: 'Upload file PDF' },
          { label: 'Peminjaman', to: '/petugas/loans', icon: Repeat, desc: 'Proses pinjam buku' },
          { label: 'Pengembalian', to: '/petugas/returns', icon: CheckCircle2, desc: 'Terima buku kembali' },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              to={m.to}
              className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">
                  {m.label}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Transaksi Peminjaman Terbaru */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
              Transaksi Peminjaman Terkini
            </h3>
          </div>
          <Link to="/petugas/loans" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            Semua Transaksi <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLoans.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Belum ada transaksi peminjaman.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Kode Pinjam</th>
                  <th className="pb-3 font-bold">Peminjam</th>
                  <th className="pb-3 font-bold">Buku</th>
                  <th className="pb-3 font-bold">Tanggal Pinjam</th>
                  <th className="pb-3 font-bold">Jatuh Tempo</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentLoans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-600">{l.loan_code}</td>
                    <td className="py-3 font-bold text-slate-800">{l.full_name || 'Siswa'}</td>
                    <td className="py-3 text-slate-700">{l.book_title || '-'}</td>
                    <td className="py-3 text-slate-500">{l.loan_date}</td>
                    <td className="py-3 font-medium text-slate-700">{l.due_date}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

