import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
  Database,
  Download,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  FileCheck,
  Clock,
  UserCheck,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function AdminBackup() {
  const [backups, setBackups] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('backups'); // 'backups' | 'audit'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [backupsRes, auditRes] = await Promise.all([
        api.get('/admin/backups'),
        api.get('/admin/audit-logs')
      ]);
      setBackups(backupsRes.data.data || []);
      setAuditLogs(auditRes.data.data || []);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal memuat data backup / audit log' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBackup = async () => {
    if (!window.confirm('Buat salinan cadangan database SQLite saat ini ke direktori aman?')) return;
    try {
      setCreating(true);
      setMsg({ type: '', text: '' });
      const res = await api.post('/admin/backup');
      setMsg({ type: 'success', text: res.data.message || 'Backup database berhasil dibuat!' });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal membuat backup database' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Database className="h-7 w-7 text-indigo-600" />
            Backup Database & Audit Keamanan
          </h1>
          <p className="text-sm text-slate-500">
            Pencadangan file database fisik SQLite secara lokal dan pemantauan riwayat aktivitas keamanan sistem.
          </p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all self-start sm:self-auto"
        >
          {creating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Menyalin Database...
            </>
          ) : (
            <>
              <HardDrive className="h-4 w-4" />
              Buat Backup Sekarang
            </>
          )}
        </button>
      </div>

      {msg.text && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {msg.type === 'success' ? (
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-semibold">{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('backups')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'backups'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Database className="h-4 w-4" />
          Daftar File Cadangan ({backups.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Log Audit Keamanan ({auditLogs.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin mr-2 text-indigo-600" />
          Memuat data...
        </div>
      ) : activeTab === 'backups' ? (
        /* Tabel Cadangan Database */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              File Database SQLite Tersimpan (storage/backups/)
            </span>
            <span className="text-xs text-slate-400">Total: {backups.length} file</span>
          </div>

          {backups.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Database className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">Belum ada file cadangan yang dibuat.</p>
              <p className="text-xs mt-1">Klik tombol &ldquo;Buat Backup Sekarang&rdquo; di atas untuk mencadangkan database.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {backups.map((b, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{b.file_name}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3.5 w-3.5" />
                          {b.size_kb} KB
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(b.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                    Aman & Terverifikasi
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Tabel Log Audit */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Rekam Jejak Keamanan Sistem (PRD Bagian 19)
            </span>
            <span className="text-xs text-slate-400">50 Aktivitas Terakhir</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ShieldAlert className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">Belum ada riwayat audit log.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Aksi / Event</th>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Detail Peristiwa</th>
                    <th className="py-3 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {log.username || 'System'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.details || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {log.ip_address || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

