const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DesiredProduct = sequelize.define(
  'DesiredProduct',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    usuarioId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'usuario_id'
    },

    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'producto_id'
    },

    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: 'La cantidad debe ser mayor a 0'
        }
      }
    }
  },
  {
    tableName: 'productos_deseados',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = DesiredProduct;
