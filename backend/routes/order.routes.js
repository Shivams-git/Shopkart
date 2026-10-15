const express = require('express');
const auth = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');

const router = express.Router();

router.use(auth);
router.post('/create-payment-order', orderController.createPaymentOrder);
router.post('/verify-payment', orderController.verifyPayment);
router.get('/', orderController.list);
router.post('/:id/cancel', orderController.cancelOrder);
router.get('/:id', orderController.getOne);

module.exports = router;
