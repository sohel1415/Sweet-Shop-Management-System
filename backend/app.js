const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Sweet = require('./models/Sweet');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/sweetshop', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes

// GET all sweets
app.get('/api/sweets', async (req, res) => {
  try {
    const sweets = await Sweet.find().sort({ productId: 1 });
    res.json({ data: sweets });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET one sweet by productId
app.get('/api/sweets/:productId', async (req, res) => {
  try {
    const sweet = await Sweet.findOne({ productId: Number(req.params.productId) });
    if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
    res.json(sweet);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create new sweet
app.post('/api/sweets', async (req, res) => {
  try {
    const { name, type, price, quantity } = req.body;
    
    // Get the highest productId
    const lastSweet = await Sweet.findOne().sort('-productId');
    const newProductId = lastSweet ? lastSweet.productId + 1 : 1001;
    
    const newSweet = new Sweet({ 
      productId: newProductId,
      name, 
      type, 
      price: Number(price), 
      quantity: Number(quantity) 
    });
    
    const savedSweet = await newSweet.save();
    res.status(201).json(savedSweet);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Duplicate product ID' });
    } else {
      res.status(400).json({ error: 'Invalid data' });
    }
  }
});

// PUT update sweet by productId
app.put('/api/sweets/:productId', async (req, res) => {
  try {
    const updatedSweet = await Sweet.findOneAndUpdate(
      { productId: Number(req.params.productId) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSweet) return res.status(404).json({ error: 'Sweet not found' });
    res.json(updatedSweet);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// DELETE sweet by productId
app.delete('/api/sweets/:productId', async (req, res) => {
  try {
    const deletedSweet = await Sweet.findOneAndDelete({ 
      productId: Number(req.params.productId) 
    });
    if (!deletedSweet) return res.status(404).json({ error: 'Sweet not found' });
    res.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});