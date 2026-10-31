import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Favorites() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/favorites').then((r) => setItems(r.data.data)); }, []);
  const remove = async (bookId) => {
    await api.delete(`/favorites/${bookId}`);
    setItems((prev) => prev.filter((i) => i.book_id !== bookId));
  };
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Buku Favorit</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((b) => (
          <div key={b.id} className="bg-white rounded-xl shadow p-4">
            <p className="font-semibold">{b.title}</p>
            <p className="text-xs text-gray-500">{b.category_name}</p>
            <button onClick={() => remove(b.book_id)} className="text-xs text-red-500 mt-2">Hapus</button>
          </div>
        ))}
      </div>
    </div>
  );
}
