const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DesiredProductHistory = sequelize.define(
  'DesiredProductHistory',
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
      defaultValue: 1
    },

    accion: {
      type: DataTypes.ENUM(
        'AGREGADO',
        'ACTUALIZADO',
        'ELIMINADO'
      ),
      allowNull: false
    },

    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha'
    }
  },
  {
    tableName: 'productos_deseados_historial',
    timestamps: false
  }
);

module.exports = DesiredProductHistory;