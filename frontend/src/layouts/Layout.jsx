import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, student, logout } = useAuth();
  const navigate = useNavigate();
  const nav = [
    ['Dashboard','/dashboard'],
    ['Katalog','/catalog'],
    ['Favorit','/favorites'],
    ['Riwayat','/history'],
    ['Notifikasi','/notifications'],
  ];
  if (user?.role !== 'siswa') nav.push(['Admin','/admin']);
  nav.push(['Kelola Buku','/admin/books']);
  nav.push(['Kategori','/admin/categories']);
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white shadow p-4 space-y-2">
        <h1 className="font-bold text-cyan-600 mb-4">Perpus Digital SD</h1>
        {nav.map(([label,to]) => (
          <Link key={to} to={to} className="block px-3 py-2 rounded-lg hover:bg-cyan-50">{label}</Link>
        ))}
        <button onClick={() => { logout(); navigate('/login'); }} className="block w-full text-left px-3 py-2 text-red-500">Keluar</button>
      </aside>
      <main className="flex-1">
        <header className="bg-white shadow p-4 flex justify-between">
          <span className="font-semibold">Halo, {student?.full_name || user?.username}</span>
          <span className="text-sm text-gray-500">{student?.class_name || user?.role}</span>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
