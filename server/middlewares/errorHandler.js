const logger = require('../utils/logger'); // Import the logger



// Custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
  }
}

class PaymentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PaymentError';
    this.statusCode = 402;
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  // Determine the status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server.';

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack trace only in development
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'Reason:', reason);
  // Optionally, you can throw the reason to crash the app and restart it
  throw reason;
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Exit the process to prevent the app from running in an undefined state
  process.exit(1);
});

module.exports = {
  errorHandler,
  ValidationError,
  DatabaseError,
  PaymentError,
};