import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  BookOpen,
  DollarSign,
  Bell,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    app_name: '',
    school_name: '',
    max_loan_days: '7',
    max_books_per_student: '2',
    fine_per_day: '500',
    auto_notify_overdue: 'true',
    reading_goal_books: '10'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/admin/settings');
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat pengaturan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');
      const res = await api.put('/admin/settings', formData);
      setSuccessMsg(res.data.message || 'Pengaturan berhasil disimpan!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <RefreshCw className="h-6 w-6 animate-spin mr-2 text-indigo-600" />
        Memuat konfigurasi sistem...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Settings className="h-7 w-7 text-indigo-600" />
          Pengaturan Sistem Perpustakaan
        </h1>
        <p className="text-sm text-slate-500">
          Konfigurasi parameter sirkulasi, identitas perpustakaan sekolah, dan aturan operasional.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Sekolah & Aplikasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-500" />
            Identitas Perpustakaan & Sekolah
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Nama Aplikasi
              </label>
              <input
                type="text"
                name="app_name"
                value={formData.app_name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                placeholder="Contoh: Perpustakaan Digital SD"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Nama Sekolah
              </label>
              <input
                type="text"
                name="school_name"
                value={formData.school_name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                placeholder="Contoh: SD Negeri 1 Merdeka"
              />
            </div>
          </div>
        </div>

        {/* Aturan Sirkulasi & Peminjaman */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            Aturan Sirkulasi & Peminjaman Buku Fisik
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Durasi Pinjam Maksimal (Hari)
              </label>
              <input
                type="number"
                name="max_loan_days"
                min="1"
                max="30"
                value={formData.max_loan_days}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
              />
              <span className="text-xs text-slate-400 mt-1 block">Standar SD: 7 hari</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Maksimal Buku per Siswa
              </label>
              <input
                type="number"
                name="max_books_per_student"
                min="1"
                max="5"
                value={formData.max_books_per_student}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
              />
              <span className="text-xs text-slate-400 mt-1 block">Batas buku dipinjam aktif</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Denda Terlambat per Hari (Rp)
              </label>
              <input
                type="number"
                name="fine_per_day"
                min="0"
                step="100"
                value={formData.fine_per_day}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
              />
              <span className="text-xs text-slate-400 mt-1 block">0 bila tidak ada denda</span>
            </div>
          </div>
        </div>

        {/* Target Membaca Digital & Notifikasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Target Membaca & Notifikasi Otomatis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Target Buku Selesai per Semester
              </label>
              <input
                type="number"
                name="reading_goal_books"
                min="1"
                max="100"
                value={formData.reading_goal_books}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
              />
              <span className="text-xs text-slate-400 mt-1 block">Untuk perhitungan progress lencana siswa</span>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="auto_notify_overdue"
                  checked={formData.auto_notify_overdue === 'true'}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Notifikasi Keterlambatan Otomatis</span>
                  <span className="text-xs text-slate-500">Kirim pemberitahuan ke panel siswa jika peminjaman jatuh tempo</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={fetchSettings}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}

