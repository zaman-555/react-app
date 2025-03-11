// Template for order confirmation email
const orderConfirmationTemplate = (orderDetails) => {
    return `
      <h1>Thank you for your order!</h1>
      <p>Here are your order details:</p>
      <ul>
        ${orderDetails.items.map(
          (item) => `<li>${item.name} - ${item.quantity} x $${item.price}</li>`
        ).join('')}
      </ul>
      <p><strong>Total: $${orderDetails.total}</strong></p>
    `;
  };
  
  // Template for password reset email
  const passwordResetTemplate = (resetLink) => {
    return `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
    `;
  };
  
  module.exports = {
    orderConfirmationTemplate,
    passwordResetTemplate,
  };