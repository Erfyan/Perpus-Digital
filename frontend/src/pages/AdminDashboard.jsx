import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  Shield,
  BookOpen,
  Library,
  Users,
  Repeat,
  FolderTree,
  FileText,
  Settings,
  Database,
  BarChart3,
  Clock,
  History,
  AlertTriangle,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentReading, setRecentReading] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin')
      .then((r) => {
        setStats(r.data.stats);
        setRecentReading(r.data.recentReading || []);
        setRecentLoans(r.data.recentLoans || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Memuat dashboard administrator...</p>
        </div>
      </div>
    );
  }

  // PRD Bagian 13 Poin 2: Total buku, buku digital, siswa, peminjaman, buku sedang dipinjam, aktivitas membaca
  const statCards = [
    { label: 'Total Buku', value: stats.totalBooks, icon: BookOpen, color: 'bg-blue-600', to: '/admin/books' },
    { label: 'Buku Digital', value: stats.totalDigital, icon: Library, color: 'bg-indigo-600', to: '/admin/digital-books' },
    { label: 'Total Siswa', value: stats.totalStudents, icon: Users, color: 'bg-emerald-600', to: '/admin/students' },
    { label: 'Total Peminjaman', value: stats.totalLoans, icon: Repeat, color: 'bg-purple-600', to: '/admin/loans' },
    { label: 'Sedang Dipinjam', value: stats.activeLoans, icon: Clock, color: 'bg-amber-500', to: '/admin/loans?status=dipinjam' },
    { label: 'Aktivitas Membaca', value: stats.readingActivities || 0, icon: History, color: 'bg-rose-500', to: '/admin/reading-history' },
  ];

  const adminModules = [
    { label: 'Data Pengguna', to: '/admin/users', icon: UserCheck, desc: 'Kelola akun & hak akses role' },
    { label: 'Data Siswa', to: '/admin/students', icon: Users, desc: 'Master data siswa & NIS' },
    { label: 'Data Petugas', to: '/admin/librarians', icon: Shield, desc: 'Daftar staf perpustakaan' },
    { label: 'Katalog Buku', to: '/admin/books', icon: BookOpen, desc: 'Koleksi & stok buku fisik' },
    { label: 'Kategori', to: '/admin/categories', icon: FolderTree, desc: 'Klasifikasi buku' },
    { label: 'Buku Digital', to: '/admin/digital-books', icon: Library, desc: 'Unggah & atur PDF' },
    { label: 'Peminjaman', to: '/admin/loans', icon: Repeat, desc: 'Sirkulasi pinjam buku' },
    { label: 'Pengembalian', to: '/admin/returns', icon: Clock, desc: 'Terima buku fisik' },
    { label: 'Riwayat Membaca', to: '/admin/reading-history', icon: History, desc: 'Pantau progres siswa' },
    { label: 'Laporan', to: '/admin/reports', icon: BarChart3, desc: 'Statistik & analitik' },
    { label: 'Pengaturan', to: '/admin/settings', icon: Settings, desc: 'Konfigurasi perpustakaan' },
    { label: 'Backup Database', to: '/admin/backup', icon: Database, desc: 'Cadangkan data SQLite' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm min-h-[140px] flex items-center border border-slate-800">
        <img
          src="/img/Banner-panjang.jpg"
          alt="Banner Admin Perpustakaan"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-indigo-950/90 to-slate-900/60" />
        <div className="relative z-1 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div>
            <span className="bg-white/15 text-indigo-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Administrator Utama Sistem
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight drop-shadow-sm">
              Dashboard Pengendalian Perpustakaan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Pengelolaan menyeluruh data master, operasional sirkulasi, laporan literasi, dan keamanan sistem.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/admin/reports"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <BarChart3 className="w-4 h-4" /> Buka Laporan
            </Link>
            <Link
              to="/admin/backup"
              className="bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 transition-all border border-white/20"
            >
              <Database className="w-4 h-4" /> Backup DB
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Statistik Database (PRD Poin 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className="bg-white rounded-3xl border border-slate-100 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{c.label}</span>
                <div className={`w-7 h-7 rounded-xl ${c.color} text-white flex items-center justify-center shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                {c.value}
              </p>
            </Link>
          );
        })}
      </div>

      {/* 12 Modul Utama Admin (PRD Bagian 13) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" /> Modul Kendali Sistem (PRD Bagian 13)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {adminModules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.label}
                to={m.to}
                className="bg-slate-50/70 hover:bg-indigo-50/60 border border-slate-200/70 rounded-2xl p-3.5 flex flex-col justify-between transition-all group hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 shadow-2xs border border-slate-200 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {m.label}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{m.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid 2 Kolom: Aktivitas Membaca & Transaksi Peminjaman Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aktivitas Membaca Siswa Terkini */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-rose-500" /> Aktivitas Membaca Terkini
            </h3>
            <Link to="/admin/reading-history" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentReading.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada aktivitas membaca tercatat.</p>
          ) : (
            <div className="space-y-2.5">
              {recentReading.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{r.book_title}</p>
                    <p className="text-[10px] text-slate-500">
                      Oleh: <strong>{r.student_name || 'Siswa'}</strong> ({r.class_name || 'SD'})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 text-xs">{Math.round(r.progress_percentage || 0)}%</span>
                    <p className="text-[10px] text-slate-400">{r.last_read_at ? r.last_read_at.split('T')[0] : 'Hari ini'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaksi Peminjaman Terkini */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-blue-600" /> Transaksi Peminjaman Terkini
            </h3>
            <Link to="/admin/loans" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentLoans.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi peminjaman.</p>
          ) : (
            <div className="space-y-2.5">
              {recentLoans.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[10px] text-slate-500">{l.loan_code}</span>
                      <span className="font-bold text-slate-800">{l.book_title || 'Buku'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Peminjam: {l.student_name || 'Siswa'}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        l.status === 'dikembalikan' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {l.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tempo: {l.due_date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
