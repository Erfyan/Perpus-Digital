import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Shield, Plus, Search, CheckCircle2, UserCheck, UserX, AlertCircle } from 'lucide-react';

export default function AdminLibrarians() {
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/librarians')
      .then((r) => setLibrarians(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Data Petugas Perpustakaan <Shield className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Daftar staf petugas perpustakaan yang memiliki wewenang operasional sirkulasi dan koleksi.
          </p>
        </div>
      </div>

      {/* Tabel Petugas */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">Memuat data petugas...</div>
        ) : librarians.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">Belum ada akun petugas terdaftar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Petugas</th>
                  <th className="pb-3 font-bold">Peran</th>
                  <th className="pb-3 font-bold">Status Akun</th>
                  <th className="pb-3 font-bold">Waktu Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {librarians.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                          👩‍💼
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800">@{l.username}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: #{l.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                        {l.role}
                      </span>
                    </td>
                    <td className="py-3">
                      {l.is_active ? (
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <UserX className="w-3 h-3" /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[10px]">
                      {l.created_at ? l.created_at.split('T')[0] : 'Sistem'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

