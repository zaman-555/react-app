const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get the user's cart
router.get('/', authMiddleware, cartController.getCart);

// Add an item to the cart
router.post('/add', authMiddleware, cartController.addToCart);

// Remove an item from the cart
router.delete('/remove/:cartItemId', authMiddleware, cartController.removeFromCart);

module.exports = router;