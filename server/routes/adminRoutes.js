const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

// Product Management
router.post('/products', authMiddleware, adminMiddleware, adminController.createProduct);
router.put('/products/:productId', authMiddleware, adminMiddleware, adminController.updateProduct);
router.delete('/products/:productId', authMiddleware, adminMiddleware, adminController.deleteProduct);
router.get('/products', authMiddleware, adminMiddleware, adminController.listProducts);

// User Management
router.get('/users', authMiddleware, adminMiddleware, adminController.listUsers);
router.put('/users/:userId', authMiddleware, adminMiddleware, adminController.updateUser);
router.put('/users/:userId/role', authMiddleware, adminMiddleware, adminController.updateUserRole);
router.delete('/users/:userId', authMiddleware, adminMiddleware, adminController.deleteUser);

// Order Management
router.get('/orders', authMiddleware, adminMiddleware, adminController.listOrders);
router.put('/orders/:orderId/status', authMiddleware, adminMiddleware, adminController.updateOrderStatus);

module.exports = router;