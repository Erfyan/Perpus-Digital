require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'OK' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/books', require('./routes/booksRoutes'));
app.use('/api/digital-books', require('./routes/digitalBooksRoutes'));
app.use('/api/reading-progress', require('./routes/readingProgressRoutes'));
app.use('/api/reading-history', require('./routes/readingHistoryRoutes'));
app.use('/api/notifications', require('./routes/notificationsRoutes'));
app.use('/api/favorites', require('./routes/favoritesRoutes'));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
module.exports = app;
