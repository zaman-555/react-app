const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error for debugging

    // Default error status and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong on the server.';

    // Send the error response
    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Only include stack trace in development
    });
};

module.exports = errorHandler;