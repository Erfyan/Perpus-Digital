import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    api.get(`/books/${id}`).then((r) => setBook(r.data.data));
  }, [id]);

  const toggleFav = async () => {
    if (fav) {
      await api.delete(`/favorites/${id}`);
      setFav(false);
    } else {
      await api.post('/favorites', { book_id: Number(id) });
      setFav(true);
    }
  };

  if (!book) return <div className="p-8">Memuat...</div>;

  const digital = book.digital;

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow p-6 flex gap-6">
        <div className="w-32 h-44 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">Cover</div>
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold">{book.title}</h1>
          <p className="text-gray-500">{book.category_name}</p>
          <p>Penulis: {book.author}</p>
          <p>Penerbit: {book.publisher} ({book.publication_year})</p>
          <p>Rating: ★ {book.rating}</p>
          <p className="text-sm">{book.description}</p>
          <div className="flex gap-2 pt-2">
            <button onClick={toggleFav} className="px-4 py-2 rounded-lg border">{fav ? 'Hapus Favorit' : 'Favorit'}</button>
            {digital?.can_read ? <a href={`/read/${id}`} className="px-4 py-2 rounded-lg bg-cyan-500 text-white">Baca Sekarang</a> : null}
            {digital?.can_download ? <button className="px-4 py-2 rounded-lg bg-green-500 text-white">Download</button> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
