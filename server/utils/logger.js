const winston = require('winston');
const { combine, timestamp, printf, colorize } = winston.format;

// Define log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // Log level (e.g., 'info', 'error', 'debug')
  format: combine(
    colorize(), // Add colors to console output
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
    logFormat // Apply the log format
  ),
  transports: [
    // Log to the console
    new winston.transports.Console(),
    // Log to a file
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});

// Export the logger
module.exports = logger; // Export the logger directly