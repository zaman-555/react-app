const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    indexes: [{ unique: false, fields: ['name'] }], // Add index for faster search
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0, // Ensure price is non-negative
    },
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    indexes: [{ unique: false, fields: ['category'] }], // Add index for faster filtering
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

module.exports = Product;