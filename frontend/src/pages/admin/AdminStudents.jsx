import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Power,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
  Repeat,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    nis: '',
    class_name: 'Kelas 4A',
    username: '',
    password: '',
    is_active: 1
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadStudents = (page = pagination.page) => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (search) params.search = search;
    if (classFilter) params.class_name = classFilter;

    api
      .get('/students', { params })
      .then((r) => {
        let list = r.data.data || [];
        if (statusFilter !== '') {
          list = list.filter((s) => String(s.is_active) === String(statusFilter));
        }
        setStudents(list);
        if (r.data.pagination) setPagination(r.data.pagination);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'Gagal memuat data pengguna siswa');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents(1);
  }, [classFilter, statusFilter]);

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
      is_active: 1
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
      password: '',
      is_active: s.is_active ?? 1
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, form);
        setSuccessMsg(`Akun siswa "${form.full_name}" berhasil diperbarui`);
      } else {
        await api.post('/students', form);
        setSuccessMsg(`Akun siswa baru "${form.full_name}" berhasil dibuat`);
      }
      setModalOpen(false);
      loadStudents(editingStudent ? pagination.page : 1);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data pengguna siswa');
    }
  };

  const handleToggleStatus = async (student) => {
    const action = student.is_active ? 'menonaktifkan' : 'mengaktifkan';
    if (!window.confirm(`Yakin ingin ${action} akun siswa "${student.full_name}" (@${student.username})?`)) return;

    try {
      const newStatus = student.is_active ? 0 : 1;
      await api.put(`/students/${student.id}`, { is_active: newStatus });
      setSuccessMsg(`Akun siswa "${student.full_name}" berhasil diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}`);
      loadStudents(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengubah status akun siswa');
    }
  };

  const handleDelete = async (id, name, username) => {
    if (!window.confirm(`Yakin ingin menghapus permanen akun siswa "${name}" (@${username})? Akun user dan data siswa terkait akan dihapus.`)) return;

    try {
      await api.delete(`/students/${id}`);
      setSuccessMsg(`Data akun siswa "${name}" berhasil dihapus`);
      loadStudents(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus siswa');
    }
  };

  // Hitung ringkasan
  const activeCount = students.filter((s) => s.is_active).length;
  const inactiveCount = students.filter((s) => !s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
              Role: Siswa
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs font-semibold">Tabel Pengguna Siswa</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-indigo-600" />
            Daftar Pengguna Siswa
          </h1>
          <p className="text-xs text-slate-500">
            Seluruh data akun siswa terdaftar dalam sistem perpustakaan, lengkap dengan username login, NIS, kelas, dan status keaktifan.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Tambah Akun Siswa Baru
        </button>
      </div>

      {/* Ringkasan Statistik Siswa */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Akun Siswa</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{pagination.total || students.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Siswa terdaftar</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Akun Aktif</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Dapat login & membaca</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Akun Nonaktif</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{inactiveCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Akses login ditangguhkan</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Hak Akses Role</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">Siswa SD</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Otorisasi per kepemilikan</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
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
            placeholder="Cari nama siswa, NIS, atau username akun..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </form>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="">Semua Tingkat Kelas</option>
          <option value="Kelas 1">Kelas 1</option>
          <option value="Kelas 2">Kelas 2</option>
          <option value="Kelas 3">Kelas 3</option>
          <option value="Kelas 4A">Kelas 4A</option>
          <option value="Kelas 4B">Kelas 4B</option>
          <option value="Kelas 4C">Kelas 4C</option>
          <option value="Kelas 5A">Kelas 5A</option>
          <option value="Kelas 5B">Kelas 5B</option>
          <option value="Kelas 6A">Kelas 6A</option>
          <option value="Kelas 6B">Kelas 6B</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="">Semua Status Akun</option>
          <option value="1">Akun Aktif</option>
          <option value="0">Akun Nonaktif</option>
        </select>
      </div>

      {/* Tabel Pengguna Siswa */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">Memuat tabel akun siswa...</div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">Tidak ada siswa yang sesuai filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Akun Pengguna</th>
                  <th className="pb-3 font-bold">Identitas Siswa (Nama / NIS)</th>
                  <th className="pb-3 font-bold">Kelas</th>
                  <th className="pb-3 font-bold">Aktivitas Literasi</th>
                  <th className="pb-3 font-bold">Status Akun</th>
                  <th className="pb-3 font-bold">Terdaftar</th>
                  <th className="pb-3 font-bold text-right">Aksi Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Akun Pengguna */}
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0 border border-emerald-200">
                          👦
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                            @{s.username}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">User ID: #{s.user_id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Identitas Siswa */}
                    <td className="py-3">
                      <div>
                        <p className="font-extrabold text-slate-800">{s.full_name}</p>
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold mt-0.5">
                          NIS: {s.nis}
                        </span>
                      </div>
                    </td>

                    {/* Kelas */}
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100">
                        {s.class_name || 'Umum'}
                      </span>
                    </td>

                    {/* Aktivitas Literasi */}
                    <td className="py-3">
                      <div className="flex flex-col gap-1 text-[11px]">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                          {s.books_read || 0} buku selesai
                        </span>
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <Repeat className="w-3.5 h-3.5 text-amber-500" />
                          {s.active_loans || 0} pinjaman aktif
                        </span>
                      </div>
                    </td>

                    {/* Status Akun */}
                    <td className="py-3">
                      <button
                        onClick={() => handleToggleStatus(s)}
                        title="Klik untuk mengubah status aktif"
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                          s.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                        }`}
                      >
                        {s.is_active ? (
                          <>
                            <UserCheck className="w-3 h-3" /> Aktif
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" /> Nonaktif
                          </>
                        )}
                      </button>
                    </td>

                    {/* Tanggal Terdaftar */}
                    <td className="py-3 text-slate-500 text-[11px]">
                      {s.user_created_at
                        ? new Date(s.user_created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : '-'}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          title="Edit Akun & Profil Siswa"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.full_name, s.username)}
                          title="Hapus Akun Siswa"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
          <div className="flex items-center justify-between pt-5 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total siswa)
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadStudents(pagination.page - 1)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadStudents(pagination.page + 1)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Akun Siswa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              {editingStudent ? 'Edit Akun Pengguna Siswa' : 'Tambah Akun Siswa Baru'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {editingStudent
                ? `Perbarui informasi akun login @${editingStudent.username} atau data profil siswa.`
                : 'Buat akun login siswa baru untuk mengakses katalog dan buku digital perpustakaan.'}
            </p>

            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase text-[10px] text-slate-400">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Contoh: Andi Pratama"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase text-[10px] text-slate-400">
                    NIS (Nomor Induk Siswa) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nis}
                    onChange={(e) => setForm({ ...form, nis: e.target.value })}
                    placeholder="Contoh: 10001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase text-[10px] text-slate-400">
                  Tingkat / Nama Kelas *
                </label>
                <select
                  value={form.class_name}
                  onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:bg-white font-bold text-slate-700"
                >
                  <option value="Kelas 1">Kelas 1</option>
                  <option value="Kelas 2">Kelas 2</option>
                  <option value="Kelas 3">Kelas 3</option>
                  <option value="Kelas 4A">Kelas 4A</option>
                  <option value="Kelas 4B">Kelas 4B</option>
                  <option value="Kelas 4C">Kelas 4C</option>
                  <option value="Kelas 5A">Kelas 5A</option>
                  <option value="Kelas 5B">Kelas 5B</option>
                  <option value="Kelas 6A">Kelas 6A</option>
                  <option value="Kelas 6B">Kelas 6B</option>
                </select>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-indigo-600 font-extrabold mb-2.5">
                  Kredensial Akun Pengguna (Login)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1.5 uppercase text-[10px] text-slate-400">
                      Username Login *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="Contoh: andi"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 uppercase text-[10px] text-slate-400">
                      {editingStudent ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi Login *'}
                    </label>
                    <input
                      type="password"
                      required={!editingStudent}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={editingStudent ? 'Kosongkan jika tetap' : 'Minimal 6 karakter'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {editingStudent && (
                <div>
                  <label className="block mb-1.5 uppercase text-[10px] text-slate-400">Status Akun Login</label>
                  <select
                    value={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  >
                    <option value={1}>Aktif (Bisa Login)</option>
                    <option value={0}>Nonaktif (Login Diblokir)</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-sm transition-all"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Buat Akun Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

