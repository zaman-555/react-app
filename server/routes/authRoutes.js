const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register a new user
router.post('/register', authController.register);

// Verify user email
router.get('/verify', authController.verifyEmail);

// Login a user
router.post('/login', authController.login);

// Request password reset
router.post('/request-password-reset', authController.requestPasswordReset);

// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;