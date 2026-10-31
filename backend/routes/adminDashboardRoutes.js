const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminDashboardController');
const { authenticate, authorize } = require('../middleware/auth');

// Dashboard overview
router.get('/', authenticate, authorize('admin', 'petugas'), ctrl.admin);

// 1. Data Pengguna (Admin & Petugas bisa melihat, hanya Admin yang bisa mengelola)
router.get('/users', authenticate, authorize('admin', 'petugas'), ctrl.getUsers);
router.post('/users', authenticate, authorize('admin'), ctrl.createUser);
router.put('/users/:id', authenticate, authorize('admin'), ctrl.updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), ctrl.deactivateUser);

// 2. Data Petugas (Admin Only)
router.get('/librarians', authenticate, authorize('admin'), ctrl.getLibrarians);

// 3. Riwayat Membaca (Admin & Petugas)
router.get('/reading-history', authenticate, authorize('admin', 'petugas'), ctrl.getReadingHistory);

// 4. Pengaturan Sistem (Admin Only)
router.get('/settings', authenticate, authorize('admin'), ctrl.getSettings);
router.put('/settings', authenticate, authorize('admin'), ctrl.updateSettings);

// 5. Backup Database SQLite (Admin Only)
router.post('/backup', authenticate, authorize('admin'), ctrl.createBackup);
router.get('/backups', authenticate, authorize('admin'), ctrl.getBackups);

// 6. Laporan Perpustakaan (Admin Only)
router.get('/reports', authenticate, authorize('admin'), ctrl.getReports);

// 7. Audit Log Aktivitas Keamanan (Admin Only)
router.get('/audit-logs', authenticate, authorize('admin'), ctrl.getAuditLogs);

module.exports = router;
