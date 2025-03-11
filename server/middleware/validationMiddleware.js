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
        .withMessage('Product name is required.'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number.'),
    body('category')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Category cannot be empty if provided.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];