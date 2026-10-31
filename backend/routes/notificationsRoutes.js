const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationsController');
const { authenticate } = require('../middleware/auth');
router.get('/', authenticate, ctrl.list);
router.put('/:id/read', authenticate, ctrl.markRead);
router.put('/read-all', authenticate, ctrl.markAllRead);
module.exports = router;
