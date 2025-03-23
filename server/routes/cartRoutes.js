const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/auth');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

// Protected routes (require authentication)
router.use(authMiddleware);

// Add to cart
router.post(
  '/add-to-cart',
  [
    body('productId').isInt({ min: 1 }).withMessage('Product ID must be a positive integer.'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  cartController.addToCart
);

// Update cart item quantity
router.put(
  '/:productId',
  [
    param('productId').isInt({ min: 1 }).withMessage('Product ID must be a positive integer.'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  cartController.updateCartItem
);

// Remove from cart
router.delete(
  '/:productId',
  [
    param('productId').isInt({ min: 1 }).withMessage('Product ID must be a positive integer.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  cartController.removeFromCart
);

// Get cart
router.get('/', cartController.getCart);

module.exports = router;