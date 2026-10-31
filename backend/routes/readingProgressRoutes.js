const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/readingProgressController');
const { authenticate } = require('../middleware/auth');
router.get('/:bookId', authenticate, ctrl.get);
router.put('/:bookId', authenticate, ctrl.update);
module.exports = router;
