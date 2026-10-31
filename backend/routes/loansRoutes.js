const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/loansController');
const { authenticate, authorize } = require('../middleware/auth');
router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, authorize('admin','petugas'), ctrl.create);
router.put('/:id/return', authenticate, authorize('admin','petugas'), ctrl.returnLoan);
module.exports = router;
