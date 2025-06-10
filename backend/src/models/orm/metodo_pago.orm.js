const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const MetodoPago = sequelize.define('MetodoPago', {
  metodo_pago_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.STRING },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'metodos_pago',
  timestamps: false
});

module.exports = MetodoPago; 