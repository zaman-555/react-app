const { body, param, validationResult } = require('express-validator');

// Validate productId parameter
exports.validateProductId = [
    param('productId')
        .isInt({ min: 1 }) // Ensure it's a positive integer
        .withMessage('Product ID must be a positive integer.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validate product input (for create/update)
exports.validateProductInput = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required.')
        .isLength({ max: 100 })
        .withMessage('Product name must be less than 100 characters.'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number.'),
    body('category')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Category cannot be empty if provided.')
        .isLength({ max: 50 })
        .withMessage('Category must be less than 50 characters.'),
    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validate order input (for createOrder)
exports.validateCreateOrder = [
    body('products')
        .isArray({ min: 1 })
        .withMessage('Products must be a non-empty array.'),
    body('products.*.productId')
        .isInt({ min: 1 })
        .withMessage('Product ID must be a positive integer.'),
    body('products.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validate order status update
exports.validateUpdateOrderStatus = [
    param('orderId')
        .isInt({ min: 1 })
        .withMessage('Order ID must be a positive integer.'),
    body('status')
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid status. Allowed values: pending, processing, shipped, delivered, cancelled.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validate user input (for create/update)
exports.validateUserInput = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.')
        .isLength({ max: 100 })
        .withMessage('Name must be less than 100 characters.'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required.')
        .isEmail()
        .withMessage('Invalid email address.'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required.')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];