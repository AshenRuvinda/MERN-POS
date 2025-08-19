const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');

// Load environment variables
dotenv.config();

// Debug: Log environment variables to verify
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Undefined');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Undefined');
console.log('PORT:', process.env.PORT || '5000');

const app = express();

// Set Mongoose strictQuery to suppress deprecation warning
mongoose.set('strictQuery', true);

app.use(cors());
app.use(express.json());

// Check if MONGO_URI is defined before connecting
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));