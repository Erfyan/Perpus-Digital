import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import BookDetail from './pages/BookDetail';
import Reader from './pages/Reader';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/catalog" element={<Protected><Catalog /></Protected>} />
      <Route path="/books/:id" element={<Protected><BookDetail /></Protected>} />
      <Route path="/read/:id" element={<Protected><Reader /></Protected>} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
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
