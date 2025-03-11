const User = require('../models/User');
const Product = require('../models/Product'); // Adjust the path as needed

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
    console.error('Error creating product:', error);
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
    console.error('Error updating product:', error);
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
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'An error occurred while deleting the product.' });
  }
};

// List all products
exports.listProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json({ message: 'Products listed successfully.', products });
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ error: 'An error occurred while listing products.' });
  }
};
  // User Management
  
  // List all users
exports.listUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'isVerified', 'createdAt', 'updatedAt'], // Select specific attributes
      });
      res.status(200).json({ message: 'Users listed successfully.', users });
    } catch (error) {
      console.error('Error listing users:', error);
      res.status(500).json({ error: 'An error occurred while listing users.' });
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
      res.status(200).json({ message: 'User role updated successfully.', user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'An error occurred while updating user role.' });
    }
  };
  
  // Delete a user
  exports.deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      await user.destroy();
      res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'An error occurred while deleting the user.' });
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
    console.error('Error listing orders:', error);
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
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'An error occurred while updating order status.' });
  }
};