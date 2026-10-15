const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

exports.add = async (req, res, next) => {
    try {
        const { productId } = req.params;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const customer = await Customer.findById(req.user._id);
        if (customer.wishlist.some((id) => id.toString() === productId)) {
            return res.status(409).json({ success: false, message: 'Product already in wishlist' });
        }

        customer.wishlist.push(product._id);
        await customer.save();
        res.status(201).json({ success: true, message: 'Product added to wishlist' });
    } catch (err) {
        next(err);
    }
};

exports.list = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: 'wishlist',
            select: 'name description price category image stock createdAt'
        });

        const wishlist = customer.wishlist.filter(Boolean);
        res.json({ success: true, count: wishlist.length, wishlist });
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const { productId } = req.params;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        const customer = await Customer.findById(req.user._id);
        const originalLength = customer.wishlist.length;
        customer.wishlist = customer.wishlist.filter((id) => id.toString() !== productId);

        if (customer.wishlist.length === originalLength) {
            return res.status(404).json({ success: false, message: 'Product is not in wishlist' });
        }

        await customer.save();
        res.json({ success: true, message: 'Product removed from wishlist' });
    } catch (err) {
        next(err);
    }
};