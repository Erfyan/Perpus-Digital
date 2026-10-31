import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../lib/api';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Reader() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    api.get(`/books/${id}`).then((r) => setBook(r.data.data));
    api.get(`/reading-progress/${id}`).then((r) => {
      if (r.data.data) {
        setPageNumber(r.data.data.last_page || 1);
        setProgress(r.data.data);
      }
    });
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const saveProgress = async (page) => {
    await api.put(`/reading-progress/${id}`, { last_page: page, total_pages: numPages || book?.digital?.total_pages });
  };

  const go = (delta) => {
    const next = Math.min(Math.max(1, pageNumber + delta), numPages || 1);
    setPageNumber(next);
    saveProgress(next);
  };

  const fileUrl = book?.digital?.file_path ? `http://localhost:5000${book.digital.file_path}` : null;

  return (
    <div className="p-6 space-y-4 text-center">
      <h2 className="text-xl font-bold">{book?.title}</h2>
      <div className="flex justify-center gap-4">
        <button onClick={() => go(-1)} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
        <span>Halaman {pageNumber} / {numPages || '?'}</span>
        <button onClick={() => go(1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
      </div>
      {fileUrl ? (
        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
      ) : (
        <p>Memuat buku...</p>
      )}
      {progress && <p className="text-sm text-gray-500">Progress: {progress.progress_percentage?.toFixed(1)}%</p>}
    </div>
  );
}
