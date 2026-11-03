import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  FlaskConical,
  Landmark,
  Calculator,
  Sprout,
  Flag,
  HeartPulse,
  ShieldCheck,
  Footprints,
  Rocket
} from 'lucide-react';

// Pemetaan langsung Judul -> File Foto di frontend/public/book_cover/
// Menjamin foto PASTI tampil saat website dibuka, baik database sudah diseed maupun belum!
const TITLE_TO_COVER = {
  // 50 Judul Buku Baru Sesuai File
  'Aku Anak Pemberani, Aku Anak Mandiri': 'Aku Anak Pemberani, Aku Anak Mandiri.jpg',
  'Aku Pandai Membaca': 'Aku Pandai Membaca.jpg',
  'Ayo Mengenal Tata Surya': 'Ayo Mengenal Tata Surya.jpg',
  'Ayo Menggambar dan Mewarnai': 'Ayo Menggambar dan Mewarnai.jpg',
  'Bangun Datar dan Bangun Ruang': 'Bangun Datar dan bangun Ruang.jpg',
  'Bangun Datar dan bangun Ruang': 'Bangun Datar dan bangun Ruang.jpg',
  'Bawang Merah Bawang Putih': 'Bawang Merah Bawang Putih.jpg',
  'Belajar Coding untuk Anak': 'Belajar Coding untuk Anak.jpg',
  'Belajar Huruf dan Suku Kata': 'Belajar Huruf dan Suku Kata.jpg',
  'Belajar Origami': 'Belajar Origami.jpg',
  'Belajar Uang dan Menabung': 'Belajar Uang dan Menabung.jpg',
  'Berani Berkata Tidak': 'Berani Berkata Tidak.jpg',
  'Berhitung Bersama si Kelinci': 'Berhitung Bersama si Kelinci.jpg',
  'Bijak Menggunakan Internet': 'Bijak Menggunakan Internet.jpg',
  'Cerita Rakyat dari Sulawesi': 'Cerita Rakyat dari Sulawesi.jpg',
  'Dunia Serangga Mini': 'Dunia Serangga Mini.jpg',
  'Gunung Berapi dan Gempa Bumi': 'Gunung Berapi dan Gempa Bumi.jpg',
  'Hewan Langka Indonesia': 'Hewan Langka Indonesia.jpg',
  'Kebudayaan dan Rumah Adat Nusantara': 'Kebudayaan dan Rumah Adat Nusantara.jpg',
  'Kerajaan-kerajaan di Nusantara': 'Kerajaan-kerajaan di Nusantara.jpg',
  'Kerajinan dari Barang Bekas': 'Kerajinan dari Barang Bekas.jpg',
  'Kisah Anak Jujur': 'Kisah Anak Jujur.jpg',
  'Kisah Si Pitung': 'Kisah Si Pitung.jpg',
  'Kisah Tokoh Dunia yang Menginspirasi': 'Kisah Tokoh Dunia yang Menginspirasi.jpg',
  'Laut Kita yang Kaya': 'Laut Kita yang Kaya.jpg',
  'Legenda Danau Toba': 'Legenda Danau Toba.jpg',
  "Let's Speak English": "Let's Speak English.jpg",
  'Makan Sehat Tumbuh Kuat': 'Makan Sehat Tumbuh Kuat.jpg',
  'Malin Kundang Belajar Menyesal': 'Malin Kundang Belajar Menyesal.jpg',
  'Mencuci Tangan itu Penting': 'Mencuci Tangan itu Penting.jpg',
  'Mengapa Langit Berwarna Biru': 'Mengapa Langit Berwarna Biru.jpg',
  'Mengenal 38 Provinsi Indonesia': 'Mengenal 38 Provinsi Indonesia.jpg',
  'Mengenal Alat Musik Tradisional': 'Mengenal Alat Musik Tradisional.jpg',
  'Menulis Cerita Pertamaku': 'Menulis Cerita Pertamaku.jpg',
  'My First English Words': 'My First English Words.jpg',
  'Pakaian dan Tarian Daerah': 'Pakaian dan Tarian Daerah.jpg',
  'Pasar Tradisional di Kotaku': 'Pasar Tradisional di Kotaku.jpg',
  'Pecahan itu Mudah': 'Pecahan itu Mudah.jpg',
  'Percobaan Sains Seru di Rumah': 'Percobaan Sains Seru di Rumah.jpg',
  'Perjalanan Setetes Air': 'Perjalanan Setetes Air.jpg',
  'Profesi di Sekitar Kita': 'Profesi di Sekitar Kita.jpg',
  'Proklamasi Kemerdekaan Kita': 'Proklamasi Kemerdekaan Kita.jpg',
  'Puisi untuk Ibu Pertiwi': 'Puisi untuk Ibu Pertiwi.jpg',
  'Rahasia Tumbuhan Hijau': 'Rahasia Tumbuhan Hijau.jpg',
  'Robot, Mesin, dan Masa Depan': 'Robot, Mesin, dan Masa Depan.jpg',
  'Sahabat Hutan Kalimantan': 'Sahabat Hutan Kalimantan.jpg',
  'Sangkuriang dan Perahu Raksasa': 'Sangkuriang dan Perahu Raksasa.jpg',
  'Siaga Bencana untuk Anak': 'Siaga Bencana untuk Anak.jpg',
  'Sopan Santun di Mana Saja': 'Sopan Santun di Mana Saja.jpg',
  'Teka-teki Logika Seru': 'Teka-teki Logika Seru.jpg',
  'Timun Mas dan Raksasa': 'Timun Mas dan Raksasa.jpg',

  // Fallback untuk 11 Judul Lama (jika database belum direset/reseed)
  'Dongeng Nusantara': 'Bawang Merah Bawang Putih.jpg',
  'Sains di Sekitarku': 'Percobaan Sains Seru di Rumah.jpg',
  'Matematika Menyenangkan': 'Pecahan itu Mudah.jpg',
  'Ayo Jaga Lingkungan': 'Sahabat Hutan Kalimantan.jpg',
  'Komik Pahlawan Indonesia': 'Proklamasi Kemerdekaan Kita.jpg',
  'Matematika Kelas 4 SD': 'Bangun Datar dan bangun Ruang.jpg',
  'Petualangan Si Kancil': 'Berhitung Bersama si Kelinci.jpg',
  'Tubuh Manusia untuk Anak': 'Makan Sehat Tumbuh Kuat.jpg',
  'Aku Bisa Menjaga Diri': 'Berani Berkata Tidak.jpg',
  'Ensiklopedia Hewan': 'Hewan Langka Indonesia.jpg',
  'Cita-Citaku': 'Kisah Tokoh Dunia yang Menginspirasi.jpg',
};

const COVER_THEMES = {
  'Dongeng Nusantara': { bg: 'from-amber-400 to-emerald-600', icon: Landmark, badge: 'Cerita' },
  'Sains di Sekitarku': { bg: 'from-blue-600 to-indigo-800', icon: FlaskConical, badge: 'Sains' },
  'Matematika Menyenangkan': { bg: 'from-sky-400 to-blue-600', icon: Calculator, badge: 'Pelajaran' },
  'Ayo Jaga Lingkungan': { bg: 'from-emerald-400 to-teal-700', icon: Sprout, badge: 'Pengetahuan Umum' },
  'Komik Pahlawan Indonesia': { bg: 'from-rose-500 to-red-700', icon: Flag, badge: 'Komik Edukasi' },
  'Matematika Kelas 4 SD': { bg: 'from-cyan-400 to-blue-500', icon: Calculator, badge: 'Pelajaran' },
  'Petualangan Si Kancil': { bg: 'from-amber-500 to-emerald-700', icon: Footprints, badge: 'Cerita' },
  'Tubuh Manusia untuk Anak': { bg: 'from-orange-400 to-rose-500', icon: HeartPulse, badge: 'Sains' },
  'Aku Bisa Menjaga Diri': { bg: 'from-yellow-400 to-amber-600', icon: ShieldCheck, badge: 'Kesehatan' },
  'Ensiklopedia Hewan': { bg: 'from-emerald-500 to-teal-800', icon: Footprints, badge: 'Pengetahuan Umum' },
  'Cita-Citaku': { bg: 'from-indigo-500 to-purple-800', icon: Rocket, badge: 'Inspirasi' },
};

export default function BookCover({
  title = 'Buku Digital',
  category = '',
  className = '',
  coverPath = '',
  coverUrl = '',
}) {
  const [imageError, setImageError] = useState(false);

  // Cari path gambar: dari prop coverPath/coverUrl, atau fallback ke pemetaan judul TITLE_TO_COVER
  let rawSrc = coverPath || coverUrl;
  if (!rawSrc && title && TITLE_TO_COVER[title]) {
    rawSrc = `/book_cover/${TITLE_TO_COVER[title]}`;
  }

  // Jika berupa nama file saja (tanpa awalan /book_cover/ atau http)
  if (rawSrc && !rawSrc.startsWith('/') && !rawSrc.startsWith('http') && !rawSrc.startsWith('data:')) {
    rawSrc = `/book_cover/${rawSrc}`;
  }

  const theme = COVER_THEMES[title] || {
    bg: 'from-blue-500 to-sky-700',
    icon: BookOpen,
    badge: category || 'Buku SD',
  };

  const IconComponent = theme.icon || BookOpen;

  // Jika ada foto dan tidak error, tampilkan foto sampul asli
  if (rawSrc && !imageError) {
    return (
      <div className={`relative rounded-xl overflow-hidden shadow-sm aspect-[3/4] bg-slate-100 select-none group ${className}`}>
        <img
          src={encodeURI(rawSrc)}
          alt={title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Efek lekukan tulang buku (book spine shadow) */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
      </div>
    );
  }

  // Fallback desain grafis jika gambar tidak ada/gagal dimuat
  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-sm aspect-[3/4] flex flex-col justify-between p-2.5 text-white bg-gradient-to-br ${theme.bg} select-none ${className}`}
    >
      {/* Decorative Book Spine Lighting */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/15 border-r border-white/20" />

      {/* Top Banner & Category */}
      <div className="pl-2 flex justify-between items-start z-10">
        <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-white/25 backdrop-blur-xs text-white">
          {theme.badge || category || 'SD'}
        </span>
        <Sparkles className="w-3 h-3 text-yellow-300 opacity-80" />
      </div>

      {/* Main Illustration Center */}
      <div className="flex-1 flex flex-col items-center justify-center my-1 z-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center filter drop-shadow-md transform hover:scale-110 transition-transform">
          <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* Bottom Title Bar */}
      <div className="pl-2 pt-1 border-t border-white/20 z-10">
        <h4 className="text-[11px] sm:text-xs font-extrabold line-clamp-2 leading-tight text-white drop-shadow-xs">
          {title}
        </h4>
        <p className="text-[8px] text-white/80 font-medium tracking-wide mt-0.5">EDUKASI SD</p>
      </div>

      {/* Background Subtle Circles Pattern */}
      <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/10 blur-xs" />
      <div className="absolute -left-2 -top-2 w-12 h-12 rounded-full bg-white/10 blur-xs" />
    </div>
  );
}
