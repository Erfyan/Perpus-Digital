import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
  Repeat
} from 'lucide-react';

export default function PetugasStudents() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    nis: '',
    class_name: 'Kelas 4A',
    username: '',
    password: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadStudents = (page = pagination.page) => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (classFilter) params.class_name = classFilter;

    api
      .get('/students', { params })
      .then((r) => {
        setStudents(r.data.data || []);
        if (r.data.pagination) setPagination(r.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents(1);
  }, [classFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadStudents(1);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setForm({
      full_name: '',
      nis: '',
      class_name: 'Kelas 4A',
      username: '',
      password: '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingStudent(s);
    setForm({
      full_name: s.full_name || '',
      nis: s.nis || '',
      class_name: s.class_name || 'Kelas 4A',
      username: s.username || '',
      password: '', // Kosongkan password saat edit kecuali ingin ganti
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.full_name.trim()) {
      setErrorMsg('Nama lengkap siswa wajib diisi');
      return;
    }
    if (!form.nis.trim()) {
      setErrorMsg('NIS siswa wajib diisi');
      return;
    }
    if (!form.username.trim()) {
      setErrorMsg('Username wajib diisi');
      return;
    }
    if (!editingStudent && !form.password.trim()) {
      setErrorMsg('Kata sandi wajib diisi untuk siswa baru');
      return;
    }

    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, form);
        setSuccessMsg(`Data siswa "${form.full_name}" berhasil diperbarui`);
      } else {
        await api.post('/students', form);
        setSuccessMsg(`Siswa baru "${form.full_name}" (NIS: ${form.nis}) berhasil ditambahkan`);
      }
      setModalOpen(false);
      loadStudents(editingStudent ? pagination.page : 1);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data siswa');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus data siswa "${name}"? Akun login juga akan dihapus permanen.`)) return;
    try {
      await api.delete(`/students/${id}`);
      setSuccessMsg(`Data siswa "${name}" berhasil dihapus`);
      loadStudents(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus siswa');
    }
  };

  const CLASSES = ['Kelas 1A', 'Kelas 1B', 'Kelas 2A', 'Kelas 2B', 'Kelas 3A', 'Kelas 3B', 'Kelas 4A', 'Kelas 4B', 'Kelas 4C', 'Kelas 5A', 'Kelas 5B', 'Kelas 6A', 'Kelas 6B'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Data Anggota & Siswa <Users className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Kelola data siswa, NIS unik, kelas, akun login, dan pantauan aktivitas peminjaman.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-white text-emerald-700 hover:bg-emerald-50 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Tambah Siswa Baru
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama siswa, NIS, atau username..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-700 outline-none focus:border-emerald-500 focus:bg-white"
          />
        </form>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="">Semua Kelas</option>
          {CLASSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Tabel Siswa */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">Memuat data siswa...</div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">Tidak ada data siswa yang cocok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Profil Siswa</th>
                  <th className="pb-3 font-bold">NIS</th>
                  <th className="pb-3 font-bold">Kelas</th>
                  <th className="pb-3 font-bold">Username</th>
                  <th className="pb-3 font-bold">Buku Dibaca</th>
                  <th className="pb-3 font-bold">Pinjam Aktif</th>
                  <th className="pb-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-sm shrink-0">
                          👦
                        </div>
                        <span className="font-extrabold text-slate-800">{s.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-700">{s.nis}</td>
                    <td className="py-3 font-bold text-slate-600">{s.class_name || '-'}</td>
                    <td className="py-3 font-mono text-slate-500">@{s.username}</td>
                    <td className="py-3">
                      <span className="bg-blue-50 text-blue-600 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {s.books_read || 0} buku
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          s.active_loans > 0
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Repeat className="w-3 h-3" /> {s.active_loans || 0} pinjam
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Ubah Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.full_name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
              Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total siswa)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadStudents(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => loadStudents(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Siswa */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingStudent ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-600 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIS (Harus Unik) *</label>
                  <input
                    type="text"
                    required
                    value={form.nis}
                    onChange={(e) => setForm({ ...form, nis: e.target.value })}
                    placeholder="10001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas *</label>
                  <select
                    value={form.class_name}
                    onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="andi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi {editingStudent ? '(Kosongkan jika tidak diganti)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingStudent}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingStudent ? '••••••••' : 'Masukkan password'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
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
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

