const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');
const ejs = require('ejs');
const path = require('path');
const { Order , OrderItem } = require('../models/Order');
const  Product  = require('../models/Product');

// Create an order (with checkout functionality)
router.post(
  '/',
  authMiddleware,
  [
    body('products').isArray().withMessage('Products must be an array.'),
    body('products.*.productId').isInt().withMessage('Invalid product ID.'),
    body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  ],
  orderController.createOrder
);

// Get order history
router.get(
  '/history',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit.'),
  ],
  orderController.getOrderHistory
);

// Get order details by ID
router.get(
  '/:orderId',
  authMiddleware,
  [
    param('orderId').isInt().withMessage('Invalid order ID.'),
  ],
  orderController.getOrderById
);

// Update order status (Admin only)
router.put(
  '/:orderId/status',
  authMiddleware,
  adminMiddleware,
  [
    param('orderId').isInt().withMessage('Invalid order ID.'),
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status.'),
  ],
  orderController.updateOrderStatus
);

// Delete an order (Admin only) - Soft delete
router.delete(
  '/:orderId',
  authMiddleware,
  adminMiddleware,
  [
    param('orderId').isInt().withMessage('Invalid order ID.'),
  ],
  orderController.deleteOrder
);

// Preview email template for an order

router.get('/preview-email/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
  
      // Find the order by ID
      const order = await Order.findOne({
        where: { id: orderId },
        include: [
          {
            model: OrderItem,
            include: [Product],
          },
        ],
      });
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }
  
      // Render the EJS template
      const templatePath = path.join(__dirname, '../views/orderConfirmation.ejs');
      const html = await ejs.renderFile(templatePath, { order });
  
      // Send the rendered HTML as a response
      res.send(html);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;