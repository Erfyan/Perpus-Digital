import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Sun, Shield, Check } from 'lucide-react';

export default function Settings() {
  const [notifyNewBooks, setNotifyNewBooks] = useState(true);
  const [notifyDueDates, setNotifyDueDates] = useState(true);
  const [largeFont, setLargeFont] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg('Pengaturan berhasil disimpan!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-3xl p-6 text-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Pengaturan Akun <SettingsIcon className="w-6 h-6 text-white" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Sesuaikan kenyamanan membaca dan preferensi notifikasi aplikasimu.
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> {savedMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Notifikasi */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" /> Preferensi Notifikasi
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-700">Pemberitahuan Buku Baru</p>
                <p className="text-[11px] text-slate-400">Dapatkan info saat koleksi buku digital baru ditambahkan</p>
              </div>
              <input
                type="checkbox"
                checked={notifyNewBooks}
                onChange={(e) => setNotifyNewBooks(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-700">Pengingat Jatuh Tempo</p>
                <p className="text-[11px] text-slate-400">Pengingat saat buku pinjaman fisik mendekati batas tanggal kembali</p>
              </div>
              <input
                type="checkbox"
                checked={notifyDueDates}
                onChange={(e) => setNotifyDueDates(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Tampilan Membaca */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" /> Kenyamanan Tampilan Membaca
          </h3>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-700">Mode Huruf Lebih Besar (Ramah Anak)</p>
              <p className="text-[11px] text-slate-400">Memperbesar ukuran teks bacaan agar lebih mudah dibaca</p>
            </div>
            <input
              type="checkbox"
              checked={largeFont}
              onChange={(e) => setLargeFont(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors"
        >
          Simpan Pengaturan
        </button>
      </form>
    </div>
  );
}

