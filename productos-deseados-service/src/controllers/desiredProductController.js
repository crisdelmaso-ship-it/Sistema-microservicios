const desiredProductService = require('../services/desiredProductService');

const addProduct = async (req, res) => {
  try {
    const usuarioId = req.user.userId;
    const { productoId, cantidad } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        mensaje: 'El usuario del token no es válido'
      });
    }

    if (!productoId) {
      return res.status(400).json({
        mensaje: 'El productoId es obligatorio'
      });
    }

    const desiredProduct = await desiredProductService.addProduct(
      usuarioId,
      productoId,
      cantidad === undefined ? 1 : cantidad
    );

    return res.status(201).json({
      mensaje: 'Producto agregado a la lista de deseos correctamente',
      productoDeseado: desiredProduct
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensaje:
        error.message ||
        'Error al agregar el producto a la lista de deseos'
    });
  }
};

const getUserDesiredProducts = async (req, res) => {
  try {
    const usuarioId = req.user.userId;

    if (!usuarioId) {
      return res.status(401).json({
        mensaje: 'El usuario del token no es válido'
      });
    }

    const products =
      await desiredProductService.getUserDesiredProducts(usuarioId);

    return res.status(200).json({
      mensaje: 'Lista de deseos consultada correctamente',
      productos: products
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensaje:
        error.message ||
        'Error al consultar la lista de deseos'
    });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const usuarioId = req.user.userId;
    const { id } = req.params;
    const { cantidad } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        mensaje: 'El usuario del token no es válido'
      });
    }

    if (cantidad === undefined) {
      return res.status(400).json({
        mensaje: 'La cantidad es obligatoria'
      });
    }

    const desiredProduct =
      await desiredProductService.updateQuantity(
        usuarioId,
        id,
        cantidad
      );

    return res.status(200).json({
      mensaje: 'Cantidad actualizada correctamente',
      productoDeseado: desiredProduct
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensaje:
        error.message ||
        'Error al actualizar la cantidad'
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const usuarioId = req.user.userId;
    const { id } = req.params;

    if (!usuarioId) {
      return res.status(401).json({
        mensaje: 'El usuario del token no es válido'
      });
    }

    await desiredProductService.deleteProduct(usuarioId, id);

    return res.status(200).json({
      mensaje: 'Producto eliminado de la lista de deseos correctamente'
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      mensaje:
        error.message ||
        'Error al eliminar el producto de la lista de deseos'
    });
  }
};

module.exports = {
  addProduct,
  getUserDesiredProducts,
  updateQuantity,
  deleteProduct
};

