import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const load = () => {
    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    api.get('/books', { params }).then((r) => setBooks(r.data.data));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Katalog Buku</h2>
      <div className="flex gap-2">
        <input className="border rounded-lg px-3 py-2 flex-1" placeholder="Cari buku..." value={search} onChange={(e)=>setSearch(e.target.value)} />
        <select className="border rounded-lg px-3 py-2" value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="">Semua</option>
          <option value="digital">Digital</option>
          <option value="fisik">Fisik</option>
        </select>
        <button onClick={load} className="bg-cyan-500 text-white px-4 rounded-lg">Cari</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {books.map((b) => (
          <div key={b.id} className="bg-white rounded-xl shadow p-4">
            <Link to={`/books/${b.id}`} className="font-semibold hover:underline">{b.title}</Link>
            <p className="text-xs text-gray-500">{b.category_name}</p>
            <p className="text-sm text-yellow-500">★ {b.rating}</p>
            <p className="text-xs">{b.book_type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
