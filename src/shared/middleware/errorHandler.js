/**
 * Centralized error handler. ApiError instances carry their own status
 * code; anything else falls back to 500. Never leaks stack traces,
 * secrets, or internal details in the response body.
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : "Something went wrong";

    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
