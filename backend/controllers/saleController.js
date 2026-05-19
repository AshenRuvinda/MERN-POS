const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Cashier = require('../models/Cashier');

const resolveUserDetails = async (userId) => {
  if (!userId) {
    return { userDisplayName: 'Unknown User', userType: 'unknown' };
  }

  const admin = await Admin.findById(userId).select('name').lean();
  if (admin) {
    return { userDisplayName: admin.name, userType: 'admin' };
  }

  const cashier = await Cashier.findById(userId).select('firstName lastName username').lean();
  if (cashier) {
    return {
      userDisplayName: `${cashier.firstName} ${cashier.lastName}`.trim() || cashier.username,
      userType: 'cashier'
    };
  }

  return { userDisplayName: 'Unknown User', userType: 'unknown' };
};

const enrichSales = async (sales) => {
  const enrichedSales = [];

  for (const sale of sales) {
    const saleObject = sale.toObject ? sale.toObject() : sale;
    const userDetails = await resolveUserDetails(saleObject.userId?._id || saleObject.userId);

    enrichedSales.push({
      ...saleObject,
      ...userDetails,
      userId: {
        ...(saleObject.userId && typeof saleObject.userId === 'object' ? saleObject.userId : {}),
        userDisplayName: userDetails.userDisplayName,
        userType: userDetails.userType,
      }
    });
  }

  return enrichedSales;
};

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
    const sales = await Sale.find().populate('products.productId');
    const enrichedSales = await enrichSales(sales);
    res.json(enrichedSales);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const sales = await Sale.find().populate('products.productId');
    const enrichedSales = await enrichSales(sales);
    const daily = enrichedSales.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString());
    const weekly = enrichedSales.filter(s => new Date(s.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const monthly = enrichedSales.filter(s => new Date(s.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    res.json({ daily, weekly, monthly });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};