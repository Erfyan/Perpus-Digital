import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

export default function MobileSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/catalog?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const quickTags = [
    { label: 'Dongeng', category: 'Dongeng' },
    { label: 'Sains', category: 'Sains' },
    { label: 'Matematika', category: 'Pelajaran' },
    { label: 'Cerita Seru', category: 'Cerita' },
    { label: 'Komik Edukasi', category: 'Komik Edukasi' },
    { label: 'Buku Digital', type: 'digital' },
  ];

  const handleTagClick = (tag) => {
    onClose();
    if (tag.category) {
      navigate(`/catalog?category=${encodeURIComponent(tag.category)}`);
    } else if (tag.type) {
      navigate(`/catalog?type=${tag.type}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-200">
      {/* Top Search Bar */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
          <Search className="w-5 h-5 text-blue-600 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik judul buku, cerita, atau penulis..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-2"
        >
          Batal
        </button>
      </div>

      {/* Suggested Search & Quick Tags */}
      <div className="p-5 space-y-6 overflow-y-auto flex-1">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Kategori Populer
          </p>
          <div className="flex flex-wrap gap-2">
            {quickTags.map((tag) => (
              <button
                key={tag.label}
                onClick={() => handleTagClick(tag)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold text-slate-600 border border-slate-200/60 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tips Membaca untuk Siswa SD */}
        <div className="bg-gradient-to-tr from-blue-50 to-sky-100 rounded-3xl p-5 border border-blue-100/80">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👦💡</span>
            <div>
              <h4 className="font-black text-sm text-blue-950">Tips Menemukan Buku</h4>
              <p className="text-[11px] text-blue-700">Gunakan kata kunci singkat</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Kamu bisa mencari dengan mengetik kata seperti <strong>“kancil”</strong>, <strong>“IPA”</strong>, atau <strong>“matematika”</strong> untuk menemukan buku yang kamu sukai!
          </p>
        </div>
      </div>
    </div>
  );
}

