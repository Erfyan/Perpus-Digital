import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import BookCover from '../../components/BookCover';
import {
  Library,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  BookOpen,
  Download,
  Eye,
  Edit2,
  X,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

export default function PetugasDigitalBooks() {
  const [digitalBooks, setDigitalBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(100);
  const [canRead, setCanRead] = useState(true);
  const [canDownload, setCanDownload] = useState(false);
  const [copyrightConfirmed, setCopyrightConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit Permission Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editCanRead, setEditCanRead] = useState(true);
  const [editCanDownload, setEditCanDownload] = useState(false);
  const [editPages, setEditPages] = useState(100);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadDigitalBooks = () => {
    setLoading(true);
    api
      .get('/digital-books', { params: { search } })
      .then((r) => setDigitalBooks(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadCandidateBooks = () => {
    api
      .get('/books', { params: { limit: 100 } })
      .then((r) => {
        setAvailableBooks(r.data.data || []);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadDigitalBooks();
  }, [search]);

  const openUploadModal = () => {
    loadCandidateBooks();
    setSelectedBookId('');
    setFile(null);
    setTotalPages(100);
    setCanRead(true);
    setCanDownload(false);
    setCopyrightConfirmed(false);
    setErrorMsg('');
    setUploadModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditCanRead(Boolean(item.can_read));
    setEditCanDownload(Boolean(item.can_download));
    setEditPages(item.total_pages || 100);
    setErrorMsg('');
    setEditModalOpen(true);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setErrorMsg('');
    if (!selected) {
      setFile(null);
      return;
    }

    if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
      setErrorMsg('Peringatan: Hanya file format dokumen PDF (.pdf) yang diizinkan!');
      setFile(null);
      e.target.value = '';
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setErrorMsg('Peringatan: Ukuran file melebihi batas maksimal 50 MB!');
      setFile(null);
      e.target.value = '';
      return;
    }

    setFile(selected);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedBookId) {
      setErrorMsg('Silakan pilih judul buku yang ingin ditambahkan berkas digitalnya');
      return;
    }
    if (!file) {
      setErrorMsg('Silakan pilih berkas PDF buku');
      return;
    }
    if (!copyrightConfirmed) {
      setErrorMsg('Anda wajib mengonfirmasi kepatuhan terhadap lisensi hak cipta buku (PRD Bagian 23)');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('book_id', selectedBookId);
    formData.append('file', file);
    formData.append('total_pages', totalPages);
    formData.append('can_read', canRead);
    formData.append('can_download', canDownload);
    formData.append('copyright_confirmed', copyrightConfirmed);

    try {
      await api.post('/digital-books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg('Berkas PDF buku digital berhasil diunggah!');
      setUploadModalOpen(false);
      loadDigitalBooks();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengunggah file PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleEditPermissionSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await api.put(`/digital-books/${editingItem.id}`, {
        can_read: editCanRead,
        can_download: editCanDownload,
        total_pages: editPages,
      });
      setSuccessMsg('Pengaturan izin hak akses buku digital berhasil diperbarui');
      setEditModalOpen(false);
      loadDigitalBooks();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memperbarui izin');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus berkas digital untuk buku "${title}"?`)) return;
    try {
      await api.delete(`/digital-books/${id}`);
      setSuccessMsg(`Berkas digital untuk "${title}" berhasil dihapus`);
      loadDigitalBooks();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus file digital');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-sky-700 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Manajemen Buku Digital (PDF) <Library className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Unggah file PDF, pantau jumlah halaman, serta atur izin membaca online dan unduh siswa.
          </p>
        </div>
        <button
          onClick={openUploadModal}
          className="bg-white text-indigo-700 hover:bg-blue-50 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition-all shrink-0"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" /> Unggah PDF Buku
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
            placeholder="Cari judul buku digital, nama file, atau kode buku..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Tabel Buku Digital */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">Memuat koleksi buku digital...</div>
        ) : digitalBooks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            Belum ada berkas buku digital yang diunggah.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Buku & Cover</th>
                  <th className="pb-3 font-bold">Nama Berkas</th>
                  <th className="pb-3 font-bold">Halaman</th>
                  <th className="pb-3 font-bold">Baca Online (can_read)</th>
                  <th className="pb-3 font-bold">Izin Unduh (can_download)</th>
                  <th className="pb-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {digitalBooks.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 shrink-0">
                          <BookCover title={item.title} category={item.category_name} className="!p-1" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 line-clamp-1">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.code || 'BK-SD'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 font-medium">
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="truncate max-w-[180px]" title={item.file_name}>
                          {item.file_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {item.file_size ? `${Math.round(item.file_size / 1024)} KB` : 'Dokumen PDF'}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-slate-700">{item.total_pages || 0} hal</td>
                    <td className="py-3">
                      {item.can_read ? (
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Diizinkan
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Dibatasi
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {item.can_download ? (
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Download className="w-3 h-3" /> Ya (Boleh)
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                          Tidak (Ditolak)
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/read/${item.book_id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Lihat / Baca Reader"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          title="Atur Hak Akses"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Hapus Digital Book"
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
      </div>

      {/* Modal Upload Berkas PDF Baru */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">Unggah Berkas PDF Buku Digital</h3>
              <button onClick={() => setUploadModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-600 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Judul Buku *</label>
                <select
                  required
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value="">-- Pilih Buku yang akan diunggah PDF-nya --</option>
                  {availableBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.code || 'BK-SD'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih File PDF * (Maks. 50 MB, Hanya .pdf)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-2xl p-2 bg-slate-50 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimasi Total Halaman</label>
                <input
                  type="number"
                  min="1"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canRead}
                    onChange={(e) => setCanRead(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Izinkan Siswa Membaca Online (can_read)</p>
                    <p className="text-[10px] text-slate-400">Buku dapat dibuka langsung di in-browser PDF reader</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canDownload}
                    onChange={(e) => setCanDownload(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Izinkan Siswa Mengunduh File PDF (can_download)</p>
                    <p className="text-[10px] text-slate-400">Tombol download aktif dan diverifikasi server</p>
                  </div>
                </label>
              </div>

              {/* Poin 7: Peringatan Hak Cipta PRD Bagian 23 */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-black text-amber-900 uppercase tracking-wide">
                      Ketentuan Hak Cipta & Lisensi Buku (PRD Bagian 23)
                    </h5>
                    <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                      Pengunggah hanya boleh mengunggah buku milik sekolah, berlisensi resmi, domain publik (public domain), atau buku yang telah memperoleh izin tertulis pemegang hak cipta. Sistem perpustakaan tidak boleh digunakan untuk mendistribusikan materi berhak cipta tanpa izin.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-amber-200/60">
                  <input
                    type="checkbox"
                    required
                    checked={copyrightConfirmed}
                    onChange={(e) => setCopyrightConfirmed(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <span className="text-[11px] font-bold text-amber-900">
                    Saya menyatakan berkas digital ini memenuhi ketentuan hak cipta sekolah dan berlisensi sah. *
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50"
                >
                  {uploading ? 'Mengunggah Berkas...' : 'Mulai Unggah PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Hak Akses (can_read / can_download) */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">Atur Izin Buku Digital</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="mt-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
              <p className="text-xs font-bold text-slate-800">{editingItem.title}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{editingItem.file_name}</p>
            </div>

            <form onSubmit={handleEditPermissionSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Halaman</label>
                <input
                  type="number"
                  min="1"
                  value={editPages}
                  onChange={(e) => setEditPages(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editCanRead}
                    onChange={(e) => setEditCanRead(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Izin Membaca Online (can_read)</p>
                    <p className="text-[10px] text-slate-400">Aktifkan agar siswa bisa membaca di browser</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editCanDownload}
                    onChange={(e) => setEditCanDownload(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Izin Unduh File PDF (can_download)</p>
                    <p className="text-[10px] text-slate-400">Izinkan siswa mengunduh file dokumen PDF</p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
