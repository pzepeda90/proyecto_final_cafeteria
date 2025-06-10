const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const EstadoPedido = sequelize.define('EstadoPedido', {
  estado_pedido_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.STRING }
}, {
  tableName: 'estados_pedido',
  timestamps: false
});

module.exports = EstadoPedido; 