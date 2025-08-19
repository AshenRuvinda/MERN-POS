const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/products';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

exports.createProduct = async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      barcode: req.body.barcode,
      price: req.body.price,
      stock: req.body.stock
    };

    // If image was uploaded, add it to product data
    if (req.file) {
      productData.image = req.file.filename;
    }

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    // If there was an error and an image was uploaded, delete it
    if (req.file) {
      fs.unlink(path.join('uploads/products', req.file.filename), (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updateData = {
      name: req.body.name,
      barcode: req.body.barcode,
      price: req.body.price,
      stock: req.body.stock
    };

    // Get the existing product to handle image replacement
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If new image was uploaded
    if (req.file) {
      // Delete old image if it exists
      if (existingProduct.image) {
        const oldImagePath = path.join('uploads/products', existingProduct.image);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Error deleting old image:', err);
        });
      }
      updateData.image = req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.json(product);
  } catch (error) {
    // If there was an error and a new image was uploaded, delete it
    if (req.file) {
      fs.unlink(path.join('uploads/products', req.file.filename), (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated image file
    if (product.image) {
      const imagePath = path.join('uploads/products', product.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image file:', err);
      });
    }

    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(id, { stock }, { new: true });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Export the multer upload middleware
exports.uploadImage = upload.single('image');