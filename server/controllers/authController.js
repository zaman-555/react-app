const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken module
const  User   = require('../models/User'); 
const { generateToken } = require('../config/auth');
const { sendEmail } = require('../config/mailer');
require('dotenv').config();


// Register a new user
exports.register = async (req, res) => {
  const { name, email, password, profilePicture } = req.body; // Add profilePicture

  try {
    console.log('User model:', User); // Debugging: Check if User is defined

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePicture, // Add profilePicture
    });
    console.log(user);

    // Generate a verification token
    const verificationToken = generateToken(user);

    // Send verification email
    const verificationLink = `http://localhost:5000/api/auth/verify?token=${verificationToken}`;
    await sendEmail(
      user.email,
      'Verify Your Email',
      `Please verify your email by clicking the link: ${verificationLink}`,
      `<p>Please verify your email by clicking the link: <a href="${verificationLink}">Verify Email</a></p>`
    );

    // Return the response
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture, // Add profilePicture
      },
    });
  } catch (err) {
    console.error('Error during registration:', err);
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
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare the password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Include the role in the token payload
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

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
    console.error('Error during login:', err);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    console.log('Token:', token);
    console.log('Decoded:', decoded);

    // Mark the user as verified
    user.isVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(400).json({ error: 'Invalid or expired token.' });
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
    console.error('Error requesting password reset:', error);
    res.status(500).json({ error: 'An error occurred while requesting a password reset.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if the reset token is valid and not expired
    if (user.resetToken !== token || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
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
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
};