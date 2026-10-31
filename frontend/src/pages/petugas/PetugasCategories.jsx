import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

export default function PetugasCategories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', icon_name: 'BookOpen', color_theme: 'blue' });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadCategories = () => {
    setLoading(true);
    api
      .get('/categories', { params: { search } })
      .then((r) => setCategories(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, [search]);

  const openAddModal = () => {
    setEditingCategory(null);
    setForm({ name: '', slug: '', icon_name: 'BookOpen', color_theme: 'blue' });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      icon_name: cat.icon_name || 'BookOpen',
      color_theme: cat.color_theme || 'blue',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleNameChange = (val) => {
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: !editingCategory ? val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : prev.slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.name.trim()) {
      setErrorMsg('Nama kategori wajib diisi');
      return;
    }

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, form);
        setSuccessMsg(`Kategori "${form.name}" berhasil diperbarui`);
      } else {
        await api.post('/categories', form);
        setSuccessMsg(`Kategori "${form.name}" berhasil dibuat`);
      }
      setModalOpen(false);
      loadCategories();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${name}"? Buku yang terhubung akan dialihkan ke kategori umum.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      setSuccessMsg(`Kategori "${name}" berhasil dihapus`);
      loadCategories();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus kategori');
    }
  };

  const COLOR_OPTIONS = [
    { id: 'blue', label: 'Biru' },
    { id: 'pink', label: 'Pink / Merah Muda' },
    { id: 'purple', label: 'Ungu' },
    { id: 'green', label: 'Hijau' },
    { id: 'orange', label: 'Oranye' },
    { id: 'amber', label: 'Kuning / Amber' },
    { id: 'cyan', label: 'Cyan / Biru Langit' },
    { id: 'red', label: 'Merah' },
    { id: 'teal', label: 'Teal' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Manajemen Kategori Buku <FolderTree className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 mt-1">
            Kelola klasifikasi buku sekolah dasar, ikon label, dan tema warna visual.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-white text-purple-600 hover:bg-purple-50 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Tambah Kategori
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kategori buku..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-700 outline-none focus:border-purple-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Grid Kategori */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">Memuat kategori...</div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">Tidak ada kategori yang cocok.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {categories.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-2xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">{c.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">slug: {c.slug}</p>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.2 rounded-full inline-block mt-1">
                      {c.book_count || 0} buku
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Ubah"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Kategori */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingCategory ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Komik Edukasi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slug URL</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="komik-edukasi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-mono text-slate-700 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tema Warna</label>
                <select
                  value={form.color_theme}
                  onChange={(e) => setForm({ ...form, color_theme: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                >
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
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
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                >
                  {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

