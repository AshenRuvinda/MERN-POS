const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  getCategories,
  updateProduct, 
  deleteProduct, 
  updateStock,
  uploadImage, 
  generateBarcodeForProduct,
  downloadBarcodeForProduct
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes with image upload middleware
router.post('/', authMiddleware(['admin']), uploadImage, createProduct);
router.get('/', authMiddleware(['admin', 'cashier']), getProducts);
router.get('/categories', authMiddleware(['admin', 'cashier']), getCategories);
router.put('/:id', authMiddleware(['admin']), uploadImage, updateProduct);
router.delete('/:id', authMiddleware(['admin']), deleteProduct);
router.put('/stock/:id', authMiddleware(['admin']), updateStock);
router.post('/:id/barcode', authMiddleware(['admin']), generateBarcodeForProduct);
router.post('/:id/barcode/download', authMiddleware(['admin']), downloadBarcodeForProduct);
router.get('/:id/barcode/download', authMiddleware(['admin']), downloadBarcodeForProduct);

module.exports = router;