import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Power,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  UserX
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'petugas',
    is_active: 1,
    full_name: '',
    nis: '',
    class_name: 'Kelas 4A',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadUsers = (page = pagination.page) => {
    setLoading(true);
    setErrorMsg('');
    const params = { page, limit: 15 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;

    api
      .get('/admin/users', { params })
      .then((r) => {
        setUsers(r.data.data || []);
        if (r.data.pagination) setPagination(r.data.pagination);
        setLoading(false);
      })
      .catch((err) => {
        // Fallback otomatis jika /admin/users 404, coba panggil /users
        api
          .get('/users', { params })
          .then((res2) => {
            setUsers(res2.data.data || []);
            if (res2.data.pagination) setPagination(res2.data.pagination);
          })
          .catch(() => {
            setErrorMsg(err.response?.data?.message || 'Gagal memuat data pengguna');
          })
          .finally(() => setLoading(false));
      });
  };

  useEffect(() => {
    loadUsers(1);
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(1);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      username: '',
      password: '',
      role: 'petugas',
      is_active: 1,
      full_name: '',
      nis: '',
      class_name: 'Kelas 4A',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setForm({
      username: u.username || '',
      password: '',
      role: u.role || 'siswa',
      is_active: u.is_active ?? 1,
      full_name: u.full_name || '',
      nis: u.nis || '',
      class_name: u.class_name || 'Kelas 4A',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.username.trim()) {
      setErrorMsg('Username wajib diisi');
      return;
    }
    if (!editingUser && !form.password.trim()) {
      setErrorMsg('Kata sandi wajib diisi untuk pengguna baru');
      return;
    }

    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, form);
        setSuccessMsg(`Data akun "${form.username}" berhasil diperbarui`);
      } else {
        await api.post('/admin/users', form);
        setSuccessMsg(`Akun baru "${form.username}" (${form.role}) berhasil dibuat`);
      }
      setModalOpen(false);
      loadUsers(editingUser ? pagination.page : 1);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan pengguna');
    }
  };

  const handleToggleActive = async (u) => {
    const action = u.is_active ? 'menonaktifkan' : 'mengaktifkan kembali';
    if (!window.confirm(`Yakin ingin ${action} akun "${u.username}"?`)) return;

    try {
      const res = await api.delete(`/admin/users/${u.id}`);
      setSuccessMsg(res.data.message || `Status akun "${u.username}" berhasil diubah`);
      loadUsers(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status akun');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Manajemen Data Pengguna <Users className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Kelola seluruh akun pengguna (Administrator, Petugas, Siswa), hak akses role, dan status keaktifan.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Buat Akun Baru
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
          <button
            onClick={() => { setErrorMsg(''); loadUsers(pagination.page); }}
            className="text-xs font-extrabold underline hover:text-rose-900"
          >
            Coba Lagi
          </button>
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
            placeholder="Cari username, nama lengkap, atau NIS..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:bg-white"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
        >
          <option value="">Semua Peran (Role)</option>
          <option value="admin">Administrator</option>
          <option value="petugas">Petugas Perpustakaan</option>
          <option value="siswa">Siswa</option>
        </select>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">Memuat data pengguna...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">Tidak ada pengguna yang cocok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Pengguna</th>
                  <th className="pb-3 font-bold">Peran (Role)</th>
                  <th className="pb-3 font-bold">Identitas / Siswa</th>
                  <th className="pb-3 font-bold">Status Akun</th>
                  <th className="pb-3 font-bold">Terdaftar</th>
                  <th className="pb-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : u.role === 'petugas'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {u.role === 'admin' ? '🛡️' : u.role === 'petugas' ? '👩‍💼' : '👦'}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800">@{u.username}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'petugas'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      {u.full_name ? (
                        <div>
                          <p className="font-bold text-slate-700">{u.full_name}</p>
                          <p className="text-[10px] text-slate-400">
                            NIS: {u.nis || '-'} • {u.class_name || 'SD'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">- Staf Sistem -</span>
                      )}
                    </td>
                    <td className="py-3">
                      {u.is_active ? (
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <UserX className="w-3 h-3" /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[10px]">
                      {u.created_at ? String(u.created_at).split(/[\sT]/)[0] : 'Sistem'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Ubah Pengguna"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`p-1.5 rounded-xl transition-colors ${
                            u.is_active
                              ? 'text-rose-500 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Pengguna */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingUser ? 'Ubah Akun Pengguna' : 'Buat Akun Pengguna Baru'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Contoh: petugas_ani"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi {editingUser ? '(Kosongkan jika tidak diganti)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingUser ? '••••••••' : 'Masukkan password'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peran (Role) *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="petugas">Petugas Perpustakaan</option>
                  <option value="admin">Administrator</option>
                  <option value="siswa">Siswa</option>
                </select>
              </div>

              {form.role === 'siswa' && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Informasi Siswa</p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nama Lengkap Siswa</label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="Nama siswa"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">NIS</label>
                      <input
                        type="text"
                        value={form.nis}
                        onChange={(e) => setForm({ ...form, nis: e.target.value })}
                        placeholder="10001"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Kelas</label>
                      <input
                        type="text"
                        value={form.class_name}
                        onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                        placeholder="Kelas 4A"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={Boolean(form.is_active)}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">Akun Aktif (Bisa Login)</span>
                </label>
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
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {editingUser ? 'Simpan Akun' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

