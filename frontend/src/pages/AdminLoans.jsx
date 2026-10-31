import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function AdminLoans() {
  const [items, setItems] = useState([]);
  const load = () => api.get('/loans').then((r) => setItems(r.data.data));
  useEffect(() => { load(); }, []);
  const ret = async (id) => { await api.put(`/loans/${id}/return`); load(); };
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Peminjaman Buku</h2>
      <div className="space-y-2">
        {items.map((l) => (
          <div key={l.id} className="bg-white rounded-xl shadow p-3 flex justify-between items-center">
            <div>
              <p className="font-semibold">{l.loan_code} - {l.full_name || l.username}</p>
              <p className="text-xs text-gray-500">Status: {l.status} | Jatuh tempo: {l.due_date}</p>
            </div>
            {l.status !== 'dikembalikan' && <button onClick={() => ret(l.id)} className="text-xs text-green-600">Kembalikan</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
