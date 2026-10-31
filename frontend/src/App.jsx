import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import Reader from './pages/Reader';
import Favorites from './pages/Favorites';
import History from './pages/History';
import MyLoans from './pages/MyLoans';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Panel Petugas Sesuai PRD Bagian 2
import PetugasDashboard from './pages/petugas/PetugasDashboard';
import PetugasBooks from './pages/petugas/PetugasBooks';
import PetugasCategories from './pages/petugas/PetugasCategories';
import PetugasStudents from './pages/petugas/PetugasStudents';
import PetugasDigitalBooks from './pages/petugas/PetugasDigitalBooks';
import PetugasLoans from './pages/petugas/PetugasLoans';
import PetugasReturns from './pages/petugas/PetugasReturns';

// Panel Admin Sesuai PRD Bagian 13 (13 Menu Utama)
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminLibrarians from './pages/admin/AdminLibrarians';
import AdminReadingHistory from './pages/admin/AdminReadingHistory';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminBackup from './pages/admin/AdminBackup';

import Layout from './layouts/Layout';

function Protected({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F5FD]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Memuat sistem perpustakaan...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect ke dashboard masing-masing jika peran tidak sesuai
    const defaultRoute = user.role === 'petugas' ? '/petugas' : user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const defaultHome = user?.role === 'petugas' ? '/petugas' : user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={defaultHome} replace /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? defaultHome : '/login'} replace />} />

      {/* Protected Routes inside Main Layout */}
      <Route element={<Protected><Layout /></Protected>}>
        {/* Navigasi Siswa */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/read/:id" element={<Reader />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/history" element={<History />} />
        <Route path="/my-loans" element={<MyLoans />} />
        <Route path="/loans" element={<MyLoans />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* Panel Petugas Sesuai PRD Bagian 2 (Hak Utama: Buku, Kategori, Siswa, Digital, Pinjam, Kembali) */}
        <Route path="/petugas" element={<Protected allowedRoles={['petugas', 'admin']}><PetugasDashboard /></Protected>} />
        <Route path="/petugas/books" element={<Protected allowedRoles={['petugas', 'admin']}><PetugasBooks /></Protected>} />
        <Route path="/petugas/categories" element={<Protected allowedRoles={['petugas', 'admin']}><PetugasCategories /></Protected>} />
        <Route path="/petugas/students" element={<Protected allowedRoles={['petugas', 'admin']}><PetugasStudents /></Protected>} />
        <Route path="/petugas/digital-books" element={<Protected allowedRoles={['petugas', 'admin']}><PetugasDigitalBooks /></Protected>} />
        <Route path="/petugas/loans" element={<Protected allowedRoles={['petugas', 'admin']}><PetugasLoans /></Protected>} />
        <Route path="/petugas/returns" element={<Protected allowedRoles={['petugas', 'admin']}><PetugasReturns /></Protected>} />

        {/* Panel Admin Sesuai PRD Bagian 13 (13 Menu Utama) */}
        <Route path="/admin" element={<Protected allowedRoles={['admin']}><AdminDashboard /></Protected>} />
        <Route path="/admin/users" element={<Protected allowedRoles={['admin']}><AdminUsers /></Protected>} />
        <Route path="/admin/students" element={<Protected allowedRoles={['admin']}><AdminStudents /></Protected>} />
        <Route path="/admin/librarians" element={<Protected allowedRoles={['admin']}><AdminLibrarians /></Protected>} />
        <Route path="/admin/books" element={<Protected allowedRoles={['admin']}><PetugasBooks /></Protected>} />
        <Route path="/admin/categories" element={<Protected allowedRoles={['admin']}><PetugasCategories /></Protected>} />
        <Route path="/admin/digital-books" element={<Protected allowedRoles={['admin']}><PetugasDigitalBooks /></Protected>} />
        <Route path="/admin/loans" element={<Protected allowedRoles={['admin']}><PetugasLoans /></Protected>} />
        <Route path="/admin/returns" element={<Protected allowedRoles={['admin']}><PetugasReturns /></Protected>} />
        <Route path="/admin/reading-history" element={<Protected allowedRoles={['admin']}><AdminReadingHistory /></Protected>} />
        <Route path="/admin/reports" element={<Protected allowedRoles={['admin']}><AdminReports /></Protected>} />
        <Route path="/admin/settings" element={<Protected allowedRoles={['admin']}><AdminSettings /></Protected>} />
        <Route path="/admin/backup" element={<Protected allowedRoles={['admin']}><AdminBackup /></Protected>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
