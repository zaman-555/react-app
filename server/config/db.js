const { Sequelize } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Enable logging in development
    pool: { // Connection pooling
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit if connection fails during startup
  }
}

testConnection();

module.exports = sequelize;