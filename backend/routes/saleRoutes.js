const express = require('express');
const router = express.Router();
const { createSale, getSales, getReports } = require('../controllers/saleController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware(['cashier']), createSale);
router.get('/', authMiddleware(['admin']), getSales);
router.get('/reports', authMiddleware(['admin']), getReports);

module.exports = router;