const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/favoritesController');
const { authenticate } = require('../middleware/auth');
const { checkOwnership } = require('../middleware/ownership');

router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, ctrl.add);
router.delete('/item/:id', authenticate, checkOwnership('favorites', { resourceName: 'Buku Favorit' }), ctrl.removeById);
router.delete('/:bookId', authenticate, ctrl.remove);
router.delete('/', authenticate, ctrl.remove);

module.exports = router;
