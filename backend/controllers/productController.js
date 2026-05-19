const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bwipjs = require('bwip-js');

const normalizeBarcodeSource = (name = '') => {
  const normalized = String(name).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return normalized || 'PRODUCT';
};

const buildBarcodeNumberFromName = (name = '', suffix = '') => {
  const input = `${normalizeBarcodeSource(name)}${suffix}`;
  let hash1 = 5381;
  let hash2 = 52711;

  for (let index = 0; index < input.length; index += 1) {
    const charCode = input.charCodeAt(index);
    hash1 = ((hash1 << 5) + hash1) + charCode;
    hash2 = (hash2 * 33) ^ charCode;
  }

  const combined = `${Math.abs(hash1 >>> 0)}${Math.abs(hash2 >>> 0)}`.replace(/\D/g, '');
  return combined.padStart(12, '0').slice(0, 12);
};

const getUniqueBarcodeFromName = async (name, excludeProductId = null) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const barcode = buildBarcodeNumberFromName(name, attempt === 0 ? '' : `-${attempt}`);
    // eslint-disable-next-line no-await-in-loop
    const query = { barcode };
    if (excludeProductId) {
      query._id = { $ne: excludeProductId };
    }
    const existing = await Product.findOne(query);
    if (!existing) {
      return barcode;
    }
  }

  return buildBarcodeNumberFromName(`${name}-${Date.now()}`);
};

const BARCODE_CANVAS_WIDTH = 720;
const BARCODE_CANVAS_HEIGHT = 400;

const normalizeOptionalField = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return value;
};

const buildProductDataFromBody = (body) => {
  const productData = {
    name: body.name,
    price: normalizeOptionalField(body.price ?? body.sellingPrice),
    stock: normalizeOptionalField(body.stock),
  };

  const optionalFields = [
    'sku',
    'category',
    'brand',
    'description',
    'buyingPrice',
    'sellingPrice',
    'discountPrice',
    'reorderLevel',
    'unit',
    'batchNumber',
    'manufactureDate',
    'expiryDate',
    'supplierName',
    'supplierContact',
  ];

  optionalFields.forEach((field) => {
    const value = normalizeOptionalField(body[field]);
    if (value !== undefined) {
      productData[field] = value;
    }
  });

  if (productData.sellingPrice === undefined && body.price !== undefined && body.price !== '') {
    productData.sellingPrice = body.price;
  }

  if (productData.price === undefined && productData.sellingPrice !== undefined) {
    productData.price = productData.sellingPrice;
  }

  return productData;
};

const buildBarcodeSvg = async (barcode, title = '') => {
  const png = await bwipjs.toBuffer({
    bcid: 'code128',
    text: barcode,
    scale: 5,
    height: 24,
    includetext: false,
    textxalign: 'center',
    textsize: 12,
  });

  const base64 = png.toString('base64');
  const imageWidth = 640;
  const imageHeight = 210;
  const imageX = (BARCODE_CANVAS_WIDTH - imageWidth) / 2;
  const imageY = 44;
  const safeBarcode = String(barcode || '').replace(/[&<>"']/g, '');
  const safeTitle = String(title || '').replace(/[&<>"']/g, '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${BARCODE_CANVAS_WIDTH}" height="${BARCODE_CANVAS_HEIGHT}" viewBox="0 0 ${BARCODE_CANVAS_WIDTH} ${BARCODE_CANVAS_HEIGHT}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <image href="data:image/png;base64,${base64}" x="${imageX}" y="${imageY}" width="${imageWidth}" height="${imageHeight}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${BARCODE_CANVAS_WIDTH / 2}" y="336" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="400" text-anchor="middle" fill="#111827">${safeBarcode}</text>
  ${safeTitle ? `<text x="${BARCODE_CANVAS_WIDTH / 2}" y="372" font-family="Arial, Helvetica, sans-serif" font-size="18" text-anchor="middle" fill="#6b7280">${safeTitle}</text>` : ''}
</svg>`;
};

const ensureBarcodeImage = async (product, { forceRegenerate = false } = {}) => {
  const barcodeDir = 'uploads/barcodes';
  if (!fs.existsSync(barcodeDir)) {
    fs.mkdirSync(barcodeDir, { recursive: true });
  }

  if (!product.barcode) {
    product.barcode = await getUniqueBarcodeFromName(product.name);
  }

  const barcodeFilename = `barcode-${product.barcode}.svg`;
  const barcodePath = path.join(barcodeDir, barcodeFilename);

  if (forceRegenerate || !product.barcodeImage || !fs.existsSync(barcodePath)) {
    const svg = await buildBarcodeSvg(product.barcode, product.name);
    fs.writeFileSync(barcodePath, svg, 'utf8');
    product.barcodeImage = barcodeFilename;
  }

  return { barcodeFilename, barcodePath };
};

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
    const productData = buildProductDataFromBody(req.body);

    try {
      const tempProduct = new Product(productData);
      await ensureBarcodeImage(tempProduct, { forceRegenerate: true });
      productData.barcode = tempProduct.barcode;
      productData.barcodeImage = tempProduct.barcodeImage;
    } catch (bwErr) {
      console.error('Failed to generate barcode image', bwErr);
      // attach detail for debugging but continue to allow product creation
      productData.barcode = await getUniqueBarcodeFromName(productData.name);
      productData.barcodeImage = null;
      productData.barcodeError = bwErr.message || String(bwErr);
    }

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

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const normalized = categories
      .map((category) => String(category || '').trim())
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right));

    res.json(normalized);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updateData = buildProductDataFromBody(req.body);

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

    // Regenerate name-based barcode when the product name changes
    const nameChanged = String(existingProduct.name).trim() !== String(updateData.name).trim();
    if (nameChanged || !existingProduct.barcode) {
      updateData.barcode = await getUniqueBarcodeFromName(updateData.name, id);
      updateData.barcodeImage = null;
      const updatedProduct = new Product({ ...existingProduct.toObject(), ...updateData });
      await ensureBarcodeImage(updatedProduct, { forceRegenerate: true });
      updateData.barcode = updatedProduct.barcode;
      updateData.barcodeImage = updatedProduct.barcodeImage;
    } else {
      updateData.barcode = existingProduct.barcode;
      if (existingProduct.barcodeImage) {
        updateData.barcodeImage = existingProduct.barcodeImage;
      }
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

// Generate barcode image for an existing product (on-demand)
exports.generateBarcodeForProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    try {
      await ensureBarcodeImage(product, { forceRegenerate: true });
      await product.save();
      return res.json(product);
    } catch (bwErr) {
      console.error('Failed to generate barcode image', bwErr);
      return res.status(500).json({ error: 'Failed to generate barcode image', detail: bwErr.message || String(bwErr) });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Ensure barcode exists and send SVG file for download (authenticated POST)
exports.downloadBarcodeForProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await ensureBarcodeImage(product, { forceRegenerate: false });
    await product.save();

    const barcodePath = path.join('uploads/barcodes', product.barcodeImage);

    // Send file as attachment
    return res.download(path.resolve(barcodePath), `${product.barcode}-barcode.svg`, (err) => {
      if (err) {
        console.error('Error sending barcode file', err);
        if (!res.headersSent) res.status(500).json({ error: 'Failed to send barcode file', detail: err.message || String(err) });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};