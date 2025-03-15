const Product = require('../models/Product');



/**
 * Calculate the total amount for an order.
 * @param {Array} products - Array of product objects with productId and quantity.
 * @param {Object} transaction - Sequelize transaction object.
 * @returns {Promise<number>} - Total amount for the order.
 */
const calculateTotalAmount = async (products, transaction) => {
    let totalAmount = 0;
  
    for (const item of products) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product with ID ${item.productId}.`);
      }
      totalAmount += product.price * item.quantity;
    }
  
    return totalAmount;
  };
  
  /**
   * Format a number as currency.
   * @param {number} amount - The amount to format.
   * @param {string} currency - The currency code (e.g., 'USD', 'EUR').
   * @returns {string} - Formatted currency string.
   */
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
  
  /**
   * Generate a random alphanumeric string.
   * @param {number} length - Length of the string.
   * @returns {string} - Random alphanumeric string.
   */
  const generateRandomString = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  module.exports = {
    calculateTotalAmount,
    formatCurrency,
    generateRandomString,
  };