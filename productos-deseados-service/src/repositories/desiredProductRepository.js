const DesiredProduct = require('../models/DesiredProduct');

const findAllByUser = async (usuarioId) => {
  return await DesiredProduct.findAll({
    where: { usuarioId }
  });
};

const findByUserAndProduct = async (usuarioId, productoId) => {
  return await DesiredProduct.findOne({
    where: {
      usuarioId,
      productoId
    }
  });
};

const findById = async (id) => {
  return await DesiredProduct.findByPk(id);
};

const create = async (data) => {
  return await DesiredProduct.create(data);
};

const update = async (desiredProduct, data) => {
  return await desiredProduct.update(data);
};

const remove = async (desiredProduct) => {
  return await desiredProduct.destroy();
};

module.exports = {
  findAllByUser,
  findByUserAndProduct,
  findById,
  create,
  update,
  remove
};