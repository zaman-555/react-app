const { Order, OrderItem } = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const sequelize = require('../config/db');

exports.createOrder = async (userId, products) => {
    const transaction = await sequelize.transaction();
    try {
      console.log('Starting order creation process...');
      console.log('User ID:', userId);
      console.log('Products:', products);
  
      // Calculate totalAmount
      let totalAmount = 0;
      for (const item of products) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }
        totalAmount += product.price * item.quantity;
      }
  
      console.log('Total Amount Calculated:', totalAmount);
  
      // Create the order
      const order = await Order.create(
        {
          userId,
          totalAmount,
          status: 'pending',
        },
        { transaction }
      );
  
      console.log('Order Created:', order);
  
      // Add order items
      for (const item of products) {
        const product = await Product.findByPk(item.productId, { transaction });
        console.log('Adding Order Item:', item);
  
        await OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          },
          { transaction }
        );
  
        console.log('Order Item Added:', item);
  
        // Reduce product stock
        product.stock -= item.quantity;
        await product.save({ transaction });
        console.log('Product Stock Updated:', product);
      }
  
      // Commit the transaction
      await transaction.commit();
      console.log('Transaction Committed.');
  
      return order;
    } catch (err) {
      // Rollback the transaction on error
      await transaction.rollback();
      console.error('Error creating order:', err.message, err.stack);
      throw err;
    }
  };


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
    const { orderId } = req.params;
    const { status } = req.body;
  
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }
  
      // Validate the status
      const validStatuses = ['pending', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status.' });
      }
  
      // Update the order status
      order.status = status;
      await order.save();
  
      res.json({ message: 'Order status updated successfully.', order });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };



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