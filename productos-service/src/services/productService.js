const productRepository = require('../repositories/productRepository');

const productService = {

  async getAllProducts() {
    return await productRepository.findAll();
  },

  async getProductById(id) {
    const producto = await productRepository.findById(id);

    if (!producto) {
      throw new Error('El producto no fue encontrado');
    }

    return producto;
  },

  async createProduct(datosProducto) {
    if (!datosProducto.nombre) {
      throw new Error('El nombre del producto es obligatorio');
    }

    if (datosProducto.precio === undefined || datosProducto.precio < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    if (datosProducto.stock !== undefined && datosProducto.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }

    return await productRepository.create(datosProducto);
  },

  async updateProduct(id, datosProducto) {
    await this.getProductById(id);

    if (datosProducto.precio !== undefined && datosProducto.precio < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    if (datosProducto.stock !== undefined && datosProducto.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }

    return await productRepository.update(id, datosProducto);
  },

  async deleteProduct(id) {
    await this.getProductById(id);

    return await productRepository.delete(id);
  },

  async updateStock(id, stock) {
    await this.getProductById(id);

    if (stock === undefined || stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }

    return await productRepository.updateStock(id, stock);
  }

};

module.exports = productService;