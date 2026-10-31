import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function AdminStudents() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', nis: '', full_name: '', class_name: '' });
  const load = () => api.get('/students').then((r) => setItems(r.data.data));
  useEffect(() => { load(); }, []);
  const add = async (e) => {
    e.preventDefault();
    await api.post('/students', form);
    setForm({ username: '', password: '', nis: '', full_name: '', class_name: '' });
    load();
  };
  const remove = async (id) => { await api.delete(`/students/${id}`); load(); };
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Kelola Siswa</h2>
      <form onSubmit={add} className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <input className="border rounded-lg px-3 py-2" placeholder="Username" value={form.username} onChange={(e)=>setForm({...form,username:e.target.value})} />
        <input className="border rounded-lg px-3 py-2" placeholder="Password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
        <input className="border rounded-lg px-3 py-2" placeholder="NIS" value={form.nis} onChange={(e)=>setForm({...form,nis:e.target.value})} />
        <input className="border rounded-lg px-3 py-2" placeholder="Nama Lengkap" value={form.full_name} onChange={(e)=>setForm({...form,full_name:e.target.value})} />
        <input className="border rounded-lg px-3 py-2" placeholder="Kelas" value={form.class_name} onChange={(e)=>setForm({...form,class_name:e.target.value})} />
        <button className="bg-cyan-500 text-white px-4 rounded-lg col-span-2 md:col-span-5">Tambah Siswa</button>
      </form>
      <div className="space-y-2">
        {items.map((s) => (
          <div key={s.id} className="bg-white rounded-xl shadow p-3 flex justify-between items-center">
            <span>{s.full_name} ({s.nis}) - {s.class_name}</span>
            <button onClick={() => remove(s.id)} className="text-xs text-red-500">Hapus</button>
          </div>
        ))}
      </div>
    </div>
  );
}
