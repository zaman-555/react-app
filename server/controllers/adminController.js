const User = require('../models/User');
const Product = require('../models/Product'); // Adjust the path as needed
const logger = require('../utils/logger');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, image, stock } = req.body;

    // Validation (add more as needed)
    if (!name || !description || !price) {
      return res.status(400).json({ error: 'Name, description, and price are required.' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image,
      stock,
    });

    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (error) {
    logger.error('Error creating product:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'An error occurred while creating the product.' });
  }
};

// Update an existing product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, stock } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await product.update({
      name,
      description,
      price,
      image,
      stock,
    });

    res.status(200).json({ message: 'Product updated successfully.', product });
  } catch (error) {
    logger.error('Error updating product:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'An error occurred while updating the product.' });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await product.destroy();
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({ error: 'An error occurred while deleting the product.' });
  }
};

// List all products
exports.listProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json({ message: 'Products listed successfully.', products });
  } catch (error) {
    logger.error('Error listing products:', error);
    res.status(500).json({ error: 'An error occurred while listing products.' });
  }
};


// User Management
  
// List all users with pagination
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default: page 1, limit 10
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['id', 'name', 'email', 'role', 'isVerified', 'createdAt', 'updatedAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      message: 'Users listed successfully.',
      users,
      totalUsers: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    logger.error('Error listing users:', error);
    res.status(500).json({ error: 'An error occurred while listing users.' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params; 
    logger.info(userId); 
    const user = await User.findByPk(userId);
 
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: 'An error occurred while deleting the user.' });
  }
};
 // Update a user's role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate the role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role provided.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await user.update({ role });
    res.status(200).json({
      message: 'User role updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Error updating user role:', error);
    res.status(500).json({ error: 'An error occurred while updating user role.' });
  }
};


// Update any user information
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from URL params
    const updates = req.body; // Get updates from request body

    // Validate updates
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided.' });
    }

    // Define allowed fields that can be updated
    const allowedFields = ['name', 'email', 'role', 'isVerified']; // Add other fields as needed
    const isValidUpdate = Object.keys(updates).every((field) => allowedFields.includes(field));

    if (!isValidUpdate) {
      return res.status(400).json({ error: 'Invalid fields provided for update.' });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update the user
    await user.update(updates);

    // Return success response
    res.status(200).json({
      message: 'User updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user.' });
  }
};
  // Order Management
  
  // List all orders
  const { Order, OrderItem } = require('../models/Order'); // Adjust the path as needed

// List all orders
exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{
        model: OrderItem,
        include: [{ model: require('../models/Product') }], // Include product details
      }],
    });
    res.status(200).json({ message: 'Orders listed successfully.', orders });
  } catch (error) {
    logger.error('Error listing orders:', error);
    res.status(500).json({ error: 'An error occurred while listing orders.' });
  }
};

// Update an order's status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the status
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status provided.' });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    await order.update({ status });
    res.status(200).json({ message: 'Order status updated successfully.', order });
  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({ error: 'An error occurred while updating order status.' });
  }
};