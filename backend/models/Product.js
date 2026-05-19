const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  barcode: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, default: '' },
  category: { type: String, default: '' },
  brand: { type: String, default: '' },
  description: { type: String, default: '' },
  buyingPrice: { type: Number, default: null },
  sellingPrice: { type: Number, default: null },
  discountPrice: { type: Number, default: null },
  reorderLevel: { type: Number, default: 0 },
  unit: { type: String, default: 'piece' },
  batchNumber: { type: String, default: '' },
  manufactureDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  supplierName: { type: String, default: '' },
  supplierContact: { type: String, default: '' },
  image: { 
    type: String, 
    default: null // This will store the image filename or URL
  },
  barcodeImage: {
    type: String,
    default: null // filename for generated barcode image (png/svg)
  },
}, {
  timestamps: true // Add created/updated timestamps
});

module.exports = mongoose.model('Product', productSchema);