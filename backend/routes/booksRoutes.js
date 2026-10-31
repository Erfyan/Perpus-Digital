const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/booksController');
const { authenticate } = require('../middleware/auth');
router.get('/', authenticate, ctrl.list);
router.get('/:id', authenticate, ctrl.detail);
module.exports = router;
