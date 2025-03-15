const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require ('../models/Product');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Primary key for the Order table.',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    indexes: [{ unique: false, fields: ['userId'] }], // Add index
    comment: 'Foreign key referencing the User who placed the order.',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0, // Ensure totalAmount is non-negative
    },
    comment: 'The total amount of the order, calculated as the sum of all order items.',
  },
  status:  {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Timestamp when the order was created.',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Timestamp when the order was last updated.',
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when the order was soft-deleted.',
  },
}, {
  paranoid: true, // Enable soft deletes
});



const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Primary key for the OrderItem table.',
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id',
    },
    indexes: [{ unique: false, fields: ['orderId'] }], // Add index
    comment: 'Foreign key referencing the Order this item belongs to.',
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
    indexes: [{ unique: false, fields: ['productId'] }], // Add index
    comment: 'Foreign key referencing the Product in this order item.',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1, // Ensure quantity is at least 1
    },
    comment: 'The quantity of the product in this order item.',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0, // Ensure price is non-negative
    },
    comment: 'The price of the product at the time of order.',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Timestamp when the order item was created.',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Timestamp when the order item was last updated.',
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when the order item was soft-deleted.',
  },
}, {
  paranoid: true, // Enable soft deletes
});

// Define relationships
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = { Order, OrderItem };