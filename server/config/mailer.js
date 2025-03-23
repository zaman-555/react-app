const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
require('dotenv').config(); // Load environment variables

// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
});

// Function to send an email
const sendEmail = async (email, token, name) => {
  try {
    // Construct the verification URL
    const verificationUrl = `http://localhost:5000/api/auth/verify/${token}`;

    // Render the EJS template
    const templatePath = path.join(__dirname, '../views/verifyEmail.ejs');
    const html = await ejs.renderFile(templatePath, { name, link: verificationUrl });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Recipient address
      subject: 'Verify Your Email', // Email subject
      html, // Email content (HTML)
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};


const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    await sendEmail(
      email, // Recipient email
      'Password Reset Request', // Email subject
      'passwordResetEmail', // EJS template name (without .ejs)
      {
        resetLink,
      }
    );
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// controllers/authController.js
exports.getResetPasswordForm = (req, res) => {
  const { token } = req.query; // Extract the token from the query parameters

  if (!token) {
    return res.status(400).json({ error: 'Reset token is missing.' });
  }

  // Render the password reset form (e.g., using EJS)
  res.render('resetPasswordForm', { token });
};
module.exports = { sendEmail, sendPasswordResetEmail }; 