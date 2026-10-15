const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

const SALT_ROUNDS = 10;

exports.register = async (req, res, next) => {
    try {
        const { fullName, email, password, phone } = req.body;
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const existing = await Customer.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        const customer = await Customer.create({ fullName, email, password: hashed, phone });

        res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const customer = await Customer.findOne({ email });
        if (!customer) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, customer.password);
        if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = generateToken({ id: customer._id });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({ success: true, message: 'Login successful' });
    } catch (err) {
        next(err);
    }
};

exports.me = (req, res) => {
    res.json(req.user);
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
};

exports.changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords are required' });
        if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

        const customer = await Customer.findById(req.user._id);
        if (!customer) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const match = await bcrypt.compare(oldPassword, customer.password);
        if (!match) return res.status(401).json({ success: false, message: 'Old password is incorrect' });

        customer.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await customer.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        next(err);
    }
};
