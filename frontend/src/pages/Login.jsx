import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  User,
  Lock,
  ArrowRight,
  Info,
  Eye,
  EyeOff,
  Shield,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import Aurora from '@/components/ui/aurora';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      const role = data.user?.role;
      if (role === 'petugas') {
        navigate('/petugas');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Nama pengguna atau kata sandi salah');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <Aurora
      colors={['#60a5fa', '#a78bfa', '#f472b6']}
      duration={20}
      intensity={0.25}
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans bg-gradient-to-br from-[#E6F3FF] via-[#F4F9FF] to-[#EDE4FF]"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 relative overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-100/50 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-100/50 rounded-full blur-xl pointer-events-none" />

        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-white mx-auto flex items-center justify-center shadow-lg shadow-blue-200/50 border border-slate-100 p-2 mb-3 overflow-hidden">
            <img src="/img/logo.jpg" alt="Logo Perpustakaan Digital" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
            Perpustakaan Digital SD
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Masuk dengan akun pengguna Anda untuk melanjutkan
          </p>
        </div>

        {/* Form Login (Standard Tanpa Pemilihan Role) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-center animate-in fade-in duration-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Pengguna (Username)
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all font-medium placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E74FD] hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sedang Memproses...</span>
              </div>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Note Informasi Akun Demo yang Sudah Terdaftar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-2.5 text-slate-700 font-extrabold text-xs">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Catatan Akun Demo Terdaftar</span>
            </div>
            
            <div className="space-y-1.5">
              {/* Demo Admin */}
              <button
                type="button"
                onClick={() => fillDemoAccount('admin', 'admin123')}
                title="Klik untuk gunakan akun Admin"
                className="w-full text-left flex items-center justify-between bg-white hover:bg-blue-50/60 p-2 rounded-xl border border-slate-200/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">Admin Sistem</p>
                    <p className="text-[10px] text-slate-400">username: <code className="text-indigo-600 font-semibold font-mono">admin</code></p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-700 px-2 py-0.5 rounded-md font-semibold transition-colors">
                  admin123
                </span>
              </button>

              {/* Demo Petugas */}
              <button
                type="button"
                onClick={() => fillDemoAccount('petugas', 'petugas123')}
                title="Klik untuk gunakan akun Petugas"
                className="w-full text-left flex items-center justify-between bg-white hover:bg-blue-50/60 p-2 rounded-xl border border-slate-200/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">Petugas Perpustakaan</p>
                    <p className="text-[10px] text-slate-400">username: <code className="text-blue-600 font-semibold font-mono">petugas</code></p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-700 px-2 py-0.5 rounded-md font-semibold transition-colors">
                  petugas123
                </span>
              </button>

              {/* Demo Siswa */}
              <button
                type="button"
                onClick={() => fillDemoAccount('andi', '123456')}
                title="Klik untuk gunakan akun Siswa"
                className="w-full text-left flex items-center justify-between bg-white hover:bg-blue-50/60 p-2 rounded-xl border border-slate-200/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">Siswa (Andi Pratama)</p>
                    <p className="text-[10px] text-slate-400">username: <code className="text-emerald-600 font-semibold font-mono">andi</code></p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-700 px-2 py-0.5 rounded-md font-semibold transition-colors">
                  123456
                </span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 text-center leading-tight">
              Hak akses dan role otomatis diarahkan oleh sistem setelah berhasil masuk.
            </p>
          </div>
        </div>

        <div className="mt-5 text-center text-[11px] text-slate-400 font-medium">
          Perpustakaan Digital Ramah Anak • Sekolah Dasar
        </div>
      </div>
    </Aurora>
  );
}
