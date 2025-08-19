const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Cashier = require('../models/Cashier');

exports.adminRegister = async (req, res) => {
  const { name, password } = req.body;
  try {
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existingAdmin = await Admin.findOne({ name });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Name already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, password: hashedPassword });
    await admin.save();
    res.status(201).json({ message: 'Admin account created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

exports.register = async (req, res) => {
  const { firstName, lastName, username, birthday, phoneNumber, password } = req.body;
  try {
    if (!firstName || !lastName || !username || !birthday || !phoneNumber || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existingCashier = await Cashier.findOne({ username });
    if (existingCashier) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const cashier = new Cashier({
      firstName,
      lastName,
      username,
      birthday,
      phoneNumber,
      password: hashedPassword
    });
    await cashier.save();
    res.status(201).json({ message: 'Cashier created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log('Login attempt with username:', username); // Debug log
    let user = await Admin.findOne({ name: username });
    let userType = 'admin';
    if (!user) {
      user = await Cashier.findOne({ username });
      userType = 'cashier';
    }
    if (!user) {
      console.log('No user found for username:', username); // Debug log
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (userType === 'cashier' && !user.isActive) {
      console.log('Cashier is inactive:', username); // Debug log
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for username:', username); // Debug log
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful, userType:', userType, 'userId:', user._id); // Debug log
    res.json({ token, role: userType });
  } catch (error) {
    console.error('Login error:', error.message); // Debug log
    res.status(400).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const cashiers = await Cashier.find();
    res.json(cashiers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, username, birthday, phoneNumber, password, isActive } = req.body;
  try {
    const updateData = { firstName, lastName, username, birthday, phoneNumber, isActive };
    if (password) updateData.password = await bcrypt.hash(password, 10);
    const cashier = await Cashier.findByIdAndUpdate(id, updateData, { new: true });
    res.json(cashier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};