const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/readingHistoryController');
const { authenticate } = require('../middleware/auth');
const { checkOwnership } = require('../middleware/ownership');

router.get('/', authenticate, ctrl.list);
router.get('/:id', authenticate, checkOwnership('reading_history', { resourceName: 'Riwayat Membaca' }), ctrl.getById);
router.delete('/:id', authenticate, checkOwnership('reading_history', { resourceName: 'Riwayat Membaca' }), ctrl.remove);

module.exports = router;
