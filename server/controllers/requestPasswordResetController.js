const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../services/emailService');
const User = require('../models/User');

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
      expiresIn: '1h', // Token expires in 1 hour
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