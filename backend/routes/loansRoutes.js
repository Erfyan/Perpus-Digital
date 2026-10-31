const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/loansController');
const { authenticate } = require('../middleware/auth');
const { checkOwnership } = require('../middleware/ownership');

router.get('/', authenticate, ctrl.list);
router.get('/:id', authenticate, checkOwnership('loans', { resourceName: 'Peminjaman' }), ctrl.getById);
router.post('/', authenticate, ctrl.create);
router.put('/:id/return', authenticate, checkOwnership('loans', { resourceName: 'Peminjaman' }), ctrl.returnLoan);

module.exports = router;
