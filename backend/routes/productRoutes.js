const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  updateProduct, 
  deleteProduct, 
  updateStock,
  uploadImage 
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes with image upload middleware
router.post('/', authMiddleware(['admin']), uploadImage, createProduct);
router.get('/', authMiddleware(['admin', 'cashier']), getProducts);
router.put('/:id', authMiddleware(['admin']), uploadImage, updateProduct);
router.delete('/:id', authMiddleware(['admin']), deleteProduct);
router.put('/stock/:id', authMiddleware(['admin']), updateStock);

module.exports = router;