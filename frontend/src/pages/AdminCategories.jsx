import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const load = () => api.get('/categories').then((r) => setItems(r.data.data));
  useEffect(() => { load(); }, []);
  const add = async (e) => {
    e.preventDefault();
    await api.post('/categories', { name });
    setName('');
    load();
  };
  const remove = async (id) => {
    await api.delete(`/categories/${id}`);
    load();
  };
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Kelola Kategori</h2>
      <form onSubmit={add} className="flex gap-2">
        <input className="border rounded-lg px-3 py-2 flex-1" placeholder="Nama kategori" value={name} onChange={(e)=>setName(e.target.value)} />
        <button className="bg-cyan-500 text-white px-4 rounded-lg">Tambah</button>
      </form>
      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow p-3 flex justify-between items-center">
            <span>{c.name}</span>
            <button onClick={() => remove(c.id)} className="text-xs text-red-500">Hapus</button>
          </div>
        ))}
      </div>
    </div>
  );
}
