require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/storage', express.static(path.join(__dirname, '..', 'storage')));

// Root & Health Check Endpoint
app.get('/', (req, res) => res.json({
  success: true,
  message: 'Backend Perpustakaan Digital SD berjalan dengan baik (Online)',
  status: 'online',
  port: PORT
}));
app.get('/api', (req, res) => res.json({
  success: true,
  message: 'API Perpustakaan Digital SD siap digunakan',
  status: 'online',
  endpoints: {
    health: '/api/health',
    auth: '/api/auth',
    dashboard: '/api/dashboard',
    books: '/api/books',
    users: '/api/users',
    admin: '/api/admin',
    students: '/api/students',
    loans: '/api/loans'
  }
}));
app.get('/api/health', (req, res) => res.json({ success: true, message: 'OK', status: 'online' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/books', require('./routes/booksRoutes'));
app.use('/api/digital-books', require('./routes/digitalUploadRoutes'));
app.use('/api/digital-books', require('./routes/digitalBooksRoutes'));
app.use('/api/reading-progress', require('./routes/readingProgressRoutes'));
app.use('/api/reading-history', require('./routes/readingHistoryRoutes'));
app.use('/api/notifications', require('./routes/notificationsRoutes'));
app.use('/api/admin', require('./routes/adminDashboardRoutes'));
app.use('/api/categories', require('./routes/categoriesRoutes'));
app.use('/api/loans', require('./routes/loansRoutes'));
app.use('/api/students', require('./routes/studentsRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/favorites', require('./routes/favoritesRoutes'));

// 404 Catch-All
app.use((req, res) => {
  console.warn(`[404 Endpoint Tidak Ditemukan] ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
module.exports = app;
