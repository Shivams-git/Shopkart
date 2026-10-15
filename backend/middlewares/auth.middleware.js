const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

async function authMiddleware(req, res, next) {
    try {
        const authorization = req.headers.authorization || '';
        const bearerToken = authorization.startsWith('Bearer ')
            ? authorization.slice(7)
            : null;
        const token = bearerToken || (req.cookies && req.cookies.token);
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const customer = await Customer.findById(decoded.id).select('-password');
        if (!customer) return res.status(401).json({ success: false, message: 'Unauthorized' });

        req.user = customer;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
}

module.exports = authMiddleware;
