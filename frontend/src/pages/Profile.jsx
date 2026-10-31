import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { User, Award, BookOpen, Clock, Heart, Shield } from 'lucide-react';

export default function Profile() {
  const { user, student } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.role === 'siswa') {
      api
        .get('/dashboard/student')
        .then((r) => setStats(r.data.stats))
        .catch(console.error);
    }
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-3xl bg-white shadow-lg flex items-center justify-center text-5xl border-4 border-white/50">
          👦
        </div>
        <div className="text-center sm:text-left">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
            {student ? 'Kartu Anggota Perpustakaan' : user?.role?.toUpperCase()}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">
            {student?.full_name || user?.username}
          </h2>
          <p className="text-sm text-blue-100 font-medium">
            {student?.class_name ? `${student.class_name} • NIS: ${student.nis}` : `Role: ${user?.role}`}
          </p>
        </div>
      </div>

      {/* Profil Detail Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" /> Informasi Data Siswa
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-400">Nama Lengkap</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{student?.full_name || user?.username}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-400">Nomor Induk Siswa (NIS)</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{student?.nis || '-'}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-400">Kelas</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{student?.class_name || '-'}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-400">Nama Pengguna (Username)</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Statistik Membaca Siswa */}
      {stats && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Pencapaian Literasi
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-2xl bg-blue-50 border border-blue-100">
              <p className="text-xl font-black text-blue-700">{stats.totalDigital}</p>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">Buku Tersedia</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <p className="text-xl font-black text-emerald-700">{stats.completed}</p>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">Selesai Dibaca</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-amber-50 border border-amber-100">
              <p className="text-xl font-black text-amber-700">{stats.inProgress}</p>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">Sedang Dibaca</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-purple-50 border border-purple-100">
              <p className="text-xl font-black text-purple-700">{stats.favorites}</p>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">Buku Favorit</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

