const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const { generateToken } = require('../config/auth');

// Register a new user
router.post('/register', authController.register);

// Verify user email
router.get('/verify/:token', authController.verifyEmail);

// Login a user
router.post('/login', authController.login);

// Request password reset
router.post('/request-password-reset', authController.requestPasswordReset);

// Serve the password reset form
router.get('/reset-password', authController.getResetPasswordForm);

// Handle the password reset submission
router.post('/reset-password', authController.resetPassword);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user);

    // Redirect to the frontend dashboard with the token
    res.redirect(`http://localhost:5173/dashboard?token=${token}`);
  }
);

module.exports = router;