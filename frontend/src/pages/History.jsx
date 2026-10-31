import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function History() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/reading-history').then((r) => setItems(r.data.data)); }, []);
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Riwayat Membaca</h2>
      <div className="space-y-3">
        {items.map((h, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-4 flex justify-between">
            <div>
              <p className="font-semibold">{h.title}</p>
              <p className="text-xs text-gray-500">{h.last_read_at}</p>
            </div>
            <p className="text-sm">{h.progress_percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
