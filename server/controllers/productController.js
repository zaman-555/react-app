const { Op } = require('sequelize');
const  Product  = require('../models/Product');
const fs = require('fs'); // For handling file system operations
const { uploadFile } = require('../config/cloudinary'); // Import the uploadFile function
const multer = require('multer'); // For handling file uploads
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

// Get all products
// Get all products with optional pagination, filtering, and sorting
exports.getProducts = async (req, res) => {
    try {
        // Extract query parameters for pagination, filtering, and sorting
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'ASC', filter } = req.query;

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Define the base query options
        const queryOptions = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder]],
        };

        // Add filtering if provided
        if (filter) {
            queryOptions.where = filter;
        }

        // Fetch products from the database
        const { count, rows: products } = await Product.findAndCountAll(queryOptions);

        // Calculate total pages
        const totalPages = Math.ceil(count / limit);

        // Send response with pagination metadata
        res.json({
            success: true,
            data: products,
            pagination: {
                totalItems: count,
                totalPages,
                currentPage: parseInt(page),
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ 
            success: false,
            error: 'An error occurred while fetching products.',
            details: err.message 
        });
    }
};

// Create a new product


exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, image } = req.body;

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Only admins can create products.',
      });
    }

    // Validate required fields (make image optional)
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required except image.',
      });
    }

    // Create the product
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      image: image || null, // Use the provided image or set it to null
    });

    res.status(201).json({ 
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      success: false,
      error: 'An error occurred while creating the product.',
      details: error.message,
    });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
    const { productId } = req.params;
    const { name, description, price, stock, category } = req.body;
  
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }
  
      // If a new image is provided, upload it to Cloudinary
      let imageUrl = product.image; // Use the existing image URL by default
      if (req.file) {
        imageUrl = await uploadFile(req.file.path);
        // Delete the temporary file
        fs.unlinkSync(req.file.path);
      }
  
      // Update the product
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.stock = stock || product.stock;
      product.category = category || product.category;
      product.image = imageUrl; // Update the image URL
      await product.save();
  
      res.json({
        message: 'Product updated successfully.',
        product,
      });
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ error: 'An error occurred while updating the product.' });
    }
  };

// Delete a product
exports.deleteProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        await product.destroy();
        res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'An error occurred while deleting the product.' });
    }
};

// Search products by name, description, price, or category with pagination
exports.searchProducts = async (req, res) => {
    const { query, minPrice, maxPrice, category, page = 1, limit = 10 } = req.query;
  
    try {
      const searchCriteria = {};
  
      // Search by name or description
      if (query) {
        searchCriteria[Op.or] = [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
        ];
      }
  
      // Filter by price range
      if (minPrice || maxPrice) {
        searchCriteria.price = {};
        if (minPrice) searchCriteria.price[Op.gte] = parseFloat(minPrice);
        if (maxPrice) searchCriteria.price[Op.lte] = parseFloat(maxPrice);
      }
  
      // Filter by category
      if (category) {
        searchCriteria.category = category;
      }
  
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
  
      // Find products matching the search criteria
      const { count, rows: products } = await Product.findAndCountAll({
        where: searchCriteria,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
  
      // Calculate total pages
      const totalPages = Math.ceil(count / limit);
  
      res.json({ 
        success: true,
        message: 'Products found successfully.',
        data: products,
        pagination: {
          totalItems: count,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ 
        success: false,
        error: 'An error occurred while searching products.',
        details: error.message 
      });
    }
  };