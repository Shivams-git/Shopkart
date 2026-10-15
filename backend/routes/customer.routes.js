const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/register', customerController.register);
router.post('/login', customerController.login);
router.get('/me', auth, customerController.me);
router.post('/logout', auth, customerController.logout);
router.patch('/change-password', auth, customerController.changePassword);

module.exports = router;
