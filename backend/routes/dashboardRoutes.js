const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');
router.get('/student', authenticate, authorize('siswa'), ctrl.student);
module.exports = router;
