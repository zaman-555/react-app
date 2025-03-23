const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Protected routes (require authentication)
router.use(authMiddleware);

// Process payment
router.post('/process-payment', paymentController.processPayment);

module.exports = router;