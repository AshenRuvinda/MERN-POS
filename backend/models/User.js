const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  birthday: { type: Date, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'cashier'], default: 'cashier' },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', userSchema);