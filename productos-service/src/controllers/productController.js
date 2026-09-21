const productService = require('../services/productService');

const productController = {

  async getAllProducts(req, res) {
    try {
      const productos = await productService.getAllProducts();

      res.status(200).json(productos);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  },

  async getProductById(req, res) {
    try {
      const producto = await productService.getProductById(req.params.id);

      res.status(200).json(producto);
    } catch (error) {
      res.status(404).json({
        message: error.message
      });
    }
  },

  async createProduct(req, res) {
    try {
      const producto = await productService.createProduct(req.body);

      res.status(201).json(producto);
    } catch (error) {
      res.status(400).json({
        message: error.message
      });
    }
  },

  async updateProduct(req, res) {
    try {
      const producto = await productService.updateProduct(
        req.params.id,
        req.body
      );

      res.status(200).json(producto);
    } catch (error) {
      res.status(400).json({
        message: error.message
      });
    }
  },

  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id);

      res.status(204).send();
    } catch (error) {
      res.status(404).json({
        message: error.message
      });
    }
  },

  async updateStock(req, res) {
    try {
      const { stock } = req.body;

      const producto = await productService.updateStock(
        req.params.id,
        stock
      );

      res.status(200).json(producto);
    } catch (error) {
      res.status(400).json({
        message: error.message
      });
    }
  }

};

module.exports = productController;