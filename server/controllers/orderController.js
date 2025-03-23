const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
const { Cart, CartItem } = require('../models/Cart');
const sequelize = require('../config/db');
const logger = require('../utils/logger');
const { sendEmail } = require('../config/mailer');
const ejs = require('ejs');
const path = require('path');

// Create an order



exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId, userName, userEmail, shippingAddress, paymentIntentId } = req.body;

    // Debug: Log the user ID
    logger.info("User ID:", userId);

    // Find the user's cart
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [Product],
        },
      ],
      transaction,
    });

    // If no cart exists, return an error
    if (!cart) {
      return res.status(404).json({ error: 'No cart found for the user. Please add items to the cart first.' });
    }

    // Debug: Log the cart and its items
    console.log('Cart:', cart);
    console.log('Cart Items:', cart.CartItems);

    // If the cart is empty, return an error
    if (!cart.CartItems || cart.CartItems.length === 0) {
      return res.status(400).json({ error: 'The cart is empty. Please add items to the cart before placing an order.' });
    }

    // Calculate the total amount
    let totalAmount = 0;
    for (const item of cart.CartItems) {
      const product = item.Product;
      console.log('Product:', product); // Debug: Log the product
      console.log('Quantity:', item.quantity); // Debug: Log the quantity
      console.log('Price:', product.price); // Debug: Log the price
      totalAmount += product.price * item.quantity;
    }
    console.log('Total Amount:', totalAmount); // Debug: Log the total amount

    // Create the order
    const order = await Order.create(
      {
        userId,
        shippingAddress,
        totalAmount,
        paymentIntentId,
        status: 'pending',
      },
      { transaction }
    );

    // Add order items and update product stock
    const items = [];
    for (const item of cart.CartItems) {
      const product = item.Product;

      await OrderItem.create(
        {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        },
        { transaction }
      );

      // Reduce product stock
      product.stock -= item.quantity;
      await product.save({ transaction });

      // Add item details for the email
      items.push({
        quantity: item.quantity,
        price: product.price,
        Product: {
          name: product.name,
        },
      });
    }

    // Clear the cart
    await CartItem.destroy({ where: { cartId: cart.id }, transaction });

    // Commit the transaction
    await transaction.commit();
    console.log('Transaction committed successfully.');

    // Prepare data for the email template
    const orderData = {
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      user: {
        id: userId,
        name: userName,
        email: userEmail,
      },
      items,
    };

    // Debug: Log the order data
    console.log('Order Data:', orderData);

    // Render the email template
    const templatePath = path.join(__dirname, '../views/orderConfirmation.ejs');
    const html = await ejs.renderFile(templatePath, { order: orderData });
    console.log('Email template rendered successfully.');

    // Send the email to the user
    await sendEmail(userEmail, 'Order Confirmation', 'orderConfirmation', { order: orderData });
    console.log('Email sent successfully.');

    res.status(201).json({
      message: 'Order created successfully.',
      order,
    });
  } catch (error) {
    console.error('Error occurred:', error);

    // Roll back the transaction only if it hasn't been committed
    if (!transaction.finished) {
      await transaction.rollback();
    }

    // Handle errors after commit separately
    if (transaction.finished && error.message.includes('email')) {
      console.error('Email sending failed, but the order was created successfully.');
      res.status(201).json({
        message: 'Order created successfully, but email sending failed.',
        order,
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Get order history
exports.getOrderHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
    });

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order by ID
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: OrderItem,
          include: [Product], // Include product details for each order item
        },
      ],
    });

    // If the order is not found, return a 404 error
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Return the order details
    res.json({ order });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order details.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction(); // Start a transaction
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate the status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid status.' });
    }

    // Find the order by ID
    const order = await Order.findOne({ where: { id: orderId }, transaction });

    // If the order is not found, return a 404 error
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Update the order status
    order.status = status;
    await order.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    // Return the updated order
    res.json({ message: 'Order status updated successfully.', order });
  } catch (err) {
    await transaction.rollback();
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
};

exports.deleteOrder = async (req, res) => {
  const transaction = await sequelize.transaction(); // Start a transaction
  try {
    const { orderId } = req.params;

    // Find the order by ID
    const order = await Order.findOne({ where: { id: orderId }, transaction });

    // If the order is not found, return a 404 error
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Soft delete the order
    await order.destroy({ transaction });

    // Commit the transaction
    await transaction.commit();

    // Return a success message
    res.json({ message: 'Order deleted successfully.' });
  } catch (err) {
    await transaction.rollback();
    console.error('Error deleting order:', err);
    res.status(500).json({ error: 'Failed to delete order.' });
  }
};