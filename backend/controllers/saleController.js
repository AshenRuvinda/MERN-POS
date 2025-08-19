const Sale = require('../models/Sale');
const Product = require('../models/Product');

exports.createSale = async (req, res) => {
  const { products } = req.body;
  try {
    let total = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      total += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }
    const sale = new Sale({ userId: req.user.userId, products, total });
    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate('userId').populate('products.productId');
    res.json(sales);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const sales = await Sale.find().populate('userId').populate('products.productId');
    const daily = sales.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString());
    const weekly = sales.filter(s => new Date(s.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const monthly = sales.filter(s => new Date(s.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    res.json({ daily, weekly, monthly });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};