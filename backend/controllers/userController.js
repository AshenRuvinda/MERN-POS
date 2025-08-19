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
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    console.log('Login attempt with username:', username);
    
    // Check for admin first
    let user = await Admin.findOne({ name: username });
    let userType = 'admin';
    
    // If no admin found, check for cashier
    if (!user) {
      user = await Cashier.findOne({ username });
      userType = 'cashier';
    }
    
    // If no user found at all
    if (!user) {
      console.log('No user found for username:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if cashier is active (only for cashier users)
    if (userType === 'cashier' && !user.isActive) {
      console.log('Cashier account is inactive:', username);
      return res.status(403).json({ error: 'Account is inactive. Please contact administrator.' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for username:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token with extended payload
    const tokenPayload = {
      userId: user._id,
      userType: userType,
      username: userType === 'admin' ? user.name : user.username
    };
    
    const token = jwt.sign(
      tokenPayload, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' } // Extended session time
    );
    
    console.log('Login successful:', {
      userType: userType, 
      userId: user._id,
      username: tokenPayload.username
    });
    
    // Return success response with role information
    res.json({ 
      token, 
      role: userType,
      user: {
        id: user._id,
        userType: userType,
        username: tokenPayload.username,
        ...(userType === 'cashier' && {
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive
        })
      }
    });
    
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    // Only return cashiers for user management
    const cashiers = await Cashier.find().select('-password');
    res.json(cashiers);
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, username, birthday, phoneNumber, password, isActive } = req.body;
  
  try {
    // Build update object
    const updateData = { 
      firstName, 
      lastName, 
      username, 
      birthday, 
      phoneNumber, 
      isActive 
    };
    
    // Only hash password if provided
    if (password && password.trim()) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // Check if username is already taken by another user
    if (username) {
      const existingUser = await Cashier.findOne({ 
        username: username,
        _id: { $ne: id }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }
    
    // Update user
    const cashier = await Cashier.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, select: '-password' }
    );
    
    if (!cashier) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(cashier);
    
  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
};