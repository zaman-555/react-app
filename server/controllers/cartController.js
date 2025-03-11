const { Cart, CartItem } = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find the user's cart with associated cart items and products
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          include: [Product], // Include the Product model to get product details
        },
      ],
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }

    // Calculate the total price of the cart
    let totalPrice = 0;
    const cartItems = cart.CartItems.map((item) => {
      const itemTotal = item.quantity * item.Product.price;
      totalPrice += itemTotal;

      return {
        name: item.Product.name,
        description: item.Product.description,
        price: item.Product.price,
        image: item.Product.image,
        quantity: item.quantity,
        itemTotal: itemTotal, // Total price for this specific item
      };
    });

    // Construct the final response
    const response = {
      userId: cart.userId,
      totalPrice: totalPrice,
      items: cartItems,
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  const { products } = req.body; // Expect an array of products

  console.log('Request Body:', req.body); // Log the request body

  // Validate the request body
  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ error: 'products array is required.' });
  }

  try {
    // Find or create the user's cart
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      console.log(`Creating new cart for user ${userId}`);
      cart = await Cart.create({ userId });
    }

    let totalPrice = 0;

    // Process each product in the array
    for (const item of products) {
      const { productId, quantity } = item;

      // Validate each product in the array
      if (!productId || !quantity) {
        return res.status(400).json({ error: 'Each product must have a productId and quantity.' });
      }

      console.log(`Adding product ${productId} to cart for user ${userId}`);

      // Find the product
      const product = await Product.findByPk(productId);
      if (!product) {
        console.error(`Product with ID ${productId} not found.`);
        return res.status(404).json({ error: `Product with ID ${productId} not found.` });
      }

      console.log(`Found product: ${product.name}`);

      // Check if there is enough stock
      if (product.stock < quantity) {
        console.error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${quantity}`);
        return res.status(400).json({ error: `Insufficient stock for product ${product.name}.` });
      }

      // Reduce the product stock
      product.stock -= quantity;
      await product.save();
      console.log(`Reduced stock for product ${product.name}. New stock: ${product.stock}`);

      // Check if the product is already in the cart
      let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
      if (cartItem) {
        // Update the quantity if the product is already in the cart
        cartItem.quantity += quantity;
        await cartItem.save();
        console.log(`Updated quantity for product ${product.name} in cart. New quantity: ${cartItem.quantity}`);
      } else {
        // Add the item to the cart
        await CartItem.create({ cartId: cart.id, productId, quantity });
        console.log(`Added product ${product.name} to cart.`);
      }

      // Add to the total price
      totalPrice += product.price * quantity;
    }

    // Update the cart's total price
    cart.totalPrice = totalPrice;
    await cart.save();

    res.json({ message: 'Items added to cart.', totalPrice });
  } catch (err) {
    console.error(`Error adding products to cart: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const { cartItemId } = req.params;
  const userId = req.user.id;

  try {
    const cartItem = await CartItem.findByPk(cartItemId, { include: Cart });
    if (!cartItem || cartItem.Cart.userId !== userId) {
      return res.status(404).json({ error: 'Cart item not found or unauthorized.' });
    }

    const cart = await Cart.findByPk(cartItem.cartId);

    // Find the product
    const product = await Product.findByPk(cartItem.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Increase the product stock
    product.stock += cartItem.quantity;
    await product.save();

    // Remove the item from the cart
    await cartItem.destroy();

    // Recalculate the total price of the cart
    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [Product],
    });

    let totalPrice = 0;
    cartItems.forEach((item) => {
      totalPrice += item.quantity * item.Product.price;
    });

    // Update the cart's total price
    cart.totalPrice = totalPrice;
    await cart.save();

    res.json({ message: 'Item removed from cart.', totalPrice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};