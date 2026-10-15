const mongoose = require('mongoose');
const Product = require('../models/product.model');

exports.create = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        next(err);
    }
};

exports.list = async (req, res, next) => {
    try {
        const filter = {};
        const { search, category, sort } = req.query;

        if (search) filter.name = { $regex: search, $options: 'i' };
        if (category) filter.category = category;

        const sortBy = sort === 'price_asc'
            ? { price: 1 }
            : sort === 'price_desc'
                ? { price: -1 }
                : { createdAt: -1 };

        const products = await Product.find(filter).sort(sortBy).select('-__v');
        res.json({ success: true, count: products.length, products });
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        const product = await Product.findById(req.params.id).select('-__v');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, product });
    } catch (err) {
        next(err);
    }
};