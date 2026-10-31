import { NavLink } from 'react-router-dom';
import {
  X,
  LogOut,
  User,
  Settings,
  Bell,
  Clock,
  ChevronRight,
  Shield,
  Sparkles,
  BookOpen,
  FolderTree,
  Library,
  CheckCircle2,
  History,
  BarChart3,
  Database,
  UserCheck
} from 'lucide-react';

export default function MobileDrawer({
  isOpen,
  onClose,
  user,
  student,
  unreadCount,
  onLogout
}) {
  if (!isOpen) return null;

  // Menu sekunder sesuai Role
  const studentSecondary = [
    { to: '/history', label: 'Riwayat Membaca', icon: Clock, desc: 'Daftar buku yang pernah kamu baca' },
    { to: '/notifications', label: 'Notifikasi', icon: Bell, badge: unreadCount, desc: 'Pengingat dan info perpustakaan' },
    { to: '/profile', label: 'Profil Saya', icon: User, desc: 'Data keanggotaan siswa' },
    { to: '/settings', label: 'Pengaturan', icon: Settings, desc: 'Preferensi tampilan aplikasi' },
  ];

  const librarianSecondary = [
    { to: '/petugas/categories', label: 'Kelola Kategori', icon: FolderTree, desc: 'Kategori buku' },
    { to: '/petugas/digital-books', label: 'Buku Digital (PDF)', icon: Library, desc: 'Upload buku digital' },
    { to: '/petugas/returns', label: 'Pengembalian Buku', icon: CheckCircle2, desc: 'Sirkulasi pengembalian' },
  ];

  const adminSecondary = [
    { to: '/admin/students', label: 'Data Siswa', icon: UserCheck, desc: 'Tabel pengguna siswa' },
    { to: '/admin/librarians', label: 'Data Petugas', icon: Shield, desc: 'Daftar staf perpustakaan' },
    { to: '/admin/categories', label: 'Kategori Buku', icon: FolderTree, desc: 'Klasifikasi buku' },
    { to: '/admin/digital-books', label: 'Buku Digital', icon: Library, desc: 'Upload & izin PDF' },
    { to: '/admin/returns', label: 'Pengembalian', icon: CheckCircle2, desc: 'Sirkulasi kembali' },
    { to: '/admin/reading-history', label: 'Riwayat Membaca', icon: History, desc: 'Log baca seluruh siswa' },
    { to: '/admin/reports', label: 'Laporan & Statistik', icon: BarChart3, desc: 'Analisis sirkulasi' },
    { to: '/admin/settings', label: 'Pengaturan Sistem', icon: Settings, desc: 'Konfigurasi perpustakaan' },
    { to: '/admin/backup', label: 'Backup Database', icon: Database, desc: 'Cadangkan file SQLite' },
  ];

  const secondaryNav =
    user?.role === 'petugas'
      ? librarianSecondary
      : user?.role === 'admin'
      ? adminSecondary
      : studentSecondary;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
        {/* Drag Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header Profile Card */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-md shadow-blue-200">
              {user?.role === 'admin' ? '🛡️' : user?.role === 'petugas' ? '👩‍💼' : '👦'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                  {student?.full_name || user?.username}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {student?.class_name ? `${student.class_name} • NIS: ${student.nis}` : `@${user?.username}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Items (Scrollable) */}
        <div className="py-3 space-y-1.5 overflow-y-auto flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1">
            Navigasi & Layanan
          </p>

          {secondaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-blue-600 shadow-2xs'
                        }`}
                      >
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs leading-tight">{item.label}</p>
                          {Boolean(item.badge) && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-rose-500 text-white">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[10px] mt-0.5 ${
                            isActive ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Logout Button */}
        <div className="pt-3 border-t border-slate-100 mt-auto">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar dari Akun Perpustakaan
          </button>
        </div>
      </div>
    </div>
  );
}

