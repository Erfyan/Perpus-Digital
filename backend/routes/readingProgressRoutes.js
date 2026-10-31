const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/readingProgressController');
const { authenticate } = require('../middleware/auth');
const { checkOwnership } = require('../middleware/ownership');

router.get('/', authenticate, ctrl.list);
router.get('/record/:id', authenticate, checkOwnership('reading_progress', { resourceName: 'Progres Membaca' }), ctrl.getById);
router.get('/:bookId', authenticate, ctrl.get);
router.put('/:bookId', authenticate, ctrl.update);

module.exports = router;
