import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, User, Lock, ArrowRight, ShieldCheck, Library } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('petugas');
  const [password, setPassword] = useState('petugas123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
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

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F3FF] via-[#F4F9FF] to-[#EDE4FF] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 relative overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-100/50 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-100/50 rounded-full blur-xl pointer-events-none" />

        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-3">
            <BookOpen className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
            Perpustakaan Digital SD
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Masuk ke sistem perpustakaan digital sekolah dasar
          </p>
        </div>

        {/* Quick User Presets for Testing / Demo */}
        <div className="mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Pilih Cepat Akun Uji Coba
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('petugas', 'petugas123')}
              className={`p-2 rounded-xl text-center border transition-all ${
                username === 'petugas'
                  ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 font-medium hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="text-base">👩‍💼</div>
              <p className="text-[10px] mt-0.5 truncate font-bold">Petugas</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('andi', 'siswa123')}
              className={`p-2 rounded-xl text-center border transition-all ${
                username === 'andi'
                  ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 font-medium hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="text-base">👦</div>
              <p className="text-[10px] mt-0.5 truncate font-bold">Andi (Siswa)</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className={`p-2 rounded-xl text-center border transition-all ${
                username === 'admin'
                  ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 font-medium hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="text-base">🛡️</div>
              <p className="text-[10px] mt-0.5 truncate font-bold">Admin</p>
            </button>
          </div>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-center">
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
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all font-medium"
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E74FD] hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? (
              'Sedang Memproses...'
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 font-medium">
          Perpustakaan Digital Ramah Anak • Sekolah Dasar
        </div>
      </div>
    </div>
  );
}
