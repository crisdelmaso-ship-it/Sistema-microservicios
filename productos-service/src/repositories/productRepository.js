const Product = require('../models/Product');

const productRepository = {

  async findAll() {
    return await Product.findAll();
  },

  async findById(id) {
    return await Product.findByPk(id);
  },

  async create(datosProducto) {
    return await Product.create(datosProducto);
  },

  async update(id, datosProducto) {
    const producto = await Product.findByPk(id);

    if (!producto) {
      return null;
    }

    await producto.update(datosProducto);

    return producto;
  },

  async delete(id) {
    const producto = await Product.findByPk(id);

    if (!producto) {
      return null;
    }

    await producto.destroy();

    return producto;
  },

  async updateStock(id, stock) {
    const producto = await Product.findByPk(id);

    if (!producto) {
      return null;
    }

    await producto.update({ stock });

    return producto;
  }

};

module.exports = productRepository;