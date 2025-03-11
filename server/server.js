const express = require('express');
const sequelize = require('./config/db');
const dotenv = require('dotenv');
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Import middleware
const auth = require('./middleware/auth');
const admin = require('./middleware/admin');
const errorHandler = require('./middleware/error');

const app = express();
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate unique filenames
  },
});

const upload = multer({ storage });



// Sync models with the database
sequelize
  .sync({force: false }) // Use `force: true` only in development
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

  sequelize.query("SHOW TABLES", { type: sequelize.QueryTypes.SHOWTABLES })
    .then((tables) => {
        console.log('Tables in the database:', tables);
    })
    .catch((err) => {
        console.error('Error fetching tables:', err);
    });


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', auth, cartRoutes); // Protect cart routes with auth middleware
app.use('/api/orders', auth, orderRoutes); // Protect order routes with auth middleware
app.use('/api/admin', auth, admin, adminRoutes); // Protect admin routes with auth and admin middleware
app.use('/api/users', userRoutes); // Protect user routes with auth middleware
app.use('/api/payment', auth, paymentRoutes); // Protect payment routes with auth middleware



// Error handling middleware (must be the last middleware)
app.use(errorHandler);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});