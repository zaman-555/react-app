const express = require('express');
const sequelize = require('./config/db');
const logger = require('./utils/logger');
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const session = require('express-session');
const passport = require('./config/passport');
const cors = require('cors');
require('dotenv').config();




const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');


// Import middleware
const auth = require('./middlewares/auth');
const admin = require('./middlewares/admin');
const { errorHandler } = require('./middlewares/errorHandler');






const app = express();

app.use(session({
  secret: process.env.SECRET_SESSION, // Replace with a strong secret
  resave: false,
  saveUninitialized: false
})); 

app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from the frontend
  credentials: true, // Allow cookies and credentials
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

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
    logger.info('Database synced successfully.');
  })
  .catch((err) => {
    logger.error('Error syncing database:', err);
  });

  sequelize.query("SHOW TABLES", { type: sequelize.QueryTypes.SHOWTABLES })
    .then((tables) => {
      logger.info('Tables in the database:', tables);
    })
    .catch((err) => {
      logger.error('Error fetching tables:', err);
    });


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', auth, cartRoutes); // Protect cart routes with auth middleware
//app.use('/api/orders', auth, orderRoutes); // Protect order routes with auth middleware
app.use('/api/admin', auth, admin, adminRoutes); // Protect admin routes with auth and admin middleware
app.use('/api/users', userRoutes); // Protect user routes with auth middleware
//app.use('/api/payment',  paymentRoutes); // Protect payment routes with auth middleware

app.use('/api/orders',  orderRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware (must be the last middleware)
app.use(errorHandler);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});