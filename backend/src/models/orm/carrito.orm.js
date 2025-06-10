const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Usuario = require('./usuario.orm');

const Carrito = sequelize.define('Carrito', {
  carrito_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'carritos',
  timestamps: false
});

Carrito.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasOne(Carrito, { foreignKey: 'usuario_id' });

module.exports = Carrito; 