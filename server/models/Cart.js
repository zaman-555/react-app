const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('../models/Product');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0, // Default value is 0
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

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Carts',
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1, // Ensure quantity is at least 1
    },
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
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// Hooks for CartItem
CartItem.beforeCreate(async (cartItem) => {
  // Ensure the product exists
  const product = await Product.findByPk(cartItem.productId);
  if (!product) {
    throw new Error('Product not found.');
  }
});

CartItem.beforeUpdate(async (cartItem) => {
  // Ensure the product exists
  const product = await Product.findByPk(cartItem.productId);
  if (!product) {
    throw new Error('Product not found.');
  }
});

module.exports = { Cart, CartItem };