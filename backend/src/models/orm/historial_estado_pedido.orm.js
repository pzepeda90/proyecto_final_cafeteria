const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Pedido = require('./pedido.orm');
const EstadoPedido = require('./estado_pedido.orm');

const HistorialEstadoPedido = sequelize.define('HistorialEstadoPedido', {
  historial_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pedido_id: { type: DataTypes.INTEGER, allowNull: false },
  estado_pedido_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha_cambio: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  comentario: { type: DataTypes.STRING }
}, {
  tableName: 'historial_estado_pedido',
  timestamps: false
});

HistorialEstadoPedido.belongsTo(Pedido, { foreignKey: 'pedido_id' });
HistorialEstadoPedido.belongsTo(EstadoPedido, { foreignKey: 'estado_pedido_id' });
Pedido.hasMany(HistorialEstadoPedido, { foreignKey: 'pedido_id' });
EstadoPedido.hasMany(HistorialEstadoPedido, { foreignKey: 'estado_pedido_id' });

module.exports = HistorialEstadoPedido; 