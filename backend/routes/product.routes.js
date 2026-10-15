const express = require('express');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.post('/', productController.create);
router.get('/', productController.list);
router.get('/:id', productController.getOne);

module.exports = router;