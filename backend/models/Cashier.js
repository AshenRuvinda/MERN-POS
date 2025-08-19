const mongoose = require('mongoose');

const cashierSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  birthday: { type: Date, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Cashier', cashierSchema);