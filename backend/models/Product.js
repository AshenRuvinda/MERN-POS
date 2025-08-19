const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  barcode: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  image: { 
    type: String, 
    default: null // This will store the image filename or URL
  },
}, {
  timestamps: true // Add created/updated timestamps
});

module.exports = mongoose.model('Product', productSchema);