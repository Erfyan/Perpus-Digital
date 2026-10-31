const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/digitalBooksController');
const { authenticate } = require('../middleware/auth');
router.get('/:id/read', authenticate, ctrl.read);
router.get('/:id/download', authenticate, ctrl.download);
module.exports = router;
