const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema({
  productId: {
    type: Number,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-increment productId
sweetSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  try {
    const lastSweet = await this.constructor.findOne({}, {}, { sort: { 'productId': -1 } });
    this.productId = lastSweet ? lastSweet.productId + 1 : 1001;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Sweet', sweetSchema);