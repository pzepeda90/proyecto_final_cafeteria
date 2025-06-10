const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Carrito = require('./carrito.orm');
const Producto = require('./producto.orm');

const DetalleCarrito = sequelize.define('DetalleCarrito', {
  detalle_carrito_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  carrito_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'detalles_carrito',
  timestamps: false
});

DetalleCarrito.belongsTo(Carrito, { foreignKey: 'carrito_id' });
DetalleCarrito.belongsTo(Producto, { foreignKey: 'producto_id' });
Carrito.hasMany(DetalleCarrito, { foreignKey: 'carrito_id' });
Producto.hasMany(DetalleCarrito, { foreignKey: 'producto_id' });

module.exports = DetalleCarrito; 