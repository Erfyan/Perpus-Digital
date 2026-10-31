import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  BookmarkCheck,
  MoreHorizontal,
  Bell,
  Users,
  Repeat,
  Shield
} from 'lucide-react';

export default function MobileBottomNav({ user, unreadCount, onOpenMore }) {
  const location = useLocation();

  // Konfigurasi 4 Tab Utama sesuai Role + 1 Tombol "Lainnya"
  let primaryTabs = [];

  if (user?.role === 'siswa') {
    primaryTabs = [
      { to: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
      { to: '/catalog', label: 'Katalog', icon: BookOpen },
      { to: '/favorites', label: 'Favorit', icon: Heart },
      { to: '/my-loans', label: 'Peminjam', icon: BookmarkCheck },
    ];
  } else if (user?.role === 'petugas') {
    primaryTabs = [
      { to: '/petugas', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/petugas/books', label: 'Katalog', icon: BookOpen },
      { to: '/petugas/loans', label: 'Pinjam', icon: Repeat },
      { to: '/petugas/students', label: 'Siswa', icon: Users },
    ];
  } else {
    // Admin
    primaryTabs = [
      { to: '/admin', label: 'Admin', icon: Shield },
      { to: '/admin/users', label: 'Pengguna', icon: Users },
      { to: '/admin/books', label: 'Buku', icon: BookOpen },
      { to: '/admin/loans', label: 'Pinjaman', icon: Repeat },
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
      {/* Floating Glassmorphism Island */}
      <nav className="pointer-events-auto max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-300/40 p-1.5 flex items-center justify-around">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.to;

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex-1 relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 select-none ${
                isActive
                  ? 'text-blue-600 font-extrabold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {/* Active Indicator Glow Pill */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-blue-600 animate-pulse shadow-sm shadow-blue-400" />
              )}

              <div
                className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-xs'
                    : 'bg-transparent text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                {tab.label}
              </span>
            </NavLink>
          );
        })}

        {/* Tab 5: Tombol Buka Menu Selengkapnya (Drawer) */}
        <button
          onClick={onOpenMore}
          className="flex-1 relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl text-slate-400 hover:text-blue-600 transition-all select-none"
        >
          {unreadCount > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
          <div className="p-1.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-none font-medium">
            Menu
          </span>
        </button>
      </nav>
    </div>
  );
}

