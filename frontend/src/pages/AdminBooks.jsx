import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const load = () => api.get('/books?limit=50').then((r) => setBooks(r.data.data));
  useEffect(() => { load(); }, []);
  const add = async (e) => {
    e.preventDefault();
    await api.post('/books', { title, book_type: 'fisik', stock: 1 });
    setTitle('');
    load();
  };
  const remove = async (id) => {
    await api.delete(`/books/${id}`);
    load();
  };
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Kelola Buku</h2>
      <form onSubmit={add} className="flex gap-2">
        <input className="border rounded-lg px-3 py-2 flex-1" placeholder="Judul buku baru" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <button className="bg-cyan-500 text-white px-4 rounded-lg">Tambah</button>
      </form>
      <div className="space-y-2">
        {books.map((b) => (
          <div key={b.id} className="bg-white rounded-xl shadow p-3 flex justify-between items-center">
            <span>{b.title}</span>
            <button onClick={() => remove(b.id)} className="text-xs text-red-500">Nonaktifkan</button>
          </div>
        ))}
      </div>
    </div>
  );
}
