import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Bell, Check, Info, Sparkles, BookOpen } from 'lucide-react';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    api
      .get('/notifications')
      .then((r) => setItems(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-3xl p-6 text-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Pusat Notifikasi <Bell className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Informasi penting seputar buku baru, pengingat baca, dan aktivitasmu.
          </p>
        </div>
        {items.some((i) => !i.is_read) && (
          <button
            onClick={markAllRead}
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors backdrop-blur-xs"
          >
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 font-bold text-sm">
          Memuat notifikasi...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <div className="text-5xl mb-3">🔔✨</div>
          <h4 className="text-base font-bold text-slate-700">Tidak ada notifikasi</h4>
          <p className="text-xs text-slate-400 mt-1">Semua pesan dan pengingat sudah kamu baca.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 flex items-start justify-between gap-4 transition-all ${
                n.is_read
                  ? 'border-slate-100 opacity-75'
                  : 'border-blue-200 bg-blue-50/20 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    n.is_read ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-xs'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    {n.created_at ? n.created_at.replace('T', ' ').substring(0, 16) : 'Baru saja'}
                  </p>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-xl transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Selesai
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
