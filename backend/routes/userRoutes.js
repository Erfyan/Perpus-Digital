const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminDashboardController');
const { authenticate, authorize } = require('../middleware/auth');

// Rute Pengguna untuk /api/users
router.get('/', authenticate, authorize('admin', 'petugas'), ctrl.getUsers);
router.get('/users', authenticate, authorize('admin', 'petugas'), ctrl.getUsers);
router.post('/', authenticate, authorize('admin'), ctrl.createUser);
router.put('/:id', authenticate, authorize('admin'), ctrl.updateUser);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deactivateUser);

module.exports = router;

