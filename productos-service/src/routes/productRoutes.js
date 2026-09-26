const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
const productController = require('../controllers/productController');

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'No tienes permisos para administrar productos'
    });
  }

  next();
};

const requireAdminOrService = (req, res, next) => {
  const serviceToken = process.env.INTERNAL_SERVICE_TOKEN;
  if (serviceToken && req.headers['x-service-token'] === serviceToken) {
    return next();
  }

  authMiddleware(req, res, () => requireAdmin(req, res, next));
};

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Create product
router.post('/', authMiddleware, requireAdmin, productController.createProduct);

// Update product
router.put('/:id', authMiddleware, requireAdmin, productController.updateProduct);

// Delete product
router.delete('/:id', authMiddleware, requireAdmin, productController.deleteProduct);

// Update product stock
router.patch('/:id/stock', requireAdminOrService, productController.updateStock);

module.exports = router;