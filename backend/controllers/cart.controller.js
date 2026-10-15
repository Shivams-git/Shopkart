const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

async function populatedCart(customerId) {
    const customer = await Customer.findById(customerId).populate({
        path: 'cart.product',
        select: 'name description price category image stock createdAt'
    });

    return customer.cart.filter((item) => item.product);
}

exports.list = async (req, res, next) => {
    try {
        const cart = await populatedCart(req.user._id);
        res.json({ success: true, cart });
    } catch (err) {
        next(err);
    }
};

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
        const cartItem = customer.cart.find((item) => item.product.toString() === productId);
        const nextQuantity = cartItem ? cartItem.quantity + 1 : 1;

        if (nextQuantity > product.stock) {
            return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
        }

        if (cartItem) cartItem.quantity = nextQuantity;
        else customer.cart.push({ product: product._id, quantity: 1 });

        await customer.save();
        res.json({ success: true, message: 'Cart updated', cart: await populatedCart(customer._id) });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }
        if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be a number of at least 1' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        if (quantity > product.stock) {
            return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
        }

        const customer = await Customer.findById(req.user._id);
        const cartItem = customer.cart.find((item) => item.product.toString() === productId);
        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Product is not in cart' });
        }

        cartItem.quantity = quantity;
        await customer.save();
        res.json({ success: true, message: 'Cart updated', cart: await populatedCart(customer._id) });
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
        const initialLength = customer.cart.length;
        customer.cart = customer.cart.filter((item) => item.product.toString() !== productId);
        if (customer.cart.length === initialLength) {
            return res.status(404).json({ success: false, message: 'Product is not in cart' });
        }

        await customer.save();
        res.json({ success: true, message: 'Product removed from cart', cart: await populatedCart(customer._id) });
    } catch (err) {
        next(err);
    }
};