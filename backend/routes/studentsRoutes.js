const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentsController');
const { authenticate, authorize } = require('../middleware/auth');
router.get('/', authenticate, authorize('admin','petugas'), ctrl.list);
router.post('/', authenticate, authorize('admin','petugas'), ctrl.create);
router.delete('/:id', authenticate, authorize('admin','petugas'), ctrl.remove);
module.exports = router;
