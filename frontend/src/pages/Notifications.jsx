import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Notifications() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/notifications').then((r) => setItems(r.data.data)); }, []);
  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
  };
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Notifikasi</h2>
      <div className="space-y-3">
        {items.map((n) => (
          <div key={n.id} className={`bg-white rounded-xl shadow p-4 ${n.is_read ? 'opacity-60' : ''}`}>
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-gray-500">{n.message}</p>
            {!n.is_read && <button onClick={() => markRead(n.id)} className="text-xs text-cyan-500 mt-2">Tandai dibaca</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
