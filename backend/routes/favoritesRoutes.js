const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/favoritesController');
const { authenticate } = require('../middleware/auth');
router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, ctrl.add);
router.delete('/:bookId', authenticate, ctrl.remove);
router.delete('/', authenticate, ctrl.remove);
module.exports = router;
