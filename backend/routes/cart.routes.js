const express = require('express');
const auth = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.use(auth);
router.get('/', cartController.list);
router.post('/:productId', cartController.add);
router.patch('/:productId', cartController.update);
router.delete('/:productId', cartController.remove);

module.exports = router;