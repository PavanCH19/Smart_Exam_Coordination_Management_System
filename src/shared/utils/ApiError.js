/**
 * Simple custom error class so the service layer can throw errors
 * with an HTTP status code attached, and the central error middleware
 * can read that status code instead of guessing.
 */
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ApiError;
