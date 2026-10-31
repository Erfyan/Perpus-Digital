const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationsController');
const { authenticate } = require('../middleware/auth');
const { checkOwnership } = require('../middleware/ownership');

router.get('/', authenticate, ctrl.list);
router.get('/:id', authenticate, checkOwnership('notifications', { resourceName: 'Notifikasi' }), ctrl.getById);
router.put('/read-all', authenticate, ctrl.markAllRead);
router.put('/:id/read', authenticate, checkOwnership('notifications', { resourceName: 'Notifikasi' }), ctrl.markRead);

module.exports = router;
