const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin'); // Import the admin middleware

// Create an order
router.post('/', authMiddleware, orderController.createOrder);

// Get order history
router.get('/history', authMiddleware, orderController.getOrderHistory);

// Get order details by ID
router.get('/:orderId', authMiddleware, orderController.getOrderById);

// Update order status (Admin only)
router.put('/:orderId/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

// Delete an order (Admin only) - Soft delete
router.delete('/:orderId', authMiddleware, adminMiddleware, orderController.deleteOrder);

module.exports = router;