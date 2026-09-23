/**
 * Restricts a route to specific roles.
 *
 * Usage: router.get("/admin-only", authenticate, authorize("ADMIN"), handler);
 *        router.get("/staff-area", authenticate, authorize("ADMIN", "STAFF"), handler);
 */
const authorize = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "You do not have permission to perform this action"
        });
    }
    next();
};

module.exports = authorize;
