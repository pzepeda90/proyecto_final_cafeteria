const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Pedido = require('./pedido.orm');
const Producto = require('./producto.orm');

const DetallePedido = sequelize.define('DetallePedido', {
  detalle_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pedido_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precio_unitario: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false }
}, {
  tableName: 'detalles_pedido',
  timestamps: false
});

DetallePedido.belongsTo(Pedido, { foreignKey: 'pedido_id' });
DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id' });
Pedido.hasMany(DetallePedido, { foreignKey: 'pedido_id' });
Producto.hasMany(DetallePedido, { foreignKey: 'producto_id' });

module.exports = DetallePedido; 