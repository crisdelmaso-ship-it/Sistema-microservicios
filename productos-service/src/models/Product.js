const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del producto es obligatorio'
        }
      }
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'El precio no puede ser negativo'
        }
      }
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'El stock no puede ser negativo'
        }
      }
    },

    categoria: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    imagenUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'products',
    timestamps: true
  }
);

module.exports = Product;