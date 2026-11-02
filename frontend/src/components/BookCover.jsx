import React from 'react';
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

export default function BookCover({ title = 'Buku Digital', category = '', className = '' }) {
  const theme = COVER_THEMES[title] || {
    bg: 'from-blue-500 to-sky-700',
    icon: BookOpen,
    badge: category || 'Buku SD',
  };

  const IconComponent = theme.icon || BookOpen;

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
