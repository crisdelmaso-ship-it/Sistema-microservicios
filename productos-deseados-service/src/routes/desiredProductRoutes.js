const express = require('express');

const desiredProductController = require('../controllers/desiredProductController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  desiredProductController.getUserDesiredProducts
);

router.post(
  '/',
  authMiddleware,
  desiredProductController.addProduct
);

router.put(
  '/:id',
  authMiddleware,
  desiredProductController.updateQuantity
);

router.delete(
  '/:id',
  authMiddleware,
  desiredProductController.deleteProduct
);

module.exports = router;