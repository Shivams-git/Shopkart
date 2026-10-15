const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Customer = require('../models/customer.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

const VALID_PHONE = /^\d{10}$/;
const VALID_PINCODE = /^\d{6}$/;

function normalizeString(value) {
    return String(value ?? '').trim();
}

function validateShippingAddress(shippingAddress) {
    if (!shippingAddress || typeof shippingAddress !== 'object') {
        throw new Error('Shipping details are required.');
    }

    const fullName = normalizeString(shippingAddress.fullName);
    const phone = normalizeString(shippingAddress.phone);
    const addressLine1 = normalizeString(shippingAddress.addressLine1);
    const city = normalizeString(shippingAddress.city);
    const state = normalizeString(shippingAddress.state);
    const pincode = normalizeString(shippingAddress.pincode);

    if (!fullName) throw new Error('Full name is required.');
    if (!phone || !VALID_PHONE.test(phone.replace(/\s+/g, ''))) {
        throw new Error('Phone number must contain 10 digits.');
    }
    if (!addressLine1) throw new Error('Address is required.');
    if (!city) throw new Error('City is required.');
    if (!state) throw new Error('State is required.');
    if (!pincode || !VALID_PINCODE.test(pincode)) {
        throw new Error('Pincode must contain 6 digits.');
    }

    return {
        fullName,
        phone,
        addressLine1,
        city,
        state,
        pincode,
    };
}

function createMockRazorpayOrderId(orderId) {
    return `mock_order_${String(orderId)}`;
}

async function ensureRazorpayConfig() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const hasRealKeys = Boolean(keyId && keySecret && !keyId.includes('your_') && !keyId.includes('placeholder'));

    if (!hasRealKeys) {
        return { mockMode: true, keyId: keyId || 'mock_key', keySecret: keySecret || 'mock_secret' };
    }

    return { mockMode: false, keyId, keySecret, client: new Razorpay({ key_id: keyId, key_secret: keySecret }) };
}

exports.createPaymentOrder = async (req, res, next) => {
    try {
        const shippingAddress = validateShippingAddress(req.body.shippingAddress);
        const customer = await Customer.findById(req.user._id).populate({
            path: 'cart.product',
            select: 'name description price category image stock',
        });

        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty.' });
        }

        let items = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            if (!cartItem.product) {
                return res.status(400).json({ success: false, message: 'One or more cart items are no longer available.' });
            }

            if (cartItem.quantity > cartItem.product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${cartItem.product.name}.`,
                });
            }

            const itemTotal = cartItem.product.price * cartItem.quantity;
            totalAmount += itemTotal;
            items.push({
                product: cartItem.product._id,
                name: cartItem.product.name,
                price: cartItem.product.price,
                quantity: cartItem.quantity,
                image: cartItem.product.image,
            });
        }

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress,
            totalAmount,
            paymentStatus: 'PENDING',
            status: 'PENDING_PAYMENT',
        });

        const config = await ensureRazorpayConfig();
        if (config.mockMode) {
            order.razorpayOrderId = createMockRazorpayOrderId(order._id);
            await order.save();
            return res.json({
                success: true,
                shopKartOrderId: order._id,
                razorpayOrderId: order.razorpayOrderId,
                amount: Math.round(totalAmount * 100),
                currency: 'INR',
                key: config.keyId,
                mockMode: true,
            });
        }

        const razorpayOrder = await config.client.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: String(order._id),
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: config.keyId,
            mockMode: false,
        });
    } catch (err) {
        next(err);
    }
};

exports.verifyPayment = async (req, res, next) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!mongoose.isValidObjectId(shopKartOrderId)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID.' });
        }

        const order = await Order.findById(shopKartOrderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        if (!order.user.equals(req.user._id)) {
            return res.status(403).json({ success: false, message: 'You cannot access this order.' });
        }

        const config = await ensureRazorpayConfig();
        if (config.mockMode) {
            order.paymentStatus = 'PAID';
            order.status = 'PLACED';
            order.razorpayPaymentId = razorpay_payment_id || `mock_payment_${order._id}`;
            order.razorpayOrderId = razorpay_order_id || order.razorpayOrderId;
            await order.save();

            const customer = await Customer.findById(req.user._id);
            customer.cart = [];
            await customer.save();

            return res.json({
                success: true,
                message: 'Payment verified successfully.',
                order,
            });
        }

        const generatedSignature = crypto
            .createHmac('sha256', config.keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            order.paymentStatus = 'FAILED';
            order.status = 'PENDING_PAYMENT';
            await order.save();
            return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
        }

        order.paymentStatus = 'PAID';
        order.status = 'PLACED';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpayOrderId = razorpay_order_id || order.razorpayOrderId;
        await order.save();

        const customer = await Customer.findById(req.user._id);
        customer.cart = [];
        await customer.save();

        return res.json({ success: true, message: 'Payment verified successfully.', order });
    } catch (err) {
        next(err);
    }
};

exports.list = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID.' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        if (!order.user.equals(req.user._id)) {
            return res.status(403).json({ success: false, message: 'You cannot view this order.' });
        }

        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

exports.cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID.' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        if (!order.user.equals(req.user._id)) {
            return res.status(403).json({ success: false, message: 'You cannot cancel this order.' });
        }
        if (order.status === 'CANCELLED') {
            return res.status(400).json({ success: false, message: 'This order has already been cancelled.' });
        }
        if (order.status === 'DELIVERED' || order.status === 'SHIPPED') {
            return res.status(400).json({ success: false, message: 'This order cannot be cancelled after dispatch.' });
        }

        const trimmedReason = normalizeString(reason);
        if (!trimmedReason) {
            return res.status(400).json({ success: false, message: 'Please provide a reason to cancel the order.' });
        }

        order.status = 'CANCELLED';
        order.paymentStatus = order.paymentStatus === 'PAID' ? 'PAID' : 'FAILED';
        order.cancellationReason = trimmedReason;
        order.cancelledAt = new Date();
        await order.save();

        res.json({ success: true, message: 'Order cancelled successfully.', order });
    } catch (err) {
        next(err);
    }
};
