const { Order, OrderItem } = require('../models/Order');
const { Cart, CartItem } = require('../models/Cart'); 
const Product = require('../models/Product');
const User = require('../models/User'); // Ensure you import User
const sequelize = require('../config/db');
const stripe = require('stripe')('your-stripe-secret-key'); // Replace with your Stripe secret key
const nodemailer = require('nodemailer'); // For sending emails
const logger = require('../utils/logger');

const { calculateTotalAmount } = require('../utils/helpers');
require('dotenv').config();


// Create an order (with checkout functionality)
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { products } = req.body;
    const userId = req.user.id;

    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Calculate total amount
    const totalAmount = await calculateTotalAmount(products, transaction);

    // Create the order
    const order = await Order.create(
      {
        userId,
        totalAmount,
        status: 'pending',
      },
      { transaction }
    );

    // Add order items and update product stock
    await createOrderItems(products, order.id, transaction);

    // Process payment
    const paymentIntent = await processStripePayment(totalAmount, order.id);

    // Update order status
    order.status = 'completed';
    await order.save({ transaction });

    // Send email confirmation
    const user = await User.findByPk(userId);
    await sendOrderConfirmationEmail(user, order);

    // Clear the cart
    await CartItem.destroy({ where: { cartId: req.user.cart.id }, transaction });

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: 'Checkout successful. Order created and payment processed.',
      order,
      paymentIntent,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error during checkout:', error.message);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Other controller functions (getOrderHistory, updateOrderStatus, etc.)

// Get the user's order history
exports.getOrderHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [Product], // Include product details
        },
      ],
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update the status of an order (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Debugging: Log the request body and orderId
    console.log('Request Body:', req.body);
    console.log('Order ID:', orderId);

    // Input validation
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully.', order });
  } catch (error) {
    logger.error('Error updating order status:', error.message);
    res.status(500).json({ error: 'An error occurred while updating the order status.' });
  }
};

// Delete an order (Admin only)
exports.deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Soft delete the order
    await order.destroy();
    res.json({ message: 'Order deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Find the order by ID
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [Product], // Include product details
        },
      ],
    });

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Users can only view their own orders, admins can view all orders
    if (userRole !== 'admin' && order.userId !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only view your own orders.' });
    }

    // Return the order details
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};