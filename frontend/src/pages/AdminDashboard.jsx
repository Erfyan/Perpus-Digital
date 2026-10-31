import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin').then((r) => setStats(r.data.stats)); }, []);
  if (!stats) return <div className="p-8">Memuat...</div>;
  const cards = [
    ['Total Buku', stats.totalBooks],
    ['Buku Digital', stats.totalDigital],
    ['Siswa', stats.totalStudents],
    ['Peminjaman', stats.totalLoans],
    ['Aktif Dipinjam', stats.activeLoans],
  ];
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Dashboard Admin/Petugas</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map(([label, value]) => (
          <div key={label} className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-cyan-600">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
