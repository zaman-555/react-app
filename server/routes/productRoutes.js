const express = require('express');
const productController = require('../controllers/productController');
const { validateProductId, validateProductInput } = require('../middlewares/validationMiddleware');
const auth = require('../middlewares/auth'); // Import auth middleware
const admin = require('../middlewares/admin'); // Import admin middleware

const router = express.Router();

// Route for getting all products
router.get('/', productController.getProducts);
// Route for searching/filtering products
router.get('/search', productController.searchProducts);



// Route for creating a new product
router.post('/',auth, admin, validateProductInput, productController.createProduct);

// Protected routes (authentication required)
router.route('/:productId')
    .all(auth, validateProductId) // Middleware to validate productId
    .put(auth, validateProductInput, productController.updateProduct) // Update a product
    .delete(auth, productController.deleteProduct); // Delete a product

module.exports = router;