const express = require('express');
const router = express.Router();
const { createProduct, getProducts, updateProduct, deleteProduct, updateStock } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware(['admin']), createProduct);
router.get('/', authMiddleware(['admin', 'cashier']), getProducts);
router.put('/:id', authMiddleware(['admin']), updateProduct);
router.delete('/:id', authMiddleware(['admin']), deleteProduct);
router.put('/stock/:id', authMiddleware(['admin']), updateStock);

module.exports = router;