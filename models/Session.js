const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  }
}, { _id: true });

const friendSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Friend name is required'],
    trim: true
  },
  products: {
    type: [productSchema],
    required: [true, 'Products are required'],
    validate: {
      validator: function(products) {
        return products && products.length > 0;
      },
      message: 'At least one product is required'
    }
  },
  paymentMethod: {
    type: Boolean,
    required: [true, 'Payment method is required'],
    default: false // false = cash, true = InstaPay
  },
  subtotal: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  serviceAmount: {
    type: Number,
    default: 0
  },
  deliveryShare: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  hasPaid: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  totalOrderAmount: {
    type: Number,
    required: [true, 'Total order amount is required'],
    min: [0, 'Total order amount cannot be negative']
  },
  taxPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Tax percentage cannot be negative'],
    max: [100, 'Tax percentage cannot exceed 100%']
  },
  servicePercentage: {
    type: Number,
    default: 0,
    min: [0, 'Service percentage cannot be negative'],
    max: [100, 'Service percentage cannot exceed 100%']
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: [0, 'Delivery fee cannot be negative']
  },
  numberOfFriends: {
    type: Number,
    default: 1,
    min: [1, 'Number of friends must be at least 1']
  },
  instaPayURL: {
    type: String,
    default: '',
    trim: true
  },
  billImage: {
    type: String,
    default: ''
  },
  friends: {
    type: [friendSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
sessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for session link
sessionSchema.virtual('sessionLink').get(function() {
  const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';
  return `${frontendUrl}/session/${this.sessionId}`;
});

// Method to calculate friend's total amount
sessionSchema.methods.calculateFriendTotal = function(friend) {
  const subtotal = friend.products.reduce((sum, product) => {
    return sum + (product.unitPrice * product.quantity);
  }, 0);

  const taxPercentage = this.taxPercentage || 0;
  const servicePercentage = this.servicePercentage || 0;
  const deliveryFee = this.deliveryFee || 0;
  const numberOfFriends = this.numberOfFriends || 1;

  const taxAmount = (subtotal * taxPercentage) / 100;
  const serviceAmount = (subtotal * servicePercentage) / 100;
  const deliveryShare = deliveryFee / numberOfFriends;
  const totalAmount = subtotal + taxAmount + serviceAmount + deliveryShare;

  return {
    subtotal,
    taxAmount,
    serviceAmount,
    deliveryShare,
    totalAmount
  };
};

// Method to get session summary
sessionSchema.methods.getSummary = function() {
  const totalPaidInstaPay = this.friends
    .filter(friend => friend.paymentMethod && friend.hasPaid)
    .reduce((sum, friend) => sum + friend.totalAmount, 0);

  const totalPaidCash = this.friends
    .filter(friend => !friend.paymentMethod && friend.hasPaid)
    .reduce((sum, friend) => sum + friend.totalAmount, 0);

  const totalUnpaid = this.friends
    .filter(friend => !friend.hasPaid)
    .reduce((sum, friend) => sum + friend.totalAmount, 0);

  return {
    totalOrderAmount: this.totalOrderAmount,
    totalPaidInstaPay,
    totalPaidCash,
    totalUnpaid,
    friendsCount: this.friends.length,
    expectedFriendsCount: this.numberOfFriends
  };
};

module.exports = mongoose.model('Session', sessionSchema);
