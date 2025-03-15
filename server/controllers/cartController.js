const { Cart, CartItem } = require('../models/Cart');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Debugging: Log the request body and userId
    logger.info('Request Body:', req.body);
    logger.info('Product ID:', productId);
    logger.info('User ID:', userId);

    // Check if the productId is provided
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    // Check if the product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      logger.error(`Product with ID ${productId} not found.`);
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Find or create the user's cart
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // Check if the product is already in the cart
    let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });

    if (cartItem) {
      // Update quantity if the product is already in the cart
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Add new item to the cart
      cartItem = await CartItem.create({ cartId: cart.id, productId, quantity });
    }

    // Update the cart's total price
    cart.totalPrice += product.price * quantity;
    await cart.save();

    res.status(201).json({ message: 'Product added to cart.', cartItem });
  } catch (error) {
    logger.error('Error adding to cart:', error);
    res.status(500).json({ error: 'An error occurred while adding to cart.' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Find the user's cart
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }

    // Find the cart item
    const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart.' });
    }

    // Update the quantity
    const product = await Product.findByPk(productId);
    cart.totalPrice += product.price * (quantity - cartItem.quantity); // Update total price
    cartItem.quantity = quantity;
    await cartItem.save();
    await cart.save();

    res.status(200).json({ message: 'Cart item updated.', cartItem });
  } catch (error) {
    logger.error('Error updating cart item:', error);
    res.status(500).json({ error: 'An error occurred while updating the cart item.' });
  }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Find the user's cart
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }

    // Find and delete the cart item
    const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart.' });
    }

    // Update the cart's total price
    const product = await Product.findByPk(productId);
    cart.totalPrice -= product.price * cartItem.quantity;
    await cart.save();
    await cartItem.destroy();

    res.status(200).json({ message: 'Product removed from cart.' });
  } catch (error) {
    logger.error('Error removing from cart:', error);
    res.status(500).json({ error: 'An error occurred while removing from cart.' });
  }
};

// Get cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's cart
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [{ model: Product, attributes: ['id', 'name', 'price', 'image'] }],
        },
      ],
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }

    res.status(200).json({ cart });
  } catch (error) {
    logger.error('Error fetching cart:', error);
    res.status(500).json({ error: 'An error occurred while fetching the cart.' });
  }
};