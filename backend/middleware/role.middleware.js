const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};

const adminOnly = authorizeRole(['admin']);
const customerOrAdmin = authorizeRole(['customer', 'admin']);

module.exports = { authorizeRole, adminOnly, customerOrAdmin };