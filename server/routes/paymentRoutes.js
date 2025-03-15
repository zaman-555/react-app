const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Process a payment
router.post('/process', authMiddleware, paymentController.processPayment);

module.exports = router;