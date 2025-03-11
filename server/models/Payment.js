const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'paypal'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Define relationships
Payment.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = Payment;