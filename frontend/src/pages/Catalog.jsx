import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';
import BookCover from '../components/BookCover';
import MobileFilterDrawer from '../components/MobileFilterDrawer';
import {
  Search,
  Filter,
  BookOpen,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  GraduationCap,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read URL query parameters
  const currentSearch = searchParams.get('q') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentType = searchParams.get('type') || '';
  const currentGrade = searchParams.get('grade') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    // Load category list
    api
      .get('/categories')
      .then((r) => setCategories(r.data.data || []))
      .catch(console.error);
  }, []);

  const fetchBooks = () => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: 15,
      sort: currentSort,
    };
    if (currentSearch) params.search = currentSearch;
    if (currentType) params.type = currentType;
    if (currentCategory) params.category = currentCategory;
    if (currentGrade) params.grade = currentGrade;

    api
      .get('/books', { params })
      .then((r) => {
        setBooks(r.data.data || []);
        if (r.data.pagination) {
          setPagination(r.data.pagination);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setSearchInput(currentSearch);
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSearch, currentCategory, currentType, currentGrade, currentSort, currentPage]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset page to 1 on any filter change (except pagination change itself)
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('q', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    currentSearch || currentCategory || currentType || currentGrade || (currentSort && currentSort !== 'newest')
  );
  const activeFilterCount = [
    currentCategory ? 1 : 0,
    currentType ? 1 : 0,
    currentGrade ? 1 : 0,
    currentSort && currentSort !== 'newest' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm min-h-[130px] flex items-center border border-slate-200/80">
        <img
          src="/img/Banner-panjang.jpg"
          alt="Banner Katalog Perpustakaan"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-sky-950/80 to-blue-900/40" />
        <div className="relative z-10 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">Katalog Buku Perpustakaan</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">
              Temukan buku pelajaran, dongeng, sains, komik edukasi, dan cerita menarik!
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 border border-white/30 px-4 py-2 rounded-2xl backdrop-blur-md text-xs font-bold shrink-0">
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>{pagination.total} Total Koleksi</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-3.5">
        {/* Search input form & Mobile Filter Trigger */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari judul, penulis, kode buku..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl shrink-0 relative"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Desktop Search Button */}
          <button
            type="submit"
            className="hidden sm:block bg-[#1E74FD] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-2xl shadow-xs transition-colors shrink-0"
          >
            Cari Buku
          </button>
        </form>

        {/* Mobile Horizontal Category Scroller */}
        <div className="md:hidden overflow-x-auto no-scrollbar flex items-center gap-1.5 py-1 -mx-1 px-1">
          <button
            onClick={() => updateParam('category', '')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              !currentCategory
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateParam('category', c.name === currentCategory ? '' : c.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                currentCategory === c.name
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Desktop / Tablet Filters Controls Row: Sorting, Jenis, Kelas */}
        <div className="hidden md:grid md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Sorting */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-500">Urutkan:</span>
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none flex-1 cursor-pointer"
            >
              <option value="newest">Buku Terbaru</option>
              <option value="oldest">Buku Terlama</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="title">Judul (A - Z)</option>
            </select>
          </div>

          {/* Filter Jenis Buku */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-500">Jenis:</span>
            <select
              value={currentType}
              onChange={(e) => updateParam('type', e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none flex-1 cursor-pointer"
            >
              <option value="">Semua (Digital & Fisik)</option>
              <option value="digital">Buku Digital (E-Book)</option>
              <option value="fisik">Buku Fisik</option>
            </select>
          </div>

          {/* Filter Kelas */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs">
            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-500">Tingkat Kelas:</span>
            <select
              value={currentGrade}
              onChange={(e) => updateParam('grade', e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none flex-1 cursor-pointer"
            >
              <option value="">Semua Kelas</option>
              <option value="1">Kelas 1 SD</option>
              <option value="2">Kelas 2 SD</option>
              <option value="3">Kelas 3 SD</option>
              <option value="4">Kelas 4 SD</option>
              <option value="5">Kelas 5 SD</option>
              <option value="6">Kelas 6 SD</option>
            </select>
          </div>
        </div>

        {/* Desktop / Tablet Kategori Pills */}
        <div className="hidden md:block pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Kategori Buku:</span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-500 hover:underline font-bold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Bersihkan Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => updateParam('category', '')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                !currentCategory
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => updateParam('category', c.name === currentCategory ? '' : c.name)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  currentCategory === c.name
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar Buku */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold text-sm">
          Memuat daftar buku...
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Search className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-700">Tidak ada buku yang cocok</h4>
          <p className="text-xs text-slate-400 mt-1">
            Coba gunakan kata kunci pencarian lain atau klik Bersihkan Filter.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-4 bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Tampilkan Semua Buku
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col justify-between hover:shadow-lg transition-all group"
            >
              <div>
                <BookCover title={b.title} category={b.category_name} coverPath={b.cover_path} />
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                    {b.category_name || 'Umum'}
                  </span>
                  <h4
                    className="text-xs font-bold text-slate-800 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight"
                    title={b.title}
                  >
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Penulis: {b.author || 'Anonim'}</p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-50">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <span>{b.rating ? Number(b.rating).toFixed(1) : '-'}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    {b.book_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    to={`/books/${b.id}`}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold py-1.5 rounded-xl text-center transition-colors"
                  >
                    Detail
                  </Link>
                  {b.book_type === 'digital' || b.book_type === 'keduanya' ? (
                    <Link
                      to={`/read/${b.id}`}
                      className="bg-[#1E74FD] hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 rounded-xl text-center shadow-xs transition-colors"
                    >
                      Baca
                    </Link>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold py-1.5 rounded-xl text-center flex items-center justify-center">
                      Fisik
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Menampilkan halaman <strong>{pagination.page}</strong> dari <strong>{pagination.totalPages}</strong> (Total {pagination.total} buku)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateParam('page', Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (pagination.totalPages > 5 && pagination.page > 3) {
                  pageNum = pagination.page - 2 + i;
                  if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - (4 - i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateParam('page', pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => updateParam('page', Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Berikutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Filter Sheet */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        categories={categories}
        currentSort={currentSort}
        currentType={currentType}
        currentGrade={currentGrade}
        currentCategory={currentCategory}
        onApply={(key, val) => updateParam(key, val)}
        onReset={clearAllFilters}
      />
    </div>
  );
}