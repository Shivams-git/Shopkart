const express = require('express');
const auth = require('../middlewares/auth.middleware');
const wishlistController = require('../controllers/wishlist.controller');

const router = express.Router();

router.use(auth);
router.post('/:productId', wishlistController.add);
router.get('/', wishlistController.list);
router.delete('/:productId', wishlistController.remove);

module.exports = router;