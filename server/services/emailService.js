const { sendEmail } = require('../config/mailer');
const logger = require('../utils/logger');

// Function to send order confirmation emails
const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
  const subject = 'Your Order Confirmation';
  const text = `Thank you for your order! Here are your order details: ${JSON.stringify(orderDetails)}`;
  const html = orderConfirmationTemplate(orderDetails);

  try {
    await sendEmail(userEmail, subject, text, html);
    logger.info('Order confirmation email sent successfully.');
  } catch (error) {
    logger.error('Failed to send order confirmation email:', error);
    throw error;
  }
};

// Function to send password reset emails
const sendPasswordResetEmail = async (userEmail, resetLink) => {
    const subject = 'Password Reset Request';
    const text = `You requested a password reset. Click the link to reset your password: ${resetLink}`;
    const html = `<p>You requested a password reset. Click the link to reset your password: <a href="${resetLink}">Reset Password</a></p>`;
  
    try {
      await sendEmail(userEmail, subject, text, html);
      logger.info('Password reset email sent successfully.');
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw error;
    }
  };

module.exports = {
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
};