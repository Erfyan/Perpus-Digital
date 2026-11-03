import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import Aurora from '@/components/ui/aurora';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileDrawer from '../components/MobileDrawer';
import MobileSearchModal from '../components/MobileSearchModal';
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  Clock,
  BookmarkCheck,
  Bell,
  User,
  Settings,
  LogOut,
  Search,
  ChevronDown,
  Shield,
  Layers,
  FolderTree,
  Repeat,
  Users,
  Sparkles,
  Library,
  CheckCircle2,
  UserCheck,
  History,
  BarChart3,
  Database,
  Menu,
  GraduationCap
} from 'lucide-react';

export default function Layout() {
  const { user, student, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // State untuk Native Mobile Components
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Ambil count unread notifikasi jika siswa
  useEffect(() => {
    if (user?.role === 'siswa') {
      api
        .get('/notifications')
        .then((r) => {
          const unread = (r.data.data || []).filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        })
        .catch(console.error);
    }
  }, [user, location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (user?.role === 'petugas') {
        navigate(`/petugas/books?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigasi Siswa Sesuai PRD Bagian 4
  const studentNav = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Katalog Buku', to: '/catalog', icon: BookOpen },
    { label: 'Buku Favorit', to: '/favorites', icon: Heart },
    { label: 'Riwayat Membaca', to: '/history', icon: Clock },
    { label: 'Daftar Peminjam', to: '/my-loans', icon: BookmarkCheck },
    { label: 'Notifikasi', to: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Profil Saya', to: '/profile', icon: User },
    { label: 'Pengaturan', to: '/settings', icon: Settings },
  ];

  // Navigasi Khusus Petugas Sesuai PRD Bagian 2 (Hak Utama Petugas)
  const librarianNav = [
    { label: 'Dashboard Operasional', to: '/petugas', icon: LayoutDashboard },
    { label: 'Katalog Buku', to: '/petugas/books', icon: BookOpen },
    { label: 'Kategori', to: '/petugas/categories', icon: FolderTree },
    { label: 'Data Siswa', to: '/petugas/students', icon: Users },
    { label: 'Buku Digital (PDF)', to: '/petugas/digital-books', icon: Library },
    { label: 'Peminjaman', to: '/petugas/loans', icon: Repeat },
    { label: 'Pengembalian', to: '/petugas/returns', icon: CheckCircle2 },
  ];

  // Navigasi Admin Sesuai PRD Bagian 13 (13 Menu Utama)
  const adminNav = [
    { label: 'Dashboard', to: '/admin', icon: Shield },
    { label: 'Data Pengguna', to: '/admin/users', icon: Users },
    { label: 'Data Siswa', to: '/admin/students', icon: UserCheck },
    { label: 'Data Petugas', to: '/admin/librarians', icon: Shield },
    { label: 'Katalog Buku', to: '/admin/books', icon: BookOpen },
    { label: 'Kategori', to: '/admin/categories', icon: FolderTree },
    { label: 'Buku Digital', to: '/admin/digital-books', icon: Library },
    { label: 'Peminjaman', to: '/admin/loans', icon: Repeat },
    { label: 'Pengembalian', to: '/admin/returns', icon: CheckCircle2 },
    { label: 'Riwayat Membaca', to: '/admin/reading-history', icon: History },
    { label: 'Laporan', to: '/admin/reports', icon: BarChart3 },
    { label: 'Pengaturan', to: '/admin/settings', icon: Settings },
    { label: 'Backup Database', to: '/admin/backup', icon: Database },
  ];

  const activeNav = user?.role === 'petugas' ? librarianNav : user?.role === 'admin' ? adminNav : studentNav;
  const isReaderPage = location.pathname.startsWith('/read/');

  return (
    <>
    {/* Aurora Background — fixed di layer paling belakang */}
    <Aurora
      colors={['#38bdf8', '#818cf8', '#c084fc']}
      duration={25}
      intensity={0.15}
      className="!fixed inset-0 pointer-events-none"
      style={{ zIndex: -100 }}
    />
    {/* Konten utama — selalu di atas Aurora */}
    <div className="min-h-screen bg-[#F0F5FD]/70 flex flex-col md:flex-row font-sans text-slate-800 relative z-0">
      {/* 1. SIDEBAR KHUSUS TABLET (RAIL ICON) & DESKTOP (EXPANDED) */}
      <aside className="hidden md:flex flex-col justify-between md:w-20 lg:w-64 bg-white border-r border-slate-100 p-3 lg:p-5 shadow-xs z-20 shrink-0 sticky top-0 h-screen transition-all duration-300">
        <div className="overflow-y-auto no-scrollbar">
          {/* LOGO PERPUSTAKAAN */}
          <div className="flex items-center gap-3 px-1 lg:px-2 py-3 mb-4 justify-center lg:justify-start">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img src="/img/logo.jpg" alt="Logo Perpustakaan Digital" className="w-full h-full object-contain" />
            </div>
            <div className="hidden lg:block">
              <h1 className="font-extrabold text-base leading-tight text-slate-800 tracking-tight flex items-center gap-1.5">
                Perpustakaan
              </h1>
              <span className="text-sm font-bold text-blue-600 tracking-tight flex items-center gap-1">
                Digital SD
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </span>
            </div>
          </div>

          {/* Role Badge Indicator */}
          {user?.role !== 'siswa' && (
            <div className="mb-3 px-2 lg:px-3.5 py-1.5 bg-blue-50/70 border border-blue-100/60 rounded-xl flex items-center justify-center lg:justify-between text-xs">
              <span className="font-bold text-blue-800 uppercase tracking-wide text-[10px] hidden lg:inline">
                Mode: {user?.role === 'petugas' ? 'Petugas Perpustakaan' : 'Administrator'}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title={`Role: ${user?.role}`} />
            </div>
          )}

          {/* MENU NAVIGASI */}
          <nav className="space-y-1">
            {activeNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={`flex items-center justify-center lg:justify-between px-2.5 lg:px-3.5 py-2.5 rounded-2xl font-semibold text-xs lg:text-sm transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-[#1E74FD] text-white shadow-md shadow-blue-300/40 lg:translate-x-1'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                    <span className="hidden lg:inline truncate">{item.label}</span>
                  </div>

                  {Boolean(item.badge) && (
                    <span
                      className={`text-[10px] px-1.5 lg:px-2 py-0.5 rounded-full font-bold hidden lg:inline ${
                        isActive
                          ? 'bg-white text-blue-600'
                          : 'bg-rose-500 text-white shadow-xs'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Tablet Floating Tooltip */}
                  <span className="hidden md:group-hover:block lg:!hidden absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                  </span>
                </NavLink>
              );
            })}

            {/* Tombol Keluar Navigasi */}
            <button
              onClick={handleLogout}
              title="Keluar"
              className="w-full flex items-center justify-center lg:justify-start gap-3 px-2.5 lg:px-3.5 py-2.5 rounded-2xl font-semibold text-xs lg:text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 transition-all text-left group relative"
            >
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-500 shrink-0" />
              <span className="hidden lg:inline">Keluar</span>
              <span className="hidden md:group-hover:block lg:!hidden absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
                Keluar
              </span>
            </button>
          </nav>
        </div>

        {/* ILUSTRASI MASCOT SISWA DI BAGIAN BAWAH SIDEBAR */}
        <div className="mt-4 pt-3 border-t border-slate-100 hidden lg:block">
          <div className="bg-gradient-to-b from-blue-50/80 to-sky-100/70 rounded-2xl p-3 relative overflow-hidden border border-blue-100/60 text-center">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-white shadow-xs flex items-center justify-center mb-1 border border-blue-100 text-blue-600">
                {user?.role === 'petugas' ? (
                  <Library className="w-6 h-6 text-blue-600" />
                ) : user?.role === 'admin' ? (
                  <Shield className="w-6 h-6 text-indigo-600" />
                ) : (
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-700">
                {user?.role === 'petugas' ? 'Layanan Perpustakaan' : user?.role === 'admin' ? 'Kendali Admin SD' : 'Ayo Rajin Membaca!'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                {user?.role === 'siswa' ? 'Membaca membuka jendela dunia' : 'Perpustakaan Digital SD'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* A. MOBILE NATIVE APP BAR (< md) */}
        <header className="md:hidden bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-2xs flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
              <img src="/img/logo.jpg" alt="Logo Perpustakaan Digital" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-black text-sm leading-tight text-slate-800">
                Perpustakaan SD
              </h2>
              <p className="text-[10px] font-bold text-blue-600 leading-none">
                {user?.role === 'siswa' ? student?.class_name || 'Panel Siswa' : user?.role?.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tombol Search Modal */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600"
              title="Cari Buku"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Tombol Notifikasi */}
            {user?.role === 'siswa' && (
              <Link
                to="/notifications"
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 relative"
                title="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </Link>
            )}

            {/* Avatar Mini & Trigger Drawer */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-xs border border-white"
            >
              {user?.role === 'admin' ? (
                <Shield className="w-4 h-4" />
              ) : user?.role === 'petugas' ? (
                <UserCheck className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* B. TABLET & DESKTOP TOP HEADER (>= md) */}
        <header className="hidden md:flex bg-white/95 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 items-center justify-between gap-4 border-b border-slate-100 shadow-2xs">
          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={user?.role === 'petugas' ? 'Cari judul buku, kode, atau siswa...' : 'Cari buku (judul, penulis, atau kategori)...'}
                className="w-full bg-[#F3F6FB] hover:bg-slate-100 focus:bg-white text-slate-700 text-xs sm:text-sm rounded-full pl-11 pr-4 py-2.5 outline-none transition-all border border-transparent focus:border-blue-300 focus:ring-3 focus:ring-blue-100 placeholder:text-slate-400"
              />
            </div>
          </form>

          {/* ACTIONS: NOTIFIKASI & PROFIL */}
          <div className="flex items-center gap-3">
            {user?.role === 'siswa' && (
              <Link
                to="/notifications"
                className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative z-50">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-xs border border-white">
                  {user?.role === 'petugas' ? (
                    <UserCheck className="w-4 h-4" />
                  ) : user?.role === 'admin' ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {student?.full_name || (user?.role === 'petugas' ? 'Petugas Perpustakaan' : user?.username)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 uppercase">
                    {student?.class_name || (user?.role === 'petugas' ? 'Librarian' : user?.role)}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {profileOpen && (
                <>
                  {/* Backdrop transparan untuk menutup dropdown saat klik di luar */}
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">
                        {student?.full_name || user?.username}
                      </p>
                      <p className="text-[11px] text-slate-500 uppercase">
                        {user?.role}
                      </p>
                    </div>
                    {user?.role === 'siswa' && (
                      <>
                        <NavLink
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Profil Saya
                        </NavLink>
                        <NavLink
                          to="/settings"
                          onClick={() => setProfileOpen(false)}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Pengaturan
                        </NavLink>
                      </>
                    )}
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ISI HALAMAN UTAMA (Dengan Safe Area Bottom Padding untuk Mobile) */}
        <main className={`p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl mx-auto w-full ${isReaderPage ? 'pb-6' : 'pb-24'} md:pb-8 flex-1`}>
          <Outlet />
        </main>
      </div>

      {/* 3. NATIVE MOBILE BOTTOM TAB BAR (< md, disembunyikan saat membaca agar layar penuh) */}
      {!isReaderPage && (
        <MobileBottomNav
          user={user}
          unreadCount={unreadCount}
          onOpenMore={() => setDrawerOpen(true)}
        />
      )}

      {/* 4. NATIVE MOBILE SLIDE-UP DRAWER (< md) */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        student={student}
        unreadCount={unreadCount}
        onLogout={handleLogout}
      />

      {/* 5. NATIVE MOBILE FULLSCREEN SEARCH MODAL */}
      <MobileSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
    </>
  );
}
