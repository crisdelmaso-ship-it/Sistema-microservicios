const axios = require('axios');

const desiredProductRepository = require('../repositories/desiredProductRepository');
const DesiredProductHistory = require('../models/DesiredProductHistory');

const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL;

const getProduct = async (productoId) => {
  try {
    const response = await axios.get(
      `${PRODUCTS_SERVICE_URL}/api/products/${productoId}`
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      const customError = new Error('El producto no existe');
      customError.status = 404;
      throw customError;
    }

    const customError = new Error(
      'No fue posible consultar el producto'
    );
    customError.status = 503;
    throw customError;
  }
};

const addProduct = async (usuarioId, productoId, cantidad = 1) => {
  const product = await getProduct(productoId);

  if (!product.activo) {
    const error = new Error('El producto no está disponible');
    error.status = 400;
    throw error;
  }

  if (cantidad <= 0) {
    const error = new Error('La cantidad debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  const existingProduct =
    await desiredProductRepository.findByUserAndProduct(
      usuarioId,
      productoId
    );

  if (existingProduct) {
    const nuevaCantidad = existingProduct.cantidad + cantidad;

    await desiredProductRepository.update(existingProduct, {
      cantidad: nuevaCantidad
    });

    await DesiredProductHistory.create({
      usuarioId,
      productoId,
      cantidad: nuevaCantidad,
      accion: 'ACTUALIZADO'
    });

    return existingProduct;
  }

  const desiredProduct = await desiredProductRepository.create({
    usuarioId,
    productoId,
    cantidad
  });

  await DesiredProductHistory.create({
    usuarioId,
    productoId,
    cantidad,
    accion: 'AGREGADO'
  });

  return desiredProduct;
};

const getUserDesiredProducts = async (usuarioId) => {
  const desiredProducts =
    await desiredProductRepository.findAllByUser(usuarioId);

  const products = await Promise.all(
    desiredProducts.map(async (desiredProduct) => {
      try {
        const product = await getProduct(desiredProduct.productoId);

        return {
          id: desiredProduct.id,
          usuarioId: desiredProduct.usuarioId,
          productoId: desiredProduct.productoId,
          cantidad: desiredProduct.cantidad,
          fechaAgregado: desiredProduct.createdAt,
          producto: product,
          disponible: product.stock > 0,
          mensaje:
            product.stock > 0
              ? 'Producto disponible'
              : 'El producto está agotado'
        };
      } catch (error) {
        return {
          id: desiredProduct.id,
          usuarioId: desiredProduct.usuarioId,
          productoId: desiredProduct.productoId,
          cantidad: desiredProduct.cantidad,
          fechaAgregado: desiredProduct.createdAt,
          producto: null,
          disponible: false,
          mensaje: 'No fue posible consultar el producto'
        };
      }
    })
  );

  return products;
};

const updateQuantity = async (usuarioId, id, cantidad) => {
  if (cantidad <= 0) {
    const error = new Error('La cantidad debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  const desiredProduct =
    await desiredProductRepository.findById(id);

  if (!desiredProduct || desiredProduct.usuarioId.toString() !== usuarioId.toString()) {
    const error = new Error(
      'El producto deseado no existe para este usuario'
    );
    error.status = 404;
    throw error;
  }

  await desiredProductRepository.update(desiredProduct, {
    cantidad
  });

  await DesiredProductHistory.create({
    usuarioId,
    productoId: desiredProduct.productoId,
    cantidad,
    accion: 'ACTUALIZADO'
  });

  return desiredProduct;
};

const deleteProduct = async (usuarioId, id) => {
  const desiredProduct =
    await desiredProductRepository.findById(id);

  if (!desiredProduct || desiredProduct.usuarioId.toString() !== usuarioId.toString()) {
    const error = new Error(
      'El producto deseado no existe para este usuario'
    );
    error.status = 404;
    throw error;
  }

  await DesiredProductHistory.create({
    usuarioId,
    productoId: desiredProduct.productoId,
    cantidad: desiredProduct.cantidad,
    accion: 'ELIMINADO'
  });

  await desiredProductRepository.remove(desiredProduct);

  return true;
};

module.exports = {
  addProduct,
  getUserDesiredProducts,
  updateQuantity,
  deleteProduct
};