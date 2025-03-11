const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  throw new Error('EMAIL_USER and EMAIL_PASSWORD must be set in the environment variables.');
}

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generic function to send emails
const sendEmail = async (to, subject, text, html = '') => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text, // Plain text body
    html, // HTML body (optional)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };