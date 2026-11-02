import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import BookCover from '../components/BookCover';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  Trophy,
  CheckCircle2,
  Bookmark,
  Volume2,
  Lightbulb
} from 'lucide-react';

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const readerContainerRef = useRef(null);

  const [book, setBook] = useState(null);
  const [totalPages, setTotalPages] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/digital-books/${id}/read`)
      .then((r) => {
        const d = r.data.data;
        setBook(d);
        setTotalPages(d.total_pages || 100);
        const resumePage = d.last_page > 0 ? d.last_page : 1;
        setCurrentPage(resumePage);
      })
      .catch((err) => {
        console.error('Gagal membuka buku:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const saveProgress = async (page) => {
    try {
      setSaveStatus('Menyimpan posisi baca...');
      await api.put(`/reading-progress/${id}`, {
        last_page: page,
        total_pages: totalPages,
      });
      setSaveStatus('Tersimpan ✓');
      setTimeout(() => setSaveStatus(''), 2000);

      if (page >= totalPages && !showCelebration) {
        setShowCelebration(true);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('Gagal menyimpan');
    }
  };

  const handlePageChange = (newPage) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
    saveProgress(validPage);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const progressPercentage = Math.round((currentPage / totalPages) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-500">Membuka buku digital untukmu...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center max-w-md mx-auto my-12 border border-slate-100 shadow-sm">
        <div className="text-5xl mb-3">📖🚫</div>
        <h3 className="font-extrabold text-slate-800 text-lg">Buku Tidak Tersedia</h3>
        <p className="text-xs text-slate-500 mt-1">
          Buku ini mungkin tidak memiliki file digital atau izin membaca online belum diaktifkan.
        </p>
        <Link
          to="/catalog"
          className="mt-4 inline-block bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={readerContainerRef}
      className={`flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 bg-slate-900 z-50 p-4' : 'space-y-4'
      }`}
    >
      {/* Top Header Controls */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          {!isFullscreen && (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-100 transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800 line-clamp-1">
              {book.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span>{book.category_name || 'Buku Digital'}</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">Progress: {progressPercentage}%</span>
              {saveStatus && (
                <>
                  <span>•</span>
                  <span className="text-blue-500 font-bold">{saveStatus}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Buttons */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-slate-600">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="p-1 hover:bg-white rounded-lg transition-colors"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold px-2">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1 hover:bg-white rounded-lg transition-colors"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-100 transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Reading Stage (Child-friendly Book Simulation) */}
      <div className="relative flex-1 flex flex-col items-center justify-center bg-slate-200/70 rounded-3xl p-4 sm:p-8 min-h-[550px] overflow-auto border border-slate-200 shadow-inner">
        {/* Book Container with Zoom */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          className="transition-transform duration-200 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative min-h-[500px] flex flex-col justify-between"
        >
          {/* Book Header Bar */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>PERPUSTAKAAN DIGITAL SD</span>
            <span>Halaman {currentPage}</span>
          </div>

          {/* Book Content Page Area */}
          <div className="p-8 sm:p-12 flex-1 flex flex-col justify-between">
            {currentPage === 1 ? (
              /* Title Page / Cover */
              <div className="flex flex-col items-center text-center my-auto space-y-4">
                <div className="w-36 shadow-md rounded-xl overflow-hidden mb-2">
                  <BookCover title={book.title} category={book.category_name} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  {book.title}
                </h1>
                <p className="text-sm font-semibold text-slate-500">Penulis: {book.author || 'Tim Literasi SD'}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                  Mulai membaca halaman berikutnya
                </div>
              </div>
            ) : (
              /* Content Page Sample */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-base font-bold text-blue-700">
                    Bab {Math.ceil(currentPage / 5)}: Petualangan Belajar Menyenangkan
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">Halaman {currentPage}</span>
                </div>

                <div className="text-sm leading-relaxed text-slate-700 space-y-3 font-serif">
                  <p>
                    Hari ini adalah hari yang cerah untuk membaca. Di sekolah, Andi dan kawan-kawan sangat senang membuka lembaran buku cerita di perpustakaan. Setiap cerita membawa petualangan baru yang penuh dengan pelajaran berharga.
                  </p>
                  <div className="bg-sky-50 rounded-xl p-4 my-3 border border-sky-100 flex items-center gap-3">
                    <Lightbulb className="w-8 h-8 text-amber-500 shrink-0" />
                    <div className="text-xs text-sky-900 font-sans">
                      <p className="font-bold">Tahukah Kamu?</p>
                      <p>Membaca 15 menit setiap hari dapat menambah ribuan kosakata baru dan membuat pikiran kita makin kreatif!</p>
                    </div>
                  </div>
                  <p>
                    Matahari mulai meninggi, tetapi semangat membaca mereka tidak pernah padam. Mereka mencatat hal-hal menarik yang mereka temukan dan saling bertukar cerita.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Page Number Badge */}
            <div className="text-center pt-6 border-t border-slate-100 text-xs font-bold text-slate-400">
              - {currentPage} -
            </div>
          </div>
        </div>

        {/* Celebration Modal when Reaching 100% */}
        {showCelebration && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-30 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm text-center shadow-2xl border border-amber-200">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-black text-slate-800 flex items-center justify-center gap-1.5">
                Hebat Sekali! <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Kamu telah menyelesaikan membaca buku <strong>{book.title}</strong> sampai halaman terakhir!
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => setShowCelebration(false)}
                  className="bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Lanjut Membaca Ulang
                </button>
                <Link
                  to="/dashboard"
                  className="bg-slate-100 text-slate-700 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Halaman Sebelumnya
        </button>

        {/* Page Slider & Direct Input */}
        <div className="flex-1 max-w-md w-full flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            className="flex-1 accent-blue-600 cursor-pointer"
          />
          <div className="text-xs font-bold text-slate-700 shrink-0">
            {currentPage} / {totalPages}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#1E74FD] hover:bg-blue-700 text-white disabled:opacity-40 disabled:pointer-events-none shadow-xs transition-colors"
        >
          Halaman Berikutnya
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
