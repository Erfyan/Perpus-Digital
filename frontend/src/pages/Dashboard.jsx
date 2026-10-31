import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { student, logout } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/student').then((r) => setData(r.data)).catch(console.error);
  }, []);

  if (!data) return <div className="p-8">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">Perpustakaan Digital SD</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{student?.full_name} - {student?.class_name}</span>
          <button onClick={logout} className="text-sm text-red-500">Keluar</button>
        </div>
      </header>
      <main className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-cyan-400 to-purple-400 text-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold">Selamat datang, {student?.full_name}!</h2>
          <p>Membaca buku membuka jendela dunia.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Buku Digital" value={data.stats.totalDigital} />
          <StatCard label="Sudah Dibaca" value={data.stats.completed} />
          <StatCard label="Sedang Dibaca" value={data.stats.inProgress} />
          <StatCard label="Buku Favorit" value={data.stats.favorites} />
        </div>
        <section>
          <h3 className="font-semibold mb-3">Sedang Dibaca</h3>
          {data.currentlyReading.map((b) => (
            <div key={b.digital_book_id} className="bg-white rounded-xl shadow p-4 flex gap-4 items-center">
              <div className="flex-1">
                <p className="font-semibold">{b.title}</p>
                <p className="text-sm text-gray-500">Halaman {b.last_page} / {b.total_pages}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${b.progress_percentage}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </section>
        <section>
          <h3 className="font-semibold mb-3">Buku Terbaru</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.newBooks.map((b) => (
              <div key={b.id} className="bg-white rounded-xl shadow p-4">
                <p className="font-semibold">{b.title}</p>
                <p className="text-xs text-gray-500">{b.category_name}</p>
                <p className="text-sm text-yellow-500">★ {b.rating}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <p className="text-2xl font-bold text-cyan-600">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
