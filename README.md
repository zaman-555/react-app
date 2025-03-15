adminRoutes.js
Product Management (Admin only)
POST /products - Create a product
PUT /products/:productId - Update a product
DELETE /products/:productId - Delete a product
GET /products - List products

User Management (Admin only)
GET /users - List users
PUT /users/:userId/role - Update user role
DELETE /users/:userId - Delete a user


Order Management (Admin only)
GET /orders - List orders
PUT /orders/:orderId/status - Update order status

authRoutes.js
Public Routes
POST /register - Register a new user
GET /verify - Verify user email
POST /login - Login a user
POST /request-password-reset - Request password reset
POST /reset-password - Reset password

cartRoutes.js
Protected Routes (Authentication required)
GET / - Get the user's cart
POST /add - Add an item to the cart
DELETE /remove/:cartItemId - Remove an item from the cart

orderRoutes.js
Protected Routes (Authentication required)
POST / - Create an order
GET /history - Get order history
GET /:orderId - Get order details by ID


Admin Routes (Admin only)
PUT /:orderId/status - Update order status
DELETE /:orderId - Delete an order (soft delete)

paymentRoutes.js
Protected Route (Authentication required)
POST /process - Process a payment

productRoutes.js
Public Routes
GET / - Get all products
GET /search - Search/filter products

Admin Routes (Admin only)
POST / - Create a new product
Protected Routes (Authentication required)
PUT /:productId - Update a product
DELETE /:productId - Delete a product

userRoutes.js
Public Routes
POST /register - Register a new user
POST /login - Login a user

Protected Routes (Authentication required)
GET /profile - Get user profile
PUT /profile - Update user profile
PUT /profile/picture - Update profile picture