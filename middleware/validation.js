const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Validation rules for creating a session
const createSessionValidation = [
  body('totalOrderAmount')
    .isFloat({ min: 0 })
    .withMessage('Total order amount must be a positive number'),
  
  body('taxPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax percentage must be between 0 and 100'),
  
  body('servicePercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Service percentage must be between 0 and 100'),
  
  body('deliveryFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be a positive number'),
  
  body('numberOfFriends')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of friends must be at least 1'),
  
  body('instaPayURL')
    .optional()
    .isURL()
    .withMessage('InstaPay URL must be a valid URL'),
  
  handleValidationErrors
];

// Validation rules for adding a friend
const addFriendValidation = [
  param('id')
    .isString()
    .withMessage('Session ID must be a string'),
  
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product is required'),
  
  body('products.*.productName')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
  
  body('products.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  
  body('products.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('paymentMethod')
    .isBoolean()
    .withMessage('Payment method must be a boolean (true for InstaPay, false for cash)'),
  
  handleValidationErrors
];

// Validation rules for session ID parameter
const sessionIdValidation = [
  param('id')
    .isString()
    .withMessage('Session ID must be a string'),
  
  handleValidationErrors
];

// Validation rules for updating payment status
const updatePaymentValidation = [
  param('id')
    .isString()
    .withMessage('Session ID must be a string'),
  
  param('friendId')
    .isString()
    .withMessage('Friend ID must be a string'),
  
  body('hasPaid')
    .isBoolean()
    .withMessage('hasPaid must be a boolean'),
  
  handleValidationErrors
];

module.exports = {
  createSessionValidation,
  addFriendValidation,
  sessionIdValidation,
  updatePaymentValidation,
  handleValidationErrors
};
