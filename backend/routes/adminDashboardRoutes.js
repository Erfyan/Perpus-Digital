const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminDashboardController');
const { authenticate, authorize } = require('../middleware/auth');
router.get('/', authenticate, authorize('admin','petugas'), ctrl.admin);
module.exports = router;
