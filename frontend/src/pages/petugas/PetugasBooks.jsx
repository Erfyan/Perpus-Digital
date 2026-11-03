import { useEffect, useState } from 'react';
import api from '../../lib/api';
import BookCover from '../../components/BookCover';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function PetugasBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState({
    title: '',
    code: '',
    isbn: '',
    author: '',
    publisher: '',
    publication_year: new Date().getFullYear(),
    category_id: '',
    book_type: 'fisik',
    stock: 5,
    available_stock: 5,
    description: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadCategories = () => {
    api.get('/categories').then((r) => setCategories(r.data.data || [])).catch(console.error);
  };

  const loadBooks = (page = pagination.page) => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (categoryFilter) params.category = categoryFilter;
    if (typeFilter) params.type = typeFilter;

    api
      .get('/books', { params })
      .then((r) => {
        setBooks(r.data.data || []);
        if (r.data.pagination) setPagination(r.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBooks(1);
  }, [categoryFilter, typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadBooks(1);
  };

  const openAddModal = () => {
    setEditingBook(null);
    setForm({
      title: '',
      code: '',
      isbn: '',
      author: '',
      publisher: '',
      publication_year: new Date().getFullYear(),
      category_id: categories[0]?.id || '',
      book_type: 'fisik',
      stock: 5,
      available_stock: 5,
      description: '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title || '',
      code: book.code || '',
      isbn: book.isbn || '',
      author: book.author || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year || new Date().getFullYear(),
      category_id: book.category_id || '',
      book_type: book.book_type || 'fisik',
      stock: book.stock ?? 0,
      available_stock: book.available_stock ?? 0,
      description: book.description || '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validasi frontend
    if (!form.title.trim()) {
      setErrorMsg('Judul buku wajib diisi');
      return;
    }
    if (Number(form.stock) < 0) {
      setErrorMsg('Stok buku tidak boleh bernilai negatif');
      return;
    }
    if (Number(form.available_stock) < 0) {
      setErrorMsg('Stok tersedia tidak boleh bernilai negatif');
      return;
    }
    if (Number(form.available_stock) > Number(form.stock)) {
      setErrorMsg('Stok tersedia tidak boleh melebihi total stok');
      return;
    }

    try {
      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, form);
        setSuccessMsg(`Buku "${form.title}" berhasil diperbarui`);
      } else {
        await api.post('/books', form);
        setSuccessMsg(`Buku baru "${form.title}" berhasil ditambahkan`);
      }
      setModalOpen(false);
      loadBooks(editingBook ? pagination.page : 1);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data buku');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin menonaktifkan buku "${title}"?`)) return;
    try {
      await api.delete(`/books/${id}`);
      setSuccessMsg(`Buku "${title}" berhasil dinonaktifkan`);
      loadBooks(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menonaktifkan buku');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Katalog & Manajemen Buku <BookOpen className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Kelola data buku fisik, stok tersedia, informasi penerbit, dan kategori.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-white text-blue-600 hover:bg-blue-50 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Tambah Buku Baru
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, penulis, kode buku, atau kata kunci..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100"
            />
          </form>

          {/* Filter Kategori */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Filter Jenis */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="">Semua Jenis</option>
            <option value="fisik">Fisik Saja</option>
            <option value="digital">Digital Saja</option>
          </select>
        </div>
      </div>

      {/* Tabel Buku */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">Memuat katalog buku...</div>
        ) : books.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">Tidak ada buku yang cocok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Cover & Buku</th>
                  <th className="pb-3 font-bold">Kode / ISBN</th>
                  <th className="pb-3 font-bold">Kategori</th>
                  <th className="pb-3 font-bold">Tipe</th>
                  <th className="pb-3 font-bold">Stok Tersedia</th>
                  <th className="pb-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 shrink-0">
                          <BookCover title={b.title} category={b.category_name} coverPath={b.cover_path} className="!p-1" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 line-clamp-1">{b.title}</p>
                          <p className="text-[10px] text-slate-400">Penulis: {b.author || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-600">
                      {b.code || '-'}
                      {b.isbn && <span className="block text-[10px] text-slate-400">{b.isbn}</span>}
                    </td>
                    <td className="py-3">
                      <span className="bg-blue-50 text-blue-600 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {b.category_name || '-'}
                      </span>
                    </td>
                    <td className="py-3 uppercase font-bold text-[10px] text-slate-500">
                      {b.book_type}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={b.available_stock > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {b.available_stock}
                        </span>
                        <span className="text-slate-400">/ {b.stock} eks</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Ubah Buku"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.title)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Nonaktifkan"
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
              Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total buku)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadBooks(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => loadBooks(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Buku */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingBook ? 'Ubah Data Buku' : 'Tambah Buku Baru'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Buku *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Belajar Berhitung Kelas 4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Buku (Opsional)</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="Contoh: BK-012"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    placeholder="Nomor ISBN"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penulis</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="Nama penulis"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penerbit</label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                    placeholder="Nama penerbit"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Buku</label>
                  <select
                    value={form.book_type}
                    onChange={(e) => setForm({ ...form, book_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="fisik">Fisik</option>
                    <option value="digital">Digital</option>
                    <option value="keduanya">Keduanya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Terbit</label>
                  <input
                    type="number"
                    value={form.publication_year}
                    onChange={(e) => setForm({ ...form, publication_year: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Input Stok dengan Validasi Tidak Boleh Negatif */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Stok *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Minimal 0</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stok Tersedia *</label>
                  <input
                    type="number"
                    min="0"
                    max={form.stock}
                    required
                    value={form.available_stock}
                    onChange={(e) => setForm({ ...form, available_stock: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Maksimal = total stok</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sinopsis / Deskripsi</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Keterangan singkat isi buku..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
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
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  {editingBook ? 'Simpan Perubahan' : 'Tambah Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

