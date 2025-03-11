const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get the token from the request header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided.'); // Log if no token is found
      throw new Error('Authorization token is required.');
    }

    console.log('Token received:', token); // Log the received token

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Decoded token payload:', decoded); // Log the decoded payload

    // Find the user associated with the token
    const user = await User.findByPk(decoded.id); // Use findByPk for Sequelize

    if (!user) {
      console.log(`User not found for ID: ${decoded.id}`); // Log if user not found
      throw new Error('User not found.');
    }

    // Attach the user and token to the request object
    req.user = user;
    req.token = token;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Authentication error:', error); // Log the error for debugging
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

module.exports = auth;