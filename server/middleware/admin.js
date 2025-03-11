const admin = (req, res, next) => {
  try {
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Ensure the user has the admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Admin middleware error:', error.message, error.stack); // Log the error for debugging
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

module.exports = admin;