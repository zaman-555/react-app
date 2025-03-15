const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const { DatabaseError } = require('../middlewares/errorHandler'); // Import custom error class

require('dotenv').config();

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false, // Use logger for SQL queries in development
    pool: { // Connection pooling
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
  } catch (err) {
    logger.error('Unable to connect to the database:', err);
    throw new DatabaseError('Failed to connect to the database.'); // Throw a custom error
  }
}

// Initialize database connection
testConnection().catch((err) => {
  logger.error('Database connection failed:', err.message);
  process.exit(1); // Exit if connection fails during startup
});

module.exports = sequelize;