const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentsController');
const { authenticate, authorize } = require('../middleware/auth');
const { checkOwnership } = require('../middleware/ownership');

router.get('/', authenticate, authorize('admin', 'petugas'), ctrl.list);
router.get('/:id', authenticate, ctrl.getById);
router.post('/', authenticate, authorize('admin', 'petugas'), ctrl.create);
router.put('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, authorize('admin', 'petugas'), ctrl.remove);

module.exports = router;
