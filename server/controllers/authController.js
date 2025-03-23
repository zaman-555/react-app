const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken module
const  User   = require('../models/User'); 
const { generateToken } = require('../config/auth');
const { sendEmail, sendPasswordResetEmail } = require('../config/mailer');
const logger = require('../utils/logger');
require('dotenv').config();


// Register a new user
const ejs = require('ejs');
const path = require('path');
const nodemailer = require('nodemailer');



// Register user controller function
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user in the database
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // Save the hashed password
      role: 'user', // Default role
      isVerified: false, // User is not verified by default
      isActive: true, // User is active by default
    });

    // Generate a verification token
    const verificationToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save the verification token to the database
    user.verificationToken = verificationToken;
    await user.save();

    // Send a verification email (pseudo-code)
    sendEmail(user.email, verificationToken);

    // Return a success response
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    logger.error('Error during registration:', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'An error occurred during registration.' });
  }
};
// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.error('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Debugging: Log the provided password and stored hashed password
    logger.debug('Provided password:', password);
    logger.debug('Stored hashed password:', user.password);

    // Compare the password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.error('Invalid password for user:', user.email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      logger.error('User email is not verified:', user.email);
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    // Generate a JWT token
    const token = generateToken(user);

    // Return the token and user details
    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error('Error during login:', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'An error occurred during login.' });
  }
};

// Verify email controller function
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  console.log('Incoming token:', token); // Debug log

  if (!token || typeof token !== 'string' || !token.startsWith('eyJ')) {
    return res.status(400).json({ error: 'Invalid verification token.' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log

    // Find the user by ID
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.verificationToken = null; // Clear the verification token
    await user.save();

    // Redirect to the frontend dashboard with a success message
    res.redirect(`http://localhost:5173/dashboard?message=Email verified successfully`);
  } catch (err) {
    console.error('Error during email verification:', err);

    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Verification token has expired.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid verification token.' });
    }

    // Generic error response
    res.status(500).json({ error: 'An error occurred during email verification.' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '12h', // Token expires in 1 hour
    });

    // Save the reset token and expiration time to the database
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
    await user.save();

    // Send the password reset email
    const resetLink = `http://localhost:5000/api/auth/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    res.json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    logger.error('Error requesting password reset:', error);
    res.status(500).json({ error: 'An error occurred while requesting a password reset.' });
  }
};

// controllers/authController.js
exports.resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  try {
    // Validate the token and passwords
    if (!token) {
      return res.status(400).json({ error: 'Reset token is missing.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id, resetToken: token } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    // Check if the token has expired
    if (user.resetTokenExpires < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'An error occurred while resetting the password.' });
  }
};


exports.getResetPasswordForm = (req, res) => {
  const { token } = req.query; // Extract the token from the query parameters

  if (!token) {
    return res.status(400).json({ error: 'Reset token is missing.' });
  }

  // Render the password reset form (EJS template)
  res.render('resetPasswordForm', { token });
};

exports.googleOAuthCallback = async (req, res) => {
   try {
     console.log('Google OAuth callback received:', req.user); // Log the user object
     const user = req.user;
     const token = generateToken(user);
     console.log("Generated Token: ", token);
     res.redirect(`/dashboard?token=${token}`);
   } catch (error) {
   console.error('Error handling Google OAuth callback:', error);
    res.status(500).json({ error: 'An error occurred during Google OAuth.' });
   }
  };