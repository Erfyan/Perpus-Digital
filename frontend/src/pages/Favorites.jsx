import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import BookCover from '../components/BookCover';
import { Heart, Trash2, BookOpen, Star } from 'lucide-react';

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = () => {
    setLoading(true);
    api
      .get('/favorites')
      .then((r) => setItems(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (bookId) => {
    try {
      await api.delete(`/favorites/${bookId}`);
      setItems((prev) => prev.filter((i) => i.book_id !== bookId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-rose-500 rounded-3xl p-6 text-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Buku Favorit Saya <Heart className="w-6 h-6 fill-white text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 mt-1">
            Daftar buku-buku istimewa yang kamu simpan untuk dibaca kembali!
          </p>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-2xl font-bold text-xs backdrop-blur-xs">
          {items.length} Buku Favorit
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-bold text-sm">
          Memuat buku favorit...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Heart className="w-8 h-8 fill-rose-400 text-rose-500" />
          </div>
          <h4 className="text-base font-bold text-slate-700">Belum ada buku favorit</h4>
          <p className="text-xs text-slate-400 mt-1">
            Tekan tombol hati pada buku di katalog untuk menambahkannya ke sini.
          </p>
          <Link
            to="/catalog"
            className="mt-4 inline-block bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Jelajahi Katalog Buku
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((b) => (
            <div
              key={b.id || b.book_id}
              className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <BookCover title={b.title} category={b.category_name} coverPath={b.cover_path} />
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block">
                    {b.category_name || 'Cerita'}
                  </span>
                  <h4
                    className="text-xs font-bold text-slate-800 mt-1 line-clamp-1 group-hover:text-purple-600 transition-colors"
                    title={b.title}
                  >
                    {b.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <span>{b.rating ? Number(b.rating).toFixed(1) : '4.8'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-50 flex items-center gap-2">
                <Link
                  to={`/read/${b.book_id}`}
                  className="flex-1 bg-[#1E74FD] hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 rounded-xl text-center shadow-xs transition-colors"
                >
                  Baca
                </Link>
                <button
                  onClick={() => removeFavorite(b.book_id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Hapus dari Favorit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
