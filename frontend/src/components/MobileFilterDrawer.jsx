import { X, Check, RotateCcw, Filter, ArrowUpDown, GraduationCap, Sparkles } from 'lucide-react';

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  categories = [],
  currentSort,
  currentType,
  currentGrade,
  currentCategory,
  onApply,
  onReset,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-Up Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
        {/* Header Handle */}
        <div className="flex flex-col items-center pt-3 pb-2 border-b border-slate-100">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 mb-2" />
          <div className="w-full px-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Filter className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Filter & Urutkan Buku</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Filter Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. Urutkan */}
          <div>
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-2.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              Urutkan Berdasarkan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'newest', label: '✨ Terbaru' },
                { value: 'rating', label: '⭐ Rating Tertinggi' },
                { value: 'title', label: '🔤 Judul (A - Z)' },
                { value: 'oldest', label: '📅 Terlama' },
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => onApply('sort', s.value)}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border text-left flex items-center justify-between ${
                    currentSort === s.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{s.label}</span>
                  {currentSort === s.value && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Jenis Buku */}
          <div>
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Format / Jenis Buku
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: '', label: 'Semua' },
                { value: 'digital', label: '📱 Digital' },
                { value: 'fisik', label: '📖 Fisik' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => onApply('type', t.value)}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border text-center ${
                    currentType === t.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tingkat Kelas */}
          <div>
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-2.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              Tingkat Kelas SD
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => onApply('grade', '')}
                className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition-all col-span-4 ${
                  !currentGrade
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Semua Tingkat Kelas
              </button>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <button
                  key={g}
                  onClick={() => onApply('grade', String(g))}
                  className={`px-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                    currentGrade === String(g)
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Kelas {g}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Kategori Buku */}
          <div>
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-2.5">
              🏷️ Kategori Buku
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onApply('category', '')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  !currentCategory
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onApply('category', c.name === currentCategory ? '' : c.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    currentCategory === c.name
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="flex-1 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filter
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-300/40 transition-colors"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  );
}

